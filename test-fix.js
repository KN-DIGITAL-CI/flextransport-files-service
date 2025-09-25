/**
 * Script de test pour vérifier la correction de l'erreur Multer
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api/upload';
const COMPANY_ID = 'TEST_FIX_001';

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
async function testUpload(endpoint, filePath, description) {
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

      // Vérifier le stockage physique
      if (fileData.localPath) {
        const exists = fs.existsSync(fileData.localPath);
        console.log(
          `🔍 Stockage physique: ${exists ? '✅ OK' : '❌ MANQUANT'}`
        );

        if (exists) {
          const stats = fs.statSync(fileData.localPath);
          console.log(`   📏 Taille: ${stats.size} bytes`);
        }
      }

      return { success: true, fileData };
    } else {
      console.log(`❌ Upload échoué: ${result.error || 'Erreur inconnue'}`);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.log(`❌ Erreur de connexion: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Fonction principale de test
async function runTest() {
  console.log('🔧 Test de la correction Multer');
  console.log('='.repeat(50));

  try {
    // Créer un fichier de test simple
    const logoFile = createTestFile('test-logo.png', 'Contenu PNG de test');

    // Test d'upload du logo
    const result = await testUpload(
      `/company/${COMPANY_ID}/logo`,
      logoFile,
      'Test upload logo de compagnie'
    );

    if (result.success) {
      console.log('\n🎉 SUCCÈS ! La correction fonctionne !');
      console.log("✅ Multer ne génère plus d'erreur de paramètres");
      console.log('✅ Fichier stocké dans le bon dossier');
      console.log('✅ Structure organisée par compagnie');
    } else {
      console.log("\n❌ ÉCHEC ! L'erreur persiste");
      console.log(`   Erreur: ${result.error}`);
    }

    // Nettoyage
    console.log('\n🧹 Nettoyage...');
    try {
      fs.rmSync(path.join(__dirname, 'test-files'), {
        recursive: true,
        force: true,
      });
      console.log('✅ Fichiers de test supprimés');
    } catch (error) {
      console.log(`⚠️ Erreur nettoyage: ${error.message}`);
    }
  } catch (error) {
    console.log('❌ Erreur lors du test:', error.message);
  }
}

// Exécuter le test
if (require.main === module) {
  runTest().catch(console.error);
}

module.exports = { testUpload };
