import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type PostDocument = Post & Document;

export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
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
  content: string;

  @Prop({ 
    type: String, 
    enum: Object.values(PostStatus), 
    default: PostStatus.DRAFT 
  })
  status: PostStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author: Types.ObjectId | User;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  featuredImage?: string;

  @Prop()
  metaTitle?: string;

  @Prop()
  metaDescription?: string;

  @Prop({ default: 0 })
  viewCount: number;

  @Prop()
  publishedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);