import type { Message } from 'discord.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { Command } from '../types/command.js';
import { queueService, aiService } from '../index.js';

// Cache temporal para almacenar recomendaciones (messageId -> recommendations)
export const recommendationsCache = new Map<string, string[]>();

export const recommend: Command = {
  name: 'recommend',
  description: 'Obtiene recomendaciones basadas en la canción actual usando IA',
  aliases: ['rec', 'suggestions'],
  execute: async (message: Message, args: string[]) => {
    if (!message.guildId) {
      await message.reply('Este comando solo funciona en servidores.');
      return;
    }

    const state = queueService.getQueue(message.guildId);

    if (!state.currentSong) {
      await message.reply('No hay ninguna canción reproduciéndose actualmente.');
      return;
    }

    const loadingMsg = await message.reply('🤖 Generando recomendaciones con IA...');

    try {
      const recommendations = await aiService.getRecommendations(state.currentSong);

      if (recommendations.length === 0) {
        await loadingMsg.edit('No se pudieron generar recomendaciones en este momento.');
        return;
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🎵 Recomendaciones de IA')
        .setDescription(`Basado en: **${state.currentSong.title}**`)
        .addFields({
          name: 'Canciones Sugeridas',
          value: recommendations.map((song, i) => `${i + 1}. ${song}`).join('\n'),
        })
        .setFooter({ text: 'Powered by Google Gemini • hoy a las' })
        .setTimestamp();

      // Crear botones para cada recomendación
      const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('rec_add_1')
          .setLabel('1')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('rec_add_2')
          .setLabel('2')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('rec_add_3')
          .setLabel('3')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('rec_add_4')
          .setLabel('4')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➕'),
        new ButtonBuilder()
          .setCustomId('rec_add_5')
          .setLabel('5')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('➕')
      );

      // Botón para agregar todas las recomendaciones
      const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('rec_add_all')
          .setLabel('Agregar Todas')
          .setStyle(ButtonStyle.Success)
          .setEmoji('✅')
      );

      const replyMsg = await loadingMsg.edit({
        content: '',
        embeds: [embed],
        components: [row1, row2]
      });

      // Guardar recomendaciones en cache con el messageId
      recommendationsCache.set(replyMsg.id, recommendations);

      // Limpiar cache después de 5 minutos
      setTimeout(() => {
        recommendationsCache.delete(replyMsg.id);

        // Intentar deshabilitar botones
        replyMsg.edit({
          embeds: [embed],
          components: []
        }).catch(() => {
          // Ignorar si el mensaje ya fue eliminado
        });
      }, 5 * 60 * 1000); // 5 minutos

    } catch (error) {
      console.error('Error obteniendo recomendaciones:', error);
      await loadingMsg.edit('Ocurrió un error al obtener recomendaciones.');
    }
  },
};
