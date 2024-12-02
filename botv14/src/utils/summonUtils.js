import { db } from '../database/index.js';

export function canManageSummons(member) {
  // Si l'utilisateur est admin, il peut toujours convoquer
  if (member.permissions.has('ADMINISTRATOR')) return true;

  // Récupérer les rôles autorisés
  const config = db.prepare('SELECT summon_roles FROM guild_config WHERE guild_id = ?')
    .get(member.guild.id);

  if (!config?.summon_roles) return false;

  const allowedRoles = JSON.parse(config.summon_roles);
  
  // Vérifier si l'utilisateur a un rôle autorisé ou un rôle supérieur
  return member.roles.cache.some(role => {
    // Si le rôle est directement autorisé
    if (allowedRoles.includes(role.id)) return true;

    // Si le rôle est supérieur à un rôle autorisé dans la hiérarchie
    return allowedRoles.some(allowedId => {
      const allowedRole = member.guild.roles.cache.get(allowedId);
      return allowedRole && role.position > allowedRole.position;
    });
  });
}