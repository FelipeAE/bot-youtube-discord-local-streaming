import type { Message } from 'discord.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, GuildMember } from 'discord.js';
import type { Command } from '../types/command.js';
import { youtubeService } from '../index.js';
import type { Song } from '../types/index.js';

// Cache para almacenar resultados de búsqueda (5 minutos de expiración)
export const searchResultsCache = new Map<string, Song[]>();

export const search: Command = {
  name: 'search',
  description: 'Busca videos en YouTube y permite elegir cuál reproducir',
  aliases: ['s', 'find'],
  execute: async (message: Message, args: string[]) => {
    if (!args[0]) {
      await message.reply('Por favor proporciona un término de búsqueda.');
      return;
    }

    const member = message.member as GuildMember;
    const voiceChannel = member?.voice.channel;

    if (!voiceChannel) {
      await message.reply('Debes estar en un canal de voz para buscar música.');
      return;
    }

    try {
      const query = args.join(' ');
      const searchMessage = await message.reply(`🔍 Buscando: "${query}"...`);

      // Buscar 5 resultados
      const results = await youtubeService.searchMultiple(query, 5);

      if (!results || results.length === 0) {
        await searchMessage.edit('❌ No se encontraron resultados para tu búsqueda.');
        setTimeout(() => searchMessage.delete().catch(() => {}), 5000);
        return;
      }

      // Guardar resultados en cache
      const cacheKey = searchMessage.id;
      searchResultsCache.set(cacheKey, results);

      // Auto-limpiar cache después de 5 minutos
      setTimeout(() => {
        searchResultsCache.delete(cacheKey);
      }, 5 * 60 * 1000);

      // Formatear duración
      const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      // Crear descripción con lista numerada
      let description = `🔍 **Resultados de búsqueda para** "${query}"\n\n`;

      results.forEach((song, index) => {
        const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'][index];
        const duration = formatDuration(song.duration);
        const channel = song.channel || 'Unknown';

        description += `${emoji} **${song.title}**\n`;
        description += `   📺 ${channel} • ⏱️ ${duration}\n\n`;
      });

      description += `⏰ *Expira en 5 minutos*`;

      // Crear embed
      const embed = new EmbedBuilder()
        .setColor('#FF0000') // Rojo de YouTube
        .setDescription(description)
        .setThumbnail(results[0].thumbnail || null)
        .setFooter({ text: `Solicitado por ${message.author.tag}` })
        .setTimestamp();

      // Crear botones - Fila 1: Play Now (▶️)
      const playNowRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('search_play_0')
          .setLabel('1')
          .setStyle(ButtonStyle.Success)
          .setEmoji('▶️'),
        new ButtonBuilder()
          .setCustomId('search_play_1')
          .setLabel('2')
          .setStyle(ButtonStyle.Success)
          .setEmoji('▶️'),
        new ButtonBuilder()
          .setCustomId('search_play_2')
          .setLabel('3')
          .setStyle(ButtonStyle.Success)
          .setEmoji('▶️'),
        new ButtonBuilder()
          .setCustomId('search_play_3')
          .setLabel('4')
          .setStyle(ButtonStyle.Success)
          .setEmoji('▶️'),
        new ButtonBuilder()
          .setCustomId('search_play_4')
          .setLabel('5')
          .setStyle(ButtonStyle.Success)
          .setEmoji('▶️')
      );

      // Fila 2: Add to Queue (➕)
      const addQueueRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('search_queue_0')
          .setLabel('1')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('search_queue_1')
          .setLabel('2')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('search_queue_2')
          .setLabel('3')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('search_queue_3')
          .setLabel('4')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('search_queue_4')
          .setLabel('5')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➕')
      );

      // Editar mensaje con embed y botones
      await searchMessage.edit({
        content: '',
        embeds: [embed],
        components: [playNowRow, addQueueRow]
      });

    } catch (error) {
      console.error('Error en comando search:', error);
      await message.reply('❌ Hubo un error al buscar videos. Intenta de nuevo.').catch(() => {});
    }
  }
};
