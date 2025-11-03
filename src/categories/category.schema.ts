import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

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
  color: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  postCount: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);