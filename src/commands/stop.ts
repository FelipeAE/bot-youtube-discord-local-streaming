import type { Message } from 'discord.js';
import type { Command } from '../types/command.js';
import { audioService, queueService } from '../index.js';

export const stop: Command = {
  name: 'stop',
  description: 'Detiene la reproducción y limpia la cola',
  aliases: ['disconnect', 'dc'],
  execute: async (message: Message, args: string[]) => {
    if (!message.guildId) {
      await message.reply('Este comando solo funciona en servidores.');
      return;
    }

    const state = queueService.getQueue(message.guildId);

    if (!state.isPlaying) {
      const reply = await message.reply('No hay nada reproduciéndose actualmente.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return;
    }

    audioService.stop(message.guildId);
    queueService.clearQueue(message.guildId);

    const reply = await message.reply('⏹️ Reproducción detenida y cola limpiada.');
    setTimeout(() => reply.delete().catch(() => {}), 5000);
  },
};
