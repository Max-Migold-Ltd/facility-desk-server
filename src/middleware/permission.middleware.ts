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

      //1. Check if the role contains the permission
      const rolePermissions = await prisma.permission.findMany({
        where: {
          roleId: req.user.role.id,
          resource,
        },
      });

      if (rolePermissions.length > 0) {
        const permission = rolePermissions[0];
        if (
          accessLevelHierarchy[permission.accessLevel as AccessLevel] >=
          accessLevelHierarchy[minAccessLevel]
        ) {
          // allow
          return next();
        }
      } else {
        const directPermission = req.user.permissions.find(
          (p) => p.resource === resource
        );
        if (directPermission) {
          if (
            accessLevelHierarchy[directPermission.accessLevel as AccessLevel] <
            accessLevelHierarchy[minAccessLevel]
          ) {
            return new ForbiddenError(
              `Insufficient direct permissions for ${resource}. Required: ${minAccessLevel}, Has: ${directPermission.accessLevel}`
            );
          }
          // If direct permission is sufficient, proceed
          return next();
        } else {
          return new ForbiddenError(
            `Insufficient permissions for ${resource}. Required: ${minAccessLevel}`
          );
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
