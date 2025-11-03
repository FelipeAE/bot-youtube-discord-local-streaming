import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function createPlayerButtons() {
  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('player_now_playing')
        .setLabel('🎵 Now Playing')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_pause_resume')
        .setLabel('⏸️ Pausar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('player_skip')
        .setLabel('⏭️ Saltar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('player_stop')
        .setLabel('⏹️ Detener')
        .setStyle(ButtonStyle.Danger)
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('player_queue')
        .setLabel('📋 Cola')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_shuffle')
        .setLabel('🔀 Mezclar')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_recommend')
        .setLabel('🤖 Recomendar')
        .setStyle(ButtonStyle.Success)
    );

  return [row1, row2];
}

export function updatePauseButton(isPaused: boolean) {
  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('player_now_playing')
        .setLabel('🎵 Now Playing')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_pause_resume')
        .setLabel(isPaused ? '▶️ Reanudar' : '⏸️ Pausar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('player_skip')
        .setLabel('⏭️ Saltar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('player_stop')
        .setLabel('⏹️ Detener')
        .setStyle(ButtonStyle.Danger)
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('player_queue')
        .setLabel('📋 Cola')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_shuffle')
        .setLabel('🔀 Mezclar')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_recommend')
        .setLabel('🤖 Recomendar')
        .setStyle(ButtonStyle.Success)
    );

  return [row1, row2];
}

export function updateShuffleButton(isShuffled: boolean, isPaused: boolean) {
  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('player_now_playing')
        .setLabel('🎵 Now Playing')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_pause_resume')
        .setLabel(isPaused ? '▶️ Reanudar' : '⏸️ Pausar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('player_skip')
        .setLabel('⏭️ Saltar')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId('player_stop')
        .setLabel('⏹️ Detener')
        .setStyle(ButtonStyle.Danger)
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('player_queue')
        .setLabel('📋 Cola')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_shuffle')
        .setLabel(isShuffled ? '🔀 Mezclado ✓' : '🔀 Mezclar')
        .setStyle(isShuffled ? ButtonStyle.Success : ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('player_recommend')
        .setLabel('🤖 Recomendar')
        .setStyle(ButtonStyle.Success)
    );

  return [row1, row2];
}
