#ifndef SHT3X_H
#define SHT3X_H

#include "stm32f7xx_hal.h"
#include <stdint.h>

typedef struct {
    I2C_HandleTypeDef *hi2c;
    uint8_t addr_7bit;   // 0x44 ou 0x45
} sht3x_t;

HAL_StatusTypeDef SHT3X_Init(sht3x_t *dev);
HAL_StatusTypeDef SHT3X_ReadTempHum(sht3x_t *dev, float *temp_c, float *rh);

#endif
