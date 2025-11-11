import { YouTube } from 'youtube-sr';
import ytdl from 'youtube-dl-exec';
import type { Song } from '../types/index.js';
import { Readable } from 'stream';
import fs from 'fs';
import path from 'path';

export class YouTubeService {
  constructor() {
    // youtube-sr no requiere configuración inicial
  }

  /**
   * Obtiene información de un video individual
   */
  async getVideoInfo(url: string, requestedBy: string): Promise<Song | null> {
    try {
      const video = await YouTube.getVideo(url);
      if (!video) {
        return null;
      }

      return {
        title: video.title || 'Unknown Title',
        url: video.url,
        duration: video.duration / 1000, // youtube-sr retorna en ms
        thumbnail: video.thumbnail?.url,
        requestedBy,
      };
    } catch (error) {
      console.error('Error obteniendo info del video:', error);
      return null;
    }
  }

  /**
   * Busca o procesa una query (puede ser URL, búsqueda, o playlist)
   */
  async searchVideo(query: string, requestedBy: string): Promise<Song | null> {
    try {
      // Detectar si es una URL de playlist
      if (this.isPlaylistURL(query)) {
        console.log('⚠️ Detectada playlist, usa el método getPlaylistVideos() para procesar');
        return null;
      }

      // Detectar si es una URL de video
      if (this.isVideoURL(query)) {
        return this.getVideoInfo(query, requestedBy);
      }

      // Si no es URL, buscar en YouTube
      console.log(`🔍 Buscando: "${query}"`);
      const searchResults = await YouTube.search(query, {
        limit: 1,
        type: 'video'
      });

      if (!searchResults || searchResults.length === 0) {
        console.log('❌ No se encontraron resultados');
        return null;
      }

      const video = searchResults[0];

      console.log(`✅ Video encontrado: ${video.title} - URL: ${video.url}`);

      return {
        title: video.title || 'Unknown Title',
        url: video.url,
        duration: video.duration / 1000, // youtube-sr retorna en ms
        thumbnail: video.thumbnail?.url,
        requestedBy,
      };
    } catch (error) {
      console.error('Error buscando video:', error);
      return null;
    }
  }

  /**
   * Busca múltiples videos y retorna un array de resultados
   * Útil para el comando !search que permite elegir entre varias opciones
   */
  async searchMultiple(query: string, limit: number = 5): Promise<Song[]> {
    try {
      console.log(`🔍 Buscando múltiples resultados para: "${query}"`);
      const searchResults = await YouTube.search(query, {
        limit: limit,
        type: 'video'
      });

      if (!searchResults || searchResults.length === 0) {
        console.log('❌ No se encontraron resultados');
        return [];
      }

      console.log(`✅ ${searchResults.length} videos encontrados`);

      // Convertir resultados al formato Song
      return searchResults.map((video: any) => ({
        title: video.title || 'Unknown Title',
        url: video.url,
        duration: video.duration / 1000, // youtube-sr retorna en ms
        thumbnail: video.thumbnail?.url,
        requestedBy: '', // Se asignará cuando el usuario seleccione
        channel: video.channel?.name || 'Unknown Channel', // Metadata adicional
      }));
    } catch (error) {
      console.error('Error buscando múltiples videos:', error);
      return [];
    }
  }

  /**
   * Obtiene todos los videos de una playlist
   * Usa yt-dlp para manejar playlists grandes (300+ videos)
   */
  async getPlaylistVideos(url: string, requestedBy: string, maxVideos: number = 500): Promise<Song[]> {
    try {
      console.log('📋 Obteniendo información de playlist con yt-dlp...');

      // Usar yt-dlp para obtener información de la playlist
      const playlistInfo = await ytdl(url, {
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificates: true,
        preferFreeFormats: true,
        skipDownload: true,
        flatPlaylist: true, // Importante: obtiene todos los videos sin descargar
        playlistEnd: maxVideos, // Limitar cantidad de videos
      }) as any;

      if (!playlistInfo || !playlistInfo.entries) {
        console.error('No se pudo obtener información de la playlist');
        return [];
      }

      const totalVideos = playlistInfo.entries.length;
      console.log(`📋 Playlist: "${playlistInfo.title || 'Unknown'}" - ${totalVideos} videos`);

      // Convertir la información a nuestro formato Song
      const songs: Song[] = playlistInfo.entries
        .filter((entry: any) => entry && entry.url) // Filtrar entradas inválidas
        .map((entry: any) => ({
          title: entry.title || 'Unknown Title',
          url: entry.url || `https://www.youtube.com/watch?v=${entry.id}`,
          duration: entry.duration || 0,
          thumbnail: entry.thumbnail || entry.thumbnails?.[0]?.url,
          requestedBy,
        }));

      console.log(`✅ Total de videos cargados: ${songs.length}/${totalVideos}`);

      if (totalVideos > maxVideos) {
        console.log(`⚠️ Playlist tiene ${totalVideos} videos, agregando solo los primeros ${maxVideos}`);
      }

      return songs;
    } catch (error) {
      console.error('Error obteniendo playlist con yt-dlp:', error);

      // Fallback a youtube-sr si yt-dlp falla
      console.log('⚠️ Intentando con youtube-sr como fallback...');
      try {
        const playlist = await YouTube.getPlaylist(url);
        if (!playlist) return [];

        await playlist.fetch();
        const videos = playlist.videos.slice(0, Math.min(100, maxVideos));

        return videos.map((video: any) => ({
          title: video.title || 'Unknown Title',
          url: video.url,
          duration: video.duration / 1000,
          thumbnail: video.thumbnail?.url,
          requestedBy,
        }));
      } catch (fallbackError) {
        console.error('Error en fallback:', fallbackError);
        return [];
      }
    }
  }

  /**
   * Crea un stream de audio para reproducción
   * Usa yt-dlp para streaming directo (más robusto que ytdl-core)
   */
  async getAudioStream(url: string): Promise<Readable> {
    try {
      if (!url || url === 'undefined') {
        throw new Error(`URL inválida: ${url}`);
      }

      console.log(`🎵 Creando stream con yt-dlp para: ${url}`);

      // Verificar si existe archivo de cookies
      const cookiesPath = path.join(process.cwd(), 'cookies.txt');
      const hasCookies = fs.existsSync(cookiesPath);

      if (hasCookies) {
        console.log('🍪 Usando cookies de YouTube');
      }

      // Configurar opciones de yt-dlp (formato muy permisivo)
      const options: any = {
        output: '-', // Enviar a stdout
        format: 'bestaudio/best', // Más permisivo - acepta cualquier formato
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: [
          'referer:youtube.com',
          'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ]
      };

      // Priorizar cookies del navegador (siempre actualizadas)
      // Si falla, intentar con archivo cookies.txt
      if (process.env.YOUTUBE_COOKIES_FROM_BROWSER) {
        // Usar cookies directamente del navegador (ej: "chrome", "firefox", "edge")
        options.cookiesFromBrowser = process.env.YOUTUBE_COOKIES_FROM_BROWSER;
        console.log(`🍪 Usando cookies desde navegador: ${process.env.YOUTUBE_COOKIES_FROM_BROWSER}`);
      } else if (hasCookies) {
        // Fallback: usar archivo cookies.txt
        options.cookies = cookiesPath;
      }

      // Usar yt-dlp para obtener el stream de audio
      const stream = ytdl.exec(url, options);

      const audioStream = stream.stdout as Readable;
      const stderrChunks: string[] = [];

      // Capturar stderr para detectar errores de restricción de edad
      if (stream.stderr) {
        stream.stderr.on('data', (chunk) => {
          stderrChunks.push(chunk.toString());
        });
      }

      // Manejar errores del proceso
      stream.on('error', (error: any) => {
        const stderr = stderrChunks.join('');

        // Detectar video con restricción de edad
        if (stderr.includes('Sign in to confirm your age') ||
            stderr.includes('age-restricted') ||
            stderr.includes('inappropriate for some users')) {
          const ageError = new Error('Este video tiene restricción de edad y requiere autenticación');
          (ageError as any).code = 'AGE_RESTRICTED';
          throw ageError;
        }

        // Detectar video no disponible
        if (stderr.includes('Video unavailable') ||
            stderr.includes('This video is unavailable')) {
          const unavailableError = new Error('Este video no está disponible');
          (unavailableError as any).code = 'VIDEO_UNAVAILABLE';
          throw unavailableError;
        }

        // Error genérico
        console.error('⚠️ Error en proceso yt-dlp:', error.message);
        console.error('📋 stderr:', stderr);
        throw error;
      });

      // Manejar errores del stream
      audioStream.on('error', (error) => {
        console.error('⚠️ Error en stream de yt-dlp:', error.message);
      });

      return audioStream;
    } catch (error: any) {
      console.error('Error creando stream con yt-dlp:', error);

      // Si es un error de child process, extraer información útil
      if (error.stderr) {
        const stderr = error.stderr;

        // Detectar restricción de edad
        if (stderr.includes('Sign in to confirm your age') ||
            stderr.includes('age-restricted')) {
          const ageError = new Error('Este video tiene restricción de edad y requiere autenticación');
          (ageError as any).code = 'AGE_RESTRICTED';
          throw ageError;
        }

        // Detectar video no disponible
        if (stderr.includes('Video unavailable')) {
          const unavailableError = new Error('Este video no está disponible');
          (unavailableError as any).code = 'VIDEO_UNAVAILABLE';
          throw unavailableError;
        }

        // Detectar formato no disponible
        if (stderr.includes('Requested format is not available')) {
          const formatError = new Error('El formato de este video no está disponible para streaming');
          (formatError as any).code = 'FORMAT_UNAVAILABLE';
          throw formatError;
        }

        // Detectar problemas con cookies
        if (stderr.includes('unable to download video data') ||
            stderr.includes('HTTP Error 403')) {
          const cookieError = new Error('Error de autenticación - verifica tus cookies de YouTube');
          (cookieError as any).code = 'AUTH_ERROR';
          throw cookieError;
        }
      }

      throw error;
    }
  }

  /**
   * Valida si una URL es de un video de YouTube
   */
  private isVideoURL(url: string): boolean {
    // Patrón para URLs de videos de YouTube
    const videoPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+/;
    return videoPattern.test(url);
  }

  /**
   * Valida si una URL es de una playlist de YouTube
   */
  private isPlaylistURL(url: string): boolean {
    // Patrón para URLs de playlists de YouTube
    const playlistPattern = /[?&]list=[\w-]+/;
    return playlistPattern.test(url);
  }

  /**
   * Valida el tipo de URL de YouTube (público para uso en comandos)
   */
  isValidYouTubeURL(url: string): 'video' | 'playlist' | false {
    // Playlist tiene prioridad porque puede contener patrón de video también
    if (this.isPlaylistURL(url)) return 'playlist';
    if (this.isVideoURL(url)) return 'video';
    return false;
  }
}
