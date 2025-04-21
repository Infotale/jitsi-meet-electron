import { TokenSet } from "openid-client";

export interface UserToAuth {
  upn: string;
  gender: "male" | "female";
  name: string;
  password: string;
}

export type User = Omit<UserToAuth, "password">;

/**
 * Represents a form with various metadata and fields.
 */
export interface Role {
  _id: string;
  role_id: number;
  roleName: string;
  role_description: string;
  permission_types: number[];
}

export interface SSOUser {
  sub: string;
  email?: string;
  name?: string;
  [key: string]: any;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  isValid: boolean;
}
