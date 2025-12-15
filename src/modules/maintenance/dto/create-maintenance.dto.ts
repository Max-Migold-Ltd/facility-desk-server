import { MaintenanceType, Priority } from "../../../generated/prisma";

export interface CreateMaintenanceDto {
  type?: MaintenanceType;
  description: string;
  siteId: string;
  assetId?: string;
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  priority?: Priority;
  requesterId: string;
  assigneeId?: string;
  // Dates
  startDate?: string; // ISO string
  endDate?: string; // ISO string
}
