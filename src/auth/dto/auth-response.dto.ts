import { User } from '../../users/schemas/user.schema';

export class AuthResponseDto {
  access_token: string;
  user: Omit<User, 'password'>;
  expiresIn: string;
}