import { ApiErrorResponse } from '../types/api-response';

export function formatErrorResponse(
  message: string,
  code: string,
  details?: any
): ApiErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details
    }
  };
}
