import { EmbedBuilder } from 'discord.js';

export async function handleCommandHelp(interaction) {
    const commandName = interaction.options.getString('name')?.toLowerCase();

    if (!commandName) {
        return interaction.reply({
            content: '❌ Vous devez spécifier une commande valide pour afficher son aide.',
            ephemeral: true,
        });
    }

    const embed = createCommandEmbed(commandName);
    await interaction.reply({ embeds: [embed], ephemeral: true });
}

function createCommandEmbed(commandName) {
    const embed = new EmbedBuilder().setTimestamp();

    switch (commandName) {
        case 'service':
            return embed
                .setTitle('🎫 Commande Service')
                .setDescription('Gestion des services de tickets')
                .addFields([
                    {
                        name: '/service add',
                        value: `Créer un nouveau service de tickets
• \`name\` - Nom du service
• \`description\` - Description du service
• \`command\` - Commande pour ouvrir le ticket (ex: !support)`
                    },
                    {
                        name: '/service roles',
                        value: `Gérer les rôles d'un service
• \`name\` - Nom du service
• \`add_role\` - Ajouter un rôle (optionnel)
• \`remove_role\` - Retirer un rôle (optionnel)`
                    },
                    {
                        name: '/service action',
                        value: `Modifier l'état d'un service
• \`name\` - Nom du service
• \`status\` - Nouvel état (OPEN, CLOSED, MAINTENANCE, LIMITED)
• \`reason\` - Raison du changement (optionnel)`
                    },
                    {
                        name: 'Autres sous-commandes',
                        value: `• \`/service list\` - Voir la liste des services
• \`/service delete\` - Supprimer un service
• \`/service post\` - Afficher la liste dans le canal`
                    }
                ])
                .setColor('#3498db');

        case 'ticket':
            return embed
                .setTitle('🎫 Commande Ticket')
                .setDescription('Gestion des tickets')
                .addFields([
                    {
                        name: 'Commandes disponibles',
                        value: `• \`/ticket list\` - Voir les tickets actifs
• \`/ticket close\` - Fermer un ticket spécifique`
                    },
                    {
                        name: 'En messages privés',
                        value: 'Utilisez la commande du service (ex: !support) pour ouvrir un ticket'
                    }
                ])
                .setColor('#2ecc71');

        case 'presence':
            return embed
                .setTitle('👥 Commande Présence')
                .setDescription('Gestion des présences')
                .addFields([
                    {
                        name: '/presence absent',
                        value: `Déclarer une absence
• \`reason\` - Raison de l'absence
• \`until\` - Date de retour (optionnel, format: YYYY-MM-DD)`
                    },
                    {
                        name: '/presence present',
                        value: 'Marquer son retour'
                    },
                    {
                        name: '/presence status',
                        value: 'Voir son statut actuel'
                    }
                ])
                .setColor('#e74c3c');

        case 'convocation':
            return embed
                .setTitle('📨 Commande Convocation')
                .setDescription('Gestion des convocations')
                .addFields([
                    {
                        name: '/convocation create',
                        value: `Convoquer un utilisateur
• \`user\` - Utilisateur à convoquer
• \`reason\` - Raison de la convocation`
                    },
                    {
                        name: '/convocation complete',
                        value: `Marquer une convocation comme traitée
• \`user\` - Utilisateur convoqué
• \`summary\` - Résumé de l'entretien`
                    },
                    {
                        name: 'Autres sous-commandes',
                        value: `• \`/convocation list\` - Voir les convocations en cours
• \`/convocation recent\` - Voir les convocations des dernières 24h`
                    }
                ])
                .setColor('#f1c40f');

        case 'config':
            return embed
                .setTitle('⚙️ Commande Config')
                .setDescription('Configuration du bot (Administrateurs uniquement)')
                .addFields([
                    {
                        name: '/config logs',
                        value: `Configurer les salons de logs
• \`ticket_logs\` - Logs des tickets
• \`presence_logs\` - Logs des présences
• \`summon_logs\` - Logs des convocations`
                    },
                    {
                        name: '/config summon',
                        value: `Configurer les rôles de convocation
• \`add_role\` - Ajouter un rôle autorisé
• \`remove_role\` - Retirer un rôle autorisé`
                    },
                    {
                        name: '/config help',
                        value: 'Créer le salon d\'aide avec la liste des commandes'
                    }
                ])
                .setColor('#9b59b6');

        case 'setup':
            return embed
                .setTitle('🔧 Commande Setup')
                .setDescription('Configuration initiale du bot')
                .addFields([
                    {
                        name: 'Utilisation',
                        value: '`/setup` - Lance la configuration initiale du bot'
                    }
                ])
                .setColor('#34495e');

        default:
            return embed
                .setTitle(`❌ Commande "${commandName}" inconnue`)
                .setDescription('Essayez `/commande name:help` pour obtenir une liste complète.')
                .setColor('#FF0000');
    }
}
