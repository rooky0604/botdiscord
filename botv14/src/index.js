import { config } from 'dotenv';
import { initializeClient } from './utils/clientManager.js';
import { initializeDatabase } from './database/index.js';
import { registerCommands } from './commands/index.js';
import { handleTicketCommand } from './handlers/ticketHandler.js';
import { handleSummonCommand } from './handlers/summonHandler.js';
import { handleServiceCommand } from './handlers/serviceHandler.js';
import { handleHelpCommand } from './handlers/helpHandler.js';
import { handleSetupCommand } from './handlers/setupHandler.js';
import { handlePresenceCommand } from './handlers/presenceHandler.js';
import { handleConfigCommand } from './handlers/configHandler.js';
import { handleCommandHelp } from './handlers/commandHandler.js';
import { setupMessageRelay } from './handlers/messageRelay.js';

// Charger les variables d'environnement
config();

// Vérifier le token Discord
if (!process.env.DISCORD_TOKEN) {
  console.error('❌ Erreur: DISCORD_TOKEN manquant dans le fichier .env');
  process.exit(1);
}

// Initialiser le client Discord
const client = initializeClient();

// Gestionnaire d'événement ready
client.once('ready', async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  
  try {
    console.log('📦 Initialisation de la base de données...');
    await initializeDatabase();
    console.log('✅ Base de données initialisée');

    console.log('🔄 Enregistrement des commandes...');
    await registerCommands(client);
    console.log('✅ Commandes enregistrées');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
  }
});

// Gestionnaire des interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  try {
    switch (interaction.commandName) {
      case 'setup':
        await handleSetupCommand(interaction);
        break;
      case 'service':
        await handleServiceCommand(interaction);
        break;
      case 'ticket':
        await handleTicketCommand(interaction);
        break;
      case 'convocation':
        await handleSummonCommand(interaction);
        break;
      case 'presence':
        await handlePresenceCommand(interaction);
        break;
      case 'help':
        await handleHelpCommand(interaction);
        break;
      case 'config':
        await handleConfigCommand(interaction);
        break;
      case 'commande':
        await handleCommandHelp(interaction);
        break;
    }
  } catch (error) {
    console.error('Erreur lors du traitement de l\'interaction:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'Une erreur est survenue lors du traitement de la commande.',
        ephemeral: true
      });
    }
  }
});

// Configuration du relais de messages
setupMessageRelay(client);

// Gestion des erreurs non gérées
process.on('unhandledRejection', (error) => {
  console.error('Promesse rejetée non gérée:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Exception non gérée:', error);
});

// Connexion à Discord
console.log('🔄 Connexion à Discord...');
client.login(process.env.DISCORD_TOKEN).catch(error => {
  console.error('❌ Échec de la connexion:', error);
  process.exit(1);
});