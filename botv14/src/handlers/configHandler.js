import { EmbedBuilder } from 'discord.js';
import { db } from '../database/index.js';
import { createHelpChannel } from '../utils/helpUtils.js';
import { canManageSummons } from '../utils/summonUtils.js';

export async function handleConfigCommand(interaction) {
  if (!interaction.member.permissions.has('ADMINISTRATOR')) {
    return interaction.reply({
      content: 'Vous devez être administrateur pour utiliser cette commande.',
      ephemeral: true
    });
  }

  const subcommand = interaction.options.getSubcommand();

  try {
    switch (subcommand) {
      case 'logs':
        await handleLogsConfig(interaction);
        break;
      case 'help':
        await handleHelpConfig(interaction);
        break;
      case 'summon':
        await handleSummonConfig(interaction);
        break;
    }
  } catch (error) {
    console.error('Erreur lors de la configuration:', error);
    await interaction.reply({
      content: 'Une erreur est survenue lors de la configuration.',
      ephemeral: true
    });
  }
}

async function handleLogsConfig(interaction) {
  const ticketLogs = interaction.options.getChannel('ticket_logs');
  const presenceLogs = interaction.options.getChannel('presence_logs');
  const summonLogs = interaction.options.getChannel('summon_logs');

  // Mettre à jour la configuration
  db.prepare(`
    INSERT OR REPLACE INTO guild_config (
      guild_id,
      ticket_log_channel_id,
      presence_log_channel_id,
      summon_log_channel_id
    ) VALUES (?, ?, ?, ?)
  `).run(
    interaction.guildId,
    ticketLogs.id,
    presenceLogs.id,
    summonLogs.id
  );

  const embed = new EmbedBuilder()
    .setTitle('⚙️ Configuration des Logs')
    .setDescription('Les salons de logs ont été configurés avec succès!')
    .addFields([
      { name: 'Logs Tickets', value: `<#${ticketLogs.id}>`, inline: true },
      { name: 'Logs Présence', value: `<#${presenceLogs.id}>`, inline: true },
      { name: 'Logs Convocations', value: `<#${summonLogs.id}>`, inline: true }
    ])
    .setColor('#00FF00')
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleHelpConfig(interaction) {
  // Créer le salon d'aide
  const helpChannel = await interaction.guild.channels.create({
    name: '📚-commandes',
    type: 0,
    topic: 'Liste des commandes du bot'
  });

  // Créer les messages d'aide
  await createHelpChannel(helpChannel);

  const embed = new EmbedBuilder()
    .setTitle('✅ Salon d\'Aide Créé')
    .setDescription(`Le salon d'aide a été créé: <#${helpChannel.id}>`)
    .setColor('#00FF00')
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}

async function handleSummonConfig(interaction) {
  const addRole = interaction.options.getRole('add_role');
  const removeRole = interaction.options.getRole('remove_role');

  // Récupérer les rôles actuels
  const config = db.prepare('SELECT summon_roles FROM guild_config WHERE guild_id = ?')
    .get(interaction.guildId);

  let roles = config?.summon_roles ? JSON.parse(config.summon_roles) : [];

  if (addRole) {
    if (!roles.includes(addRole.id)) {
      roles.push(addRole.id);
    }
  }

  if (removeRole) {
    roles = roles.filter(id => id !== removeRole.id);
  }

  // Mettre à jour la configuration
  db.prepare(`
    INSERT OR REPLACE INTO guild_config (
      guild_id,
      summon_roles
    ) VALUES (?, ?)
  `).run(interaction.guildId, JSON.stringify(roles));

  const embed = new EmbedBuilder()
    .setTitle('⚙️ Configuration des Convocations')
    .setDescription('Les rôles autorisés à convoquer ont été mis à jour.')
    .addFields([
      {
        name: 'Rôles autorisés',
        value: roles.length > 0
          ? roles.map(id => `<@&${id}>`).join(', ')
          : '*Aucun rôle configuré*'
      },
      {
        name: 'ℹ️ Note',
        value: 'Les rôles supérieurs dans la hiérarchie peuvent également convoquer.'
      }
    ])
    .setColor('#00FF00')
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}