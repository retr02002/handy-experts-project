import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type Db = typeof prisma | Prisma.TransactionClient;

export interface SkillAssignment {
  categoryId: string;
  serviceIds: string[];
}

/**
 * For a batch of `ServicePackage` ids, resolves each to its `Service` and
 * `Category`. One query for however many distinct packages a caller has —
 * used by both the vendor-level category gate and the technician-level
 * service gate, resolving from the same underlying job-item list instead of
 * each doing its own deep include.
 */
export async function getPackageServiceCategoryMap(
  packageIds: string[]
): Promise<Map<string, { serviceId: string; categoryId: string | null }>> {
  const ids = [...new Set(packageIds)];
  if (ids.length === 0) return new Map();

  const rows = await prisma.servicePackage.findMany({
    where: { id: { in: ids } },
    select: { id: true, serviceId: true, service: { select: { categoryId: true } } },
  });
  return new Map(rows.map((r) => [r.id, { serviceId: r.serviceId, categoryId: r.service.categoryId }]));
}

/**
 * A technician's full offered-service-set: every service under each assigned
 * `TechnicianCategory` (broad), unioned with every individually-assigned
 * `TechnicianService` (narrow) — the two are independent, a `TechnicianService`
 * row never requires its parent category to also be assigned. One batched
 * query pair regardless of how many technician ids are passed — the caller
 * that needs to filter a whole candidate list (findEligibleTechnicians,
 * getReassignCandidatesAction) must never turn this into an N+1.
 */
export async function getTechnicianOfferedServiceIds(
  technicianIds: string[]
): Promise<Map<string, Set<string>>> {
  const ids = [...new Set(technicianIds)];
  const result = new Map<string, Set<string>>(ids.map((id) => [id, new Set<string>()]));
  if (ids.length === 0) return result;

  const [categoryRows, serviceRows] = await Promise.all([
    prisma.technicianCategory.findMany({
      where: { technicianId: { in: ids } },
      select: { technicianId: true, category: { select: { services: { select: { id: true } } } } },
    }),
    prisma.technicianService.findMany({
      where: { technicianId: { in: ids } },
      select: { technicianId: true, serviceId: true },
    }),
  ]);

  for (const row of categoryRows) {
    const set = result.get(row.technicianId);
    if (set) for (const s of row.category.services) set.add(s.id);
  }
  for (const row of serviceRows) {
    result.get(row.technicianId)?.add(row.serviceId);
  }
  return result;
}

/**
 * Replaces a technician's entire skill assignment — both the whole-category
 * rows and the individually-assigned services — with the given set. Used by
 * technician creation, editing, and self-onboarding alike, so the three
 * write paths can never drift out of sync with each other. `db` accepts
 * either the top-level client or a transaction client, since every caller
 * writes this alongside the technician's other fields in one transaction.
 */
export async function applySkillAssignments(
  db: Db,
  technicianId: string,
  skillAssignments: SkillAssignment[]
): Promise<void> {
  await db.technicianCategory.deleteMany({ where: { technicianId } });
  await db.technicianService.deleteMany({ where: { technicianId } });

  const wholeCategoryIds = skillAssignments.filter((a) => a.serviceIds.length === 0).map((a) => a.categoryId);
  const narrowServiceIds = [...new Set(skillAssignments.flatMap((a) => a.serviceIds))];

  if (wholeCategoryIds.length > 0) {
    await db.technicianCategory.createMany({
      data: wholeCategoryIds.map((categoryId) => ({ technicianId, categoryId })),
      skipDuplicates: true,
    });
  }
  if (narrowServiceIds.length > 0) {
    await db.technicianService.createMany({
      data: narrowServiceIds.map((serviceId) => ({ technicianId, serviceId })),
      skipDuplicates: true,
    });
  }
}

/**
 * A single human-readable label for the legacy `TechnicianProfile.skillCategory`
 * column, which stays NOT NULL in the DB purely as a display fallback. Forms
 * no longer collect this directly — it's derived from the first category the
 * vendor/technician actually picked, so the column is never blank.
 */
export async function deriveLegacySkillLabel(db: Db, skillAssignments: SkillAssignment[]): Promise<string> {
  const firstCategoryId = skillAssignments[0]?.categoryId;
  if (!firstCategoryId) return "General";
  const category = await db.category.findUnique({ where: { id: firstCategoryId }, select: { name: true } });
  return category?.name ?? "General";
}

/** The distinct services one live call's items actually cover. */
export async function getLiveCallServiceIds(liveCallId: string): Promise<string[]> {
  const items = await prisma.liveCallItem.findMany({
    where: { liveCallId },
    select: { package: { select: { serviceId: true } } },
  });
  return [...new Set(items.map((i) => i.package?.serviceId).filter((id): id is string => !!id))];
}

/**
 * Whether `serviceIds` (the services a job actually covers) overlap this
 * technician's offered set at all — "any" overlap, same philosophy as the
 * vendor-category gate: a mixed-service job only needs one matching line to
 * be eligible.
 *
 * An empty `serviceIds` (a job whose items didn't resolve to any identifiable
 * service — a data gap, not a real signal) fails OPEN rather than blocking
 * every technician from a job nobody can even categorize. An empty *offered*
 * set (a technician with no categories/services assigned at all) fails
 * CLOSED — that's the entire point of this system, and is exactly why the
 * Phase 1 backfill/rollout step matters before this gate goes live.
 */
export async function technicianOffersAnyService(technicianId: string, serviceIds: string[]): Promise<boolean> {
  if (serviceIds.length === 0) return true;
  const map = await getTechnicianOfferedServiceIds([technicianId]);
  const offered = map.get(technicianId) ?? new Set<string>();
  return serviceIds.some((id) => offered.has(id));
}
