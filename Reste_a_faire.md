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









2. Wiki plantes + images
2.1. Ce qui existe

Modèles PlantSpecies + PlantCare

Seed avec des plantes, paramètres d’arrosage, lumière, température

API /wiki/plants et /wiki/plants/:id

Front : liste + détail + care qui s’affichent

2.2. Ce qui manque / partiel

Système d’images :

Tant que tu n’as pas effectivement ajouté useStaticAssets + un dossier public/plants + imageUrl renseignés dans la seed, tes images ne s’affichent pas.

Pas de CRUD wiki :

Pas de back-office pour ajouter / modifier les plantes par l’interface. Tout est seed ou BD manuelle.

Pas de gestion de localisation / langue (noms, descriptions en FR/EN).

Ce n’est pas bloquant, mais ce n’est pas “complet”.

3. Gestion des plantes sur un pot (NewPlantView)

Frontend :

Vue /pots/:id/new-plant existe.

Tu as un début de formulaire avec un select d’espèces (wiki) + nickname.

Backend :

Aujourd’hui, sauf si tu as ajouté un endpoint spécifique, tu n’as pas de route propre pour :

changer la plante d’un pot existant,

ou assigner une nouvelle plante après coup.

Tu as seulement :

/pots/link qui lie pot + user + éventuellement plante à la création.

Donc concrètement :

Le bouton “associer une plante” / “changer de plante” sur un pot est, pour l’instant, une coquille vide :

pas d’endpoint dédié,

pas de logique dans le service,

et donc pas de persistance réelle de cette action.

4. Authentification / sécurité
4.1. Ce qui est en place (en théorie)

Auth avec JWT (access + refresh)

Endpoints /auth/login, /auth/register, /auth/refresh, /auth/logout

Front : Login / Register fonctionnels

Un design prévu pour tokenVersion (= invalidation globale des tokens)

4.2. Ce qui n’est pas complètement verrouillé

À moins que tu aies rigoureusement appliqué le prompt sur tokenVersion :

Le logout est probablement encore “stateless” (on balance juste le token côté client, mais rien n’est invalidé côté serveur).

Les anciens refreshToken restent utilisables tant qu’ils n’ont pas expiré → pas de vrai logout global.

forgot-password / reset-password :

Tu as probablement des endpoints “coquille” (ou rien du tout),

mais pas de vrai flux complet :

pas de token de reset généré et stocké,

pas d’expiration,

pas d’email envoyé,

pas de logique robuste comme on l’a seulement décrit.

Donc côté sécurité auth : pour un projet d’école, OK. Pour un produit sérieux, incomplet.

5. IoT / télémétrie
5.1. Ce qui existe

Endpoint /device/telemetry pour recevoir les mesures

Stockage dans SensorReading

Mise à jour lastSeenAt

computeGlobalStatus pour déterminer OK / ACTION_REQUIRED / BAD

Logique d’alertes basique connectée à la télémétrie

5.2. Ce qui n’est pas bouclé

Sécurité IoT :

On a prévu headers X-DEVICE-UID, X-DEVICE-TIMESTAMP, X-DEVICE-SIGNATURE.

Mais tant que tu n’as pas :

un vrai secret IoT par device,

une HMAC vérifiée,

une gestion d’horodatage (replay attack),

ce n’est pas vraiment sécurisé, c’est un “pseudo-API” facile à spoof.

OFFLINE / statut non connecté :

On a parlé de statut OFFLINE basé sur lastSeenAt + job CRON.

Tu n’as pas mis de tâche périodique qui :

vérifie quels devices sont inactifs depuis X minutes/heures,

crée/maj une alerte “OFFLINE”.

Gestion temps réel :

Pas de WebSockets / SSE pour pousser les alertes en live au front.

Tout se fait en polling (ce qui est ok pour un premier projet, mais pas “live”).

6. Frontend – parties non fonctionnelles / peu exploitées
6.1. Non implémenté ou quasi vide

Page Scan (/scan) :

C’est un placeholder. Pas de vraie logique (pas de caméra, pas de vision).

Page Tutoriels :

Texte statique, pas de contenu structuré ou backend.

Page Historique (/profile/history) :

Pas de vraie API branchée pour historiser actions, alertes, logs utilisateur.

Page Settings / notifications :

UI présente, mais pas reliée à une vraie configuration en base (pas de modèle NotificationSettings, pas d’enregistrement des préférences).

6.2. UX

Pas de gestion propre des états d’erreur globaux (ex : token expiré → redirect / relog automatique).

Pas de loader global / skeleton pour les pages importantes (seulement des “Chargement…” texte).

Pas de pagination / filtrage avancé (wiki, mesures) → pour l’instant c’est brut.

7. DevOps / Qualité

Docker :

Tu as un conteneur pour la DB.

Le backend complet en container (image + service dans docker-compose) : on en a parlé, mais pas décrit en détail ni forcément mis en place.

Tests :

Pratiquement aucun test unitaire / d’intégration.

Tu n’as aucun garde-fou pour éviter de casser un endpoint en modifiant un service.

Monitoring / logs :

Pas de stratégie de logs structurés (niveau, format JSON, externalisation).

Pas de métriques.

8. Résumé brutal

Tu as :

Une architecture backend bien pensée et largement codée.

Un front qui couvre les grandes user stories (auth, pots, wiki, succès, vues).

Un système d’alertes fonctionnel en première approximation.

Mais tu n’as PAS encore :

Un système de succès réellement vivant (détection d’événements, progression, déblocage dynamique).

Un flux complet de gestion de plantes sur un pot (NewPlantView + endpoint backend dédié).

Une sécurité complète côté auth (logout/invalidations & reset password béton) et IoT (HMAC réel).

Des pages front comme Scan / Tutoriels / Historique / Settings réellement branchées à un backend structuré.

Une stack testée, conteneurisée entièrement, monitorée.