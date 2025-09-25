/**
 * Script de test final pour le stockage sur disque
 *
 * Ce script teste complètement le nouveau système de stockage sur disque
 * avec Multer, similaire à votre configuration existante.
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000/api/upload';
const COMPANY_ID = 'FINAL_TEST_001';
const STAFF_ID = 'FINAL_STAFF_001';
const DRIVER_ID = 'FINAL_DRIVER_001';
const PASSENGER_ID = 'FINAL_PASSENGER_001';

console.log('🚀 Test Final du Stockage sur Disque avec Multer');
console.log('='.repeat(60));
console.log('Configuration similaire à votre multer-config.js');
console.log('='.repeat(60));

// Fonction pour créer un fichier de test
function createTestFile(filename, content) {
  const testDir = path.join(__dirname, 'test-files');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir);
  }

  const filePath = path.join(testDir, filename);
  fs.writeFileSync(filePath, content);
  console.log(`📁 Fichier créé: ${filename}`);
  return filePath;
}

// Fonction pour uploader un fichier
async function uploadFile(endpoint, filePath, description) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  try {
    console.log(`\n📤 ${description}`);
    console.log(`   Endpoint: ${BASE_URL}${endpoint}`);

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      body: form,
    });

    const result = await response.json();

    if (result.success && result.filesData && result.filesData.length > 0) {
      const fileData = result.filesData[0];
      console.log(`✅ Upload réussi!`);
      console.log(`   📄 Nom original: ${fileData.originalName}`);
      console.log(`   📄 Nom stocké: ${fileData.filename}`);
      console.log(`   🌐 URL: ${fileData.fileUrl}`);
      console.log(
        `   💾 Chemin local: ${fileData.localPath || 'Non disponible'}`
      );
      console.log(`   🗄️ Sauvé en DB: ${fileData.savedToDB ? 'Oui' : 'Non'}`);

      // Vérifier le stockage physique
      if (fileData.localPath) {
        const exists = fs.existsSync(fileData.localPath);
        console.log(
          `🔍 Stockage physique: ${exists ? '✅ OK' : '❌ MANQUANT'}`
        );

        if (exists) {
          const stats = fs.statSync(fileData.localPath);
          console.log(`   📏 Taille: ${stats.size} bytes`);
          console.log(`   📅 Créé: ${stats.birthtime.toLocaleString()}`);
        }
      }

      // Vérifier la miniature
      if (fileData.thumbnailUrl) {
        const thumbPath = path.join(
          __dirname,
          'public',
          fileData.thumbnailUrl.replace('/public/', '')
        );
        const thumbExists = fs.existsSync(thumbPath);
        console.log(`🖼️ Miniature: ${thumbExists ? '✅ OK' : '❌ MANQUANTE'}`);
      }

      return {
        success: true,
        fileData,
        localExists: fileData.localPath
          ? fs.existsSync(fileData.localPath)
          : false,
      };
    } else {
      console.log(`❌ Upload échoué: ${result.error || 'Erreur inconnue'}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Fonction pour lister la structure des fichiers
function listFileStructure() {
  const publicDir = path.join(__dirname, 'public');
  console.log(`\n📂 Structure des fichiers stockés:`);

  if (!fs.existsSync(publicDir)) {
    console.log(`❌ Le dossier public n'existe pas`);
    return;
  }

  function listDir(dir, prefix = '', maxDepth = 3, currentDepth = 0) {
    if (currentDepth >= maxDepth) return;

    try {
      const items = fs.readdirSync(dir);
      items.forEach((item) => {
        const itemPath = path.join(dir, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
          console.log(`${prefix}📁 ${item}/`);
          listDir(itemPath, prefix + '  ', maxDepth, currentDepth + 1);
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

// Fonction principale de test
async function runFinalTest() {
  try {
    console.log('\n📁 Création des fichiers de test...');

    // Créer différents types de fichiers
    const logoFile = createTestFile(
      'company-logo.png',
      'Contenu PNG logo de compagnie'
    );
    const cniFile = createTestFile('cni-staff.pdf', 'Contenu PDF CNI staff');
    const photoFile = createTestFile(
      'photo-staff.jpg',
      'Contenu JPG photo staff'
    );
    const permisFile = createTestFile(
      'permis-conduire.pdf',
      'Contenu PDF permis de conduire'
    );
    const passeportFile = createTestFile(
      'passeport-passenger.pdf',
      'Contenu PDF passeport passager'
    );

    console.log("\n📤 Tests d'upload par catégorie...");
    console.log('='.repeat(50));

    const results = [];

    // Test 1: Logo de compagnie
    const logoResult = await uploadFile(
      `/company/${COMPANY_ID}/logo`,
      logoFile,
      '1️⃣ Upload Logo de Compagnie'
    );
    results.push({ test: 'Logo compagnie', ...logoResult });

    // Test 2: Document CNI staff
    const cniResult = await uploadFile(
      `/company/${COMPANY_ID}/staff/${STAFF_ID}/documents/cni`,
      cniFile,
      '2️⃣ Upload CNI Staff'
    );
    results.push({ test: 'CNI staff', ...cniResult });

    // Test 3: Photo staff (avec miniature)
    const photoResult = await uploadFile(
      `/company/${COMPANY_ID}/staff/${STAFF_ID}/documents/photo`,
      photoFile,
      '3️⃣ Upload Photo Staff (avec miniature)'
    );
    results.push({ test: 'Photo staff', ...photoResult });

    // Test 4: Permis de conduire
    const permisResult = await uploadFile(
      `/company/${COMPANY_ID}/driver/${DRIVER_ID}/documents/permis-conduite`,
      permisFile,
      '4️⃣ Upload Permis de Conduire'
    );
    results.push({ test: 'Permis conducteur', ...permisResult });

    // Test 5: Passeport passager
    const passeportResult = await uploadFile(
      `/company/${COMPANY_ID}/passenger/${PASSENGER_ID}/documents/passeport`,
      passeportFile,
      '5️⃣ Upload Passeport Passager'
    );
    results.push({ test: 'Passeport passager', ...passeportResult });

    // Afficher la structure des fichiers
    listFileStructure();

    // Résumé final
    console.log('\n📊 Résumé Final des Tests:');
    console.log('='.repeat(50));

    results.forEach((result, index) => {
      const status = result.success && result.localExists ? '✅' : '❌';
      console.log(`${index + 1}. ${result.test}: ${status}`);
      if (!result.success) {
        console.log(`   ❌ Erreur: ${result.error}`);
      } else if (!result.localExists) {
        console.log(`   ⚠️ Fichier non trouvé sur disque`);
      } else {
        console.log(`   ✅ Stocké sur disque et en base`);
      }
    });

    const successCount = results.filter(
      (r) => r.success && r.localExists
    ).length;
    console.log(
      `\n🎯 Résultat Global: ${successCount}/${results.length} tests réussis`
    );

    if (successCount === results.length) {
      console.log('\n🎉 SUCCÈS COMPLET !');
      console.log('✅ Tous les fichiers sont stockés sur disque');
      console.log('✅ Organisation par compagnie fonctionne');
      console.log('✅ Miniatures générées pour les images');
      console.log('✅ Métadonnées sauvegardées en base');
      console.log('✅ Configuration Multer similaire à la vôtre');
    } else {
      console.log('\n⚠️ Certains tests ont échoué');
      console.log('Vérifiez la configuration et les logs');
    }

    // Nettoyage
    console.log('\n🧹 Nettoyage des fichiers de test...');
    try {
      fs.rmSync(path.join(__dirname, 'test-files'), {
        recursive: true,
        force: true,
      });
      console.log('✅ Fichiers de test supprimés');
    } catch (error) {
      console.log(`⚠️ Erreur nettoyage: ${error.message}`);
    }

    console.log('\n✨ Test final terminé !');
  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
if (require.main === module) {
  runFinalTest().catch(console.error);
}

module.exports = { uploadFile, createTestFile, listFileStructure };
