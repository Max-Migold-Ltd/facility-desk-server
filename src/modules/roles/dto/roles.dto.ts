export interface RoleCreateInput {
    name: string;
    description?: string;
    isSystem?: boolean;
}

export interface RoleUpdateInput {
    name?: string;
    description?: string;
    isSystem?: boolean;
}