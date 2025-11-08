import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { StandardResponse } from '../models/api-response.model';

export interface UsersListResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UsersQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users with pagination and filters
   */
  getUsers(
    params: UsersQueryParams = {},
  ): Observable<StandardResponse<User[]>> {
    let httpParams = new HttpParams();

    if (params.page)
      httpParams = httpParams.set('page', params.page.toString());
    if (params.limit)
      httpParams = httpParams.set('limit', params.limit.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.role) httpParams = httpParams.set('role', params.role);
    if (params.sortBy) httpParams = httpParams.set('sortBy', params.sortBy);
    if (params.sortOrder)
      httpParams = httpParams.set('sortOrder', params.sortOrder);

    return this.http.get<StandardResponse<User[]>>(this.apiUrl, {
      params: httpParams,
    });
  }

  /**
   * Get a single user by ID
   */
  getUserById(id: string): Observable<User> {
    return this.http
      .get<StandardResponse<User>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  /**
   * Create a new user
   */
  createUser(userData: CreateUserDto): Observable<User> {
    return this.http
      .post<StandardResponse<User>>(this.apiUrl, userData)
      .pipe(map((response) => response.data));
  }

  /**
   * Update an existing user
   */
  updateUser(id: string, userData: UpdateUserDto): Observable<User> {
    return this.http
      .patch<StandardResponse<User>>(`${this.apiUrl}/${id}`, userData)
      .pipe(map((response) => response.data));
  }

  /**
   * Delete a user
   */
  deleteUser(id: string): Observable<void> {
    return this.http
      .delete<StandardResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  /**
   * Update user role (admin only)
   */
  updateUserRole(id: string, role: string): Observable<User> {
    return this.http
      .patch<StandardResponse<User>>(`${this.apiUrl}/${id}/role`, { role })
      .pipe(map((response) => response.data));
  }

  /**
   * Toggle user active status
   */
  toggleUserStatus(id: string, isActive: boolean): Observable<User> {
    return this.http
      .patch<
        StandardResponse<User>
      >(`${this.apiUrl}/${id}/status`, { isActive })
      .pipe(map((response) => response.data));
  }
}
