import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { Ticket } from '../database/models/Ticket.js';
import { createTicketButtons } from './ticketEmbed.js';

export async function createTicketChannel(message, service) {
  // Vérifier si l'utilisateur a déjà un ticket ouvert
  const existingTicket = await Ticket.findOne({
    userId: message.author.id,
    status: 'open'
  });

  if (existingTicket) {
    await message.reply({
      content: 'Vous avez déjà un ticket ouvert. Veuillez attendre qu\'il soit fermé avant d\'en ouvrir un nouveau.',
      ephemeral: true
    });
    return null;
  }

  const channel = await message.guild.channels.create({
    name: `ticket-${message.author.username}`,
    type: ChannelType.GuildText,
    parent: service.category,
    permissionOverwrites: [
      {
        id: message.guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: message.author.id,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      },
      ...service.roles.map(role => ({
        id: role.roleId,
        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
      })),
    ],
  });

  const ticket = await Ticket.create({
    guildId: message.guildId,
    channelId: channel.id,
    userId: message.author.id,
    serviceId: service._id,
    type: 'support'
  });

  const buttons = createTicketButtons();
  
  await channel.send({
    content: `Ticket créé par ${message.author}\nService: ${service.name} (N°${service.number})`,
    components: [buttons]
  });

  return channel;
}

export async function closeTicket(channel) {
  const ticket = await Ticket.findOne({ channelId: channel.id });
  if (!ticket) return false;

  ticket.status = 'closed';
  await ticket.save();

  // Si c'est un ticket MP, informer l'utilisateur
  if (ticket.type === 'dm') {
    try {
      const user = await channel.client.users.fetch(ticket.userId);
      await user.send('Votre conversation a été fermée par un modérateur. Si vous avez besoin d\'aide supplémentaire, n\'hésitez pas à envoyer un nouveau message.');
    } catch (error) {
      console.error('Impossible d\'envoyer le message à l\'utilisateur:', error);
    }
  }

  await channel.permissionOverwrites.edit(ticket.userId, {
    ViewChannel: false,
    SendMessages: false
  });

  await channel.send('🔒 Ce ticket a été fermé par un modérateur.');
  return true;
}

export async function handleStaffReply(message) {
  // Vérifier si le message est dans un canal de ticket
  const ticket = await Ticket.findOne({ channelId: message.channel.id });
  if (!ticket || ticket.status !== 'open') return;

  // Si c'est un ticket MP, transférer la réponse à l'utilisateur
  if (ticket.type === 'dm') {
    try {
      const user = await message.client.users.fetch(ticket.userId);
      await user.send(`**Réponse du staff:** ${message.content}`);
      await message.react('✅');
    } catch (error) {
      console.error('Impossible d\'envoyer le message à l\'utilisateur:', error);
      await message.reply('Erreur: Impossible d\'envoyer le message à l\'utilisateur.');
    }
  }
}