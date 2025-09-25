/**
 * Script de test pour le stockage sur disque avec Multer
 *
 * Ce script teste l'upload de fichiers avec la nouvelle configuration
 * Multer qui stocke directement sur le disque.
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/upload';
const COMPANY_ID = 'TEST_DISK_001';
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
      console.log(
        `   - Chemin local: ${fileData.localPath || 'Non disponible'}`
      );
      console.log(`   - Sauvé en DB: ${fileData.savedToDB ? 'Oui' : 'Non'}`);

      // Vérifier le stockage local
      if (fileData.localPath) {
        const exists = fs.existsSync(fileData.localPath);
        console.log(
          `🔍 Vérification stockage disque: ${
            exists ? '✅ Fichier existe' : '❌ Fichier manquant'
          }`
        );
        console.log(`   Chemin: ${fileData.localPath}`);

        if (exists) {
          const stats = fs.statSync(fileData.localPath);
          console.log(`   Taille: ${stats.size} bytes`);
          console.log(`   Créé: ${stats.birthtime.toLocaleString()}`);
        }
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
          `🖼️ Miniature: ${thumbExists ? '✅ Existe' : '❌ Manquante'}`
        );
        console.log(`   Chemin: ${thumbPath}`);
      }

      return {
        success: true,
        fileData,
        localExists: fileData.localPath
          ? fs.existsSync(fileData.localPath)
          : false,
      };
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
  console.log('🚀 Test du stockage sur disque avec Multer\n');
  console.log('='.repeat(60));

  // Créer des fichiers de test
  console.log('\n📁 Création des fichiers de test...');
  const logoFile = createTestFile('logo-test.png', 'Contenu PNG de test');
  const cniFile = createTestFile('cni-test.pdf', 'Contenu PDF de test');
  const photoFile = createTestFile('photo-test.jpg', 'Contenu JPG de test');

  // Tests d'upload
  console.log("\n📤 Tests d'upload avec stockage sur disque...");
  console.log('='.repeat(50));

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
  console.log('='.repeat(40));
  results.forEach((result, index) => {
    const status = result.success && result.localExists ? '✅' : '❌';
    console.log(`${index + 1}. ${result.test}: ${status}`);
    if (!result.success) {
      console.log(`   Erreur: ${result.error}`);
    } else if (!result.localExists) {
      console.log(`   Fichier non trouvé sur disque`);
    }
  });

  const successCount = results.filter((r) => r.success && r.localExists).length;
  console.log(`\n🎯 Résultat: ${successCount}/${results.length} tests réussis`);

  if (successCount === results.length) {
    console.log('🎉 Tous les fichiers sont bien stockés sur disque !');
  } else {
    console.log('⚠️ Certains fichiers ne sont pas stockés correctement.');
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

module.exports = { uploadFile, createTestFile, listPublicFiles };
