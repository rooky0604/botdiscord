import { Client, GatewayIntentBits, Partials } from 'discord.js';
import { connectDatabase } from './database/connection.js';
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';
import { validateEnv } from './utils/envValidator.js';

// Valider les variables d'environnement avant le démarrage
validateEnv();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message, Partials.User]
});

await connectDatabase();
await loadCommands(client);
await loadEvents(client);

client.login(process.env.TOKEN);