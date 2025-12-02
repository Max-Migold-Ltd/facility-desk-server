import { Request, Response, NextFunction } from 'express';
import { AccessLevel } from '../../generated/prisma';
import { prisma } from '../config/database';
import { ForbiddenError } from '../errors';

const accessLevelHierarchy: Record<AccessLevel, number> = {
  NONE: 0,
  READ: 1,
  WRITE: 2
};

export const requirePermission = (
  resource: string,
  minAccessLevel: AccessLevel
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists
      if (!req.user) {
        throw new ForbiddenError('User not authenticated');
      }

      // Load permissions for user's role
      const permission = await prisma.permission.findUnique({
        where: {
          roleId_resource: {
            roleId: req.user.roleId,
            resource
          }
        }
      });

      // If no permission found, default to NONE
      const userAccessLevel = permission?.accessLevel || 'NONE';

      // Check if user's access level meets the minimum requirement
      if (accessLevelHierarchy[userAccessLevel] < accessLevelHierarchy[minAccessLevel]) {
        throw new ForbiddenError(
          `Insufficient permissions for ${resource}. Required: ${minAccessLevel}, Has: ${userAccessLevel}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
