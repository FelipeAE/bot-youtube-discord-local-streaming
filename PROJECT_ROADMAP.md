# Bot de Música Discord - Roadmap y Guía Completa

## 📋 Índice
1. [Resumen del Proyecto](#resumen-del-proyecto)
2. [Fases del Proyecto](#fases-del-proyecto)
3. [Setup Completo](#setup-completo)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Comandos Disponibles](#comandos-disponibles)
6. [Solución de Problemas](#solución-de-problemas)
7. [Testing](#testing)

---

## 🎵 Resumen del Proyecto

Bot de música para Discord con reproducción desde YouTube:
- **🎵 100% Streaming:** Reproducción directa sin descarga de archivos
- **📋 Playlists grandes:** Soporte para playlists de hasta 500 videos
- **⏱️ Videos largos:** Soporta videos de 3+ horas sin problemas
- **🔍 Búsqueda inteligente:** Por texto, URL de video, o URL de playlist
- **🤖 Recomendaciones IA:** Powered by Google Gemini
- **📊 Sistema de cola:** Con shuffle y repeat
- **✅ Tests unitarios:** 36 tests cubriendo servicios principales

---

## 🚀 Fases del Proyecto

### ✅ FASE 1: CORE COMPLETADO
**Estado: 100% Completado**

- [x] Setup inicial del proyecto con TypeScript
- [x] Configuración de Discord.js v14 con intents de voz
- [x] Sistema de comandos modular (10 comandos totales)
  - [x] `!play` - Reproducir (URL o búsqueda)
  - [x] `!pause` - Pausar
  - [x] `!resume` - Reanudar
  - [x] `!skip` - Saltar canción
  - [x] `!stop` - Detener y desconectar
  - [x] `!queue` - Ver cola (embeds)
  - [x] `!shuffle` - Toggle aleatorio
  - [x] `!repeat` - Modos de repetición
  - [x] `!recommend` - Recomendaciones IA
  - [x] `!help` - Ayuda completa
- [x] Integración con YouTube:
  - [x] Búsqueda por texto (play-dl)
  - [x] Descarga local para videos cortos (@distube/ytdl-core)
  - [x] Streaming para videos largos
- [x] Sistema de cola con:
  - [x] Shuffle (modo aleatorio)
  - [x] Repeat (none/song/queue)
  - [x] Estado por servidor
- [x] Integración con Gemini AI:
  - [x] Recomendaciones basadas en canción actual
  - [x] Análisis de mood
- [x] Sistema de descarga y limpieza:
  - [x] Descarga en `temp/downloads/`
  - [x] Limpieza automática post-reproducción
  - [x] Limpieza en stop y errores
- [x] Tests unitarios:
  - [x] QueueService (19 tests)
  - [x] YouTubeService (5 tests)
  - [x] AIService (3 tests)
  - [x] Types (9 tests)
- [x] Documentación completa

**Problemas Resueltos:**
- ✅ `ytdl-core` desactualizado → Cambiado a `@distube/ytdl-core` (Fase 1)
- ✅ `youtube-sr` no funcional → Cambiado a `play-dl` (Fase 1)
- ✅ Protocolo DAVE faltante → Instalado `@snazzah/davey` (Fase 1)
- ✅ Warning deprecation `ready` → Cambiado a `clientReady` (Fase 1)
- ✅ Error 403 YouTube → Migración completa a `play-dl` (Fase 2)
- ✅ Descarga local ineficiente → Eliminado, 100% streaming (Fase 2)

---

### 🔄 FASE 2: MEJORAS INMEDIATAS
**Estado: En Progreso - 30% Completado**

#### ✅ Completado (v2.0):
- [x] **Sistema de Streaming Optimizado:**
  - [x] Migración completa a play-dl
  - [x] Eliminación de descarga local
  - [x] Reproducción instantánea (1-2 seg)

- [x] **Playlists:**
  - [x] Soporte para playlists completas de YouTube
  - [x] Comando `!play <playlist_url>` integrado
  - [x] Límite configurable (500 videos)
  - [x] Soporte para videos de 3+ horas

#### 🔄 Pendiente:
- [ ] **Búsqueda mejorada:**
  - [ ] Mostrar múltiples resultados (1-5)
  - [ ] Reacciones para elegir resultado
  - [ ] Timeout de selección

- [ ] **Control de reproducción:**
  - [ ] Comando `!volume <0-100>` - Ajustar volumen (inlineVolume ya configurado)
  - [ ] Comando `!seek <tiempo>` - Avanzar/retroceder
  - [ ] Comando `!nowplaying` - Info canción actual con progreso

- [ ] **Sistema de favoritos:**
  - [ ] Comando `!favorite` - Guardar canción
  - [ ] Comando `!favorites` - Ver favoritos
  - [ ] Almacenamiento por usuario

- [ ] **Mejoras de UX:**
  - [ ] Barra de progreso visual en `!nowplaying`
  - [ ] Embeds más bonitos con colores por estado
  - [ ] Botones interactivos (pause/skip/stop)

---

### 🎯 FASE 3: CARACTERÍSTICAS AVANZADAS
**Estado: Pendiente**

- [ ] **Base de datos:**
  - [ ] SQLite/PostgreSQL para persistencia
  - [ ] Historial de reproducción por servidor
  - [ ] Estadísticas de uso
  - [ ] Top canciones por servidor

- [ ] **Sistema de votación:**
  - [ ] Comando `!voteskip` - Votar para saltar
  - [ ] Porcentaje configurable de votos
  - [ ] Votación para añadir/remover de cola

- [ ] **Audio avanzado:**
  - [ ] Ecualizador básico (bass boost, etc)
  - [ ] Efectos de audio (nightcore, vaporwave)
  - [ ] Normalización de volumen

- [ ] **Integraciones:**
  - [ ] Spotify (búsqueda y conversión a YouTube)
  - [ ] SoundCloud
  - [ ] Bandcamp
  - [ ] URLs directas de audio

- [ ] **Sistema de niveles:**
  - [ ] XP por uso del bot
  - [ ] Niveles y rangos
  - [ ] Comandos exclusivos por nivel

---

### 🌟 FASE 4: CARACTERÍSTICAS PREMIUM
**Estado: Futuro**

- [ ] **Dashboard web:**
  - [ ] Control remoto del bot
  - [ ] Visualización de cola
  - [ ] Gestión de configuración
  - [ ] Estadísticas en tiempo real

- [ ] **Radio 24/7:**
  - [ ] Radio continua por género
  - [ ] Radio personalizada por IA
  - [ ] Comandos de radio dedicados

- [ ] **Slash Commands:**
  - [ ] Migración a comandos slash
  - [ ] Autocompletado
  - [ ] Permisos por comando

- [ ] **Sistema de plugins:**
  - [ ] API para extensiones
  - [ ] Plugins de la comunidad
  - [ ] Marketplace de plugins

- [ ] **Multi-idioma:**
  - [ ] Soporte i18n
  - [ ] Idiomas: ES, EN, PT, FR

---

## 🛠️ Setup Completo

### Requisitos Previos
```bash
Node.js v18+ (recomendado v22)
npm v8+
```

### 1. Clonar/Iniciar Proyecto
```bash
mkdir bot-youtube-discord-local-streaming
cd bot-youtube-discord-local-streaming
git init
```

### 2. Inicializar npm
```bash
npm init -y
```

### 3. Instalar Dependencias

**Producción:**
```bash
npm install discord.js @discordjs/voice @discordjs/opus @google/generative-ai play-dl @distube/ytdl-core dotenv @snazzah/davey sodium-native libsodium-wrappers
```

**Desarrollo:**
```bash
npm install -D typescript tsx @types/node jest ts-jest @types/jest
```

### 4. Configurar TypeScript

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "moduleResolution": "node",
    "declaration": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**package.json scripts:**
```json
{
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "test": "node --experimental-vm-modules node_modules/jest/bin/jest.js",
    "test:watch": "node --experimental-vm-modules node_modules/jest/bin/jest.js --watch",
    "test:coverage": "node --experimental-vm-modules node_modules/jest/bin/jest.js --coverage"
  }
}
```

### 5. Obtener Tokens

**Discord Bot Token:**
1. Ir a https://discord.com/developers/applications
2. Crear "New Application"
3. Bot → "Add Bot"
4. Copiar Token
5. Bot → Privileged Gateway Intents:
   - ✅ Message Content Intent
   - ✅ Server Members Intent
6. OAuth2 → URL Generator:
   - Scopes: `bot`
   - Permissions:
     - Send Messages
     - Connect
     - Speak
     - Use Voice Activity
7. Copiar URL e invitar bot al servidor

**Gemini API Key:**
1. Ir a https://makersuite.google.com/app/apikey
2. Crear "Create API Key"
3. Copiar key

### 6. Configurar Variables de Entorno

**.env:**
```env
DISCORD_TOKEN=tu_token_de_discord_aqui
GEMINI_API_KEY=tu_key_de_gemini_aqui
```

### 7. Crear Estructura de Carpetas
```bash
mkdir -p src/commands src/services src/types src/utils src/config src/__tests__ temp/downloads
```

### 8. Compilar y Ejecutar

**Modo Desarrollo:**
```bash
npm run dev
```

**Modo Producción:**
```bash
npm run build
npm start
```

---

## 📁 Estructura del Proyecto

```
bot-youtube-discord-local-streaming/
├── src/
│   ├── commands/              # Comandos del bot (10 archivos)
│   │   ├── help.ts           # Comando de ayuda
│   │   ├── play.ts           # Reproducir música
│   │   ├── pause.ts          # Pausar
│   │   ├── resume.ts         # Reanudar
│   │   ├── skip.ts           # Saltar
│   │   ├── stop.ts           # Detener
│   │   ├── queue.ts          # Ver cola
│   │   ├── shuffle.ts        # Toggle shuffle
│   │   ├── repeat.ts         # Modos repeat
│   │   └── recommend.ts      # Recomendaciones IA
│   │
│   ├── services/              # Lógica de negocio
│   │   ├── AudioService.ts   # Reproducción de audio
│   │   ├── YouTubeService.ts # YouTube API (búsqueda/descarga)
│   │   ├── QueueService.ts   # Gestión de cola
│   │   └── AIService.ts      # Gemini AI
│   │
│   ├── types/                 # Tipos TypeScript
│   │   ├── command.ts        # Interface Command
│   │   └── index.ts          # Song, Queue, Config types
│   │
│   ├── config/                # Configuración
│   │   └── index.ts          # Variables de entorno
│   │
│   ├── __tests__/             # Tests unitarios
│   │   ├── QueueService.test.ts
│   │   ├── YouTubeService.test.ts
│   │   ├── AIService.test.ts
│   │   └── types.test.ts
│   │
│   └── index.ts               # Punto de entrada principal
│
├── temp/                      # Carpeta temporal
│   └── downloads/            # Archivos de audio descargados
│
├── dist/                      # Código compilado (generado)
├── node_modules/              # Dependencias (generado)
├── .env                       # Variables de entorno (NO subir a git)
├── .env.example              # Ejemplo de variables
├── .gitignore                # Archivos a ignorar en git
├── package.json              # Dependencias y scripts
├── tsconfig.json             # Configuración de TypeScript
├── jest.config.js            # Configuración de Jest
├── README.md                 # Documentación del usuario
└── PROJECT_ROADMAP.md        # Este archivo
```

---

## 🎮 Comandos Disponibles

### Reproducción
```
!play <url o nombre>    - Reproduce música (URL de video, playlist, o búsqueda)
!p <query>              - Alias de play

Ejemplos:
  !play https://www.youtube.com/watch?v=dQw4w9WgXcQ
  !play https://www.youtube.com/playlist?list=PLx0sYbCqOb8Q_CLZC2BdBSKEEB59BOPUM
  !play never gonna give you up
  !p despacito

Notas:
  - Soporta playlists de hasta 500 videos
  - Soporta videos de cualquier duración (incluso 3+ horas)
  - Todo es reproducción por streaming (inicio instantáneo)
```

```
!pause                  - Pausa la reproducción
!resume                 - Reanuda la reproducción
!r                      - Alias de resume
```

```
!skip                   - Salta a la siguiente canción
!s                      - Alias de skip
!next                   - Alias de skip
```

```
!stop                   - Detiene todo y desconecta
!disconnect             - Alias de stop
!dc                     - Alias de stop
```

### Gestión de Cola
```
!queue                  - Muestra cola (primeras 10 canciones)
!q                      - Alias de queue
!list                   - Alias de queue
```

```
!shuffle                - Activa/desactiva modo aleatorio
```

```
!repeat <mode>          - Configura repetición
  none                  - Sin repetición
  song                  - Repetir canción actual
  queue                 - Repetir toda la cola

!loop <mode>            - Alias de repeat

Ejemplos:
  !repeat none
  !repeat song
  !loop queue
```

### IA y Recomendaciones
```
!recommend              - Obtiene 5 recomendaciones basadas en canción actual
!rec                    - Alias de recommend
!suggestions            - Alias de recommend
```

### Información
```
!help                   - Muestra todos los comandos
!h                      - Alias de help
!commands               - Alias de help
```

---

## 🔧 Solución de Problemas

### Error: "Could not extract functions"
**Causa:** `ytdl-core` desactualizado (YouTube cambió API)
**Solución:**
```bash
npm uninstall ytdl-core
npm install @distube/ytdl-core
```

### Error: "YouTube.search is not a function"
**Causa:** `youtube-sr` tiene API rota
**Solución:**
```bash
npm uninstall youtube-sr
npm install play-dl
```

### Error: "Cannot utilize the DAVE protocol"
**Causa:** Falta paquete de encriptación de voz
**Solución:**
```bash
npm install @snazzah/davey sodium-native libsodium-wrappers
```

### Warning: "ready event has been renamed"
**Causa:** Deprecación en discord.js v14
**Solución:** Cambiar en `src/index.ts`:
```typescript
// Antes
client.once('ready', () => {

// Ahora
client.once('clientReady', () => {
```

### Error: "ENOENT: no such file or directory"
**Causa:** Carpeta temp/downloads no existe
**Solución:**
```bash
mkdir -p temp/downloads
```

### Bot no responde a comandos
**Verificar:**
1. ✅ Message Content Intent activado en Discord Dev Portal
2. ✅ Bot tiene permisos de "Send Messages"
3. ✅ Token correcto en `.env`
4. ✅ Bot invitado al servidor

### Audio no suena pero bot se conecta
**Verificar:**
1. ✅ Permisos "Connect" y "Speak" en canal de voz
2. ✅ Usuario en el mismo canal de voz que el bot
3. ✅ FFmpeg instalado (viene con @discordjs/opus)

---

## 🧪 Testing

### Ejecutar Tests
```bash
# Una vez
npm test

# Modo watch
npm run test:watch

# Con cobertura
npm run test:coverage
```

### Tests Implementados (36 total)

**QueueService (19 tests):**
- ✅ Creación de colas por servidor
- ✅ Agregar canciones
- ✅ Obtener siguiente canción
- ✅ Shuffle aleatorio
- ✅ Repeat (none/song/queue)
- ✅ Limpiar cola
- ✅ Toggle shuffle
- ✅ Eliminar cola

**YouTubeService (5 tests):**
- ✅ Detectar duración (<15min vs >15min)
- ✅ Validar URLs
- ✅ Métodos de streaming

**AIService (3 tests):**
- ✅ Inicialización correcta
- ✅ Métodos de recomendaciones
- ✅ Manejo de errores

**Types (9 tests):**
- ✅ Song interface
- ✅ QueueOptions interface
- ✅ PlayerState interface
- ✅ BotConfig interface

---

## 📦 Dependencias del Proyecto

### Producción
```json
{
  "discord.js": "^14.24.2",           // Framework Discord
  "@discordjs/voice": "^0.19.0",      // Audio/Voz
  "@discordjs/opus": "^0.10.0",       // Codec de audio
  "@distube/ytdl-core": "latest",     // YouTube download (fork actualizado)
  "play-dl": "latest",                 // Búsqueda YouTube
  "@google/generative-ai": "^0.24.1", // Gemini AI
  "dotenv": "^17.2.3",                // Variables de entorno
  "@snazzah/davey": "latest",         // Protocolo DAVE
  "sodium-native": "latest",          // Encriptación
  "libsodium-wrappers": "latest"      // Encriptación
}
```

### Desarrollo
```json
{
  "typescript": "^5.9.3",
  "tsx": "^4.20.6",                   // Ejecutor TS
  "@types/node": "^24.9.2",
  "jest": "^30.2.0",
  "ts-jest": "^29.4.5",
  "@types/jest": "^30.0.0"
}
```

---

## 🎯 Próximos Pasos Recomendados

1. **Implementar búsqueda con múltiples resultados** (Fase 2)
   - Mejorará UX al elegir canción correcta
   - Prioridad: Alta

2. **Agregar comando de volumen** (Fase 2)
   - Feature muy solicitada
   - Relativamente fácil de implementar
   - Prioridad: Alta

3. **Soporte para playlists** (Fase 2)
   - Gran mejora de funcionalidad
   - Prioridad: Media

4. **Base de datos para persistencia** (Fase 3)
   - Permite features avanzadas
   - Prioridad: Media-Baja

5. **Dashboard web** (Fase 4)
   - Diferenciador clave
   - Prioridad: Baja (largo plazo)

---

## 📝 Notas Técnicas

### Sistema de Streaming (v2.0)
- **100% Streaming:** Todos los videos se reproducen por streaming directo
- **Sin descargas:** No se guardan archivos en disco
- **play-dl:** Librería principal para YouTube
- **Configuración:**
  ```typescript
  await play.stream(url, {
    quality: 2  // 0 (mejor) - 4 (peor)
  });
  ```
- **Playlists grandes:**
  - Límite configurable: 500 videos (default)
  - Carga completa en memoria
  - Videos de cualquier duración (3+ horas soportado)

### Arquitectura de Servicios
- **QueueService:** Estado aislado por guild ID
- **YouTubeService:** Singleton, maneja búsqueda y streaming con play-dl
- **AudioService:** Maneja conexiones y players por guild
- **AIService:** Singleton, conexión a Gemini

### Tipos y Interfaces (v2.0)
```typescript
interface Song {
  title: string;
  url: string;
  duration: number;        // En segundos, sin límite
  thumbnail?: string;
  requestedBy: string;
  // filePath eliminado en v2.0
}

// Nuevos métodos en YouTubeService
class YouTubeService {
  getVideoInfo(url, requestedBy): Promise<Song | null>
  searchVideo(query, requestedBy): Promise<Song | null>
  getPlaylistVideos(url, requestedBy, maxVideos): Promise<Song[]>
  getAudioStream(url): Promise<Readable>
  isValidYouTubeURL(url): 'video' | 'playlist' | false
}
```

---

## 📧 Contacto y Contribuciones

Para reportar bugs o sugerir features, abrir issue en el repositorio.

---

**Última actualización:** 2025-11-03
**Versión:** 2.0.0
**Estado:** ✅ Fase 1 Completada | 🔄 Fase 2 en Progreso (30%)
