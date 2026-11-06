import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps Express 4 async route handlers so rejected promises are always forwarded
 * to the global errorHandler instead of triggering unhandledRejection crashes.
 */
export const asyncHandler = <T extends Request = Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req as T, res, next)).catch(next);
  };
};

/**
 * Escapes special regular expression metacharacters in user search strings
 * to prevent SyntaxError crashes and ReDoS patterns.
 */
export const escapeRegex = (input: string): string => {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

/**
 * Neutralizes spreadsheet formula prefixes (=, +, -, @, tab, CR) and escapes
 * double quotes so exported Tally / Excel CSV cells cannot execute formulas.
 */
export const sanitizeCsvCell = (rawValue: unknown): string => {
  const str = String(rawValue ?? '').replace(/"/g, '""').trim();
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${safe}"`;
};

