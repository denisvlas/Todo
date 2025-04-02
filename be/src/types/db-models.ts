export interface DBUser {
  user_id: string;
  username: string;
  project_id: string;
  role: string;
  password_hash?: string;
  current_challenge?: string;
}

export interface DBCredential {
  credential_id: string;
  user_id: string;
  public_key: Buffer;
  counter: number;
  created_at: Date;
}

