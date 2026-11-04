import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

const SENSITIVE_PATTERNS = /gemini|googlegenerativeai|generativelanguage|api_key|\.env|mongodb\+srv|stack/i;

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : err.statusCode || 500;
  const rawMessage = String(err?.message || 'Internal Server Error');

  // Always log full technical details internally on the server
  console.error(`[Error] ${req.method} ${req.originalUrl} - ${statusCode}: ${rawMessage}`);

  // Never expose internal SDK/provider/infrastructure messages or stack traces to clients
  const isSafeClientError =
    statusCode >= 400 && statusCode < 500 && !SENSITIVE_PATTERNS.test(rawMessage);

  const publicMessage = isSafeClientError
    ? rawMessage
    : 'We encountered a temporary issue completing your request. Please try again in a moment.';

  res.status(statusCode).json({
    success: false,
    message: publicMessage,
  });
};
