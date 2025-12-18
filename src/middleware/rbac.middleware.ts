import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
// import { RoleName } from '../generated/prisma'; // Removed enum
import { ForbiddenError } from "../errors";

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Check if user exists
      if (!req.user) {
        throw new ForbiddenError("User not authenticated");
      }

      // Check if user has required role
      const userRoleName = req.user.role.name;
      const hasRole = roles.includes(userRoleName);

      if (!hasRole) {
        throw new ForbiddenError(
          `Access denied. Required role: ${roles.join(" or ")}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
