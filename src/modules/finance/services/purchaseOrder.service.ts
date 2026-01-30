import { BadRequestError } from "../../../errors";
import {
  PurchaseOrderStatus,
  StockMovementType,
  StockReferenceType,
} from "../../../generated/prisma";
import { StockService } from "../../logistics/services/stock.service";
import prisma from "../../../lib/prisma";

interface ReceivePurchaseOrderDto {
  purchaseOrderId: string;
  warehouseId: string;
  receiverId: string; // Should be the logged in user
  companyId: string;
  items: {
    itemId: string;
    quantity: number;
    cost: number;
  }[];
}

const stockService = new StockService();

export class PurchaseOrderService {
  async getAll() {}
  async findById(id: string) {}

  //
  async receiveGoods(data: ReceivePurchaseOrderDto) {
    return await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.findUnique({
        where: { id: data.purchaseOrderId },
        include: { items: true, goodsReceipts: { include: { items: true } } },
      });

      if (!po) throw new BadRequestError("Purchase order not found");

      // FIX 1: Allow reception if status is ISSUED or PARTIALLY_RECEIVED
      if (po.status !== "ISSUED" && po.status !== "PARTIALLY_RECEIVED") {
        throw new BadRequestError(
          "Purchase order is not in a receivable state",
        );
      }

      // Validate over delivery
      for (const incomingItem of data.items) {
        const poItem = po.items.find((i) => i.itemId === incomingItem.itemId);
        if (!poItem)
          throw new BadRequestError(
            `Item ${incomingItem.itemId} was not in original Purchase Order`,
          );

        const previouslyReceivedQty = po.goodsReceipts.reduce(
          (sum, receipt) => {
            const itemInReceipt = receipt.items.find(
              (i) => i.itemId === incomingItem.itemId,
            );
            return sum + (itemInReceipt ? itemInReceipt.quantity : 0);
          },
          0,
        );

        const remainingQty = poItem.quantity - previouslyReceivedQty;

        if (incomingItem.quantity > remainingQty) {
          throw new BadRequestError(
            `Over-delivery detected for item ${poItem.itemId}. Remaining: ${remainingQty}, Attempting: ${incomingItem.quantity}`,
          );
        }
      }

      // Create Receipt
      const goodsReceipt = await tx.goodsReceipt.create({
        data: {
          purchaseOrderId: data.purchaseOrderId,
          receiverId: data.receiverId,
          companyId: data.companyId,
          items: {
            create: data.items.map((item) => ({
              itemId: item.itemId,
              quantity: item.quantity,
            })),
          },
        },
      });

      // Update Stock (Movement)
      for (const item of data.items) {
        await stockService.createMovement(
          {
            type: StockMovementType.LOAD,
            quantity: item.quantity,
            itemId: item.itemId,
            warehouseId: data.warehouseId,
            referenceType: StockReferenceType.PURCHASE_ORDER,
            referenceId: data.purchaseOrderId,
          },
          tx,
        ); // Pass 'tx' to ensure stock update is part of the transaction
      }

      // FIX 2: Correct Status Calculation
      const totalOrdered = po.items.reduce(
        (acc, item) => item.quantity + acc,
        0,
      );

      // Sum previous receipts
      const previousTotal = po.goodsReceipts.reduce(
        (acc, receipt) =>
          receipt.items.reduce((s, i) => i.quantity + s, 0) + acc,
        0,
      );

      // Sum CURRENT receipt (data.items)
      const currentTotal = data.items.reduce(
        (acc, item) => item.quantity + acc,
        0,
      );

      const totalReceived = previousTotal + currentTotal;

      const status =
        totalReceived >= totalOrdered
          ? "RECEIVED"
          : "PARTIALLY_RECEIVED";

      await tx.purchaseOrder.update({
        where: { id: data.purchaseOrderId },
        data: {
          status,
          totalAmount: {
            increment: data.items.reduce(
              (acc, item) => item.quantity * item.cost + acc,
              0,
            ),
          },
        },
      });

      return goodsReceipt;
    });
  }
}
