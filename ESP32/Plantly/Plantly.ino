#include <WiFi.h>
#include <WebServer.h>
#include "time.h"

// ====== CONFIGURATION WIFI ======
const char* ssid     = "Matthieu";
const char* password = "Matthieu12!";

// ====== CONFIGURATION NTP (HEURE) ======
const char* ntpServer = "pool.ntp.org";
const char* tzInfo = "CET-1CEST,M3.5.0/2,M10.5.0/3";

// ====== UART2 vers STM32 ======
static const int UART_RX = 16; // STM32 TX -> ESP32 RX
static const int UART_TX = 17; // ESP32 TX -> STM32 RX

// ====== Web Server ======
WebServer server(80);

// ====== Timing ======
unsigned long lastSendMs    = 0;
unsigned long lastSendIpMs  = 0;

// ====== Valeurs reçues depuis STM32 ======
volatile int   soilPct[4] = {0,0,0,0};   // SOIL1..SOIL4
volatile int   soilAdc[4] = {0,0,0,0};   // ADC1..ADC4 (optionnel)
volatile float airTempC   = NAN;         // TEMP=23.4
volatile float airRH      = NAN;         // AIRH=50.3
volatile int   luxValue   = 0;           // LUX=123 (si tu l'envoies)

// ====== Suivi de l'IP pour la STM32 ======
String lastIpSent = "0.0.0.0";
bool ipEverSent = false;

// ------------------ INTERFACE WEB (HTML) ------------------
static const char HTML_PAGE[] PROGMEM = R"rawliteral(
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>PLANTLY</title>
  <style>
    :root{
      --bg:#dfeee6;
      --card:#e7f5ee;
      --card2:#e3f1ea;
      --shadow: 0 12px 26px rgba(0,0,0,.18);
      --text:#0a1f12;
      --muted: rgba(10,31,18,.7);

      --pill:#eef7f2;
      --pill2:#e3f1ea;

      --green1:#b9f0b5;
      --green2:#7fcf7a;

      --barTrack:#31454e;
      --barFill:#f1b12c;
      --borderSoft: rgba(255,255,255,.55);
    }

    *{box-sizing:border-box;font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial;}
    body{
      margin:0;
      background: var(--bg);
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      padding:18px;
      color:var(--text);
    }

    /* grosse carte centrale comme sur ta capture */
    .wrap{
      width:min(1100px,100%);
      background: rgba(231,245,238,.92);
      border-radius:24px;
      padding:22px 22px 26px;
      box-shadow: var(--shadow);
      position:relative;
      overflow:hidden;
      border:1px solid rgba(255,255,255,.55);
    }

    /* petit effet "feuilles" en CSS (proche visuel TouchGFX) */
    .wrap:before{
      content:"";
      position:absolute; inset:-80px;
      background:
        radial-gradient(closest-side at 20% 20%, rgba(46,125,50,.10), transparent 60%),
        radial-gradient(closest-side at 80% 30%, rgba(0,150,136,.08), transparent 55%),
        radial-gradient(closest-side at 30% 85%, rgba(76,175,80,.08), transparent 60%),
        radial-gradient(closest-side at 85% 80%, rgba(33,150,243,.05), transparent 60%);
      filter: blur(0px);
      pointer-events:none;
    }

    .content{position:relative;}

    .title{
      text-align:center;
      font-size:56px;
      font-weight:1000;
      letter-spacing:2px;
      margin:0 0 12px 0;
      text-transform:uppercase;
    }

    .tabs{
      display:flex;
      gap:12px;
      justify-content:center;
      flex-wrap:wrap;
      margin:8px 0 18px;
    }

    .tab{
      cursor:pointer;
      user-select:none;
      padding:10px 16px;
      border-radius:999px;
      background: rgba(255,255,255,.65);
      border:1px solid rgba(0,0,0,.08);
      box-shadow: 0 8px 16px rgba(0,0,0,.10);
      font-weight:900;
      opacity:.75;
      transition: .15s ease;
    }
    .tab:hover{transform: translateY(-1px); opacity:.9;}
    .tab.active{
      opacity:1;
      background: linear-gradient(180deg,var(--green1),var(--green2));
    }

    .view{display:none;}
    .view.active{display:block;}

    /* HOME layout */
    .main{
      display:grid;
      grid-template-columns: 1.1fr .9fr;
      gap:18px;
      align-items:stretch;
      margin-top:6px;
    }

    .left{
      display:flex;
      flex-direction:column;
      gap:12px;
      padding:6px 6px 6px 2px;
    }

    .pill{
      display:flex;
      align-items:center;
      justify-content:space-between;
      border-radius:999px;
      padding:14px 18px;
      background: rgba(255,255,255,.55);
      border:1px solid rgba(0,0,0,.08);
      box-shadow: 0 10px 18px rgba(0,0,0,.10);
      font-size:20px;
      font-weight:900;
    }

    .label{display:flex;align-items:center;gap:12px;}
    .icon{
      width:40px;height:40px;border-radius:50%;
      background: rgba(255,255,255,.55);
      display:flex;align-items:center;justify-content:center;
      box-shadow: inset 0 0 0 2px rgba(255,255,255,.55);
      font-size:20px;
    }
    .value{font-weight:1000;min-width:90px;text-align:right;}

    .rightBox{
      background: rgba(255,255,255,.55);
      border: 4px solid rgba(30,59,71,.55);
      border-radius:18px;
      box-shadow: 0 12px 22px rgba(0,0,0,.12);
      padding:16px;
      display:flex;
      flex-direction:column;
      justify-content:center;
      gap:8px;
    }

    .clock{font-size:38px;font-weight:1000;text-align:center;letter-spacing:1px;}
    .date{font-size:20px;font-weight:900;text-align:center;opacity:.95;}
    .ip{margin-top:8px;font-size:13px;text-align:center;opacity:.75;}

    /* POT layout (proche TouchGFX) */
    .potCard{
      background: rgba(232,248,239,.88);
      border-radius:18px;
      padding:18px;
      border:1px solid rgba(255,255,255,.65);
      box-shadow: 0 12px 22px rgba(0,0,0,.12);
      max-width: 900px;
      margin: 0 auto;
      position:relative;
      overflow:hidden;
    }

    .potCard:before{
      content:"";
      position:absolute; inset:-70px;
      background:
        radial-gradient(closest-side at 15% 35%, rgba(76,175,80,.10), transparent 60%),
        radial-gradient(closest-side at 85% 30%, rgba(0,150,136,.09), transparent 55%),
        radial-gradient(closest-side at 70% 85%, rgba(33,150,243,.05), transparent 60%);
      pointer-events:none;
    }

    .potInner{position:relative;}

    .potTitle{
      text-align:center;
      font-size:34px;
      font-weight:1000;
      margin:6px 0 12px;
      letter-spacing:1px;
      text-transform:uppercase;
    }

    .plantRow{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      margin: 8px 0 12px;
    }
    .plantLabel{
      font-size:20px;
      font-weight:900;
      opacity:.95;
    }
    .plantIcon{
      width:54px;height:54px;border-radius:50%;
      background: rgba(255,255,255,.65);
      display:flex;align-items:center;justify-content:center;
      box-shadow: 0 10px 18px rgba(0,0,0,.12), inset 0 0 0 2px rgba(255,255,255,.75);
      font-size:26px;
      flex: 0 0 auto;
    }

    .humLabel{
      font-size:18px;
      font-weight:900;
      margin-top: 6px;
      opacity:.95;
    }

    .barWrap{
      width:100%;
      height:14px;
      border-radius:999px;
      background: var(--barTrack);
      overflow:hidden;
      box-shadow: inset 0 0 0 1px rgba(0,0,0,.20);
      margin-top: 8px;
    }
    .bar{
      height:100%;
      width:0%;
      background: var(--barFill);
      border-radius:999px;
      transition: width .25s ease;
    }

    .bottomRow{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:12px;
      margin-top: 12px;
      font-weight:900;
      color: var(--muted);
    }
    .pct{
      font-weight:1000;
      color: var(--text);
      opacity: 1;
    }

    @media (max-width:820px){
      .title{font-size:42px;}
      .main{grid-template-columns:1fr;}
      .clock{font-size:32px;}
    }
  </style>
</head>

<body>
  <div class="wrap">
    <div class="content">
      <div class="title">PLANTLY</div>

      <div class="tabs">
        <div class="tab active" data-view="home">Home</div>
        <div class="tab" data-view="pot1">Pot 1</div>
        <div class="tab" data-view="pot2">Pot 2</div>
        <div class="tab" data-view="pot3">Pot 3</div>
        <div class="tab" data-view="pot4">Pot 4</div>
      </div>

      <!-- HOME -->
      <div id="home" class="view active">
        <div class="main">
          <div class="left">
            <div class="pill">
              <div class="label"><div class="icon">🌡️</div>Température air :</div>
              <div class="value" id="temp">--</div>
            </div>
            <div class="pill">
              <div class="label"><div class="icon">☁️</div>Humidité air :</div>
              <div class="value" id="airh">--</div>
            </div>
            <div class="pill">
              <div class="label"><div class="icon">💡</div>Luminosité :</div>
              <div class="value" id="lum">--</div>
            </div>
          </div>

          <div class="rightBox">
            <div class="clock" id="clock">--:--:--</div>
            <div class="date" id="date">--</div>
            <div class="ip" id="ip">IP: ...</div>
          </div>
        </div>
      </div>

      <!-- POTS -->
      <div id="pot1" class="view">
        <div class="potCard">
          <div class="potInner">
            <div class="potTitle">POT 1</div>

            <div class="plantRow">
              <div class="plantLabel">Type de plante :</div>
              <div class="plantIcon">🪴</div>
            </div>

            <div class="humLabel">Humidité :</div>
            <div class="barWrap"><div class="bar" id="p1bar"></div></div>

            <div class="bottomRow">
              <div>Dernier arrosage</div>
              <div class="pct" id="p1txt">0%</div>
            </div>
          </div>
        </div>
      </div>

      <div id="pot2" class="view">
        <div class="potCard">
          <div class="potInner">
            <div class="potTitle">POT 2</div>
            <div class="plantRow">
              <div class="plantLabel">Type de plante :</div>
              <div class="plantIcon">🪴</div>
            </div>
            <div class="humLabel">Humidité :</div>
            <div class="barWrap"><div class="bar" id="p2bar"></div></div>
            <div class="bottomRow">
              <div>Dernier arrosage</div>
              <div class="pct" id="p2txt">0%</div>
            </div>
          </div>
        </div>
      </div>

      <div id="pot3" class="view">
        <div class="potCard">
          <div class="potInner">
            <div class="potTitle">POT 3</div>
            <div class="plantRow">
              <div class="plantLabel">Type de plante :</div>
              <div class="plantIcon">🪴</div>
            </div>
            <div class="humLabel">Humidité :</div>
            <div class="barWrap"><div class="bar" id="p3bar"></div></div>
            <div class="bottomRow">
              <div>Dernier arrosage</div>
              <div class="pct" id="p3txt">0%</div>
            </div>
          </div>
        </div>
      </div>

      <div id="pot4" class="view">
        <div class="potCard">
          <div class="potInner">
            <div class="potTitle">POT 4</div>
            <div class="plantRow">
              <div class="plantLabel">Type de plante :</div>
              <div class="plantIcon">🪴</div>
            </div>
            <div class="humLabel">Humidité :</div>
            <div class="barWrap"><div class="bar" id="p4bar"></div></div>
            <div class="bottomRow">
              <div>Dernier arrosage</div>
              <div class="pct" id="p4txt">0%</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>

<script>
function setActive(view){
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.view===view));
  document.querySelectorAll('.view').forEach(v=>v.classList.toggle('active', v.id===view));
}
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click', ()=>setActive(t.dataset.view));
});

function pctToWidth(p){ return Math.max(0, Math.min(100, p)) + "%"; }

async function refresh(){
  try{
    const r = await fetch('/api/state', {cache:"no-store"});
    const j = await r.json();

    document.getElementById('clock').textContent = j.time;
    document.getElementById('date').textContent  = j.date;
    document.getElementById('ip').textContent    = "IP: " + j.ip;

    document.getElementById('temp').textContent  = j.temp;
    document.getElementById('airh').textContent  = j.airh;
    document.getElementById('lum').textContent   = j.lux;

    document.getElementById('p1txt').textContent = j.p1;
    document.getElementById('p2txt').textContent = j.p2;
    document.getElementById('p3txt').textContent = j.p3;
    document.getElementById('p4txt').textContent = j.p4;

    document.getElementById('p1bar').style.width = pctToWidth(j.p1n);
    document.getElementById('p2bar').style.width = pctToWidth(j.p2n);
    document.getElementById('p3bar').style.width = pctToWidth(j.p3n);
    document.getElementById('p4bar').style.width = pctToWidth(j.p4n);

  }catch(e){}
}
setInterval(refresh, 1000);
refresh();
</script>
</body>
</html>
)rawliteral";

// ------------------ UTILS ------------------
String two(int v){ return (v<10) ? ("0"+String(v)) : String(v); }

String monthFR(int m){
  static const char* months[] = {
    "janvier","février","mars","avril","mai","juin",
    "juillet","août","septembre","octobre","novembre","décembre"
  };
  if(m<1 || m>12) return "???";
  return months[m-1];
}

static void sendIpToSTM32(const String& ip) {
  Serial2.print("IP=");
  Serial2.print(ip);
  Serial2.print("\n");
  Serial.print("[UART] -> STM32 : IP=");
  Serial.println(ip);
}

static int clampPct(int v){
  if(v < 0) return 0;
  if(v > 100) return 100;
  return v;
}

// ----------- PARSING : token "KEY=VALUE" -----------
static void parseToken(String token){
  token.trim();
  if(token.length() == 0) return;

  // Debug console
  Serial.println("TOK: " + token);

  // SOIL1..SOIL4
  if(token.startsWith("SOIL")){
    // ex: SOIL1=45
    int eq = token.indexOf('=');
    if(eq < 0) return;
    int idxCharPos = 4; // '1' dans SOIL1
    if(token.length() <= idxCharPos) return;
    int potIdx = token.charAt(idxCharPos) - '1'; // 0..3
    if(potIdx < 0 || potIdx > 3) return;
    int v = clampPct(token.substring(eq+1).toInt());
    soilPct[potIdx] = v;
    return;
  }

  // ADC1..ADC4
  if(token.startsWith("ADC")){
    int eq = token.indexOf('=');
    if(eq < 0) return;
    int idxCharPos = 3;
    if(token.length() <= idxCharPos) return;
    int potIdx = token.charAt(idxCharPos) - '1';
    if(potIdx < 0 || potIdx > 3) return;
    soilAdc[potIdx] = token.substring(eq+1).toInt();
    return;
  }

  // TEMP
  if(token.startsWith("TEMP=")){
    airTempC = token.substring(5).toFloat();
    return;
  }

  // AIRH
  if(token.startsWith("AIRH=")){
    airRH = token.substring(5).toFloat();
    return;
  }

  // LUX
  if(token.startsWith("LUX=")){
    luxValue = token.substring(4).toInt();
    if(luxValue < 0) luxValue = 0;
    return;
  }

  // (optionnel) ancien format Humidite:
  if(token.startsWith("Humidite:")){
    int colon = token.indexOf(':');
    int percentPos = token.indexOf('%');
    if (colon >= 0 && percentPos > colon) {
      String v = token.substring(colon + 1, percentPos);
      v.trim();
      soilPct[0] = clampPct(v.toInt());
    }
    int adcPos = token.indexOf("adc=");
    if (adcPos >= 0) {
      String a = token.substring(adcPos + 4);
      a.replace(")", ""); a.trim();
      soilAdc[0] = a.toInt();
    }
    return;
  }
}

// ----------- Parse line : split par ';' -----------
// ----------- Parse line : split par ';' ET '|' -----------
static void parseLine(String line){
  line.replace("\r", "");
  line.trim();
  if(line.length() == 0) return;

  Serial.println("STM32 -> " + line);

  // ✅ IMPORTANT : ton main.c envoie " ... ; ... | ... ; ... | ... "
  // On convertit les séparateurs '|' en ';' pour que chaque token soit bien parsé
  line.replace("|", ";");

  // Split par ';'
  int start = 0;
  while(true){
    int sep = line.indexOf(';', start);
    if(sep < 0){
      String tok = line.substring(start);
      parseToken(tok);
      break;
    }else{
      String tok = line.substring(start, sep);
      parseToken(tok);
      start = sep + 1;
    }
  }
}

// ------------------ WEB HANDLERS ------------------
void handleRoot(){
  server.send(200, "text/html; charset=utf-8", HTML_PAGE);
}

void handleApiState(){
  struct tm t;
  String timeStr = "--:--:--";
  String dateStr = "--";

  if(getLocalTime(&t)){
    timeStr = two(t.tm_hour) + ":" + two(t.tm_min) + ":" + two(t.tm_sec);
    dateStr = String(t.tm_mday) + " " + monthFR(t.tm_mon + 1) + " " + String(t.tm_year + 1900);
  }

  String ip = (WiFi.status() == WL_CONNECTED) ? WiFi.localIP().toString() : "0.0.0.0";

  String tempStr = isnan(airTempC) ? "--" : (String(airTempC, 1) + " °C");
  String airhStr = isnan(airRH)    ? "--" : (String(airRH, 1) + " %");

  String json = "{";
  json += "\"time\":\"" + timeStr + "\",";
  json += "\"date\":\"" + dateStr + "\",";
  json += "\"ip\":\"" + ip + "\",";
  json += "\"temp\":\"" + tempStr + "\",";
  json += "\"airh\":\"" + airhStr + "\",";
  json += "\"lux\":\""  + String(luxValue) + " lx\",";
  json += "\"p1\":\""   + String(soilPct[0]) + "%\",";
  json += "\"p2\":\""   + String(soilPct[1]) + "%\",";
  json += "\"p3\":\""   + String(soilPct[2]) + "%\",";
  json += "\"p4\":\""   + String(soilPct[3]) + "%\",";
  json += "\"p1n\":"    + String(soilPct[0]) + ",";
  json += "\"p2n\":"    + String(soilPct[1]) + ",";
  json += "\"p3n\":"    + String(soilPct[2]) + ",";
  json += "\"p4n\":"    + String(soilPct[3]);
  json += "}";

  server.send(200, "application/json; charset=utf-8", json);
}

// ------------------ SETUP ------------------
void setup() {
  Serial.begin(115200);
  delay(100);

  Serial2.begin(115200, SERIAL_8N1, UART_RX, UART_TX);
  delay(100);

  Serial.println("\n=== BOOT ESP32 PLANTLY ===");
  Serial2.print("ESP32 ready\n");

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Connexion WiFi");
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < 15000) {
    delay(250);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi OK");
    lastIpSent = WiFi.localIP().toString();
    sendIpToSTM32(lastIpSent);
    ipEverSent = true;
    lastSendIpMs = millis();
  } else {
    Serial.println("\nWiFi FAIL");
  }

  configTzTime(tzInfo, ntpServer);

  server.on("/", handleRoot);
  server.on("/api/state", handleApiState);
  server.begin();
}

// ------------------ LOOP ------------------
void loop() {
  server.handleClient();

  // IP -> STM32 si changement
  if (WiFi.status() == WL_CONNECTED) {
    String ipNow = WiFi.localIP().toString();
    if (!ipEverSent || ipNow != lastIpSent) {
      lastIpSent = ipNow;
      sendIpToSTM32(ipNow);
      ipEverSent = true;
      lastSendIpMs = millis();
    }
  }

  // renvoi IP périodique
  if (WiFi.status() == WL_CONNECTED && millis() - lastSendIpMs >= 5000) {
    lastSendIpMs = millis();
    sendIpToSTM32(WiFi.localIP().toString());
  }

  // Lecture UART STM32 (ligne par ligne)
  while (Serial2.available()) {
    String line = Serial2.readStringUntil('\n');
    parseLine(line);
  }

  // Envoi heure/date UART chaque seconde (pour ta STM32)
  if (millis() - lastSendMs >= 1000) {
    lastSendMs = millis();
    struct tm t;
    if (getLocalTime(&t)) {
      char out[64];
      snprintf(out, sizeof(out),
               "T=%02d:%02d:%02d;D=%02d/%02d/%04d\n",
               t.tm_hour, t.tm_min, t.tm_sec,
               t.tm_mday, t.tm_mon + 1, t.tm_year + 1900);
      Serial2.print(out);
    }
  }
}
