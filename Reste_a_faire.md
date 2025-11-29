Ce qu’il reste à faire côté code (par priorité)

Ce que tu n’as pas encore, et qui est essentiel si tu veux un projet solide, pas juste un TP un peu sexy.

2.1. Backend – MUST HAVE (avant d’appeler ça un MVP propre)

Wiki réel (pas mock)

Ajouter des tables PlantSpecies / PlantCare dans Prisma, ou un schéma séparé, et brancher WikiService dessus.

Intégrer au moins quelques espèces avec de vrais seuils pour pouvoir calculer globalStatus correctement.

GlobalStatus sérieux

Dans DevicesService.computeGlobalStatus :

récupérer PlantInstance active + speciesId

récupérer les paramètres de care du wiki (min/max moisture, min/max light)

baser le calcul sur ça, plus :

le temps depuis la dernière mesure

éventuellement le nombre / type d’alertes actives

Actuellement, tu as des thresholds génériques → c’est acceptable pour démarrer, mais ce n’est pas “intelligent”.

Pairing sécurisé des devices
Pour l’instant :

linkPotToUser fait un truc très simplifié, sans vrai contrôle de sécurité.
Ce qui manque :

un champ pairingCode ou équivalent côté Device (ou une table de DeviceProvisioning)

une procédure claire :

l’admin / backend enregistre un device avec deviceUid + pairingCode généré

l’utilisateur saisit ce code pour lier le pot

idéalement, une séparation entre deviceSecret (utilisé par la carte) et pairingCode (utilisé par l’utilisateur).

Tant que tu n’as pas ça, n’importe qui sachant un deviceUid pourrait usurper un pot.

API IoT pour la télémétrie (côté backend)
Tu l’as différée, mais côté code backend, tu dois au moins définir le contrat, même si la carte n’est pas encore là :

Endpoint(s) type :

POST /device/telemetry

headers avec deviceUid + signature HMAC

payload: mesures + timestamp + niveau batterie

Service qui :

vérifie la signature avec deviceSecret

crée un SensorReading

met à jour Device.lastSeenAt

déclenche éventuellement des Alert

C’est indispensable pour que tout ce que tu as fait (measurements, globalStatus, alerts) serve à quelque chose.

Module alerts réel
Pour l’instant, les alertes sont juste un modèle et un module quasi vide.

À faire :

logique de création d’alertes lors de la réception de nouvelles mesures (dans le service IoT)

logique pour marquer les alertes comme résolues (quand la mesure redevient OK, ou quand l’utilisateur “acknowledge”)

endpoints :

GET /pots/:id/alerts

éventuellement PATCH /alerts/:id/resolve

Auth hardening
Aujourd’hui :

pas de gestion de sessions / refresh tokens persistés,

logout est un no-op,

forgot-password / reset-password sont des stubs.

À faire si tu veux quelque chose de sérieux (même académique) :

créer une table type UserSession / RefreshToken pour tracer les refresh tokens (ou au moins un tokenVersion)

implémenter :

invalidation de refresh token à logout

invalidation à reset-password

implémenter vraiment :

génération d’un token de reset

table PasswordResetToken ou champ temporaire

endpoint reset-password qui :

vérifie le token

change le mot de passe

invalide les sessions existantes

2.2. Backend – NICE TO HAVE (mais très recommandés)

Validation & erreurs uniformisées

Vérifier que tous les DTOs ont des class-validator là où il faut.

Ajouter un GlobalExceptionFilter pour :

standardiser le format des erreurs (code / message / details)

Ajouter un ValidationPipe global (whitelist: true, forbidNonWhitelisted: true) dans main.ts.

Tests
Pour l’instant tu as au mieux un test Jest trivial. Concrètement, tu n’as rien.

Minimum sérieux :

tests unitaires sur :

AuthService (register/login/refresh avec des mocks du PrismaService)

DevicesService.computeGlobalStatus avec différents cas de mesures

tests d’intégration simples sur :

POST /auth/register, POST /auth/login

GET /pots (avec un user et quelques devices/mesures seedées)

Scripts de seed

Script Node/Nest pour :

insérer les Achievement de base

insérer quelques espèces dans le wiki

Optionnel : créer un user de test + quelques pots + quelques mesures.

Config & env propres

.env.development, .env.production

Docker Compose avec backend + postgres + (plus tard) un broker MQTT si tu y vas.

Scripts npm run dev, npm run migrate, npm run seed, etc.

2.3. Frontend / Mobile

Même si tu m’as demandé côté “code” et qu’on s’est concentré sur le backend, tu ne peux pas ignorer ce qui suit :

Web (Vue)

structurer au minimum :

écran login/register

dashboard des pots (GET /pots)

détail pot (GET /pots/:id, mesures, status)

écran achievements (GET /me/achievements)

écran wiki (liste + détail plante)

gérer proprement le stockage du JWT (access + refresh) + refresh automatique.

Mobile (Android)

Ton job, en tant que “backend owner”, c’est de livrer une API claire.

Tu dois au moins écrire une vraie doc d’API (même si Swagger existe) :

endpoints

exemples de requêtes / réponses

scénarios: inscription, ajout pot, consultation, etc.