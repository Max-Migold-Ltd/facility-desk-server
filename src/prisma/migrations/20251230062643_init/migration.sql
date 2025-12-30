-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('NONE', 'READ', 'WRITE');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Criticality" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "MainUse" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'CULTURAL', 'OFFICE', 'RECREATIONAL', 'WAREHOUSE', 'EDUCATIONAL');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('APARTMENT', 'HOUSE', 'OFFICE', 'SHOP', 'GARAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "SiteType" AS ENUM ('BUILDING', 'COMPLEX', 'FLOOR', 'UNIT', 'ROOM');

-- CreateEnum
CREATE TYPE "RoomUse" AS ENUM ('OFFICE', 'DEPOT', 'CANTEEN', 'CELLAR', 'TOILET', 'MEETING_ROOM', 'TECHNICAL_ROOM', 'LABORATORY');

-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('IN_USE', 'VACANT', 'UNDER_CONSTRUCTION', 'RENT');

-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('CORPORATE_GROUP', 'CUSTOMER', 'SUPPLIER');

-- CreateEnum
CREATE TYPE "EmployeeType" AS ENUM ('CUSTOMER_EMPLOYEE', 'EXTERNAL_EMPLOYEE', 'INTERNAL_EMPLOYEE', 'SUPPLIER_EMPLOYEE');

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MaintenanceType" AS ENUM ('PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'EMERGENCY', 'INSPECTION', 'CALIBRATION', 'SMALL_PROJECT', 'SOFT_SERVICE');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProcessType" AS ENUM ('MAINTENANCE', 'CORRECTIVE');

-- CreateEnum
CREATE TYPE "AssetCategoryType" AS ENUM ('DEVICES', 'FINISHINGS', 'ITEMS', 'MACHINERIES');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "passwordResetToken" TEXT,
    "passwordExpiresAt" TIMESTAMP(3),
    "passwordResetAt" TIMESTAMP(3),
    "employeeCode" TEXT,
    "employeeType" "EmployeeType" DEFAULT 'CUSTOMER_EMPLOYEE',
    "companyId" TEXT,
    "serviceStatus" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "calenderEntityId" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "climateZone" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complexes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "availability" "Availability" NOT NULL DEFAULT 'IN_USE',
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "calenderEntityId" TEXT,
    "address" TEXT,
    "city" TEXT,
    "zipCode" TEXT,
    "condition" "Condition" NOT NULL DEFAULT 'GOOD',
    "criticality" "Criticality" NOT NULL DEFAULT 'LOW',
    "totalBuildings" INTEGER,
    "totalFloors" INTEGER,
    "totalUnits" INTEGER,
    "totalRooms" INTEGER,
    "glazedArea" DOUBLE PRECISION,
    "cleanableArea" DOUBLE PRECISION,
    "coveredArea" DOUBLE PRECISION,
    "totalNetArea" DOUBLE PRECISION,
    "totalGrossArea" DOUBLE PRECISION,
    "totalHeatedVolume" DOUBLE PRECISION,
    "totalVolume" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "siteId" TEXT,

    CONSTRAINT "complexes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "mainUse" "MainUse" NOT NULL DEFAULT 'RESIDENTIAL',
    "availability" "Availability" NOT NULL DEFAULT 'IN_USE',
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "condition" "Condition" NOT NULL DEFAULT 'GOOD',
    "criticality" "Criticality" NOT NULL DEFAULT 'LOW',
    "totalFloors" INTEGER,
    "totalUnits" INTEGER,
    "totalRooms" INTEGER,
    "glazedArea" DOUBLE PRECISION,
    "cleanableArea" DOUBLE PRECISION,
    "coveredArea" DOUBLE PRECISION,
    "totalNetArea" DOUBLE PRECISION,
    "totalGrossArea" DOUBLE PRECISION,
    "totalHeatedVolume" DOUBLE PRECISION,
    "totalVolume" DOUBLE PRECISION,
    "addressId" TEXT NOT NULL,
    "complexId" TEXT NOT NULL,
    "calenderEntityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floors" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "type" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "condition" "Condition" NOT NULL DEFAULT 'GOOD',
    "criticality" "Criticality" NOT NULL DEFAULT 'LOW',
    "complexId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "totalUnits" INTEGER,
    "totalRooms" INTEGER,
    "glazedArea" DOUBLE PRECISION,
    "cleanableArea" DOUBLE PRECISION,
    "coveredArea" DOUBLE PRECISION,
    "totalNetArea" DOUBLE PRECISION,
    "totalGrossArea" DOUBLE PRECISION,
    "totalHeatedVolume" DOUBLE PRECISION,
    "totalVolume" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "availability" "Availability" NOT NULL DEFAULT 'IN_USE',
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "calenderEntityId" TEXT,
    "complexId" TEXT,
    "buildingId" TEXT,
    "floorId" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "zipCode" TEXT,
    "totalRooms" INTEGER,
    "glazedArea" DOUBLE PRECISION,
    "cleanableArea" DOUBLE PRECISION,
    "coveredArea" DOUBLE PRECISION,
    "totalNetArea" DOUBLE PRECISION,
    "totalGrossArea" DOUBLE PRECISION,
    "totalHeatedVolume" DOUBLE PRECISION,
    "totalVolume" DOUBLE PRECISION,
    "cadastralArea" DOUBLE PRECISION,
    "urbanSection" TEXT,
    "sheet" TEXT,
    "plot" TEXT,
    "subordinate" TEXT,
    "class" INTEGER,
    "size" DOUBLE PRECISION,
    "propertyRightsAndDuties" TEXT,
    "cadastralIncome" DECIMAL(65,30),
    "censusArea" TEXT,
    "subArea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "use" "RoomUse" NOT NULL DEFAULT 'OFFICE',
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "calenderEntityId" TEXT,
    "complexId" TEXT,
    "buildingId" TEXT,
    "floorId" TEXT NOT NULL,
    "zoneId" TEXT,
    "condition" "Condition" NOT NULL DEFAULT 'GOOD',
    "criticality" "Criticality" NOT NULL DEFAULT 'LOW',
    "glazedArea" DOUBLE PRECISION,
    "cleanableArea" DOUBLE PRECISION,
    "coveredArea" DOUBLE PRECISION,
    "totalNetArea" DOUBLE PRECISION,
    "totalGrossArea" DOUBLE PRECISION,
    "height" INTEGER,
    "heated" BOOLEAN NOT NULL DEFAULT false,
    "totalVolume" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AssetType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asset_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AssetCategoryType" NOT NULL DEFAULT 'DEVICES',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asset_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "tag" TEXT,
    "parentSystemId" TEXT,
    "spaceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "maintenanceId" TEXT,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "CompanyType" NOT NULL DEFAULT 'CORPORATE_GROUP',
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "addressId" TEXT NOT NULL,
    "phone" TEXT,
    "alternativePhone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ServiceStatus" NOT NULL DEFAULT 'ACTIVE',
    "supervisorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calender_entities" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calender_entities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "id" TEXT NOT NULL,
    "type" "MaintenanceType" NOT NULL DEFAULT 'PREVENTIVE',
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "shortDescription" TEXT,
    "action" TEXT,
    "message" TEXT,
    "processNotes" TEXT,
    "metadata" JSONB,
    "performerId" TEXT,
    "processStatus" "Status" NOT NULL DEFAULT 'PENDING',
    "register" TEXT,
    "activityIdTimer" TEXT,
    "activityStartTime" TIMESTAMP(3),
    "activityEndTime" TIMESTAMP(3),
    "allDeadlines" TEXT,
    "processType" "ProcessType" NOT NULL DEFAULT 'CORRECTIVE',
    "ttSysRunning" DECIMAL(65,30),
    "ttWorkRunning" DECIMAL(65,30),
    "sorting" TEXT,
    "requesterId" TEXT,
    "priority" "Priority" NOT NULL DEFAULT 'LOW',
    "siteId" TEXT NOT NULL,
    "outcome" TEXT,
    "dueAssignedEnd" TIMESTAMP(3),
    "execStart" TIMESTAMP(3),
    "dueExecEndDate" TIMESTAMP(3),
    "execEndDate" TIMESTAMP(3),
    "dueClosuerDate" TIMESTAMP(3),
    "totalExecTime" DECIMAL(65,30),
    "expStartDate" TIMESTAMP(3),
    "suspensionReason" TEXT,
    "category" TEXT,
    "subCategory" TEXT,
    "companyId" TEXT,
    "teamId" TEXT,
    "floorId" TEXT,
    "spaceId" TEXT,
    "ttSystemOpening" DECIMAL(65,30),
    "ttWorkOpening" DECIMAL(65,30),
    "ttSystemAssignment" DECIMAL(65,30),
    "ttWorkAssignment" DECIMAL(65,30),
    "ttSystemExecution" DECIMAL(65,30),
    "ttWorkExecution" DECIMAL(65,30),
    "ttSysSuspension" DECIMAL(65,30),
    "ttWorkSuspension" DECIMAL(65,30),
    "ttEstimate" DECIMAL(65,30),
    "prevMaintenanceConfigId" TEXT,
    "automaticConfig" BOOLEAN NOT NULL DEFAULT true,
    "jointAccounting" BOOLEAN NOT NULL DEFAULT false,
    "hasTasks" BOOLEAN NOT NULL DEFAULT false,
    "estimateStatus" "Status" NOT NULL DEFAULT 'PENDING',
    "delayNotification" BOOLEAN NOT NULL DEFAULT false,
    "assigneeId" TEXT,
    "assetId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Maintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preventives" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "frequency" "Frequency" NOT NULL DEFAULT 'MONTHLY',
    "cronExpression" TEXT,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3) NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "duration" INTEGER,
    "siteId" TEXT NOT NULL,
    "assetId" TEXT,
    "buildingId" TEXT,
    "floorId" TEXT,
    "spaceId" TEXT,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preventives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ComplexToFile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ComplexToFile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BuildingToFile" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BuildingToFile_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FileToSpace" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FileToSpace_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FileToZone" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FileToZone_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TeamToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TeamToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeCode_key" ON "users"("employeeCode");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "roles_name_idx" ON "roles"("name");

-- CreateIndex
CREATE INDEX "permissions_roleId_idx" ON "permissions"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_roleId_resource_key" ON "permissions"("roleId", "resource");

-- CreateIndex
CREATE INDEX "user_permissions_userId_idx" ON "user_permissions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_userId_resource_key" ON "user_permissions"("userId", "resource");

-- CreateIndex
CREATE UNIQUE INDEX "complexes_code_key" ON "complexes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_complexId_code_key" ON "buildings"("complexId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "floors_buildingId_code_key" ON "floors"("buildingId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "zones_floorId_code_key" ON "zones"("floorId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "spaces_floorId_buildingId_code_key" ON "spaces"("floorId", "buildingId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "AssetType_name_key" ON "AssetType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "asset_categories_name_key" ON "asset_categories"("name");

-- CreateIndex
CREATE INDEX "asset_categories_type_idx" ON "asset_categories"("type");

-- CreateIndex
CREATE INDEX "asset_categories_name_idx" ON "asset_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "assets_tag_key" ON "assets"("tag");

-- CreateIndex
CREATE INDEX "assets_name_idx" ON "assets"("name");

-- CreateIndex
CREATE UNIQUE INDEX "files_url_key" ON "files"("url");

-- CreateIndex
CREATE UNIQUE INDEX "companies_code_key" ON "companies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "teams_code_key" ON "teams"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_code_key" ON "Contract"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Maintenance_code_key" ON "Maintenance"("code");

-- CreateIndex
CREATE UNIQUE INDEX "preventives_code_key" ON "preventives"("code");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_userId_idx" ON "refresh_tokens"("userId");

-- CreateIndex
CREATE INDEX "_ComplexToFile_B_index" ON "_ComplexToFile"("B");

-- CreateIndex
CREATE INDEX "_BuildingToFile_B_index" ON "_BuildingToFile"("B");

-- CreateIndex
CREATE INDEX "_FileToSpace_B_index" ON "_FileToSpace"("B");

-- CreateIndex
CREATE INDEX "_FileToZone_B_index" ON "_FileToZone"("B");

-- CreateIndex
CREATE INDEX "_TeamToUser_B_index" ON "_TeamToUser"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_calenderEntityId_fkey" FOREIGN KEY ("calenderEntityId") REFERENCES "calender_entities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complexes" ADD CONSTRAINT "complexes_calenderEntityId_fkey" FOREIGN KEY ("calenderEntityId") REFERENCES "calender_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complexes" ADD CONSTRAINT "complexes_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "complexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_calenderEntityId_fkey" FOREIGN KEY ("calenderEntityId") REFERENCES "calender_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "complexes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_calenderEntityId_fkey" FOREIGN KEY ("calenderEntityId") REFERENCES "calender_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "complexes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "zones" ADD CONSTRAINT "zones_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_calenderEntityId_fkey" FOREIGN KEY ("calenderEntityId") REFERENCES "calender_entities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_complexId_fkey" FOREIGN KEY ("complexId") REFERENCES "complexes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "asset_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_parentSystemId_fkey" FOREIGN KEY ("parentSystemId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_maintenanceId_fkey" FOREIGN KEY ("maintenanceId") REFERENCES "Maintenance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teams" ADD CONSTRAINT "teams_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_performerId_fkey" FOREIGN KEY ("performerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "complexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Maintenance" ADD CONSTRAINT "Maintenance_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventives" ADD CONSTRAINT "preventives_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "complexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventives" ADD CONSTRAINT "preventives_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventives" ADD CONSTRAINT "preventives_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventives" ADD CONSTRAINT "preventives_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventives" ADD CONSTRAINT "preventives_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preventives" ADD CONSTRAINT "preventives_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComplexToFile" ADD CONSTRAINT "_ComplexToFile_A_fkey" FOREIGN KEY ("A") REFERENCES "complexes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComplexToFile" ADD CONSTRAINT "_ComplexToFile_B_fkey" FOREIGN KEY ("B") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildingToFile" ADD CONSTRAINT "_BuildingToFile_A_fkey" FOREIGN KEY ("A") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BuildingToFile" ADD CONSTRAINT "_BuildingToFile_B_fkey" FOREIGN KEY ("B") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToSpace" ADD CONSTRAINT "_FileToSpace_A_fkey" FOREIGN KEY ("A") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToSpace" ADD CONSTRAINT "_FileToSpace_B_fkey" FOREIGN KEY ("B") REFERENCES "spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToZone" ADD CONSTRAINT "_FileToZone_A_fkey" FOREIGN KEY ("A") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FileToZone" ADD CONSTRAINT "_FileToZone_B_fkey" FOREIGN KEY ("B") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamToUser" ADD CONSTRAINT "_TeamToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TeamToUser" ADD CONSTRAINT "_TeamToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
