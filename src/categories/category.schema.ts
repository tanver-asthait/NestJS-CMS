import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

// Use HydratedDocument for proper TypeScript typing with _id
export type CategoryDocument = HydratedDocument<Category>;

export enum SubCategory {
  TOPNAV = 'topnav',
  RIGHTSIDEBAR = 'rightsidebar',
  LEFTSIDEBAR = 'leftsidebar',
  BOTTOM = 'bottom',
}

@Schema({
  timestamps: true,
})
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop()
  description?: string;

  @Prop({ default: '#000000' })
  color?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  postCount?: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);