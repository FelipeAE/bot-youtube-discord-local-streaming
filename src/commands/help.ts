import type { Message } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import type { Command } from '../types/command.js';

export const help: Command = {
  name: 'help',
  description: 'Muestra todos los comandos disponibles',
  aliases: ['h', 'commands'],
  execute: async (message: Message, args: string[]) => {
    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle('🎵 Bot de Música - Comandos')
      .setDescription('Prefijo de comandos: `!`')
      .addFields(
        {
          name: '▶️ Reproducción',
          value:
            '`!play <url o nombre>` - Reproduce una canción (URL o búsqueda)\n' +
            '`!search <búsqueda>` - Busca y elige entre 5 resultados\n' +
            '`!pause` - Pausa la reproducción\n' +
            '`!resume` - Reanuda la reproducción\n' +
            '`!skip` - Salta a la siguiente canción\n' +
            '`!stop` - Detiene y desconecta el bot\n' +
            '`!nowplaying` - Muestra la canción actual con progreso',
        },
        {
          name: '📋 Cola',
          value:
            '`!queue` - Muestra la cola de reproducción\n' +
            '`!shuffle` - Activa/desactiva modo aleatorio\n' +
            '`!repeat <none|song|queue>` - Configura repetición\n' +
            '`!move <pos1> <pos2>` - Reordena canciones en la cola',
        },
        {
          name: '🔊 Audio',
          value:
            '`!volume [0-100]` - Ajusta el volumen de reproducción',
        },
        {
          name: '⭐ Favoritos',
          value:
            '`!favorite` - Agrega la canción actual a favoritos\n' +
            '`!favorites` - Muestra tu lista de favoritos\n' +
            '`!unfavorite <número>` - Elimina un favorito\n' +
            '`!playfavorite <número>` - Reproduce un favorito\n' +
            '`!queuefavorites` - Agrega todos tus favoritos a la cola',
        },
        {
          name: '🤖 IA',
          value: '`!recommend` - Obtiene recomendaciones basadas en la canción actual',
        },
        {
          name: 'ℹ️ Información',
          value:
            '🔍 Busca por nombre o usa URLs directas\n' +
            '📥 Videos <15min: Se descargan con mejor audio y reproducen localmente\n' +
            '📡 Videos >15min: Streaming directo sin descargar\n' +
            '🗑️ Limpieza automática de archivos descargados\n' +
            '🤖 Recomendaciones: Powered by Google Gemini',
        }
      )
      .setFooter({ text: 'Desarrollado con TypeScript + discord.js' })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
