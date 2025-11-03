import type { Message } from 'discord.js';
import type { Command } from '../types/command.js';
import { queueService } from '../index.js';

export const shuffle: Command = {
  name: 'shuffle',
  description: 'Activa/desactiva el modo aleatorio',
  execute: async (message: Message, args: string[]) => {
    if (!message.guildId) {
      await message.reply('Este comando solo funciona en servidores.');
      return;
    }

    const shuffleEnabled = queueService.toggleShuffle(message.guildId);

    if (shuffleEnabled) {
      await message.reply('🔀 Modo aleatorio activado.');
    } else {
      await message.reply('▶️ Modo aleatorio desactivado.');
    }
  },
};
