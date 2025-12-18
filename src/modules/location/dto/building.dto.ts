import {
  Availability,
  Condition,
  Criticality,
  MainUse,
  ServiceStatus,
} from "../../../generated/prisma";

/**
 * DTO for creating a new building
 */

export interface AddressDto {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
}
export interface CreateBuildingDto {
  name: string;
  code: string;
  mainUse?: MainUse;
  availability?: Availability;
  status?: ServiceStatus;

  address: AddressDto;

  condition?: Condition;
  criticality?: Criticality;

  totalFloors?: number;
  totalUnits?: number;
  totalRooms?: number;
  glazedArea?: number;
  cleanableArea?: number;
  coveredArea?: number;
  totalNetArea?: number;
  totalGrossArea?: number;
  totalHeatedVolume?: number;
  totalVolume?: number;

  complexId: string;
  calenderEntityId?: string;
  photoIds?: string[];
}

/**
 * DTO for updating an existing building
 */
export interface UpdateBuildingDto {
  name: string;
  mainUse?: MainUse;
  availability?: Availability;
  status?: ServiceStatus;
  address: AddressDto;

  condition?: Condition;
  criticality?: Criticality;

  totalFloors?: number;
  totalUnits?: number;
  totalRooms?: number;
  glazedArea?: number;
  cleanableArea?: number;
  coveredArea?: number;
  totalNetArea?: number;
  totalGrossArea?: number;
  totalHeatedVolume?: number;
  totalVolume?: number;

  complexId: string;
  calenderEntityId?: string;
  photoIds?: string[];
}

/**
 * DTO for building response
 */
export interface BuildingResponseDto {
  name: string;
  code: string;
  mainUse?: MainUse;
  availability?: Availability;
  status?: ServiceStatus;
 
  address: AddressDto;

  condition?: Condition;
  criticality?: Criticality;

  totalFloors?: number;
  totalUnits?: number;
  totalRooms?: number;
  glazedArea?: number;
  cleanableArea?: number;
  coveredArea?: number;
  totalNetArea?: number;
  totalGrossArea?: number;
  totalHeatedVolume?: number;
  totalVolume?: number;
  complexId: string;

  // Related data (optional for expanded responses)
  complex?: {
    id: string;
    code: string;
    name: string;
  };

  photos?: {
    id: string;
    url: string;
  }[];

  calenderEntity?: {
    id: string;
    name: string;
  };
}

/**
 * DTO for querying buildings
 */
export interface QueryBuildingDto {
  page?: number;
  limit?: number;
  sortBy?:
    | "name"
    | "code"
    | "createdAt"
    | "mainUse"
    | "condition"
    | "criticality";
  sortOrder?: "asc" | "desc";
  complexId?: string;
  mainUse?: MainUse;
  condition?: Condition;
  criticality?: Criticality;
  status?: ServiceStatus;
  search?: string;
}

/**
 * DTO for paginated building list response
 */
export interface PaginatedBuildingResponseDto {
  data: BuildingResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
