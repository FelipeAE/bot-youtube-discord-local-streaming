import type { Message } from 'discord.js';
import type { Command } from '../types/command.js';
import { audioService, queueService } from '../index.js';

export const skip: Command = {
  name: 'skip',
  description: 'Salta a la siguiente canción',
  aliases: ['s', 'next'],
  execute: async (message: Message, args: string[]) => {
    if (!message.guildId) {
      await message.reply('Este comando solo funciona en servidores.');
      return;
    }

    const state = queueService.getQueue(message.guildId);

    if (!state.isPlaying) {
      await message.reply('No hay nada reproduciéndose actualmente.');
      return;
    }

    audioService.skip(message.guildId);
    await message.reply('⏭️ Canción saltada.');
  },
};
