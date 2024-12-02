import { EmbedBuilder } from 'discord.js';

export async function createHelpChannel(channel) {
  const embeds = [
    createTicketHelpEmbed(),
    createPresenceHelpEmbed(),
    createModeratorHelpEmbed(),
    createConfigHelpEmbed()
  ];

  for (const embed of embeds) {
    await channel.send({ embeds: [embed] });
  }
}

function createTicketHelpEmbed() {
  return new EmbedBuilder()
    .setTitle('🎫 Système de Tickets')
    .setDescription('Commandes pour gérer les tickets et services')
    .addFields([
      {
        name: 'Configuration des Services',
        value: `
• \`/service add\` - Créer un nouveau service
• \`/service roles\` - Gérer les rôles d'un service
• \`/service list\` - Voir la liste des services
• \`/service delete\` - Supprimer un service
• \`/service post\` - Afficher la liste des services
        `
      },
      {
        name: 'Gestion des Tickets',
        value: `
• \`/ticket list\` - Voir les tickets actifs
• \`/ticket close\` - Fermer un ticket
• \`/ticket toggle\` - Activer/désactiver les tickets
        `
      }
    ])
    .setColor('#3498db');
}

function createPresenceHelpEmbed() {
  return new EmbedBuilder()
    .setTitle('👥 Système de Présence')
    .setDescription('Commandes pour gérer les présences')
    .addFields([
      {
        name: 'Gestion des Absences',
        value: `
• \`/presence absent\` - Déclarer une absence
• \`/presence present\` - Marquer son retour
• \`/presence status\` - Voir son statut
        `
      }
    ])
    .setColor('#2ecc71');
}

function createModeratorHelpEmbed() {
  return new EmbedBuilder()
    .setTitle('🛡️ Commandes de Modération')
    .setDescription('Commandes réservées aux modérateurs')
    .addFields([
      {
        name: 'Convocations',
        value: `
• \`/convoc\` - Convoquer un utilisateur
• \`/convoc -ok\` - Marquer une convocation comme traitée
        `
      }
    ])
    .setColor('#e74c3c');
}

function createConfigHelpEmbed() {
  return new EmbedBuilder()
    .setTitle('⚙️ Configuration')
    .setDescription('Commandes de configuration (Administrateurs)')
    .addFields([
      {
        name: 'Configuration Générale',
        value: `
• \`/config logs\` - Configurer les salons de logs
• \`/config help\` - Créer le salon d'aide
• \`/setup\` - Configuration initiale du bot
        `
      }
    ])
    .setColor('#f1c40f');
}