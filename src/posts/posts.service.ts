import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument, PostStatus } from './schemas/post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

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

  async findAll(): Promise<Post[]> {
    return this.postModel
      .find()
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
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

  async findByAuthor(authorId: string): Promise<Post[]> {
    return this.postModel
      .find({ author: authorId })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTag(tag: string): Promise<Post[]> {
    return this.postModel
      .find({ tags: { $in: [tag] } })
      .populate('author', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();
  }
}