import { db } from '../database/index.js';
import { getClient } from './clientManager.js';

export async function getLogChannel(guildId, type = 'ticket') {
  const config = db.prepare(`
    SELECT 
      ticket_log_channel_id,
      presence_log_channel_id,
      summon_log_channel_id 
    FROM guild_config 
    WHERE guild_id = ?
  `).get(guildId);
    
  if (!config) return null;

  let channelId;
  switch (type) {
    case 'ticket':
      channelId = config.ticket_log_channel_id;
      break;
    case 'presence':
      channelId = config.presence_log_channel_id;
      break;
    case 'summon':
      channelId = config.summon_log_channel_id;
      break;
    default:
      channelId = config.ticket_log_channel_id;
  }
  
  if (!channelId) return null;
  
  try {
    const client = getClient();
    const guild = await client.guilds.fetch(guildId);
    return await guild.channels.fetch(channelId);
  } catch (error) {
    console.error('Erreur lors de la récupération du salon de logs:', error);
    return null;
  }
}

export async function getTicketCategory(guildId) {
  const config = db.prepare('SELECT ticket_category_id FROM guild_config WHERE guild_id = ?')
    .get(guildId);
    
  if (!config?.ticket_category_id) return null;
  
  try {
    const client = getClient();
    const guild = await client.guilds.fetch(guildId);
    return await guild.channels.fetch(config.ticket_category_id);
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie tickets:', error);
    return null;
  }
}