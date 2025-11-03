import dotenv from 'dotenv';
import type { BotConfig } from '../types/index.js';

dotenv.config();

if (!process.env.DISCORD_TOKEN) {
  throw new Error('DISCORD_TOKEN no está definido en las variables de entorno');
}

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY no está definido en las variables de entorno');
}

export const config: BotConfig = {
  token: process.env.DISCORD_TOKEN,
  geminiApiKey: process.env.GEMINI_API_KEY,
  maxSongDuration: 15 * 60, // 15 minutos en segundos
};
