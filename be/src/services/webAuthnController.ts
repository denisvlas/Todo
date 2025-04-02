import { Request, RequestHandler, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import {
  passwordAuthService,
  webAuthnService,
} from "../services/webAuthnService";
import { userModel } from "../models/userModel";
import { credentialModel } from "../models/credentialModel";
import {
  GenerateOptionsRequest,
  PasswordAuthRequest,
  VerifyAuthRequest,
  VerifyRegRequest,
} from "../types";

export const getAuthOptions: RequestHandler = async (
  req,
  res
): Promise<void> => {
  const { username } = req.body;
  try {
    const user = await userModel.findByUsername(username);
    if (!user) {
      res.status(400).json({ success: false, error: "User not found" });
      return;
    }

    const credentials = await credentialModel.findByUser(user.user_id);
    const allowCredentials = [
      {
        id: credentials[0].credential_id,
        type: "public-key",
      },
    ];
    const options = await webAuthnService.generateAuthOptions(allowCredentials);
    await userModel.updateChallenge(user.user_id, options.challenge);
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
    const user = await userModel.findByUsername(username);
    if (!user) {
      res.status(400).json({ success: false, error: "User not found" });
      return;
    }

    const credential = await credentialModel.findById(response.id);
    if (!credential) {
      res.status(400).json({ success: false, error: "Credential not found" });
      return;
    }

    const verification = await webAuthnService.verifyAuthResponse(
      response,
      user.current_challenge!,
      {
        id: credential.credential_id,
        publicKey: credential.public_key,
        counter: credential.counter,
      }
    );

    if (verification.verified) {
      await credentialModel.updateCounter(
        credential.credential_id,
        verification.authenticationInfo.newCounter
      );
      const userId = await userModel.getUserId(username);
      console.log("found id:", userId);

      res.json({
        // success: true,
        // message: "Authenticated!",
        // isAuthenticated: true,
        // userId: userId,
        success: true,
        message: "Login with fingerprint successful",
        user: {
          user_id: user.user_id,
          project_id: user.project_id,
          username: user.username,
          role: user.role,
          isAuthenticated: true,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: "Verification failed",
        authenticated: false,
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const getRegOptions: RequestHandler = async (
  req: Request<{}, {}, GenerateOptionsRequest>,
  res: Response
): Promise<void> => {
  const { username, project_id } = req.body;
  try {
    const userCheck = await userModel.checkUser(username, project_id);
    if (userCheck) {
      const credentialCheck = await credentialModel.findByUser(
        userCheck.user_id
      );
      if (credentialCheck.length > 0) {
        res
          .status(400)
          .json({ success: false, error: "User already registered" });
        return;
      }
    }

    const userId = uuidv4();
    const options = await webAuthnService.generateRegOptions(userId, username);
    if (userCheck) {
      await userModel.updateChallenge(userCheck.user_id, options.challenge);
    } else {
      webAuthnService.storeRegistrationChallenge(
        userId,
        username,
        options.challenge
      );
    }
    res.json({ ...options, userId });
  } catch (error) {
    console.error("Error generating registration options:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

export const regVerify: RequestHandler = async (
  req: Request<{}, {}, VerifyRegRequest>,
  res: Response
): Promise<void> => {
  const { username, response, userId, project_id } = req.body;

  console.log(
    `Processing registration verification for ${username} with userId ${userId} and project_id ${project_id}`
  );

  try {
    // Verifică dacă utilizatorul există deja (înregistrat cu parolă anterior)
    let user = await userModel.checkUser(username, project_id);
    let expectedChallenge: string;

    if (user) {
      console.log(`User ${username} already exists, using current_challenge`);
      expectedChallenge = user.current_challenge!;
    } else {
      // Utilizator nou sau a venit din flow-ul de înregistrare cu amprentă
      console.log(
        `New user or fingerprint-first registration, getting challenge from memory`
      );
      const storedChallenge = webAuthnService.getRegistrationChallenge(userId);

      if (!storedChallenge || storedChallenge.username !== username) {
        console.error(
          `No valid challenge found for ${username} with userId ${userId}`
        );
        res.status(400).json({
          success: false,
          error: "Invalid or expired registration session",
        });
        return;
      }

      expectedChallenge = storedChallenge.challenge;
    }

    // Verifică răspunsul WebAuthn
    console.log(`Verifying with challenge: "${expectedChallenge}"`);
    const verification = await webAuthnService.verifyRegResponse(
      response,
      expectedChallenge
    );

    if (!verification.verified || !verification.registrationInfo) {
      console.error("Verification failed:", verification);
      res.status(400).json({
        success: false,
        error: "Registration verification failed",
      });
      return;
    }

    // Dacă utilizatorul nu există (înregistrare cu amprentă întâi), creează-l
    if (!user) {
      console.log(`Creating new user ${username} with ID ${userId}`);
      user = {
        user_id: userId,
        username,
        role: "user",
        project_id: project_id,
      };
      console.log(`Creating new user ${user} `);
      await userModel.create(user);
      webAuthnService.removeRegistrationChallenge(userId);
    }

    // În ambele cazuri, stochează credențialul
    const finalUserId = user ? user.user_id : userId;
    const credentialId = verification.registrationInfo.credential.id;
    const publicKey = verification.registrationInfo.credential.publicKey;
    const counter = verification.registrationInfo.credential.counter;

    await credentialModel.create(credentialId, finalUserId, publicKey, counter);

    console.log(`Successfully registered fingerprint for ${username}`);
    res.json({
      success: true,
      message: "Registered successfully!",
      userId: finalUserId,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

export const getAuthMethods: RequestHandler = async (
  req: Request<{}, {}, { username: string; project_id: string }>,
  res: Response
): Promise<void> => {
  const { username, project_id } = req.body;

  if (!username) {
    res.status(400).json({
      success: false,
      error: "Username is required",
    });
    return;
  }

  try {
    const methods = await userModel.getAuthMethods(username, project_id);

    res.json({
      success: true,
      methods,
    });
  } catch (error) {
    console.error("Error retrieving auth methods:", error);
    res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};

export const registerPassword: RequestHandler = async (
  req: Request<{}, {}, PasswordAuthRequest>,
  res: Response
): Promise<void> => {
  const { username, password, project_id } = req.body;

  try {
    if (!username || !password) {
      res
        .status(400)
        .json({ success: false, error: "Username and password are required" });
      return;
    }

    const result = await passwordAuthService.register(
      project_id,
      username,
      password
    );
    const user = result.user!;
    res.json({
      success: true,
      message: "Registration successful",
      user: {
        user_id: user.user_id,
        username: user.username,
        project_id: user.project_id,
        role: user.role,
        isAuthenticated: true,
      },
    });
  } catch (error) {
    console.error("Password registration error:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Registration failed",
    });
  }
};

export const loginPassword: RequestHandler = async (
  req: Request<{}, {}, PasswordAuthRequest>,
  res: Response
): Promise<void> => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      res
        .status(400)
        .json({ success: false, error: "Username and password are required" });
      return;
    }

    const result = await passwordAuthService.login(username, password);
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        user_id: result.userId,
        project_id: result.project_id,
        username: result.username,
        isAuthenticated: true,
        role: result.role,
      },
    });
  } catch (error) {
    console.error("Password login error:", error);
    res.status(401).json({
      error: "Invalid username or password",
      success: false,
      // error: "Invalid username or password",
    });
  }
};
