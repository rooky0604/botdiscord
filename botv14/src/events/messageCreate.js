import { Service } from '../database/models/Service.js';
import { Ticket } from '../database/models/Ticket.js';
import { createTicketChannel, handleStaffReply } from '../utils/ticketManager.js';

export const name = 'messageCreate';
export const once = false;

export async function execute(message) {
  if (message.author.bot) return;

  // Gérer les réponses du staff dans les canaux de tickets
  if (message.guild) {
    await handleStaffReply(message);

    // Vérifier si le message est un numéro de service
    const number = parseInt(message.content);
    if (isNaN(number)) return;

    try {
      // Vérifier si le message est une réponse à l'embed de création de ticket
      const reference = message.reference;
      if (!reference) return;

      const referenceMessage = await message.channel.messages.fetch(reference.messageId);
      if (!referenceMessage.embeds[0]?.title?.includes('Système de Tickets')) return;

      // Trouver le service correspondant au numéro
      const service = await Service.findOne({
        guildId: message.guildId,
        number: number
      });

      if (!service) {
        return message.reply('Ce numéro de service n\'existe pas.');
      }

      // Créer le ticket
      await createTicketChannel(message, service);
      await message.delete(); // Supprimer le message contenant le numéro

    } catch (error) {
      console.error(error);
      message.reply('Une erreur est survenue lors de la création du ticket.');
    }
  }
}