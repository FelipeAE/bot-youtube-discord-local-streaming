import type { Message } from 'discord.js';
import { GuildMember } from 'discord.js';
import type { Command } from '../types/command.js';
import { favoritesService, queueService, audioService } from '../index.js';

export const queuefavorites: Command = {
  name: 'queuefavorites',
  description: 'Agrega todos tus favoritos a la cola de reproducción',
  aliases: ['qf', 'qfavs', 'addfavs'],
  execute: async (message: Message, args: string[]) => {
    const guildId = message.guildId!;
    const userId = message.author.id;

    const member = message.member as GuildMember;
    const voiceChannel = member?.voice.channel;

    if (!voiceChannel) {
      await message.reply('⚠️ Debes estar en un canal de voz para reproducir música.');
      return;
    }

    try {
      // Obtener todos los favoritos del usuario
      const favorites = favoritesService.getFavorites(guildId, userId);

      if (favorites.length === 0) {
        await message.reply('📭 No tienes favoritos guardados. Usa `!favorite` mientras reproduces una canción para agregarla.');
        return;
      }

      const loadingMessage = await message.reply(`⏳ Agregando ${favorites.length} favorito${favorites.length !== 1 ? 's' : ''} a la cola...`);

      // Convertir favoritos a canciones y agregarlas a la cola
      let addedCount = 0;
      for (const favorite of favorites) {
        try {
          const song = favoritesService.favoriteToSong(favorite, message.author.tag);
          queueService.addSong(guildId, song);
          addedCount++;
        } catch (error) {
          console.error(`Error agregando favorito: ${favorite.title}`, error);
        }
      }

      // Si no hay reproducción activa, iniciar
      const state = queueService.getQueue(guildId);
      const wasPlaying = state.isPlaying;

      if (!state.isPlaying && addedCount > 0) {
        await audioService.joinChannel(voiceChannel);

        // Guardar referencia del canal para que AudioService envíe los botones
        state.playerChannelId = message.channel.id;

        await audioService.play(guildId);
      }

      // Mensaje de confirmación
      let confirmMessage = `✅ **${addedCount} favorito${addedCount !== 1 ? 's' : ''} agregado${addedCount !== 1 ? 's' : ''} a la cola**`;

      if (!wasPlaying && addedCount > 0) {
        confirmMessage += '\n▶️ Reproducción iniciada';
      }

      if (addedCount < favorites.length) {
        confirmMessage += `\n⚠️ ${favorites.length - addedCount} canción${favorites.length - addedCount !== 1 ? 'es' : ''} no se pudo${favorites.length - addedCount !== 1 ? 'eron' : ''} agregar`;
      }

      await loadingMessage.edit(confirmMessage);

      // Auto-eliminar mensaje después de 8 segundos
      setTimeout(() => {
        loadingMessage.delete().catch(() => {});
      }, 8000);

    } catch (error) {
      console.error('Error en comando queuefavorites:', error);
      await message.reply('❌ Ocurrió un error al agregar los favoritos a la cola.');
    }
  }
};
