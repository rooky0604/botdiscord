import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { db } from '../database/index.js';
import { getLogChannel } from '../utils/channelUtils.js';
import { formatDate } from '../utils/dateUtils.js';
import { canManageSummons } from '../utils/summonUtils.js';

export async function handleSummonCommand(interaction) {
  // Vérifier les permissions
  if (!canManageSummons(interaction.member)) {
    return interaction.reply({
      content: 'Vous n\'avez pas les permissions nécessaires pour gérer les convocations.',
      ephemeral: true
    });
  }

  const subcommand = interaction.options.getSubcommand();

  try {
    switch (subcommand) {
      case 'create':
        await handleSummonCreate(interaction);
        break;
      case 'config':
        await handleSummonConfig(interaction);
        break;
      case 'list':
        await handleSummonList(interaction);
        break;
      case 'recent':
        await handleSummonRecent(interaction);
        break;
      case 'complete':
        await handleSummonComplete(interaction);
        break;
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de la convocation:', error);
    await interaction.reply({
      content: 'Une erreur est survenue lors du traitement de la commande.',
      ephemeral: true
    });
  }
}

async function handleSummonCreate(interaction) {
  const user = interaction.options.getUser('user');
  const reason = interaction.options.getString('reason');

  // Vérifier si l'utilisateur a déjà une convocation en cours
  const existingSummon = db.prepare(`
    SELECT * FROM summons 
    WHERE guild_id = ? AND user_id = ? AND status = 'PENDING'
  `).get(interaction.guildId, user.id);

  if (existingSummon) {
    const embed = new EmbedBuilder()
      .setTitle('⚠️ Convocation Existante')
      .setDescription(`${user.tag} a déjà une convocation en cours.`)
      .addFields([
        { name: 'ID', value: `#${existingSummon.id}`, inline: true },
        { name: 'Raison', value: existingSummon.reason, inline: true },
        { name: 'Date', value: formatDate(existingSummon.created_at), inline: true },
        { name: 'Convoqué par', value: `<@${existingSummon.summoner_id}>` }
      ])
      .setColor('#FF9900')
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  // Créer la convocation
  const result = db.prepare(`
    INSERT INTO summons (guild_id, user_id, summoner_id, reason, status)
    VALUES (?, ?, ?, ?, 'PENDING')
  `).run(interaction.guildId, user.id, interaction.user.id, reason);

  const embed = new EmbedBuilder()
    .setTitle('📨 Nouvelle Convocation')
    .setDescription(`Convocation créée pour ${user.tag}`)
    .addFields([
      { name: 'ID', value: `#${result.lastInsertRowid}`, inline: true },
      { name: 'Utilisateur', value: `<@${user.id}>`, inline: true },
      { name: 'Raison', value: reason, inline: true },
      { name: 'Convoqué par', value: `<@${interaction.user.id}>` }
    ])
    .setColor('#FF9900')
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  // Notifier dans les logs
  const logChannel = await getLogChannel(interaction.guildId, 'summon');
  if (logChannel) {
    await logChannel.send({ embeds: [embed] });
  }

  // Notifier l'utilisateur
  try {
    const userEmbed = new EmbedBuilder()
      .setTitle('📨 Convocation')
      .setDescription(`Vous avez été convoqué sur ${interaction.guild.name}`)
      .addFields([
        { name: 'Raison', value: reason },
        { name: 'Convoqué par', value: `<@${interaction.user.id}>` }
      ])
      .setColor('#FF9900')
      .setTimestamp();

    await user.send({ embeds: [userEmbed] });
  } catch (error) {
    await interaction.followUp({ 
      content: 'Impossible d\'envoyer un message privé à l\'utilisateur.',
      ephemeral: true 
    });
  }
}

async function handleSummonComplete(interaction) {
  const user = interaction.options.getUser('user');
  const summary = interaction.options.getString('summary');

  // Récupérer la convocation en cours
  const summon = db.prepare(`
    SELECT * FROM summons 
    WHERE guild_id = ? AND user_id = ? AND status = 'PENDING'
    ORDER BY created_at DESC
    LIMIT 1
  `).get(interaction.guildId, user.id);

  if (!summon) {
    const pendingSummons = db.prepare(`
      SELECT * FROM summons 
      WHERE guild_id = ? AND status = 'PENDING'
      ORDER BY created_at DESC
    `).all(interaction.guildId);

    if (pendingSummons.length === 0) {
      return interaction.reply({
        content: 'Aucune convocation en cours.',
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle('📋 Convocations en Cours')
      .setDescription('Voici la liste des convocations en cours:')
      .addFields(
        pendingSummons.map(s => ({
          name: `ID #${s.id} - ${interaction.client.users.cache.get(s.user_id)?.tag || 'Utilisateur inconnu'}`,
          value: `Raison: ${s.reason}\nDate: ${formatDate(s.created_at)}\nConvoqué par: <@${s.summoner_id}>`
        }))
      )
      .setColor('#FF9900')
      .setTimestamp();

    return interaction.reply({ 
      content: 'Aucune convocation trouvée pour cet utilisateur. Voici les convocations en cours:',
      embeds: [embed],
      ephemeral: true 
    });
  }

  // Mettre à jour la convocation
  db.prepare(`
    UPDATE summons 
    SET status = 'COMPLETED', 
        completed_at = CURRENT_TIMESTAMP,
        summary = ?
    WHERE id = ?
  `).run(summary, summon.id);

  const embed = new EmbedBuilder()
    .setTitle('✅ Convocation Traitée')
    .addFields([
      { name: 'ID', value: `#${summon.id}`, inline: true },
      { name: 'Utilisateur', value: `<@${summon.user_id}>`, inline: true },
      { name: 'Traité par', value: `<@${interaction.user.id}>`, inline: true },
      { name: 'Raison initiale', value: summon.reason },
      { name: 'Résumé', value: summary }
    ])
    .setColor('#00FF00')
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  // Notifier dans les logs
  const logChannel = await getLogChannel(interaction.guildId, 'summon');
  if (logChannel) {
    await logChannel.send({ embeds: [embed] });
  }
}

async function handleSummonList(interaction) {
  const summons = db.prepare(`
    SELECT * FROM summons 
    WHERE guild_id = ? AND status = 'PENDING'
    ORDER BY created_at DESC
  `).all(interaction.guildId);

  if (summons.length === 0) {
    return interaction.reply({
      content: 'Aucune convocation en cours.',
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('📋 Convocations en Cours')
    .addFields(
      summons.map(summon => ({
        name: `ID #${summon.id} - ${interaction.client.users.cache.get(summon.user_id)?.tag || 'Utilisateur inconnu'}`,
        value: `
          • Raison: ${summon.reason}
          • Date: ${formatDate(summon.created_at)}
          • Convoqué par: <@${summon.summoner_id}>
        `
      }))
    )
    .setColor('#FF9900')
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('summon_complete')
        .setLabel('Marquer comme traité')
        .setStyle(ButtonStyle.Success)
    );

  await interaction.reply({ 
    embeds: [embed], 
    components: [row],
    ephemeral: true 
  });
}

async function handleSummonRecent(interaction) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const summons = db.prepare(`
    SELECT * FROM summons 
    WHERE guild_id = ? AND created_at >= datetime(?)
    ORDER BY created_at DESC
  `).all(interaction.guildId, yesterday.toISOString());

  if (summons.length === 0) {
    return interaction.reply({
      content: 'Aucune convocation dans les dernières 24h.',
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('📋 Convocations Récentes')
    .addFields(
      summons.map(summon => ({
        name: `ID #${summon.id} - ${interaction.client.users.cache.get(summon.user_id)?.tag || 'Utilisateur inconnu'}`,
        value: `
          • Statut: ${summon.status === 'PENDING' ? '⏳ En attente' : '✅ Traité'}
          • Raison: ${summon.reason}
          • Date: ${formatDate(summon.created_at)}
          • Convoqué par: <@${summon.summoner_id}>
          ${summon.summary ? `• Résumé: ${summon.summary}` : ''}
        `
      }))
    )
    .setColor('#FF9900')
    .setTimestamp();

  await interaction.reply({ 
    embeds: [embed],
    ephemeral: true 
  });
}