#include "time_uart.h"
#include <string.h>
#include <stdio.h>
#include <stdint.h>

// UART (optionnel si tu n'utilises pas HAL_UART_Receive_IT ici)
static UART_HandleTypeDef* g_huart = NULL;

// Buffer ligne reçue
#define LINE_BUF_SIZE 64
static char lineBuf[LINE_BUF_SIZE];
static uint16_t lineIdx = 0;

// Valeurs temps (stockées)
static volatile uint8_t  g_hh = 0, g_mm = 0, g_ss = 0;
static volatile uint8_t  g_dd = 1, g_mo = 1;
static volatile uint16_t g_yy = 2025;
static volatile bool     g_valid = false;

// IP reçue
static char g_ip[16] = "0.0.0.0";   // "255.255.255.255" = 15 chars + '\0'
static volatile bool g_ip_ready = false;

// ---------- parsing ----------
static void parse_line(const char* s)
{
    if (!s || !s[0]) return;

    // 1) IP=xxx.xxx.xxx.xxx
    if (strncmp(s, "IP=", 3) == 0)
    {
        const char* ip = s + 3;

        // copie sécurisée
        __disable_irq();
        strncpy(g_ip, ip, sizeof(g_ip) - 1);
        g_ip[sizeof(g_ip) - 1] = '\0';
        g_ip_ready = true;
        __enable_irq();

        return;
    }

    // 2) Temps : T=HH:MM:SS;D=DD/MM/YYYY
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
    g_huart = huart; // pas obligatoire si tu reçois ailleurs, mais propre

    lineIdx = 0;
    memset(lineBuf, 0, sizeof(lineBuf));

    g_valid = false;

    __disable_irq();
    strncpy(g_ip, "0.0.0.0", sizeof(g_ip) - 1);
    g_ip[sizeof(g_ip) - 1] = '\0';
    g_ip_ready = false;
    __enable_irq();
}

void TimeUart_RxChar(uint8_t c)
{
    // Fin de ligne -> parse
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

    // Empile dans buffer
    if (lineIdx < (LINE_BUF_SIZE - 1))
    {
        lineBuf[lineIdx++] = (char)c;
    }
    else
    {
        // overflow -> reset ligne
        lineIdx = 0;
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
