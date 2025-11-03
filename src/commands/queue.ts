import type { Message } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import type { Command } from '../types/command.js';
import { queueService } from '../index.js';

export const queue: Command = {
  name: 'queue',
  description: 'Muestra la cola de reproducción',
  aliases: ['q', 'list'],
  execute: async (message: Message, args: string[]) => {
    if (!message.guildId) {
      await message.reply('Este comando solo funciona en servidores.');
      return;
    }

    const state = queueService.getQueue(message.guildId);

    if (!state.currentSong && state.queue.length === 0) {
      await message.reply('La cola está vacía.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('🎵 Cola de Reproducción')
      .setTimestamp();

    if (state.currentSong) {
      const durationMin = Math.floor(state.currentSong.duration / 60);
      const durationSec = state.currentSong.duration % 60;
      embed.addFields({
        name: '▶️ Reproduciendo Ahora',
        value: `**${state.currentSong.title}**\n⏱️ ${durationMin}:${durationSec.toString().padStart(2, '0')} | 👤 ${state.currentSong.requestedBy}`,
      });
    }

    if (state.queue.length > 0) {
      const queueList = state.queue
        .slice(0, 10)
        .map((song, index) => {
          const durationMin = Math.floor(song.duration / 60);
          const durationSec = song.duration % 60;
          return `**${index + 1}.** ${song.title}\n⏱️ ${durationMin}:${durationSec.toString().padStart(2, '0')} | 👤 ${song.requestedBy}`;
        })
        .join('\n\n');

      embed.addFields({
        name: `📋 Próximas Canciones (${state.queue.length})`,
        value: queueList + (state.queue.length > 10 ? `\n\n...y ${state.queue.length - 10} más` : ''),
      });
    }

    const statusEmojis = {
      repeat: state.options.repeat === 'song' ? '🔂' : state.options.repeat === 'queue' ? '🔁' : '',
      shuffle: state.options.shuffle ? '🔀' : '',
      paused: state.isPaused ? '⏸️' : '',
    };

    const status = Object.values(statusEmojis).filter(Boolean).join(' ');
    if (status) {
      embed.setFooter({ text: `Estado: ${status}` });
    }

    await message.reply({ embeds: [embed] });
  },
};
