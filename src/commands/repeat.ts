import type { Message } from 'discord.js';
import type { Command } from '../types/command.js';
import { queueService } from '../index.js';

export const repeat: Command = {
  name: 'repeat',
  description: 'Configura el modo de repetición (none/song/queue)',
  aliases: ['loop'],
  execute: async (message: Message, args: string[]) => {
    if (!message.guildId) {
      await message.reply('Este comando solo funciona en servidores.');
      return;
    }

    const mode = args[0]?.toLowerCase();

    if (!mode || !['none', 'song', 'queue'].includes(mode)) {
      await message.reply(
        'Por favor especifica un modo válido:\n' +
        '`!repeat none` - Sin repetición\n' +
        '`!repeat song` - Repetir canción actual\n' +
        '`!repeat queue` - Repetir cola completa'
      );
      return;
    }

    queueService.setRepeat(message.guildId, mode as 'none' | 'song' | 'queue');

    const emojis = {
      none: '➡️',
      song: '🔂',
      queue: '🔁',
    };

    await message.reply(`${emojis[mode as keyof typeof emojis]} Modo de repetición: **${mode}**`);
  },
};
