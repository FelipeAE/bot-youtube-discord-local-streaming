import type { Message } from 'discord.js';
import type { Command } from '../types/command.js';
import { queueService, favoritesService } from '../index.js';

export const favorite: Command = {
  name: 'favorite',
  description: 'Agrega la canción actual a tus favoritos',
  aliases: ['fav', 'f'],
  execute: async (message: Message, args: string[]) => {
    const guildId = message.guildId!;
    const userId = message.author.id;
    const state = queueService.getQueue(guildId);

    // Verificar que haya una canción reproduciéndose
    if (!state.currentSong) {
      await message.reply('⚠️ No hay ninguna canción reproduciéndose actualmente.');
      return;
    }

    try {
      const song = state.currentSong;

      // Verificar si ya está en favoritos
      const isAlreadyFavorite = favoritesService.isFavorite(guildId, userId, song.url);

      if (isAlreadyFavorite) {
        await message.reply(`⚠️ **${song.title}** ya está en tus favoritos.`);
        return;
      }

      // Agregar a favoritos
      const added = favoritesService.addFavorite(guildId, userId, song);

      if (added) {
        const count = favoritesService.getFavoritesCount(guildId, userId);
        const reply = await message.reply(
          `⭐ **Agregado a favoritos:**\n` +
          `${song.title}\n\n` +
          `📚 Tienes ${count} canción${count !== 1 ? 'es' : ''} en favoritos`
        );

        // Auto-eliminar mensaje después de 8 segundos
        setTimeout(() => {
          reply.delete().catch(() => {});
        }, 8000);
      } else {
        await message.reply('❌ No se pudo agregar a favoritos. Intenta de nuevo.');
      }

    } catch (error) {
      console.error('Error en comando favorite:', error);
      await message.reply('❌ Ocurrió un error al agregar a favoritos.');
    }
  }
};
