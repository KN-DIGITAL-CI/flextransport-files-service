# Guide de Test du Stockage Local

Ce guide vous explique comment tester que les fichiers sont bien stockés localement dans le dossier `public/`.

## 🚀 Démarrage Rapide

### 1. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet avec :

```env
# Configuration du serveur
PORT=3000
NODE_ENV=development

# IMPORTANT: Stockage local
FILE_STORAGE=local

# Base de données MongoDB (optionnel mais recommandé)
DBLINK=mongodb://localhost:27017/files-service
MONGODB_URI=mongodb://localhost:27017/files-service
```

### 2. Installation des dépendances

```bash
cd files-service
npm install
```

### 3. Build du projet

```bash
npm run build
```

### 4. Démarrage du serveur

```bash
# Option 1: Avec npm
npm run dev

# Option 2: Avec le script de configuration locale
node start-local.js

# Option 3: Manuel avec variables d'environnement
FILE_STORAGE=local npm run dev
```

### 5. Test du stockage local

```bash
# Test complet automatique
node test-complete.js

# Test simple d'upload et vérification
node test-local-storage.js
```

## 📁 Structure des Dossiers

Après l'upload, vos fichiers seront organisés comme ceci :

```
files-service/
├── public/
│   └── company/
│       └── {companyId}/
│           ├── logo/
│           │   ├── original/
│           │   │   └── {timestamp}_{id}_{filename}
│           │   └── thumb/          # Si c'est une image
│           │       └── {timestamp}_{id}_{filename}
│           ├── staff/
│           │   └── {staffId}/
│           │       └── documents/
│           │           ├── original/
│           │           └── thumb/
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

## 🧪 Tests Manuels

### Test 1: Upload d'un logo

```bash
curl -X POST \
  http://localhost:3000/api/upload/company/TEST123/logo \
  -F "file=@votre-logo.png"
```

### Test 2: Upload d'un document CNI

```bash
curl -X POST \
  http://localhost:3000/api/upload/company/TEST123/staff/STAFF456/documents/cni \
  -F "file=@votre-cni.pdf"
```

### Test 3: Vérification des fichiers

```bash
# Lister tous les fichiers d'une compagnie
curl http://localhost:3000/api/company/TEST123/files

# Voir les statistiques
curl http://localhost:3000/api/company/TEST123/stats
```

## 🔍 Vérification du Stockage Local

### 1. Vérifier que le dossier public existe

```bash
ls -la files-service/public/
```

### 2. Vérifier la structure des dossiers

```bash
find files-service/public -type f -name "*.png" -o -name "*.pdf" -o -name "*.jpg"
```

### 3. Vérifier les métadonnées en base

```bash
# Si MongoDB est installé
mongo files-service
db.files.find().pretty()
```

## 📊 Réponse d'Upload Attendue

```json
{
  "success": true,
  "filesData": [
    {
      "companyId": "TEST123",
      "entityType": "company",
      "entityId": undefined,
      "documentType": "logo",
      "originalName": "logo.png",
      "filename": "1703123456789_abc123_logo.png",
      "mimeType": "image/png",
      "size": 1024000,
      "uploadDate": "2023-12-21T10:30:45.123Z",
      "fileUrl": "/public/company/TEST123/logo/original/1703123456789_abc123_logo.png",
      "thumbnailUrl": "/public/company/TEST123/logo/thumb/1703123456789_abc123_logo.png",
      "dbId": "507f1f77bcf86cd799439011",
      "savedToDB": true
    }
  ],
  "message": "Fichiers sauvegardés avec succès",
  "organization": {
    "companyId": "TEST123",
    "entityType": "company",
    "entityId": undefined,
    "documentType": "logo"
  }
}
```

## 🚨 Dépannage

### Problème: Fichiers non stockés localement

**Solution:**

1. Vérifiez que `FILE_STORAGE=local` dans votre `.env`
2. Vérifiez que le dossier `public/` existe
3. Vérifiez les permissions d'écriture

### Problème: Erreur de base de données

**Solution:**

1. Assurez-vous que MongoDB est démarré
2. Vérifiez la connexion avec `mongo files-service`
3. Les fichiers sont quand même stockés même sans DB

### Problème: Miniatures non générées

**Solution:**

1. Vérifiez que le fichier est bien une image
2. Vérifiez que Jimp est installé
3. Regardez les logs du serveur

## ✅ Checklist de Vérification

- [ ] Serveur démarré sur le port 3000
- [ ] Variable `FILE_STORAGE=local` définie
- [ ] Dossier `public/` existe
- [ ] Upload réussi (réponse 200)
- [ ] Fichier présent dans `public/company/{companyId}/...`
- [ ] Miniature générée pour les images
- [ ] Métadonnées sauvegardées en base (optionnel)

## 🎯 Résultat Attendu

Après un upload réussi, vous devriez voir :

1. **Réponse JSON** avec `success: true`
2. **Fichier physique** dans le dossier `public/`
3. **Miniature** (si image) dans le dossier `thumb/`
4. **Métadonnées** en base de données (si MongoDB configuré)

Si tous ces éléments sont présents, le stockage local fonctionne parfaitement ! 🎉
