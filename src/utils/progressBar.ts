/**
 * Formatea segundos a formato MM:SS o HH:MM:SS
 * @param seconds Segundos totales
 * @returns String formateado (ej: "3:45" o "1:23:45")
 */
export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Crea una barra de progreso visual
 * @param current Tiempo actual en segundos
 * @param total Tiempo total en segundos
 * @returns String con barra de progreso (ej: "▓▓▓▓▓▓░░░░ 60%")
 */
export function createProgressBar(current: number, total: number): string {
  if (total <= 0) return '░░░░░░░░░░ 0%';

  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  const barLength = 10;
  const filledLength = Math.round((percentage / 100) * barLength);

  const filled = '▓'.repeat(filledLength);
  const empty = '░'.repeat(barLength - filledLength);

  return `${filled}${empty} ${Math.round(percentage)}%`;
}

/**
 * Calcula el tiempo transcurrido considerando pausas
 * @param songStartTime Timestamp cuando empezó la canción
 * @param isPaused Si la canción está pausada
 * @param pausedAt Timestamp cuando se pausó
 * @param totalPausedTime Tiempo total en pausa (ms)
 * @returns Segundos transcurridos
 */
export function calculateElapsedTime(
  songStartTime: number | undefined,
  isPaused: boolean,
  pausedAt: number | undefined,
  totalPausedTime: number = 0
): number {
  if (!songStartTime) return 0;

  const now = Date.now();

  if (isPaused && pausedAt) {
    // Si está pausado, calculamos hasta el momento de la pausa
    const elapsedMs = (pausedAt - songStartTime) - totalPausedTime;
    return Math.max(0, elapsedMs / 1000);
  } else {
    // Si está reproduciéndose, calculamos hasta ahora
    const elapsedMs = (now - songStartTime) - totalPausedTime;
    return Math.max(0, elapsedMs / 1000);
  }
}
