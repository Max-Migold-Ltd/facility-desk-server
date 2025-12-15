import { MaintenanceType, Status, Priority } from "../../../generated/prisma";

export interface MaintenanceQueryDto {
  type?: MaintenanceType;
  status?: Status;
  priority?: Priority;
  siteId?: string;
  requesterId?: string;
  assigneeId?: string;
  page?: number;
  limit?: number;
}
