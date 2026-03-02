#include "plantly_arrosage_store.h"
#include "stm32f7xx_hal.h"
#include <string.h>

#define ARROSAGE_MAGIC      (0x504C4E54u)  // 'PLNT'
#define ARROSAGE_VERSION    (1u)

// ⚠️ Secteur 7: 0x080C0000 -> 0x08100000 (256KB) sur STM32F746 1MB
#define ARROSAGE_FLASH_ADDR (0x080C0000u)
#define ARROSAGE_FLASH_SECTOR FLASH_SECTOR_7
#define ARROSAGE_FLASH_BANK   FLASH_BANK_1

typedef struct
{
    uint32_t magic;
    uint32_t version;
    plantly_arrosage_t pots[4];
    uint32_t crc; // simple checksum (optionnel) - ici on met juste une somme
} arrosage_blob_t;

static arrosage_blob_t g_blob;
static uint8_t g_inited = 0;

static uint32_t simple_sum32(const uint32_t* p, uint32_t words)
{
    uint32_t s = 0;
    for (uint32_t i = 0; i < words; i++) s += p[i];
    return s;
}

static void blob_default(arrosage_blob_t* b)
{
    memset(b, 0, sizeof(*b));
    b->magic = ARROSAGE_MAGIC;
    b->version = ARROSAGE_VERSION;
    for (int i = 0; i < 4; i++)
    {
        b->pots[i].valid = 0;
    }
    b->crc = 0;
}

static bool flash_read_blob(arrosage_blob_t* out)
{
    const arrosage_blob_t* f = (const arrosage_blob_t*)ARROSAGE_FLASH_ADDR;
    memcpy(out, f, sizeof(arrosage_blob_t));

    if (out->magic != ARROSAGE_MAGIC) return false;
    if (out->version != ARROSAGE_VERSION) return false;

    // vérif checksum simple
    uint32_t saved = out->crc;
    out->crc = 0;
    uint32_t calc = simple_sum32((const uint32_t*)out, sizeof(arrosage_blob_t)/4);
    out->crc = saved;

    return (calc == saved);
}

static bool flash_write_blob(const arrosage_blob_t* b)
{
    HAL_FLASH_Unlock();

    // 1) erase sector
    FLASH_EraseInitTypeDef erase;
    uint32_t sectorError = 0;

    erase.TypeErase = FLASH_TYPEERASE_SECTORS;
    erase.VoltageRange = FLASH_VOLTAGE_RANGE_3; // ok pour 2.7-3.6V
    erase.Sector = ARROSAGE_FLASH_SECTOR;
    erase.NbSectors = 1;
#if defined(FLASH_BANK_1)
    erase.Banks = ARROSAGE_FLASH_BANK;
#endif

    if (HAL_FLASHEx_Erase(&erase, &sectorError) != HAL_OK)
    {
        HAL_FLASH_Lock();
        return false;
    }

    // 2) program words
    uint32_t addr = ARROSAGE_FLASH_ADDR;
    const uint32_t* src = (const uint32_t*)b;
    uint32_t words = sizeof(arrosage_blob_t) / 4;

    for (uint32_t i = 0; i < words; i++)
    {
        if (HAL_FLASH_Program(FLASH_TYPEPROGRAM_WORD, addr, src[i]) != HAL_OK)
        {
            HAL_FLASH_Lock();
            return false;
        }
        addr += 4;
    }

    HAL_FLASH_Lock();

    // IMPORTANT sur F7: invalider caches (sécurité)
    SCB_InvalidateICache();
    SCB_CleanInvalidateDCache();

    return true;
}

static bool commit(void)
{
    arrosage_blob_t tmp = g_blob;

    tmp.crc = 0;
    tmp.crc = simple_sum32((const uint32_t*)&tmp, sizeof(arrosage_blob_t)/4);

    return flash_write_blob(&tmp);
}

void Plantly_Arrosage_Init(void)
{
    if (g_inited) return;
    g_inited = 1;

    arrosage_blob_t tmp;
    if (flash_read_blob(&tmp))
    {
        g_blob = tmp;
    }
    else
    {
        blob_default(&g_blob);
        (void)commit(); // initialise la zone
    }
}

bool Plantly_Arrosage_Get(uint8_t pot, plantly_arrosage_t* out)
{
    Plantly_Arrosage_Init();
    if (!out) return false;
    if (pot > 3) return false;

    *out = g_blob.pots[pot];
    return (out->valid == 1);
}

bool Plantly_Arrosage_Set(uint8_t pot, uint8_t dd, uint8_t mo, uint16_t yy, uint8_t hh, uint8_t mm)
{
    Plantly_Arrosage_Init();
    if (pot > 3) return false;

    g_blob.pots[pot].valid = 1;
    g_blob.pots[pot].dd = dd;
    g_blob.pots[pot].mo = mo;
    g_blob.pots[pot].yy = yy;
    g_blob.pots[pot].hh = hh;
    g_blob.pots[pot].mm = mm;

    return commit();
}

bool Plantly_Arrosage_Clear(uint8_t pot)
{
    Plantly_Arrosage_Init();
    if (pot > 3) return false;

    g_blob.pots[pot].valid = 0;
    g_blob.pots[pot].dd = 0;
    g_blob.pots[pot].mo = 0;
    g_blob.pots[pot].yy = 0;
    g_blob.pots[pot].hh = 0;
    g_blob.pots[pot].mm = 0;

    return commit();
}
