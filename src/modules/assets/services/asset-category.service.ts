import { NotFoundError } from "../../../errors";
import prisma from "../../../lib/prisma";
import {
  CreateAssetCategoryDto,
  QueryAssetCategoryDto,
  PaginatedAssetCategoryResponseDto,
  AssetCategoryResponseDto,
  UpdateAssetCategoryDto,
} from "../dto/asset-category.dto";

export class AssetCategoryService {
  async findAll(
    query: QueryAssetCategoryDto
  ): Promise<PaginatedAssetCategoryResponseDto> {
    const {
      type,
      search,
      page = 1,
      limit = 10,
      sortOrder = "desc",
      sortBy = "createdAt",
    } = query;

    const whereClause: any = {
      ...(type && { type }),
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [count, categories] = await Promise.all([
      prisma.assetCategory.count({ where: whereClause }),
      prisma.assetCategory.findMany({
        where: whereClause,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      data: categories as AssetCategoryResponseDto[],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id: string): Promise<AssetCategoryResponseDto> {
    const category = await prisma.assetCategory.findUnique({
      where: { id },
      include: {
        assets: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!category) throw new NotFoundError("AssetCategory");

    return category as AssetCategoryResponseDto;
  }

  async exists(id: string): Promise<boolean> {
    const category = await prisma.assetCategory.findUnique({ where: { id } });
    return !!category;
  }

  async create(
    data: CreateAssetCategoryDto
  ): Promise<AssetCategoryResponseDto> {
    const category = await prisma.assetCategory.create({
      data,
      include: {
        assets: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return category as AssetCategoryResponseDto;
  }

  async update(
    id: string,
    data: UpdateAssetCategoryDto
  ): Promise<AssetCategoryResponseDto> {
    const category = await prisma.assetCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundError("AssetCategory");

    const updated = await prisma.assetCategory.update({
      where: { id },
      data,
      include: {
        assets: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return updated as AssetCategoryResponseDto;
  }

  async delete(id: string): Promise<void> {
    const category = await prisma.assetCategory.findUnique({ where: { id } });
    if (!category) throw new NotFoundError("AssetCategory");

    await prisma.assetCategory.delete({ where: { id } });
  }
}
