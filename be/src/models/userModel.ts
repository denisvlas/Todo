import pool from "../config/db";
import { DBUser } from "../types/db-models";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export const userModel = {
  getUserId: async (username: string): Promise<DBUser | null> => {
    const result = await pool.query(
      "SELECT user_id FROM users WHERE username = $1",
      [username]
    );

    return result.rows.length > 0 ? result.rows[0].id : null;
  },
  findByUsername: async (username: string): Promise<DBUser | null> => {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    return result.rows.length > 0 ? result.rows[0] : null;
  },

  checkUser: async (
    username: string,
    projectId: string
  ): Promise<DBUser | null> => {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 and project_id = $2",
      [username, projectId]
    );
    console.log(username, projectId);

    return result.rows.length > 0 ? result.rows[0] : null;
  },

  create: async (user: DBUser): Promise<void> => {
    await pool.query(
      "INSERT INTO users (user_id, username, role, project_id) VALUES ($1, $2, $3, $4)",
      [user.user_id, user.username, user.role, user.project_id]
    );
  },

  updateChallenge: async (userId: string, challenge: string): Promise<void> => {
    await pool.query(
      "UPDATE users SET current_challenge = $1 WHERE user_id = $2",
      [challenge, userId]
    );
  },

  createWithPassword: async (
    project_id: string,
    username: string,
    password: string
  ): Promise<DBUser> => {
    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const role = "user";
    await pool.query(
      "INSERT INTO users (user_id, project_id, username, password_hash, role) VALUES ($1, $2, $3, $4, $5)",
      [userId, project_id, username, passwordHash, role]
    );

    return { user_id: userId, username, project_id, role: role };
  },

  verifyPassword: async (
    username: string,
    password: string,
    projectId: string
  ): Promise<boolean> => {
    const result = await pool.query(
      "SELECT * FROM users WHERE username = $1 and project_id = $2",
      [username, projectId]
    );
    console.log("result", result.rows);

    if (result.rows.length === 0 || !result.rows[0].password_hash) {
      return false;
    }

    return bcrypt.compare(password, result.rows[0].password_hash);
  },

  hasPassword: async (userId: string): Promise<boolean> => {
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE user_id = $1",
      [userId]
    );

    return result.rows.length > 0 && !!result.rows[0].password_hash;
  },

  updatePassword: async (userId: string, password: string): Promise<void> => {
    // Implementation to update password for existing user
    const passwordHash = await bcrypt.hash(password, 10);
    await pool.query("UPDATE users SET password_hash = $1 WHERE user_id = $2", [
      passwordHash,
      userId,
    ]);
  },

  hasFingerprint: async (userId: string): Promise<boolean> => {
    const result = await pool.query(
      "SELECT COUNT(*) FROM user_credentials WHERE user_id = $1",
      [userId]
    );

    return parseInt(result.rows[0].count) > 0;
  },

  getAuthMethods: async (
    username: string,
    projectId: string
  ): Promise<{ hasPassword: boolean; hasFingerprint: boolean }> => {
    const user = await userModel.checkUser(username, projectId);
    if (!user) {
      return { hasPassword: false, hasFingerprint: false };
    }

    const hasPassword = await userModel.hasPassword(user.user_id);
    const hasFingerprint = await userModel.hasFingerprint(user.user_id);

    return { hasPassword, hasFingerprint };
  },
};
