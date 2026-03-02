#include <gui/pot1_screen/Pot1View.hpp>
#include <gui/common/FrontendApplication.hpp>
#include <touchgfx/Unicode.hpp>
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

Pot1View::Pot1View() {}

void Pot1View::setupScreen()
{
    Pot1ViewBase::setupScreen();

    // Titre (nom pot)
    Titre.setWildcard(TitreBuffer);
    char name[33] = {0};
    if (Plantly_PotName_Get(0, name, sizeof(name)) && name[0])
        touchgfx::Unicode::fromUTF8((uint8_t*)name, TitreBuffer, TITRE_SIZE);
    else
        touchgfx::Unicode::snprintf(TitreBuffer, TITRE_SIZE, "POT 1");
    Titre.invalidate();

    // Humidité
    ValHumidite.setWildcard(ValHumiditeBuffer);
    touchgfx::Unicode::snprintf(ValHumiditeBuffer, VALHUMIDITE_SIZE, "0%%");
    ValHumidite.invalidate();

    ValBarreHumidite.setRange(0, 100);
    ValBarreHumidite.setValue(0);
    ValBarreHumidite.invalidate();

    // Date arrosage
    DateArrosage.setWildcard(DateArrosageBuffer);
    Plantly_Arrosage_Init();
    format_arrosage(0, DateArrosageBuffer, DATEARROSAGE_SIZE);
    DateArrosage.invalidate();

    // Envoi des dates vers ESP32
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

    std::memset(lastTitleName, 0, sizeof(lastTitleName));
    if (!Plantly_PotName_Get(0, lastTitleName, sizeof(lastTitleName)))
        std::strncpy(lastTitleName, "POT 1", sizeof(lastTitleName) - 1);
}

void Pot1View::tearDownScreen()
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

    Pot1ViewBase::tearDownScreen();
}

void Pot1View::handleTickEvent()
{
    // Update nom
    char name[33] = {0};
    if (Plantly_PotName_Get(0, name, sizeof(name)) && name[0])
    {
        if (std::strncmp(name, lastTitleName, sizeof(lastTitleName)) != 0)
        {
            std::strncpy(lastTitleName, name, sizeof(lastTitleName) - 1);
            lastTitleName[sizeof(lastTitleName) - 1] = '\0';

            touchgfx::Unicode::fromUTF8((uint8_t*)lastTitleName, TitreBuffer, TITRE_SIZE);
            Titre.invalidate();
        }
    }

    // Update humidité
    uint32_t soilPct = g_soil_percent[0];
    if (soilPct != lastSoilPct)
    {
        lastSoilPct = soilPct;

        touchgfx::Unicode::snprintf(ValHumiditeBuffer, VALHUMIDITE_SIZE, "%u%%", (unsigned)soilPct);
        ValHumidite.invalidate();

        ValBarreHumidite.setValue((int)soilPct);
        ValBarreHumidite.invalidate();
    }

    updateIdleVideo();
    Pot1ViewBase::handleTickEvent();
}

void Pot1View::updateIdleVideo()
{
    FrontendApplication& app = static_cast<FrontendApplication&>(application());

    if (app.isIdleVideoActive())
    {
        if (!videoShown)
        {
            videoShown = true;
            uint32_t hum = g_soil_percent[0];

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

void Pot1View::SetEau()
{
    uint8_t hh, mm, ss, dd, mo;
    uint16_t yy;

    if (Plantly_Time_Get(&hh, &mm, &ss, &dd, &mo, &yy))
        Plantly_Arrosage_Set(0, dd, mo, yy, hh, mm);

    format_arrosage(0, DateArrosageBuffer, DATEARROSAGE_SIZE);
    DateArrosage.invalidate();

    Plantly_Arrosage_Send(0);
}

void Pot1View::ResetEau()
{
    Plantly_Arrosage_Clear(0);
    format_arrosage(0, DateArrosageBuffer, DATEARROSAGE_SIZE);
    DateArrosage.invalidate();

    Plantly_Arrosage_Send(0);
}
