export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string;
  authorSlug: string;
  description: string;
  coverImage: string;
  isbn?: string | null;
  publisher?: string | null;
  publishDate?: string | null;
  language: string;
  pages?: number | null;
  fileSize?: string | null;
  format: string;
  rating: number;
  ratingCount: number;
  downloadCount: number;
  isFeatured: boolean;
  isNewRelease: boolean;
  isBestseller: boolean;
  categories: string;
  tags?: string | null;
  fileUrl?: string | null;
  sampleUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: string;
}

export interface Subscription {
  id: string;
  plan: string;
  status: string;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd: boolean;
}

export interface ReadingProgress {
  id: string;
  bookId: string;
  progress: number;
  currentPage: number;
  totalPages: number;
  lastReadAt: Date;
  book?: Book;
}

export interface Review {
  id: string;
  userId: string;
  bookId: string;
  rating: number;
  comment?: string | null;
  createdAt: Date;
  user?: User;
}

export interface ReadingList {
  id: string;
  bookId: string;
  listType: string;
  createdAt: Date;
  book?: Book;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link?: string | null;
  createdAt: Date;
}

export interface ReadStats {
  totalBooksRead: number;
  totalPagesRead: number;
  totalMinutesRead: number;
  currentStreak: number;
  longestStreak: number;
  weeklyGoal: number;
}

export type SubscriptionPlan = 'monthly' | 'annual' | 'lifetime';

export interface PlanFeatures {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  lifetimePrice: number;
  features: string[];
}
