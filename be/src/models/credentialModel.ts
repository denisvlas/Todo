import pool from "../config/db";
import { DBCredential } from "../types/db-models";

export const credentialModel = {
  findByUser: async (
    userId: string
  ): Promise<Pick<DBCredential, "credential_id">[]> => {
    const result = await pool.query(
      "SELECT credential_id FROM user_credentials WHERE user_id = $1",
      [userId]
    );
    return result.rows;
  },

  findById: async (credentialId: string): Promise<DBCredential | null> => {
    const result = await pool.query(
      "SELECT * FROM user_credentials WHERE credential_id = $1",
      [credentialId]
    );
    return result.rows.length > 0 ? result.rows[0] : null;
  },

  create: async (
    credentialId: string,
    userId: string,
    publicKey: Uint8Array<ArrayBufferLike>,
    counter: number
  ): Promise<void> => {
    await pool.query(
      "INSERT INTO user_credentials (credential_id, user_id, public_key, counter) VALUES ($1, $2, $3, $4)",
      [credentialId, userId, publicKey, counter]
    );
  },

  updateCounter: async (
    credentialId: string,
    counter: number
  ): Promise<void> => {
    await pool.query(
      "UPDATE user_credentials SET counter = $1 WHERE credential_id = $2",
      [counter, credentialId]
    );
  },

};
