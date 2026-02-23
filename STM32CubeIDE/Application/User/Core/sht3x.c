#include "sht3x.h"

// CRC8 Sensirion: polynomial 0x31, init 0xFF
static uint8_t crc8_sensirion(const uint8_t *data, uint8_t len)
{
    uint8_t crc = 0xFF;
    for (uint8_t i = 0; i < len; i++)
    {
        crc ^= data[i];
        for (uint8_t b = 0; b < 8; b++)
        {
            if (crc & 0x80) crc = (crc << 1) ^ 0x31;
            else           crc = (crc << 1);
        }
    }
    return crc;
}

static HAL_StatusTypeDef i2c_write_cmd16(sht3x_t *dev, uint16_t cmd)
{
    uint8_t buf[2];
    buf[0] = (uint8_t)(cmd >> 8);
    buf[1] = (uint8_t)(cmd & 0xFF);
    return HAL_I2C_Master_Transmit(dev->hi2c, (uint16_t)(dev->addr_7bit << 1), buf, 2, 100);
}

HAL_StatusTypeDef SHT3X_Init(sht3x_t *dev)
{
    if (!dev || !dev->hi2c) return HAL_ERROR;

    // Soft reset: 0x30A2 (optionnel mais pratique)
    // Si ça fail, on ne bloque pas, on continue quand même.
    (void)i2c_write_cmd16(dev, 0x30A2);
    HAL_Delay(10);

    // Test présence: on tente une commande de lecture "status" (0xF32D) puis read 3 bytes.
    // Si tu veux ultra simple: on peut juste tester un transmit d'une commande de mesure.
    // Ici on fait simple et robuste:
    if (i2c_write_cmd16(dev, 0xF32D) != HAL_OK)
        return HAL_ERROR;

    uint8_t s[3];
    if (HAL_I2C_Master_Receive(dev->hi2c, (uint16_t)(dev->addr_7bit << 1), s, 3, 100) != HAL_OK)
        return HAL_ERROR;

    // CRC check status (2 bytes + crc)
    if (crc8_sensirion(s, 2) != s[2])
        return HAL_ERROR;

    return HAL_OK;
}

HAL_StatusTypeDef SHT3X_ReadTempHum(sht3x_t *dev, float *temp_c, float *rh)
{
    if (!dev || !temp_c || !rh) return HAL_ERROR;

    // Single shot, High repeatability, clock stretching disabled: 0x2400
    if (i2c_write_cmd16(dev, 0x2400) != HAL_OK)
        return HAL_ERROR;

    // Temps de mesure (safe)
    HAL_Delay(20);

    uint8_t buf[6];
    if (HAL_I2C_Master_Receive(dev->hi2c, (uint16_t)(dev->addr_7bit << 1), buf, 6, 100) != HAL_OK)
        return HAL_ERROR;

    // CRC checks
    if (crc8_sensirion(&buf[0], 2) != buf[2]) return HAL_ERROR;
    if (crc8_sensirion(&buf[3], 2) != buf[5]) return HAL_ERROR;

    uint16_t rawT  = ((uint16_t)buf[0] << 8) | buf[1];
    uint16_t rawRH = ((uint16_t)buf[3] << 8) | buf[4];

    // Conversion datasheet
    *temp_c = -45.0f + 175.0f * ((float)rawT / 65535.0f);
    *rh     = 100.0f * ((float)rawRH / 65535.0f);

    return HAL_OK;
}
