import { YouTube } from 'youtube-sr';
import ytdl from 'youtube-dl-exec';
import type { Song } from '../types/index.js';
import { Readable } from 'stream';

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

      // Usar yt-dlp para obtener el stream de audio
      const stream = ytdl.exec(url, {
        output: '-', // Enviar a stdout
        format: 'bestaudio', // Mejor calidad de audio
        extractAudio: true,
        audioFormat: 'opus', // Formato óptimo para Discord
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
        addHeader: [
          'referer:youtube.com',
          'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        ]
      });

      const audioStream = stream.stdout as Readable;

      // Manejar errores del stream para evitar crashes
      audioStream.on('error', (error) => {
        console.error('⚠️ Error en stream de yt-dlp:', error.message);
      });

      return audioStream;
    } catch (error) {
      console.error('Error creando stream con yt-dlp:', error);
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
