export interface AuthUser {
  username: string;
  role: string;
  expiresAt: number;
}

export interface AuthTokenResponse {
  username: string;
  role: string;
  expiresIn?: number;
}

export interface AuthActionResult<T = void> {
  success: boolean;
  status?: number;
  retryAfter?: number;
  data?: T;
  error?: string;
  fieldErrors?: Record<string, string>;
  resetToken?: string;
}