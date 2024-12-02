import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { db } from '../database/index.js';

export async function handleSetupCommand(interaction) {
  if (!interaction.member.permissions.has('ADMINISTRATOR')) {
    return interaction.reply({
      content: 'Vous devez être administrateur pour utiliser cette commande.',
      ephemeral: true
    });
  }

  // Vérifier si une configuration existe déjà
  const existingConfig = db.prepare('SELECT * FROM guild_config WHERE guild_id = ?')
    .get(interaction.guild.id);

  if (existingConfig && existingConfig.setup_completed) {
    // Créer les boutons de confirmation
    const confirmButton = new ButtonBuilder()
      .setCustomId('setup_confirm')
      .setLabel('Oui, reconfigurer')
      .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
      .setCustomId('setup_cancel')
      .setLabel('Non, annuler')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Configuration Existante')
      .setDescription('Une configuration existe déjà pour ce serveur. Voulez-vous vraiment la réinitialiser ?')
      .addFields([
        { name: '⚠️ Attention', value: 'Cette action supprimera tous les paramètres actuels.' },
        { name: '📋 Configuration actuelle', value: `
          • Salon de logs tickets: ${existingConfig.ticket_log_channel_id ? `<#${existingConfig.ticket_log_channel_id}>` : 'Non configuré'}
          • Salon de logs présence: ${existingConfig.presence_log_channel_id ? `<#${existingConfig.presence_log_channel_id}>` : 'Non configuré'}
          • Salon de logs convocations: ${existingConfig.summon_log_channel_id ? `<#${existingConfig.summon_log_channel_id}>` : 'Non configuré'}
          • Catégorie tickets: ${existingConfig.ticket_category_id ? `<#${existingConfig.ticket_category_id}>` : 'Non configuré'}
          • État des tickets: ${existingConfig.tickets_enabled ? 'Activés' : 'Désactivés'}
          • Configuration effectuée le: ${new Date(existingConfig.setup_timestamp).toLocaleString('fr-FR')}
        ` }
      ])
      .setColor('#FF9900')
      .setTimestamp();

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  await performSetup(interaction);
}

async function performSetup(interaction) {
  await interaction.deferReply({ ephemeral: true });

  try {
    // Supprimer l'ancienne configuration si elle existe
    await cleanupOldConfig(interaction.guild);

    // Créer la catégorie pour les tickets
    const category = await interaction.guild.channels.create({
      name: '🎫 Tickets',
      type: 4,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ['ViewChannel']
        }
      ]
    });

    // Créer les salons de logs
    const ticketLogChannel = await interaction.guild.channels.create({
      name: '📝-logs-tickets',
      type: 0,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ['ViewChannel']
        }
      ]
    });

    const presenceLogChannel = await interaction.guild.channels.create({
      name: '📝-logs-presence',
      type: 0,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ['ViewChannel']
        }
      ]
    });

    const summonLogChannel = await interaction.guild.channels.create({
      name: '📝-logs-convocations',
      type: 0,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: ['ViewChannel']
        }
      ]
    });

    // Sauvegarder la configuration
    db.prepare(`
      INSERT OR REPLACE INTO guild_config (
        guild_id,
        ticket_log_channel_id,
        presence_log_channel_id,
        summon_log_channel_id,
        ticket_category_id,
        tickets_enabled,
        setup_completed,
        setup_timestamp,
        summon_roles
      )
      VALUES (?, ?, ?, ?, ?, 1, 1, CURRENT_TIMESTAMP, '[]')
    `).run(
      interaction.guild.id,
      ticketLogChannel.id,
      presenceLogChannel.id,
      summonLogChannel.id,
      category.id
    );

    const embed = new EmbedBuilder()
      .setTitle('✅ Configuration Terminée')
      .setDescription('Le système a été configuré avec succès!')
      .addFields([
        { name: 'Catégorie Tickets', value: `<#${category.id}>`, inline: true },
        { name: 'Logs Tickets', value: `<#${ticketLogChannel.id}>`, inline: true },
        { name: 'Logs Présence', value: `<#${presenceLogChannel.id}>`, inline: true },
        { name: 'Logs Convocations', value: `<#${summonLogChannel.id}>`, inline: true },
        { 
          name: 'Prochaines étapes', 
          value: `
            1. Configurez les rôles de convocation avec \`/config summon\`
            2. Ajoutez des services avec \`/service add\`
            3. Configurez les rôles des services avec \`/service roles\`
            4. Créez le salon d'aide avec \`/config help\`
          `
        }
      ])
      .setColor('#00FF00')
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error('Erreur lors de la configuration:', error);
    await interaction.editReply('Une erreur est survenue lors de la configuration.');
  }
}

async function cleanupOldConfig(guild) {
  const config = db.prepare('SELECT * FROM guild_config WHERE guild_id = ?')
    .get(guild.id);

  if (config) {
    // Supprimer les anciens canaux
    try {
      if (config.ticket_log_channel_id) {
        const channel = await guild.channels.fetch(config.ticket_log_channel_id);
        if (channel) await channel.delete();
      }
      if (config.presence_log_channel_id) {
        const channel = await guild.channels.fetch(config.presence_log_channel_id);
        if (channel) await channel.delete();
      }
      if (config.summon_log_channel_id) {
        const channel = await guild.channels.fetch(config.summon_log_channel_id);
        if (channel) await channel.delete();
      }
      if (config.ticket_category_id) {
        const category = await guild.channels.fetch(config.ticket_category_id);
        if (category) await category.delete();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des anciens canaux:', error);
    }

    // Nettoyer la base de données
    db.prepare('DELETE FROM guild_config WHERE guild_id = ?').run(guild.id);
    db.prepare('UPDATE ticket_categories SET is_active = 0 WHERE guild_id = ?').run(guild.id);
  }
}