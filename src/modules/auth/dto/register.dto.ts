import { RoleName } from '../../../../generated/prisma';

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleName: RoleName;
}
