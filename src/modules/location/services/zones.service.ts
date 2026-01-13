import { NotFoundError } from "../../../errors";
import prisma from "../../../lib/prisma";
import {
  CreateZoneDto,
  PaginatedZoneResponseDto,
  QueryZoneDto,
  UpdateZoneDto,
  ZoneResponseDto,
} from "../dto/zone.dto";

export class ZonesService {
  async findAll(query: QueryZoneDto): Promise<PaginatedZoneResponseDto> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      type,
      floorId,
      buildingId,
      complexId,
    } = query;

    const whereClause: any = {
      ...(type && { type }),
      ...(floorId && { floorId }),
      ...(buildingId && { buildingId }),
      ...(complexId && { complexId }),
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
      ];
    }

    const [count, zones] = await Promise.all([
      prisma.zone.count({ where: whereClause }),
      prisma.zone.findMany({
        where: whereClause,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      data: zones as unknown as ZoneResponseDto[], // Type casting due to Decimal/Date complexities if any
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id: string): Promise<ZoneResponseDto> {
    const zone = await prisma.zone.findUnique({
      where: { id },
      include: {
        floor: { select: { id: true, name: true, code: true } },
        photos: { select: { id: true, url: true } },
      },
    });

    if (!zone) throw new NotFoundError("Zone");

    return zone as unknown as ZoneResponseDto;
  }

  async create(data: CreateZoneDto): Promise<ZoneResponseDto> {
    const { photoIds, floorId, ...rest } = data;

    // Check if floor exists
    const floorExists = await prisma.floor.findUnique({ where: { id: floorId } });
    if (!floorExists) throw new NotFoundError("Floor");

    const zone = await prisma.zone.create({
      data: {
        ...rest,
        floorId,
        ...(photoIds && {
          photos: {
            connect: photoIds.map((id) => ({ id })),
          },
        }),
      },
    });

    return zone as unknown as ZoneResponseDto;
  }

  async update(id: string, data: UpdateZoneDto): Promise<ZoneResponseDto> {
    const exists = await prisma.zone.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Zone");

    const { photoIds, ...rest } = data;

    const updated = await prisma.zone.update({
      where: { id },
      data: {
        ...rest,
        ...(photoIds && {
          photos: {
            set: photoIds.map((id) => ({ id })),
          },
        }),
      },
    });

    return updated as unknown as ZoneResponseDto;
  }

  async delete(id: string): Promise<void> {
    const exists = await prisma.zone.findUnique({ where: { id } });
    if (!exists) throw new NotFoundError("Zone");
    await prisma.zone.delete({ where: { id } });
  }
}
