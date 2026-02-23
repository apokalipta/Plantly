#pragma once
#include "stm32f7xx_hal.h"
#include <stdint.h>

typedef struct {
    I2C_HandleTypeDef* hi2c;
    uint8_t addr_7bit; // 0x23 ou 0x5C
} bh1750_t;

// addrPinToVcc = 0 => addr 0x23, addrPinToVcc = 1 => addr 0x5C
HAL_StatusTypeDef BH1750_Init(bh1750_t* dev, I2C_HandleTypeDef* hi2c, uint8_t addrPinToVcc);

// Lecture lux (mode continu haute résolution)
HAL_StatusTypeDef BH1750_ReadLux(bh1750_t* dev, uint32_t* lux_out);
