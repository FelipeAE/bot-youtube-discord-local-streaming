import type { Message } from 'discord.js';

export interface Command {
  name: string;
  description: string;
  aliases?: string[];
  execute: (message: Message, args: string[]) => Promise<void>;
}
