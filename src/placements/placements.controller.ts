import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query 
} from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { CreatePlacementDto, UpdatePlacementDto } from './dto/placement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('placements')
export class PlacementsController {
  constructor(private readonly placementsService: PlacementsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createPlacementDto: CreatePlacementDto) {
    console.log('Creating placement with data:', createPlacementDto);
    return this.placementsService.create(createPlacementDto);
  }

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    if (includeInactive === 'true') {
      return this.placementsService.findAllWithInactive();
    }
    return this.placementsService.findAll();
  }

  @Get('subcategory/:subCategory')
  findBySubCategory(@Param('subCategory') subCategory: string) {
    return this.placementsService.findBySubCategory(subCategory);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.placementsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placementsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updatePlacementDto: UpdatePlacementDto) {
    return this.placementsService.update(id, updatePlacementDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.placementsService.remove(id);
  }
}