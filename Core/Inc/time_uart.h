#ifndef TIME_UART_H
#define TIME_UART_H

#include "main.h"
#include <stdbool.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

// Init réception UART (à appeler une fois après MX_USART6_UART_Init)
void TimeUart_Init(UART_HandleTypeDef* huart);

// A appeler à chaque caractère reçu (depuis HAL_UART_RxCpltCallback)
void TimeUart_RxChar(uint8_t c);

// Getters
bool Plantly_Time_Get(uint8_t* hh, uint8_t* mm, uint8_t* ss,
                      uint8_t* dd, uint8_t* mo, uint16_t* yy);
bool Plantly_IP_Get(char* out, uint16_t outLen);
bool Plantly_SSID_Get(char* out, uint16_t outLen);

// ✅ NOUVEAU : nom des pots (reçu depuis ESP32 via UART: PN1=..., PN2=...)
bool Plantly_PotName_Get(uint8_t potIndex, char* out, uint16_t outLen); // potIndex: 0..3

// Envoi commande vers ESP32
void Plantly_WiFi_Clear_Request(void);

// ✅ envoi dates d’arrosage vers ESP32
void Plantly_Arrosage_Send(uint8_t potIndex); // potIndex: 0..3
void Plantly_Arrosage_SendAll(void);

#ifdef __cplusplus
}
#endif

#endif // TIME_UART_H
