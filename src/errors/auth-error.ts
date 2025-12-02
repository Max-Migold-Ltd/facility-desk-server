import { AppError } from './app-error';

export class AuthError extends AppError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 401, 'AUTH_ERROR', details);
  }
}
