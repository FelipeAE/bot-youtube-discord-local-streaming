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
      const reply = await message.reply('No hay nada reproduciéndose actualmente.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return;
    }

    const currentSong = state.currentSong;

    // Verificar si hay más canciones en la cola (considerando repeat)
    const hasNextSong = state.queue.length > 0 ||
                        state.options.repeat === 'song' ||
                        state.options.repeat === 'queue';

    if (!hasNextSong) {
      // No hay más canciones - detener y desconectar
      audioService.skip(message.guildId);
      const reply = await message.reply(
        `⏭️ **Saltado:** ${currentSong?.title || 'Canción desconocida'}\n\n⚠️ No hay más canciones en la cola. El bot se detendrá.`
      );
      setTimeout(() => reply.delete().catch(() => {}), 8000);
      return;
    }

    // Hay más canciones - skip normal
    audioService.skip(message.guildId);
    const reply = await message.reply(`⏭️ **Saltado:** ${currentSong?.title || 'Canción desconocida'}`);
    setTimeout(() => reply.delete().catch(() => {}), 5000);
  },
};
