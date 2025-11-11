import type { Message } from 'discord.js';
import { GuildMember } from 'discord.js';
import type { Command } from '../types/command.js';
import { favoritesService, queueService, audioService } from '../index.js';

export const playfavorite: Command = {
  name: 'playfavorite',
  description: 'Reproduce un favorito por su número de índice',
  aliases: ['pf', 'playf'],
  execute: async (message: Message, args: string[]) => {
    const guildId = message.guildId!;
    const userId = message.author.id;

    if (!args[0]) {
      await message.reply('⚠️ Debes especificar el número del favorito a reproducir.\nEjemplo: `!playfavorite 3`');
      return;
    }

    const member = message.member as GuildMember;
    const voiceChannel = member?.voice.channel;

    if (!voiceChannel) {
      await message.reply('⚠️ Debes estar en un canal de voz para reproducir música.');
      return;
    }

    const index = parseInt(args[0]);

    if (isNaN(index) || index < 1) {
      await message.reply('⚠️ El número debe ser un valor positivo.\nEjemplo: `!playfavorite 3`');
      return;
    }

    try {
      const total = favoritesService.getFavoritesCount(guildId, userId);

      if (total === 0) {
        await message.reply('📭 No tienes favoritos guardados. Usa `!favorite` mientras reproduces una canción.');
        return;
      }

      if (index > total) {
        await message.reply(`⚠️ Solo tienes ${total} favorito${total !== 1 ? 's' : ''}. Usa un número entre 1 y ${total}.`);
        return;
      }

      // Obtener favorito por índice
      const favorite = favoritesService.getFavoriteByIndex(guildId, userId, index);

      if (!favorite) {
        await message.reply('❌ No se pudo encontrar el favorito. Intenta de nuevo.');
        return;
      }

      // Convertir favorito a Song
      const song = favoritesService.favoriteToSong(favorite, message.author.tag);

      const state = queueService.getQueue(guildId);

      // Detener reproducción actual si existe
      if (state.isPlaying) {
        audioService.stop(guildId);
      }

      // Limpiar cola y agregar la canción
      queueService.clearQueue(guildId);
      queueService.addSong(guildId, song);

      // Iniciar reproducción
      await audioService.joinChannel(voiceChannel);

      // Guardar referencia del canal para que AudioService envíe los botones
      state.playerChannelId = message.channel.id;

      await audioService.play(guildId);

      const reply = await message.reply(`⭐ **Reproduciendo favorito:**\n${song.title}`);

      // Auto-eliminar mensaje después de 5 segundos
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 5000);

    } catch (error) {
      console.error('Error en comando playfavorite:', error);
      await message.reply('❌ Ocurrió un error al reproducir el favorito.');
    }
  }
};
