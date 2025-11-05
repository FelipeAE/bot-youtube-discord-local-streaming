import type { Message } from 'discord.js';
import type { Command } from '../types/command.js';
import { audioService } from '../index.js';

export const pause: Command = {
  name: 'pause',
  description: 'Pausa la reproducción actual',
  execute: async (message: Message, args: string[]) => {
    if (!message.guildId) {
      await message.reply('Este comando solo funciona en servidores.');
      return;
    }

    const success = audioService.pause(message.guildId);

    if (success) {
      const reply = await message.reply('⏸️ Reproducción pausada.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    } else {
      const reply = await message.reply('No hay nada reproduciéndose actualmente.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    }
  },
};
