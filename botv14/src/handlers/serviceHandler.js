export async function handleServiceAction(interaction) {
  const name = interaction.options.getString('name');
  const newStatus = interaction.options.getString('status');
  const reason = interaction.options.getString('reason');
  let ticketLimit = null;

  if (newStatus === 'LIMITED') {
    ticketLimit = interaction.options.getInteger('limit');
    if (!ticketLimit || ticketLimit < 1) {
      return interaction.reply({
        content: 'Vous devez spécifier une limite de tickets valide (> 0) pour le mode limité.',
        ephemeral: true
      });
    }
  }

  const service = db.prepare(`
    SELECT * FROM ticket_categories 
    WHERE guild_id = ? AND LOWER(name) = ? AND is_active = 1
  `).get(interaction.guildId, name.toLowerCase());

  if (!service) {
    // ... (code pour afficher la liste des services)
  }

  db.prepare(`
    UPDATE ticket_categories 
    SET service_status = ?, 
        status_reason = ?,
        ticket_limit = ?
    WHERE id = ?
  `).run(newStatus, reason, ticketLimit, service.id);

  const embed = new EmbedBuilder()
    .setTitle('📊 État du Service Modifié')
    .setDescription(`L'état du service "${service.name}" a été mis à jour`)
    .addFields([
      { name: 'Nouvel état', value: `${getServiceStatusEmoji(newStatus)} ${newStatus}`, inline: true },
      { name: 'Ancien état', value: `${getServiceStatusEmoji(service.service_status)} ${service.service_status}`, inline: true },
      newStatus === 'LIMITED' ? { name: 'Limite de tickets', value: `${ticketLimit}`, inline: true } : null,
      reason ? { name: 'Raison', value: reason } : null
    ].filter(Boolean))
    .setColor(getStatusColor(newStatus))
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  // ... (reste du code)
}
