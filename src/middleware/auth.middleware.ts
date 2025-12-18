import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.util";
import prisma from "../lib/prisma";
import { AuthError } from "../errors";

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthError("No token provided");
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const payload = verifyAccessToken(token);

    // Load user with role from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        role: true,
        permissions: true, // Fetch direct user permissions
      },
    });

    if (!user) {
      throw new AuthError("User not found");
    }

    // Check user status
    if (user.status !== "ACTIVE") {
      throw new AuthError("Account is not active");
    }

    // Attach user to request object (excluding password)
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    next();
  } catch (error) {
    next(error);
  }
};
