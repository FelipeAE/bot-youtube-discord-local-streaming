import type { Client, Interaction } from 'discord.js';
import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { QueueService } from '../services/QueueService.js';
import { AudioService } from '../services/AudioService.js';
import { YouTubeService } from '../services/YouTubeService.js';
import { AIService } from '../services/AIService.js';
import { createPlayerButtons } from '../components/PlayerButtons.js';
import { recommendationsCache } from '../commands/recommend.js';
import { searchResultsCache } from '../commands/search.js';

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
        case 'player_repeat':
          await this.handleRepeat(interaction, guildId);
          break;
        case 'player_volume':
          await this.handleVolume(interaction, guildId);
          break;
        case 'vol_down_10':
        case 'vol_down_5':
        case 'vol_up_5':
        case 'vol_up_10':
          await this.handleVolumeAdjust(interaction, guildId);
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
        case 'search_play_0':
        case 'search_play_1':
        case 'search_play_2':
        case 'search_play_3':
        case 'search_play_4':
          await this.handleSearchPlay(interaction, guildId);
          break;
        case 'search_queue_0':
        case 'search_queue_1':
        case 'search_queue_2':
        case 'search_queue_3':
        case 'search_queue_4':
          await this.handleSearchQueue(interaction, guildId);
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

    try {
      // Defer para tener más tiempo
      await interaction.deferReply({ ephemeral: true });

      // Importar utilidades de progreso
      const { formatTime, createProgressBar, calculateElapsedTime } = await import('../utils/progressBar.js');

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
      const { EmbedBuilder } = await import('discord.js');
      const embed = new EmbedBuilder()
        .setColor(state.isPaused ? '#FFA500' : '#0099ff') // Naranja si pausado, azul si reproduciéndose
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

      // Enviar nuevo mensaje con botones actualizados
      const channel = interaction.channel;
      if (channel && channel.isSendable()) {
        const duration = this.formatDuration(song.duration);
        const playerButtons = createPlayerButtons(state);

        const playerMessage = await channel.send({
          content: `▶️ **Reproduciendo:**\n**${song.title}**\n⏱️ Duración: ${duration}\n👤 Solicitado por: ${song.requestedBy}`,
          components: playerButtons
        });

        // Actualizar referencia del mensaje de botones
        state.playerMessageId = playerMessage.id;
        state.playerChannelId = channel.id;
      }

      // Responder con el embed (ephemeral para no llenar el chat)
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Error en handleNowPlaying:', error);
      try {
        await interaction.editReply({ content: '❌ Error al mostrar información de reproducción' });
      } catch (e) {
        // Ya fue manejado
      }
    }
  }

  private async handlePauseResume(interaction: any, guildId: string, isPaused: boolean) {
    const state = this.queueService.getQueue(guildId);

    if (!isPaused) {
      const success = this.audioService.pause(guildId);
      if (success) {
        await interaction.update({
          components: createPlayerButtons(state)
        });
        await interaction.followUp({ content: '⏸️ Reproducción pausada', ephemeral: true });
      } else {
        await interaction.reply({ content: '❌ No se pudo pausar la reproducción', ephemeral: true });
      }
    } else {
      const success = this.audioService.resume(guildId);
      if (success) {
        await interaction.update({
          components: createPlayerButtons(state)
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

    // Verificar si hay más canciones en la cola (considerando repeat)
    const hasNextSong = state.queue.length > 0 ||
                        state.options.repeat === 'song' ||
                        state.options.repeat === 'queue';

    if (!hasNextSong) {
      // No hay más canciones - preguntar si quiere detener o quedarse conectado
      await interaction.reply({
        content: `⏭️ **Saltado:** ${currentSong?.title || 'Canción desconocida'}\n\n⚠️ No hay más canciones en la cola. El bot se detendrá.`,
        ephemeral: false
      });

      // Detener reproducción y desconectar
      this.audioService.stop(guildId);
      this.queueService.clearQueue(guildId);

      // Borrar mensaje de botones
      if (state.playerMessageId && state.playerChannelId) {
        try {
          const channel = await this.client.channels.fetch(state.playerChannelId);
          if (channel && channel.isTextBased()) {
            const oldMessage = await (channel as any).messages.fetch(state.playerMessageId);
            await oldMessage.delete();
            state.playerMessageId = undefined;
          }
        } catch (error) {
          console.log('⚠️ No se pudo borrar el mensaje anterior');
        }
      }

      return;
    }

    // Hay más canciones - proceder con skip normal
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
      components: createPlayerButtons(state)
    });

    await interaction.followUp({
      content: isShuffled ? '🔀 Modo aleatorio activado' : '▶️ Modo aleatorio desactivado',
      ephemeral: true
    });
  }

  private async handleRepeat(interaction: any, guildId: string) {
    const state = this.queueService.getQueue(guildId);

    // Ciclar entre modos: none → song → queue → none
    let newMode: 'none' | 'song' | 'queue';
    let message: string;

    if (state.options.repeat === 'none') {
      newMode = 'song';
      message = '🔂 Repetir canción actual activado';
    } else if (state.options.repeat === 'song') {
      newMode = 'queue';
      message = '🔁 Repetir cola completa activado';
    } else {
      newMode = 'none';
      message = '➡️ Repetición desactivada';
    }

    this.queueService.setRepeat(guildId, newMode);

    await interaction.update({
      components: createPlayerButtons(state)
    });

    await interaction.followUp({
      content: message,
      ephemeral: true
    });
  }

  private async handleVolume(interaction: any, guildId: string) {
    const state = this.queueService.getQueue(guildId);
    const currentVolume = state.volume;

    // Crear botones de ajuste rápido
    const volumeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('vol_down_10')
        .setLabel('-10%')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(currentVolume <= 0),
      new ButtonBuilder()
        .setCustomId('vol_down_5')
        .setLabel('-5%')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentVolume <= 0),
      new ButtonBuilder()
        .setCustomId('vol_up_5')
        .setLabel('+5%')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentVolume >= 100),
      new ButtonBuilder()
        .setCustomId('vol_up_10')
        .setLabel('+10%')
        .setStyle(ButtonStyle.Success)
        .setDisabled(currentVolume >= 100)
    );

    await interaction.reply({
      content: `🔊 **Volumen actual:** ${currentVolume}%\n\nUsa los botones para ajustar:`,
      components: [volumeRow],
      ephemeral: true
    });
  }

  private async handleVolumeAdjust(interaction: any, guildId: string) {
    const state = this.queueService.getQueue(guildId);
    const currentVolume = state.volume;

    // Determinar el ajuste según el botón presionado
    let adjustment = 0;
    switch (interaction.customId) {
      case 'vol_down_10':
        adjustment = -10;
        break;
      case 'vol_down_5':
        adjustment = -5;
        break;
      case 'vol_up_5':
        adjustment = 5;
        break;
      case 'vol_up_10':
        adjustment = 10;
        break;
    }

    const newVolume = Math.max(0, Math.min(100, currentVolume + adjustment));
    this.audioService.setVolume(guildId, newVolume);

    // Actualizar mensaje con nuevo volumen
    const volumeRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('vol_down_10')
        .setLabel('-10%')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(newVolume <= 0),
      new ButtonBuilder()
        .setCustomId('vol_down_5')
        .setLabel('-5%')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(newVolume <= 0),
      new ButtonBuilder()
        .setCustomId('vol_up_5')
        .setLabel('+5%')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(newVolume >= 100),
      new ButtonBuilder()
        .setCustomId('vol_up_10')
        .setLabel('+10%')
        .setStyle(ButtonStyle.Success)
        .setDisabled(newVolume >= 100)
    );

    await interaction.update({
      content: `🔊 **Volumen ajustado:** ${newVolume}%\n\nUsa los botones para ajustar:`,
      components: [volumeRow]
    });

    // Actualizar botones del reproductor principal si existe el mensaje
    if (state.playerMessageId && state.playerChannelId) {
      try {
        const channel = await this.client.channels.fetch(state.playerChannelId);
        if (channel && channel.isTextBased()) {
          const playerMessage = await (channel as any).messages.fetch(state.playerMessageId);
          await playerMessage.edit({
            components: createPlayerButtons(state)
          });
        }
      } catch (error) {
        console.log('⚠️ No se pudo actualizar el mensaje del reproductor');
      }
    }
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

  private async handleSearchPlay(interaction: any, guildId: string) {
    // Obtener el índice del resultado desde el customId (search_play_0 -> 0)
    const index = parseInt(interaction.customId.split('_')[2]);

    // Obtener los resultados del cache usando el messageId
    const results = searchResultsCache.get(interaction.message.id);

    if (!results || !results[index]) {
      await interaction.reply({
        content: '❌ Los resultados de búsqueda han expirado. Usa `!search` nuevamente.',
        ephemeral: true
      });
      return;
    }

    const selectedSong = results[index];

    // Verificar si el usuario está en un canal de voz
    const member = interaction.member;
    if (!member?.voice?.channel) {
      await interaction.reply({
        content: '❌ Debes estar en un canal de voz para reproducir música.',
        ephemeral: true
      });
      return;
    }

    const voiceChannel = member.voice.channel;

    try {
      // Defer reply para evitar timeout de 3 segundos
      await interaction.deferReply({ ephemeral: false });

      // Agregar usuario que solicitó la canción
      selectedSong.requestedBy = interaction.user.tag;

      // Detener reproducción actual si existe
      const state = this.queueService.getQueue(guildId);
      if (state.isPlaying) {
        this.audioService.stop(guildId);
      }

      // Limpiar cola actual y agregar la canción
      this.queueService.clearQueue(guildId);
      this.queueService.addSong(guildId, selectedSong);

      // Iniciar reproducción
      await this.audioService.joinChannel(voiceChannel);

      // Guardar referencia del canal para que AudioService envíe los botones
      const updatedState = this.queueService.getQueue(guildId);
      updatedState.playerChannelId = interaction.channelId;

      await this.audioService.play(guildId);

      await interaction.editReply({
        content: `▶️ **Reproduciendo ahora:** ${selectedSong.title}`
      });

      // Auto-eliminar mensaje después de 5 segundos
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 5000);

    } catch (error) {
      console.error('Error en handleSearchPlay:', error);

      // Intentar editar si ya se hizo defer, o responder si no
      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Error al reproducir: **${selectedSong.title}**`
        });
      } else {
        await interaction.reply({
          content: `❌ Error al reproducir: **${selectedSong.title}**`,
          ephemeral: true
        });
      }
    }
  }

  private async handleSearchQueue(interaction: any, guildId: string) {
    // Obtener el índice del resultado desde el customId (search_queue_0 -> 0)
    const index = parseInt(interaction.customId.split('_')[2]);

    // Obtener los resultados del cache usando el messageId
    const results = searchResultsCache.get(interaction.message.id);

    if (!results || !results[index]) {
      await interaction.reply({
        content: '❌ Los resultados de búsqueda han expirado. Usa `!search` nuevamente.',
        ephemeral: true
      });
      return;
    }

    const selectedSong = results[index];

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

    try {
      // Defer reply para evitar timeout de 3 segundos
      await interaction.deferReply({ ephemeral: false });

      // Agregar usuario que solicitó la canción
      selectedSong.requestedBy = interaction.user.tag;

      // Agregar a la cola
      this.queueService.addSong(guildId, selectedSong);

      // Si no está reproduciendo, iniciar reproducción
      const state = this.queueService.getQueue(guildId);
      if (!state.isPlaying) {
        await this.audioService.joinChannel(voiceChannel);

        // Guardar referencia del canal para que AudioService envíe los botones
        state.playerChannelId = interaction.channelId;

        await this.audioService.play(guildId);
        await interaction.editReply({
          content: `▶️ **Reproduciendo:** ${selectedSong.title}`
        });
      } else {
        await interaction.editReply({
          content: `✅ **Agregado a la cola:** ${selectedSong.title}`
        });
      }

      // Auto-eliminar mensaje después de 8 segundos
      setTimeout(() => {
        interaction.deleteReply().catch(() => {});
      }, 8000);

    } catch (error) {
      console.error('Error en handleSearchQueue:', error);

      // Intentar editar si ya se hizo defer, o responder si no
      if (interaction.deferred) {
        await interaction.editReply({
          content: `❌ Error al agregar: **${selectedSong.title}**`
        });
      } else {
        await interaction.reply({
          content: `❌ Error al agregar: **${selectedSong.title}**`,
          ephemeral: true
        });
      }
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
