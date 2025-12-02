import { RoleName, UserStatus } from '../../../../generated/prisma';

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  status: UserStatus;
  role: {
    id: string;
    name: RoleName;
    description: string | null;
  };
  createdAt: Date;
}

export interface AuthResponse {
  user: UserResponse;
  accessToken: string;
}
