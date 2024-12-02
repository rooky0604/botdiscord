import { EmbedBuilder } from 'discord.js';
import { 
  getActiveTicket, 
  getAvailableCategories, 
  createTicketEmbed, 
  createNewTicket,
  isTicketEnabled,
  saveTicketMessage,
  getServiceStatusEmoji,
  closeTicket
} from '../utils/ticketUtils.js';
import { createHelpEmbed, createInvalidCommandEmbed } from '../utils/embedUtils.js';
import { db } from '../database/index.js';
import { getLogChannel } from '../utils/channelUtils.js';
import { logTicketAction, createTicketEmbed as createLogEmbed } from '../utils/loggingUtils.js';

export function setupMessageRelay(client) {
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    try {
      if (message.channel.type === 1) { // DM Channel
        await handleDMMessage(message, client);
      } else if (message.guild) {
        await handleGuildMessage(message, client);
      }
    } catch (error) {
      console.error('Error in message relay:', error);
      message.reply('Une erreur est survenue lors du traitement de votre message.').catch(console.error);
    }
  });
}

async function handleDMMessage(message, client) {
  const activeTicket = await getActiveTicket(message.author.id);

  // Gérer la commande !close
  if (message.content.toLowerCase() === '!close') {
    if (!activeTicket) {
      const services = await getAvailableCategories(message.author.id);
      const embed = createHelpEmbed(services);
      return message.reply({ embeds: [embed] });
    }

    try {
      const closedTicket = await closeTicket(activeTicket.id, message.author.id);
      const guild = await client.guilds.fetch(closedTicket.guild_id);
      
      const embed = new EmbedBuilder()
        .setTitle('🔒 Ticket Fermé')
        .setDescription(`Votre ticket pour le service "${closedTicket.category_name}" a été fermé.`)
        .addFields([
          { name: 'ID du Ticket', value: `#${closedTicket.id}`, inline: true },
          { name: 'Service', value: closedTicket.category_name, inline: true },
          { name: 'Serveur', value: guild.name, inline: true }
        ])
        .setColor('#FF0000')
        .setTimestamp();

      await message.reply({ embeds: [embed] });

      // Log the ticket closure
      const logEmbed = createLogEmbed('CLOSE', {
        id: closedTicket.id,
        service: closedTicket.category_name,
        userId: message.author.id,
        closedBy: message.author.id
      });
      await logTicketAction(guild.id, logEmbed);
      return;
    } catch (error) {
      console.error('Erreur lors de la fermeture du ticket:', error);
      return message.reply('Une erreur est survenue lors de la fermeture du ticket.');
    }
  }

  // Si le message commence par ! et qu'il n'y a pas de ticket actif
  if (message.content.startsWith('!')) {
    const command = message.content.toLowerCase();
    
    // Récupérer tous les services disponibles
    const services = await getAvailableCategories();
    const service = services.find(s => s.command.toLowerCase() === command);

    if (!service) {
      const embed = createInvalidCommandEmbed(command, services);
      return message.reply({ embeds: [embed] });
    }

    // Vérifier si le système est activé
    if (!isTicketEnabled(service.guild_id)) {
      return message.reply('Le système de tickets est actuellement désactivé.');
    }

    // Vérifier si le service est ouvert
    if (service.service_status !== 'OPEN') {
      const embed = new EmbedBuilder()
        .setTitle(`${getServiceStatusEmoji(service.service_status)} Service Indisponible`)
        .setDescription(`Le service "${service.name}" n'est pas disponible actuellement.`)
        .addFields([
          { name: 'État', value: service.service_status },
          service.status_reason ? { name: 'Raison', value: service.status_reason } : null
        ].filter(Boolean))
        .setColor('#FF0000')
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (!activeTicket) {
      try {
        const ticket = await createNewTicket(message.author.id, service.guild_id, service.id);
        const guild = await client.guilds.fetch(service.guild_id);
        
        const embed = new EmbedBuilder()
          .setTitle('🎫 Nouveau Ticket')
          .setDescription(`Votre ticket pour le service "${service.name}" a été créé.`)
          .addFields([
            { name: 'ID du Ticket', value: `#${ticket.lastInsertRowid}`, inline: true },
            { name: 'Service', value: service.name, inline: true },
            { name: 'Serveur', value: guild.name, inline: true }
          ])
          .setColor('#00FF00')
          .setTimestamp();

        await message.reply({ embeds: [embed] });

        // Log the ticket creation
        const logEmbed = createLogEmbed('CREATE', {
          id: ticket.lastInsertRowid,
          service: service.name,
          userId: message.author.id
        });
        await logTicketAction(guild.id, logEmbed);
      } catch (error) {
        console.error('Erreur lors de la création du ticket:', error);
        return message.reply(error.message);
      }
    } else {
      const embed = new EmbedBuilder()
        .setTitle('❌ Ticket Déjà Ouvert')
        .setDescription('Vous avez déjà un ticket ouvert.')
        .addFields([
          { name: 'Service Actuel', value: activeTicket.category_name },
          { name: 'ID du Ticket', value: `#${activeTicket.id}` },
          { name: 'Pour Fermer', value: 'Utilisez la commande `!close`' }
        ])
        .setColor('#FF0000')
        .setTimestamp();

      await message.reply({ embeds: [embed] });
    }
    return;
  }

  // Si pas de ticket actif, montrer la liste des services
  if (!activeTicket) {
    const services = await getAvailableCategories();
    const embed = createHelpEmbed(services);
    return message.reply({ embeds: [embed] });
  }

  // Relayer le message au salon du ticket
  await relayMessageToGuild(message, activeTicket, client);
}

async function handleGuildMessage(message, client) {
  // Implémentation du relais des messages du serveur vers les DM
  // À implémenter selon vos besoins
}

async function relayMessageToGuild(message, ticket, client) {
  try {
    // Sauvegarder le message
    await saveTicketMessage(ticket.id, message.author.id, message.content);

    // Log the message
    const logEmbed = createLogEmbed('MESSAGE', {
      id: ticket.id,
      service: ticket.category_name,
      userId: message.author.id,
      content: message.content
    });

    const guild = await client.guilds.fetch(ticket.guild_id);
    await logTicketAction(guild.id, logEmbed);

    // Confirmer la réception
    await message.react('✅');
  } catch (error) {
    console.error('Erreur lors du relais du message:', error);
    await message.reply('Une erreur est survenue lors de l\'envoi de votre message.');
  }
}