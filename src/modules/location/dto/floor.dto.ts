import { Condition, Criticality, ServiceStatus } from "../../../generated/prisma";

/**
 * DTO for creating a new floor
 */
export interface CreateFloorDto {
  code: string;
  name: string;
  level: number;

  grossArea?: number;
  status?: ServiceStatus;
  condition?: Condition;
  criticality?: Criticality;
  complexId: string;
  buildingId: string;

  totalUnits?: number;
  totalRooms?: number;
  glazedArea?: number;
  cleanableArea?: number;
  coveredArea?: number;
  totalNetArea?: number;
  totalGrossArea?: number;
  totalHeatedVolume?: number;
  totalVolume?: number;
}

/**
 * DTO for updating an existing floor
 */
export interface UpdateFloorDto {
  name: string;
  level: number;

  grossArea?: number;
  status?: ServiceStatus;
  condition?: Condition;
  criticality?: Criticality;
  complexId: string;
  buildingId: string;

  totalUnits?: number;
  totalRooms?: number;
  glazedArea?: number;
  cleanableArea?: number;
  coveredArea?: number;
  totalNetArea?: number;
  totalGrossArea?: number;
  totalHeatedVolume?: number;
  totalVolume?: number;

  photoIds?: string[];
}

/**
 * DTO for floor response
 */
export interface FloorResponseDto {
  id: string;
  code: string;
  name: string;
  level: number;

  grossArea?: number;
  status?: ServiceStatus;
  condition?: Condition;
  criticality?: Criticality;
  buildingId: string;

  totalUnits?: number;
  totalRooms?: number;
  glazedArea?: number;
  cleanableArea?: number;
  coveredArea?: number;
  totalNetArea?: number;
  totalGrossArea?: number;
  totalHeatedVolume?: number;
  totalVolume?: number;

  // Related data (optional for expanded responses)

  building?: {
    id: string;
    code: string;
    name: string;
  };
}

/**
 * DTO for querying floors
 */
export interface QueryFloorDto {
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'code' | 'createdAt' | 'level' | 'condition' | 'criticality';
  sortOrder?: 'asc' | 'desc';
  buildingId?: string;
  condition?: Condition;
  criticality?: Criticality;
  status?: ServiceStatus;
  search?: string;
}

/**
 * DTO for paginated floor list response
 */
export interface PaginatedFloorResponseDto {
  data: FloorResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
