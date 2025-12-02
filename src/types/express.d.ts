import { RoleName } from '../../generated/prisma';

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
          name: RoleName;
          description: string | null;
        };
        roleId: string;
      };
    }
  }
}

export {};
