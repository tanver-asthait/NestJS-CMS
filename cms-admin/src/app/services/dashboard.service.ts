import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, catchError, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Posts, PostsResponse } from './posts';
import { Categories } from './categories';
import { UserService } from './user.service';
import { Placements } from './placements';
import { Post, PostStatus } from '../models/post.model';
import { Category } from '../models/category.model';
import { User } from '../models/user.model';

export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalUsers: number;
  totalCategories: number;
  totalPlacements: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentPosts: Post[];
  recentUsers: User[];
  topCategories: Category[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(
    private http: HttpClient,
    private postsService: Posts,
    private categoriesService: Categories,
    private usersService: UserService,
    private placementsService: Placements,
  ) {}

  /**
   * Get dashboard statistics and data
   */
  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      posts: this.postsService
        .getPosts({ limit: 10, page: 1 })
        .pipe(
          catchError(() =>
            of({ posts: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
          ),
        ),
      publishedPosts: this.postsService
        .getPosts({ status: PostStatus.PUBLISHED, limit: 1, page: 1 })
        .pipe(
          catchError(() =>
            of({ posts: [], total: 0, page: 1, limit: 1, totalPages: 0 }),
          ),
        ),
      draftPosts: this.postsService
        .getPosts({ status: PostStatus.DRAFT, limit: 1, page: 1 })
        .pipe(
          catchError(() =>
            of({ posts: [], total: 0, page: 1, limit: 1, totalPages: 0 }),
          ),
        ),
      users: this.usersService
        .getUsers({ limit: 5, page: 1 })
        .pipe(
          catchError(() =>
            of({ data: [], total: 0, page: 1, limit: 5, totalPages: 0 } as any),
          ),
        ),
      categories: this.categoriesService
        .getAllCategories()
        .pipe(catchError(() => of([]))),
      placements: this.placementsService
        .getAllPlacements()
        .pipe(catchError(() => of([]))),
    }).pipe(
      map((results) => {
        // Extract user data safely
        const usersData = results.users;
        const userData = 'data' in usersData ? usersData.data : [];
        const userTotal =
          'total' in usersData ? usersData.total : userData.length;

        const stats: DashboardStats = {
          totalPosts: results.posts.total,
          publishedPosts: results.publishedPosts.total,
          draftPosts: results.draftPosts.total,
          totalUsers: userTotal,
          totalCategories: Array.isArray(results.categories)
            ? results.categories.length
            : 0,
          totalPlacements: Array.isArray(results.placements)
            ? results.placements.length
            : 0,
        };

        return {
          stats,
          recentPosts: results.posts.posts.slice(0, 5),
          recentUsers: Array.isArray(userData) ? userData.slice(0, 5) : [],
          topCategories: Array.isArray(results.categories)
            ? results.categories.slice(0, 5)
            : [],
        };
      }),
    );
  }

  /**
   * Get quick stats only (for faster loading)
   */
  getQuickStats(): Observable<DashboardStats> {
    return this.getDashboardData().pipe(map((data) => data.stats));
  }
}
