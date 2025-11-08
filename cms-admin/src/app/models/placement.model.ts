export enum SubCategory {
  TOPNAV = 'topnav',
  RIGHTSIDEBAR = 'rightsidebar',
  LEFTSIDEBAR = 'leftsidebar',
  BOTTOM = 'bottom',
  FEATURED = 'featured',
  SIDEBAR = 'sidebar',
  HEADER = 'header',
  FOOTER = 'footer',
}

export interface Placement {
  _id: string;
  name: string;
  slug: string;
  subCategory: SubCategory | string;
  description?: string;
  color?: string;
  isActive?: boolean;
  postCount?: number;
  sortOrder?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePlacementDto {
  name: string;
  slug: string;
  subCategory: SubCategory | string;
  description?: string;
  color?: string;
  isActive?: boolean;
  sortOrder?: number;
}

export interface UpdatePlacementDto extends Partial<CreatePlacementDto> {}
