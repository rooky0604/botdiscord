import { EmbedBuilder } from 'discord.js';
import { db } from '../database/index.js';
import { getLogChannel } from '../utils/channelUtils.js';
import { 
  setUserAbsent, 
  setUserPresent, 
  getUserPresence,
  formatPresenceDate
} from '../utils/presenceUtils.js';

export async function handlePresenceCommand(interaction) {
  const subcommand = interaction.options.getSubcommand();
  const user = interaction.user;

  try {
    switch (subcommand) {
      case 'absent':
        await handleAbsence(interaction);
        break;
      case 'present':
        await handlePresent(interaction);
        break;
      case 'status':
        await handleStatus(interaction);
        break;
    }
  } catch (error) {
    console.error('Erreur lors de la gestion de la présence:', error);
    await interaction.reply({
      content: 'Une erreur est survenue lors du traitement de la commande.',
      ephemeral: true
    });
  }
}

async function handleAbsence(interaction) {
  const reason = interaction.options.getString('reason');
  const until = interaction.options.getString('until');
  const user = interaction.user;

  try {
    const currentPresence = await getUserPresence(user.id);
    if (currentPresence && currentPresence.status === 'ABSENT') {
      return interaction.reply({
        content: 'Vous êtes déjà marqué comme absent.',
        ephemeral: true
      });
    }

    await setUserAbsent(user.id, reason, until);

    const embed = new EmbedBuilder()
      .setTitle('🌙 Absence Déclarée')
      .setDescription(`${user.tag} sera absent`)
      .addFields([
        { name: 'Raison', value: reason, inline: true },
        { name: 'Jusqu\'au', value: until ? formatPresenceDate(until) : 'Non spécifié', inline: true }
      ])
      .setColor('#FFA500')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });

    // Notifier les logs de tous les serveurs où l'utilisateur est présent
    const guilds = interaction.client.guilds.cache.filter(guild => 
      guild.members.cache.has(user.id)
    );

    for (const guild of guilds.values()) {
      const logChannel = await getLogChannel(guild.id);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('👤 Déclaration d\'Absence')
          .setDescription(`${user.tag} a déclaré une absence`)
          .addFields([
            { name: 'Utilisateur', value: `<@${user.id}>`, inline: true },
            { name: 'Raison', value: reason, inline: true },
            { name: 'Jusqu\'au', value: until ? formatPresenceDate(until) : 'Non spécifié', inline: true }
          ])
          .setColor('#FFA500')
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
      }
    }
  } catch (error) {
    console.error('Erreur lors de la déclaration d\'absence:', error);
    await interaction.reply({
      content: 'Une erreur est survenue lors de la déclaration d\'absence.',
      ephemeral: true
    });
  }
}

async function handlePresent(interaction) {
  const user = interaction.user;

  try {
    const currentPresence = await getUserPresence(user.id);
    if (!currentPresence || currentPresence.status === 'PRESENT') {
      return interaction.reply({
        content: 'Vous n\'étiez pas marqué comme absent.',
        ephemeral: true
      });
    }

    await setUserPresent(user.id);

    const embed = new EmbedBuilder()
      .setTitle('🌞 Retour de Présence')
      .setDescription(`${user.tag} est de retour`)
      .setColor('#00FF00')
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });

    // Notifier les logs
    const guilds = interaction.client.guilds.cache.filter(guild => 
      guild.members.cache.has(user.id)
    );

    for (const guild of guilds.values()) {
      const logChannel = await getLogChannel(guild.id);
      if (logChannel) {
        const logEmbed = new EmbedBuilder()
          .setTitle('👤 Retour de Présence')
          .setDescription(`${user.tag} est de retour`)
          .addFields([
            { name: 'Utilisateur', value: `<@${user.id}>`, inline: true },
            { name: 'Absence précédente', value: currentPresence.reason, inline: true }
          ])
          .setColor('#00FF00')
          .setTimestamp();

        await logChannel.send({ embeds: [logEmbed] });
      }
    }
  } catch (error) {
    console.error('Erreur lors du retour de présence:', error);
    await interaction.reply({
      content: 'Une erreur est survenue lors du retour de présence.',
      ephemeral: true
    });
  }
}

async function handleStatus(interaction) {
  const user = interaction.user;

  try {
    const presence = await getUserPresence(user.id);
    
    const embed = new EmbedBuilder()
      .setTitle('👤 Statut de Présence')
      .setDescription(`Statut actuel de ${user.tag}`)
      .addFields([
        { 
          name: 'État', 
          value: presence?.status === 'ABSENT' ? '🌙 Absent' : '🌞 Présent',
          inline: true
        }
      ])
      .setColor(presence?.status === 'ABSENT' ? '#FFA500' : '#00FF00')
      .setTimestamp();

    if (presence?.status === 'ABSENT') {
      embed.addFields([
        { name: 'Raison', value: presence.reason, inline: true },
        { 
          name: 'Jusqu\'au', 
          value: presence.until_date ? formatPresenceDate(presence.until_date) : 'Non spécifié',
          inline: true
        }
      ]);
    }

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error('Erreur lors de la récupération du statut:', error);
    await interaction.reply({
      content: 'Une erreur est survenue lors de la récupération de votre statut.',
      ephemeral: true
    });
  }
}