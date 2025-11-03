import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument, PostStatus } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // Check if slug already exists
    const existingPost = await this.postModel.findOne({ slug: createPostDto.slug });
    if (existingPost) {
      throw new ConflictException('Post with this slug already exists');
    }

    const createdPost = new this.postModel(createPostDto);
    
    // Set publishedAt if status is published
    if (createPostDto.status === PostStatus.PUBLISHED) {
      createdPost.publishedAt = new Date();
    }

    return createdPost.save();
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
      .sort({ publishedAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<Post> {
    const post = await this.postModel
      .findById(id)
      .populate('author', 'firstName lastName email')
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
      .exec();
    
    if (!post) {
      throw new NotFoundException(`Post with slug ${slug} not found`);
    }
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    // If status is being changed to published and publishedAt is not set
    if (updatePostDto.status === PostStatus.PUBLISHED && !updatePostDto.publishedAt) {
      updatePostDto.publishedAt = new Date();
    }

    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, updatePostDto, { new: true })
      .populate('author', 'firstName lastName email')
      .exec();

    if (!updatedPost) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return updatedPost;
  }

  async remove(id: string): Promise<void> {
    const result = await this.postModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
  }

  async incrementViewCount(id: string): Promise<Post> {
    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true })
      .populate('author', 'firstName lastName email')
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