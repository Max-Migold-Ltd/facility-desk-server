import {
  StockMovementType,
  StockReferenceType,
} from "../../../generated/prisma";

export interface CreateStockMovementDto {
  type: StockMovementType;
  quantity: number;
  itemId: string;
  warehouseId: string;
  targetWarehouseId?: string; // Required if type is TRANSFER
  notes?: string;
  referenceId?: string;
  referenceType?: StockReferenceType;
}

export interface StockFilterDto {
  warehouseId?: string;
  itemId?: string;
}

export interface StockMovementFilterDto {
  warehouseId?: string;
  itemId?: string;
  type?: StockMovementType;
  startDate?: Date;
  endDate?: Date;
}
