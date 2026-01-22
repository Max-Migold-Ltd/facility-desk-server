import {
  MaintenanceType,
  Priority,
  Status,
  PerformerReference,
  ProcessType,
} from "../../../generated/prisma";

export interface CreateMaintenanceDto {
  type?: MaintenanceType;
  description: string;
  startDate?: string;
  endDate?: string;
  shortDescription?: string;
  action?: string;
  message?: string;
  processNotes?: string;
  processStatus?: Status;
  register?: string;
  // Location
  siteId: string;
  assetId?: string;
  buildingId?: string;
  floorId?: string;
  roomId?: string;
  spaceId?: string;
  priority?: Priority;
  requesterId: string;
  assigneeId?: string;
  companyId?: string;
  teamId?: string;
  performerId?: string;
  performerReference?: PerformerReference;
  activityIdTimer?: string;
  acttivityStartTime?: string;
  acttivityEndTime?: string;
  allDeadlines?: string;
  processType?: ProcessType;
  ttSysRunning?: number;
  ttWorkRunning?: number;
  sorting?: string;
  outcome?: string;
  suspensionReason?: string;
  category?: string;
  subCategory?: string;

  ttSystemOpening?: number;
  ttWorkOpening?: number;
  ttSystemAssignment?: number;
  ttWorkAssignment?: number;
  ttSystemExecution?: number;
  ttWorkExecution?: number;
  ttSysSuspension?: number;
  ttWorkSuspension?: number;
  ttEstimate?: number;

  // Dates
  dueAssignedEnd?: string;
  execStart?: string;
  dueExecEndDate?: string;
  execEndDate?: string;
  dueClosureDate?: string;
  totalExecTime?: string;
  expStartDate?: string;
  expEndDate?: string;

  prevMaintenanceConfigId?: string;
  automaticConfig?: boolean;
  jointAccounting?: boolean;
  hasTasks?: boolean;
  estimateStatus?: Status;
  delayNotification?: boolean;

  // Dynamic data
  metadata?: Record<string, any>;
}
