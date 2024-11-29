export const name = 'ready';
export const once = true;

export async function execute(client) {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  
  // Enregistrer les commandes globalement
  try {
    const commands = Array.from(client.commands.values()).map(command => command.data.toJSON());
    await client.application.commands.set(commands);
    console.log('Commandes slash enregistrées avec succès!');
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement des commandes:', error);
  }
}