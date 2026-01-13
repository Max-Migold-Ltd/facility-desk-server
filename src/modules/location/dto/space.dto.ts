import {
  Condition,
  Criticality,
  RoomUse,
  ServiceStatus,
} from "../../../generated/prisma";

/**
 * DTO for creating a new space
 */
export interface CreateSpaceDto {
  name: string;
  code: string;
  use?: RoomUse;
  status?: ServiceStatus;

  condition?: Condition;
  criticality?: Criticality;

  calenderEntityId?: string;
  zoneId: string;

  photoIds?: string[];

  glazedArea?: number;
  cleanableArea?: number;
  coveredArea?: number;
  totalNetArea?: number;
  totalGrossArea?: number;
  totalHeatedVolume?: number;
  totalVolume?: number;
}

/**
 * DTO for updating an existing space
 */

export type UpdateSpaceDto = Omit<CreateSpaceDto, "code">;

/**
 * DTO for space response
 */
export interface SpaceResponseDto extends CreateSpaceDto {
  id: string;
  // Related data (optional for expanded responses)
  floor?: {
    id: string;
    code: string;
    name: string;
    level: number;
  };

  zone?: {
    id: string;
    code: string;
    name: string;
  };

  photos?: {
    id: string;
    url: string;
  }[];
}

/**
 * DTO for querying spaces
 */
export interface QuerySpaceDto {
  page?: number;
  limit?: number;
  sortBy?: "name" | "code" | "createdAt" | "use";
  sortOrder?: "asc" | "desc";
  floorId?: string;

  zoneId?: string;

  use?: RoomUse;
  search?: string;
}

/**
 * DTO for paginated space list response
 */
export interface PaginatedSpaceResponseDto {
  data: SpaceResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
