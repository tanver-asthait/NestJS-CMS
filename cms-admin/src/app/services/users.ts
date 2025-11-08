import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, CreateUserDto, UpdateUserDto, UserRole } from '../models/user.model';
import { AuthService } from './auth.service';
import { StandardResponse } from '../models/api-response.model';

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Users {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Get all users with pagination and filters
  getUsers(params: UserQueryParams = {}): Observable<UsersResponse> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.role) httpParams = httpParams.set('role', params.role);
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<StandardResponse<UsersResponse>>(this.apiUrl, { params: httpParams })
      .pipe(map(response => response.data));
  }

  // Get all users without pagination (for dropdowns)
  getAllUsers(): Observable<User[]> {
    return this.http.get<StandardResponse<User[]>>(`${this.apiUrl}/all`)
      .pipe(map(response => response.data));
  }

  // Get users by role
  getUsersByRole(role: UserRole, params: UserQueryParams = {}): Observable<UsersResponse> {
    let httpParams = new HttpParams();
    
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    if (params.search) httpParams = httpParams.set('search', params.search);

    return this.http.get<StandardResponse<UsersResponse>>(`${this.apiUrl}/role/${role}`, { params: httpParams })
      .pipe(map(response => response.data));
  }

  // Get single user by ID
  getUser(id: string): Observable<User> {
    return this.http.get<StandardResponse<User>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  // Create new user (admin only)
  createUser(userData: CreateUserDto): Observable<User> {
    return this.http.post<StandardResponse<User>>(this.apiUrl, userData)
      .pipe(map(response => response.data));
  }

  // Update user
  updateUser(id: string, userData: UpdateUserDto): Observable<User> {
    return this.http.patch<StandardResponse<User>>(`${this.apiUrl}/${id}`, userData)
      .pipe(map(response => response.data));
  }

  // Update user role (admin only)
  updateUserRole(id: string, role: UserRole): Observable<User> {
    // Check if current user is admin
    if (!this.canUpdateUserRole()) {
      throw new Error('Only administrators can update user roles');
    }
    
    return this.http.patch<StandardResponse<User>>(`${this.apiUrl}/${id}/role`, { role })
      .pipe(map(response => response.data));
  }

  // Delete user (admin only)
  deleteUser(id: string): Observable<{ message: string }> {
    return this.http.delete<StandardResponse<{ message: string }>>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  // Update user last login
  updateLastLogin(id: string): Observable<User> {
    return this.http.patch<StandardResponse<User>>(`${this.apiUrl}/${id}/login`, {})
      .pipe(map(response => response.data));
  }

  // Change user password
  changePassword(id: string, currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/password`, {
      currentPassword,
      newPassword
    });
  }

  // Reset user password (admin only)
  resetPassword(id: string, newPassword: string): Observable<{ message: string }> {
    if (!this.canUpdateUserRole()) {
      throw new Error('Only administrators can reset user passwords');
    }
    
    return this.http.patch<{ message: string }>(`${this.apiUrl}/${id}/reset-password`, {
      newPassword
    });
  }

  // Check if email is available
  checkEmailAvailability(email: string, excludeId?: string): Observable<{ available: boolean }> {
    let httpParams = new HttpParams().set('email', email);
    if (excludeId) httpParams = httpParams.set('excludeId', excludeId);
    
    return this.http.get<{ available: boolean }>(`${this.apiUrl}/check-email`, { params: httpParams });
  }

  // Get user role options
  getRoleOptions(): Array<{ value: UserRole; label: string }> {
    return [
      { value: UserRole.VIEWER, label: 'Viewer' },
      { value: UserRole.AUTHOR, label: 'Author' },
      { value: UserRole.EDITOR, label: 'Editor' },
      { value: UserRole.ADMIN, label: 'Administrator' }
    ];
  }

  // Check if current user can update user roles
  canUpdateUserRole(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === UserRole.ADMIN;
  }

  // Check if current user can delete users
  canDeleteUser(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === UserRole.ADMIN;
  }

  // Check if current user can create users
  canCreateUser(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.role === UserRole.ADMIN;
  }

  // Check if current user can edit specific user
  canEditUser(userId: string): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    // Admin can edit anyone
    if (currentUser?.role === UserRole.ADMIN) {
      return true;
    }
    
    // Users can edit themselves
    return currentUser?._id === userId;
  }

  // Get role display name
  getRoleDisplayName(role: UserRole): string {
    const roleMap = {
      [UserRole.ADMIN]: 'Administrator',
      [UserRole.EDITOR]: 'Editor',
      [UserRole.AUTHOR]: 'Author',
      [UserRole.VIEWER]: 'Viewer'
    };
    
    return roleMap[role] || role;
  }

  // Get role color for UI
  getRoleColor(role: UserRole): string {
    const colorMap = {
      [UserRole.ADMIN]: '#e74c3c',
      [UserRole.EDITOR]: '#3498db',
      [UserRole.AUTHOR]: '#2ecc71',
      [UserRole.VIEWER]: '#95a5a6'
    };
    
    return colorMap[role] || '#95a5a6';
  }
}
