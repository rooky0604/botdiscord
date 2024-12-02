import { db } from '../database/index.js';

export function hasServiceAccess(member, serviceId) {
  const service = db.prepare('SELECT allowed_roles FROM ticket_categories WHERE id = ?')
    .get(serviceId);

  if (!service) return false;

  const allowedRoles = JSON.parse(service.allowed_roles);
  return member.roles.cache.some(role => allowedRoles.includes(role.id));
}

export function getServiceRoles(serviceId) {
  const service = db.prepare('SELECT allowed_roles FROM ticket_categories WHERE id = ?')
    .get(serviceId);

  if (!service) return [];

  return JSON.parse(service.allowed_roles);
}

export function addServiceRole(serviceId, roleId) {
  const service = db.prepare('SELECT allowed_roles FROM ticket_categories WHERE id = ?')
    .get(serviceId);

  if (!service) return false;

  const roles = JSON.parse(service.allowed_roles);
  if (!roles.includes(roleId)) {
    roles.push(roleId);
    db.prepare('UPDATE ticket_categories SET allowed_roles = ? WHERE id = ?')
      .run(JSON.stringify(roles), serviceId);
  }
  return true;
}

export function removeServiceRole(serviceId, roleId) {
  const service = db.prepare('SELECT allowed_roles FROM ticket_categories WHERE id = ?')
    .get(serviceId);

  if (!service) return false;

  const roles = JSON.parse(service.allowed_roles);
  const index = roles.indexOf(roleId);
  
  if (index > -1 && roles.length > 1) {
    roles.splice(index, 1);
    db.prepare('UPDATE ticket_categories SET allowed_roles = ? WHERE id = ?')
      .run(JSON.stringify(roles), serviceId);
    return true;
  }
  return false;
}