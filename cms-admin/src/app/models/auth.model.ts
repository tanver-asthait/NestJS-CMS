export interface AuthResponse {
  access_token: string;
  user: User;
  expiresIn: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: string;
}

// Import User interface
import { User } from './user.model';