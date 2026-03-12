# Floraly – Documentation Technique (Architecture)

## 🧭 Table des matières

1. [🎯 Vue d’ensemble](#-vue-densemble)
2. [🧱 Architecture (runtime)](#-architecture-runtime)
3. [📦 Structure du monorepo](#-structure-du-monorepo)
4. [🧰 Stack technique](#-stack-technique)
5. [🗃️ Modèle de données](#️-modèle-de-données)
6. [🖼️ Gestion des médias & assets](#️-gestion-des-médias--assets)
7. [🔌 API (principaux endpoints)](#-api-principaux-endpoints)
8. [🌡️ IoT & alertes](#️-iot--alertes)
9. [💬 Forum & notifications](#-forum--notifications)
10. [🚀 Installation & démarrage (Zero to Hero)](#-installation--démarrage-zero-to-hero)
11. [🧪 Workflow dev (DB, tests)](#-workflow-dev-db-tests)

---

## 🎯 Vue d’ensemble

Floraly est une plateforme de **pots connectés** avec :
- 🌿 **Wiki plantes** (espèces + paramètres d’entretien)
- 🧠 **Monitoring** (mesures, statut global)
- 🚨 **Alertes** (eau/lumière/température, etc.)
- 🏆 **Achievements** (gamification)
- 🛒 **Boutique** (graines + catalogue Floraly)
- 💬 **Forum** (discussions, commentaires, notifications)

Le projet est un monorepo avec un backend NestJS et un frontend Vue 3.

---

## 🧱 Architecture (runtime)

```
┌──────────────────────────┐
│ Frontend Web (Vue 3/Vite)│
│ http://localhost:5173    │
└──────────────┬───────────┘
               │ HTTPS/JSON
               ▼
┌──────────────────────────┐
│ Backend API (NestJS)      │
│ http://localhost:3000     │
│ - /api (REST)             │
│ - /docs (Swagger)         │
│ - /static (assets)        │
│ - /media (uploads)        │
└──────────────┬───────────┘
               │ Prisma
               ▼
┌──────────────────────────┐
│ PostgreSQL (Docker)       │
└──────────────────────────┘
```

---

## 📦 Structure du monorepo

- `backend/` : API NestJS + Prisma + static/media
- `web/` : SPA Vue 3 + Vite + Pinia
- `mobile/` : client mobile (présent dans le repo, hors scope de ce document)
- `infra/` : éléments d’infra (présent dans le repo, hors scope de ce document)

---

## 🧰 Stack technique

### 🧩 Backend
- 🟦 **NestJS** (TypeScript) : architecture modulaire, guards JWT, validation DTO
- 🧬 **Prisma** : schéma et migrations (client `@prisma/client`)
- 🐘 **PostgreSQL** (par défaut) via Docker Compose
  - Prisma est compatible SQLite, mais Floraly est configuré en PostgreSQL par défaut (voir `backend/prisma/schema.prisma` + `backend/.env`).
- 📚 **Swagger** : exposé en dev sur `http://localhost:3000/docs`

### 🖥️ Frontend
- 🟩 **Vue 3** + ⚡ **Vite**
- 🧠 **Pinia** (state management)
- 🧭 **Vue Router**
- 🎨 UI : **Vue Material Kit / Argon (Bootstrap)** + styles custom
  - Des tokens visuels “stone/emerald” sont utilisés côté UI ; Tailwind CSS n’est pas câblé par défaut dans ce repo (pas de `tailwind.config.*`), mais l’UI suit des conventions proches des utilitaires.

---

## 🗃️ Modèle de données

Le schéma Prisma est dans `backend/prisma/schema.prisma`.

### 🧍 Comptes & sécurité
- `User` : email, username, `avatarUrl`, etc.
- `UserSettings` : préférences utilisateur
- `PushToken` : tokens push (si utilisés)

### 🪴 Pots connectés & mesures
- `Device` : pot/appareil (pairing, ownerId, etc.)
- `PlantInstance` : plante “réelle” associée à un device
- `SensorReading` : séries temporelles (humidité, lumière, température, humidité air…)
- `Alert` : alertes générées (types/severity, résolues ou non)

### 📚 Wiki plantes
- `PlantSpecies` : espèce (id numérique, nom, type, image)
- `PlantCare` : paramètres d’entretien + tips (careTips/plantingTips/maintenanceTips)

### 🛒 Boutique
- `Product` : catalogue boutique
  - catégories : `SEED`, `ACCESSORY`, `POT`, `SOIL`
  - utilisé par `GET /api/products` avec filtre `?category=...`

### 💬 Forum
- `Discussion` : titre, contenu, auteur, `imageUrl`, `createdAt`
- `Comment` : contenu, auteur, discussion, `createdAt`
- `Notification` : `userId`, message, type (ex: `REPLY`), `read`, `createdAt`

### 🏆 Achievements
- `Achievement` : définition (code, titre, description, category, icon)
- `UserAchievement` : état “débloqué” par utilisateur (unlockedAt)

---

## 🖼️ Gestion des médias & assets

Floraly sert deux familles d’images :

### 🧷 Assets “build-time” via `/static`
- Route : `http://localhost:3000/static/...`
- Source disque : `backend/public/` (en dev) via `app.useStaticAssets(..., { prefix: '/static' })`
- Exemples :
  - `backend/public/boutique/*.png` → `/static/boutique/...`
  - `backend/public/plants/*.png` → `/static/plants/...`
  - `backend/public/HomePage/*.png` → `/static/HomePage/...`

### 📤 Uploads “runtime” via `/media`
- Route : `http://localhost:3000/media/...`
- Source disque : `backend/media/` (par défaut) via `ServeStaticModule` (AppModule)
- Config :
  - `MEDIA_BASE_PATH` (dossier) — défaut : `backend/media`
  - `MEDIA_BASE_URL` (URL publique) — défaut : `http://localhost:3000/media`
- Conventions de stockage (via `MediaService`) :
  - 👤 Avatars : `media/users/<userId>/avatar/<uuid>.<ext>`
  - 💬 Images forum : `media/forum/<uuid>.<ext>`

---

## 🔌 API (principaux endpoints)

Le backend expose ses routes sous le préfixe `/api` (ex: `http://localhost:3000/api/...`).

### 🔐 Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout` (JWT)

### 👤 Utilisateurs & avatar
- `GET /api/users/me` (JWT)
- `PUT /api/users/me` (JWT)
- `POST /api/users/me/avatar` (JWT, upload fichier `file`)

### 🪴 Pots, mesures, alertes
- `GET /api/pots` (JWT)
- `GET /api/pots/:id` (JWT)
- `POST /api/pots/link` (JWT) : pairing “côté utilisateur”
- `GET /api/pots/:potId/measurements` (JWT)
- `GET /api/pots/:potId/measurements/latest` (JWT)
- `GET /api/pots/:potId/alerts` (JWT)

### 📚 Wiki
- `GET /api/wiki/plants`
- `GET /api/wiki/plants/:id`

### 🛒 Boutique
- `GET /api/products`
- `GET /api/products?category=SEED|ACCESSORY|POT|SOIL`
- `GET /api/products/:id`

### 💬 Forum
- `GET /api/forum`
- `POST /api/forum` (JWT, upload optionnel `file`)
- `POST /api/forum/:id/comment` (JWT)
- `GET /api/notifications` (JWT)

### 🏆 Achievements
- `GET /api/achievements` (public)
- `GET /api/me/achievements` (JWT)

### 🌡️ Ingestion IoT (télémétrie)
- `POST /api/device/telemetry` (HMAC)
- `POST /api/device/telemetry/simple` (prototype, sans HMAC)
- `POST /api/device/telemetry/simple/base-raw` (prototype base multi-slots)

---

## 🌡️ IoT & alertes

### 📡 Comment les capteurs communiquent avec NestJS

Deux modes coexistent :

1) 🔒 Mode “device” sécurisé (HMAC)  
Le device envoie un payload JSON et signe la requête via headers :
- `X-DEVICE-UID`
- `X-DEVICE-TIMESTAMP`
- `X-DEVICE-SIGNATURE`

2) 🧪 Mode “prototype” (sans HMAC)  
Endpoints `.../simple` utilisés pour simuler l’ingestion pendant le dev.

### 🚨 Génération d’alertes (vue d’ensemble)

- Les mesures sont enregistrées en base (`SensorReading`)
- Le backend calcule un **statut global** et expose des endpoints de lecture
- Les alertes sont consultables via `GET /api/pots/:potId/alerts`

---

## 💬 Forum & notifications

### 🧵 Discussions / commentaires

- Une discussion possède un auteur (`User`) et peut avoir une image (`imageUrl`)
- Les commentaires sont chargés avec leur auteur

### 🔔 Notifications forum

Lorsqu’un utilisateur ajoute un commentaire sur une discussion :
- le commentaire est créé
- si l’auteur du commentaire est différent de l’auteur de la discussion, une `Notification` est créée pour l’auteur de la discussion (type `REPLY`)
- le dashboard web consomme `GET /api/notifications`

---

## 🚀 Installation & démarrage (Zero to Hero)

Objectif : démarrer Floraly après un `git clone`, sans surprise.

### ✅ Prérequis
- Node.js **20 LTS** (recommandé)
- Docker + Docker Compose
- npm

### 1) 🧰 Configuration de l’environnement

Backend : créer un fichier `backend/.env` (exemple minimal) :

```bash
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<db>?schema=public
JWT_ACCESS_TOKEN_SECRET=dev_secret
JWT_REFRESH_TOKEN_SECRET=dev_secret_refresh
PORT=3000
```

Astuce : pour éviter les erreurs de configuration, alignez `DATABASE_URL` avec les identifiants définis dans `docker-compose.yml` (service `db`) et avec le fichier `backend/.env` du repo.

### 2) 📦 Installation des dépendances (depuis la racine)

```bash
npm install --prefix backend
npm install --prefix web
```

### 3) 🐘 Lancer PostgreSQL (Docker)

```bash
docker compose up -d db
```

### 4) 🗃️ Initialisation de la base (Prisma)

Exécuter dans `backend/` :

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

Le seed injecte notamment :
- 🌿 espèces du wiki + care tips
- 🛒 produits (graines issues du wiki + catalogue Floraly)
- 🏆 achievements

### 5) ▶️ Lancer backend + frontend en parallèle

Dans un terminal :

```bash
npm run dev --prefix backend
```

Dans un second terminal :

```bash
npm run dev --prefix web
```

### 6) 🔎 Vérifications rapides

Backend :
- API : `http://localhost:3000/api`
- Swagger : `http://localhost:3000/docs`
- Assets : `http://localhost:3000/static/boutique/floraly-classique.png`

Frontend :
- Web : `http://localhost:5173`

---

## 🧪 Workflow dev (DB, tests)

### 🧬 Modifier la base de données (Prisma)

```bash
cd backend
# 1) Modifier prisma/schema.prisma
# 2) Créer une migration
npx prisma migrate dev --name ma_migration
# 3) Régénérer le client
npx prisma generate
```

### ✅ Tests backend

```bash
cd backend
npm test
```
