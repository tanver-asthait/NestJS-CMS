import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Categories {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  // Get all categories with pagination and filters
  getCategories(params: CategoryQueryParams = {}): Observable<CategoriesResponse> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<CategoriesResponse>(this.apiUrl, { params: httpParams });
  }

  // Get all categories without pagination (for dropdowns)
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/all`);
  }

  // Get single category by ID
  getCategory(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  // Get category by slug
  getCategoryBySlug(slug: string): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/slug/${slug}`);
  }

  // Create new category
  createCategory(categoryData: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, categoryData);
  }

  // Update category
  updateCategory(id: string, categoryData: UpdateCategoryDto): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/${id}`, categoryData);
  }

  // Delete category
  deleteCategory(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Generate slug from name
  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  }

  // Check if slug is available
  checkSlugAvailability(slug: string, excludeId?: string): Observable<{ available: boolean }> {
    let httpParams = new HttpParams().set('slug', slug);
    if (excludeId) httpParams = httpParams.set('excludeId', excludeId);
    
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/check-slug`, { params: httpParams });
  }
}
