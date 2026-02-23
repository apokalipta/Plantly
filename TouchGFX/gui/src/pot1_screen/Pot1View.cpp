#include <gui/pot1_screen/Pot1View.hpp>
#include <gui/common/FrontendApplication.hpp>
#include <touchgfx/Unicode.hpp>

extern "C" volatile uint32_t g_soil_percent[4];

Pot1View::Pot1View()
{
}

void Pot1View::setupScreen()
{
    Pot1ViewBase::setupScreen();

    // ✅ 1) Branche le wildcard du texte humidité (OBLIGATOIRE)
    ValHumidite.setWildcard(ValHumiditeBuffer);
    touchgfx::Unicode::snprintf(ValHumiditeBuffer, VALHUMIDITE_SIZE, "0%%");
    ValHumidite.invalidate();

    // ✅ 2) Barre
    ValBarreHumidite.setRange(0, 100);
    ValBarreHumidite.setValue(0);
    ValBarreHumidite.invalidate();

    // Animations cachées
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
    lastSoilPct = 0xFFFFFFFF; // force update au 1er tick
}

void Pot1View::tearDownScreen()
{
    contente.stopAnimation();
    contente.setVisible(false);

    froid.stopAnimation();
    froid.setVisible(false);

    chaud.stopAnimation();
    chaud.setVisible(false);

    contente.invalidate();
    froid.invalidate();
    chaud.invalidate();

    videoShown = false;

    Pot1ViewBase::tearDownScreen();
}

void Pot1View::handleTickEvent()
{
	uint32_t soilPct = g_soil_percent[0]; // Pot1

    if (soilPct != lastSoilPct)
    {
        lastSoilPct = soilPct;

        // ✅ Texte %
        touchgfx::Unicode::snprintf(ValHumiditeBuffer, VALHUMIDITE_SIZE, "%u%%", (unsigned int)soilPct);
        ValHumidite.invalidate();

        // ✅ Barre
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

            uint32_t hum = g_soil_percent[0]; // ✅ Pot2

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
            contente.setVisible(false);

            froid.stopAnimation();
            froid.setVisible(false);

            chaud.stopAnimation();
            chaud.setVisible(false);

            contente.invalidate();
            froid.invalidate();
            chaud.invalidate();
        }
    }
}
