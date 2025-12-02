export interface AccessTokenPayload {
  userId: string;
  email: string;
  roleId: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
  type: 'refresh';
}
