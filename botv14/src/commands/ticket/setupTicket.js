import { SlashCommandBuilder } from 'discord.js';
import { Service } from '../../database/models/Service.js';
import { createTicketEmbed } from '../../utils/ticketEmbed.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('setup-ticket')
    .setDescription('Configurer le système de tickets')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Canal où envoyer le message de création de ticket')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
    }

    try {
      const channel = interaction.options.getChannel('channel');
      const services = await Service.find({ guildId: interaction.guildId }).sort('number');

      if (services.length === 0) {
        return interaction.reply({
          content: 'Aucun service n\'a été configuré. Utilisez /create-service pour en créer.',
          ephemeral: true
        });
      }

      const embed = createTicketEmbed(services);
      await channel.send({ embeds: [embed] });

      await interaction.reply({
        content: 'Le système de tickets a été configuré avec succès!',
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Une erreur est survenue lors de la configuration du système de tickets.',
        ephemeral: true
      });
    }
  }
};