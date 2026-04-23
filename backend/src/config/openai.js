import OpenAI from "openai";
import { env } from "./env.js";

export const openai = new OpenAI({ apiKey: env.openai.apiKey });
export const OPENAI_MODEL = env.openai.model;
