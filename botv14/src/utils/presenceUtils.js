import { db } from '../database/index.js';

export async function setUserAbsent(userId, reason, until = null) {
  // Mettre à jour ou créer l'entrée de présence
  db.prepare(`
    INSERT OR REPLACE INTO user_presence (
      user_id,
      status,
      reason,
      until_date,
      created_at
    ) VALUES (?, 'ABSENT', ?, ?, CURRENT_TIMESTAMP)
  `).run(userId, reason, until);
}

export async function setUserPresent(userId) {
  // Mettre à jour le statut de présence
  db.prepare(`
    UPDATE user_presence 
    SET status = 'PRESENT',
        return_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(userId);
}

export async function getUserPresence(userId) {
  return db.prepare(`
    SELECT * FROM user_presence 
    WHERE user_id = ?
    ORDER BY created_at DESC 
    LIMIT 1
  `).get(userId);
}

export function formatPresenceDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
}

export function isUserAbsent(userId) {
  const presence = getUserPresence(userId);
  return presence?.status === 'ABSENT';
}