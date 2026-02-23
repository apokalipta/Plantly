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

// Renvoie true si on a une date/heure valide (copie dans les pointeurs)
bool Plantly_Time_Get(uint8_t* hh, uint8_t* mm, uint8_t* ss,uint8_t* dd, uint8_t* mo, uint16_t* yy);
bool Plantly_IP_Get(char* out, uint16_t outLen);

#ifdef __cplusplus
}
#endif

#endif // TIME_UART_H
