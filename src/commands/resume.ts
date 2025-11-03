import type { Message } from 'discord.js';
import type { Command } from '../types/command.js';
import { audioService } from '../index.js';

export const resume: Command = {
  name: 'resume',
  description: 'Reanuda la reproducción pausada',
  aliases: ['r'],
  execute: async (message: Message, args: string[]) => {
    if (!message.guildId) {
      await message.reply('Este comando solo funciona en servidores.');
      return;
    }

    const success = audioService.resume(message.guildId);

    if (success) {
      await message.reply('▶️ Reproducción reanudada.');
    } else {
      await message.reply('No hay nada pausado actualmente.');
    }
  },
};
