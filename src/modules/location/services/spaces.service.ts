import { NotFoundError } from "../../../errors";
import prisma from "../../../lib/prisma";
import {
  CreateSpaceDto,
  QuerySpaceDto,
  PaginatedSpaceResponseDto,
  SpaceResponseDto,
  UpdateSpaceDto,
} from "../dto/space.dto";

export class SpacesService {
  async findAll(query: QuerySpaceDto): Promise<PaginatedSpaceResponseDto> {
    const {
      floorId,
      zoneId,
      use,
      search,
      page = 1,
      limit = 10,
      sortOrder = "desc",
      sortBy = "createdAt",
    } = query;

    const whereClause: any = {
      ...(floorId && { floorId }),

      ...(zoneId && { zoneId }),
      ...(use && { use }),
    };

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [count, spaces] = await Promise.all([
      prisma.space.count({ where: whereClause }),
      prisma.space.findMany({
        where: whereClause,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      data: spaces as SpaceResponseDto[],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id: string): Promise<SpaceResponseDto> {
    const space = await prisma.space.findUnique({
      where: { id },
    });

    if (!space) throw new NotFoundError("Space");

    return space as SpaceResponseDto;
  }

  async create(data: CreateSpaceDto): Promise<SpaceResponseDto> {
    const { photoIds, zoneId, ...spaceData } = data;

    // Check if Zone exists
    const zone = await prisma.zone.findUnique({ where: { id: zoneId } });
    if (!zone) throw new NotFoundError("Zone");

    const space = await prisma.space.create({
      data: {
        ...spaceData,
        zoneId,
        ...(photoIds && {
          photos: {
            connect: photoIds.map((id) => ({ id })),
          },
        }),
      },
    });

    return space as SpaceResponseDto;
  }

  async update(id: string, data: UpdateSpaceDto): Promise<SpaceResponseDto> {
    const space = await prisma.space.findUnique({ where: { id } });
    if (!space) throw new NotFoundError("Space");

    const updated = await prisma.space.update({
      where: { id },
      data,
    });

    return updated as SpaceResponseDto;
  }

  async delete(id: string): Promise<void> {
    const space = await prisma.space.findUnique({ where: { id } });
    if (!space) throw new NotFoundError("Space");

    await prisma.space.delete({ where: { id } });
  }
}
