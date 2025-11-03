# Bot de Música Discord con YouTube

Bot de música para Discord que reproduce canciones de YouTube con streaming inteligente y recomendaciones por IA.

## Características

- **Reproducción inteligente desde YouTube:**
  - Videos <15 min: Se descargan completamente en `temp/downloads/` con mejor calidad de audio y se reproducen localmente
  - Videos >15 min: Streaming directo sin descarga
  - Limpieza automática de archivos después de reproducir
- **Búsqueda por texto o URL:** Soporta búsqueda por nombre de canción o URLs directas
- **Cola de reproducción** con shuffle y múltiples modos de repetición
- **Recomendaciones por IA** usando Google Gemini
- **10 comandos completos:** play, pause, resume, skip, stop, queue, shuffle, repeat, recommend, help

## Estructura del Proyecto

```
src/
├── commands/       # Comandos del bot
├── services/       # Lógica de negocio
│   ├── AudioService.ts       # Reproducción de audio
│   ├── YouTubeService.ts     # Manejo de YouTube
│   ├── QueueService.ts       # Gestión de cola
│   └── AIService.ts          # Recomendaciones IA
├── types/          # Tipos TypeScript
├── config/         # Configuración
└── index.ts        # Punto de entrada
```

## Instalación

1. Clonar el repositorio
2. Copiar `.env.example` a `.env` y configurar tokens
3. Instalar dependencias:
```bash
npm install
```

## Uso

Desarrollo:
```bash
npm run dev
```

Producción:
```bash
npm run build
npm start
```

Tests:
```bash
# Ejecutar tests una vez
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Ejecutar tests con coverage
npm run test:coverage
```

## Comandos Disponibles

### Reproducción
- `!play <url o nombre>` o `!p <url o nombre>` - Reproduce una canción de YouTube (acepta URLs o búsqueda por texto)
  - Ejemplos:
    - `!play https://www.youtube.com/watch?v=dQw4w9WgXcQ`
    - `!play never gonna give you up`
    - `!p bohemian rhapsody queen`
- `!pause` - Pausa la reproducción actual
- `!resume` o `!r` - Reanuda la reproducción pausada
- `!skip` o `!s` o `!next` - Salta a la siguiente canción
- `!stop` o `!disconnect` o `!dc` - Detiene y desconecta el bot

### Gestión de Cola
- `!queue` o `!q` o `!list` - Muestra la cola de reproducción (primeras 10 canciones)
- `!shuffle` - Activa/desactiva el modo aleatorio
- `!repeat <mode>` o `!loop <mode>` - Configura repetición
  - `none` - Sin repetición
  - `song` - Repite la canción actual
  - `queue` - Repite toda la cola

### IA y Recomendaciones
- `!recommend` o `!rec` o `!suggestions` - Obtiene 5 recomendaciones basadas en la canción actual usando Gemini AI

### Información
- `!help` o `!h` o `!commands` - Muestra todos los comandos disponibles

## Tecnologías

- TypeScript
- discord.js v14
- @discordjs/voice
- @distube/ytdl-core (descarga/streaming - fork actualizado)
- play-dl (búsqueda)
- Google Gemini AI
- Jest (testing)

## Testing

El proyecto incluye tests unitarios para los servicios principales:

### Tests Implementados (36 tests)

**QueueService (19 tests):**
- Creación y gestión de colas por servidor
- Agregar canciones a la cola
- Obtener siguiente canción (con/sin shuffle)
- Modos de repetición (none/song/queue)
- Limpiar cola

**YouTubeService (5 tests):**
- Detección de duración para descarga local vs streaming
- Validación de URLs

**AIService (3 tests):**
- Inicialización correcta del servicio
- Métodos para recomendaciones y análisis de mood
- Manejo de errores

**Types (9 tests):**
- Validación de tipos TypeScript
- Estructura de Song, QueueOptions, PlayerState, BotConfig

### Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Modo watch (re-ejecuta al cambiar código)
npm run test:watch

# Con reporte de cobertura
npm run test:coverage
```

### Cobertura

Los tests cubren la lógica principal de negocio:
- ✅ Gestión de cola de canciones
- ✅ Lógica de shuffle y repeat
- ✅ Decisión descarga local vs streaming
- ✅ Validación de tipos
- ✅ Manejo de errores en servicios
