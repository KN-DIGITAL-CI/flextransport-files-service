# Guide de Correction - Erreur Multer

## 🚨 Problème Identifié

L'erreur suivante se produisait lors de l'upload de fichiers :

```
TypeError: The "path" argument must be of type string. Received undefined
    at Object.join (node:path:478:7)
    at DiskStorage.destination [as getDestination] (multer.config.ts:64:29)
```

## 🔍 Cause du Problème

Le problème venait du fait que Multer exécute la fonction `destination` **avant** que les paramètres de route Express soient disponibles dans `req.params`.

Dans la configuration Multer originale :

```typescript
destination: (req: any, file: Express.Multer.File, cb: Function) => {
  const { companyId, entityType, entityId, documentType } = req.params; // ❌ undefined !
  // ...
};
```

## ✅ Solution Implémentée

### 1. Stockage Temporaire

Modification de la configuration Multer pour stocker temporairement dans un dossier `temp` :

```typescript
// Configuration de stockage sur disque pour tous les types
const identityStorage = multer.diskStorage({
  destination: (req: any, file: Express.Multer.File, cb: Function) => {
    // Utiliser un dossier temporaire, la structure sera créée dans la fonction d'upload
    const tempPath = path.join(process.cwd(), 'public', 'temp');

    // Créer le dossier temporaire s'il n'existe pas
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    cb(null, tempPath);
  },
  filename: (req: any, file: Express.Multer.File, cb: Function) => {
    cb(null, generateFilename(file));
  },
});
```

### 2. Déplacement des Fichiers

Modification de la fonction `uploadFileByCompanyDisk` pour déplacer les fichiers du dossier temporaire vers le bon emplacement :

```typescript
// Le fichier est stocké temporairement, on doit le déplacer vers le bon emplacement
const tempFilePath = (file as any).path;
const isImage = file.mimetype.startsWith('image/');

// Obtenir le chemin du dossier final
const folderPath = getFolderPath(
  entityType as any,
  companyId,
  entityId,
  documentType
);

// Créer le dossier final s'il n'existe pas
await ensureFolderExists(folderPath);

// Chemin final du fichier
const finalFilePath = path.join(
  process.cwd(),
  'public',
  folderPath,
  'original',
  fileMetadata.filename
);

// Créer le dossier original s'il n'existe pas
const originalDir = path.dirname(finalFilePath);
if (!fssync.existsSync(originalDir)) {
  fssync.mkdirSync(originalDir, { recursive: true });
}

// Déplacer le fichier du dossier temporaire vers le dossier final
await fs.rename(tempFilePath, finalFilePath);
```

## 🔄 Processus d'Upload Corrigé

1. **Multer** stocke le fichier temporairement dans `public/temp/`
2. **Express** traite la requête et rend les paramètres disponibles
3. **uploadFileByCompanyDisk** récupère les paramètres de route
4. **Déplacement** du fichier vers la structure organisée par compagnie
5. **Génération** des miniatures si nécessaire
6. **Sauvegarde** des métadonnées en base de données

## 📁 Structure Finale

```
files-service/
├── public/
│   ├── temp/                    # Dossier temporaire (Multer)
│   │   └── {nom}_{timestamp}.{extension}
│   └── company/                 # Structure finale organisée
│       └── {companyId}/
│           ├── logo/original/{nom}_{timestamp}.{extension}
│           ├── staff/{staffId}/documents/original/{nom}_{timestamp}.{extension}
│           │                    └── thumb/{nom}_{timestamp}.{extension}
│           └── ...
```

## 🧪 Test de la Correction

Utilisez le script de test pour vérifier que la correction fonctionne :

```bash
# Démarrer le serveur
npm run dev

# Dans un autre terminal, tester la correction
node test-fix.js
```

## ✅ Avantages de cette Solution

- ✅ **Plus d'erreur Multer** - Les paramètres sont disponibles au bon moment
- ✅ **Organisation maintenue** - Structure par compagnie préservée
- ✅ **Miniatures générées** - Fonctionnement correct des images
- ✅ **Métadonnées sauvegardées** - Base de données fonctionnelle
- ✅ **Stockage sur disque** - Fichiers physiquement présents
- ✅ **Compatibilité** - Fonctionne avec toutes les routes existantes

## 🔧 Dépannage

### Si l'erreur persiste :

1. **Vérifiez que le serveur est redémarré** après les modifications
2. **Vérifiez les permissions** sur le dossier `public/temp/`
3. **Regardez les logs** du serveur pour d'autres erreurs
4. **Testez avec un fichier simple** d'abord

### Si les fichiers ne sont pas déplacés :

1. **Vérifiez que `ensureFolderExists`** fonctionne
2. **Vérifiez les permissions** sur les dossiers de destination
3. **Regardez les logs** pour les erreurs de déplacement

## 📋 Checklist de Vérification

- [ ] Serveur redémarré après les modifications
- [ ] Dossier `public/temp/` créé
- [ ] Upload sans erreur Multer
- [ ] Fichier présent dans la structure organisée
- [ ] Miniatures générées (si image)
- [ ] Métadonnées en base de données
- [ ] URLs publiques correctes

## 🎯 Résultat

Avec cette correction, le système d'upload fonctionne maintenant correctement :

1. **Multer** stocke temporairement sans erreur
2. **Express** traite les paramètres de route
3. **Fonction d'upload** organise les fichiers correctement
4. **Stockage final** dans la structure par compagnie

La configuration reste similaire à votre `multer-config.js` existant, mais avec une gestion intelligente des paramètres de route ! 🎉
