import { prisma } from '../../config/database';
import { NotFoundError } from '../../errors';
import { UserStatus } from '../../../generated/prisma';

export class UsersService {
  async findAll(options: {
    page?: number;
    limit?: number;
    status?: UserStatus;
    role?: string;
  }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (options.status) where.status = options.status;
    if (options.role) where.role = { name: options.role };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { role: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    // Remove passwords
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);

    return {
      users: usersWithoutPasswords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    status?: UserStatus;
    roleId?: string;
  }) {
    const user = await prisma.user.update({
      where: { id },
      data,
      include: { role: true }
    });

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async delete(id: string) {
    await prisma.user.delete({
      where: { id }
    });
  }
}
