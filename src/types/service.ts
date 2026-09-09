export type ServicePackage = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  time: string;
  features: string[];
  details?: string[];
  image?: string;
  tag?: string;
  rating?: string;
  category?: string;
};

export type ServiceBenefit = {
  icon: string;
  title: string;
  description: string;
};

export type ServiceStep = {
  step: number;
  title: string;
  description: string;
};

export type ServiceFaq = {
  question: string;
  answer: string;
};

/** Narrow, read-only view of a category for public service consumers. */
export type ServiceCategoryRef = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  isPopular: boolean;
};

export type Service = {
  id: string;
  slug: string;
  category: ServiceCategoryRef | null;
  badge: string;
  badgeColor: string;
  /** Admin-entered display string, e.g. "4.9 (12,480 reviews)". Fallback only. */
  rating: string;
  /** Live aggregate from customer reviews — takes over once ratingCount > 0. */
  ratingAvg: number | null;
  ratingCount: number;
  image: string;
  videoUrl?: string;
  time: string;
  warranty: string;
  title: string;
  description: string;
  packages: ServicePackage[];
  benefits?: ServiceBenefit[];
  howItWorks?: ServiceStep[];
  faqs?: ServiceFaq[];
  isPopular: boolean;
};
