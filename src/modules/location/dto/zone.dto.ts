import { Availability, ServiceStatus } from "../../../generated/prisma";

export interface CreateZoneDto {
  code: string;
  name: string;
  type?: string; // "fire compartment", "wing", "tenant demarcation"
  availability?: Availability;
  status?: ServiceStatus;

  floorId: string;

  totalRooms?: number;
  glazedArea?: number;
  cleanableArea?: number;
  coveredArea?: number;
  totalNetArea?: number;
  totalGrossArea?: number;
  totalHeatedVolume?: number;
  totalVolume?: number;

  cadastralArea?: number;
  urbanSection?: string;
  sheet?: string;
  plot?: string;
  subordinate?: string;
  class?: number;
  size?: number;
  propertyRightsAndDuties?: string;
  cadastralIncome?: number;
  censusArea?: string;
  subArea?: string;

  photoIds?: string[];
}

export interface UpdateZoneDto extends Partial<CreateZoneDto> {}

export interface ZoneResponseDto {
  id: string;
  code: string;
  name: string;
  type?: string;
  availability: Availability;
  status: ServiceStatus;

  floorId: string;
  buildingId?: string;
  complexId?: string;
  calenderEntityId?: string;

  address?: string;
  city?: string;
  zipCode?: string;

  // Dimensions
  totalRooms?: number;
  glazedArea?: number;
  cleanableArea?: number;
  coveredArea?: number;
  totalNetArea?: number;
  totalGrossArea?: number;
  totalHeatedVolume?: number;
  totalVolume?: number;

  // Cadastral
  cadastralArea?: number;
  urbanSection?: string;
  sheet?: string;
  plot?: string;
  subordinate?: string;
  class?: number;
  size?: number;
  propertyRightsAndDuties?: string;
  cadastralIncome?: number; // Decimal in Prisma mapped to number/string
  censusArea?: string;
  subArea?: string;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  floor?: { id: string; name: string; code: string };
  building?: { id: string; name: string; code: string };
  complex?: { id: string; name: string; code: string };
  rooms?: { id: string; name: string; code: string }[];
  photos?: { id: string; url: string }[];
}

export interface QueryZoneDto {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  type?: string;
  floorId?: string;
  buildingId?: string;
  complexId?: string;
}

export interface PaginatedZoneResponseDto {
  data: ZoneResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
