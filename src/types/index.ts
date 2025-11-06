export interface Song {
  title: string;
  url: string;
  duration: number; // en segundos
  thumbnail?: string;
  requestedBy: string;
}

export interface QueueOptions {
  repeat: 'none' | 'song' | 'queue';
  shuffle: boolean;
}

export interface PlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  currentSong: Song | null;
  queue: Song[];
  options: QueueOptions;
  volume: number; // 0-100
  playerMessageId?: string;
  playerChannelId?: string;
  songStartTime?: number; // timestamp (Date.now()) cuando empezó la canción
  pausedAt?: number; // timestamp cuando se pausó (para calcular tiempo correcto)
  totalPausedTime?: number; // tiempo total pausado en milisegundos
}

export interface BotConfig {
  token: string;
  geminiApiKey: string;
  maxSongDuration: number; // duración máxima para descarga local (en segundos)
}
