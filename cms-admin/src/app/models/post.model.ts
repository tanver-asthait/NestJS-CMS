export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: PostStatus;
  author: string | User;
  category: string | Category;
  placement: string | Placement;
  tags?: string[];
  image?: string;
  viewCount: number;
  publishedAt: Date;
  expiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  EXPIRED = 'expired'
}

export interface CreatePostDto {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  status?: PostStatus;
  category: string;
  placement: string;
  tags?: string[];
  image?: string;
  publishedAt?: Date;
  expiredAt: Date;
}

export interface UpdatePostDto {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  status?: PostStatus;
  category?: string;
  placement?: string;
  tags?: string[];
  image?: string;
  publishedAt?: Date;
  expiredAt?: Date;
}

// Import User interface
import { User } from './user.model';
import { Category } from './category.model';
import { Placement } from './placement.model';