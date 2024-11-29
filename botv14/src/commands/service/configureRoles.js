import { SlashCommandBuilder } from 'discord.js';
import { Service } from '../../database/models/Service.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('configure-roles')
    .setDescription('Configurer les rôles pour un service')
    .addStringOption(option =>
      option.setName('service')
        .setDescription('Nom du service')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('Rôle à ajouter')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('role-name')
        .setDescription('Nom du rôle dans le service')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
    }

    const serviceName = interaction.options.getString('service');
    const role = interaction.options.getRole('role');
    const roleName = interaction.options.getString('role-name');

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

      service.roles.push({
        name: roleName,
        roleId: role.id
      });

      await service.save();

      await interaction.reply({
        content: `Rôle "${roleName}" configuré avec succès pour le service "${serviceName}"!`,
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Une erreur est survenue lors de la configuration du rôle.',
        ephemeral: true
      });
    }
  }
};