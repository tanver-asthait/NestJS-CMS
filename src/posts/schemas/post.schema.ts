import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { Category } from '../../categories/category.schema';
import { Placement } from '../../placements/placement.schema';

export type PostDocument = Post & Document;

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  EXPIRED = 'expired'
}

@Schema({
  timestamps: true,
})
export class Post {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  excerpt?: string;

  @Prop({ required: true })
  content?: string;

  @Prop({ 
    type: String, 
    enum: Object.values(PostStatus), 
    default: PostStatus.DRAFT 
  })
  status: PostStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId | User;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Types.ObjectId | Category;

  @Prop({ type: Types.ObjectId, ref: 'Placement', required: true })
  placement: Types.ObjectId | Placement;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  image?: string;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop()
  publishedAt?: Date;

  @Prop()
  expiredAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);