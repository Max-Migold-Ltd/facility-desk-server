// import { RoleName } from '../../generated/prisma'; // Removed enum

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        status: string;
        role: {
          id: string;
          name: string;
          isSystem: boolean;
          description: string | null;
        };
        permissions: {
          id: string;
          resource: string;
          accessLevel: string; // Using string to avoid enum import issues, or import AccessLevel
        }[];
      };
    }
  }
}

export {};
