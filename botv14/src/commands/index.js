import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Configurer le bot pour ce serveur'),
    
  new SlashCommandBuilder()
    .setName('service')
    .setDescription('Gérer les services de tickets')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Ajouter un nouveau service')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Nom du service')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Description du service')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('command')
            .setDescription('Commande pour ouvrir le ticket (ex: !support)')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('roles')
        .setDescription('Gérer les rôles d\'un service')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Nom du service')
            .setRequired(true)
        )
        .addRoleOption(option =>
          option.setName('add_role')
            .setDescription('Ajouter un rôle')
        )
        .addRoleOption(option =>
          option.setName('remove_role')
            .setDescription('Retirer un rôle')
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Afficher la liste des services')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('delete')
        .setDescription('Supprimer un service')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Nom du service à supprimer')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('post')
        .setDescription('Poster la liste des services dans le canal')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('action')
        .setDescription('Modifier l\'état d\'un service')
        .addStringOption(option =>
          option.setName('name')
            .setDescription('Nom du service')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('status')
            .setDescription('Nouvel état du service')
            .setRequired(true)
            .addChoices(
              { name: '🟢 Ouvert', value: 'OPEN' },
              { name: '🔴 Fermé', value: 'CLOSED' },
              { name: '🟡 Maintenance', value: 'MAINTENANCE' },
              { name: '🟠 Limité', value: 'LIMITED' }
            )
        )
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Raison du changement d\'état')
        )
    ),

  new SlashCommandBuilder()
    .setName('commande')
    .setDescription('Afficher les détails d\'une commande')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Nom de la commande')
        .setRequired(true)
        .addChoices(
          { name: '🎫 Service', value: 'service' },
          { name: '🎫 Ticket', value: 'ticket' },
          { name: '👥 Présence', value: 'presence' },
          { name: '📨 Convocation', value: 'convocation' },
          { name: '⚙️ Config', value: 'config' },
          { name: '❓ Help', value: 'help' },
          { name: '🔧 Setup', value: 'setup' }
        )
    ),

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Afficher l\'aide du bot'),

  new SlashCommandBuilder()
    .setName('presence')
    .setDescription('Gérer votre présence')
    .addSubcommand(subcommand =>
      subcommand
        .setName('absent')
        .setDescription('Déclarer une absence')
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Raison de l\'absence')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('until')
            .setDescription('Date de retour (format: YYYY-MM-DD)')
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('present')
        .setDescription('Marquer son retour')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('status')
        .setDescription('Voir son statut actuel')
    ),

  new SlashCommandBuilder()
    .setName('convocation')
    .setDescription('Gérer les convocations')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Convoquer un utilisateur')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Utilisateur à convoquer')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Raison de la convocation')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Voir les convocations en cours')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('recent')
        .setDescription('Voir les convocations des dernières 24h')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('complete')
        .setDescription('Marquer une convocation comme traitée')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Utilisateur convoqué')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('summary')
            .setDescription('Résumé de l\'entretien')
            .setRequired(true)
        )
    ),

  new SlashCommandBuilder()
    .setName('config')
    .setDescription('Configurer le bot')
    .addSubcommand(subcommand =>
      subcommand
        .setName('logs')
        .setDescription('Configurer les salons de logs')
        .addChannelOption(option =>
          option.setName('ticket_logs')
            .setDescription('Salon des logs de tickets')
            .setRequired(true)
        )
        .addChannelOption(option =>
          option.setName('presence_logs')
            .setDescription('Salon des logs de présence')
            .setRequired(true)
        )
        .addChannelOption(option =>
          option.setName('summon_logs')
            .setDescription('Salon des logs de convocations')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('help')
        .setDescription('Créer le salon d\'aide')
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('summon')
        .setDescription('Configurer les rôles de convocation')
        .addRoleOption(option =>
          option.setName('add_role')
            .setDescription('Ajouter un rôle autorisé')
        )
        .addRoleOption(option =>
          option.setName('remove_role')
            .setDescription('Retirer un rôle autorisé')
        )
    )
];

export async function registerCommands(client) {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('Début de l\'enregistrement des commandes...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log('Commandes enregistrées avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des commandes:', error);
    throw error;
  }
}