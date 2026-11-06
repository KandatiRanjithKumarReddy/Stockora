import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

const SENSITIVE_PATTERNS = /gemini|googlegenerativeai|generativelanguage|api_key|\.env|mongodb\+srv|stack|cast to objectid|e11000/i;

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Normalize Mongoose & Express body-parser operational errors cleanly
  if (err?.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: 'Invalid resource identifier.',
    });
    return;
  }

  if (err?.code === 11000) {
    res.status(409).json({
      success: false,
      message: 'A record with those details already exists. Please retry.',
    });
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      success: false,
      message: 'Invalid JSON request payload.',
    });
    return;
  }

  if (err?.type === 'entity.too.large') {
    res.status(413).json({
      success: false,
      message: 'Request payload exceeds maximum allowed size.',
    });
    return;
  }

  const statusCode = err instanceof AppError ? err.statusCode : err.statusCode || 500;
  const rawMessage = String(err?.message || 'Internal Server Error');

  // Log concise operational error code internally without leaking secrets
  console.error(`[Error] ${req.method} ${req.originalUrl} - ${statusCode}: ${err?.name || 'Error'}`);

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
