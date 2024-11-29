export const name = 'interactionCreate';
export const once = false;

import { closeTicket } from '../utils/ticketManager.js';

export async function execute(interaction) {
  try {
    if (interaction.isButton()) {
      if (interaction.customId === 'close_ticket') {
        // Vérifier si l'utilisateur a les permissions de modérateur
        if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
          return interaction.reply({
            content: 'Vous n\'avez pas la permission de fermer les tickets.',
            ephemeral: true
          });
        }

        const success = await closeTicket(interaction.channel);
        if (success) {
          await interaction.reply('Le ticket a été fermé avec succès.');
        } else {
          await interaction.reply({
            content: 'Une erreur est survenue lors de la fermeture du ticket.',
            ephemeral: true
          });
        }
        return;
      }
    }

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error(`Commande ${interaction.commandName} non trouvée.`);
      return;
    }

    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'Une erreur est survenue lors de l\'exécution de la commande.',
      ephemeral: true
    });
  }
}