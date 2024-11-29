import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function createTicketEmbed(services) {
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle('Système de Tickets')
    .setDescription('Pour créer un ticket, sélectionnez le numéro du service concerné.')
    .addFields(
      services.map(service => ({
        name: `${service.number}. ${service.name}`,
        value: `Types de tickets disponibles:\n${service.ticketTypes.map(type => `- ${type.name}`).join('\n') || 'Aucun type configuré'}`
      }))
    );

  return embed;
}

export function createTicketButtons() {
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('close_ticket')
        .setLabel('Fermer le ticket')
        .setStyle(ButtonStyle.Danger)
    );

  return row;
}