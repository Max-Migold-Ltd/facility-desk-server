import prisma from "../../../lib/prisma";
import { CreateItemDto, ItemFilterDto, UpdateItemDto } from "../dtos/item.dto";
import { ConflictError, NotFoundError } from "../../../errors";
import { Prisma } from "../../../generated/prisma";

export class ItemService {
  async create(data: CreateItemDto) {
    const existing = await prisma.item.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictError("Item with this code already exists");
    }

    return await prisma.item.create({
      data,
    });
  }

  async getAll(filters: ItemFilterDto & { page?: number; limit?: number }) {
    const { category, search, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.ItemWhereInput = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          stocks: {
            include: {
              warehouse: true,
            },
          },
        },
      }),
      prisma.item.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOne(id: string) {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        stocks: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    if (!item) throw new NotFoundError("Item");

    return item;
  }

  async update(id: string, data: UpdateItemDto) {
    await this.getOne(id);

    if (data.code) {
      const existing = await prisma.item.findUnique({
        where: { code: data.code },
      });
      if (existing && existing.id !== id) {
        throw new ConflictError("Item with this code already exists");
      }
    }

    return await prisma.item.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    await this.getOne(id);
    return await prisma.item.delete({
      where: { id },
    });
  }
}
