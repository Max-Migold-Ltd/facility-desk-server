import { NotFoundError } from "../../../errors";
import prisma from "../../../lib/prisma";
import {
  CreateFloorDto,
  QueryFloorDto,
  PaginatedFloorResponseDto,
  FloorResponseDto,
  UpdateFloorDto,
} from "../dto/floor.dto";
import { BuildingsService } from "./buildings.service";
import { ComplexesService } from "./complexes.service";

const buildingsService = new BuildingsService();
const complexesService = new ComplexesService();

export class FloorsService {
  async findAll(query: QueryFloorDto): Promise<PaginatedFloorResponseDto> {
    const {
      buildingId,
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
      ...(buildingId && { buildingId }),
      ...(condition && { condition }),
      ...(criticality && { criticality }),
      ...(status && { status }),
    };

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    const [count, floors] = await Promise.all([
      prisma.floor.count({ where: whereClause }),
      prisma.floor.findMany({
        where: whereClause,
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ]);

    return {
      data: floors as FloorResponseDto[],
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id: string): Promise<FloorResponseDto> {
    const floor = await prisma.floor.findUnique({
      where: { id },
      include: {
        building: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },

        zones: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!floor) throw new NotFoundError("Floor");

    return floor as FloorResponseDto;
  }

  async create(data: CreateFloorDto): Promise<FloorResponseDto> {
    // check if building and complex exists
    const building = await buildingsService.findById(data.buildingId);
    if (!building) {
      throw new NotFoundError("Building");
    }
    const floor = await prisma.floor.create({
      data,
    });

    return floor as FloorResponseDto;
  }

  async update(id: string, data: UpdateFloorDto): Promise<FloorResponseDto> {
    const floor = await prisma.floor.findUnique({ where: { id } });
    if (!floor) throw new NotFoundError("Floor");

    const updated = await prisma.floor.update({
      where: { id },
      data,
    });

    return updated as FloorResponseDto;
  }

  async delete(id: string): Promise<void> {
    const floor = await prisma.floor.findUnique({ where: { id } });
    if (!floor) throw new NotFoundError("Floor");

    await prisma.floor.delete({ where: { id } });
  }
}
