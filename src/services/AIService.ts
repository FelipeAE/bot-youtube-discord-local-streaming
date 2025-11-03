import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Song } from '../types/index.js';
import { config } from '../config/index.js';

export class AIService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }

  async getRecommendations(currentSong: Song): Promise<string[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `Basándote en la canción "${currentSong.title}", recomiéndame 5 canciones similares que podrían gustarme.
      Responde SOLO con los nombres de las canciones, una por línea, sin numeración ni texto adicional.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const recommendations = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .slice(0, 5);

      return recommendations;
    } catch (error) {
      console.error('Error obteniendo recomendaciones de IA:', error);
      return [];
    }
  }

  async analyzeMood(songTitle: string): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analiza el mood/ambiente de la canción "${songTitle}" y descríbelo en una sola frase corta (máximo 10 palabras).`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error analizando mood:', error);
      return 'Mood desconocido';
    }
  }
}
