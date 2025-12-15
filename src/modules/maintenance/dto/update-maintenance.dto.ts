import { Status } from "../../../generated/prisma";

export interface UpdateMaintenanceDto {
  description?: string;
  processStatus?: Status;
  teamId?: string;
  assigneeId?: string;
  outcome?: string;
}
