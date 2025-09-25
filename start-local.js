/**
 * Script pour démarrer le serveur avec la configuration locale
 *
 * Ce script configure les variables d'environnement pour le stockage local
 * et démarre le serveur.
 */

// Configuration des variables d'environnement pour le stockage local
process.env.NODE_ENV = 'development';
process.env.PORT = '3000';
process.env.FILE_STORAGE = 'local';
process.env.DBLINK = 'mongodb://localhost:27017/files-service';
process.env.MONGODB_URI = 'mongodb://localhost:27017/files-service';

console.log('🚀 Démarrage du serveur avec configuration locale...');
console.log('📁 Stockage des fichiers: LOCAL (dossier public/)');
console.log('🗄️ Base de données: MongoDB local');
console.log('🌐 Port: 3000');
console.log('='.repeat(50));

// Démarrer le serveur
require('./dist/index.js');
