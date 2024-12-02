import { EmbedBuilder } from 'discord.js';
import { getLogChannel } from './channelUtils.js';

export async function logTicketAction(guildId, embed) {
  const logChannel = await getLogChannel(guildId, 'ticket');
  if (logChannel) {
    await logChannel.send({ embeds: [embed] });
  }
}

export async function logPresenceAction(guildId, embed) {
  const logChannel = await getLogChannel(guildId, 'presence');
  if (logChannel) {
    await logChannel.send({ embeds: [embed] });
  }
}

export async function logSummonAction(guildId, embed) {
  const logChannel = await getLogChannel(guildId, 'summon');
  if (logChannel) {
    await logChannel.send({ embeds: [embed] });
  }
}

export function createTicketEmbed(action, data) {
  const embed = new EmbedBuilder()
    .setTimestamp();

  switch (action) {
    case 'CREATE':
      embed
        .setTitle('🎫 Nouveau Ticket')
        .setDescription(`Ticket #${data.id} créé`)
        .addFields([
          { name: 'Service', value: data.service, inline: true },
          { name: 'Utilisateur', value: `<@${data.userId}>`, inline: true }
        ])
        .setColor('#00FF00');
      break;
    case 'CLOSE':
      embed
        .setTitle('🔒 Ticket Fermé')
        .setDescription(`Ticket #${data.id} fermé`)
        .addFields([
          { name: 'Service', value: data.service, inline: true },
          { name: 'Utilisateur', value: `<@${data.userId}>`, inline: true },
          { name: 'Fermé par', value: `<@${data.closedBy}>`, inline: true },
          { name: 'Raison', value: data.reason || 'Non spécifiée' }
        ])
        .setColor('#FF0000');
      break;
    case 'MESSAGE':
      embed
        .setTitle('💬 Nouveau Message')
        .setDescription(`Message dans le ticket #${data.id}`)
        .addFields([
          { name: 'De', value: `<@${data.userId}>`, inline: true },
          { name: 'Service', value: data.service, inline: true },
          { name: 'Message', value: data.content }
        ])
        .setColor('#3498db');
      break;
  }

  return embed;
}

export function createPresenceEmbed(action, data) {
  const embed = new EmbedBuilder()
    .setTimestamp();

  switch (action) {
    case 'ABSENT':
      embed
        .setTitle('🌙 Absence Déclarée')
        .setDescription(`${data.tag} sera absent`)
        .addFields([
          { name: 'Utilisateur', value: `<@${data.userId}>`, inline: true },
          { name: 'Raison', value: data.reason, inline: true },
          { name: 'Jusqu\'au', value: data.until || 'Non spécifié', inline: true }
        ])
        .setColor('#FFA500');
      break;
    case 'PRESENT':
      embed
        .setTitle('🌞 Retour de Présence')
        .setDescription(`${data.tag} est de retour`)
        .addFields([
          { name: 'Utilisateur', value: `<@${data.userId}>`, inline: true },
          { name: 'Absence précédente', value: data.previousReason || 'Non spécifiée', inline: true }
        ])
        .setColor('#00FF00');
      break;
  }

  return embed;
}

export function createSummonEmbed(action, data) {
  const embed = new EmbedBuilder()
    .setTimestamp();

  switch (action) {
    case 'CREATE':
      embed
        .setTitle('📨 Nouvelle Convocation')
        .setDescription(`Convocation créée pour ${data.userTag}`)
        .addFields([
          { name: 'ID', value: `#${data.id}`, inline: true },
          { name: 'Utilisateur', value: `<@${data.userId}>`, inline: true },
          { name: 'Raison', value: data.reason, inline: true },
          { name: 'Convoqué par', value: `<@${data.summonerId}>` }
        ])
        .setColor('#FF9900');
      break;
    case 'COMPLETE':
      embed
        .setTitle('✅ Convocation Traitée')
        .addFields([
          { name: 'ID', value: `#${data.id}`, inline: true },
          { name: 'Utilisateur', value: `<@${data.userId}>`, inline: true },
          { name: 'Traité par', value: `<@${data.completedBy}>`, inline: true },
          { name: 'Raison initiale', value: data.reason },
          { name: 'Résumé', value: data.summary }
        ])
        .setColor('#00FF00');
      break;
  }

  return embed;
}