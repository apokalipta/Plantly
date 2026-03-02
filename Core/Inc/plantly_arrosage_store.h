#ifndef PLANTLY_ARROSAGE_STORE_H
#define PLANTLY_ARROSAGE_STORE_H

#include <stdint.h>
#include <stdbool.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct
{
    uint8_t  valid;   // 0 = vide / 1 = ok
    uint8_t  dd;
    uint8_t  mo;
    uint16_t yy;
    uint8_t  hh;
    uint8_t  mm;
} plantly_arrosage_t;

// Appeler une fois au démarrage (safe si appelé plusieurs fois)
void Plantly_Arrosage_Init(void);

// Lire un pot (0..3). Retourne true si valide.
bool Plantly_Arrosage_Get(uint8_t pot, plantly_arrosage_t* out);

// Ecrire une date/heure sur un pot (0..3)
bool Plantly_Arrosage_Set(uint8_t pot, uint8_t dd, uint8_t mo, uint16_t yy, uint8_t hh, uint8_t mm);

// Effacer un pot (0..3)
bool Plantly_Arrosage_Clear(uint8_t pot);

#ifdef __cplusplus
}
#endif

#endif