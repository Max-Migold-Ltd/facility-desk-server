import prisma from "../../lib/prisma";
import { Prisma } from "../../generated/prisma";

export class MeterService {
  /**
   * Create a new Meter
   */
  async create(data: Prisma.MeterCreateInput) {
    return await prisma.meter.create({
      data,
    });
  }

  /**
   * Find all meters, optionally filtering by type or entity
   */
  async findAll() {
    return await prisma.meter.findMany({
      include: {
        asset: { select: { name: true } },
        building: { select: { name: true } },
        zone: { select: { name: true } },
        space: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Find one meter by ID
   */
  async findOne(id: string) {
    return await prisma.meter.findUnique({
      where: { id },
      include: {
        readings: {
          orderBy: { timestamp: "desc" },
          take: 5, // Last 5 readings
        },
        preventiveTriggers: true,
      },
    });
  }

  /**
   * Update a meter
   */
  async update(id: string, data: Prisma.MeterUpdateInput) {
    return await prisma.meter.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a meter
   */
  async delete(id: string) {
    return await prisma.meter.delete({
      where: { id },
    });
  }
}
