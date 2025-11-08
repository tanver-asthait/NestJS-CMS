import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, StandardResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<StandardResponse<T>> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    
    return next.handle().pipe(
      map((data) => {
        // If data is already in standard format, return as is
        if (data && typeof data === 'object' && 'success' in data && 'timestamp' in data) {
          return data;
        }

        // Get HTTP status code to determine message
        const statusCode = response.statusCode;
        let message = 'Operation successful';
        
        // Customize message based on HTTP method and status
        const request = ctx.getRequest();
        const method = request.method;
        
        switch (method) {
          case 'POST':
            message = statusCode === 201 ? 'Resource created successfully' : 'Operation successful';
            break;
          case 'PUT':
          case 'PATCH':
            message = 'Resource updated successfully';
            break;
          case 'DELETE':
            message = 'Resource deleted successfully';
            break;
          case 'GET':
            message = 'Data retrieved successfully';
            break;
          default:
            message = 'Operation successful';
        }

        // Return standardized response
        return {
          success: true,
          data,
          message,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}