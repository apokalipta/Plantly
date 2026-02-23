#include "bh1750.h"

#define BH1750_ADDR_LOW   0x23
#define BH1750_ADDR_HIGH  0x5C

// Commands
#define BH1750_POWER_ON   0x01
#define BH1750_RESET      0x07
#define BH1750_CONT_HRES  0x10  // Continuous H-Resolution Mode (1 lx / 0.5 lx typ)

static HAL_StatusTypeDef bh1750_write_cmd(bh1750_t* dev, uint8_t cmd)
{
    uint8_t data = cmd;
    return HAL_I2C_Master_Transmit(dev->hi2c, (uint16_t)(dev->addr_7bit << 1), &data, 1, 100);
}

HAL_StatusTypeDef BH1750_Init(bh1750_t* dev, I2C_HandleTypeDef* hi2c, uint8_t addrPinToVcc)
{
    if(!dev || !hi2c) return HAL_ERROR;

    dev->hi2c = hi2c;
    dev->addr_7bit = addrPinToVcc ? BH1750_ADDR_HIGH : BH1750_ADDR_LOW;

    // Power on
    if(bh1750_write_cmd(dev, BH1750_POWER_ON) != HAL_OK) return HAL_ERROR;

    // Reset (optionnel mais propre)
    if(bh1750_write_cmd(dev, BH1750_RESET) != HAL_OK) return HAL_ERROR;

    // Mode continuous high resolution
    if(bh1750_write_cmd(dev, BH1750_CONT_HRES) != HAL_OK) return HAL_ERROR;

    return HAL_OK;
}

HAL_StatusTypeDef BH1750_ReadLux(bh1750_t* dev, uint32_t* lux_out)
{
    if(!dev || !lux_out) return HAL_ERROR;

    uint8_t buf[2] = {0};
    HAL_StatusTypeDef st = HAL_I2C_Master_Receive(dev->hi2c, (uint16_t)(dev->addr_7bit << 1), buf, 2, 100);
    if(st != HAL_OK) return st;

    uint16_t raw = (uint16_t)((buf[0] << 8) | buf[1]);

    // Conversion datasheet: lux = raw / 1.2
    // On fait une approx entière propre: (raw * 10) / 12
    uint32_t lux = (uint32_t)((raw * 10UL) / 12UL);

    *lux_out = lux;
    return HAL_OK;
}
