import express from "express";
import cors from "cors";

import {
  authVerify,
  getAuthMethods,
  getAuthOptions,
  getRegOptions,
  loginPassword,
  registerPassword,
  regVerify,
} from "./src/services/webAuthnController";

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    credentials: true,
  })
);
app.use(express.json());

app.post("/auth/generate-options", getAuthOptions);
app.post("/auth/auth-verify", authVerify);
app.post("/auth/register-options", getRegOptions);
app.post("/auth/register-verify", regVerify);
app.post("/auth/register-password", registerPassword);
app.post("/auth/login-password", loginPassword);
app.post("/auth/methods", getAuthMethods);
app.listen(3001, () => console.log("Server running on http://localhost:3001"));
