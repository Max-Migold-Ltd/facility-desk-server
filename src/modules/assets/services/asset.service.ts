import qrcode from "qrcode";
import { NotFoundError } from "../../../errors";
import prisma from "../../../lib/prisma";
import {
  CreateAssetDto,
  QueryAssetDto,
  PaginatedAssetResponseDto,
  AssetResponseDto,
  UpdateAssetDto,
} from "../dto/asset.dto";

export class AssetService {

  private async generateQrCode(assetId: string): Promise<string> {
    
    const qrCode = await qrcode.toDataURL(`/assets/${assetId}`);
    return qrCode;
  }
  async findAll(query: QueryAssetDto): Promise<PaginatedAssetResponseDto> {
    const {
      categoryId,
      spaceId,
      parentSystemId,
      search,
      page = 1,
      limit = 10,
      sortOrder = "desc",
      sortBy = "createdAt",
    } = query;

    const whereClause: any = {
      ...(categoryId && { categoryId }),
      ...(spaceId && { spaceId }),
      ...(parentSystemId && { parentSystemId }),
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [count, assets] = await Promise.all([
      prisma.asset.count({ where: whereClause }),
      prisma.asset.findMany({
        where: whereClause,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      data: assets as AssetResponseDto[],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id: string): Promise<AssetResponseDto> {
    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        space: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        parentSystem: {
          select: {
            id: true,
            name: true,
          },
        },
        childAssets: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!asset) throw new NotFoundError("Asset");

    return asset as AssetResponseDto;
  }

  async create(data: CreateAssetDto): Promise<AssetResponseDto> {
    // Check if category exists
    const category = await prisma.assetCategory.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new NotFoundError("AssetCategory");
    }

    const asset = await prisma.asset.create({
      data,
    });

    // const qrCode = await this.generateQrCode(asset.id);
    // await prisma.asset.update({
    //   where: { id: asset.id },
    //   data: { qrCode },
    // });

    return asset as AssetResponseDto;
  }

  async update(id: string, data: UpdateAssetDto): Promise<AssetResponseDto> {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundError("Asset");

    if (data.categoryId) {
      const category = await prisma.assetCategory.findUnique({
        where: { id: data.categoryId },
      });
      if (!category) {
        throw new NotFoundError("AssetCategory");
      }
    }

    const updated = await prisma.asset.update({
      where: { id },
      data,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return updated as AssetResponseDto;
  }

  async delete(id: string): Promise<void> {
    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundError("Asset");

    await prisma.asset.delete({ where: { id } });
  }
}
