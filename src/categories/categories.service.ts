import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private categoryModel: Model<CategoryDocument>) {}

  async create(createCategoryDto: any): Promise<Category> {
    const createdCategory = new this.categoryModel(createCategoryDto);
    return createdCategory.save();
  }

  async findAll(): Promise<Category[]> {
    return this.categoryModel.find().exec();
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async incrementPostCount(id: string): Promise<void> {
    await this.categoryModel
      .findByIdAndUpdate(id, { $inc: { postCount: 1 } })
      .exec();
  }

  async decrementPostCount(id: string): Promise<void> {
    await this.categoryModel
      .findByIdAndUpdate(id, { $inc: { postCount: -1 } })
      .exec();
  }
}