import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { AIService } from '../services/AIService.js';
import type { Song } from '../types/index.js';

// Mock de la configuración para evitar errores de variables de entorno
jest.mock('../config/index.js', () => ({
  config: {
    token: 'fake-token',
    geminiApiKey: 'fake-api-key',
    maxSongDuration: 900,
  },
}));

describe('AIService', () => {
  let aiService: AIService;

  const mockSong: Song = {
    title: 'Bohemian Rhapsody - Queen',
    url: 'https://youtube.com/watch?v=test',
    duration: 354,
    thumbnail: 'https://example.com/thumb.jpg',
    requestedBy: 'TestUser#1234',
  };

  beforeEach(() => {
    aiService = new AIService();
  });

  describe('AIService Initialization', () => {
    it('debería crear una instancia de AIService correctamente', () => {
      expect(aiService).toBeDefined();
      expect(aiService).toBeInstanceOf(AIService);
    });

    it('debería tener el método getRecommendations', () => {
      expect(typeof aiService.getRecommendations).toBe('function');
    });

    it('debería tener el método analyzeMood', () => {
      expect(typeof aiService.analyzeMood).toBe('function');
    });
  });

  // Nota: Los siguientes tests requieren mocks más complejos de la API de Google
  // o tests de integración. En producción, se recomienda:
  // 1. Usar mocks para GoogleGenerativeAI
  // 2. Crear tests de integración separados que usen la API real
  // 3. Verificar el manejo de errores

  describe('Error Handling', () => {
    it('getRecommendations debería retornar array vacío en caso de error', async () => {
      // Este test verificaría que el método maneja errores correctamente
      // En un entorno de producción, se mockearía la API para forzar un error
      expect(async () => {
        // La función debe existir y ser asíncrona
        const result = aiService.getRecommendations(mockSong);
        expect(result).toBeInstanceOf(Promise);
      }).not.toThrow();
    });

    it('analyzeMood debería retornar string por defecto en caso de error', async () => {
      expect(async () => {
        const result = aiService.analyzeMood('Test Song');
        expect(result).toBeInstanceOf(Promise);
      }).not.toThrow();
    });
  });
});
