# API de Gestion de Fichiers par Compagnie

## Vue d'ensemble

Cette API permet de gérer l'upload de fichiers organisés par compagnie avec une structure hiérarchique claire. Les fichiers sont organisés selon le type d'entité (compagnie, staff, conducteur, passager) et le type de document.

## Structure des Dossiers

```
public/
├── company/
│   ├── {companyId}/
│   │   ├── logo/
│   │   │   ├── original/
│   │   │   └── thumb/
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

## Types de Documents Supportés

### Compagnie

- `logo` : Logo de la compagnie

### Staff (Membres du personnel)

- `cni` : Carte nationale d'identité
- `cmu` : Couverture maladie universelle
- `carte_sejour` : Carte de séjour
- `contrat` : Contrat de travail
- `photo` : Photo d'identité
- `autre` : Autres documents

### Conducteur

- `permis_conduite` : Permis de conduire
- `cni` : Carte nationale d'identité
- `cmu` : Couverture maladie universelle
- `carte_sejour` : Carte de séjour
- `certificat_medical` : Certificat médical
- `photo` : Photo d'identité
- `autre` : Autres documents

### Passager

- `cni` : Carte nationale d'identité
- `passeport` : Passeport
- `billet` : Billet de transport
- `photo` : Photo d'identité
- `autre` : Autres documents

## Endpoints de l'API

### Base URL

```
http://localhost:3000/api/upload
```

### 1. Upload Logo de Compagnie

```http
POST /company/{companyId}/logo
Content-Type: multipart/form-data
```

**Paramètres :**

- `companyId` (string) : ID de la compagnie

**Fichiers acceptés :**

- Types : JPEG, JPG, PNG, WebP
- Taille max : 2MB
- Nombre : 1 fichier

**Exemple :**

```bash
curl -X POST \
  http://localhost:3000/api/upload/company/COMP123/logo \
  -F "file=@logo.png"
```

### 2. Upload Documents de Staff

#### CNI

```http
POST /company/{companyId}/staff/{staffId}/documents/cni
```

#### CMU

```http
POST /company/{companyId}/staff/{staffId}/documents/cmu
```

#### Carte de Séjour

```http
POST /company/{companyId}/staff/{staffId}/documents/carte-sejour
```

#### Contrat

```http
POST /company/{companyId}/staff/{staffId}/documents/contrat
```

#### Photo

```http
POST /company/{companyId}/staff/{staffId}/documents/photo
```

#### Autres Documents

```http
POST /company/{companyId}/staff/{staffId}/documents/autre
```

### 3. Upload Documents de Conducteur

#### Permis de Conduire

```http
POST /company/{companyId}/driver/{driverId}/documents/permis-conduite
```

#### CNI

```http
POST /company/{companyId}/driver/{driverId}/documents/cni
```

#### CMU

```http
POST /company/{companyId}/driver/{driverId}/documents/cmu
```

#### Carte de Séjour

```http
POST /company/{companyId}/driver/{driverId}/documents/carte-sejour
```

#### Certificat Médical

```http
POST /company/{companyId}/driver/{driverId}/documents/certificat-medical
```

#### Photo

```http
POST /company/{companyId}/driver/{driverId}/documents/photo
```

#### Autres Documents

```http
POST /company/{companyId}/driver/{driverId}/documents/autre
```

### 4. Upload Documents de Passager

#### CNI

```http
POST /company/{companyId}/passenger/{passengerId}/documents/cni
```

#### Passeport

```http
POST /company/{companyId}/passenger/{passengerId}/documents/passeport
```

#### Billet

```http
POST /company/{companyId}/passenger/{passengerId}/documents/billet
```

#### Photo

```http
POST /company/{companyId}/passenger/{passengerId}/documents/photo
```

#### Autres Documents

```http
POST /company/{companyId}/passenger/{passengerId}/documents/autre
```

### 5. Upload Générique

```http
POST /company/{companyId}/{entityType}/{entityId}/documents/{documentType}
```

**Paramètres :**

- `companyId` (string) : ID de la compagnie
- `entityType` (string) : Type d'entité (staff, driver, passenger)
- `entityId` (string) : ID de l'entité
- `documentType` (string) : Type de document

## Routes de Gestion des Fichiers

### Base URL pour la gestion

```
http://localhost:3000/api
```

### 1. Récupération de Fichiers

#### Tous les fichiers d'une compagnie

```http
GET /company/{companyId}/files?limit=50&offset=0
```

#### Fichiers d'une entité spécifique

```http
GET /company/{companyId}/{entityType}/{entityId}/files?limit=50&offset=0
```

#### Fichiers par type de document

```http
GET /company/{companyId}/files/type/{documentType}?limit=50&offset=0
```

#### Logos d'une compagnie

```http
GET /company/{companyId}/logos
```

#### Fichier par ID

```http
GET /files/{fileId}
```

#### Recherche de fichiers

```http
GET /files/search?companyId=COMP123&entityType=staff&documentType=cni&limit=50&offset=0
```

### 2. Statistiques

#### Statistiques des fichiers d'une compagnie

```http
GET /company/{companyId}/stats
```

### 3. Gestion des Fichiers

#### Mettre à jour les métadonnées

```http
PUT /files/{fileId}/metadata
Content-Type: application/json

{
  "metadata": {
    "description": "Document d'identité principal",
    "tags": ["identité", "officiel"]
  }
}
```

#### Supprimer un fichier (soft delete)

```http
DELETE /files/{fileId}
```

#### Supprimer définitivement un fichier

```http
DELETE /files/{fileId}/hard
```

## Réponse de l'API

### Succès (200)

#### Upload de fichier

```json
{
  "success": true,
  "filesData": [
    {
      "companyId": "COMP123",
      "entityType": "staff",
      "entityId": "STAFF456",
      "documentType": "cni",
      "originalName": "cni.jpg",
      "filename": "1703123456789_abc123_cni.jpg",
      "mimeType": "image/jpeg",
      "size": 1024000,
      "uploadDate": "2023-12-21T10:30:45.123Z",
      "fileUrl": "/public/company/COMP123/staff/STAFF456/documents/original/1703123456789_abc123_cni.jpg",
      "fileId": "b2_file_id_123",
      "thumbnailUrl": "/public/company/COMP123/staff/STAFF456/documents/thumb/1703123456789_abc123_cni.jpg",
      "dbId": "507f1f77bcf86cd799439011",
      "savedToDB": true
    }
  ],
  "message": "Fichiers sauvegardés avec succès",
  "organization": {
    "companyId": "COMP123",
    "entityType": "staff",
    "entityId": "STAFF456",
    "documentType": "cni"
  }
}
```

#### Récupération de fichiers

```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "companyId": "COMP123",
      "entityType": "staff",
      "entityId": "STAFF456",
      "documentType": "cni",
      "originalName": "cni.jpg",
      "filename": "1703123456789_abc123_cni.jpg",
      "mimeType": "image/jpeg",
      "size": 1024000,
      "fileUrl": "/public/company/COMP123/staff/STAFF456/documents/original/1703123456789_abc123_cni.jpg",
      "thumbnailUrl": "/public/company/COMP123/staff/STAFF456/documents/thumb/1703123456789_abc123_cni.jpg",
      "uploadDate": "2023-12-21T10:30:45.123Z",
      "isImage": true,
      "extension": "jpg",
      "metadata": {
        "folderPath": "company/COMP123/staff/STAFF456/documents",
        "isImage": true,
        "uploadedAt": "2023-12-21T10:30:45.123Z"
      }
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 1
  }
}
```

#### Statistiques des fichiers

```json
{
  "success": true,
  "data": {
    "totalFiles": 25,
    "totalSize": 15728640,
    "filesByType": {
      "cni": 10,
      "logo": 2,
      "contrat": 8,
      "photo": 5
    },
    "filesByEntity": {
      "staff": 15,
      "driver": 8,
      "company": 2
    },
    "recentUploads": 3
  }
}
```

### Erreur (400/500)

```json
{
  "error": "Message d'erreur détaillé"
}
```

## Types de Fichiers Acceptés

### Documents d'Identité

- **Types MIME :** `image/jpeg`, `image/jpg`, `image/png`, `application/pdf`
- **Extensions :** `.jpg`, `.jpeg`, `.png`, `.pdf`
- **Taille max :** 5MB

### Logos de Compagnie

- **Types MIME :** `image/jpeg`, `image/jpg`, `image/png`, `image/webp`
- **Extensions :** `.jpg`, `.jpeg`, `.png`, `.webp`
- **Taille max :** 2MB

### Documents Généraux

- **Types MIME :** `image/jpeg`, `image/jpg`, `image/png`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **Extensions :** `.jpg`, `.jpeg`, `.png`, `.pdf`, `.doc`, `.docx`
- **Taille max :** 10MB

## Configuration

### Variables d'Environnement

```env
# Stockage local ou cloud
FILE_STORAGE=local

# Configuration Backblaze B2 (si FILE_STORAGE != local)
APP_KEY=your_app_key
KEY_ID=your_key_id
BUCKET_ID=your_bucket_id
BUCKET_NAME=your_bucket_name

# Port du serveur
PORT=3000
```

### Stockage Local

Si `FILE_STORAGE=local`, les fichiers sont stockés dans le dossier `public/` à la racine du projet.

### Stockage Cloud (Backblaze B2)

Si `FILE_STORAGE` n'est pas défini sur `local`, les fichiers sont uploadés vers Backblaze B2.

## Exemples d'Utilisation

### Frontend (JavaScript)

```javascript
// Upload d'un logo de compagnie
const uploadCompanyLogo = async (companyId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/upload/company/${companyId}/logo`, {
    method: 'POST',
    body: formData,
  });

  return await response.json();
};

// Upload d'un document CNI pour un staff
const uploadStaffCNI = async (companyId, staffId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(
    `/api/upload/company/${companyId}/staff/${staffId}/documents/cni`,
    {
      method: 'POST',
      body: formData,
    }
  );

  return await response.json();
};
```

### cURL

```bash
# Upload logo
curl -X POST \
  http://localhost:3000/api/upload/company/COMP123/logo \
  -F "file=@company-logo.png"

# Upload CNI staff
curl -X POST \
  http://localhost:3000/api/upload/company/COMP123/staff/STAFF456/documents/cni \
  -F "file=@cni-document.pdf"
```

## Notes Importantes

1. **Organisation Automatique :** Les fichiers sont automatiquement organisés dans la structure de dossiers appropriée.

2. **Miniatures :** Pour les images, des miniatures sont automatiquement générées et stockées dans le dossier `thumb/`.

3. **Noms Uniques :** Les noms de fichiers sont automatiquement générés avec un timestamp et un ID unique pour éviter les conflits.

4. **Validation :** Chaque type de document a ses propres règles de validation (types de fichiers, taille, etc.).

5. **Compatibilité :** Les routes legacy (`/file/*`) restent disponibles pour la compatibilité avec l'ancien système.
