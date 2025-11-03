import { describe, it, expect, beforeEach } from '@jest/globals';
import { QueueService } from '../services/QueueService.js';
import type { Song } from '../types/index.js';

describe('QueueService', () => {
  let queueService: QueueService;
  const testGuildId = 'test-guild-123';

  const mockSong1: Song = {
    title: 'Test Song 1',
    url: 'https://youtube.com/watch?v=test1',
    duration: 180,
    thumbnail: 'https://example.com/thumb1.jpg',
    requestedBy: 'User#1234',
  };

  const mockSong2: Song = {
    title: 'Test Song 2',
    url: 'https://youtube.com/watch?v=test2',
    duration: 240,
    thumbnail: 'https://example.com/thumb2.jpg',
    requestedBy: 'User#5678',
  };

  beforeEach(() => {
    queueService = new QueueService();
  });

  describe('getQueue', () => {
    it('debería crear una nueva cola para un guild si no existe', () => {
      const state = queueService.getQueue(testGuildId);

      expect(state).toBeDefined();
      expect(state.isPlaying).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.currentSong).toBeNull();
      expect(state.queue).toEqual([]);
      expect(state.options.repeat).toBe('none');
      expect(state.options.shuffle).toBe(false);
    });

    it('debería retornar la misma cola en llamadas subsecuentes', () => {
      const state1 = queueService.getQueue(testGuildId);
      const state2 = queueService.getQueue(testGuildId);

      expect(state1).toBe(state2);
    });
  });

  describe('addSong', () => {
    it('debería agregar una canción a la cola', () => {
      queueService.addSong(testGuildId, mockSong1);
      const state = queueService.getQueue(testGuildId);

      expect(state.queue.length).toBe(1);
      expect(state.queue[0]).toEqual(mockSong1);
    });

    it('debería agregar múltiples canciones en orden', () => {
      queueService.addSong(testGuildId, mockSong1);
      queueService.addSong(testGuildId, mockSong2);
      const state = queueService.getQueue(testGuildId);

      expect(state.queue.length).toBe(2);
      expect(state.queue[0]).toEqual(mockSong1);
      expect(state.queue[1]).toEqual(mockSong2);
    });
  });

  describe('getNextSong', () => {
    it('debería retornar null si la cola está vacía', () => {
      const nextSong = queueService.getNextSong(testGuildId);
      expect(nextSong).toBeNull();
    });

    it('debería retornar la primera canción de la cola', () => {
      queueService.addSong(testGuildId, mockSong1);
      queueService.addSong(testGuildId, mockSong2);

      const nextSong = queueService.getNextSong(testGuildId);

      expect(nextSong).toEqual(mockSong1);
      expect(queueService.getQueue(testGuildId).queue.length).toBe(1);
    });

    it('debería repetir la canción actual si repeat mode es "song"', () => {
      const state = queueService.getQueue(testGuildId);
      state.currentSong = mockSong1;
      queueService.setRepeat(testGuildId, 'song');

      const nextSong = queueService.getNextSong(testGuildId);

      expect(nextSong).toEqual(mockSong1);
      expect(state.queue.length).toBe(0);
    });

    it('debería volver a agregar la canción a la cola si repeat mode es "queue"', () => {
      const state = queueService.getQueue(testGuildId);
      state.currentSong = mockSong1;
      queueService.setRepeat(testGuildId, 'queue');

      const nextSong = queueService.getNextSong(testGuildId);

      // Cuando la cola está vacía y repeat es 'queue', agrega la canción a la cola
      // y luego la retorna porque la cola ya no está vacía
      expect(nextSong).toEqual(mockSong1);
      expect(state.queue.length).toBe(0); // Ya fue removida al ser retornada
    });

    it('debería retornar una canción aleatoria si shuffle está activado', () => {
      for (let i = 0; i < 10; i++) {
        queueService.addSong(testGuildId, {
          ...mockSong1,
          title: `Song ${i}`,
          url: `https://youtube.com/watch?v=test${i}`,
        });
      }

      queueService.toggleShuffle(testGuildId);
      const state = queueService.getQueue(testGuildId);
      const initialLength = state.queue.length;

      const nextSong = queueService.getNextSong(testGuildId);

      expect(nextSong).toBeDefined();
      expect(state.queue.length).toBe(initialLength - 1);
    });
  });

  describe('clearQueue', () => {
    it('debería limpiar la cola y la canción actual', () => {
      const state = queueService.getQueue(testGuildId);
      state.currentSong = mockSong1;
      queueService.addSong(testGuildId, mockSong2);

      queueService.clearQueue(testGuildId);

      expect(state.queue.length).toBe(0);
      expect(state.currentSong).toBeNull();
    });
  });

  describe('toggleShuffle', () => {
    it('debería activar shuffle cuando está desactivado', () => {
      const result = queueService.toggleShuffle(testGuildId);
      const state = queueService.getQueue(testGuildId);

      expect(result).toBe(true);
      expect(state.options.shuffle).toBe(true);
    });

    it('debería desactivar shuffle cuando está activado', () => {
      queueService.toggleShuffle(testGuildId); // activar
      const result = queueService.toggleShuffle(testGuildId); // desactivar
      const state = queueService.getQueue(testGuildId);

      expect(result).toBe(false);
      expect(state.options.shuffle).toBe(false);
    });
  });

  describe('setRepeat', () => {
    it('debería configurar el modo de repetición a "none"', () => {
      queueService.setRepeat(testGuildId, 'none');
      const state = queueService.getQueue(testGuildId);

      expect(state.options.repeat).toBe('none');
    });

    it('debería configurar el modo de repetición a "song"', () => {
      queueService.setRepeat(testGuildId, 'song');
      const state = queueService.getQueue(testGuildId);

      expect(state.options.repeat).toBe('song');
    });

    it('debería configurar el modo de repetición a "queue"', () => {
      queueService.setRepeat(testGuildId, 'queue');
      const state = queueService.getQueue(testGuildId);

      expect(state.options.repeat).toBe('queue');
    });
  });

  describe('deleteQueue', () => {
    it('debería eliminar completamente la cola de un guild', () => {
      queueService.addSong(testGuildId, mockSong1);
      queueService.deleteQueue(testGuildId);

      // Al obtener la cola de nuevo, debería crear una nueva
      const state = queueService.getQueue(testGuildId);
      expect(state.queue.length).toBe(0);
      expect(state.currentSong).toBeNull();
    });
  });
});
