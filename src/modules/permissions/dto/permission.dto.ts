import { AccessLevel } from "../../../generated/prisma";

export interface PermissionCreateInput {
    roleId: string;
    resource: string;
    accessLevel: AccessLevel;
}

export interface PermissionUpdateInput {
    resourceId?: string;
    accessLevel?: AccessLevel;
}