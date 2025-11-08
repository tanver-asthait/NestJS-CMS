import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
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

  async findByName(name: string): Promise<CategoryDocument | null> {
    return this.categoryModel
      .findOne({ name: { $regex: new RegExp('^' + name + '$', 'i') } })
      .exec();
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

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category> {
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return updatedCategory;
  }

  async remove(id: string): Promise<void> {
    // Check if category has posts before deleting
    const category = await this.findOne(id);
    if (category.postCount && category.postCount > 0) {
      throw new Error('Cannot delete category that contains posts');
    }

    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}
