import type { Message } from 'discord.js';
import type { Command } from '../types/command.js';
import { favoritesService } from '../index.js';

export const unfavorite: Command = {
  name: 'unfavorite',
  description: 'Elimina un favorito por su número de índice',
  aliases: ['unfav', 'uf'],
  execute: async (message: Message, args: string[]) => {
    const guildId = message.guildId!;
    const userId = message.author.id;

    if (!args[0]) {
      await message.reply('⚠️ Debes especificar el número del favorito a eliminar.\nEjemplo: `!unfavorite 3`');
      return;
    }

    const index = parseInt(args[0]);

    if (isNaN(index) || index < 1) {
      await message.reply('⚠️ El número debe ser un valor positivo.\nEjemplo: `!unfavorite 3`');
      return;
    }

    try {
      const total = favoritesService.getFavoritesCount(guildId, userId);

      if (total === 0) {
        await message.reply('📭 No tienes favoritos guardados.');
        return;
      }

      if (index > total) {
        await message.reply(`⚠️ Solo tienes ${total} favorito${total !== 1 ? 's' : ''}. Usa un número entre 1 y ${total}.`);
        return;
      }

      // Eliminar favorito por índice
      const removed = favoritesService.removeFavoriteByIndex(guildId, userId, index);

      if (removed) {
        const newCount = favoritesService.getFavoritesCount(guildId, userId);
        const reply = await message.reply(
          `🗑️ **Eliminado de favoritos:**\n` +
          `${removed.title}\n\n` +
          `📚 Te quedan ${newCount} favorito${newCount !== 1 ? 's' : ''}`
        );

        // Auto-eliminar mensaje después de 8 segundos
        setTimeout(() => {
          reply.delete().catch(() => {});
        }, 8000);
      } else {
        await message.reply('❌ No se pudo eliminar el favorito. Intenta de nuevo.');
      }

    } catch (error) {
      console.error('Error en comando unfavorite:', error);
      await message.reply('❌ Ocurrió un error al eliminar el favorito.');
    }
  }
};
