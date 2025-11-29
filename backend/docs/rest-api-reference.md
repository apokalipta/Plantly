# Référence de l’API REST Plantly

## Introduction

API de la plateforme de pot connecté pour applications web et mobiles, avec un endpoint d’ingestion de télémétrie pour les pots IoT.

- URL de base (dev local) : `http://localhost:3000/api`
- Toutes les réponses sont en JSON.
- Les schémas détaillés sont disponibles dans Swagger à `/docs`.

## Authentification

- L’API utilise des jetons JWT d’accès (courte durée) et de rafraîchissement (plus longue).
- Envoyez le jeton d’accès via l’en-tête `Authorization`: `Authorization: Bearer <accessToken>`.
- L’invalidation des jetons est réalisée via `tokenVersion` sur l’utilisateur. Quand `tokenVersion` change (logout ou réinitialisation de mot de passe), tous les jetons émis précédemment deviennent invalides.

## Format des erreurs

Les erreurs sont normalisées par un filtre global d’exception. Exemples :

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": []
}
```

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Pot not found or not owned by user"
}
```

- Les erreurs de validation sont émises en `BadRequestException` avec le payload `{ type: "VALIDATION_ERROR", errors }` et transformées par le filtre en format JSON cohérent.
- Codes fréquents : `400` (requête invalide), `401` (non authentifié), `403` (interdit), `404` (introuvable), `500` (erreur interne).

## Auth

### POST /auth/register
- Authentification : aucune
- Objet : créer un compte utilisateur.
- Corps de requête :
```json
{
  "email": "user@example.com",
  "password": "Test1234!"
}
```
- Réponse (200/201) :
```json
{
  "accessToken": "xxx.yyy.zzz",
  "refreshToken": "aaa.bbb.ccc"
}
```
- Erreurs : 400 (email déjà utilisé, payload invalide)

### POST /auth/login
- Authentification : aucune
- Objet : connexion avec email et mot de passe.
- Corps de requête :
```json
{
  "email": "demo.user@example.com",
  "password": "Demo1234!"
}
```
- Réponse (200) : paire de jetons (même structure que register)
- Erreurs : 401 (identifiants invalides), 400 (payload invalide)

### POST /auth/refresh
- Authentification : aucune
- Objet : échanger un refresh token valide contre une nouvelle paire de jetons.
- Corps de requête :
```json
{
  "refreshToken": "aaa.bbb.ccc"
}
```
- Réponse (200) : paire de jetons
- Erreurs : 401 (refresh token invalide/expiré ou invalidé par tokenVersion), 400 (payload invalide)

### POST /auth/logout
- Authentification : Bearer token
- Objet : déconnecter l’utilisateur en invalidant tous les jetons via l’incrément de `tokenVersion`.
- Requête : en-tête `Authorization: Bearer <accessToken>`
- Réponse (200) :
```json
{ "status": "ok" }
```
- Erreurs : 401 (jeton manquant/invalide)

### POST /auth/forgot-password
- Authentification : aucune
- Objet : demander une réinitialisation de mot de passe (flux email à définir).
- Corps de requête :
```json
{ "email": "user@example.com" }
```
- Réponse (200) :
```json
{ "status": "ok" }
```
- Erreurs : 400 (payload invalide)

### POST /auth/reset-password
- Authentification : aucune
- Objet : réinitialiser le mot de passe via un token.
- Corps de requête :
```json
{
  "token": "reset-token",
  "newPassword": "NewPass123!"
}
```
- Réponse (200) :
```json
{ "status": "ok" }
```
- Erreurs : 400 (token invalide/expiré)

## Pots (appareils)

### GET /pots
- Authentification : Bearer token
- Objet : lister les pots de l’utilisateur.
- Réponse (200) :
```json
[
  {
    "id": "3f95d7f2-1111-4444-aaaa-bbbbbb111111",
    "name": "Mon Basilic",
    "deviceUid": "PLANT-ABC-001",
    "lastSeenAt": "2025-01-01T10:00:00Z",
    "globalStatus": "OK"
  }
]
```
- Erreurs : 401 (jeton manquant/invalide)

### GET /pots/:id
- Authentification : Bearer token
- Objet : obtenir les détails du pot, la plante active (si présente) et la dernière mesure.
- Réponse (200) :
```json
{
  "id": "3f95d7f2-1111-4444-aaaa-bbbbbb111111",
  "name": "Mon Basilic",
  "deviceUid": "PLANT-ABC-001",
  "lastSeenAt": "2025-01-01T10:00:00Z",
  "globalStatus": "ACTION_REQUIRED",
  "plant": {
    "id": "plant-01",
    "speciesId": 12,
    "nickname": "Basilou",
    "plantedAt": "2024-12-20T09:00:00Z",
    "status": "ACTIVE"
  },
  "latestMeasurement": {
    "timestamp": "2025-01-01T10:00:00Z",
    "soilMoisture": 42.5,
    "lightLevel": 650,
    "temperature": 21.1
  }
}
```
- Erreurs : 404 (pot introuvable ou non possédé), 401 (jeton manquant/invalide)

### POST /pots/link
- Authentification : Bearer token
- Objet : lier de façon sécurisée un appareil provisionné à l’utilisateur (pairage à usage unique).
- Corps de requête :
```json
{
  "deviceUid": "PLANT-ABC-001",
  "pairingCode": "123456",
  "name": "Mon Basilic",
  "speciesId": 12,
  "plantNickname": "Basilou"
}
```
- Réponse (200) : détails du pot (même structure que GET /pots/:id)
- Erreurs : 404 (UID inconnu), 400 (appareil déjà appairé ou code invalide), 401 (jeton manquant/invalide)

## Mesures

### GET /pots/:potId/measurements
- Authentification : Bearer token
- Objet : lister les mesures du pot.
- Paramètres de requête : `from` (ISO 8601), `to` (ISO 8601), `limit` (entier, défaut 100)
- Réponse (200) :
```json
[
  { "timestamp": "2025-01-01T10:00:00Z", "soilMoisture": 40.2, "lightLevel": 700, "temperature": 20.5 },
  { "timestamp": "2025-01-01T09:00:00Z", "soilMoisture": 38.9, "lightLevel": 680, "temperature": 20.1 }
]
```
- Erreurs : 404 (pot introuvable ou non possédé), 401 (jeton manquant/invalide), 400 (requête invalide)

### GET /pots/:potId/measurements/latest
- Authentification : Bearer token
- Objet : obtenir la dernière mesure du pot.
- Réponse (200) : objet de mesure ou `null`.
- Erreurs : 404 (pot introuvable ou non possédé), 401 (jeton manquant/invalide)

## Wiki (plantes)

### GET /wiki/plants?search=...
- Authentification : aucune
- Objet : lister/rechercher des espèces de plantes.
- Réponse (200) :
```json
[
  { "id": 12, "commonName": "Basilic", "latinName": "Ocimum basilicum", "descriptionShort": "Plante aromatique facile à cultiver." }
]
```

### GET /wiki/plants/:id
- Authentification : aucune
- Objet : obtenir le détail d’une espèce avec ses conseils de soins.
- Réponse (200) :
```json
{
  "id": 12,
  "commonName": "Basilic",
  "latinName": "Ocimum basilicum",
  "descriptionShort": "Plante aromatique.",
  "imageUrl": "https://cdn.example/plants/basil.jpg",
  "care": {
    "minMoisture": 30,
    "maxMoisture": 70,
    "minLight": 200,
    "maxLight": 1000,
    "wateringIntervalDays": 3,
    "recommendedTemperatureMin": 18,
    "recommendedTemperatureMax": 26,
    "careTips": "Gardez le sol légèrement humide."
  }
}
```
- Erreurs : 404 (introuvable)

## Succès (achievements)

### GET /me/achievements
- Authentification : Bearer token
- Objet : lister les succès avec l’état de déverrouillage de l’utilisateur.
- Réponse (200) :
```json
[
  {
    "id": 1,
    "code": "FIRST_PLANT",
    "title": "Première plante",
    "description": "Créez votre première plante.",
    "category": "getting_started",
    "icon": "seedling",
    "unlocked": true,
    "unlockedAt": "2024-12-15T10:00:00Z"
  },
  {
    "id": 2,
    "code": "PERFECT_WEEK",
    "title": "Semaine parfaite",
    "description": "Maintenez des conditions idéales pendant une semaine entière.",
    "category": "care",
    "icon": "trophy",
    "unlocked": false,
    "unlockedAt": null
  }
]
```
- Erreurs : 401 (jeton manquant/invalide)

### GET /achievements
- Authentification : aucune
- Objet : lister toutes les définitions de succès (sans état de déverrouillage).
- Réponse (200) : tableau de succès avec `unlocked: false`.

## Alertes

### GET /pots/:potId/alerts
- Authentification : Bearer token
- Objet : lister les alertes d’un pot.
- Paramètres de requête : `onlyUnresolved` (booléen)
- Réponse (200) :
```json
[
  {
    "id": "alert-1",
    "deviceId": "device-1",
    "plantInstanceId": "plant-1",
    "type": "OTHER",
    "severity": "WARNING",
    "createdAt": "2025-01-01T10:00:00Z",
    "resolvedAt": null
  }
]
```
- Erreurs : 401 (jeton manquant/invalide), 404 (pot introuvable ou non possédé)

### PATCH /pots/:potId/alerts/:id/resolve
- Authentification : Bearer token
- Objet : résoudre une alerte.
- Réponse (200) : `{ "status": "ok" }`
- Erreurs : 401 (jeton manquant/invalide), 404 (alerte introuvable), 403 (alerte non possédée par l’utilisateur)

## Télémétrie (IoT)

### POST /device/telemetry
- Authentification : pas de JWT ; sécurisé via des en-têtes de signature HMAC.
- Objet : ingérer la télémétrie d’un appareil/pot physique.
- En-têtes :
  - `X-DEVICE-UID` : UID du device
  - `X-DEVICE-TIMESTAMP` : ISO8601 ou epoch (ms)
  - `X-DEVICE-SIGNATURE` : signature HMAC SHA-256
- Corps :
```json
{
  "timestamp": "2025-01-01T10:00:00Z",
  "soilMoisture": 42.5,
  "lightLevel": 650,
  "temperature": 21.1,
  "batteryLevel": 88
}
```
- Réponse (200) : `{ "status": "ok" }`
- Concept de signature : le client calcule `HMAC_SHA256( JSON.stringify(body) + headerTimestamp, deviceSecret )`. Le serveur valide la signature et la dérive temporelle. La gestion du secret est interne/TODO ; la vérification est structurée pour la production.
- Erreurs : 401 (device inconnu ou signature invalide ou dérive temporelle), 400 (payload/timestamp invalide)

## Provisionnement du device (admin, interne)

### POST /devices/provision
- Authentification : interne/admin uniquement (pas encore de guard ; TODO protéger en production).
- Objet : provisionner un device avec un code d’appairage pour un pairage sécurisé ultérieur par l’utilisateur.
- Corps de requête :
```json
{
  "deviceUid": "PLANT-ABC-001",
  "name": "Pot de cuisine"
}
```
- Réponse (200) :
```json
{
  "deviceUid": "PLANT-ABC-001",
  "pairingCode": "123456",
  "name": "Pot de cuisine"
}
```
- Erreurs : 400 (UID déjà existant)

---

Pour les schémas complets, consultez Swagger à `/docs`.
