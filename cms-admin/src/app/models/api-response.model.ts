// Standard API response format
export interface StandardResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

// Standard API error response format
export interface StandardErrorResponse {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}