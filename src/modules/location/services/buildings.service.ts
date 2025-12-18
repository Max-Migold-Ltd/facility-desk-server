import { NotFoundError } from "../../../errors";
import prisma from "../../../lib/prisma";
import {
  CreateBuildingDto,
  QueryBuildingDto,
  PaginatedBuildingResponseDto,
  BuildingResponseDto,
  UpdateBuildingDto,
} from "../dto/building.dto";

import { ComplexesService } from "./complexes.service";

const complexesService = new ComplexesService();

export class BuildingsService {
  async findAll(
    query: QueryBuildingDto
  ): Promise<PaginatedBuildingResponseDto> {
    const {
      complexId,
      mainUse,
      condition,
      criticality,
      status,
      search,
      page = 1,
      limit = 10,
      sortOrder = "desc",
      sortBy = "createdAt",
    } = query;

    const whereClause: any = {
      ...(complexId && { complexId }),
      ...(mainUse && { mainUse }),
      ...(condition && { condition }),
      ...(criticality && { criticality }),
      ...(status && { status }),
    };

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { address: { street: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [count, buildings] = await prisma.$transaction([
      prisma.building.count({ where: whereClause }),
      prisma.building.findMany({
        where: whereClause,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          address: true,
        },
      }),
    ]);

    return {
      data: buildings as BuildingResponseDto[],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id: string): Promise<BuildingResponseDto> {
    const building = await prisma.building.findUnique({
      where: { id },
      include: {
        address: true,
        complex: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        floors: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true,
          },
        },
        photos: {
          select: {
            id: true,
            url: true,
          },
        },
        calenderEntity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!building) throw new NotFoundError("Building");

    return building as BuildingResponseDto;
  }

  async create(data: CreateBuildingDto): Promise<BuildingResponseDto> {
    const { photoIds, address, complexId, calenderEntityId, ...buildingData } =
      data;

    // Check if complex exists
    const complex = await complexesService.exists(complexId);
    if (!complex) {
      throw new NotFoundError("Complex");
    }

    const building = await prisma.building.create({
      data: {
        ...buildingData,
        complex: {
          connect: { id: complexId },
        },
        address: {
          create: address,
        },
        ...(calenderEntityId && {
          calenderEntity: {
            connect: { id: calenderEntityId },
          },
        }),
        ...(photoIds && {
          photos: {
            connect: photoIds.map((id) => ({ id })),
          },
        }),
      },
      include: {
        address: true,
      },
    });

    return building as BuildingResponseDto;
  }

  async update(
    id: string,
    data: UpdateBuildingDto
  ): Promise<BuildingResponseDto> {
    const building = await prisma.building.findUnique({ where: { id } });
    if (!building) throw new NotFoundError("Building");

    // Check if complex exists
    if (data?.complexId) {
      const complex = await complexesService.exists(data.complexId);
      if (!complex) {
        throw new NotFoundError("Complex");
      }
    }

    const { address, complexId, calenderEntityId, ...rest } = data;

    const updated = await prisma.building.update({
      where: { id },
      data: {
        ...rest,
        ...(complexId && {
          complex: {
            connect: { id: complexId },
          },
        }),
        ...(calenderEntityId && {
          calenderEntity: {
            connect: { id: calenderEntityId },
          },
        }),
        ...(address && {
          address: {
            update: address,
          },
        }),
      },
      include: {
        address: true,
        complex: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        floors: {
          select: {
            id: true,
            code: true,
            name: true,
            level: true,
          },
        },
        photos: {
          select: {
            id: true,
            url: true,
          },
        },
        calenderEntity: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return updated as BuildingResponseDto;
  }

  async delete(id: string): Promise<void> {
    const building = await prisma.building.findUnique({ where: { id } });
    if (!building) throw new NotFoundError("Building");

    await prisma.building.delete({ where: { id } });
  }
}
