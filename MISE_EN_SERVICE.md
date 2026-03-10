# Guide de Mise en Service - Plantly

Ce document détaille la procédure complète pour déployer et mettre en service la solution Plantly (Backend + Arduino) de zéro.

## 1. Prérequis Système

Avant de commencer, assurez-vous d'avoir installé les outils suivants sur votre serveur ou machine de développement :

*   **Node.js** (v18 ou supérieur) & **npm**
*   **PostgreSQL** (v14 ou supérieur)
*   **Git**
*   **Arduino IDE** ou **PlatformIO** (pour la partie embarquée)

---

## 2. Mise en Service du Backend

Le backend est le cœur du système, gérant l'API, la base de données et la logique métier.

### 2.1. Installation

1.  Clonez le dépôt (si ce n'est pas déjà fait) :
    ```bash
    git clone <votre-repo-url>
    cd Plantly/backend
    ```

2.  Installez les dépendances :
    ```bash
    npm install
    ```

### 2.2. Configuration de l'Environnement

Créez un fichier `.env` à la racine du dossier `backend` en vous basant sur l'exemple ci-dessous.
**Important :** Remplacez les valeurs secrètes pour un déploiement réel.

```env
# Configuration Serveur
PORT=3000
NODE_ENV=production

# Configuration Base de Données (PostgreSQL)
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DATABASE_URL="postgresql://postgres:password@localhost:5432/plantly?schema=public"

# Sécurité (JWT) - Générez des chaînes aléatoires longues pour la production
JWT_ACCESS_TOKEN_SECRET="votre_secret_access_tres_long_et_securise"
JWT_REFRESH_TOKEN_SECRET="votre_secret_refresh_tres_long_et_securise"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
BCRYPT_SALT_ROUNDS=10
```

### 2.3. Initialisation de la Base de Données

Une fois PostgreSQL lancé et le fichier `.env` configuré :

1.  **Créer le schéma de base de données :**
    ```bash
    npx prisma migrate deploy
    ```
    *(En développement, utilisez `npx prisma migrate dev`)*

2.  **Peupler la base de données (Seed) :**
    Cette étape est **cruciale** car elle crée :
    *   Les espèces de plantes par défaut.
    *   La base de test `BASE_TEST_01` nécessaire pour la connexion Arduino immédiate.
    *   Un utilisateur de démonstration.

    ```bash
    npx prisma db seed
    ```

### 2.4. Démarrage du Serveur

1.  **Compiler le projet (TypeScript -> JavaScript) :**
    ```bash
    npm run build
    ```

2.  **Lancer le serveur :**
    ```bash
    npm run start:prod
    ```

Le serveur devrait être accessible sur `http://localhost:3000`.

---

## 3. Mise en Service de la Partie Arduino

Cette section explique comment connecter le matériel au backend nouvellement déployé.
*Pour les détails des modifications de code, voir `ARDUINO_CHANGES.md`.*

### 3.1. Configuration Réseau et Serveur

Dans votre code Arduino (fichier principal ou de configuration) :

1.  **Renseignez vos identifiants WiFi :**
    ```cpp
    const char* ssid = "VOTRE_SSID_WIFI";
    const char* password = "VOTRE_MOT_DE_PASSE_WIFI";
    ```

2.  **Configurez l'URL du Backend :**
    ⚠️ **Attention :** N'utilisez pas `localhost` sur l'Arduino. Utilisez l'adresse IP locale de votre serveur (ex: `192.168.1.15`) ou son IP publique.

    ```cpp
    // Exemple si votre serveur est sur 192.168.1.15
    const char* backendUrl = "http://192.168.1.15:3000/api/device/telemetry/simple";
    ```

### 3.2. Flash et Vérification

1.  Compilez et téléversez le code sur votre ESP32.
2.  Ouvrez le moniteur série (Baud rate configuré, souvent 115200).
3.  Vérifiez les logs :
    *   `WiFi connected` : Succès connexion réseau.
    *   `HTTP Response code: 201` : Succès envoi télémétrie au backend.

---

## 4. Vérification de Bout en Bout

Pour confirmer que tout le système fonctionne ensemble :

1.  **Côté Arduino :** Assurez-vous qu'il envoie des données régulièrement (toutes les X secondes/minutes).
2.  **Côté Backend (Logs) :** Vous devriez voir passer des requêtes `POST /api/device/telemetry/simple`.
3.  **Côté Base de Données :**
    Vérifiez que les mesures sont enregistrées avec le champ `airHumidity`.
    ```sql
    SELECT * FROM "SensorReading" ORDER BY "timestamp" DESC LIMIT 5;
    ```
4.  **Côté API (Test Final) :**
    Appelez l'endpoint de détails du pot pour voir si `airHumidity` remonte bien.
    *(Nécessite d'être authentifié ou d'utiliser un outil de test API)*

---

## 5. Dépannage (Troubleshooting)

| Problème | Cause Possible | Solution |
| :--- | :--- | :--- |
| **Erreur de connexion BDD** | `DATABASE_URL` incorrecte ou Postgres éteint | Vérifiez le service Postgres et les identifiants dans `.env`. |
| **Arduino: Connection Refused** | Firewall ou mauvaise IP | Autorisez le port 3000 dans le pare-feu Windows/Linux. Vérifiez l'IP du serveur avec `ipconfig` ou `ifconfig`. |
| **Données manquantes (airHumidity)** | Backend non mis à jour | Assurez-vous d'avoir fait `npm run build` et redémarré le serveur après les dernières modifications. |
| **Erreur "Unknown base UID"** | Seed non exécuté | Lancez `npx prisma db seed` pour créer `BASE_TEST_01`. |
