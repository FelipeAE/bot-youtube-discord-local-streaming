import { describe, it, expect } from '@jest/globals';
import type { Song, QueueOptions, PlayerState, BotConfig } from '../types/index.js';

describe('TypeScript Types', () => {
  describe('Song Type', () => {
    it('debería aceptar un objeto Song válido', () => {
      const song: Song = {
        title: 'Test Song',
        url: 'https://youtube.com/watch?v=test',
        duration: 180,
        thumbnail: 'https://example.com/thumb.jpg',
        requestedBy: 'User#1234',
      };

      expect(song.title).toBe('Test Song');
      expect(song.duration).toBe(180);
      expect(song.requestedBy).toBe('User#1234');
    });

    it('debería permitir thumbnail opcional', () => {
      const song: Song = {
        title: 'Test Song',
        url: 'https://youtube.com/watch?v=test',
        duration: 180,
        requestedBy: 'User#1234',
      };

      expect(song.thumbnail).toBeUndefined();
    });
  });

  describe('QueueOptions Type', () => {
    it('debería aceptar opciones de cola válidas', () => {
      const options: QueueOptions = {
        repeat: 'none',
        shuffle: false,
      };

      expect(options.repeat).toBe('none');
      expect(options.shuffle).toBe(false);
    });

    it('debería aceptar todos los modos de repetición', () => {
      const optionsNone: QueueOptions = {
        repeat: 'none',
        shuffle: false,
      };
      const optionsSong: QueueOptions = {
        repeat: 'song',
        shuffle: false,
      };
      const optionsQueue: QueueOptions = {
        repeat: 'queue',
        shuffle: false,
      };

      expect(optionsNone.repeat).toBe('none');
      expect(optionsSong.repeat).toBe('song');
      expect(optionsQueue.repeat).toBe('queue');
    });
  });

  describe('PlayerState Type', () => {
    it('debería aceptar un estado de reproductor válido', () => {
      const state: PlayerState = {
        isPlaying: false,
        isPaused: false,
        currentSong: null,
        queue: [],
        options: {
          repeat: 'none',
          shuffle: false,
        },
      };

      expect(state.isPlaying).toBe(false);
      expect(state.currentSong).toBeNull();
      expect(state.queue).toEqual([]);
    });

    it('debería aceptar un estado con canción actual', () => {
      const mockSong: Song = {
        title: 'Test',
        url: 'https://youtube.com/test',
        duration: 180,
        requestedBy: 'User#1234',
      };

      const state: PlayerState = {
        isPlaying: true,
        isPaused: false,
        currentSong: mockSong,
        queue: [],
        options: {
          repeat: 'song',
          shuffle: true,
        },
      };

      expect(state.isPlaying).toBe(true);
      expect(state.currentSong).toEqual(mockSong);
      expect(state.options.shuffle).toBe(true);
    });
  });

  describe('BotConfig Type', () => {
    it('debería aceptar una configuración válida', () => {
      const config: BotConfig = {
        token: 'test-token',
        geminiApiKey: 'test-api-key',
        maxSongDuration: 900,
      };

      expect(config.token).toBe('test-token');
      expect(config.geminiApiKey).toBe('test-api-key');
      expect(config.maxSongDuration).toBe(900);
    });
  });
});
