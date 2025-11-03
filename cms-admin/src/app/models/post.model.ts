export interface Post {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: PostStatus;
  author: string | User;
  tags?: string[];
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

export interface CreatePostDto {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status?: PostStatus;
  author: string;
  tags?: string[];
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdatePostDto {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  status?: PostStatus;
  tags?: string[];
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
}

// Import User interface
import { User } from './user.model';