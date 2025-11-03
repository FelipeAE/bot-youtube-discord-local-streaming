import { describe, it, expect, beforeEach } from '@jest/globals';
import { YouTubeService } from '../services/YouTubeService.js';

describe('YouTubeService', () => {
  let youtubeService: YouTubeService;

  beforeEach(() => {
    youtubeService = new YouTubeService();
  });

  // Tests comentados temporalmente - necesitan ser actualizados para youtube-sr

  // describe('shouldDownloadLocally', () => {
  //   it('debería retornar true para videos menores a 15 minutos', () => {
  //     const duration = 14 * 60; // 14 minutos
  //     const result = youtubeService.shouldDownloadLocally(duration);
  //
  //     expect(result).toBe(true);
  //   });
  //
  //   it('debería retornar true para videos de exactamente 15 minutos', () => {
  //     const duration = 15 * 60; // 15 minutos
  //     const result = youtubeService.shouldDownloadLocally(duration);
  //
  //     expect(result).toBe(true);
  //   });
  //
  //   it('debería retornar false para videos mayores a 15 minutos', () => {
  //     const duration = 16 * 60; // 16 minutos
  //     const result = youtubeService.shouldDownloadLocally(duration);
  //
  //     expect(result).toBe(false);
  //   });
  //
  //   it('debería retornar true para videos muy cortos (menos de 1 minuto)', () => {
  //     const duration = 30; // 30 segundos
  //     const result = youtubeService.shouldDownloadLocally(duration);
  //
  //     expect(result).toBe(true);
  //   });
  //
  //   it('debería retornar false para videos muy largos (más de 1 hora)', () => {
  //     const duration = 90 * 60; // 1.5 horas
  //     const result = youtubeService.shouldDownloadLocally(duration);
  //
  //     expect(result).toBe(false);
  //   });
  // });

  describe('searchVideo', () => {
    it('debería tener la función searchVideo', async () => {
      expect(typeof youtubeService.searchVideo).toBe('function');
    });

    // Nota: Los tests para getVideoInfo y URLs válidas requieren
    // conexión a internet y mocks de youtube-sr, por lo que se omiten
    // en tests unitarios básicos. Se pueden agregar como tests de integración.
  });

  describe('getAudioStream', () => {
    it('debería tener la función getAudioStream', () => {
      expect(typeof youtubeService.getAudioStream).toBe('function');
    });
  });
});
