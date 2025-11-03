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
  playerMessageId?: string;
  playerChannelId?: string;
}

export interface BotConfig {
  token: string;
  geminiApiKey: string;
  maxSongDuration: number; // duración máxima para descarga local (en segundos)
}
