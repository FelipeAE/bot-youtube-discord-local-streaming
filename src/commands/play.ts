import type { Message } from 'discord.js';
import { GuildMember } from 'discord.js';
import type { Command } from '../types/command.js';
import { queueService, youtubeService, audioService } from '../index.js';
import { createPlayerButtons } from '../components/PlayerButtons.js';

export const play: Command = {
  name: 'play',
  description: 'Reproduce música desde YouTube (URL de video, playlist, o búsqueda por texto)',
  aliases: ['p'],
  execute: async (message: Message, args: string[]) => {
    if (!args[0]) {
      await message.reply('Por favor proporciona una URL de YouTube o el nombre de una canción.');
      return;
    }

    const member = message.member as GuildMember;
    const voiceChannel = member?.voice.channel;

    if (!voiceChannel) {
      await message.reply('Debes estar en un canal de voz para reproducir música.');
      return;
    }

    try {
      const query = args.join(' ');
      const guildId = message.guildId!;
      const state = queueService.getQueue(guildId);

      // Verificar si es una playlist
      const urlType = youtubeService.isValidYouTubeURL(query);

      if (urlType === 'playlist') {
        await message.reply('📋 Cargando playlist...');

        const songs = await youtubeService.getPlaylistVideos(query, message.author.tag, 500);

        if (!songs || songs.length === 0) {
          await message.reply('No se pudieron obtener videos de la playlist.');
          return;
        }

        // Agregar todas las canciones a la cola
        songs.forEach(song => queueService.addSong(guildId, song));

        const totalDuration = songs.reduce((acc, song) => acc + song.duration, 0);
        const hours = Math.floor(totalDuration / 3600);
        const minutes = Math.floor((totalDuration % 3600) / 60);

        await message.reply(
          `📋 **Playlist agregada:**\n` +
          `🎵 ${songs.length} canciones\n` +
          `⏱️ Duración total: ${hours > 0 ? `${hours}h ` : ''}${minutes}min\n` +
          `👤 Solicitado por: ${message.author.tag}`
        );

        if (!state.isPlaying) {
          await audioService.joinChannel(voiceChannel);
          await audioService.play(guildId);

          if (message.channel.isSendable()) {
            const playerButtons = createPlayerButtons();
            const playerMessage = await message.channel.send({
              content: `▶️ Reproduciendo: **${songs[0].title}**`,
              components: playerButtons
            });

            // Guardar referencia del mensaje de botones
            state.playerMessageId = playerMessage.id;
            state.playerChannelId = message.channel.id;
          }
        }
      } else {
        // Video individual o búsqueda
        await message.reply('🔍 Buscando...');

        const song = await youtubeService.searchVideo(query, message.author.tag);

        if (!song) {
          await message.reply('No se encontraron resultados. Intenta con otro término de búsqueda.');
          return;
        }

        queueService.addSong(guildId, song);

        const hours = Math.floor(song.duration / 3600);
        const minutes = Math.floor((song.duration % 3600) / 60);
        const seconds = song.duration % 60;

        const durationText = hours > 0
          ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          : `${minutes}:${seconds.toString().padStart(2, '0')}`;

        await message.reply(
          `🎵 **Agregado a la cola:** ${song.title}\n` +
          `⏱️ Duración: ${durationText}\n` +
          `📡 Modo: Streaming\n` +
          `👤 Solicitado por: ${song.requestedBy}`
        );

        if (!state.isPlaying) {
          await audioService.joinChannel(voiceChannel);
          await audioService.play(guildId);

          if (message.channel.isSendable()) {
            const playerButtons = createPlayerButtons();
            const playerMessage = await message.channel.send({
              content: `▶️ Reproduciendo: **${song.title}**`,
              components: playerButtons
            });

            // Guardar referencia del mensaje de botones
            state.playerMessageId = playerMessage.id;
            state.playerChannelId = message.channel.id;
          }
        }
      }
    } catch (error) {
      console.error('Error en comando play:', error);
      await message.reply('Ocurrió un error al intentar reproducir la canción.');
    }
  },
};
