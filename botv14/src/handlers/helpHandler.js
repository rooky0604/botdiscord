import { EmbedBuilder } from 'discord.js';

export async function handleHelpCommand(interaction) {
  const embeds = [
    createTicketEmbed(),
    createServiceEmbed(),
    createPresenceEmbed(),
    createConvocationEmbed(),
    createConfigEmbed()
  ];

  await interaction.reply({ embeds, ephemeral: true });
}

function createTicketEmbed() {
  return new EmbedBuilder()
    .setTitle('🎫 Système de Tickets')
    .setDescription('Gestion des tickets')
    .addFields([
      {
        name: 'Commandes Utilisateur',
        value: `
• Envoyez la commande du service en MP au bot pour ouvrir un ticket
• \`!close\` - Fermer votre ticket actif`
      },
      {
        name: 'Commandes Modération',
        value: `
• \`/ticket list\` - Voir la liste des tickets actifs
• \`/ticket close\` - Fermer un ticket spécifique
• \`/ticket toggle\` - Activer/désactiver le système de tickets`
      }
    ])
    .setColor('#00FF00');
}

function createServiceEmbed() {
  return new EmbedBuilder()
    .setTitle('⚙️ Gestion des Services')
    .setDescription('Configuration et gestion des services de tickets')
    .addFields([
      {
        name: 'Configuration',
        value: `
• \`/service add\` - Créer un nouveau service
• \`/service roles\` - Gérer les rôles d'un service
• \`/service list\` - Voir la liste des services
• \`/service delete\` - Supprimer un service
• \`/service post\` - Afficher la liste des services dans le canal`
      }
    ])
    .setColor('#3498db');
}

function createPresenceEmbed() {
  return new EmbedBuilder()
    .setTitle('👥 Système de Présence')
    .setDescription('Gestion des présences et absences')
    .addFields([
      {
        name: 'Commandes',
        value: `
• \`/presence absent\` - Déclarer une absence
  • \`reason\` - Raison de l'absence (obligatoire)
  • \`until\` - Date de retour (optionnel)
• \`/presence present\` - Marquer son retour
• \`/presence status\` - Voir son statut actuel`
      }
    ])
    .setColor('#2ecc71');
}

function createConvocationEmbed() {
  return new EmbedBuilder()
    .setTitle('📨 Système de Convocations')
    .setDescription('Gestion des convocations')
    .addFields([
      {
        name: 'Commandes',
        value: `
• \`/convocation create\` - Convoquer un utilisateur
  • \`user\` - Utilisateur à convoquer
  • \`reason\` - Raison de la convocation
• \`/convocation list\` - Voir les convocations en cours
• \`/convocation recent\` - Voir les convocations des dernières 24h
• \`/convocation complete\` - Marquer une convocation comme traitée
  • \`user\` - Utilisateur convoqué
  • \`summary\` - Résumé de l'entretien`
      }
    ])
    .setColor('#e74c3c');
}

function createConfigEmbed() {
  return new EmbedBuilder()
    .setTitle('⚙️ Configuration')
    .setDescription('Configuration du bot (Administrateurs uniquement)')
    .addFields([
      {
        name: 'Configuration Initiale',
        value: `
• \`/setup\` - Configuration initiale du bot
  • Crée les catégories et salons nécessaires
  • Configure les permissions de base`
      },
      {
        name: 'Configuration Avancée',
        value: `
• \`/config logs\` - Configurer les salons de logs
  • \`ticket_logs\` - Logs des tickets
  • \`presence_logs\` - Logs des présences
  • \`summon_logs\` - Logs des convocations
• \`/config help\` - Créer le salon d'aide
• \`/config summon\` - Configurer les rôles de convocation
  • \`add_role\` - Ajouter un rôle autorisé
  • \`remove_role\` - Retirer un rôle autorisé`
      }
    ])
    .setColor('#f1c40f');
}