import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
    });
  }

  async validate(payload: any) {
    console.log('JWT Strategy - payload received:', JSON.stringify(payload, null, 2)); // Debug log
    
    const userObj = {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    
    console.log('JWT Strategy - returning user object:', JSON.stringify(userObj, null, 2)); // Debug log
    
    return userObj;
  }
}