import { Client, GatewayIntentBits, Partials } from 'discord.js';

let clientInstance = null;

export function initializeClient() {
  if (!clientInstance) {
    clientInstance = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
      ],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember
      ]
    });
  }
  return clientInstance;
}

export function getClient() {
  if (!clientInstance) {
    throw new Error('Client not initialized');
  }
  return clientInstance;
}