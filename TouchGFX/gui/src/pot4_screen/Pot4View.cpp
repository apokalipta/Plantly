#include <gui/pot4_screen/Pot4View.hpp>
#include <gui/common/FrontendApplication.hpp>
#include <touchgfx/Unicode.hpp>
#include <cstdio>
#include <cstring>

#include "plantly_arrosage_store.h"
#include "time_uart.h"

extern "C" volatile uint32_t g_soil_percent[4];
extern "C" bool Plantly_Time_Get(uint8_t* hh, uint8_t* mm, uint8_t* ss,
                                 uint8_t* dd, uint8_t* mo, uint16_t* yy);

static void format_arrosage(uint8_t pot,
                            touchgfx::Unicode::UnicodeChar* buf,
                            uint16_t bufSize)
{
    plantly_arrosage_t a;
    if (Plantly_Arrosage_Get(pot, &a))
    {
        touchgfx::Unicode::snprintf(buf, bufSize, "%02d/%02d/%04d %02d:%02d",
                                    a.dd, a.mo, (int)a.yy, a.hh, a.mm);
    }
    else
    {
        touchgfx::Unicode::snprintf(buf, bufSize, "Aucune date enregistree");
    }
}

Pot4View::Pot4View() {}

void Pot4View::setupScreen()
{
    Pot4ViewBase::setupScreen();

    // Titre = nom du pot
    Titre.setWildcard(TitreBuffer);
    char name[33] = {0};
    if (Plantly_PotName_Get(3, name, sizeof(name)) && name[0])
    {
        touchgfx::Unicode::fromUTF8((uint8_t*)name, TitreBuffer, TITRE_SIZE);
    }
    else
    {
        touchgfx::Unicode::snprintf(TitreBuffer, TITRE_SIZE, "POT 4");
    }
    Titre.invalidate();

    // Humidité
    ValHumidite.setWildcard(ValHumiditeBuffer);
    touchgfx::Unicode::snprintf(ValHumiditeBuffer, VALHUMIDITE_SIZE, "0%%");
    ValHumidite.invalidate();

    // Espèce
    ValPlante.setWildcard(ValPlanteBuffer);
    char espece[33] = {0};
    if (Plantly_Espece_Get(3, espece, sizeof(espece)) && espece[0])
        touchgfx::Unicode::fromUTF8((uint8_t*)espece, ValPlanteBuffer, VALPLANTE_SIZE);
    else
        touchgfx::Unicode::snprintf(ValPlanteBuffer, VALPLANTE_SIZE, "AUCUNE");
    ValPlante.invalidate();

    textescore.setWildcard(textescoreBuffer);
    touchgfx::Unicode::snprintf(textescoreBuffer, TEXTESCORE_SIZE, "0/100");
    textescore.invalidate();

    ValBarreHumidite.setRange(0, 100);
    ValBarreHumidite.setValue(0);
    ValBarreHumidite.invalidate();

    // Date arrosage persistante
    DateArrosage.setWildcard(DateArrosageBuffer);
    Plantly_Arrosage_Init();
    format_arrosage(3, DateArrosageBuffer, DATEARROSAGE_SIZE);
    DateArrosage.invalidate();

    // Push arrosage -> ESP32
    Plantly_Arrosage_SendAll();

    contente.setVisible(false);
    froid.setVisible(false);
    chaud.setVisible(false);

    contente.stopAnimation();
    froid.stopAnimation();
    chaud.stopAnimation();

    contente.invalidate();
    froid.invalidate();
    chaud.invalidate();

    videoShown = false;
    lastSoilPct = 0xFFFFFFFF;

    // stock local pour détecter changement de nom
    std::memset(lastTitleName, 0, sizeof(lastTitleName));
    if (Plantly_PotName_Get(3, lastTitleName, sizeof(lastTitleName)) == false) {
        std::strncpy(lastTitleName, "POT 4", sizeof(lastTitleName) - 1);
    }
}

void Pot4View::tearDownScreen()
{
    contente.stopAnimation();
    froid.stopAnimation();
    chaud.stopAnimation();

    contente.setVisible(false);
    froid.setVisible(false);
    chaud.setVisible(false);

    contente.invalidate();
    froid.invalidate();
    chaud.invalidate();

    videoShown = false;

    Pot4ViewBase::tearDownScreen();
}

void Pot4View::handleTickEvent()
{
    // Mise à jour nom si l’appli le change
    char name[33] = {0};
    if (Plantly_PotName_Get(3, name, sizeof(name)) && name[0])
    {
        if (std::strncmp(name, lastTitleName, sizeof(lastTitleName)) != 0)
        {
            std::strncpy(lastTitleName, name, sizeof(lastTitleName) - 1);
            lastTitleName[sizeof(lastTitleName) - 1] = '\0';

            touchgfx::Unicode::fromUTF8((uint8_t*)lastTitleName, TitreBuffer, TITRE_SIZE);
            Titre.invalidate();
        }
    }

    char espece[33] = {0};
    if (Plantly_Espece_Get(3, espece, sizeof(espece)) && espece[0])
        touchgfx::Unicode::fromUTF8((uint8_t*)espece, ValPlanteBuffer, VALPLANTE_SIZE);
    else
        touchgfx::Unicode::snprintf(ValPlanteBuffer, VALPLANTE_SIZE, "AUCUNE");
    ValPlante.invalidate();

    // Humidité
    uint32_t soilPct = g_soil_percent[3];
    if (soilPct != lastSoilPct)
    {
        lastSoilPct = soilPct;

        touchgfx::Unicode::snprintf(ValHumiditeBuffer, VALHUMIDITE_SIZE, "%u%%", (unsigned int)soilPct);
        ValHumidite.invalidate();

        ValBarreHumidite.setValue((int)soilPct);
        ValBarreHumidite.invalidate();
    }

    updateIdleVideo();
    Pot4ViewBase::handleTickEvent();
}

void Pot4View::updateIdleVideo()
{
    FrontendApplication& app = static_cast<FrontendApplication&>(application());

    if (app.isIdleVideoActive())
    {
        if (!videoShown)
        {
            videoShown = true;
            uint32_t hum = g_soil_percent[3];

            contente.setVisible(false);
            froid.setVisible(false);
            chaud.setVisible(false);

            contente.stopAnimation();
            froid.stopAnimation();
            chaud.stopAnimation();

            if (hum < 30)
            {
                chaud.setVisible(true);
                chaud.startAnimation(true, false, true);
                chaud.invalidate();
            }
            else if (hum <= 70)
            {
                contente.setVisible(true);
                contente.startAnimation(true, false, true);
                contente.invalidate();
            }
            else
            {
                froid.setVisible(true);
                froid.startAnimation(true, false, true);
                froid.invalidate();
            }
        }
    }
    else
    {
        if (videoShown)
        {
            videoShown = false;

            contente.stopAnimation();
            froid.stopAnimation();
            chaud.stopAnimation();

            contente.setVisible(false);
            froid.setVisible(false);
            chaud.setVisible(false);

            contente.invalidate();
            froid.invalidate();
            chaud.invalidate();
        }
    }
}

void Pot4View::SetEau()
{
    uint8_t hh, mm, ss, dd, mo;
    uint16_t yy;

    if (Plantly_Time_Get(&hh, &mm, &ss, &dd, &mo, &yy))
    {
        Plantly_Arrosage_Set(3, dd, mo, yy, hh, mm);
    }

    format_arrosage(3, DateArrosageBuffer, DATEARROSAGE_SIZE);
    DateArrosage.invalidate();

    Plantly_Arrosage_Send(3);
}

void Pot4View::ResetEau()
{
    Plantly_Arrosage_Clear(3);
    format_arrosage(3, DateArrosageBuffer, DATEARROSAGE_SIZE);
    DateArrosage.invalidate();

    Plantly_Arrosage_Send(3);
}
