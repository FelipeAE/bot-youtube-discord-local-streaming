import type { Client, Interaction } from 'discord.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { QueueService } from '../services/QueueService.js';
import { AudioService } from '../services/AudioService.js';
import { YouTubeService } from '../services/YouTubeService.js';
import { AIService } from '../services/AIService.js';
import { createPlayerButtons, updatePauseButton, updateShuffleButton } from '../components/PlayerButtons.js';
import { recommendationsCache } from '../commands/recommend.js';

// Cache para almacenar la página actual de la cola (messageId -> page)
const queuePaginationCache = new Map<string, number>();

export class ButtonHandler {
  private youtubeService: YouTubeService;
  private aiService: AIService;

  constructor(
    private client: Client,
    private queueService: QueueService,
    private audioService: AudioService
  ) {
    this.youtubeService = new YouTubeService();
    this.aiService = new AIService();
    this.client.on('interactionCreate', this.handleInteraction.bind(this));
  }

  private async handleInteraction(interaction: Interaction) {
    if (!interaction.isButton()) return;
    if (!interaction.guildId) return;

    const guildId = interaction.guildId;
    const state = this.queueService.getQueue(guildId);

    try {
      switch (interaction.customId) {
        case 'player_now_playing':
          await this.handleNowPlaying(interaction, guildId);
          break;
        case 'player_pause_resume':
          await this.handlePauseResume(interaction, guildId, state.isPaused);
          break;
        case 'player_skip':
          await this.handleSkip(interaction, guildId);
          break;
        case 'player_stop':
          await this.handleStop(interaction, guildId);
          break;
        case 'player_queue':
          await this.handleQueue(interaction, guildId);
          break;
        case 'queue_prev':
          await this.handleQueuePagination(interaction, guildId, 'prev');
          break;
        case 'queue_next':
          await this.handleQueuePagination(interaction, guildId, 'next');
          break;
        case 'player_shuffle':
          await this.handleShuffle(interaction, guildId);
          break;
        case 'player_recommend':
          await this.handleRecommend(interaction, guildId);
          break;
        case 'rec_add_1':
        case 'rec_add_2':
        case 'rec_add_3':
        case 'rec_add_4':
        case 'rec_add_5':
          await this.handleRecommendationAdd(interaction, guildId);
          break;
        case 'rec_add_all':
          await this.handleRecommendationAddAll(interaction, guildId);
          break;
      }
    } catch (error) {
      console.error(`❌ Error en ButtonHandler (${interaction.customId}):`, error);
      // Intentar responder al usuario si no ha respondido aún
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: '❌ Ocurrió un error al procesar tu acción. Intenta de nuevo.',
            ephemeral: true
          });
        }
      } catch (replyError) {
        console.error('No se pudo responder al usuario:', replyError);
      }
    }
  }

  private async handleNowPlaying(interaction: any, guildId: string) {
    const state = this.queueService.getQueue(guildId);

    if (!state.isPlaying || !state.currentSong) {
      await interaction.reply({ content: '❌ No hay música reproduciéndose', ephemeral: true });
      return;
    }

    const song = state.currentSong;
    const duration = this.formatDuration(song.duration);

    // Defer para tener más tiempo
    await interaction.deferReply({ ephemeral: true });

    try {
      // Borrar el mensaje anterior de botones si existe
      if (state.playerMessageId && state.playerChannelId) {
        try {
          const channel = await this.client.channels.fetch(state.playerChannelId);
          if (channel && channel.isTextBased()) {
            const oldMessage = await (channel as any).messages.fetch(state.playerMessageId);
            await oldMessage.delete();
            state.playerMessageId = undefined;
          }
        } catch (error) {
          console.log('⚠️ No se pudo borrar el mensaje anterior (probablemente ya borrado)');
        }
      }

      // Enviar nuevo mensaje con botones
      const channel = interaction.channel;
      if (channel && channel.isSendable()) {
        const playerButtons = this.queueService.getQueue(guildId).options.shuffle
          ? updateShuffleButton(true, state.isPaused)
          : (state.isPaused ? updatePauseButton(true) : updatePauseButton(false));

        const playerMessage = await channel.send({
          content: `🎵 **Now Playing:**\n**${song.title}**\n⏱️ Duración: ${duration}\n👤 Solicitado por: ${song.requestedBy}`,
          components: playerButtons
        });

        // Actualizar referencia del mensaje de botones
        state.playerMessageId = playerMessage.id;
        state.playerChannelId = channel.id;

        // Responder a la interacción
        await interaction.editReply({ content: '✅ Botones actualizados' });
      }
    } catch (error) {
      console.error('Error en handleNowPlaying:', error);
      try {
        await interaction.editReply({ content: '❌ Error al actualizar los botones' });
      } catch (e) {
        // Ya fue manejado
      }
    }
  }

  private async handlePauseResume(interaction: any, guildId: string, isPaused: boolean) {
    if (!isPaused) {
      const success = this.audioService.pause(guildId);
      if (success) {
        const state = this.queueService.getQueue(guildId);
        await interaction.update({
          components: updatePauseButton(true)
        });
        await interaction.followUp({ content: '⏸️ Reproducción pausada', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ No se pudo pausar la reproducción', ephemeral: true });
      }
    } else {
      const success = this.audioService.resume(guildId);
      if (success) {
        await interaction.update({
          components: updatePauseButton(false)
        });
        await interaction.followUp({ content: '▶️ Reproducción reanudada', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ No se pudo reanudar la reproducción', ephemeral: true });
      }
    }
  }

  private async handleSkip(interaction: any, guildId: string) {
    const state = this.queueService.getQueue(guildId);

    if (!state.isPlaying) {
      await interaction.reply({ content: '❌ No hay música reproduciéndose', ephemeral: true });
      return;
    }

    const currentSong = state.currentSong;

    // Defer para tener más tiempo de procesamiento
    await interaction.deferReply({ ephemeral: false });

    try {
      // Borrar el mensaje anterior de botones si existe
      if (state.playerMessageId && state.playerChannelId) {
        try {
          const channel = await this.client.channels.fetch(state.playerChannelId);
          if (channel && channel.isTextBased()) {
            const oldMessage = await (channel as any).messages.fetch(state.playerMessageId);
            await oldMessage.delete();
            state.playerMessageId = undefined;
          }
        } catch (error) {
          // Ignorar si el mensaje ya no existe
          console.log('⚠️ No se pudo borrar el mensaje anterior (probablemente ya borrado)');
        }
      }

      // Skip la canción actual
      this.audioService.skip(guildId);

      // Responder con la canción que fue saltada
      await interaction.editReply({
        content: `⏭️ **Saltado:** ${currentSong?.title || 'Canción desconocida'}`
      });

      // El AudioService se encarga automáticamente de enviar los nuevos botones
      // cuando empiece la siguiente canción
    } catch (error) {
      console.error('Error en handleSkip:', error);
      try {
        await interaction.editReply({ content: '❌ Error al saltar la canción' });
      } catch (e) {
        // Ya fue manejado
      }
    }
  }

  private async handleStop(interaction: any, guildId: string) {
    const state = this.queueService.getQueue(guildId);

    if (!state.isPlaying && state.queue.length === 0) {
      await interaction.reply({ content: '❌ No hay música reproduciéndose', ephemeral: true });
      return;
    }

    this.audioService.stop(guildId);
    this.queueService.clearQueue(guildId);

    // Deshabilitar todos los botones
    await interaction.update({
      components: []
    });

    await interaction.followUp({
      content: '⏹️ Reproducción detenida y cola limpiada',
      ephemeral: false
    });
  }

  private async handleQueue(interaction: any, guildId: string) {
    const state = this.queueService.getQueue(guildId);

    if (!state.currentSong && state.queue.length === 0) {
      await interaction.reply({
        content: '📋 La cola está vacía',
        ephemeral: true
      });
      return;
    }

    // Defer para tener más tiempo
    await interaction.deferReply({ ephemeral: true });

    const page = 0; // Empezar en la primera página
    const { message, components } = this.buildQueueMessage(guildId, page);

    const reply = await interaction.editReply({
      content: message,
      components: components
    });

    // Guardar la página actual en cache
    queuePaginationCache.set(reply.id, page);

    // Limpiar cache después de 5 minutos
    setTimeout(() => {
      queuePaginationCache.delete(reply.id);
    }, 5 * 60 * 1000);
  }

  private async handleQueuePagination(interaction: any, guildId: string, direction: 'prev' | 'next') {
    const currentPage = queuePaginationCache.get(interaction.message.id) || 0;
    const state = this.queueService.getQueue(guildId);

    const songsPerPage = 10;
    const totalPages = Math.ceil(state.queue.length / songsPerPage);

    let newPage = currentPage;
    if (direction === 'next') {
      newPage = Math.min(currentPage + 1, totalPages - 1);
    } else {
      newPage = Math.max(currentPage - 1, 0);
    }

    // Actualizar cache
    queuePaginationCache.set(interaction.message.id, newPage);

    const { message, components } = this.buildQueueMessage(guildId, newPage);

    await interaction.update({
      content: message,
      components: components
    });
  }

  private buildQueueMessage(guildId: string, page: number): { message: string; components: any[] } {
    const state = this.queueService.getQueue(guildId);
    const songsPerPage = 10;
    const totalPages = Math.ceil(state.queue.length / songsPerPage);

    let queueMessage = '';

    if (state.currentSong) {
      const currentDuration = this.formatDuration(state.currentSong.duration);
      queueMessage += `**▶️ Reproduciendo ahora:**\n${state.currentSong.title} \`[${currentDuration}]\`\n\n`;
    }

    if (state.queue.length > 0) {
      queueMessage += `**📋 Próximas canciones (${state.queue.length}):**\n`;

      const startIndex = page * songsPerPage;
      const endIndex = Math.min(startIndex + songsPerPage, state.queue.length);
      const songsToShow = state.queue.slice(startIndex, endIndex);

      songsToShow.forEach((song, index) => {
        const duration = this.formatDuration(song.duration);
        const globalIndex = startIndex + index + 1;
        queueMessage += `${globalIndex}. ${song.title} \`[${duration}]\`\n`;
      });

      // Calcular duración total
      const totalSeconds = state.queue.reduce((acc, song) => acc + song.duration, 0);
      const totalDuration = this.formatDuration(totalSeconds);
      queueMessage += `\n**⏱️ Duración total:** ${totalDuration}`;

      // Mostrar página actual si hay más de una página
      if (totalPages > 1) {
        queueMessage += `\n**📄 Página ${page + 1}/${totalPages}**`;
      }
    }

    // Mostrar opciones activas
    const options: string[] = [];
    if (state.options.shuffle) options.push('🔀 Mezclar');
    if (state.options.repeat === 'song') options.push('🔂 Repetir canción');
    if (state.options.repeat === 'queue') options.push('🔁 Repetir cola');

    if (options.length > 0) {
      queueMessage += `\n\n**⚙️ Opciones activas:** ${options.join(', ')}`;
    }

    // Crear botones de navegación si hay más de una página
    const components: any[] = [];
    if (totalPages > 1) {
      const navigationRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('queue_prev')
          .setLabel('◀️ Anterior')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('queue_next')
          .setLabel('Siguiente ▶️')
          .setStyle(ButtonStyle.Primary)
          .setDisabled(page === totalPages - 1)
      );
      components.push(navigationRow);
    }

    return { message: queueMessage, components };
  }

  private async handleShuffle(interaction: any, guildId: string) {
    const isShuffled = this.queueService.toggleShuffle(guildId);
    const state = this.queueService.getQueue(guildId);

    await interaction.update({
      components: updateShuffleButton(isShuffled, state.isPaused)
    });

    await interaction.followUp({
      content: isShuffled ? '🔀 Modo aleatorio activado' : '▶️ Modo aleatorio desactivado',
      ephemeral: true
    });
  }

  private async handleRecommend(interaction: any, guildId: string) {
    const state = this.queueService.getQueue(guildId);

    if (!state.currentSong) {
      await interaction.reply({
        content: '❌ No hay ninguna canción reproduciéndose actualmente.',
        ephemeral: true
      });
      return;
    }

    // Defer la respuesta para tener más tiempo
    await interaction.deferReply({ ephemeral: false });

    try {
      // Mostrar mensaje de carga
      await interaction.editReply({
        content: '🤖 Generando recomendaciones con IA...'
      });

      const recommendations = await this.aiService.getRecommendations(state.currentSong);

      if (recommendations.length === 0) {
        await interaction.editReply({
          content: 'No se pudieron generar recomendaciones en este momento.'
        });
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

      const replyMsg = await interaction.editReply({
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
        interaction.editReply({
          embeds: [embed],
          components: []
        }).catch(() => {
          // Ignorar si el mensaje ya fue eliminado
        });
      }, 5 * 60 * 1000); // 5 minutos

    } catch (error) {
      console.error('Error obteniendo recomendaciones:', error);
      await interaction.editReply({
        content: 'Ocurrió un error al obtener recomendaciones.'
      });
    }
  }

  private async handleRecommendationAdd(interaction: any, guildId: string) {
    // Obtener el índice de la recomendación desde el customId (rec_add_1 -> 1)
    const index = parseInt(interaction.customId.split('_')[2]) - 1;

    // Obtener las recomendaciones del cache usando el messageId
    const recommendations = recommendationsCache.get(interaction.message.id);

    if (!recommendations || !recommendations[index]) {
      await interaction.reply({
        content: '❌ Las recomendaciones han expirado. Usa `!recommend` nuevamente.',
        ephemeral: true
      });
      return;
    }

    const songQuery = recommendations[index];

    // Defer para dar tiempo a buscar y agregar la canción
    await interaction.deferReply({ ephemeral: false });

    // Verificar si el usuario está en un canal de voz
    const member = interaction.member;
    if (!member?.voice?.channel) {
      await interaction.editReply({
        content: '❌ Debes estar en un canal de voz para agregar canciones.'
      });
      return;
    }

    const voiceChannel = member.voice.channel;

    try {
      // Buscar la canción en YouTube
      const videoInfo = await this.youtubeService.searchVideo(songQuery, interaction.user.username);

      if (!videoInfo) {
        await interaction.editReply({
          content: `❌ No se pudo encontrar: **${songQuery}**`
        });
        return;
      }

      // Agregar a la cola
      this.queueService.addSong(guildId, videoInfo);

      // Si no está reproduciendo, iniciar reproducción
      const state = this.queueService.getQueue(guildId);
      if (!state.isPlaying) {
        await this.audioService.joinChannel(voiceChannel);
        await this.audioService.play(guildId);
        await interaction.editReply({
          content: `▶️ **Reproduciendo:** ${videoInfo.title}`
        });
      } else {
        await interaction.editReply({
          content: `✅ **Agregado a la cola:** ${videoInfo.title}\n📊 Posición: ${state.queue.length}`
        });
      }
    } catch (error) {
      console.error('Error agregando recomendación:', error);
      await interaction.editReply({
        content: `❌ Error al agregar: **${songQuery}**`
      });
    }
  }

  private async handleRecommendationAddAll(interaction: any, guildId: string) {
    // Obtener las recomendaciones del cache
    const recommendations = recommendationsCache.get(interaction.message.id);

    if (!recommendations || recommendations.length === 0) {
      await interaction.reply({
        content: '❌ Las recomendaciones han expirado. Usa `!recommend` nuevamente.',
        ephemeral: true
      });
      return;
    }

    // Verificar si el usuario está en un canal de voz
    const member = interaction.member;
    if (!member?.voice?.channel) {
      await interaction.reply({
        content: '❌ Debes estar en un canal de voz para agregar canciones.',
        ephemeral: true
      });
      return;
    }

    const voiceChannel = member.voice.channel;

    // Defer para dar tiempo a buscar y agregar todas las canciones
    await interaction.deferReply({ ephemeral: false });

    try {
      await interaction.editReply({
        content: `🔍 Buscando y agregando ${recommendations.length} canciones...`
      });

      let successCount = 0;
      let failedSongs: string[] = [];

      for (const songQuery of recommendations) {
        try {
          const videoInfo = await this.youtubeService.searchVideo(songQuery, interaction.user.username);

          if (videoInfo) {
            this.queueService.addSong(guildId, videoInfo);
            successCount++;
          } else {
            failedSongs.push(songQuery);
          }
        } catch (error) {
          console.error(`Error buscando: ${songQuery}`, error);
          failedSongs.push(songQuery);
        }
      }

      // Si no está reproduciendo, iniciar reproducción
      const state = this.queueService.getQueue(guildId);
      if (!state.isPlaying && successCount > 0) {
        await this.audioService.joinChannel(voiceChannel);
        await this.audioService.play(guildId);
      }

      // Mensaje de resultado
      let resultMessage = `✅ **${successCount}/${recommendations.length}** canciones agregadas`;

      if (failedSongs.length > 0) {
        resultMessage += `\n❌ **No encontradas:** ${failedSongs.slice(0, 2).join(', ')}`;
        if (failedSongs.length > 2) {
          resultMessage += ` y ${failedSongs.length - 2} más`;
        }
      }

      await interaction.editReply({
        content: resultMessage
      });
    } catch (error) {
      console.error('Error agregando todas las recomendaciones:', error);
      await interaction.editReply({
        content: '❌ Error al agregar las recomendaciones.'
      });
    }
  }

  private formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
