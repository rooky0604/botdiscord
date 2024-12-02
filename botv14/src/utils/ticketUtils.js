import { EmbedBuilder } from 'discord.js';
import { db } from '../database/index.js';
import { getLogChannel } from './channelUtils.js';
import { hasServiceAccess } from './roleUtils.js';

export function getServiceStatusEmoji(status) {
  switch (status?.toUpperCase()) {
    case 'OPEN': return '🟢';
    case 'CLOSED': return '🔴';
    case 'LIMITED': return '🟠';
    default: return '⚪';
  }
}

export function createTicketEmbed(ticket, user, guild) {
  return new EmbedBuilder()
    .setTitle(`🎫 Ticket #${ticket.id}`)
    .setDescription(`Service: ${ticket.category_name}`)
    .addFields([
      { name: 'Utilisateur', value: `<@${user.id}>`, inline: true },
      { name: 'Serveur', value: guild.name, inline: true },
      { name: 'Statut', value: ticket.status, inline: true }
    ])
    .setColor(ticket.status === 'OPEN' ? '#00FF00' : '#FF0000')
    .setTimestamp();
}

export function getActiveTicket(userId) {
  return db.prepare(`
    SELECT t.*, tc.name as category_name, tc.service_status, tc.status_reason
    FROM tickets t
    JOIN ticket_categories tc ON t.category_id = tc.id
    WHERE t.user_id = ? AND t.status = 'OPEN'
    LIMIT 1
  `).get(userId);
}

export function getAvailableCategories() {
  return db.prepare(`
    SELECT *, 
      (SELECT COUNT(*) FROM tickets 
       WHERE category_id = ticket_categories.id 
       AND status = 'OPEN') as active_tickets
    FROM ticket_categories 
    WHERE is_active = 1
    ORDER BY name ASC
  `).all();
}

export function createNewTicket(userId, guildId, categoryId) {
  // Vérifier l'état du service
  const service = db.prepare(`
    SELECT * FROM ticket_categories 
    WHERE id = ? AND is_active = 1
  `).get(categoryId);

  if (!service) {
    throw new Error('Service introuvable');
  }

  switch (service.service_status) {
    case 'CLOSED':
      throw new Error('Ce service est actuellement fermé.');
    case 'LIMITED':
      // Vérifier le nombre de tickets actifs
      const activeTickets = db.prepare(`
        SELECT COUNT(*) as count 
        FROM tickets 
        WHERE category_id = ? AND status = 'OPEN'
      `).get(categoryId).count;

      if (activeTickets >= service.ticket_limit) {
        throw new Error(`Ce service est limité à ${service.ticket_limit} tickets simultanés. Veuillez réessayer plus tard.`);
      }
      break;
  }

  const result = db.prepare(`
    INSERT INTO tickets (
      guild_id,
      user_id,
      category_id,
      status,
      created_at
    ) VALUES (?, ?, ?, 'OPEN', CURRENT_TIMESTAMP)
  `).run(guildId, userId, categoryId);

  return result;
}

export function closeTicket(ticketId, userId) {
  // Récupérer le ticket et ses informations
  const ticket = db.prepare(`
    SELECT t.*, tc.name as category_name
    FROM tickets t
    JOIN ticket_categories tc ON t.category_id = tc.id
    WHERE t.id = ? AND t.status = 'OPEN'
  `).get(ticketId);

  if (!ticket) {
    throw new Error('Ticket introuvable ou déjà fermé');
  }

  // Vérifier que l'utilisateur est le propriétaire du ticket
  if (ticket.user_id !== userId) {
    throw new Error('Vous ne pouvez pas fermer ce ticket');
  }

  // Fermer le ticket
  db.prepare(`
    UPDATE tickets 
    SET status = 'CLOSED',
        closed_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(ticketId);

  return ticket;
}

export function getTicketList(guildId) {
  return db.prepare(`
    SELECT t.*, tc.name as category_name, u.tag as user_tag
    FROM tickets t
    JOIN ticket_categories tc ON t.category_id = tc.id
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.guild_id = ? AND t.status = 'OPEN'
    ORDER BY t.created_at DESC
  `).all(guildId);
}

export function isTicketEnabled(guildId) {
  const config = db.prepare('SELECT tickets_enabled FROM guild_config WHERE guild_id = ?')
    .get(guildId);
  return config?.tickets_enabled ?? false;
}

export function saveTicketMessage(ticketId, userId, content) {
  return db.prepare(`
    INSERT INTO ticket_messages (
      ticket_id,
      user_id,
      content,
      created_at
    ) VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `).run(ticketId, userId, content);
}

export function updateServiceStatus(serviceId, status, reason = null) {
  db.prepare(`
    UPDATE ticket_categories 
    SET service_status = ?,
        status_reason = ?
    WHERE id = ?
  `).run(status, reason, serviceId);
}