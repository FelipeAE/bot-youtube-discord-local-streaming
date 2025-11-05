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
      const reply = await message.reply('🔀 Modo aleatorio activado.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    } else {
      const reply = await message.reply('▶️ Modo aleatorio desactivado.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    }
  },
};
