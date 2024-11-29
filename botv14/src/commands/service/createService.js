import { SlashCommandBuilder } from 'discord.js';
import { Service } from '../../database/models/Service.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('create-service')
    .setDescription('Créer un nouveau service')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Nom du service')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('Numéro du service')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Catégorie du service')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({ content: 'Vous n\'avez pas la permission d\'utiliser cette commande.', ephemeral: true });
    }

    const name = interaction.options.getString('name');
    const number = interaction.options.getInteger('number');
    const category = interaction.options.getString('category');

    try {
      // Vérifier si le numéro est déjà utilisé
      const existingService = await Service.findOne({
        guildId: interaction.guildId,
        number: number
      });

      if (existingService) {
        return interaction.reply({
          content: `Le numéro ${number} est déjà utilisé par un autre service.`,
          ephemeral: true
        });
      }

      const service = await Service.create({
        guildId: interaction.guildId,
        name,
        number,
        category,
        roles: [],
        ticketTypes: []
      });

      await interaction.reply({
        content: `Service "${name}" (N°${number}) créé avec succès dans la catégorie "${category}"!`,
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Une erreur est survenue lors de la création du service.',
        ephemeral: true
      });
    }
  }
};