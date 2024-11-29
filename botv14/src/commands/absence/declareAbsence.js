import { SlashCommandBuilder } from 'discord.js';
import { Service } from '../../database/models/Service.js';
import { Absence } from '../../database/models/Absence.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('declare-absence')
    .setDescription('Déclarer une absence')
    .addStringOption(option =>
      option.setName('service')
        .setDescription('Service concerné')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Raison de l\'absence')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('start-date')
        .setDescription('Date de début (YYYY-MM-DD)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('end-date')
        .setDescription('Date de fin (YYYY-MM-DD)')
        .setRequired(true)),

  async execute(interaction) {
    const serviceName = interaction.options.getString('service');
    const reason = interaction.options.getString('reason');
    const startDate = new Date(interaction.options.getString('start-date'));
    const endDate = new Date(interaction.options.getString('end-date'));

    try {
      const service = await Service.findOne({
        guildId: interaction.guildId,
        name: serviceName
      });

      if (!service) {
        return interaction.reply({
          content: 'Service non trouvé.',
          ephemeral: true
        });
      }

      const absence = await Absence.create({
        guildId: interaction.guildId,
        userId: interaction.user.id,
        serviceId: service._id,
        reason,
        startDate,
        endDate
      });

      // Notifier les responsables du service
      const channel = await interaction.guild.channels.cache.get(service.category);
      if (channel) {
        await channel.send({
          content: `Nouvelle demande d'absence de ${interaction.user}\nService: ${serviceName}\nRaison: ${reason}\nPériode: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
        });
      }

      await interaction.reply({
        content: 'Votre demande d\'absence a été enregistrée et est en attente de validation.',
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Une erreur est survenue lors de la déclaration de l\'absence.',
        ephemeral: true
      });
    }
  }
};