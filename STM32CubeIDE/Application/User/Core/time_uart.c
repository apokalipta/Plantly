#include "time_uart.h"
#include "stm32f7xx_hal.h"
#include <string.h>
#include <stdio.h>
#include <stdint.h>

#include "plantly_arrosage_store.h"   // ✅

static UART_HandleTypeDef* g_huart = NULL;
extern UART_HandleTypeDef huart6;

// Buffer ligne reçue
#define LINE_BUF_SIZE 128
static char lineBuf[LINE_BUF_SIZE];
static uint16_t lineIdx = 0;

// Valeurs temps (stockées)
static volatile uint8_t  g_hh = 0, g_mm = 0, g_ss = 0;
static volatile uint8_t  g_dd = 1, g_mo = 1;
static volatile uint16_t g_yy = 2025;
static volatile bool     g_valid = false;

// IP reçue
static char g_ip[16] = "0.0.0.0";
static volatile bool g_ip_ready = false;

// SSID reçu (max 32 chars)
static char g_ssid[33] = "";
static volatile bool g_ssid_ready = false;

// ✅ NOUVEAU : Noms des pots (max 32 chars)
static char g_potname[4][33] = { "POT 1", "POT 2", "POT 3", "POT 4" };
static volatile bool g_potname_ready[4] = { false, false, false, false };

// -------- helper transmit (safe) --------
static void tx_line(const char* s)
{
    if (!s) return;

    UART_HandleTypeDef* hu = (g_huart != NULL) ? g_huart : &huart6;
    HAL_UART_Transmit(hu, (uint8_t*)s, (uint16_t)strlen(s), 200);
}

// ---------- parsing ----------
static void parse_line(const char* s)
{
    if (!s || !s[0]) return;

    // IP=xxx.xxx.xxx.xxx
    if (strncmp(s, "IP=", 3) == 0)
    {
        const char* ip = s + 3;

        __disable_irq();
        strncpy(g_ip, ip, sizeof(g_ip) - 1);
        g_ip[sizeof(g_ip) - 1] = '\0';
        g_ip_ready = true;
        __enable_irq();
        return;
    }

    // SSID=MonWifi
    if (strncmp(s, "SSID=", 5) == 0)
    {
        const char* ssid = s + 5;

        __disable_irq();
        strncpy(g_ssid, ssid, sizeof(g_ssid) - 1);
        g_ssid[sizeof(g_ssid) - 1] = '\0';
        g_ssid_ready = true;
        __enable_irq();
        return;
    }

    // ✅ NOUVEAU : PN1=NomDuPot  (PN2=..., PN3=..., PN4=...)
    // Format côté ESP32: "PN<1..4>=<name>"
    if (strncmp(s, "PN", 2) == 0)
    {
        // s[2] = '1'..'4' et s[3] = '='
        if (s[2] >= '1' && s[2] <= '4' && s[3] == '=')
        {
            uint8_t idx = (uint8_t)(s[2] - '1'); // 0..3
            const char* name = s + 4;            // après "PNx="

            __disable_irq();
            strncpy(g_potname[idx], name, sizeof(g_potname[idx]) - 1);
            g_potname[idx][sizeof(g_potname[idx]) - 1] = '\0';
            g_potname_ready[idx] = true;
            __enable_irq();
        }
        return;
    }

    // Temps : T=HH:MM:SS;D=DD/MM/YYYY
    int hh, mm, ss, dd, mo, yy;
    int n = sscanf(s, "T=%d:%d:%d;D=%d/%d/%d", &hh, &mm, &ss, &dd, &mo, &yy);

    if (n == 6)
    {
        if (hh >= 0 && hh <= 23 &&
            mm >= 0 && mm <= 59 &&
            ss >= 0 && ss <= 59 &&
            dd >= 1 && dd <= 31 &&
            mo >= 1 && mo <= 12 &&
            yy >= 2000 && yy <= 2099)
        {
            __disable_irq();
            g_hh = (uint8_t)hh;
            g_mm = (uint8_t)mm;
            g_ss = (uint8_t)ss;
            g_dd = (uint8_t)dd;
            g_mo = (uint8_t)mo;
            g_yy = (uint16_t)yy;
            g_valid = true;
            __enable_irq();
        }
    }
}

void TimeUart_Init(UART_HandleTypeDef* huart)
{
    g_huart = huart;

    lineIdx = 0;
    memset(lineBuf, 0, sizeof(lineBuf));

    g_valid = false;

    __disable_irq();
    strncpy(g_ip, "0.0.0.0", sizeof(g_ip) - 1);
    g_ip[sizeof(g_ip) - 1] = '\0';
    g_ip_ready = false;

    g_ssid[0] = '\0';
    g_ssid_ready = false;

    // ✅ init noms (default)
    strncpy(g_potname[0], "POT 1", sizeof(g_potname[0]) - 1);
    strncpy(g_potname[1], "POT 2", sizeof(g_potname[1]) - 1);
    strncpy(g_potname[2], "POT 3", sizeof(g_potname[2]) - 1);
    strncpy(g_potname[3], "POT 4", sizeof(g_potname[3]) - 1);
    for (int i = 0; i < 4; i++) {
        g_potname[i][32] = '\0';
        g_potname_ready[i] = false;
    }

    __enable_irq();
}

void TimeUart_RxChar(uint8_t c)
{
    if (c == '\n' || c == '\r')
    {
        if (lineIdx > 0)
        {
            lineBuf[lineIdx] = '\0';
            parse_line(lineBuf);
            lineIdx = 0;
        }
        return;
    }

    if (lineIdx < (LINE_BUF_SIZE - 1))
    {
        lineBuf[lineIdx++] = (char)c;
    }
    else
    {
        lineIdx = 0; // overflow
    }
}

bool Plantly_Time_Get(uint8_t* hh, uint8_t* mm, uint8_t* ss,
                      uint8_t* dd, uint8_t* mo, uint16_t* yy)
{
    if (!g_valid) return false;

    __disable_irq();
    uint8_t  _hh = g_hh, _mm = g_mm, _ss = g_ss, _dd = g_dd, _mo = g_mo;
    uint16_t _yy = g_yy;
    __enable_irq();

    if (hh) *hh = _hh;
    if (mm) *mm = _mm;
    if (ss) *ss = _ss;
    if (dd) *dd = _dd;
    if (mo) *mo = _mo;
    if (yy) *yy = _yy;

    return true;
}

bool Plantly_IP_Get(char* out, uint16_t outLen)
{
    if (!out || outLen < 2) return false;
    if (!g_ip_ready) return false;

    __disable_irq();
    strncpy(out, g_ip, outLen - 1);
    out[outLen - 1] = '\0';
    __enable_irq();

    return true;
}

bool Plantly_SSID_Get(char* out, uint16_t outLen)
{
    if (!out || outLen < 2) return false;
    if (!g_ssid_ready) return false;

    __disable_irq();
    strncpy(out, g_ssid, outLen - 1);
    out[outLen - 1] = '\0';
    __enable_irq();

    return true;
}

// ✅ NOUVEAU : getter noms des pots
bool Plantly_PotName_Get(uint8_t potIndex, char* out, uint16_t outLen)
{
    if (!out || outLen < 2) return false;
    if (potIndex > 3) return false;

    __disable_irq();
    // même si pas "ready", on renvoie le default
    strncpy(out, g_potname[potIndex], outLen - 1);
    out[outLen - 1] = '\0';
    bool ok = g_potname_ready[potIndex] || (g_potname[potIndex][0] != '\0');
    __enable_irq();

    return ok;
}

void Plantly_WiFi_Clear_Request(void)
{
    tx_line("CMD=WIFI_CLEAR\n");
}

// =======================================================
// ✅ Envoi date/heure arrosage des pots vers ESP32
// =======================================================

void Plantly_Arrosage_Send(uint8_t potIndex)
{
    if (potIndex > 3) return;

    plantly_arrosage_t a;
    char out[64];

    if (Plantly_Arrosage_Get(potIndex, &a))
    {
        snprintf(out, sizeof(out),
                 "AR%u=%02u/%02u/%04u %02u:%02u\n",
                 (unsigned)(potIndex + 1),
                 (unsigned)a.dd, (unsigned)a.mo, (unsigned)a.yy,
                 (unsigned)a.hh, (unsigned)a.mm);
    }
    else
    {
        snprintf(out, sizeof(out), "AR%u=NONE\n", (unsigned)(potIndex + 1));
    }

    tx_line(out);
}

void Plantly_Arrosage_SendAll(void)
{
    Plantly_Arrosage_Send(0);
    Plantly_Arrosage_Send(1);
    Plantly_Arrosage_Send(2);
    Plantly_Arrosage_Send(3);
}
