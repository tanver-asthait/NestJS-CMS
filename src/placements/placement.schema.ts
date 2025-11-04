import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlacementDocument = Placement & Document;

export enum SubCategory {
  TOPNAV = 'topnav',
  RIGHTSIDEBAR = 'rightsidebar',
  LEFTSIDEBAR = 'leftsidebar',
  BOTTOM = 'bottom',
  FEATURED = 'featured',
  SIDEBAR = 'sidebar',
  HEADER = 'header',
  FOOTER = 'footer',
}

@Schema({
  timestamps: true,
})
export class Placement {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ 
    type: String, 
    enum: SubCategory, 
    required: true 
  })
  subCategory: SubCategory;

  @Prop()
  description?: string;

  @Prop({ default: '#3498db' })
  color?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  postCount?: number;

  @Prop({ default: 0 })
  sortOrder?: number;
}

export const PlacementSchema = SchemaFactory.createForClass(Placement);