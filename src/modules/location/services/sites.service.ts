import prisma from "../../../lib/prisma";
import { CreateSiteDto, UpdateSiteDto } from "../dto/site.dto";
import { State } from "../../../generated/prisma";

export class SitesService {
  async create(data: CreateSiteDto) {
    const { address, ...siteData } = data;

    // Create address first
    const newAddress = await prisma.address.create({
      data: {
        street: address.street,
        city: address.city,
        state: address.state as State,
        zipCode: address.zipCode,
        latitude: address.latitude,
        longitude: address.longitude,
      },
    });

    return prisma.site.create({
      data: {
        ...siteData,
        addressId: newAddress.id,
      },
    });
  }

  async findAll() {
    return prisma.site.findMany();
  }

  async findOne(id: string) {
    return prisma.site.findUnique({
      where: { id },
      include: {
        complexes: true,
        address: true,
      },
    });
  }

  async update(id: string, data: UpdateSiteDto) {
    const { address, ...siteData } = data;

    const updateData: any = { ...siteData };

    if (address) {
      updateData.address = {
        update: {
          street: address.street,
          city: address.city,
          state: address.state ? (address.state as State) : undefined,
          zipCode: address.zipCode,
          latitude: address.latitude,
          longitude: address.longitude,
        },
      };
    }

    return prisma.site.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string) {
    return prisma.site.delete({
      where: { id },
    });
  }
}
