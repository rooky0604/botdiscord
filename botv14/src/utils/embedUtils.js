import { EmbedBuilder } from 'discord.js';
import { getServiceStatusEmoji } from './ticketUtils.js';

export function createHelpEmbed(services = []) {
  return new EmbedBuilder()
    .setTitle('🎫 Services Disponibles')
    .setDescription(
      services.length > 0 
        ? 'Pour ouvrir un ticket, envoyez la commande correspondante en message privé.'
        : 'Aucun service n\'est disponible actuellement.'
    )
    .addFields(
      services.map(service => ({
        name: `${getServiceStatusEmoji(service.service_status)} ${service.name}`,
        value: `${service.description}\nCommande: \`${service.command}\`${service.status_reason ? `\nRaison: ${service.status_reason}` : ''}`
      }))
    )
    .setColor('#2F3136')
    .setFooter({ text: 'Pour ouvrir un ticket, utilisez la commande du service souhaité' })
    .setTimestamp();
}

export function createInvalidCommandEmbed(command, services) {
  return new EmbedBuilder()
    .setTitle('❌ Commande Invalide')
    .setDescription(`La commande \`${command}\` n'existe pas.`)
    .addFields([
      {
        name: '📋 Services Disponibles',
        value: services.length > 0
          ? services.map(s => 
              `${getServiceStatusEmoji(s.service_status)} \`${s.command}\` - ${s.name}`
            ).join('\n')
          : 'Aucun service disponible actuellement.'
      }
    ])
    .setColor('#FF0000')
    .setTimestamp();
}