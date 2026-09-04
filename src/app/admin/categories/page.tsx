import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "@/components/admin/categories/CategoriesManager";

export default async function AdminCategoriesPage() {
  // _count, not include: { services: true } — the latter would ship the whole
  // catalog into a client component just to render a number.
  const categories = await prisma.category.findMany({
    include: { _count: { select: { services: true } } },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return <CategoriesManager categories={categories} />;
}
