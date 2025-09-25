# Service de Gestion de Fichiers par Compagnie

Ce service permet de gérer l'upload et l'organisation de fichiers par compagnie avec une structure hiérarchique claire. Les fichiers sont organisés selon le type d'entité (compagnie, staff, conducteur, passager) et le type de document.

## 🚀 Fonctionnalités

- ✅ Upload organisé par compagnie
- ✅ Support de différents types de documents
- ✅ Validation des types de fichiers
- ✅ Génération automatique de miniatures pour les images
- ✅ Stockage local et cloud (Backblaze B2)
- ✅ **Stockage des métadonnées en base de données MongoDB**
- ✅ **API complète de gestion des fichiers**
- ✅ **Statistiques et recherche avancée**
- ✅ API RESTful complète
- ✅ Documentation complète

## 📁 Structure des Dossiers

```
public/
├── company/
│   ├── {companyId}/
│   │   ├── logo/
│   │   │   ├── original/     # Fichiers originaux
│   │   │   └── thumb/        # Miniatures (images uniquement)
│   │   ├── staff/
│   │   │   └── {staffId}/
│   │   │       └── documents/
│   │   │           ├── original/
│   │   │           └── thumb/
│   │   ├── drivers/
│   │   │   └── {driverId}/
│   │   │       └── documents/
│   │   │           ├── original/
│   │   │           └── thumb/
│   │   └── passengers/
│   │       └── {passengerId}/
│   │           └── documents/
│   │               ├── original/
│   │               └── thumb/
```

## 🛠️ Installation

1. **Cloner le projet**

   ```bash
   git clone <repository-url>
   cd files-service
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   ```

3. **Configuration**

   ```bash
   cp env.example .env
   # Éditer le fichier .env avec vos configurations
   ```

4. **Démarrer le serveur**

   ```bash
   # Mode développement
   npm run dev

   # Mode production
   npm run build
   npm start
   ```

## ⚙️ Configuration

### Variables d'Environnement

```env
# Port du serveur
PORT=3000

# Mode de stockage (local ou cloud)
FILE_STORAGE=local

# Configuration Backblaze B2 (optionnel)
APP_KEY=your_app_key
KEY_ID=your_key_id
BUCKET_ID=your_bucket_id
BUCKET_NAME=your_bucket_name
```

### Stockage Local vs Cloud

- **Local** (`FILE_STORAGE=local`) : Fichiers stockés dans `public/`
- **Cloud** (autre valeur) : Fichiers uploadés vers Backblaze B2

## 📚 API Endpoints

### Base URL

```
http://localhost:3000/api/upload
```

### 1. Logos de Compagnie

```http
POST /company/{companyId}/logo
```

### 2. Documents de Staff

```http
POST /company/{companyId}/staff/{staffId}/documents/{documentType}
```

Types supportés : `cni`, `cmu`, `carte-sejour`, `contrat`, `photo`, `autre`

### 3. Documents de Conducteur

```http
POST /company/{companyId}/driver/{driverId}/documents/{documentType}
```

Types supportés : `permis-conduite`, `cni`, `cmu`, `carte-sejour`, `certificat-medical`, `photo`, `autre`

### 4. Documents de Passager

```http
POST /company/{companyId}/passenger/{passengerId}/documents/{documentType}
```

Types supportés : `cni`, `passeport`, `billet`, `photo`, `autre`

### 5. Route Générique

```http
POST /company/{companyId}/{entityType}/{entityId}/documents/{documentType}
```

## Routes de Gestion des Fichiers

### Base URL pour la gestion

```
http://localhost:3000/api
```

### Récupération de Fichiers

- `GET /company/{companyId}/files` - Tous les fichiers d'une compagnie
- `GET /company/{companyId}/{entityType}/{entityId}/files` - Fichiers d'une entité
- `GET /company/{companyId}/files/type/{documentType}` - Fichiers par type
- `GET /company/{companyId}/logos` - Logos d'une compagnie
- `GET /files/{fileId}` - Fichier par ID
- `GET /files/search` - Recherche avec filtres

### Statistiques

- `GET /company/{companyId}/stats` - Statistiques des fichiers

### Gestion

- `PUT /files/{fileId}/metadata` - Mettre à jour les métadonnées
- `DELETE /files/{fileId}` - Supprimer un fichier (soft delete)
- `DELETE /files/{fileId}/hard` - Supprimer définitivement

## 📝 Exemples d'Utilisation

### JavaScript (Frontend)

```javascript
// Upload d'un logo de compagnie
const uploadLogo = async (companyId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/upload/company/${companyId}/logo`, {
    method: 'POST',
    body: formData,
  });

  return await response.json();
};
```

### cURL

```bash
# Upload logo
curl -X POST \
  http://localhost:3000/api/upload/company/COMP123/logo \
  -F "file=@logo.png"

# Upload CNI staff
curl -X POST \
  http://localhost:3000/api/upload/company/COMP123/staff/STAFF456/documents/cni \
  -F "file=@cni.pdf"
```

### Node.js (Backend)

```javascript
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const uploadFile = async (endpoint, filePath) => {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath));

  const response = await fetch(`http://localhost:3000/api/upload${endpoint}`, {
    method: 'POST',
    body: form,
  });

  return await response.json();
};
```

## 🧪 Tests

### Script de Test Automatique

```bash
# Installer les dépendances de test (si nécessaire)
npm install form-data node-fetch

# Exécuter les tests d'upload
node test-upload.js

# Exécuter les tests de gestion des fichiers
node test-file-management.js
```

### Tests Manuels

1. Démarrer le serveur : `npm run dev`
2. Utiliser Postman ou un client REST
3. Tester les différents endpoints avec des fichiers réels

## 📋 Types de Fichiers Supportés

### Documents d'Identité

- **Types :** JPEG, JPG, PNG, PDF
- **Taille max :** 5MB

### Logos de Compagnie

- **Types :** JPEG, JPG, PNG, WebP
- **Taille max :** 2MB

### Documents Généraux

- **Types :** JPEG, JPG, PNG, PDF, DOC, DOCX
- **Taille max :** 10MB

## 🔧 Développement

### Structure du Projet

```
src/
├── config/
│   └── multer.config.ts      # Configuration Multer
├── middlewares/
│   └── validation.middleware.ts  # Middlewares de validation
├── routes/
│   └── express/
│       ├── company-upload.routes.ts  # Routes d'upload organisé
│       └── file.routes.ts            # Routes legacy
├── utils/
│   ├── file.ts               # Utilitaires de fichiers
│   └── file-organization.ts  # Organisation par compagnie
└── index.ts                  # Point d'entrée
```

### Ajout de Nouveaux Types de Documents

1. **Modifier** `src/utils/file-organization.ts`
2. **Ajouter** le nouveau type dans `DOCUMENT_TYPES`
3. **Créer** une nouvelle route dans `company-upload.routes.ts`
4. **Mettre à jour** la documentation

### Ajout de Nouveaux Types de Fichiers

1. **Modifier** `src/config/multer.config.ts`
2. **Ajouter** les nouveaux types MIME dans `ALLOWED_FILE_TYPES`
3. **Tester** avec des fichiers du nouveau type

## 🚨 Gestion d'Erreurs

Le service gère automatiquement :

- Validation des types de fichiers
- Limitation de taille
- Création automatique des dossiers
- Gestion des erreurs de stockage
- Validation des paramètres de route

## 📖 Documentation Complète

Voir le fichier `API_DOCUMENTATION.md` pour une documentation détaillée de l'API.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Créer une Pull Request

## 📄 Licence

Ce projet est sous licence ISC.

## 👨‍💻 Auteur

**Kone Nonwa** - Développeur principal

---

Pour toute question ou support, veuillez ouvrir une issue sur GitHub.
