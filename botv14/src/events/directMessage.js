import { createDMTicket } from '../utils/dmManager.js';

export const name = 'messageCreate';
export const once = false;

export async function execute(message) {
  // Ignorer les messages des bots et les messages qui ne sont pas en MP
  if (message.author.bot || !message.channel.isDMBased()) return;

  try {
    await createDMTicket(message);
  } catch (error) {
    console.error('Erreur lors du traitement du message privé:', error);
    message.reply('Une erreur est survenue lors du traitement de votre message. Veuillez réessayer plus tard.');
  }
}