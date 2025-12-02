import { Request, Response, NextFunction } from 'express';
import { RoleName } from '../../generated/prisma';
import { ForbiddenError } from '../errors';

export const requireRole = (roles: RoleName[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists (authenticate middleware must run first)
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      // Check if user's role is in the allowed roles
      if (!roles.includes(req.user.role.name)) {
        throw new ForbiddenError(
          `Access denied. Required role: ${roles.join(' or ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
