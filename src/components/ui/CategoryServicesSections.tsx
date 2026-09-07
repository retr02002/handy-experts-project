import React from "react";
import { getCategoriesWithServices } from "@/lib/services-data";
import { CategoryServicesSectionClient } from "./CategoryServicesSectionClient";

export async function CategoryServicesSections() {
  const categories = await getCategoriesWithServices();

  // We want to show "standard" categories here (maybe exclude those already in PopularServices if they only exist there, 
  // but usually we just show the first few categories that actually have services).
  // The user requested: "half of the categories section to be on the home page"
  
  // 1. Filter out categories with no services
  const populatedCategories = categories.filter((c) => c.services.length > 0);
  
  // 2. We can exclude popular ones if we want them strictly separated, or just show them anyway.
  // The user said: "for the popular services only show popular services categories and cards there not all of them 
  // and have the common one as a serperate section like you planned"
  // So let's exclude the popular ones from THIS section, to keep them distinct.
  const commonCategories = populatedCategories.filter((c) => !c.isPopular);

  // 3. Take half of the common ones, or a minimum of e.g. 4 if there are many.
  const numToShow = Math.max(1, Math.ceil(commonCategories.length / 2));
  const categoriesToShow = commonCategories.slice(0, numToShow);

  if (categoriesToShow.length === 0) {
    return null;
  }

  return (
    <div className="w-full flex flex-col">
      {categoriesToShow.map((category) => (
        <CategoryServicesSectionClient key={category.id} category={category} />
      ))}
    </div>
  );
}
