import { EmbedBuilder } from 'discord.js';
import { db } from '../database/index.js';
import { 
  getActiveTicket,
  updateServiceStatus,
  getServiceStatusEmoji,
  getTicketList,
  createNewTicket,
  closeTicket
} from '../utils/ticketUtils.js';
import { getLogChannel, getTicketCategory } from '../utils/channelUtils.js';

export async function handleTicketCommand(interaction) {
  if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
    return interaction.reply({
      content: 'Vous n\'avez pas les permissions nécessaires.',
      ephemeral: true
    });
  }

  const subcommand = interaction.options.getSubcommand();
  
  try {
    switch (subcommand) {
      case 'list':
        await handleTicketList(interaction);
        break;
      case 'close':
        await handleTicketClose(interaction);
        break;
      case 'toggle':
        await handleTicketToggle(interaction);
        break;
      default:
        await interaction.reply({
          content: 'Sous-commande inconnue.',
          ephemeral: true
        });
    }
  } catch (error) {
    console.error('Erreur dans handleTicketCommand:', error);
    await interaction.reply({
      content: 'Une erreur est survenue lors du traitement de la commande.',
      ephemeral: true
    });
  }
}

async function handleTicketList(interaction) {
  const tickets = await getTicketList(interaction.guildId);

  if (tickets.length === 0) {
    return interaction.reply({
      content: 'Aucun ticket actif.',
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('🎫 Tickets Actifs')
    .setDescription(tickets.map(ticket => 
      `**#${ticket.id}** - ${ticket.category_name} - <@${ticket.user_id}>`
    ).join('\n'))
    .setColor('#00FF00')
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleTicketClose(interaction) {
  const ticketId = interaction.options.getInteger('id');
  const reason = interaction.options.getString('reason');

  try {
    const ticket = await closeTicket(ticketId, interaction.user.id);
    
    const embed = new EmbedBuilder()
      .setTitle('🔒 Ticket Fermé')
      .setDescription(`Le ticket #${ticketId} a été fermé`)
      .addFields([
        { name: 'Service', value: ticket.category_name, inline: true },
        { name: 'Fermé par', value: `<@${interaction.user.id}>`, inline: true },
        { name: 'Raison', value: reason || 'Aucune raison spécifiée' }
      ])
      .setColor('#FF0000')
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Notifier dans les logs
    const logChannel = await getLogChannel(interaction.guildId);
    if (logChannel) {
      await logChannel.send({ embeds: [embed] });
    }
  } catch (error) {
    await interaction.reply({
      content: error.message,
      ephemeral: true
    });
  }
}

async function handleTicketToggle(interaction) {
  const currentState = db.prepare(`
    SELECT tickets_enabled FROM guild_config WHERE guild_id = ?
  `).get(interaction.guildId);

  const newState = !currentState?.tickets_enabled;

  db.prepare(`
    UPDATE guild_config 
    SET tickets_enabled = ?
    WHERE guild_id = ?
  `).run(newState, interaction.guildId);

  const embed = new EmbedBuilder()
    .setTitle(`${newState ? '🟢' : '🔴'} Système de Tickets ${newState ? 'Activé' : 'Désactivé'}`)
    .setDescription(`Le système de tickets est maintenant ${newState ? 'activé' : 'désactivé'}.`)
    .setColor(newState ? '#00FF00' : '#FF0000')
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  // Notifier dans les logs
  const logChannel = await getLogChannel(interaction.guildId);
  if (logChannel) {
    await logChannel.send({ embeds: [embed] });
  }
}