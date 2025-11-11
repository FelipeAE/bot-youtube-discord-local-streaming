import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from './config/index.js';
import { QueueService } from './services/QueueService.js';
import { YouTubeService } from './services/YouTubeService.js';
import { AudioService } from './services/AudioService.js';
import { AIService } from './services/AIService.js';
import { FavoritesService } from './services/FavoritesService.js';
import { ButtonHandler } from './handlers/ButtonHandler.js';
import type { Command } from './types/command.js';
import fs from 'fs';
import path from 'path';

// Importar comandos
import { play } from './commands/play.js';
import { pause } from './commands/pause.js';
import { resume } from './commands/resume.js';
import { skip } from './commands/skip.js';
import { queue } from './commands/queue.js';
import { shuffle } from './commands/shuffle.js';
import { repeat } from './commands/repeat.js';
import { stop } from './commands/stop.js';
import { volume } from './commands/volume.js';
import { move } from './commands/move.js';
import { nowplaying } from './commands/nowplaying.js';
import { search } from './commands/search.js';
import { favorite } from './commands/favorite.js';
import { favorites } from './commands/favorites.js';
import { unfavorite } from './commands/unfavorite.js';
import { playfavorite } from './commands/playfavorite.js';
import { queuefavorites } from './commands/queuefavorites.js';
import { recommend } from './commands/recommend.js';
import { help } from './commands/help.js';

// Inicializar servicios
const queueService = new QueueService();
const youtubeService = new YouTubeService();
const audioService = new AudioService(queueService, youtubeService);
const aiService = new AIService();
const favoritesService = new FavoritesService();

// Exportar servicios para que los comandos puedan acceder a ellos
export { queueService, youtubeService, audioService, aiService, favoritesService };

// Crear cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

// Cargar comandos
const commands = new Collection<string, Command>();
const commandList = [play, pause, resume, skip, queue, shuffle, repeat, stop, volume, move, nowplaying, search, favorite, favorites, unfavorite, playfavorite, queuefavorites, recommend, help];

for (const command of commandList) {
  commands.set(command.name, command);
  // Agregar aliases
  if (command.aliases) {
    for (const alias of command.aliases) {
      commands.set(alias, command);
    }
  }
}

// Guardar PID del proceso al inicio
const pidFile = path.join(process.cwd(), '.bot.pid');
try {
  fs.writeFileSync(pidFile, process.pid.toString());
  console.log(`📝 PID del bot guardado: ${process.pid}`);
} catch (error) {
  console.error('❌ Error guardando PID:', error);
}

client.once('clientReady', () => {
  console.log(`✅ Bot conectado como ${client.user?.tag}`);
  console.log(`📋 ${commandList.length} comandos cargados`);

  // Pasar client al AudioService para que pueda enviar mensajes
  audioService.setClient(client);
  console.log(`🔗 Cliente de Discord vinculado al AudioService`);

  // Inicializar manejador de botones
  new ButtonHandler(client, queueService, audioService);
  console.log(`🎮 Manejador de botones inicializado`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  console.log(`📨 Comando recibido: !${commandName} ${args.join(' ')}`);

  const command = commands.get(commandName);

  if (!command) {
    await message.reply(`Comando no encontrado. Usa \`!help\` para ver los comandos disponibles.`);
    return;
  }

  try {
    await command.execute(message, args);
  } catch (error) {
    console.error(`Error ejecutando comando ${commandName}:`, error);
    await message.reply('Ocurrió un error al ejecutar el comando.');
  }
});

// Manejar errores no capturados para evitar crashes
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  // No cerrar el bot, solo logear
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rechazada no manejada:', reason);
  // No cerrar el bot, solo logear
});

client.login(config.token);

// Graceful shutdown - Manejar cierre del proceso
process.on('SIGINT', async () => {
  console.log('\n⚠️ Señal SIGINT recibida, cerrando bot...');
  await shutdown();
});

process.on('SIGTERM', async () => {
  console.log('\n⚠️ Señal SIGTERM recibida, cerrando bot...');
  await shutdown();
});

async function shutdown() {
  try {
    console.log('🔌 Desconectando de canales de voz...');

    // Obtener todas las conexiones activas y desconectarlas
    const guilds = client.guilds.cache.map(g => g.id);
    for (const guildId of guilds) {
      try {
        audioService.stop(guildId);
      } catch (error) {
        // Ignorar errores si no hay conexión activa
      }
    }

    console.log('👋 Destruyendo cliente de Discord...');
    client.destroy();

    // Cerrar base de datos
    console.log('📊 Cerrando base de datos...');
    favoritesService.close();

    // Eliminar archivo PID
    try {
      if (fs.existsSync(pidFile)) {
        fs.unlinkSync(pidFile);
        console.log('🗑️ Archivo PID eliminado');
      }
    } catch (error) {
      console.error('❌ Error eliminando PID:', error);
    }

    console.log('✅ Bot cerrado correctamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el cierre:', error);
    process.exit(1);
  }
}
