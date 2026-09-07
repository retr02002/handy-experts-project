import type { Category } from "@prisma/client";
import type { CategoryInput } from "@/lib/validations/category.schema";

export { slugify } from "@/components/admin/services/utils";

export type CategoryWithCount = Category & { _count: { services: number } };

export function categoryToFormInput(category: Category): CategoryInput {
  return {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    icon: category.icon ?? "",
    image: category.image ?? "",
    isActive: category.isActive,
    isPopular: category.isPopular,
    sortOrder: category.sortOrder,
  };
}

export function emptyCategoryInput(): CategoryInput {
  return {
    name: "",
    slug: "",
    description: "",
    icon: "",
    image: "",
    isActive: true,
    isPopular: false,
    sortOrder: 0,
  };
}
