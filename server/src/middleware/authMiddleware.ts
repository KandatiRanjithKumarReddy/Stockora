import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { User, IUser } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  tokenPayload?: TokenPayload;
}

const extractRequestToken = (req: Request): string | undefined => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  return undefined;
};

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractRequestToken(req);

  if (!token) {
    res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    return;
  }

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).populate('retailerId');

    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found.' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ success: false, message: 'User account is suspended. Please contact distributor.' });
      return;
    }

    if (user.status === 'PENDING_APPROVAL') {
      res.status(403).json({ success: false, message: 'Your retailer account is pending approval by Order Desk.' });
      return;
    }

    req.user = user;
    req.tokenPayload = payload;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
  }
};

/**
 * Attaches req.user when a valid active session token is present,
 * while allowing unauthenticated public catalog requests to proceed cleanly.
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  const token = extractRequestToken(req);
  if (!token) {
    next();
    return;
  }

  try {
    const payload = verifyToken(token);
    const user = await User.findById(payload.userId).populate('retailerId');
    if (user && user.status === 'ACTIVE') {
      req.user = user;
      req.tokenPayload = payload;
    }
  } catch {
    // Ignore expired/invalid optional token on public browse endpoints
  }

  next();
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden. Role '${req.user?.role || 'ANONYMOUS'}' is not authorized to access this resource.`,
      });
      return;
    }
    next();
  };
};

