# Connexion Arduino -> Backend

Ce document détaille les étapes pour connecter votre projet ESP32 au Backend NestJS.

## 1. Modifications Backend (Déjà appliquées)

Le Backend a été mis à jour pour accepter les données de télémétrie sans signature HMAC (pour le prototypage).
- **Nouvel Endpoint :** `POST /api/device/telemetry/simple`
- **Format JSON attendu :**
  ```json
  {
    "baseUid": "VOTRE_BASE_UID",
    "slotIndex": 1,
    "soilMoisture": 50,
    "lightLevel": 1000,
    "temperature": 25.5,
    "airHumidity": 60.0,
    "timestamp": "2023-10-10T10:00:00Z"
  }
  ```
- **Base de données :** Le champ `airHumidity` a été ajouté aux tables de mesures.

## 2. Modifications Arduino (`Plantly.ino`)

Veuillez appliquer les changements suivants dans votre fichier `Plantly.ino`.

### A. Ajouter l'include
En haut du fichier :
```cpp
#include <HTTPClient.h>
```

### B. Configuration Backend
Ajoutez ces constantes (ajustez l'IP selon votre serveur/PC) :
```cpp
// ====== CONFIGURATION BACKEND ======
const char* backendUrl = "http://192.168.1.100:3000/api/device/telemetry/simple"; // Mettez l'IP de votre serveur
const char* myBaseUid  = "BASE_TEST_01"; // Doit correspondre à une BaseDevice en BDD
```

### C. Fonction d'envoi
Ajoutez cette fonction avant le `loop()` :

```cpp
void sendTelemetryToBackend() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(backendUrl);
  http.addHeader("Content-Type", "application/json");

  // On récupère l'heure actuelle
  struct tm t;
  String timeStr = "";
  if(getLocalTime(&t)){
    char buf[32];
    // Format ISO 8601 simple
    strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &t);
    timeStr = String(buf);
  }

  // Boucle sur les 4 pots
  for (int i = 0; i < 4; i++) {
    // Si pas de données valides (ex: 0%), on peut choisir de ne pas envoyer, 
    // ou envoyer quand même. Ici on envoie tout.
    
    String json = "{";
    json += "\"baseUid\":\"" + String(myBaseUid) + "\",";
    json += "\"slotIndex\":" + String(i + 1) + ",";
    json += "\"soilMoisture\":" + String(soilPct[i]) + ",";
    json += "\"lightLevel\":" + String(luxValue) + ",";
    if (!isnan(airTempC)) json += "\"temperature\":" + String(airTempC) + ",";
    if (!isnan(airRH))    json += "\"airHumidity\":" + String(airRH) + ",";
    if (timeStr.length()) json += "\"timestamp\":\"" + timeStr + "\"";
    else                  json += "\"timestamp\":\"\""; // Le backend mettra l'heure actuelle
    json += "}";

    int httpResponseCode = http.POST(json);
    
    if (httpResponseCode > 0) {
      Serial.printf("Pot %d sent: %d\n", i+1, httpResponseCode);
    } else {
      Serial.printf("Error sending pot %d: %s\n", i+1, http.errorToString(httpResponseCode).c_str());
    }
    // Petit délai pour ne pas spammer
    delay(100);
  }
  
  http.end();
}
```

### D. Appel dans le `loop()`
Ajoutez un timer pour envoyer les données toutes les 5 ou 10 minutes.

Dans les variables globales :
```cpp
unsigned long lastBackendSendMs = 0;
const unsigned long SEND_INTERVAL_MS = 300000; // 5 minutes
```

Dans la fonction `loop()`, ajoutez :
```cpp
  // Envoi vers Backend périodique
  if (!configMode && WiFi.status() == WL_CONNECTED && millis() - lastBackendSendMs >= SEND_INTERVAL_MS) {
    lastBackendSendMs = millis();
    sendTelemetryToBackend();
  }
```

## 3. Pré-requis Base de Données

✅ **Fait :** Une base de test a été créée automatiquement.
- **Base UID :** `BASE_TEST_01`
- **Slots :** 1 à 4 (pour vos 4 pots)

Si vous avez besoin de recréer cette base manuellement, vous pouvez relancer la commande :
`npx prisma db seed` (dans le dossier backend)

## 4. Points Importants à ne pas oublier

### ⚠️ Adresse IP du Serveur
Dans le code Arduino ci-dessus, la ligne suivante **DOIT** être modifiée :
```cpp
const char* backendUrl = "http://192.168.1.100:3000/api/device/telemetry/simple";
```
Remplacez `192.168.1.100` par l'adresse IP locale de votre ordinateur (où tourne le backend).
Pour trouver votre IP :
- **Windows :** Ouvrez un terminal, tapez `ipconfig` (cherchez IPv4 Address).
- **Mac/Linux :** Tapez `ifconfig` ou `ip a`.

### ⚠️ Réseau WiFi
Assurez-vous que votre ESP32 et votre ordinateur sont sur le **même réseau WiFi**. Si l'ordinateur est en filaire et l'ESP32 en WiFi sur une box différente, ça ne marchera pas.

### ⚠️ Firewall
Si l'ESP32 n'arrive pas à se connecter, vérifiez que le pare-feu (Windows Firewall) de votre ordinateur autorise les connexions entrantes sur le port **3000**.

