import * as bcrypt from "bcryptjs";
import { Request, RequestHandler, Response } from "express";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { generateChallenge } from "@simplewebauthn/server/helpers";

import { UserData, GenerateOptionsRequest, VerifyAuthRequest } from "./types";
import { v4 as uuidv4 } from "uuid";
import pool from "./db";

// Configuration constants
const ORIGIN = "http://localhost:5173";
const RPID = "localhost";

// In-memory storage for registration challenges
const registrationChallenges: Record<
  string,
  { username: string; challenge: string }
> = {};

export const getAuthOptions: RequestHandler = async (
  req: Request<{}, {}, GenerateOptionsRequest>,
  res: Response
): Promise<void> => {
  const { username } = req.body;
  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (userResult.rows.length === 0) {
      res.status(400).json({ success: false, error: "User not found" });
      return;
    }

    const user = userResult.rows[0];
    const credentialsResult = await pool.query(
      "SELECT credential_id FROM user_credentials WHERE user_id = $1",
      [user.id]
    );

    const allowCredentials = credentialsResult.rows.map((row) => ({
      id: row.credential_id,
      type: "public-key",
    }));

    // Generate challenge and authentication options
    const challenge = await generateChallenge();
    const options = await generateAuthenticationOptions({
      rpID: RPID,
      allowCredentials: allowCredentials,
      challenge: challenge,
      timeout: 60000,
      userVerification: "preferred",
    });

    // Store the challenge as it appears in the options
    await pool.query(
      "UPDATE users SET current_challenge = $1 WHERE username = $2",
      [options.challenge, username]
    );

    console.log("Authentication options generated for user:", username);
    res.json(options);
  } catch (error) {
    console.error("Error generating auth options:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const authVerify: RequestHandler = async (
  req: Request<{}, {}, VerifyAuthRequest>,
  res: Response
): Promise<void> => {
  const { username, response } = req.body;
  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (userResult.rows.length === 0) {
      res.status(400).json({ success: false, error: "User not found" });
      return;
    }
    const user = userResult.rows[0];

    const credentialResult = await pool.query(
      "SELECT * FROM user_credentials WHERE credential_id = $1",
      [response.id]
    );

    if (credentialResult.rows.length === 0) {
      res.status(400).json({ success: false, error: "Credential not found" });
      return;
    }

    const credentialData = credentialResult.rows[0];

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: user.current_challenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RPID,
      credential: {
        id: credentialData.credential_id,
        publicKey: credentialData.public_key,
        counter: parseInt(credentialData.counter),
      },
    });

    if (verification.verified) {
      await pool.query(
        "UPDATE user_credentials SET counter = $1 WHERE credential_id = $2",
        [
          verification.authenticationInfo.newCounter,
          credentialData.credential_id,
        ]
      );
      res.json({ success: true, message: "Authenticated!" });
    } else {
      res.status(400).json({ success: false, error: "Verification failed" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const getRegOptions: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { username } = req.body;

  try {
    // Check if user already exists
    const userCheck = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    // If user exists and already has credentials, reject the registration
    if (userCheck.rows.length > 0) {
      const credentialCheck = await pool.query(
        "SELECT * FROM user_credentials WHERE user_id = $1 LIMIT 1",
        [userCheck.rows[0].id]
      );

      if (credentialCheck.rows.length > 0) {
        res.status(400).json({
          success: false,
          error: "Username already exists with registered fingerprint",
        });
        return;
      }
    }

    // Generate temporary user ID (will only persist if registration completes)
    const tempUserId =
      userCheck.rows.length > 0 ? userCheck.rows[0].id : uuidv4();

    // Generate registration options
    /**
     * 
     */
    const options = await generateRegistrationOptions({
      rpName: "My Application",
      rpID: RPID,
      userID: new TextEncoder().encode(tempUserId),
      userName: username,
      attestationType: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "discouraged",
        userVerification: "preferred",
        requireResidentKey: false,
      },
      supportedAlgorithmIDs: [-7, -257],
      timeout: 60000,
    });

    // Store challenge in temp table or update existing user
    if (userCheck.rows.length > 0) {
      // User exists, update challenge
      await pool.query(
        "UPDATE users SET current_challenge = $1 WHERE id = $2",
        [options.challenge, tempUserId]
      );
    } else {
      registrationChallenges[tempUserId] = {
        username: username,
        challenge: options.challenge,
      };
      console.log("Creating temp user:", tempUserId);
    }

    // Return options with the tempUserId for later verification
    res.json({ ...options, tempUserId });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const regVerify: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { username, response, tempUserId } = req.body;

  try {
    if (!username || !response || !tempUserId) {
      res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
      return;
    }

    let expectedChallenge: string;
    let isExistingUser = false;
    let userId: string;

    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (userResult.rows.length > 0) {
      // Existing user
      isExistingUser = true;
      userId = userResult.rows[0].id;
      expectedChallenge = userResult.rows[0].current_challenge || "";
    } else {
      // New user - get from memory storage
      if (
        !registrationChallenges[tempUserId] ||
        registrationChallenges[tempUserId].username !== username
      ) {
        throw new Error("Invalid or expired registration session");
      }
      expectedChallenge = registrationChallenges[tempUserId].challenge;
      userId = tempUserId;
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: expectedChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RPID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new Error("Registration verification failed");
    }

    if (!isExistingUser) {
      await pool.query("INSERT INTO users (id, username) VALUES ($1, $2)", [
        userId,
        username,
      ]);

      // Clear temp registration data
      delete registrationChallenges[tempUserId];
    }

    const credentialId = verification.registrationInfo.credential.id;
    const publicKey = verification.registrationInfo.credential.publicKey;
    const counter = verification.registrationInfo.credential.counter;

    await pool.query(
      "INSERT INTO user_credentials (credential_id, user_id, public_key, counter) VALUES ($1, $2, $3, $4)",
      [credentialId, userId, publicKey, counter]
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const regPass: RequestHandler = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // Generate a salt and hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    res.json({
      success: true,
      message: "Password registration successful",
      password: passwordHash,
    });
  } catch (error) {
    console.error("Password registration error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const loginPass: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { username, password } = req.body;

  try {
    // This function is currently not implemented
    res.status(501).json({
      success: false,
      error: "Password authentication not implemented",
    });
  } catch (error) {
    console.error("Password login error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
