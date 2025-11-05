import type { Message } from 'discord.js';
import type { Command } from '../types/command.js';
import { queueService } from '../index.js';

export const move: Command = {
  name: 'move',
  description: 'Mueve una canción a otra posición en la cola',
  aliases: ['mv'],
  execute: async (message: Message, args: string[]) => {
    if (!message.guildId) {
      const reply = await message.reply('Este comando solo funciona en servidores.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return;
    }

    const state = queueService.getQueue(message.guildId);

    if (state.queue.length === 0) {
      const reply = await message.reply('❌ La cola está vacía.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return;
    }

    // Validar argumentos
    if (args.length !== 2) {
      const reply = await message.reply(
        '❌ Uso incorrecto. Ejemplo:\n' +
        '`!move 5 1` - Mueve la canción #5 a la posición #1\n' +
        '`!move 10 3` - Mueve la canción #10 a la posición #3'
      );
      setTimeout(() => reply.delete().catch(() => {}), 10000);
      return;
    }

    const fromPos = parseInt(args[0], 10);
    const toPos = parseInt(args[1], 10);

    // Validar que sean números
    if (isNaN(fromPos) || isNaN(toPos)) {
      const reply = await message.reply('❌ Las posiciones deben ser números válidos.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return;
    }

    // Validar rango (posiciones empiezan en 1)
    if (fromPos < 1 || fromPos > state.queue.length) {
      const reply = await message.reply(
        `❌ Posición de origen inválida. Debe estar entre 1 y ${state.queue.length}`
      );
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return;
    }

    if (toPos < 1 || toPos > state.queue.length) {
      const reply = await message.reply(
        `❌ Posición de destino inválida. Debe estar entre 1 y ${state.queue.length}`
      );
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return;
    }

    // Si las posiciones son iguales, no hacer nada
    if (fromPos === toPos) {
      const reply = await message.reply('❌ Las posiciones de origen y destino son iguales.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return;
    }

    // Obtener la canción antes de moverla
    const song = state.queue[fromPos - 1]; // Convertir a índice 0-based

    // Mover la canción
    const success = queueService.moveSong(message.guildId, fromPos, toPos);

    if (success) {
      const reply = await message.reply(
        `✅ **Canción movida:**\n` +
        `"${song.title}"\n` +
        `📍 De posición **#${fromPos}** → **#${toPos}**`
      );
      setTimeout(() => reply.delete().catch(() => {}), 8000);
    } else {
      const reply = await message.reply('❌ Error al mover la canción. Intenta de nuevo.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    }
  },
};
