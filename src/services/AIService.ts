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

      // Formatear duración para el prompt
      const hours = Math.floor(currentSong.duration / 3600);
      const minutes = Math.floor((currentSong.duration % 3600) / 60);
      const durationText = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

      // Extraer artista y título del formato "Título - Artista" si es posible
      const titleParts = currentSong.title.split(' - ');
      const hasArtist = titleParts.length >= 2;

      const prompt = `Analiza esta canción y recomiéndame 5 canciones similares:

📌 **Información de la canción:**
- Título completo: ${currentSong.title}
${hasArtist ? `- Artista detectado: ${titleParts[titleParts.length - 1]}` : ''}
- Duración: ${durationText}
- URL: ${currentSong.url}

🎯 **Criterios de similitud:**
- Mismo género musical o estilo
- Energía/tempo similar
- Época o era musical similar (si aplica)
- Artistas con sonido parecido
${hasArtist ? `- Considera otras canciones del artista ${titleParts[titleParts.length - 1]} o artistas relacionados` : ''}

📋 **Formato de respuesta:**
Responde SOLO con 5 nombres de canciones en el formato "Título - Artista", una por línea, sin numeración ni texto adicional.

Ejemplo:
Song Name 1 - Artist Name 1
Song Name 2 - Artist Name 2
...`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const recommendations = text
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.match(/^(ejemplo|example):/i))
        .slice(0, 5);

      console.log(`🤖 Recomendaciones generadas para "${currentSong.title}":`, recommendations);

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
