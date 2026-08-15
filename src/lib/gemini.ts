import { GoogleGenAI } from "@google/genai";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error(
    "GOOGLE_API_KEY is not set. Add it to .env.local"
  );
}

export const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export const GEMINI_MODEL = "gemini-3.5-flash-lite";
