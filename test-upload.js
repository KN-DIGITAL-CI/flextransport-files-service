/**
 * Script de test pour l'API d'upload de fichiers
 *
 * Ce script teste les différentes routes d'upload de fichiers
 * organisés par compagnie.
 *
 * Utilisation:
 * 1. Assurez-vous que le serveur est démarré (npm run dev)
 * 2. Exécutez ce script: node test-upload.js
 */

import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const BASE_URL = 'http://localhost:3000/api/upload';
const COMPANY_ID = 'COMP123';
const STAFF_ID = 'STAFF456';
const DRIVER_ID = 'DRIVER789';
const PASSENGER_ID = 'PASSENGER101';

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

// Fonction pour uploader un fichier
async function uploadFile(endpoint, filePath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      body: form,
    });

    const result = await response.json();
    console.log(`✅ ${endpoint}:`, result.success ? 'Succès' : 'Échec');
    if (!result.success) {
      console.log('   Erreur:', result.error);
    }
    return result;
  } catch (error) {
    console.log(`❌ ${endpoint}: Erreur de connexion`);
    console.log('   Erreur:', error.message);
    return null;
  }
}

// Fonction principale de test
async function runTests() {
  console.log("🚀 Démarrage des tests d'upload de fichiers...\n");

  // Créer des fichiers de test
  const logoFile = createTestFile('logo.png', 'fake png content');
  const cniFile = createTestFile('cni.pdf', 'fake pdf content');
  const photoFile = createTestFile('photo.jpg', 'fake jpg content');
  const contratFile = createTestFile('contrat.docx', 'fake docx content');

  console.log('📁 Fichiers de test créés');

  // Tests d'upload
  console.log("\n📤 Tests d'upload:\n");

  // 1. Upload logo de compagnie
  await uploadFile(`/company/${COMPANY_ID}/logo`, logoFile);

  // 2. Upload documents de staff
  await uploadFile(
    `/company/${COMPANY_ID}/staff/${STAFF_ID}/documents/cni`,
    cniFile
  );
  await uploadFile(
    `/company/${COMPANY_ID}/staff/${STAFF_ID}/documents/photo`,
    photoFile
  );
  await uploadFile(
    `/company/${COMPANY_ID}/staff/${STAFF_ID}/documents/contrat`,
    contratFile
  );

  // 3. Upload documents de conducteur
  await uploadFile(
    `/company/${COMPANY_ID}/driver/${DRIVER_ID}/documents/cni`,
    cniFile
  );
  await uploadFile(
    `/company/${COMPANY_ID}/driver/${DRIVER_ID}/documents/permis-conduite`,
    cniFile
  );

  // 4. Upload documents de passager
  await uploadFile(
    `/company/${COMPANY_ID}/passenger/${PASSENGER_ID}/documents/cni`,
    cniFile
  );
  await uploadFile(
    `/company/${COMPANY_ID}/passenger/${PASSENGER_ID}/documents/photo`,
    photoFile
  );

  // 5. Test de route générique
  await uploadFile(
    `/company/${COMPANY_ID}/staff/${STAFF_ID}/documents/autre`,
    contratFile
  );

  // Nettoyage
  console.log('\n🧹 Nettoyage des fichiers de test...');
  fs.rmSync(path.join(__dirname, 'test-files'), {
    recursive: true,
    force: true,
  });

  console.log('\n✨ Tests terminés !');
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

export { createTestFile, uploadFile };
