import { z } from "zod";

export const HOLD_REASONS = [
  "Spare part unavailable",
  "Customer unavailable",
  "Site not ready",
  "Additional approval needed",
  "Other",
] as const;

export const serviceReportSchema = z
  .object({
    completionStatus: z.enum(["COMPLETED", "ON_HOLD", "REVISIT_REQUIRED"]),
    holdReason: z.string().trim().max(200).optional(),
    // ISO string; only meaningful when the job isn't finished.
    newVisitAt: z.string().datetime().nullable().optional(),
    remarks: z.string().trim().min(3, "Please add a short note about the work done").max(2000),
  })
  .refine((v) => v.completionStatus === "COMPLETED" || !!v.holdReason, {
    message: "Pick a reason when the job isn't finished",
    path: ["holdReason"],
  })
  .refine((v) => v.completionStatus === "COMPLETED" || !!v.newVisitAt, {
    message: "Pick a date and time for the next visit",
    path: ["newVisitAt"],
  });

export type ServiceReportInput = z.infer<typeof serviceReportSchema>;
