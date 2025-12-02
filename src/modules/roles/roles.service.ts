import { prisma } from '../../config/database';
import { NotFoundError } from '../../errors';

export class RolesService {
  async findAll() {
    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: {
            users: true,
            permissions: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return roles;
  }

  async findById(id: string) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          orderBy: { resource: 'asc' }
        },
        _count: {
          select: { users: true }
        }
      }
    });

    if (!role) {
      throw new NotFoundError('Role');
    }

    return role;
  }
}
