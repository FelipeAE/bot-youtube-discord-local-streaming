import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  AudioPlayerStatus,
  VoiceConnection,
  AudioPlayer,
  entersState,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import type { VoiceBasedChannel, Client } from 'discord.js';
import type { Song } from '../types/index.js';
import { QueueService } from './QueueService.js';
import { YouTubeService } from './YouTubeService.js';

export class AudioService {
  private connections: Map<string, VoiceConnection> = new Map();
  private players: Map<string, AudioPlayer> = new Map();
  private client: Client | null = null;

  constructor(
    private queueService: QueueService,
    private youtubeService: YouTubeService
  ) {
    this.checkVoiceDependencies();
  }

  setClient(client: Client): void {
    this.client = client;
  }

  private async checkVoiceDependencies(): Promise<void> {
    // Verificar que las dependencias de encriptación estén disponibles
    try {
      await import('prism-media');
      console.log('✅ prism-media disponible');
    } catch (e) {
      console.error('❌ prism-media no encontrado:', e);
    }

    try {
      const ffmpeg = await import('@ffmpeg-installer/ffmpeg');
      console.log('✅ FFmpeg disponible en:', (ffmpeg as any).default?.path || 'ruta no disponible');
    } catch (e) {
      console.warn('⚠️ FFmpeg no encontrado, puede causar problemas con streaming');
    }

    // Verificar libsodium/sodium
    try {
      // @ts-ignore
      await import('sodium-native');
      console.log('✅ sodium-native disponible');
    } catch (e) {
      try {
        // @ts-ignore
        await import('libsodium-wrappers');
        console.log('✅ libsodium-wrappers disponible');
      } catch (e2) {
        console.error('❌ No se encontró ninguna librería de encriptación (sodium)');
      }
    }
  }

  async joinChannel(channel: VoiceBasedChannel): Promise<VoiceConnection> {
    const guildId = channel.guild.id;

    // Verificar si ya existe una conexión activa
    const existingConnection = this.connections.get(guildId);
    if (existingConnection && existingConnection.state.status !== VoiceConnectionStatus.Destroyed) {
      console.log('🔄 Reutilizando conexión existente');
      return existingConnection;
    }

    console.log(`🔌 Intentando unirse al canal de voz: ${channel.name}`);
    console.log(`📊 Estado del canal: ID=${channel.id}, Guild=${guildId}`);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guildId,
      adapterCreator: channel.guild.voiceAdapterCreator as any,
      selfDeaf: false,
      selfMute: false,
    });

    // Agregar listeners de eventos para debugging
    connection.on('stateChange', (oldState, newState) => {
      console.log(`🔄 Estado de conexión: ${oldState.status} -> ${newState.status}`);
    });

    connection.on('error', (error) => {
      console.error('❌ Error en la conexión de voz:', error);
    });

    try {
      console.log('⏳ Esperando conexión de voz (timeout: 60 segundos)...');
      await entersState(connection, VoiceConnectionStatus.Ready, 60_000);
      console.log('✅ Conectado al canal de voz');
      this.connections.set(guildId, connection);
      return connection;
    } catch (error) {
      console.error('❌ Error al unirse al canal de voz:', error);
      console.error(`📊 Estado final de conexión: ${connection.state.status}`);
      connection.destroy();
      throw new Error(`No se pudo conectar al canal de voz después de 60 segundos. Estado: ${connection.state.status}`);
    }
  }

  async play(guildId: string): Promise<void> {
    const state = this.queueService.getQueue(guildId);
    const connection = this.connections.get(guildId);

    if (!connection) {
      throw new Error('No hay conexión de voz activa');
    }

    const nextSong = this.queueService.getNextSong(guildId);
    if (!nextSong) {
      state.isPlaying = false;
      state.currentSong = null;
      return;
    }

    state.currentSong = nextSong;
    state.isPlaying = true;
    state.isPaused = false;

    let player = this.players.get(guildId);
    if (!player) {
      player = createAudioPlayer();
      this.players.set(guildId, player);

      player.on(AudioPlayerStatus.Idle, async () => {
        // Borrar mensaje anterior de botones antes de reproducir siguiente canción
        await this.deletePlayerMessage(guildId);

        // Reproducir siguiente canción
        this.play(guildId).catch(error => {
          console.error('Error al reproducir siguiente canción:', error);
        });
      });

      player.on('error', (error) => {
        console.error(`❌ Error en el reproductor de audio: ${error.message}`);

        // Ignorar errores de broken pipe (ocurren al hacer skip)
        if (error.message.includes('Broken pipe') || error.message.includes('premature close')) {
          console.log('⚠️ Stream cerrado abruptamente (normal al hacer skip)');
          return;
        }

        // Intentar siguiente canción en caso de error real
        this.play(guildId).catch(err => {
          console.error('Error al intentar siguiente canción:', err);
        });
      });

      connection.subscribe(player);
    }

    try {
      // Streaming directo para todos los videos (sin importar duración)
      console.log(`🎵 Reproduciendo: ${nextSong.title} (${this.formatDuration(nextSong.duration)})`);
      console.log(`🔗 URL de la canción: ${nextSong.url}`);
      console.log(`📦 Objeto song completo:`, JSON.stringify(nextSong, null, 2));
      const stream = await this.youtubeService.getAudioStream(nextSong.url);
      const resource = createAudioResource(stream, {
        inlineVolume: true,
      });

      // Aplicar volumen guardado
      if (resource.volume) {
        resource.volume.setVolume(state.volume / 100);
        console.log(`🔊 Volumen inicial establecido: ${state.volume}%`);
      }

      player.play(resource);

      // Enviar botones del reproductor para la nueva canción
      await this.sendPlayerButtons(guildId, nextSong);
    } catch (error) {
      console.error(`❌ Error al crear stream para: ${nextSong.title}`, error);
      // Intentar siguiente canción
      this.play(guildId).catch(err => {
        console.error('Error al intentar siguiente canción:', err);
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

  pause(guildId: string): boolean {
    const player = this.players.get(guildId);
    const state = this.queueService.getQueue(guildId);

    if (player && state.isPlaying && !state.isPaused) {
      player.pause();
      state.isPaused = true;
      return true;
    }
    return false;
  }

  resume(guildId: string): boolean {
    const player = this.players.get(guildId);
    const state = this.queueService.getQueue(guildId);

    if (player && state.isPaused) {
      player.unpause();
      state.isPaused = false;
      return true;
    }
    return false;
  }

  skip(guildId: string): void {
    const player = this.players.get(guildId);
    if (player) {
      player.stop();
    }
  }

  stop(guildId: string): void {
    const player = this.players.get(guildId);
    const connection = this.connections.get(guildId);
    const state = this.queueService.getQueue(guildId);

    if (player) {
      player.stop();
      this.players.delete(guildId);
    }

    if (connection) {
      connection.destroy();
      this.connections.delete(guildId);
    }

    state.isPlaying = false;
    state.isPaused = false;
    state.currentSong = null;
  }

  getVolume(guildId: string): number {
    const state = this.queueService.getQueue(guildId);
    return state.volume;
  }

  setVolume(guildId: string, volume: number): void {
    const state = this.queueService.getQueue(guildId);
    const player = this.players.get(guildId);

    // Validar rango
    const validVolume = Math.max(0, Math.min(100, volume));
    state.volume = validVolume;

    // Aplicar volumen al reproductor actual si existe
    if (player && player.state.status === AudioPlayerStatus.Playing) {
      // @ts-ignore - AudioResource tiene volumeManager cuando inlineVolume: true
      const resource = (player.state as any).resource;
      if (resource && resource.volume) {
        // Convertir de 0-100 a 0.0-1.0
        resource.volume.setVolume(validVolume / 100);
        console.log(`🔊 Volumen ajustado a ${validVolume}% (${validVolume / 100})`);
      }
    }
  }

  private async deletePlayerMessage(guildId: string): Promise<void> {
    const state = this.queueService.getQueue(guildId);

    if (state.playerMessageId && state.playerChannelId && this.client) {
      try {
        const channel = await this.client.channels.fetch(state.playerChannelId);
        if (channel && channel.isTextBased()) {
          const message = await (channel as any).messages.fetch(state.playerMessageId);
          await message.delete();
        }
      } catch (error) {
        console.log('⚠️ No se pudo borrar el mensaje anterior de botones:', error);
      }
    }
  }

  async sendPlayerButtons(guildId: string, song: Song): Promise<void> {
    const state = this.queueService.getQueue(guildId);

    if (!state.playerChannelId || !this.client) {
      return;
    }

    try {
      const channel = await this.client.channels.fetch(state.playerChannelId);
      if (!channel || !channel.isTextBased()) {
        return;
      }

      const duration = this.formatDuration(song.duration);

      // Importar createPlayerButtons dinámicamente para evitar dependencias circulares
      const { createPlayerButtons } = await import('../components/PlayerButtons.js');
      const playerButtons = createPlayerButtons(state);

      const playerMessage = await (channel as any).send({
        content: `▶️ **Reproduciendo:**\n**${song.title}**\n⏱️ Duración: ${duration}\n👤 Solicitado por: ${song.requestedBy}`,
        components: playerButtons
      });

      state.playerMessageId = playerMessage.id;
    } catch (error) {
      console.error('❌ Error al enviar botones del reproductor:', error);
    }
  }
}
