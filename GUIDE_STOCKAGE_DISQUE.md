# Guide du Stockage sur Disque avec Multer

Ce guide explique la nouvelle configuration Multer qui stocke les fichiers directement sur le disque, similaire à votre configuration existante.

## 🔄 Changements Effectués

### 1. Configuration Multer Mise à Jour

**Fichier**: `src/config/multer.config.ts`

- ✅ **Stockage sur disque** au lieu du stockage en mémoire
- ✅ **Génération automatique des noms** avec timestamp
- ✅ **Création automatique des dossiers**
- ✅ **Organisation par compagnie** maintenue

### 2. Nouvelle Fonction d'Upload

**Fichier**: `src/utils/file.ts`

- ✅ **`uploadFileByCompanyDisk`** - Nouvelle fonction pour le stockage disque
- ✅ **Génération des miniatures** depuis les fichiers stockés
- ✅ **Sauvegarde en base** des métadonnées
- ✅ **URLs publiques** correctes

### 3. Routes Mises à Jour

**Fichier**: `src/routes/express/company-upload.routes.ts`

- ✅ **Toutes les routes** utilisent maintenant `uploadFileByCompanyDisk`
- ✅ **Configuration Multer** adaptée pour chaque type de document

## 📁 Structure de Stockage

Les fichiers sont maintenant stockés directement avec cette structure :

```
files-service/
├── public/
│   └── company/
│       └── {companyId}/
│           ├── logo/
│           │   └── original/
│           │       └── {nom_original}_{timestamp}.{extension}
│           ├── staff/
│           │   └── {staffId}/
│           │       └── documents/
│           │           ├── original/
│           │           │   └── {nom_original}_{timestamp}.{extension}
│           │           └── thumb/          # Pour les images
│           │               └── {nom_original}_{timestamp}.{extension}
│           ├── drivers/
│           │   └── {driverId}/
│           │       └── documents/
│           │           ├── original/
│           │           └── thumb/
│           └── passengers/
│               └── {passengerId}/
│                   └── documents/
│                       ├── original/
│                       └── thumb/
```

## 🚀 Comment Tester

### 1. Configuration

Assurez-vous que votre fichier `.env` contient :

```env
# Configuration du serveur
PORT=3000
NODE_ENV=development

# IMPORTANT: Stockage local
FILE_STORAGE=local

# Base de données (optionnel)
DBLINK=mongodb://localhost:27017/files-service
MONGODB_URI=mongodb://localhost:27017/files-service
```

### 2. Démarrage du Serveur

```bash
cd files-service
npm run build
npm run dev
```

### 3. Test du Stockage sur Disque

```bash
# Test complet du stockage sur disque
node test-disk-storage.js

# Test simple d'upload
node test-local-storage.js
```

### 4. Test Manuel avec cURL

```bash
# Upload d'un logo
curl -X POST \
  http://localhost:3000/api/upload/company/TEST123/logo \
  -F "file=@votre-logo.png"

# Upload d'un document CNI
curl -X POST \
  http://localhost:3000/api/upload/company/TEST123/staff/STAFF456/documents/cni \
  -F "file=@votre-cni.pdf"
```

## 📊 Réponse d'Upload Attendue

```json
{
  "success": true,
  "filesData": [
    {
      "companyId": "TEST123",
      "entityType": "company",
      "documentType": "logo",
      "originalName": "logo.png",
      "filename": "logo.png_1703123456789.png",
      "mimeType": "image/png",
      "size": 1024000,
      "uploadDate": "2023-12-21T10:30:45.123Z",
      "fileUrl": "/public/company/TEST123/logo/original/logo.png_1703123456789.png",
      "thumbnailUrl": "/public/company/TEST123/logo/thumb/logo.png_1703123456789.png",
      "dbId": "507f1f77bcf86cd799439011",
      "savedToDB": true,
      "localPath": "C:\\Users\\HP\\Desktop\\sandbox\\PGACT\\files-service\\public\\company\\TEST123\\logo\\original\\logo.png_1703123456789.png"
    }
  ],
  "message": "Fichiers sauvegardés avec succès"
}
```

## 🔍 Vérifications

### 1. Fichier Stocké Physiquement

Vérifiez que le fichier existe dans le dossier `public/` :

```bash
# Lister les fichiers uploadés
find files-service/public -name "*.png" -o -name "*.pdf" -o -name "*.jpg"
```

### 2. Miniatures Générées

Pour les images, vérifiez que les miniatures sont créées :

```bash
# Lister les miniatures
find files-service/public -path "*/thumb/*"
```

### 3. Métadonnées en Base

Si MongoDB est configuré, vérifiez les métadonnées :

```bash
# Si MongoDB est installé
mongo files-service
db.files.find().pretty()
```

## ⚡ Avantages du Stockage sur Disque

- ✅ **Fichiers directement accessibles** sur le système de fichiers
- ✅ **Pas de limite de mémoire** pour les gros fichiers
- ✅ **Génération automatique des noms** avec timestamp
- ✅ **Création automatique des dossiers**
- ✅ **Miniatures générées** pour les images
- ✅ **Métadonnées sauvegardées** en base de données
- ✅ **URLs publiques** pour l'accès web

## 🔧 Dépannage

### Problème: Fichiers non stockés

**Solution:**

1. Vérifiez que `FILE_STORAGE=local` dans `.env`
2. Vérifiez les permissions d'écriture sur le dossier `public/`
3. Regardez les logs du serveur

### Problème: Miniatures non générées

**Solution:**

1. Vérifiez que le fichier est bien une image
2. Vérifiez que Jimp est installé
3. Vérifiez les permissions sur les dossiers `thumb/`

### Problème: Erreur de base de données

**Solution:**

1. Les fichiers sont quand même stockés même sans MongoDB
2. Vérifiez la connexion MongoDB si nécessaire
3. Les métadonnées peuvent être récupérées plus tard

## 📋 Checklist de Vérification

- [ ] Configuration `.env` avec `FILE_STORAGE=local`
- [ ] Serveur démarré sans erreur
- [ ] Upload réussi (réponse 200)
- [ ] Fichier présent dans `public/company/{companyId}/...`
- [ ] Miniature générée (si image)
- [ ] Métadonnées en base (optionnel)
- [ ] URL publique accessible

## 🎯 Résultat Final

Avec cette configuration, vos fichiers sont maintenant :

1. **Stockés directement sur disque** dans le dossier `public/`
2. **Organisés par compagnie** automatiquement
3. **Nommés avec timestamp** pour éviter les conflits
4. **Avec miniatures** pour les images
5. **Métadonnées sauvegardées** en base de données

C'est exactement comme votre configuration Multer existante, mais adaptée à notre système d'organisation par compagnie ! 🎉
