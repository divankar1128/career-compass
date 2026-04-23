import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signAccess = (payload) =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpires });

export const signRefresh = (payload) =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpires });

export const verifyAccess = (token) => jwt.verify(token, env.jwt.accessSecret);
export const verifyRefresh = (token) => jwt.verify(token, env.jwt.refreshSecret);
