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
      const reply = await message.reply('▶️ Reproducción reanudada.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    } else {
      const reply = await message.reply('No hay nada pausado actualmente.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    }
  },
};
