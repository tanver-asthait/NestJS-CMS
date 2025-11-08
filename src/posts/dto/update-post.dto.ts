import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsNumber, IsDateString, Min } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsNumber()
  @IsOptional()
  viewCount?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  orderNo?: number;

  @IsDateString()
  @IsOptional()
  publishedAt?: Date;

  @IsDateString()
  @IsOptional()
  expiredAt?: Date;
}
