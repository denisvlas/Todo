import { AuthenticationResponseJSON, WebAuthnCredential } from "@simplewebauthn/server";

export interface UserData {
  user_id: string;
  username: string;
  challenge?: string;
  credential?: WebAuthnCredential;
  credentials?: any[];
  passwordHash?: string;  // Store the hashed password here, never the raw password

}

export interface GenerateOptionsRequest {
  username: string;
}

export interface VerifyAuthRequest {
  username: string;
  response: AuthenticationResponseJSON;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
}