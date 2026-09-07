export type Category = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
};

/**
 * Trimmed service shape for the homepage category modal. Deliberately not the
 * full `Service` — that component is a client component, so everything here is
 * serialized into the initial HTML, and full services would drag along every
 * description, benefits/faqs array and package feature list with them.
 */
export type CategoryServiceSummary = {
  id: string;
  slug: string;
  title: string;
  image: string;
  rating: string;
  badge: string;
  time: string;
  packageCount: number;
  fromPrice: number | null;
  isPopular: boolean;
};

export type CategoryWithServices = Category & {
  services: CategoryServiceSummary[];
};
