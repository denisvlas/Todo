export enum TodoStatusType {
  incompleted = "todo",
  done = "done",
  progress = "progress",
}

import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/browser";
import { IUser } from "./mst/models/models/User.model";

export interface AuthResponse {
  success: boolean;
  message: string;
  error?: string;
  user: IUser &{isAuthenticated: boolean};
}


export type GenerateOptionsResponse = PublicKeyCredentialRequestOptionsJSON;
