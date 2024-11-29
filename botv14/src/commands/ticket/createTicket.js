import { SlashCommandBuilder, ChannelType, PermissionFlagsBits } from 'discord.js';
import { Service } from '../../database/models/Service.js';
import { Ticket } from '../../database/models/Ticket.js';

export const command = {
  data: new SlashCommandBuilder()
    .setName('create-ticket')
    .setDescription('Créer un nouveau ticket')
    .addStringOption(option =>
      option.setName('service')
        .setDescription('Service concerné')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type de ticket')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('Description de votre demande')
        .setRequired(true)),

  async execute(interaction) {
    const serviceName = interaction.options.getString('service');
    const ticketType = interaction.options.getString('type');
    const description = interaction.options.getString('description');

    try {
      const service = await Service.findOne({
        guildId: interaction.guildId,
        name: serviceName
      });

      if (!service) {
        return interaction.reply({
          content: 'Service non trouvé.',
          ephemeral: true
        });
      }

      const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: service.category,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          },
          ...service.roles.map(role => ({
            id: role.roleId,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages],
          })),
        ],
      });

      const ticket = await Ticket.create({
        guildId: interaction.guildId,
        channelId: channel.id,
        userId: interaction.user.id,
        serviceId: service._id,
        type: ticketType
      });

      await channel.send({
        content: `Ticket créé par ${interaction.user}\nService: ${serviceName}\nType: ${ticketType}\nDescription: ${description}`
      });

      await interaction.reply({
        content: `Votre ticket a été créé: ${channel}`,
        ephemeral: true
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: 'Une erreur est survenue lors de la création du ticket.',
        ephemeral: true
      });
    }
  }
};