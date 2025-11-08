import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Post, CreatePostDto, UpdatePostDto, PostStatus } from '../models/post.model';
import { StandardResponse } from '../models/api-response.model';

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

@Injectable({
  providedIn: 'root',
})
export class Posts {
  private apiUrl = `${environment.apiUrl}/posts`;

  constructor(private http: HttpClient) {}

  // Get all posts with pagination and filters
  getPosts(params: PostQueryParams = {}): Observable<PostsResponse> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.author) httpParams = httpParams.set('author', params.author);
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.tags?.length) httpParams = httpParams.set('tags', params.tags.join(','));

    return this.http.get<StandardResponse<PostsResponse>>(this.apiUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  // Get posts by author
  getPostsByAuthor(authorId: string, params: PostQueryParams = {}): Observable<PostsResponse> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.status) httpParams = httpParams.set('status', params.status);

    return this.http.get<StandardResponse<PostsResponse>>(`${this.apiUrl}/author/${authorId}`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  // Get posts by tag
  getPostsByTag(tag: string, params: PostQueryParams = {}): Observable<PostsResponse> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());

    return this.http.get<StandardResponse<PostsResponse>>(`${this.apiUrl}/tag/${tag}`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  // Get single post by ID
  getPost(id: string): Observable<Post> {
    return this.http.get<StandardResponse<Post>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  // Get post by slug
  getPostBySlug(slug: string): Observable<Post> {
    return this.http.get<StandardResponse<Post>>(`${this.apiUrl}/slug/${slug}`)
      .pipe(map(response => response.data));
  }

  // Create new post
  createPost(postData: CreatePostDto): Observable<Post> {
    return this.http.post<StandardResponse<Post>>(this.apiUrl, postData)
      .pipe(map(response => response.data));
  }

  // Update post
  updatePost(id: string, postData: UpdatePostDto): Observable<Post> {
    return this.http.patch<StandardResponse<Post>>(`${this.apiUrl}/${id}`, postData)
      .pipe(map(response => response.data));
  }

  // Delete post
  deletePost(id: string): Observable<{ message: string }> {
    return this.http.delete<StandardResponse<{ message: string }>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  // Update post view count
  updateViewCount(id: string): Observable<Post> {
    return this.http.patch<StandardResponse<Post>>(`${this.apiUrl}/${id}/view`, {})
      .pipe(map(response => response.data));
  }

  // Generate slug from title
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Get post status options
  getStatusOptions(): Array<{ value: PostStatus; label: string }> {
    return [
      { value: PostStatus.DRAFT, label: 'Draft' },
      { value: PostStatus.PUBLISHED, label: 'Published' },
      { value: PostStatus.ARCHIVED, label: 'Archived' }
    ];
  }
}
