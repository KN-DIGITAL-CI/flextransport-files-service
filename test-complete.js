/**
 * Script de test complet pour le stockage local
 *
 * Ce script:
 * 1. Configure l'environnement pour le stockage local
 * 2. Teste l'upload de fichiers
 * 3. Vérifie le stockage local
 * 4. Affiche les résultats
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration pour le stockage local
process.env.NODE_ENV = 'development';
process.env.PORT = '3000';
process.env.FILE_STORAGE = 'local';
process.env.DBLINK = 'mongodb://localhost:27017/files-service';
process.env.MONGODB_URI = 'mongodb://localhost:27017/files-service';

console.log('🚀 Test complet du stockage local des fichiers');
console.log('='.repeat(60));

// Fonction pour attendre un délai
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fonction pour créer un fichier de test
function createTestFile(filename, content) {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  const filePath = path.join(testDir, filename);
  fs.writeFileSync(filePath, content);
  return filePath;
}

// Fonction pour tester l'upload
async function testUpload() {
  const FormData = require('form-data');
  const fetch = require('node-fetch');

  const BASE_URL = 'http://localhost:3000/api/upload';
  const COMPANY_ID = 'TEST_LOCAL_001';

  console.log("\n📤 Test d'upload de fichiers...");

  // Créer un fichier de test
  const testFile = createTestFile(
    'test-local.txt',
    'Contenu de test pour le stockage local'
  );

  try {
    const form = new FormData();
    form.append('file', fs.createReadStream(testFile));

    const response = await fetch(`${BASE_URL}/company/${COMPANY_ID}/logo`, {
      method: 'POST',
      body: form,
    });

    const result = await response.json();

    if (result.success && result.filesData && result.filesData.length > 0) {
      const fileData = result.filesData[0];
      console.log('✅ Upload réussi!');
      console.log(`   - Fichier: ${fileData.originalName}`);
      console.log(`   - URL: ${fileData.fileUrl}`);
      console.log(`   - Sauvé en DB: ${fileData.savedToDB ? 'Oui' : 'Non'}`);

      return fileData;
    } else {
      console.log('❌ Upload échoué:', result.error);
      return null;
    }
  } catch (error) {
    console.log("❌ Erreur d'upload:", error.message);
    return null;
  }
}

// Fonction pour vérifier le stockage local
function checkLocalStorage(fileData) {
  if (!fileData) return false;

  console.log('\n🔍 Vérification du stockage local...');

  // Vérifier le fichier original
  const originalPath = path.join(
    __dirname,
    'public',
    fileData.fileUrl.replace('/public/', '')
  );
  const originalExists = fs.existsSync(originalPath);

  console.log(
    `📄 Fichier original: ${originalExists ? '✅ Existe' : "❌ N'existe pas"}`
  );
  console.log(`   Chemin: ${originalPath}`);

  if (originalExists) {
    const stats = fs.statSync(originalPath);
    console.log(`   Taille: ${stats.size} bytes`);
    console.log(`   Créé: ${stats.birthtime.toLocaleString()}`);
  }

  // Vérifier la miniature si c'est une image
  if (fileData.thumbnailUrl) {
    const thumbPath = path.join(
      __dirname,
      'public',
      fileData.thumbnailUrl.replace('/public/', '')
    );
    const thumbExists = fs.existsSync(thumbPath);
    console.log(
      `🖼️ Miniature: ${thumbExists ? '✅ Existe' : "❌ N'existe pas"}`
    );
  }

  return originalExists;
}

// Fonction pour lister les fichiers publics
function listPublicFiles() {
  console.log('\n📂 Contenu du dossier public:');

  const publicDir = path.join(__dirname, 'public');
  if (!fs.existsSync(publicDir)) {
    console.log("❌ Le dossier public n'existe pas");
    return;
  }

  function listDir(dir, prefix = '') {
    try {
      const items = fs.readdirSync(dir);
      items.forEach((item) => {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          console.log(`${prefix}📁 ${item}/`);
          listDir(itemPath, prefix + '  ');
        } else {
          const size = (stats.size / 1024).toFixed(2);
          console.log(`${prefix}📄 ${item} (${size} KB)`);
        }
      });
    } catch (error) {
      console.log(`${prefix}❌ Erreur: ${error.message}`);
    }
  }

  listDir(publicDir);
}

// Fonction principale
async function runTest() {
  try {
    // Attendre que le serveur soit prêt
    console.log('⏳ Attente du démarrage du serveur...');
    await delay(3000);

    // Tester l'upload
    const fileData = await testUpload();

    // Vérifier le stockage local
    const localExists = checkLocalStorage(fileData);

    // Lister les fichiers publics
    listPublicFiles();

    // Résumé
    console.log('\n📊 Résumé du test:');
    console.log('='.repeat(30));
    console.log(`Upload: ${fileData ? '✅ Réussi' : '❌ Échoué'}`);
    console.log(`Stockage local: ${localExists ? '✅ Réussi' : '❌ Échoué'}`);
    console.log(
      `Base de données: ${
        fileData && fileData.savedToDB ? '✅ Sauvegardé' : '❌ Non sauvegardé'
      }`
    );

    if (fileData && localExists) {
      console.log(
        '\n🎉 Test réussi! Les fichiers sont bien stockés localement.'
      );
    } else {
      console.log('\n⚠️ Test échoué. Vérifiez la configuration.');
    }
  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }
}

// Nettoyage à la fin
process.on('exit', () => {
  try {
    const testDir = path.join(__dirname, 'test-files');
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
      console.log('\n🧹 Nettoyage terminé');
    }
  } catch (error) {
    console.log('⚠️ Erreur lors du nettoyage:', error.message);
  }
});

// Démarrer le test
runTest();
