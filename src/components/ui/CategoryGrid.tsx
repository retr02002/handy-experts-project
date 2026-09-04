import { getCategoriesWithServices } from "@/lib/services-data";
import { CategoryGridClient } from "@/components/ui/CategoryGridClient";

export async function CategoryGrid() {
  const categories = await getCategoriesWithServices();
  // A tile that opens an empty modal is worse than no tile.
  const populated = categories.filter((c) => c.services.length > 0);

  // Return null rather than an empty bordered band on a fresh install.
  if (populated.length === 0) return null;

  return (
    <section className="w-full bg-white dark:bg-[#020813] pt-4 pb-12 sm:pt-6 sm:pb-16 px-4 sm:px-8 lg:px-16 border-t border-slate-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto">
        <CategoryGridClient categories={populated} />
      </div>
    </section>
  );
}
