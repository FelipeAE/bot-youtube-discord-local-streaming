import type { Song, QueueOptions, PlayerState } from '../types/index.js';

export class QueueService {
  private queues: Map<string, PlayerState> = new Map();

  getQueue(guildId: string): PlayerState {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, {
        isPlaying: false,
        isPaused: false,
        currentSong: null,
        queue: [],
        options: {
          repeat: 'none',
          shuffle: false,
        },
        volume: 50, // Volumen inicial por defecto: 50%
      });
    }
    return this.queues.get(guildId)!;
  }

  addSong(guildId: string, song: Song): void {
    const state = this.getQueue(guildId);
    state.queue.push(song);
  }

  getNextSong(guildId: string): Song | null {
    const state = this.getQueue(guildId);

    if (state.options.repeat === 'song' && state.currentSong) {
      return state.currentSong;
    }

    if (state.queue.length === 0) {
      if (state.options.repeat === 'queue' && state.currentSong) {
        state.queue.push(state.currentSong);
      } else {
        return null;
      }
    }

    if (state.options.shuffle) {
      const randomIndex = Math.floor(Math.random() * state.queue.length);
      const [song] = state.queue.splice(randomIndex, 1);
      return song;
    }

    return state.queue.shift() || null;
  }

  clearQueue(guildId: string): void {
    const state = this.getQueue(guildId);
    state.queue = [];
    state.currentSong = null;
  }

  toggleShuffle(guildId: string): boolean {
    const state = this.getQueue(guildId);
    state.options.shuffle = !state.options.shuffle;

    // Si se activa shuffle, mezclar la cola inmediatamente
    if (state.options.shuffle && state.queue.length > 0) {
      this.shuffleQueue(guildId);
    }

    return state.options.shuffle;
  }

  shuffleQueue(guildId: string): void {
    const state = this.getQueue(guildId);

    // Algoritmo de Fisher-Yates para mezclar el array
    for (let i = state.queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.queue[i], state.queue[j]] = [state.queue[j], state.queue[i]];
    }
  }

  setRepeat(guildId: string, mode: 'none' | 'song' | 'queue'): void {
    const state = this.getQueue(guildId);
    state.options.repeat = mode;
  }

  moveSong(guildId: string, fromPosition: number, toPosition: number): boolean {
    const state = this.getQueue(guildId);

    // Validar rango (posiciones empiezan en 1)
    if (fromPosition < 1 || fromPosition > state.queue.length) {
      return false;
    }

    if (toPosition < 1 || toPosition > state.queue.length) {
      return false;
    }

    // Convertir a índices 0-based
    const fromIndex = fromPosition - 1;
    const toIndex = toPosition - 1;

    // Extraer la canción de la posición origen
    const [song] = state.queue.splice(fromIndex, 1);

    // Insertar en la posición destino
    state.queue.splice(toIndex, 0, song);

    return true;
  }

  deleteQueue(guildId: string): void {
    this.queues.delete(guildId);
  }
}
