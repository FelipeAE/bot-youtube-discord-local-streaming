import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import type { PlayerState } from '../types/index.js';

export function createPlayerButtons(state?: PlayerState) {
  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('player_now_playing')
        .setLabel('🎵 Now Playing')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_pause_resume')
        .setLabel(state?.isPaused ? '▶️ Reanudar' : '⏸️ Pausar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('player_skip')
        .setLabel('⏭️ Saltar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('player_stop')
        .setLabel('⏹️ Detener')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('player_favorite')
        .setLabel('⭐ Favorito')
        .setStyle(ButtonStyle.Success)
    );

  // Determinar emoji y estilo de repeat
  let repeatEmoji = '➡️';
  let repeatLabel = 'Normal';
  let repeatStyle = ButtonStyle.Secondary;

  if (state?.options.repeat === 'song') {
    repeatEmoji = '🔂';
    repeatLabel = 'Repetir 1';
    repeatStyle = ButtonStyle.Success;
  } else if (state?.options.repeat === 'queue') {
    repeatEmoji = '🔁';
    repeatLabel = 'Repetir Cola';
    repeatStyle = ButtonStyle.Success;
  }

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('player_queue')
        .setLabel('📋 Cola')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_shuffle')
        .setLabel(state?.options.shuffle ? '🔀 Mezclado ✓' : '🔀 Mezclar')
        .setStyle(state?.options.shuffle ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_repeat')
        .setLabel(`${repeatEmoji} ${repeatLabel}`)
        .setStyle(repeatStyle),
      new ButtonBuilder()
        .setCustomId('player_volume')
        .setLabel(`🔊 ${state?.volume ?? 50}%`)
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_recommend')
        .setLabel('🤖 IA')
        .setStyle(ButtonStyle.Success)
    );

  return [row1, row2];
}

