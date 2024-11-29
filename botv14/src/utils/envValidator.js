import { config } from 'dotenv';
import { existsSync } from 'fs';

export function validateEnv() {
  if (!existsSync('.env')) {
    console.error('Fichier .env manquant! Utilisez la commande /setup-env pour le configurer.');
    process.exit(1);
  }

  config();

  const requiredEnvVars = ['TOKEN', 'DB_HOST', 'DB_USER', 'DB_PASS', 'DB_NAME'];
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missingEnvVars.length > 0) {
    console.error(`Variables d'environnement manquantes: ${missingEnvVars.join(', ')}`);
    console.error('Utilisez la commande /setup-env pour configurer ces variables.');
    process.exit(1);
  }
}