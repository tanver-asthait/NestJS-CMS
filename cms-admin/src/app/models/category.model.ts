export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  isActive: boolean;
  postCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
}