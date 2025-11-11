import Database from 'better-sqlite3';
import type { Song } from '../types/index.js';
import path from 'path';
import fs from 'fs';

export interface Favorite {
  id: number;
  guild_id: string;
  user_id: string;
  title: string;
  url: string;
  duration: number;
  thumbnail?: string;
  channel?: string;
  added_at: number;
}

export class FavoritesService {
  private db: Database.Database;

  constructor() {
    // Crear directorio database si no existe
    const databaseDir = path.join(process.cwd(), 'database');
    if (!fs.existsSync(databaseDir)) {
      fs.mkdirSync(databaseDir, { recursive: true });
      console.log('📁 Directorio database creado');
    }

    // Inicializar base de datos
    const dbPath = path.join(databaseDir, 'favorites.db');
    this.db = new Database(dbPath);

    console.log('📊 Base de datos SQLite inicializada:', dbPath);

    // Crear tabla si no existe
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guild_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        duration INTEGER NOT NULL,
        thumbnail TEXT,
        channel TEXT,
        added_at INTEGER NOT NULL,
        UNIQUE(guild_id, user_id, url)
      )
    `;

    this.db.exec(createTableSQL);
    console.log('✅ Tabla favorites verificada/creada');

    // Crear índices para búsquedas más rápidas
    this.db.exec('CREATE INDEX IF NOT EXISTS idx_guild_user ON favorites(guild_id, user_id)');
  }

  /**
   * Agregar canción a favoritos
   */
  addFavorite(guildId: string, userId: string, song: Song): boolean {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO favorites (guild_id, user_id, title, url, duration, thumbnail, channel, added_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        guildId,
        userId,
        song.title,
        song.url,
        song.duration,
        song.thumbnail || null,
        song.channel || null,
        Date.now()
      );

      console.log(`⭐ Favorito agregado: ${song.title} (usuario: ${userId})`);
      return true;
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT') {
        console.log('⚠️ Favorito duplicado, no se agregó');
        return false; // Duplicado
      }
      console.error('Error agregando favorito:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los favoritos de un usuario en un servidor
   */
  getFavorites(guildId: string, userId: string): Favorite[] {
    const stmt = this.db.prepare(`
      SELECT * FROM favorites
      WHERE guild_id = ? AND user_id = ?
      ORDER BY added_at DESC
    `);

    return stmt.all(guildId, userId) as Favorite[];
  }

  /**
   * Obtener favoritos con paginación
   */
  getFavoritesPaginated(guildId: string, userId: string, page: number = 0, limit: number = 10): {
    favorites: Favorite[];
    total: number;
    totalPages: number;
    currentPage: number;
  } {
    // Obtener total de favoritos
    const countStmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM favorites
      WHERE guild_id = ? AND user_id = ?
    `);
    const { count } = countStmt.get(guildId, userId) as { count: number };

    // Calcular paginación
    const totalPages = Math.ceil(count / limit);
    const offset = page * limit;

    // Obtener favoritos de la página actual
    const stmt = this.db.prepare(`
      SELECT * FROM favorites
      WHERE guild_id = ? AND user_id = ?
      ORDER BY added_at DESC
      LIMIT ? OFFSET ?
    `);

    const favorites = stmt.all(guildId, userId, limit, offset) as Favorite[];

    return {
      favorites,
      total: count,
      totalPages,
      currentPage: page
    };
  }

  /**
   * Obtener un favorito específico por índice (posición en la lista del usuario)
   */
  getFavoriteByIndex(guildId: string, userId: string, index: number): Favorite | null {
    const favorites = this.getFavorites(guildId, userId);

    if (index < 1 || index > favorites.length) {
      return null;
    }

    return favorites[index - 1]; // index es 1-based, array es 0-based
  }

  /**
   * Eliminar favorito por ID
   */
  removeFavoriteById(id: number): boolean {
    const stmt = this.db.prepare('DELETE FROM favorites WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Eliminar favorito por índice (posición en la lista)
   */
  removeFavoriteByIndex(guildId: string, userId: string, index: number): Favorite | null {
    const favorite = this.getFavoriteByIndex(guildId, userId, index);

    if (!favorite) {
      return null;
    }

    const removed = this.removeFavoriteById(favorite.id);
    return removed ? favorite : null;
  }

  /**
   * Verificar si una canción ya está en favoritos
   */
  isFavorite(guildId: string, userId: string, url: string): boolean {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM favorites
      WHERE guild_id = ? AND user_id = ? AND url = ?
    `);
    const { count } = stmt.get(guildId, userId, url) as { count: number };
    return count > 0;
  }

  /**
   * Obtener cantidad de favoritos de un usuario
   */
  getFavoritesCount(guildId: string, userId: string): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM favorites
      WHERE guild_id = ? AND user_id = ?
    `);
    const { count } = stmt.get(guildId, userId) as { count: number };
    return count;
  }

  /**
   * Convertir Favorite a Song (para reproducción)
   */
  favoriteToSong(favorite: Favorite, requestedBy: string): Song {
    return {
      title: favorite.title,
      url: favorite.url,
      duration: favorite.duration,
      thumbnail: favorite.thumbnail || undefined,
      channel: favorite.channel || undefined,
      requestedBy
    };
  }

  /**
   * Cerrar la base de datos (para shutdown limpio)
   */
  close(): void {
    this.db.close();
    console.log('📊 Base de datos cerrada');
  }
}
