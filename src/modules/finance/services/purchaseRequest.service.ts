import { BadRequestError } from "../../../errors";
import prisma from "../../../lib/prisma";
import { CreatePurchaseOrderDto, CreateQuotationDto } from "../dto/purchase-order";
import { CreatePurchaseRequestDto } from "../dto/purchase-request";
import { CostCenterService } from "./cost-center.service";

const costCenterService = new CostCenterService();

export class PurchaseRequestService {

  async getAll() {
    return await prisma.purchaseRequest.findMany();
  }

  async getById(id: string) {
    return await prisma.purchaseRequest.findUnique({ where: { id } });
  }

  async create(data: CreatePurchaseRequestDto) {
    const { items, ...rest } = data;
    console.log("Rest: ", rest)
    const pr = await prisma.purchaseRequest.create({
      data: { ...rest, items: { create: items } },
    });

    return pr;
  }

  async approve(prId: string, data: CreateQuotationDto) {

    const pr = await prisma.purchaseRequest.findUnique({ where: { id: prId }, include: { items: true } });

    if (!pr) {
      throw new BadRequestError("Purchase request not found");
    }
    // Create Quotation

    const [quotation, _] = await prisma.$transaction([
      prisma.quotation.create({
        data: {
          purchaseRequestId: prId,
          supplierId: data.supplierId,
          items: {
            create: pr.items.map(prItem => {
              const quoteditem = data.items.find(item => item.itemId === prItem.itemId);

              if (!quoteditem) {
                throw new BadRequestError(`Item ${prItem.itemId} not found in quotation`);
              }

              return {
                itemId: prItem.itemId,
                quantity: prItem.quantity,
                unitPrice: quoteditem.unitPrice,
                totalPrice: quoteditem.unitPrice * prItem.quantity,
              }
            })
          }
        }
      }),
      prisma.purchaseRequest.update({
        where: { id: prId },
        data: {
          status: "APPROVED",
        }
      })
    ])


    return quotation;
  }

  async reject(prId: string) {
    await prisma.purchaseRequest.update({
      where: { id: prId },
      data: {
        status: "REJECTED",
      }
    })
    return null;
  }
}
