import type { Message } from 'discord.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { Command } from '../types/command.js';
import { favoritesService } from '../index.js';

// Cache para la paginación de favoritos (messageId -> { userId, guildId, page })
export const favoritesPaginationCache = new Map<string, { userId: string; guildId: string; page: number }>();

export const favorites: Command = {
  name: 'favorites',
  description: 'Muestra tu lista de favoritos',
  aliases: ['favs', 'favoritos'],
  execute: async (message: Message, args: string[]) => {
    const guildId = message.guildId!;
    const userId = message.author.id;

    try {
      const result = favoritesService.getFavoritesPaginated(guildId, userId, 0, 10);

      if (result.total === 0) {
        await message.reply('📭 No tienes favoritos guardados. Usa `!favorite` mientras reproduces una canción para agregarla.');
        return;
      }

      // Crear embed con la lista de favoritos
      const embed = createFavoritesEmbed(result, message.author.tag);

      // Crear botones de navegación si hay más de una página
      const components = result.totalPages > 1 ? [createNavigationButtons(0, result.totalPages)] : [];

      const reply = await message.reply({
        embeds: [embed],
        components
      });

      // Guardar en cache para paginación
      if (result.totalPages > 1) {
        favoritesPaginationCache.set(reply.id, { userId, guildId, page: 0 });

        // Limpiar cache después de 5 minutos
        setTimeout(() => {
          favoritesPaginationCache.delete(reply.id);
        }, 5 * 60 * 1000);
      }

    } catch (error) {
      console.error('Error en comando favorites:', error);
      await message.reply('❌ Ocurrió un error al obtener tus favoritos.');
    }
  }
};

function createFavoritesEmbed(result: any, userTag: string): EmbedBuilder {
  const { favorites, total, totalPages, currentPage } = result;

  let description = '';

  favorites.forEach((fav: any, index: number) => {
    const globalIndex = currentPage * 10 + index + 1;
    const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index] || '⭐';

    // Formatear duración
    const mins = Math.floor(fav.duration / 60);
    const secs = Math.floor(fav.duration % 60);
    const duration = `${mins}:${secs.toString().padStart(2, '0')}`;

    description += `${emoji} **${fav.title}**\n`;

    if (fav.channel) {
      description += `   📺 ${fav.channel} • `;
    }

    description += `⏱️ ${duration}\n\n`;
  });

  const embed = new EmbedBuilder()
    .setColor('#FFD700') // Color dorado para favoritos
    .setTitle(`⭐ Favoritos de ${userTag}`)
    .setDescription(description)
    .setFooter({
      text: `Página ${currentPage + 1}/${totalPages} • ${total} favorito${total !== 1 ? 's' : ''} total${total !== 1 ? 'es' : ''}`
    })
    .setTimestamp();

  return embed;
}

function createNavigationButtons(currentPage: number, totalPages: number): ActionRowBuilder<ButtonBuilder> {
  const row = new ActionRowBuilder<ButtonBuilder>();

  // Botón "Anterior"
  row.addComponents(
    new ButtonBuilder()
      .setCustomId('favorites_prev')
      .setLabel('◀️ Anterior')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage === 0)
  );

  // Botón "Siguiente"
  row.addComponents(
    new ButtonBuilder()
      .setCustomId('favorites_next')
      .setLabel('Siguiente ▶️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(currentPage >= totalPages - 1)
  );

  return row;
}
