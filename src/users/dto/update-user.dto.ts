import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean, IsDate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDate()
  @IsOptional()
  lastLoginAt?: Date;
}