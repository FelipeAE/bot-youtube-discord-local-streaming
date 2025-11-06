import type { Message } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import type { Command } from '../types/command.js';
import { queueService } from '../index.js';
import { formatTime, createProgressBar, calculateElapsedTime } from '../utils/progressBar.js';

export const nowplaying: Command = {
  name: 'nowplaying',
  description: 'Muestra información de la canción actual con barra de progreso',
  aliases: ['np', 'current'],
  execute: async (message: Message, args: string[]) => {
    if (!message.guildId) {
      await message.reply('Este comando solo funciona en servidores.');
      return;
    }

    const state = queueService.getQueue(message.guildId);

    if (!state.currentSong || !state.isPlaying) {
      await message.reply('No hay ninguna canción reproduciéndose en este momento.');
      return;
    }

    const song = state.currentSong;

    // Calcular tiempo transcurrido
    const elapsedSeconds = calculateElapsedTime(
      state.songStartTime,
      state.isPaused,
      state.pausedAt,
      state.totalPausedTime
    );

    // Asegurar que el tiempo transcurrido no exceda la duración
    const clampedElapsed = Math.min(elapsedSeconds, song.duration);

    // Formatear tiempos
    const currentTime = formatTime(clampedElapsed);
    const totalTime = formatTime(song.duration);

    // Crear barra de progreso
    const progressBar = createProgressBar(clampedElapsed, song.duration);

    // Crear embed
    const embed = new EmbedBuilder()
      .setColor(state.isPaused ? '#FFA500' : '#0099ff') // Naranja si está pausado, azul si está reproduciéndose
      .setTitle('🎵 Reproduciendo Ahora')
      .setDescription(`**${song.title}**`)
      .addFields(
        {
          name: '⏱️ Progreso',
          value: `\`${currentTime}\` ${progressBar} \`${totalTime}\``,
          inline: false
        },
        {
          name: '👤 Solicitado por',
          value: song.requestedBy,
          inline: true
        },
        {
          name: '🔊 Volumen',
          value: `${state.volume}%`,
          inline: true
        }
      )
      .setTimestamp();

    // Agregar thumbnail si existe
    if (song.thumbnail) {
      embed.setThumbnail(song.thumbnail);
    }

    // Agregar URL como campo
    embed.addFields({
      name: '🔗 URL',
      value: song.url,
      inline: false
    });

    // Agregar footer con estado actual
    const statusEmojis: string[] = [];

    if (state.isPaused) {
      statusEmojis.push('⏸️ Pausado');
    }

    if (state.options.repeat === 'song') {
      statusEmojis.push('🔂 Repetir 1');
    } else if (state.options.repeat === 'queue') {
      statusEmojis.push('🔁 Repetir Cola');
    }

    if (state.options.shuffle) {
      statusEmojis.push('🔀 Aleatorio');
    }

    if (statusEmojis.length > 0) {
      embed.setFooter({ text: `Estado: ${statusEmojis.join(' • ')}` });
    }

    await message.reply({ embeds: [embed] });
  },
};
