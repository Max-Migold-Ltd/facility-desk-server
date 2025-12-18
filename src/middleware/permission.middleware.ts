import { Request, Response, NextFunction } from "express";
import { AccessLevel } from "../generated/prisma";
import prisma from "../lib/prisma";
import { ForbiddenError } from "../errors";

const accessLevelHierarchy: Record<AccessLevel, number> = {
  NONE: 0,
  READ: 1,
  WRITE: 2,
};

export const requirePermission = (
  resource: string,
  minAccessLevel: AccessLevel
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists
      if (!req.user) {
        throw new ForbiddenError("User not authenticated");
      }

      // 1. Check for Direct User Permission overrides
      const directPermission = req.user.permissions.find(
        (p) => p.resource === resource
      );

      if (directPermission) {
        if (
          accessLevelHierarchy[directPermission.accessLevel as AccessLevel] <
          accessLevelHierarchy[minAccessLevel]
        ) {
          throw new ForbiddenError(
            `Insufficient direct permissions for ${resource}. Required: ${minAccessLevel}, Has: ${directPermission.accessLevel}`
          );
        }
        // If direct permission is sufficient, proceed
        return next();
      }

      // 2. Fallback to Role-based Permission
      const rolePermission = await prisma.permission.findUnique({
        where: {
          roleId_resource: {
            roleId: req.user.role.id,
            resource,
          },
        },
      });

      // If no permission found, default to NONE
      const userAccessLevel = rolePermission?.accessLevel || "NONE";

      // Check if user's access level meets the minimum requirement
      if (
        accessLevelHierarchy[userAccessLevel] <
        accessLevelHierarchy[minAccessLevel]
      ) {
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
