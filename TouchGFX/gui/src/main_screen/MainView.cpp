#include <gui/main_screen/MainView.hpp>
#include <gui/common/FrontendApplication.hpp>
#include <cstdio>
#include <touchgfx/Unicode.hpp>

// ✅ Valeurs venant du main.c (4 pots)
extern "C" volatile uint32_t g_soil_adc[4];
extern "C" volatile uint32_t g_soil_percent[4];

extern "C" bool Plantly_Time_Get(uint8_t* hh, uint8_t* mm, uint8_t* ss, uint8_t* dd, uint8_t* mo, uint16_t* yy);

extern "C" volatile int32_t  g_temp_c_x10;
extern "C" volatile uint32_t g_air_rh_x10;
extern "C" volatile uint32_t g_lux;

// Mois FR
static const char* MONTHS_FR[12] = {
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
};

namespace
{
    static constexpr uint32_t HUM_PCT_SEC = 30;  // < 30% => sec
    static constexpr uint32_t HUM_PCT_OK  = 70;  // 30..70% => contente / ok

    // ✅ Pot affiché sur l'écran principal (0=Pot1, 1=Pot2, 2=Pot3, 3=Pot4)
    static constexpr uint32_t MAIN_POT_INDEX = 0;
}

MainView::MainView()
{
}

void MainView::setupScreen()
{
    MainViewBase::setupScreen();

    // --- Date ---
    TextDate.setWildcard(textDateBuffer);
    touchgfx::Unicode::snprintf(textDateBuffer, 40, "");
    TextDate.invalidate();

    // --- Humidité air (en %) ---
    ValHumidite.setWildcard(humBuffer);
    touchgfx::Unicode::snprintf(humBuffer, 10, "0%%");
    ValHumidite.invalidate();

    // --- Température air ---
    ValTemperature.setWildcard(tempBuffer);
    touchgfx::Unicode::snprintf(tempBuffer, 10, "0.0°");
    ValTemperature.invalidate();

    // --- Luminosité (lux) ---
    ValLuminosite.setWildcard(luxBuffer);
    touchgfx::Unicode::snprintf(luxBuffer, 16, "0 lx");
    ValLuminosite.invalidate();

    // --- Animations cachées au départ ---
    contente.setVisible(false);
    froid.setVisible(false);
    chaud.setVisible(false);

    // Stop sécurité
    contente.stopAnimation();
    froid.stopAnimation();
    chaud.stopAnimation();

    contente.invalidate();
    froid.invalidate();
    chaud.invalidate();

    // Force refresh au 1er tick
    videoShown = false;
    lastHum = 0xFFFFFFFF;
    lastTemp = 0x7FFFFFFF;
    lastLux = 0xFFFFFFFF;
}

void MainView::tearDownScreen()
{
    // Stop propre de toutes les animations
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

    MainViewBase::tearDownScreen();
}

void MainView::handleTickEvent()
{
    // 1) Gestion Idle (affiche animation seulement quand FrontendApplication dit "idle")
    updateIdleVideo();

    // 2) Heure / Date
    uint8_t hh, mm, ss, dd, mo;
    uint16_t yy;

    if (Plantly_Time_Get(&hh, &mm, &ss, &dd, &mo, &yy))
    {
        updateClockAndDate(hh, mm, ss, dd, mo, yy);
    }

    // 3) Humidité air (ex: 503 => 50.3%)
    uint32_t rh10 = g_air_rh_x10;
    if (rh10 != lastHum)
    {
        lastHum = rh10;

        uint32_t rh_i = rh10 / 10;
        uint32_t rh_d = rh10 % 10;

        touchgfx::Unicode::snprintf(humBuffer, 10, "%u.%u%%", (unsigned int)rh_i, (unsigned int)rh_d);
        ValHumidite.invalidate();
    }

    // 4) Température (ex: 234 => 23.4°C)
    int32_t t10 = g_temp_c_x10;
    if (t10 != lastTemp)
    {
        lastTemp = t10;

        int32_t absT = (t10 < 0) ? -t10 : t10;
        int32_t ti = t10 / 10;
        int32_t td = absT % 10;

        touchgfx::Unicode::snprintf(tempBuffer, 10, "%d.%d°", (int)ti, (int)td);
        ValTemperature.invalidate();
    }

    // 5) Luminosité (lux)
    uint32_t lux = g_lux;
    if (lux != lastLux)
    {
        lastLux = lux;
        touchgfx::Unicode::snprintf(luxBuffer, 16, "%d lx", (int)lux);
        ValLuminosite.invalidate();
    }

    MainViewBase::handleTickEvent();
}

void MainView::updateIdleVideo()
{
    FrontendApplication& app = static_cast<FrontendApplication&>(application());

    if (app.isIdleVideoActive())
    {
        if (!videoShown)
        {
            videoShown = true;

            // ✅ Humidité sol du pot choisi pour l'écran principal
            uint32_t pct = g_soil_percent[MAIN_POT_INDEX];

            // Cache tout + stop tout avant de choisir
            contente.setVisible(false);
            froid.setVisible(false);
            chaud.setVisible(false);

            contente.stopAnimation();
            froid.stopAnimation();
            chaud.stopAnimation();

            contente.invalidate();
            froid.invalidate();
            chaud.invalidate();

            // Choix selon % humidité sol
            if (pct < HUM_PCT_SEC)
            {
                chaud.setVisible(true);
                chaud.startAnimation(true, false, true);
                chaud.invalidate();
            }
            else if (pct <= HUM_PCT_OK)
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

void MainView::updateClockAndDate(uint8_t hh, uint8_t mm, uint8_t ss,
                                  uint8_t dd, uint8_t mo, uint16_t yyyy)
{
    // évite refresh si rien ne change
    if (hh == last_h && mm == last_m && ss == last_s &&
        dd == last_d && mo == last_mo && yyyy == last_y)
    {
        return;
    }

    last_h = hh; last_m = mm; last_s = ss;
    last_d = dd; last_mo = mo; last_y = yyyy;

    // Heure
    digitalClock1.setTime24Hour(hh, mm, ss);
    digitalClock1.invalidate();

    // Date FR
    const char* monthStr = (mo >= 1 && mo <= 12) ? MONTHS_FR[mo - 1] : "???";

    char tmp[48];
    snprintf(tmp, sizeof(tmp), "%d %s %d", dd, monthStr, (int)yyyy);

    touchgfx::Unicode::fromUTF8((uint8_t*)tmp, textDateBuffer, 40);
    TextDate.invalidate();
}
