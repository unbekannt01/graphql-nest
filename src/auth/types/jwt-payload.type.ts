export interface JwtPayloadType {
  id: number;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
  jti?: string;
}
