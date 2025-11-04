import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Placement, PlacementDocument } from './placement.schema';
import { CreatePlacementDto, UpdatePlacementDto } from './dto/placement.dto';

@Injectable()
export class PlacementsService {
  constructor(
    @InjectModel(Placement.name) private placementModel: Model<PlacementDocument>,
  ) {}

  async create(createPlacementDto: CreatePlacementDto): Promise<Placement> {
    const createdPlacement = new this.placementModel(createPlacementDto);
    return createdPlacement.save();
  }

  async findAll(): Promise<Placement[]> {
    return this.placementModel
      .find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findAllWithInactive(): Promise<Placement[]> {
    return this.placementModel
      .find()
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Placement> {
    const placement = await this.placementModel.findById(id).exec();
    if (!placement) {
      throw new NotFoundException(`Placement with ID ${id} not found`);
    }
    return placement;
  }

  async findBySlug(slug: string): Promise<Placement> {
    const placement = await this.placementModel.findOne({ slug }).exec();
    if (!placement) {
      throw new NotFoundException(`Placement with slug ${slug} not found`);
    }
    return placement;
  }

  async findBySubCategory(subCategory: string): Promise<Placement[]> {
    return this.placementModel
      .find({ subCategory, isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .exec();
  }

  async update(id: string, updatePlacementDto: UpdatePlacementDto): Promise<Placement> {
    const updatedPlacement = await this.placementModel
      .findByIdAndUpdate(id, updatePlacementDto, { new: true })
      .exec();
    
    if (!updatedPlacement) {
      throw new NotFoundException(`Placement with ID ${id} not found`);
    }
    
    return updatedPlacement;
  }

  async remove(id: string): Promise<void> {
    const result = await this.placementModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Placement with ID ${id} not found`);
    }
  }

  async incrementPostCount(id: string): Promise<void> {
    await this.placementModel
      .findByIdAndUpdate(id, { $inc: { postCount: 1 } })
      .exec();
  }

  async decrementPostCount(id: string): Promise<void> {
    await this.placementModel
      .findByIdAndUpdate(id, { $inc: { postCount: -1 } })
      .exec();
  }
}