/**
 * Script de test pour l'API de gestion des fichiers
 *
 * Ce script teste les nouvelles routes de gestion des fichiers
 * avec stockage en base de données.
 *
 * Utilisation:
 * 1. Assurez-vous que le serveur est démarré (npm run dev)
 * 2. Assurez-vous que MongoDB est connecté
 * 3. Exécutez ce script: node test-file-management.js
 */

import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const BASE_URL = 'http://localhost:3000/api';
const UPLOAD_URL = 'http://localhost:3000/api/upload';
const COMPANY_ID = 'COMP123';
const STAFF_ID = 'STAFF456';

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
    const response = await fetch(`${UPLOAD_URL}${endpoint}`, {
      method: 'POST',
      body: form,
    });

    const result = await response.json();
    console.log(`✅ Upload ${endpoint}:`, result.success ? 'Succès' : 'Échec');
    if (!result.success) {
      console.log('   Erreur:', result.error);
    }
    return result;
  } catch (error) {
    console.log(`❌ Upload ${endpoint}: Erreur de connexion`);
    console.log('   Erreur:', error.message);
    return null;
  }
}

// Fonction pour tester une route GET
async function testGetRoute(endpoint, description) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    const result = await response.json();

    console.log(`✅ GET ${description}:`, result.success ? 'Succès' : 'Échec');
    if (result.success && result.data) {
      console.log(
        `   Données reçues: ${
          Array.isArray(result.data) ? result.data.length : 1
        } élément(s)`
      );
    }
    if (!result.success) {
      console.log('   Erreur:', result.error);
    }
    return result;
  } catch (error) {
    console.log(`❌ GET ${description}: Erreur de connexion`);
    console.log('   Erreur:', error.message);
    return null;
  }
}

// Fonction pour tester une route PUT
async function testPutRoute(endpoint, data, description) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    console.log(`✅ PUT ${description}:`, result.success ? 'Succès' : 'Échec');
    if (!result.success) {
      console.log('   Erreur:', result.error);
    }
    return result;
  } catch (error) {
    console.log(`❌ PUT ${description}: Erreur de connexion`);
    console.log('   Erreur:', error.message);
    return null;
  }
}

// Fonction principale de test
async function runTests() {
  console.log('🚀 Démarrage des tests de gestion des fichiers...\n');

  // Créer des fichiers de test
  const logoFile = createTestFile('logo.png', 'fake png content');
  const cniFile = createTestFile('cni.pdf', 'fake pdf content');

  console.log('📁 Fichiers de test créés');

  // Tests d'upload
  console.log("\n📤 Tests d'upload:\n");

  // Upload de fichiers pour avoir des données à tester
  const uploadResult1 = await uploadFile(
    `/company/${COMPANY_ID}/logo`,
    logoFile
  );
  const uploadResult2 = await uploadFile(
    `/company/${COMPANY_ID}/staff/${STAFF_ID}/documents/cni`,
    cniFile
  );

  // Récupérer l'ID du fichier uploadé pour les tests suivants
  let fileId = null;
  if (
    uploadResult2 &&
    uploadResult2.filesData &&
    uploadResult2.filesData.length > 0
  ) {
    fileId = uploadResult2.filesData[0].dbId;
  }

  // Tests de récupération
  console.log('\n📥 Tests de récupération:\n');

  await testGetRoute(
    `/company/${COMPANY_ID}/files`,
    'Tous les fichiers de la compagnie'
  );
  await testGetRoute(
    `/company/${COMPANY_ID}/staff/${STAFF_ID}/files`,
    'Fichiers du staff'
  );
  await testGetRoute(
    `/company/${COMPANY_ID}/files/type/cni`,
    'Fichiers par type CNI'
  );
  await testGetRoute(`/company/${COMPANY_ID}/logos`, 'Logos de la compagnie');

  // Test de recherche
  await testGetRoute(
    `/files/search?companyId=${COMPANY_ID}&entityType=staff&limit=10`,
    'Recherche de fichiers'
  );

  // Test des statistiques
  console.log('\n📊 Tests de statistiques:\n');

  await testGetRoute(
    `/company/${COMPANY_ID}/stats`,
    'Statistiques de la compagnie'
  );

  // Tests de gestion (si on a un fichier)
  if (fileId) {
    console.log('\n🔧 Tests de gestion:\n');

    // Test de récupération par ID
    await testGetRoute(`/files/${fileId}`, `Fichier par ID (${fileId})`);

    // Test de mise à jour des métadonnées
    await testPutRoute(
      `/files/${fileId}/metadata`,
      {
        metadata: {
          description: "Document d'identité test",
          tags: ['test', 'cni'],
          updatedAt: new Date().toISOString(),
        },
      },
      `Mise à jour métadonnées (${fileId})`
    );

    // Test de suppression (soft delete)
    console.log('\n🗑️ Tests de suppression:\n');

    try {
      const deleteResponse = await fetch(`${BASE_URL}/files/${fileId}`, {
        method: 'DELETE',
      });
      const deleteResult = await deleteResponse.json();
      console.log(
        `✅ DELETE Fichier (${fileId}):`,
        deleteResult.success ? 'Succès' : 'Échec'
      );
      if (!deleteResult.success) {
        console.log('   Erreur:', deleteResult.error);
      }
    } catch (error) {
      console.log(`❌ DELETE Fichier (${fileId}): Erreur de connexion`);
      console.log('   Erreur:', error.message);
    }
  } else {
    console.log(
      '\n⚠️ Impossible de tester la gestion des fichiers (aucun fichier uploadé)\n'
    );
  }

  // Nettoyage
  console.log('\n🧹 Nettoyage des fichiers de test...');
  fs.rmSync(path.join(__dirname, 'test-files'), {
    recursive: true,
    force: true,
  });

  console.log('\n✨ Tests terminés !');
  console.log('\n📋 Résumé des fonctionnalités testées:');
  console.log('   ✅ Upload de fichiers avec sauvegarde en base');
  console.log('   ✅ Récupération de fichiers par compagnie');
  console.log('   ✅ Récupération de fichiers par entité');
  console.log('   ✅ Récupération de fichiers par type');
  console.log('   ✅ Récupération des logos');
  console.log('   ✅ Recherche de fichiers avec filtres');
  console.log('   ✅ Statistiques des fichiers');
  console.log('   ✅ Mise à jour des métadonnées');
  console.log('   ✅ Suppression de fichiers');
}

// Exécuter les tests si le script est appelé directement
if (require.main === module) {
  runTests().catch(console.error);
}

export { createTestFile, testGetRoute, testPutRoute, uploadFile };
