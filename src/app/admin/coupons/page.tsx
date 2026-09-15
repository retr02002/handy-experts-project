import { prisma } from "@/lib/prisma";
import { getAllCouponsForAdminAction } from "@/actions/coupon.actions";
import { CouponsManager } from "@/components/admin/coupons/CouponsManager";

export default async function AdminCouponsPage() {
  const [couponsRes, categories] = await Promise.all([
    getAllCouponsForAdminAction(),
    prisma.category.findMany({
      select: {
        id: true,
        name: true,
        services: {
          select: {
            id: true,
            title: true,
            packages: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <CouponsManager
      initialCoupons={couponsRes.success ? couponsRes.data ?? [] : []}
      categories={categories}
    />
  );
}
