# Documentation Technique – Système de Pot de Plante Connecté

## 📋 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture système](#architecture-système)
3. [Stack technique](#stack-technique)
4. [Modèle de données](#modèle-de-données)
5. [API REST](#api-rest)
6. [Frontend Web](#frontend-web)
7. [Système IoT](#système-iot)
8. [Système d'alertes](#système-dalertes)
9. [Installation et démarrage](#installation-et-démarrage)
10. [Workflow de développement](#workflow-de-développement)

---

## Vue d'ensemble

### Objectif du projet

Développer un écosystème complet de suivi et d'accompagnement pour la croissance des plantes, combinant hardware IoT, backend sécurisé, application mobile et interface web.

### Fonctionnalités principales

- **Monitoring en temps réel** : humidité, température, luminosité
- **Wiki des plantes** : fiches détaillées avec paramètres d'entretien
- **Système d'alertes** : notifications automatiques en cas d'anomalie
- **Gamification** : succès et achievements pour encourager l'engagement
- **Multi-plateforme** : web (Vue.js) et mobile (Android)

---

## Architecture système

L'architecture repose sur **5 composants principaux** interconnectés :

```
┌─────────────────┐
│   Hardware IoT  │  ──────┐
│  (Pot connecté) │         │
└─────────────────┘         │
                            ▼ HTTPS/JSON
┌─────────────────┐    ┌──────────────────┐
│  App Mobile     │◄───┤  Backend NestJS  │
│   (Android)     │    │   (API REST)     │
└─────────────────┘    └──────────────────┘
                            ▲      │
┌─────────────────┐         │      │
│  Frontend Web   │─────────┘      ▼
│   (Vue.js 3)    │         ┌──────────────┐
└─────────────────┘         │  PostgreSQL  │
                            └──────────────┘
```

### Composants détaillés

| Composant | Technologie | Rôle |
|-----------|-------------|------|
| **Hardware IoT** | Microcontrôleur + capteurs | Collecte des données environnementales |
| **Backend** | NestJS + TypeScript | API REST, logique métier, authentification |
| **Base de données** | PostgreSQL (Docker) | Stockage persistant |
| **Frontend Web** | Vue.js 3 + Pinia | Interface utilisateur web |
| **App Mobile** | Android | Client mobile REST |

---

## Stack technique

### Backend : NestJS + TypeScript

**Choix de NestJS :**
- Architecture modulaire et scalable
- Intégration native avec Swagger (documentation auto)
- Système robuste de middleware/guards/interceptors
- Support TypeScript de premier ordre
- Structure MVC claire

**Avantages TypeScript :**
- Typage strict pour contrats API/DB/Frontend
- Réduction des erreurs runtime
- Refactoring sécurisé

### ORM : Prisma

**Pourquoi Prisma ?**
- Modélisation déclarative du schéma
- Migrations versionnées et fiables
- Client TypeScript auto-généré
- Prisma Studio pour exploration visuelle de la DB
- Requêtes typées et sécurisées

### Base de données : PostgreSQL

**Avantages Postgres :**
- Maturité et fiabilité éprouvées
- Types avancés (JSONB, arrays)
- Parfaite intégration avec Prisma
- Modèles relationnels complexes
- Déploiement simplifié via Docker

### Frontend : Vue.js 3 + Pinia + Vue Router

**Vue.js 3 :**
- Courbe d'apprentissage douce
- Composants Single File Component lisibles
- Performance optimale
- Réactivité fine et structure modulaire

**Pinia (State Management) :**
- Remplaçant moderne de Vuex
- Typage TypeScript excellent
- Stores légers et isolés
- Idéal pour synchroniser auth/pots/wiki

**Vue Material Kit :**
- Composants visuels professionnels prêts à l'emploi
- Thème cohérent sans CSS custom massif
- Gain de temps considérable sur le design

### Communication IoT : HTTPS + REST

**Pourquoi pas MQTT ?**
L'architecture est volontairement simplifiée pour éviter un broker supplémentaire.

**Avantages HTTPS/REST :**
- Compatible nativement avec microcontrôleurs modernes
- Pas de serveur additionnel à maintenir
- Sécurisation simple via API key/deviceUid
- Protocole universel

---

## Modèle de données

### Schéma relationnel

```
User ──┬─── Device (Pot)
       │
       └─── UserAchievement
       
Device ───── PlantInstance ───── PlantSpecies ───── PlantCare
   │
   └─── SensorReading
   │
   └─── Alert

PlantSpecies ───── PlantCare
```

### Tables principales

#### **User**
Gestion des utilisateurs et authentification.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `email` | String | Email (unique) |
| `password` | Hash | Mot de passe chiffré |
| `preferences` | JSON | Paramètres utilisateur |

#### **Device**
Représente chaque pot physique connecté.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `deviceUid` | String | UID matériel immutable |
| `pairingCode` | String | Code de pairing |
| `status` | Enum | ok / action / mauvais / offline |
| `userId` | UUID | Propriétaire |

#### **PlantSpecies**
Fiches encyclopédiques des espèces.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `commonName` | String | Nom vernaculaire |
| `latinName` | String | Nom scientifique |
| `description` | Text | Description détaillée |
| `imageUrl` | String | Photo de l'espèce |

#### **PlantCare**
Paramètres d'entretien optimaux par espèce.

| Champ | Type | Description |
|-------|------|-------------|
| `moistureMin` | Float | Humidité minimale (%) |
| `moistureMax` | Float | Humidité maximale (%) |
| `lightMin` | Int | Luminosité minimale (lux) |
| `lightMax` | Int | Luminosité maximale (lux) |
| `tempMin` | Float | Température min (°C) |
| `tempMax` | Float | Température max (°C) |
| `tips` | Text | Conseils d'entretien |

#### **PlantInstance**
La plante concrète dans un pot.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `nickname` | String | Nom personnalisé |
| `plantedAt` | DateTime | Date de plantation |
| `deviceId` | UUID | Pot associé |
| `speciesId` | UUID | Espèce |
| `userId` | UUID | Propriétaire |

#### **SensorReading**
Historique des mesures capteurs.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `deviceId` | UUID | Pot source |
| `timestamp` | DateTime | Date de mesure |
| `soilMoisture` | Float | Humidité sol (%) |
| `lightLevel` | Int | Luminosité (lux) |
| `temperature` | Float | Température (°C) |

#### **Alert**
Alertes déclenchées automatiquement.

| Champ | Type | Description |
|-------|------|-------------|
| `id` | UUID | Identifiant unique |
| `deviceId` | UUID | Pot concerné |
| `type` | Enum | moisture_low, temp_high, etc. |
| `message` | String | Message explicatif |
| `createdAt` | DateTime | Date création |
| `resolvedAt` | DateTime? | Date résolution |

#### **Achievement / UserAchievement**
Système de succès gamifiés.

**Categories :**
- Découverte
- Entretien
- Personnalisation
- Régularité

---

## API REST

### Organisation modulaire

L'API est structurée en **modules NestJS** :

#### **Auth Module**
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion (retourne JWT)
- `POST /auth/refresh` - Renouvellement token
- `POST /auth/logout` - Déconnexion

**Authentification :** JWT avec Access Token + Refresh Token

#### **Pots Module**
- `GET /pots` - Liste des pots de l'utilisateur
- `GET /pots/:id` - Détail d'un pot
- `POST /pots/pair` - Associer un pot (deviceUid + pairingCode)
- `GET /pots/:id/readings` - Historique mesures
- `GET /pots/:id/alerts` - Alertes actives

#### **Wiki Module**
- `GET /wiki/species` - Liste des espèces
- `GET /wiki/species/search?q=...` - Recherche
- `GET /wiki/species/:id` - Fiche détaillée + care

#### **Achievements Module**
- `GET /achievements` - Liste complète
- `GET /achievements/user` - Succès débloqués

#### **User Module**
- `GET /user/profile` - Profil utilisateur
- `PATCH /user/profile` - Mise à jour profil
- `POST /user/avatar` - Upload photo
- `GET /user/achievements` - Succès liés au compte

### Sécurité

- **Validation automatique** via DTO (Data Transfer Objects)
- **Documentation Swagger** auto-générée
- **Guards JWT** sur routes protégées
- **Rate limiting** sur endpoints sensibles

---

## Frontend Web

### Architecture Vue.js

#### **Stores Pinia**

```javascript
// authStore : gestion authentification
- state : user, token, isAuthenticated
- actions : login(), logout(), register(), refresh()

// potsStore : gestion des pots
- state : pots[], selectedPot
- actions : fetchPots(), fetchPotDetails(), pairPot()

// wikiStore : encyclopédie plantes
- state : species[], searchResults
- actions : fetchSpecies(), searchSpecies()

// achievementsStore : succès
- state : achievements[], userAchievements[]
- actions : fetchAchievements()
```

#### **Gestion du token JWT**

1. Token stocké dans `localStorage`
2. `initFromStorage()` appelé au démarrage de l'app
3. `httpClient` injecte automatiquement `Authorization: Bearer <token>`
4. Refresh automatique si token expiré

#### **Routes principales**

| Route | Composant | Protection | Description |
|-------|-----------|------------|-------------|
| `/` | Home | Public | Page d'accueil |
| `/login` | Login | Public | Connexion |
| `/register` | Register | Public | Inscription |
| `/pots` | PotsList | 🔒 Protégée | Liste des pots |
| `/pots/:id` | PotDetail | 🔒 Protégée | Détail + graphiques |
| `/wiki` | WikiList | Public | Encyclopédie |
| `/wiki/:id` | WikiDetail | Public | Fiche espèce |
| `/profile` | Profile | 🔒 Protégée | Profil utilisateur |
| `/achievements` | Achievements | 🔒 Protégée | Succès |

**Guard de navigation :** Redirection automatique vers `/login` si token absent.

#### **UI - Vue Material Kit**

Composants utilisés :
- **Navbar** Material Kit
- **Footer** Material Kit
- **Cards** pour pots, wiki, alertes, succès
- **Hero Section** sur la home
- **Inputs stylés** Material Design (login/register)
- **Graphiques** SVG custom intégrés dans Material cards

**Avantages :**
- Cohérence visuelle immédiate
- Pas de CSS artisanal nécessaire
- Look professionnel out-of-the-box

---

## Système IoT

### Pairing d'un pot

```
1. L'utilisateur reçoit un pot avec :
   - deviceUid (gravé sur le pot)
   - pairingCode (fourni)

2. Dans l'app/web :
   POST /pots/pair
   {
     "deviceUid": "xxxx",
     "pairingCode": "yyyy"
   }

3. Backend associe le Device au User

4. Le pot peut maintenant envoyer des données
```

### Envoi de données capteurs

**Format JSON :**

```json
{
  "deviceUid": "xxxx",
  "timestamp": "2025-12-03T14:30:00Z",
  "soilMoisture": 45.2,
  "lightLevel": 650,
  "temperature": 22.3
}
```

**Endpoint :** `POST /iot/readings`

**Traitement backend :**
1. Authentification du device via `deviceUid`
2. Enregistrement dans `SensorReading`
3. Comparaison avec bornes `PlantCare`
4. Déclenchement d'alertes si nécessaire
5. Mise à jour du statut du `Device`

---

## Système d'alertes

### Déclenchement automatique

```
Nouvelle mesure reçue
    ↓
Comparaison avec PlantCare (min/max)
    ↓
Anomalie détectée ?
    ↓ OUI
Création Alert {
  type: "moisture_low" | "temp_high" | "light_low" | ...
  message: "Votre plante a besoin d'eau"
}
```

### Types d'alertes

| Type | Condition | Message |
|------|-----------|---------|
| `moisture_low` | `soilMoisture < moistureMin` | "Humidité trop basse" |
| `moisture_high` | `soilMoisture > moistureMax` | "Risque d'excès d'eau" |
| `temp_low` | `temperature < tempMin` | "Température trop froide" |
| `temp_high` | `temperature > tempMax` | "Température trop élevée" |
| `light_low` | `lightLevel < lightMin` | "Manque de lumière" |
| `light_high` | `lightLevel > lightMax` | "Trop de soleil direct" |

### Résolution

Une alerte est résolue :
- **Automatiquement** : nouvelle mesure conforme
- **Manuellement** : action utilisateur (selon logique métier)

### Affichage frontend

- Badge rouge/orange Material Design
- Liste des alertes dans détail pot
- Compteur sur l'icône du pot (liste)

---

## Installation et démarrage

### Prérequis

- Node.js 18+
- Docker & Docker Compose
- npm ou yarn

### Installation

#### 1. Base de données

```bash
# Démarrer PostgreSQL en Docker
docker compose up -d db
```

#### 2. Backend

```bash
cd backend

# Installer les dépendances
npm install

# Générer le client Prisma
npm run prisma:generate

# Appliquer les migrations
npm run prisma:migrate

# Seed la base (données de test)
npm run prisma:seed

# Démarrer le serveur
npm run dev
```

**URL API :** `http://localhost:3000`  
**Swagger :** `http://localhost:3000/api`

#### 3. Frontend Web

```bash
cd web

# Installer les dépendances
npm install

# Démarrer le serveur de dev
npm run dev
```

**URL Web :** `http://localhost:5173`

---

## Workflow de développement

### Modification du schéma DB

```bash
cd backend

# 1. Modifier prisma/schema.prisma

# 2. Créer une migration
npm run prisma:migrate -- --name nom_migration

# 3. Régénérer le client
npm run prisma:generate
```

### Ajouter un endpoint API

```bash
# 1. Créer un module NestJS
nest g module nom-module
nest g controller nom-module
nest g service nom-module

# 2. Implémenter la logique dans le service

# 3. Créer les DTOs de validation

# 4. Documenter avec Swagger decorators
```

### Ajouter une page Vue

```bash
# 1. Créer le composant dans src/views/

# 2. Ajouter la route dans src/router/

# 3. Mettre à jour le store Pinia si nécessaire

# 4. Utiliser Vue Material Kit pour l'UI
```

---

## Points d'extension

### Fonctionnalités futures

- **Notifications push** (mobile + web)
- **Machine Learning** : prédictions de croissance
- **Communauté** : partage de photos, conseils
- **Marketplace** : achat de plantes/accessoires
- **Intégration météo** : alertes climatiques
- **Automatisation** : arrosage automatique

### Scalabilité

- **Microservices** : séparer IoT, API, Notifications
- **Cache Redis** : réduire charge DB
- **CDN** : assets statiques
- **Load balancing** : distribuer le trafic

---

## Conclusion

Cette architecture offre :

✅ **Séparation claire des responsabilités** entre IoT, backend, frontend  
✅ **Stack moderne et pérenne** (NestJS, Prisma, Vue 3, PostgreSQL)  
✅ **Modèle de données structuré** autour des besoins réels  
✅ **Interface professionnelle** grâce à Vue Material Kit  
✅ **Communication IoT simplifiée** via HTTPS/REST  
✅ **Base solide et extensible** pour évolutions futures

Le système est prêt pour un déploiement en production et peut facilement évoluer vers des fonctionnalités avancées.