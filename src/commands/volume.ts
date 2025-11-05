import type { Message } from 'discord.js';
import type { Command } from '../types/command.js';
import { audioService, queueService } from '../index.js';

export const volume: Command = {
  name: 'volume',
  description: 'Ajusta el volumen de reproducción (0-100)',
  aliases: ['vol', 'v'],
  execute: async (message: Message, args: string[]) => {
    if (!message.guildId) {
      const reply = await message.reply('Este comando solo funciona en servidores.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return;
    }

    const state = queueService.getQueue(message.guildId);

    if (!state.isPlaying) {
      const reply = await message.reply('No hay nada reproduciéndose actualmente.');
      setTimeout(() => reply.delete().catch(() => {}), 5000);
      return;
    }

    // Si no hay argumento, mostrar volumen actual
    if (!args[0]) {
      const currentVolume = audioService.getVolume(message.guildId);
      const reply = await message.reply(`🔊 Volumen actual: **${currentVolume}%**`);
      setTimeout(() => reply.delete().catch(() => {}), 8000);
      return;
    }

    const volumeInput = parseInt(args[0], 10);

    // Validar entrada
    if (isNaN(volumeInput) || volumeInput < 0 || volumeInput > 100) {
      const reply = await message.reply(
        '❌ Por favor especifica un volumen válido entre 0 y 100.\n' +
        'Ejemplo: `!volume 50`'
      );
      setTimeout(() => reply.delete().catch(() => {}), 8000);
      return;
    }

    // Establecer volumen
    audioService.setVolume(message.guildId, volumeInput);

    // Emoji dinámico basado en el volumen
    let emoji = '🔇';
    if (volumeInput > 0 && volumeInput <= 33) emoji = '🔉';
    else if (volumeInput > 33 && volumeInput <= 66) emoji = '🔊';
    else if (volumeInput > 66) emoji = '🔊';

    const reply = await message.reply(`${emoji} Volumen ajustado a **${volumeInput}%**`);
    setTimeout(() => reply.delete().catch(() => {}), 5000);
  },
};
