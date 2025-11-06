# Resumen de Cambios Recientes - Bot de Música Discord

## Última Actualización: 2025-11-06

### 🎉 Version 3.5 - Now Playing con Progreso & Cookies Mejoradas

Se implementó el sistema de progreso en tiempo real y sistema de cookies automático desde navegador.

---

## ✅ Cambios Implementados (Sesión 2025-11-06)

### 1. **Comando NowPlaying con Barra de Progreso** 🎵
- ✅ Nuevo comando: `!nowplaying` (aliases: `!np`, `!current`)
- ✅ Muestra tiempo transcurrido con barra visual: `2:30 [▓▓▓▓▓▓░░░░] 60% 5:00`
- ✅ Embed con thumbnail, volumen actual, estado (pausado/repeat/shuffle)
- ✅ Color dinámico: 🔵 Azul (reproduciéndose) / 🟠 Naranja (pausado)
- ✅ Cálculo preciso considerando pausas acumuladas
- **Archivos nuevos**:
  - `src/commands/nowplaying.ts` - Comando principal
  - `src/utils/progressBar.ts` - Utilidades de formato y progreso
- **Archivos modificados**:
  - `src/types/index.ts` - Agregados: `songStartTime`, `pausedAt`, `totalPausedTime`
  - `src/services/AudioService.ts` - Rastreo de timestamps en play/pause/resume/stop
  - `src/index.ts` - Comando registrado (total: 13 comandos)

### 2. **Botón Now Playing Actualizado** 🎵
- ✅ Ahora muestra el mismo embed con progreso que el comando
- ✅ **ADEMÁS** regenera los botones del reproductor
- ✅ Embed es ephemeral (solo lo ve quien hace click)
- ✅ Botones se actualizan en el chat principal
- **Beneficio**: Progreso en tiempo real + botones sincronizados

### 3. **Skip Mejorado (Comando y Botón)** ⏭️
- ✅ Verifica si hay más canciones antes de hacer skip
- ✅ Considera modos repeat (song/queue)
- ✅ Muestra nombre de la canción saltada
- ✅ Si NO hay más canciones:
  - Muestra mensaje: "⚠️ No hay más canciones. El bot se detendrá."
  - Detiene reproducción y desconecta del canal
  - Limpia la cola
- ✅ Si SÍ hay más canciones: Skip normal
- **Archivos modificados**:
  - `src/commands/skip.ts` - Lógica de verificación de cola
  - `src/handlers/ButtonHandler.ts` - Mismo comportamiento en botón

### 4. **Sistema de Cookies Automático** 🍪
- ✅ Prioriza cookies **directamente del navegador** (siempre actualizadas)
- ✅ Fallback a `cookies.txt` si no está configurado
- ✅ No requiere exportar manualmente
- ✅ Nunca expiran (usa sesión actual del navegador)
- ✅ Configuración en `.env`:
  ```env
  YOUTUBE_COOKIES_FROM_BROWSER=firefox  # chrome, firefox, edge, opera, brave
  ```
- **Archivos modificados**:
  - `src/services/YouTubeService.ts` - Soporte para `cookiesFromBrowser`
  - `.env` - Nueva variable de entorno

### 5. **Consistencia Comando-Botón**
- ✅ Todos los botones ahora tienen el mismo comportamiento que sus comandos
- ✅ Skip: Verifica cola en ambos
- ✅ Now Playing: Muestra progreso + regenera botones
- ✅ Pause/Resume: Actualizan timestamps correctamente

---

## 🎮 Comandos Actualizados (v3.5)

### Comando `!nowplaying` **[NUEVO]**
```bash
!nowplaying   # Comando completo
!np           # Alias corto
!current      # Alias alternativo
```

**Muestra:**
- 🎵 Título de la canción (con thumbnail)
- ⏱️ Progreso visual: `2:30 [▓▓▓▓▓▓░░░░] 60% 5:00`
- 👤 Usuario que la pidió
- 🔊 Volumen actual (0-100%)
- 🔗 URL del video
- 📌 Estado: Pausado, Repetir 1, Repetir Cola, Aleatorio

### Comando `!skip` **[MEJORADO]**
```bash
!skip         # Saltar canción actual
!s            # Alias corto
!next         # Alias alternativo
```

**Nuevo comportamiento:**
- ✅ Muestra nombre de canción saltada
- ✅ Verifica si hay más canciones
- ✅ Si no hay más: Avisa y detiene el bot

---

## 📊 Comparación v3.0 vs v3.5

| Aspecto | v3.0 (11-04) | v3.5 (11-06) |
|---------|--------------|--------------|
| **Comandos totales** | 12 | 13 |
| **Now Playing** | ❌ Solo botón básico | ✅ Comando + Botón con progreso |
| **Progreso en tiempo real** | ❌ | ✅ Barra visual + timestamps |
| **Skip inteligente** | ⚠️ Básico | ✅ Verifica cola y repeat |
| **Sistema de cookies** | ⚠️ Archivo estático | ✅ Desde navegador (auto-actualizado) |
| **Botón-Comando consistencia** | ⚠️ Parcial | ✅ 100% sincronizados |

---

## 🎯 Estado Actual del Bot (v3.5)

### ✅ Funcionando:
- Bot conectado sin errores
- 13 comandos cargados
- Sistema de streaming activo
- 9 botones interactivos (4 dinámicos)
- Control de volumen completo
- Recomendaciones IA mejoradas
- **Progreso en tiempo real** ⭐ NUEVO
- **Cookies automáticas desde navegador** ⭐ NUEVO
- **Skip inteligente** ⭐ NUEVO

### 🔧 Comandos Disponibles:
1. `!play [URL/búsqueda]` - Reproducir música (soporta playlists)
2. `!pause` - Pausar reproducción
3. `!resume` - Reanudar reproducción
4. `!skip` - Saltar canción ⭐ MEJORADO
5. `!stop` - Detener y limpiar cola
6. `!queue` - Ver cola (paginada)
7. `!shuffle` - Activar/desactivar aleatorio
8. `!repeat [none/song/queue]` - Modo repetición
9. `!volume [0-100]` - Ajustar volumen
10. `!move <pos1> <pos2>` - Reordenar cola
11. `!nowplaying` - Ver progreso actual ⭐ NUEVO
12. `!recommend` - Recomendaciones de IA
13. `!help` - Ayuda

---

## 🚀 Próximos Pasos Sugeridos

### Prioridad Alta (Próxima Sesión):
1. **Sistema de Favoritos** 🔜
   - Database SQLite con `better-sqlite3`
   - Comandos: `!favorite`, `!favorites`, `!unfavorite`, `!playfavorite`
   - Persistencia por usuario y servidor
   - Lista paginada de favoritos
   - Estimado: ~25 horas (2-3 sesiones)

### Prioridad Media:
2. **Seek Command** (Opcional - Técnicamente limitado)
   - Reinicio desde timestamp (no true seeking)
   - Requiere re-arquitectura del streaming
   - Estimado: ~15 horas

3. **Búsqueda avanzada**
   - Filtros por duración
   - Filtros por canal

### Prioridad Baja:
4. **Integraciones externas**
   - Spotify (solo metadata, reproducción desde YouTube)
   - SoundCloud
   - Bandcamp

---

## 💻 Notas Técnicas (v3.5)

### Sistema de Progreso:
```typescript
// Timestamps en PlayerState
interface PlayerState {
  songStartTime?: number;      // Date.now() cuando empezó la canción
  pausedAt?: number;            // Date.now() cuando se pausó
  totalPausedTime?: number;     // Tiempo acumulado en pausa (ms)
  // ...
}

// Cálculo del progreso
const elapsed = (Date.now() - songStartTime) - totalPausedTime;
const progress = elapsed / (duration * 1000);
```

### Sistema de Cookies desde Navegador:
```typescript
// YouTubeService.ts
if (process.env.YOUTUBE_COOKIES_FROM_BROWSER) {
  options.cookiesFromBrowser = process.env.YOUTUBE_COOKIES_FROM_BROWSER;
  // yt-dlp lee cookies directamente del navegador
} else if (hasCookies) {
  options.cookies = cookiesPath; // Fallback a cookies.txt
}
```

### Skip Inteligente:
```typescript
// Verificar si hay siguiente canción
const hasNextSong = state.queue.length > 0 ||
                    state.options.repeat === 'song' ||
                    state.options.repeat === 'queue';

if (!hasNextSong) {
  // Detener y desconectar
  audioService.stop(guildId);
  queueService.clearQueue(guildId);
}
```

---

## 📁 Archivos Modificados (Sesión 11-06)

### Nuevos Archivos:
1. **src/commands/nowplaying.ts** - Comando con progreso
2. **src/utils/progressBar.ts** - Utilidades de formato

### Archivos Actualizados:
1. **src/types/index.ts**
   - Agregados campos: `songStartTime`, `pausedAt`, `totalPausedTime`

2. **src/services/AudioService.ts**
   - `play()`: Registra `songStartTime`, resetea pausas
   - `pause()`: Registra `pausedAt`
   - `resume()`: Calcula y acumula `totalPausedTime`
   - `stop()`: Resetea todos los timestamps

3. **src/services/YouTubeService.ts**
   - Soporte para `cookiesFromBrowser` (lee desde navegador)
   - Fallback a `cookies.txt`

4. **src/handlers/ButtonHandler.ts**
   - `handleNowPlaying()`: Muestra embed con progreso + regenera botones
   - `handleSkip()`: Verifica cola antes de skip

5. **src/commands/skip.ts**
   - Verifica cola y repeat antes de skip
   - Mensaje informativo si no hay más canciones

6. **src/index.ts**
   - Registrado comando `nowplaying`
   - Total: 13 comandos

7. **.env**
   - Agregada variable: `YOUTUBE_COOKIES_FROM_BROWSER=firefox`

---

## 📚 Uso del Sistema de Cookies

### Configuración Actual (Firefox):
```env
YOUTUBE_COOKIES_FROM_BROWSER=firefox
```

### Cambiar Navegador:
```env
# Chrome
YOUTUBE_COOKIES_FROM_BROWSER=chrome

# Microsoft Edge
YOUTUBE_COOKIES_FROM_BROWSER=edge

# Opera
YOUTUBE_COOKIES_FROM_BROWSER=opera

# Brave
YOUTUBE_COOKIES_FROM_BROWSER=brave
```

### Usar cookies.txt en lugar del navegador:
```env
# Comentar la línea
# YOUTUBE_COOKIES_FROM_BROWSER=firefox
```

### Requisitos:
- ✅ Estar logeado en YouTube en el navegador especificado
- ✅ Cerrar el navegador antes de ejecutar el bot (acceso exclusivo)
- ✅ Mantener sesión activa de YouTube

---

## 📝 Historial de Versiones

### v3.5 (2025-11-06) ⭐ ACTUAL
- ✅ Comando `!nowplaying` con barra de progreso
- ✅ Botón Now Playing regenera botones
- ✅ Skip inteligente (verifica cola)
- ✅ Sistema de cookies desde navegador
- ✅ 13 comandos totales

### v3.0 (2025-11-04)

## ✅ Cambios Implementados (Sesión 2025-11-04)

### 1. **Arreglo de Botones Duplicados**
- ❌ Eliminado: Envío duplicado de botones en `play.ts`
- ✅ Ahora: Solo `AudioService.ts` envía los botones una vez
- **Beneficio**: Sin duplicación visual, chat más limpio

### 2. **Mensajes Auto-Eliminables**
- ✅ Todos los mensajes temporales se borran automáticamente:
  - ⏱️ 5 segundos: pause, resume, skip, stop, shuffle, repeat
  - ⏱️ 8 segundos: "Agregado a la cola"
  - ⏱️ 10 segundos: "Playlist agregada"
- **Beneficio**: Chat limpio, sin spam de mensajes antiguos

### 3. **Control de Volumen Completo**
- ✅ Nuevo comando: `!volume [0-100]` (aliases: `!vol`, `!v`)
- ✅ Nuevo botón interactivo: `🔊 [Volumen]%`
- ✅ Menú ephemeral con ajustes rápidos: `-10% | -5% | +5% | +10%`
- ✅ Volumen se persiste por servidor (default: 50%)
- ✅ Se aplica automáticamente a nuevas canciones
- **Ubicación**:
  - `src/commands/volume.ts` - Comando
  - `AudioService.ts:245-268` - Métodos getVolume/setVolume
  - `ButtonHandler.ts:422-524` - Handlers de botones

### 4. **Recomendaciones de IA Mejoradas**
- ✅ Prompt mejorado con contexto completo:
  - Título + Artista (extraído automáticamente)
  - Duración de la canción
  - URL del video
  - Criterios específicos (género, tempo, época)
- ✅ Formato consistente: "Título - Artista"
- ✅ Filtrado de ejemplos en respuesta
- **Beneficio**: Recomendaciones más precisas y relevantes
- **Ubicación**: `src/services/AIService.ts:12-65`

### 5. **Botón de Repeat Interactivo**
- ✅ Cicla entre 3 modos con un click:
  - `➡️ Normal` (Gris) → Sin repetición
  - `🔂 Repetir 1` (Verde) → Repite canción actual
  - `🔁 Repetir Cola` (Verde) → Repite toda la cola
- ✅ Actualización visual dinámica
- **Ubicación**: `ButtonHandler.ts:392-420`

### 6. **Interfaz de Botones Renovada**
- ✅ 9 botones totales (antes: 7)
- ✅ 4 botones dinámicos: Pause, Shuffle, Repeat, Volume
- ✅ Función `createPlayerButtons()` unificada
- ❌ Eliminadas: Funciones `updatePauseButton()` y `updateShuffleButton()`
- **Beneficio**: Código más mantenible, estado sincronizado

---

## 🎮 Botones del Reproductor (v3.0)

### **Fila 1 - Controles Principales:**
```
┌──────────────────┬───────────────────┬──────────────┬──────────────┐
│ 🎵 Now Playing   │ ⏸️ Pausar /       │ ⏭️ Saltar    │ ⏹️ Detener   │
│                  │ ▶️ Reanudar       │              │              │
└──────────────────┴───────────────────┴──────────────┴──────────────┘
```

### **Fila 2 - Funciones Adicionales:**
```
┌────────┬─────────────┬──────────────┬─────────────┬────────────┐
│ 📋     │ 🔀 Mezclar/ │ ➡️ Normal/   │ 🔊 50%      │ 🤖 IA      │
│ Cola   │ Mezclado ✓  │ 🔂 Repetir 1/│ (Dinámico)  │            │
│        │             │ 🔁 Repetir   │             │            │
└────────┴─────────────┴──────────────┴─────────────┴────────────┘
```

**Botón de Volumen:** Al hacer click abre menú:
```
┌─────────┬─────────┬─────────┬─────────┐
│ -10%    │ -5%     │ +5%     │ +10%    │
└─────────┴─────────┴─────────┴─────────┘
```

---

## 📁 Archivos Modificados (Sesión 11-04)

### Nuevos Archivos:
1. **src/commands/volume.ts** - Comando de volumen

### Archivos Actualizados:
1. **src/components/PlayerButtons.ts**
   - Refactorización completa
   - Parámetro `state?: PlayerState` para botones dinámicos
   - Eliminadas funciones legacy

2. **src/services/AudioService.ts**
   - Métodos `getVolume()` y `setVolume()`
   - Aplicación automática de volumen a nuevas canciones
   - Actualizado `sendPlayerButtons()` para pasar state

3. **src/handlers/ButtonHandler.ts**
   - Handler `handleRepeat()` - Ciclo de modos
   - Handler `handleVolume()` - Menú de volumen
   - Handler `handleVolumeAdjust()` - Ajustes rápidos
   - Actualizados todos los handlers para usar `createPlayerButtons(state)`

4. **src/commands/*.ts** (play, pause, resume, skip, stop, shuffle, repeat)
   - Mensajes auto-eliminables con `setTimeout()`
   - Mejor experiencia de usuario

5. **src/types/index.ts**
   - Agregado `volume: number` a `PlayerState`

6. **src/services/QueueService.ts**
   - Volumen inicial: 50%

7. **src/__tests__/types.test.ts**
   - Tests actualizados con campo `volume`

8. **src/index.ts**
   - Registrado comando `volume`
   - Total: 11 comandos

---

## 📊 Comparación v2.0 vs v3.0

| Aspecto | v2.0 (11-03) | v3.0 (11-04) |
|---------|--------------|--------------|
| **Botones** | 7 | 9 |
| **Botones dinámicos** | 2 | 4 |
| **Control volumen** | ❌ | ✅ Botón + Comando |
| **Modo repeat** | ❌ Solo comando | ✅ Botón interactivo |
| **Mensajes temporales** | ⚠️ Persisten | ✅ Auto-eliminables |
| **Botones duplicados** | ❌ Bug | ✅ Arreglado |
| **Recomendaciones IA** | ⚠️ Solo título | ✅ Contexto completo |
| **Total comandos** | 10 | 11 |

---

## 🎯 Estado Actual del Bot (v3.0)

### ✅ Funcionando:
- Bot conectado sin errores
- 11 comandos cargados
- Sistema de streaming activo
- 9 botones interactivos
- Control de volumen completo
- Recomendaciones IA mejoradas
- Mensajes auto-eliminables
- Sin duplicación de botones

### 🔧 Comandos Disponibles:
1. `!play [URL/búsqueda]` - Reproducir música (soporta playlists)
2. `!pause` - Pausar reproducción
3. `!resume` - Reanudar reproducción
4. `!skip` - Saltar canción
5. `!stop` - Detener y limpiar cola
6. `!queue` - Ver cola (paginada)
7. `!shuffle` - Activar/desactivar aleatorio
8. `!repeat [none/song/queue]` - Modo repetición
9. `!volume [0-100]` - Ajustar volumen **[NUEVO]**
10. `!recommend` - Recomendaciones de IA
11. `!help` - Ayuda

---

## 🚀 Próximos Pasos Sugeridos

### Prioridad Alta:
1. **Comando `/move` para reordenar cola** 🔜
   - Mover canciones de posición
   - Ejemplo: `!move 15 2` (mover canción #15 a posición #2)
   - Útil para priorizar canciones

### Prioridad Media:
2. **Comando `/nowplaying` mejorado**
   - Mostrar progreso actual
   - Tiempo transcurrido / total
   - Barra de progreso visual

3. **Búsqueda avanzada**
   - Filtros por duración
   - Filtros por canal

### Prioridad Baja:
4. **Optimizaciones adicionales**
   - Cache de búsquedas frecuentes
   - Pre-carga del siguiente video
   - Estadísticas de uso

---

## 🐛 Errores Resueltos (Sesión 11-04)

### 1. Botones Duplicados
**Problema:**
```
▶️ Reproduciendo: Song Name [Botones x1]
▶️ Reproduciendo: Song Name [Botones x2] ❌ DUPLICADOS
```

**Solución:**
- Eliminado envío de botones en `play.ts` (líneas 62-70, 106-115)
- Solo `AudioService.sendPlayerButtons()` envía botones
- **Resultado:** ✅ Un solo set de botones

### 2. Mensajes Persistentes
**Problema:**
```
🔍 Buscando...
✅ Agregado a la cola: Song XYZ
⏸️ Reproducción pausada
🔀 Modo aleatorio activado
... [mensajes no se borran, ensucian chat]
```

**Solución:**
```typescript
const reply = await message.reply('...');
setTimeout(() => reply.delete().catch(() => {}), 5000);
```
- **Resultado:** ✅ Mensajes se borran automáticamente

---

## 💻 Notas Técnicas (v3.0)

### Control de Volumen:
```typescript
// Volumen se almacena en PlayerState (0-100)
interface PlayerState {
  volume: number; // default: 50
  // ...
}

// Se aplica automáticamente al crear AudioResource
const resource = createAudioResource(stream, {
  inlineVolume: true,
});
if (resource.volume) {
  resource.volume.setVolume(state.volume / 100); // Convertir a 0.0-1.0
}
```

### Recomendaciones IA Mejoradas:
```typescript
const prompt = `Analiza esta canción y recomiéndame 5 similares:
📌 Información de la canción:
- Título completo: ${currentSong.title}
- Artista detectado: ${extractedArtist}
- Duración: ${durationText}
- URL: ${currentSong.url}

🎯 Criterios de similitud:
- Mismo género musical o estilo
- Energía/tempo similar
- Época o era musical similar
...`;
```

### Botones Dinámicos:
```typescript
// Todos los botones ahora reciben el estado completo
export function createPlayerButtons(state?: PlayerState) {
  // Botones se adaptan según:
  // - state.isPaused → Pausar/Reanudar
  // - state.options.shuffle → Mezclar/Mezclado
  // - state.options.repeat → Normal/Repetir 1/Repetir Cola
  // - state.volume → 🔊 XX%
}
```

---

## 📝 Historial de Versiones

### v3.0 (2025-11-04)
- ✅ Control de volumen (botón + comando)
- ✅ Botón de repeat interactivo
- ✅ Mensajes auto-eliminables
- ✅ Arreglo de botones duplicados
- ✅ Recomendaciones IA mejoradas
- ✅ 9 botones totales, 4 dinámicos

### v2.0 (2025-11-03)
- ✅ Migración completa a streaming (play-dl)
- ✅ Soporte para playlists (500 videos)
- ✅ Videos largos (3+ horas)
- ✅ 7 botones interactivos
- ✅ Recomendaciones con IA

### v1.0 (Inicial)
- ✅ Sistema básico de reproducción
- ✅ Comandos básicos (play, pause, skip, stop)
- ⚠️ Descarga local de archivos
- ⚠️ ytdl-core (errores 403)

---

## ⚙️ Configuración Actual

### Límites:
- Playlists: 500 videos (configurable en play.ts:36)
- Calidad stream: 2/4 (media-alta, en YouTubeService.ts)
- Volumen default: 50%
- Cola paginada: 10 canciones/página

### Dependencias clave:
- `play-dl` - Streaming de YouTube
- `@discordjs/voice` - Audio en Discord
- `@google/generative-ai` - Recomendaciones (Gemini 2.5 Flash)
- `discord.js` v14

---

## 📚 Documentación de Comandos

### Comando `/volume`:
```bash
!volume          # Ver volumen actual
!volume 50       # Establecer volumen a 50%
!vol 80          # Alias: vol
!v 30            # Alias: v
```

### Comando `/repeat`:
```bash
!repeat none     # Sin repetición
!repeat song     # Repetir canción actual
!repeat queue    # Repetir cola completa
```

### Comando `/play`:
```bash
!play despacito                              # Búsqueda
!play https://youtube.com/watch?v=...        # Video individual
!play https://youtube.com/playlist?list=...  # Playlist completa
```

---

**Última sesión:** 2025-11-04
**Duración:** ~45 minutos
**Estado:** ✅ Bot funcionando perfectamente
**Versión:** v3.0
**Total comandos:** 11
**Total botones:** 9 (4 dinámicos)
**Build status:** ✅ Sin errores
