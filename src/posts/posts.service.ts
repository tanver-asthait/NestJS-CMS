import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument, PostStatus } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CategoriesService } from '../categories/categories.service';
import { PlacementsService } from '../placements/placements.service';

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PostQueryParams {
  page?: number;
  limit?: number;
  status?: PostStatus;
  author?: string;
  search?: string;
  tags?: string[];
}

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private categoriesService: CategoriesService,
    private placementsService: PlacementsService,
  ) {}

  async create(createPostDto: CreatePostDto, authorId: string): Promise<Post> {
    console.log('Creating post with authorId:', authorId); // Debug log
    console.log('CreatePostDto:', createPostDto); // Debug log
    
    if (!authorId) {
      throw new ConflictException('Author ID is required');
    }

    // Check if slug already exists
    const existingPost = await this.postModel.findOne({ slug: createPostDto.slug });
    if (existingPost) {
      throw new ConflictException('Post with this slug already exists');
    }

    const createdPost = new this.postModel({
      ...createPostDto,
      author: authorId,
    });
    
    console.log('Post object before save:', createdPost); // Debug log
    
    // Set publishedAt if status is published
    if (createPostDto.status === PostStatus.PUBLISHED) {
      createdPost.publishedAt = new Date();
    }

    const savedPost = await createdPost.save();

    // Increment post counts for category and placement
    await Promise.all([
      this.categoriesService.incrementPostCount(createPostDto.category),
      this.placementsService.incrementPostCount(createPostDto.placement),
    ]);

    return savedPost;
  }

  async findAll(queryParams: PostQueryParams = {}): Promise<PostsResponse> {
    const {
      page = 1,
      limit = 10,
      status,
      author,
      search,
      tags,
    } = queryParams;

    // Build filter object
    const filter: any = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (author) {
      filter.author = author;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .populate('author', 'firstName lastName email')
        .populate('category', 'name slug color')
        .populate('placement', 'name slug subCategory color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      posts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findPublished(): Promise<Post[]> {
    return this.postModel
      .find({ status: PostStatus.PUBLISHED })
      .populate('author', 'firstName lastName email')
      .populate('category', 'name slug color')
      .populate('placement', 'name slug subCategory color')
      .sort({ publishedAt: -1 })
      .exec();
  }

  async findByFilters(categoryName?: string, placementName?: string, queryParams: PostQueryParams = {}): Promise<PostsResponse> {
    const {
      page = 1,
      limit = 10,
    } = queryParams;

    // Build filter object for published and not expired posts
    const filter: any = {
      status: PostStatus.PUBLISHED,
      $or: [
        { expiredAt: { $exists: false } },
        { expiredAt: null },
        { expiredAt: { $gt: new Date() } }
      ]
    };

    // If category name is provided, find category by name and filter by it
    if (categoryName) {
      const category = await this.categoriesService.findByName(categoryName);
      console.log('Found category for filtering:', category); // Debug log
      if (category) {
        filter.category = (category as any)._id.toString();
        console.log('Category ID added to filter:', filter.category); // Debug log
      } else {
        console.log('Category not found with name:', categoryName); // Debug log
        // If category not found, return empty result
        return {
          posts: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
    }

    // If placement name is provided, find placement by name and filter by it
    if (placementName) {
      const placement = await this.placementsService.findByName(placementName);
      console.log('Found placement for filtering:', placement); // Debug log
      if (placement) {
        filter.placement = (placement as any)._id.toString();
        console.log('Placement ID added to filter:', filter.placement); // Debug log
      } else {
        console.log('Placement not found with name:', placementName); // Debug log
        // If placement not found, return empty result
        return {
          posts: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }
    }

    const skip = (page - 1) * limit;
    console.log('Filter for findByFilters:', JSON.stringify(filter)); // Debug log
    
    // Let's also debug by checking all published posts without category/placement filter
    const basicFilter = {
      status: PostStatus.PUBLISHED,
      $or: [
        { expiredAt: { $exists: false } },
        { expiredAt: null },
        { expiredAt: { $gt: new Date() } }
      ]
    };
    
    const allPublishedPosts = await this.postModel.find(basicFilter).exec();
    console.log('All published non-expired posts:', allPublishedPosts.length);
    console.log('First few posts categories/placements:', 
      allPublishedPosts.slice(0, 3).map(p => ({ 
        id: p._id, 
        category: p.category, 
        placement: p.placement,
        categoryType: typeof p.category,
        placementType: typeof p.placement
      }))
    );

    // Test the exact filter step by step
    console.log('Testing filter step by step...');
    const statusOnlyFilter = { status: PostStatus.PUBLISHED };
    const statusOnlyCount = await this.postModel.countDocuments(statusOnlyFilter);
    console.log('Posts with status published:', statusOnlyCount);

    const withExpiryFilter = {
      status: PostStatus.PUBLISHED,
      $or: [
        { expiredAt: { $exists: false } },
        { expiredAt: null },
        { expiredAt: { $gt: new Date() } }
      ]
    };
    const withExpiryCount = await this.postModel.countDocuments(withExpiryFilter);
    console.log('Posts with status published and not expired:', withExpiryCount);

    if (categoryName && filter.category) {
      const withCategoryFilter = { ...withExpiryFilter, category: filter.category };
      const withCategoryCount = await this.postModel.countDocuments(withCategoryFilter);
      console.log('Posts with category filter added:', withCategoryCount);
    }

    if (placementName && filter.placement) {
      const fullFilter = { ...filter };
      const fullFilterCount = await this.postModel.countDocuments(fullFilter);
      console.log('Posts with full filter:', fullFilterCount);
    }
    
    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .populate('author', 'firstName lastName email')
        .populate('category', 'name slug color')
        .populate('placement', 'name slug subCategory color')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    console.log('Posts found:', posts.length); // Debug log
    console.log('Total count:', total); // Debug log

    const totalPages = Math.ceil(total / limit);

    return {
      posts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getDebugCategories() {
    const categories = await this.categoriesService.findAll();
    return categories.map(cat => ({ id: (cat as any)._id, name: cat.name }));
  }

  async getDebugPlacements() {
    const placements = await this.placementsService.findAll();
    return placements.map(place => ({ id: (place as any)._id, name: place.name }));
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel
      .findById(id)
      .populate('author', 'firstName lastName email')
      .populate('category', 'name slug color')
      .populate('placement', 'name slug subCategory color')
      .exec();
    
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
  }

  async findBySlug(slug: string): Promise<Post> {
    const post = await this.postModel
      .findOne({ slug })
      .populate('author', 'firstName lastName email')
      .populate('category', 'name slug color')
      .populate('placement', 'name slug subCategory color')
      .exec();
    
    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto, currentUserId?: string): Promise<Post> {
    // Get the existing post first to compare category/placement changes
    const existingPost = await this.postModel.findById(id).exec();
    if (!existingPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Optional: Check if user can edit this post (owner or admin)
    // if (currentUserId && existingPost.author.toString() !== currentUserId) {
    //   throw new ForbiddenException('You can only edit your own posts');
    // }

    // If status is being changed to published and publishedAt is not set
    if (updatePostDto.status === PostStatus.PUBLISHED && !updatePostDto.publishedAt) {
      updatePostDto.publishedAt = new Date();
    }

    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .populate('author', 'firstName lastName email')
      .populate('category', 'name slug color')
      .populate('placement', 'name slug subCategory color')
      .exec();

    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Handle category/placement count updates if they changed
    const promises: Promise<void>[] = [];
    
    if (updatePostDto.category && updatePostDto.category !== existingPost.category.toString()) {
      promises.push(
        this.categoriesService.decrementPostCount(existingPost.category.toString()),
        this.categoriesService.incrementPostCount(updatePostDto.category)
      );
    }
    
    if (updatePostDto.placement && updatePostDto.placement !== existingPost.placement.toString()) {
      promises.push(
        this.placementsService.decrementPostCount(existingPost.placement.toString()),
        this.placementsService.incrementPostCount(updatePostDto.placement)
      );
    }

    if (promises.length > 0) {
      await Promise.all(promises);
    }

    return updatedPost;
  }

  async remove(id: string): Promise<void> {
    // First get the post to get category and placement IDs
    const post = await this.postModel.findById(id).exec();
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Delete the post
    await this.postModel.findByIdAndDelete(id).exec();

    // Decrement post counts for category and placement
    await Promise.all([
      this.categoriesService.decrementPostCount(post.category.toString()),
      this.placementsService.decrementPostCount(post.placement.toString()),
    ]);
  }

  async incrementViewCount(id: string): Promise<Post> {
    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true })
      .populate('author', 'firstName lastName email')
      .populate('category', 'name slug color')
      .populate('placement', 'name slug subCategory color')
      .exec();

    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return updatedPost;
  }

  async findByAuthor(authorId: string, queryParams: PostQueryParams = {}): Promise<PostsResponse> {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      tags,
    } = queryParams;

    // Build filter object
    const filter: any = { author: authorId };
    
    if (status) {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }
    
    if (tags && tags.length > 0) {
      filter.tags = { $in: tags };
    }

    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .populate('author', 'firstName lastName email')
        .populate('category', 'name slug color')
        .populate('placement', 'name slug subCategory color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      posts,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findByTag(tag: string, queryParams: PostQueryParams = {}): Promise<PostsResponse> {
    const {
      page = 1,
      limit = 10,
      status,
      author,
      search,
    } = queryParams;

    // Build filter object
    const filter: any = { tags: { $in: [tag] } };
    
    if (status) {
      filter.status = status;
    }
    
    if (author) {
      filter.author = author;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    
    const [posts, total] = await Promise.all([
      this.postModel
        .find(filter)
        .populate('author', 'firstName lastName email')
        .populate('category', 'name slug color')
        .populate('placement', 'name slug subCategory color')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.postModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      posts,
      total,
      page,
      limit,
      totalPages,
    };
  }
}