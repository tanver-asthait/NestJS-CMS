import { IsString, IsNotEmpty, IsOptional, IsEnum, IsArray, IsUrl, IsMongoId, IsDateString } from 'class-validator';
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
  @IsOptional()
  content?: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: PostStatus;

  @IsMongoId()
  @IsNotEmpty()
  category: string;

  @IsMongoId()
  @IsNotEmpty()
  placement: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsUrl()
  @IsOptional()
  image?: string;

  @IsDateString()
  @IsOptional()
  publishedAt?: Date;

  @IsDateString()
  @IsNotEmpty()
  expiredAt: Date;
}