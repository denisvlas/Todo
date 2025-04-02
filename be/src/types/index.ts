import { AuthenticationResponseJSON } from "@simplewebauthn/server";

export interface GenerateOptionsRequest {
  username: string;
  project_id: string;
}

export interface VerifyAuthRequest {
  username: string;
  response: AuthenticationResponseJSON;
  project_id: string;
}
export interface VerifyRegRequest {
  userId: string;
  username: string;
  response: AuthenticationResponseJSON;
  project_id: string;
}

export interface PasswordAuthRequest {
  project_id: string;
  username: string;
  password: string;
}
