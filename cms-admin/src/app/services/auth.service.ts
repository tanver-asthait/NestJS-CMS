import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginDto, RegisterDto } from '../models/auth.model';
import { User } from '../models/user.model';
import { StandardResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check for existing token on service initialization
    this.loadStoredUser();
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http.post<StandardResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        map(response => response.data),
        tap(authResponse => {
          this.setSession(authResponse);
        })
      );
  }

  register(userData: RegisterDto): Observable<AuthResponse> {
    return this.http.post<StandardResponse<AuthResponse>>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        map(response => response.data),
        tap(authResponse => {
          this.setSession(authResponse);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private setSession(authResponse: AuthResponse): void {
    localStorage.setItem('access_token', authResponse.access_token);
    localStorage.setItem('current_user', JSON.stringify(authResponse.user));
    this.currentUserSubject.next(authResponse.user);
  }

  private loadStoredUser(): void {
    const token = this.getToken();
    const storedUser = localStorage.getItem('current_user');
    
    if (token && storedUser && this.isAuthenticated()) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch {
        this.logout();
      }
    }
  }
}