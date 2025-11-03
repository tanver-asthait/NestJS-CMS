import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsUrl, IsMongoId } from 'class-validator';
import { PostStatus } from '../schemas/post.schema';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  slug: string;

  @IsString()
  @IsOptional()
  excerpt?: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsMongoId()
  @IsNotEmpty()
  author: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsUrl()
  @IsOptional()
  featuredImage?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;
}