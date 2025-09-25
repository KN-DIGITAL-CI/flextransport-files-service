/**
 * Script de test pour vérifier le stockage local des fichiers
 *
 * Ce script teste l'upload de fichiers et vérifie qu'ils sont bien
 * stockés dans le dossier public/ local.
 *
 * Utilisation:
 * 1. Assurez-vous que le serveur est démarré (npm run dev)
 * 2. Exécutez ce script: node test-local-storage.js
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/upload';
const COMPANY_ID = 'TEST_COMP_001';
const STAFF_ID = 'TEST_STAFF_001';

// Fonction pour créer un fichier de test
function createTestFile(filename, content) {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  const filePath = path.join(testDir, filename);
  fs.writeFileSync(filePath, content);
  console.log(`📁 Fichier de test créé: ${filePath}`);
  return filePath;
}

// Fonction pour vérifier si un fichier existe localement
function checkLocalFile(fileUrl) {
  if (!fileUrl) return false;

  // Convertir l'URL en chemin local
  const localPath = path.join(
    __dirname,
    'public',
    fileUrl.replace('/public/', '')
  );
  const exists = fs.existsSync(localPath);

  console.log(
    `🔍 Vérification: ${localPath} - ${
      exists ? '✅ Existe' : "❌ N'existe pas"
    }`
  );
  return exists;
}

// Fonction pour uploader un fichier
async function uploadFile(endpoint, filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  try {
    console.log(`\n📤 Upload vers: ${BASE_URL}${endpoint}`);
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      body: form,
    });

    const result = await response.json();
    console.log(`✅ Upload: ${result.success ? 'Succès' : 'Échec'}`);

    if (result.success && result.filesData && result.filesData.length > 0) {
      const fileData = result.filesData[0];
      console.log(`📄 Fichier uploadé:`);
      console.log(`   - Nom original: ${fileData.originalName}`);
      console.log(`   - Nom stocké: ${fileData.filename}`);
      console.log(`   - URL: ${fileData.fileUrl}`);
      console.log(`   - Sauvé en DB: ${fileData.savedToDB ? 'Oui' : 'Non'}`);

      // Vérifier le stockage local
      console.log(`\n🔍 Vérification du stockage local:`);
      const originalExists = checkLocalFile(fileData.fileUrl);
      if (fileData.thumbnailUrl) {
        const thumbnailExists = checkLocalFile(fileData.thumbnailUrl);
        console.log(`   - Miniature: ${thumbnailExists ? '✅' : '❌'}`);
      }

      return { success: true, fileData, localExists: originalExists };
    } else {
      console.log(`❌ Erreur: ${result.error || 'Erreur inconnue'}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Fonction pour lister les fichiers dans le dossier public
function listPublicFiles() {
  const publicDir = path.join(__dirname, 'public');
  console.log(`\n📂 Contenu du dossier public:`);

  if (!fs.existsSync(publicDir)) {
    console.log(`❌ Le dossier public n'existe pas: ${publicDir}`);
    return;
  }

  function listDirectory(dir, prefix = '') {
    const items = fs.readdirSync(dir);
    items.forEach((item) => {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);

      if (stats.isDirectory()) {
        console.log(`${prefix}📁 ${item}/`);
        listDirectory(itemPath, prefix + '  ');
      } else {
        const size = (stats.size / 1024).toFixed(2);
        console.log(`${prefix}📄 ${item} (${size} KB)`);
      }
    });
  }

  listDirectory(publicDir);
}

// Fonction principale de test
async function runTest() {
  console.log('🚀 Test du stockage local des fichiers\n');
  console.log('='.repeat(50));

  // Créer des fichiers de test
  console.log('\n📁 Création des fichiers de test...');
  const logoFile = createTestFile('logo-test.png', 'Contenu PNG de test');
  const cniFile = createTestFile('cni-test.pdf', 'Contenu PDF de test');
  const photoFile = createTestFile('photo-test.jpg', 'Contenu JPG de test');

  // Tests d'upload
  console.log("\n📤 Tests d'upload...");
  console.log('='.repeat(30));

  const results = [];

  // Test 1: Upload logo de compagnie
  console.log('\n1️⃣ Test upload logo de compagnie');
  const logoResult = await uploadFile(`/company/${COMPANY_ID}/logo`, logoFile);
  results.push({ test: 'Logo compagnie', ...logoResult });

  // Test 2: Upload document CNI staff
  console.log('\n2️⃣ Test upload CNI staff');
  const cniResult = await uploadFile(
    `/company/${COMPANY_ID}/staff/${STAFF_ID}/documents/cni`,
    cniFile
  );
  results.push({ test: 'CNI staff', ...cniResult });

  // Test 3: Upload photo staff
  console.log('\n3️⃣ Test upload photo staff');
  const photoResult = await uploadFile(
    `/company/${COMPANY_ID}/staff/${STAFF_ID}/documents/photo`,
    photoFile
  );
  results.push({ test: 'Photo staff', ...photoResult });

  // Afficher le contenu du dossier public
  listPublicFiles();

  // Résumé des tests
  console.log('\n📊 Résumé des tests:');
  console.log('='.repeat(30));
  results.forEach((result, index) => {
    const status = result.success && result.localExists ? '✅' : '❌';
    console.log(`${index + 1}. ${result.test}: ${status}`);
    if (!result.success) {
      console.log(`   Erreur: ${result.error}`);
    } else if (!result.localExists) {
      console.log(`   Fichier non trouvé localement`);
    }
  });

  const successCount = results.filter((r) => r.success && r.localExists).length;
  console.log(`\n🎯 Résultat: ${successCount}/${results.length} tests réussis`);

  if (successCount === results.length) {
    console.log('🎉 Tous les fichiers sont bien stockés localement !');
  } else {
    console.log('⚠️ Certains fichiers ne sont pas stockés localement.');
  }

  // Nettoyage des fichiers de test
  console.log('\n🧹 Nettoyage...');
  try {
    fs.rmSync(path.join(__dirname, 'test-files'), {
      recursive: true,
      force: true,
    });
    console.log('✅ Fichiers de test supprimés');
  } catch (error) {
    console.log(`⚠️ Erreur lors du nettoyage: ${error.message}`);
  }

  console.log('\n✨ Test terminé !');
}

// Exécuter le test
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { uploadFile, checkLocalFile, listPublicFiles };
