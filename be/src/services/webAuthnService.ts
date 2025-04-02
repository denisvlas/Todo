import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { generateChallenge } from "@simplewebauthn/server/helpers";
import { WEBAUTHN_CONFIG } from "../config/constants";
import { userModel } from "../models/userModel";
import { log } from "console";

// Poate fi înlocuit cu Redis sau o soluție de memorare distribuită pentru producție
const registrationChallenges: Record<
  string,
  { username: string; challenge: string }
> = {};

export const webAuthnService = {
  generateAuthOptions: async (
    allowCredentials: Array<{ id: string; type: string }>
  ) => {
    const challenge = await generateChallenge();
    return generateAuthenticationOptions({
      rpID: WEBAUTHN_CONFIG.RPID,
      allowCredentials,
      challenge,
      timeout: WEBAUTHN_CONFIG.TIMEOUT,
      userVerification: "preferred",
    });
  },

  verifyAuthResponse: async (
    response: any,
    expectedChallenge: string,
    credential: { id: string; publicKey: Buffer; counter: number }
  ) => {
    return verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: WEBAUTHN_CONFIG.ORIGIN,
      expectedRPID: WEBAUTHN_CONFIG.RPID,
      credential,
    });
  },

  generateRegOptions: async (userId: string, username: string) => {
    return generateRegistrationOptions({
      rpName: WEBAUTHN_CONFIG.APP_NAME,
      rpID: WEBAUTHN_CONFIG.RPID,
      userID: new TextEncoder().encode(userId),
      userName: username,
      attestationType: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "discouraged",
        userVerification: "preferred",
        requireResidentKey: false,
      },
      supportedAlgorithmIDs: [-7, -257],
      timeout: WEBAUTHN_CONFIG.TIMEOUT,
    });
  },

  verifyRegResponse: async (response: any, expectedChallenge: string) => {
    return verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: WEBAUTHN_CONFIG.ORIGIN,
      expectedRPID: WEBAUTHN_CONFIG.RPID,
    });
  },

  storeRegistrationChallenge: (
    userId: string,
    username: string,
    challenge: string
  ) => {
    registrationChallenges[userId] = { username, challenge };
  },

  getRegistrationChallenge: (userId: string) => {
    const data = registrationChallenges[userId];
    return data;
  },

  removeRegistrationChallenge: (userId: string) => {
    delete registrationChallenges[userId];
  },
};


export const passwordAuthService = {
  register: async (project_id:string,username: string, password: string) => {
    // Verifică dacă utilizatorul există deja
    const existingUser = await userModel.checkUser(username,project_id);

    if (existingUser) {
      // Dacă utilizatorul există dar nu are parolă, adaugă parola
      if (!(await userModel.hasPassword(existingUser.user_id))) {
        await userModel.updatePassword(existingUser.user_id, password);
        return { success: true, userId: existingUser.user_id, isExisting: true };
      }
      throw new Error("User already exists");
    }

    // Creează utilizator nou cu parolă
    const user = await userModel.createWithPassword(project_id,username, password);
    return { success: true, user, isExisting: false };
  }, 


  login: async (username: string, password: string) => {
    // Verifică dacă utilizatorul există
    const user = await userModel.findByUsername(username);
    log("User found: ", user);
    if (!user) {
      throw new Error("Invalid username or password");
    }
    // Verifică parola
    const isValid = await userModel.verifyPassword(username, password,user.project_id);
    if (!isValid) {
      throw new Error("Invalid username or password");
    }

    return {
      success: true,
      userId: user.user_id,
      project_id:user.project_id,
      username: user.username,
      role:user.role,
    };
  },
};
