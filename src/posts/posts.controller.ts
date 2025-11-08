import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsService, PostQueryParams } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PostStatus } from './schemas/post.schema';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPostDto: CreatePostDto, @CurrentUser() user: any) {
    console.log('JWT User object:', JSON.stringify(user, null, 2)); // Debug log
    
    const authorId = user?.userId || user?.sub || user?.id || user?._id;
    console.log('Extracted authorId:', authorId); // Debug log
    
    if (!authorId) {
      throw new Error('Could not extract user ID from JWT token. User object: ' + JSON.stringify(user));
    }
    
    return this.postsService.create(createPostDto, authorId);
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PostStatus,
    @Query('author') author?: string,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
    @Query('published') published?: string,
  ) {
    if (published === 'true') {
      return this.postsService.findPublished();
    }

    const queryParams: PostQueryParams = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      author,
      search,
      tags: tags ? tags.split(',') : undefined,
    };

    return this.postsService.findAll(queryParams);
  }

  @Get('author/:authorId')
  findByAuthor(
    @Param('authorId') authorId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PostStatus,
    @Query('search') search?: string,
    @Query('tags') tags?: string,
  ) {
    const queryParams: PostQueryParams = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      search,
      tags: tags ? tags.split(',') : undefined,
    };

    return this.postsService.findByAuthor(authorId, queryParams);
  }

  @Get('tag/:tag')
  findByTag(
    @Param('tag') tag: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: PostStatus,
    @Query('author') author?: string,
    @Query('search') search?: string,
  ) {
    const queryParams: PostQueryParams = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
      author,
      search,
    };

    return this.postsService.findByTag(tag, queryParams);
  }

  @Get('filter')
  findByFilters(
    @Query('categoryName') categoryName?: string,
    @Query('placementName') placementName?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const queryParams: PostQueryParams = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    return this.postsService.findByFilters(categoryName, placementName, queryParams);
  }

  @Get('test-published')
  findPublishedNotExpired(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const queryParams: PostQueryParams = {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    return this.postsService.findByFilters(undefined, undefined, queryParams);
  }

  @Get('debug/categories')
  async getDebugCategories() {
    return this.postsService.getDebugCategories();
  }

  @Get('debug/placements')
  async getDebugPlacements() {
    return this.postsService.getDebugPlacements();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto, @CurrentUser() user: any) {
    return this.postsService.update(id, updatePostDto, user.userId);
  }

  @Patch(':id/view')
  @HttpCode(HttpStatus.OK)
  incrementViewCount(@Param('id') id: string) {
    return this.postsService.incrementViewCount(id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}