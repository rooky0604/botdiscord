import { SlashCommandBuilder } from 'discord.js';
import { writeFile } from 'fs/promises';

export const command = {
  data: new SlashCommandBuilder()
    .setName('setup-env')
    .setDescription('Configurer les variables d\'environnement')
    .addStringOption(option =>
      option.setName('token')
        .setDescription('Token du bot Discord')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('db-host')
        .setDescription('Hôte MySQL')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('db-user')
        .setDescription('Utilisateur MySQL')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('db-pass')
        .setDescription('Mot de passe MySQL')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('db-name')
        .setDescription('Nom de la base de données MySQL')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.member.permissions.has('ADMINISTRATOR')) {
      return interaction.reply({
        content: 'Vous n\'avez pas la permission d\'utiliser cette commande.',
        ephemeral: true
      });
    }

    try {
      const token = interaction.options.getString('token');
      const dbHost = interaction.options.getString('db-host');
      const dbUser = interaction.options.getString('db-user');
      const dbPass = interaction.options.getString('db-pass');
      const dbName = interaction.options.getString('db-name');

      const envContent = `TOKEN=${token}\nDB_HOST=${dbHost}\nDB_USER=${dbUser}\nDB_PASS=${dbPass}\nDB_NAME=${dbName}`;
      
      await writeFile('.env', envContent);

      await interaction.reply({
        content: 'Configuration des variables d\'environnement effectuée avec succès! Redémarrez le bot pour appliquer les changements.',
        ephemeral: true
      });
    } catch (error) {
      console.error('Erreur lors de la configuration des variables d\'environnement:', error);
      await interaction.reply({
        content: 'Une erreur est survenue lors de la configuration des variables d\'environnement.',
        ephemeral: true
      });
    }
  }
};