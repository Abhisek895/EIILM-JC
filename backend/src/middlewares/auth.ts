import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Config } from '@config/environment';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    roleId: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, Config.jwt.secret);
    req.user = decoded as any;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Forbidden: Invalid token' });
  }
};

export const authorizeRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.user.roleId)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
};
