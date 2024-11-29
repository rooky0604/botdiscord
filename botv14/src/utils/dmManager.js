import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { Ticket } from '../database/models/Ticket.js';
import { Service } from '../database/models/Service.js';
import { createTicketButtons } from './ticketEmbed.js';

export async function createDMTicket(message) {
  // Récupérer tous les serveurs où le bot est présent
  const guilds = message.client.guilds.cache;
  
  // Vérifier si l'utilisateur a déjà un ticket ouvert (DM ou normal)
  const existingTickets = await Ticket.find({
    userId: message.author.id,
    status: 'open'
  });

  // Si l'utilisateur a déjà un ticket ouvert (DM ou normal)
  if (existingTickets.length > 0) {
    const ticketTypes = existingTickets.map(ticket => ticket.type === 'dm' ? 'message privé' : 'ticket de support');
    await message.reply(`Vous avez déjà un ${ticketTypes[0]} ouvert. Veuillez attendre qu'il soit fermé avant d'en ouvrir un nouveau.`);
    return;
  }

  // Si pas de ticket existant, créer un nouveau ticket dans le premier serveur disponible
  const guild = guilds.first();
  if (!guild) return;

  // Trouver le service "Support MP" ou le créer s'il n'existe pas
  let service = await Service.findOne({
    guildId: guild.id,
    name: 'Support MP'
  });

  if (!service) {
    // Créer une catégorie pour les tickets MP
    const category = await guild.channels.create({
      name: 'Support MP',
      type: ChannelType.GuildCategory
    });

    service = await Service.create({
      guildId: guild.id,
      name: 'Support MP',
      number: 999, // Numéro spécial pour le support MP
      category: category.id,
      roles: [],
      ticketTypes: [{ name: 'MP', description: 'Messages privés des utilisateurs' }]
    });
  }

  // Créer un nouveau canal pour le ticket
  const channel = await guild.channels.create({
    name: `mp-${message.author.username}`,
    type: ChannelType.GuildText,
    parent: service.category,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      ...service.roles.map(role => ({
        id: role.roleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      })),
    ],
  });

  // Créer le ticket dans la base de données
  const ticket = await Ticket.create({
    guildId: guild.id,
    channelId: channel.id,
    userId: message.author.id,
    serviceId: service._id,
    type: 'dm'
  });

  const buttons = createTicketButtons();

  // Envoyer le message initial dans le canal
  await channel.send({
    content: `**Nouveau message privé de ${message.author.tag}**\n\n${message.content}`,
    components: [buttons]
  });

  await message.react('✅');
}