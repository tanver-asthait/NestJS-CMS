import { Injectable, OnModuleInit } from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { SubCategory } from './placement.schema';

@Injectable()
export class PlacementSeeder implements OnModuleInit {
  constructor(private readonly placementsService: PlacementsService) {}

  async onModuleInit() {
    await this.seedPlacements();
  }

  private async seedPlacements() {
    try {
      const existingPlacements = await this.placementsService.findAll();
      
      if (existingPlacements.length === 0) {
        const defaultPlacements = [
          {
            name: 'Top Navigation',
            slug: 'top-navigation',
            subCategory: SubCategory.TOPNAV,
            description: 'Posts displayed in the top navigation area',
            color: '#3498db',
            sortOrder: 1,
          },
          {
            name: 'Right Sidebar',
            slug: 'right-sidebar',
            subCategory: SubCategory.RIGHTSIDEBAR,
            description: 'Posts displayed in the right sidebar',
            color: '#2ecc71',
            sortOrder: 2,
          },
          {
            name: 'Left Sidebar',
            slug: 'left-sidebar',
            subCategory: SubCategory.LEFTSIDEBAR,
            description: 'Posts displayed in the left sidebar',
            color: '#f39c12',
            sortOrder: 3,
          },
          {
            name: 'Bottom Section',
            slug: 'bottom-section',
            subCategory: SubCategory.BOTTOM,
            description: 'Posts displayed in the bottom section',
            color: '#e74c3c',
            sortOrder: 4,
          },
          {
            name: 'Featured Content',
            slug: 'featured-content',
            subCategory: SubCategory.FEATURED,
            description: 'Featured posts for special highlighting',
            color: '#9b59b6',
            sortOrder: 5,
          },
          {
            name: 'Header Banner',
            slug: 'header-banner',
            subCategory: SubCategory.HEADER,
            description: 'Posts displayed in header banner area',
            color: '#1abc9c',
            sortOrder: 6,
          },
          {
            name: 'Footer Area',
            slug: 'footer-area',
            subCategory: SubCategory.FOOTER,
            description: 'Posts displayed in footer area',
            color: '#34495e',
            sortOrder: 7,
          },
        ];

        for (const placement of defaultPlacements) {
          await this.placementsService.create(placement);
          console.log(`Created placement: ${placement.name}`);
        }

        console.log('Default placements seeded successfully!');
      }
    } catch (error) {
      console.error('Error seeding placements:', error);
    }
  }
}