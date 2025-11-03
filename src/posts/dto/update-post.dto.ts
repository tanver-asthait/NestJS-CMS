import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsNumber, IsDate } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsNumber()
  @IsOptional()
  viewCount?: number;

  @IsDate()
  @IsOptional()
  publishedAt?: Date;
}