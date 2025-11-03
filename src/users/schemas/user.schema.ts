import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  ADMIN = 'admin',
  EDITOR = 'editor',
  AUTHOR = 'author',
  VIEWER = 'viewer',
}

@Schema({
  timestamps: true, // This will add createdAt and updatedAt fields
})
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ 
    type: String, 
    enum: Object.values(UserRole), 
    default: UserRole.VIEWER 
  })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  avatar?: string;

  @Prop()
  bio?: string;

  @Prop()
  lastLoginAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);