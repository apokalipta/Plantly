#include <gui/setting_screen/SettingView.hpp>
#include <gui/common/FrontendApplication.hpp>
#include <touchgfx/Unicode.hpp>
#include <cstdio>

// ✅ Valeurs venant du main.c (4 pots)
extern "C" volatile uint32_t g_soil_adc[4];
extern "C" volatile uint32_t g_soil_percent[4];

extern "C" bool Plantly_IP_Get(char* out, uint16_t outLen);

namespace
{
    // ✅ Pot utilisé pour l’écran Settings (0=Pot1, 1=Pot2, 2=Pot3, 3=Pot4)
    static constexpr uint32_t SETTING_POT_INDEX = 0;

    // ⚠️ Seuils ADC (à ajuster selon ton capteur)
    // Plus l'ADC est BAS => plus c'est mouillé (dans ton mapping)
    static constexpr uint32_t ADC_TRES_SEC = 500;   // < 500 => très mouillé / (selon ton ancien code)
    static constexpr uint32_t ADC_OK       = 1000;  // 500..1000 => ok
}

SettingView::SettingView()
{
}

void SettingView::setupScreen()
{
    SettingViewBase::setupScreen();

    // ✅ wildcard IP
    ValIp.setWildcard(ipBuffer);
    touchgfx::Unicode::snprintf(ipBuffer, 16, "0.0.0.0");
    ValIp.invalidate();

    // Animations cachées au départ
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
}

void SettingView::tearDownScreen()
{
    contente.stopAnimation(); contente.setVisible(false);
    froid.stopAnimation();    froid.setVisible(false);
    chaud.stopAnimation();    chaud.setVisible(false);

    contente.invalidate();
    froid.invalidate();
    chaud.invalidate();

    videoShown = false;
    SettingViewBase::tearDownScreen();
}

void SettingView::handleTickEvent()
{
    // ✅ update IP
    char ip[16];
    if (Plantly_IP_Get(ip, sizeof(ip)))
    {
        touchgfx::Unicode::fromUTF8((uint8_t*)ip, ipBuffer, 16);
        ValIp.invalidate();
    }

    updateIdleVideo();
    SettingViewBase::handleTickEvent();
}

void SettingView::updateIdleVideo()
{
    FrontendApplication& app = static_cast<FrontendApplication&>(application());

    if (app.isIdleVideoActive())
    {
        if (!videoShown)
        {
            videoShown = true;

            // ✅ On prend l'ADC du pot choisi
            uint32_t hum_adc = g_soil_adc[SETTING_POT_INDEX];

            // reset affichage
            contente.setVisible(false);
            froid.setVisible(false);
            chaud.setVisible(false);

            contente.stopAnimation();
            froid.stopAnimation();
            chaud.stopAnimation();

            contente.invalidate();
            froid.invalidate();
            chaud.invalidate();

            // ⚠️ même logique que ton code d'avant (basé ADC)
            if (hum_adc < ADC_TRES_SEC)
            {
                chaud.setVisible(true);
                chaud.startAnimation(true, false, true);
                chaud.invalidate();
            }
            else if (hum_adc <= ADC_OK)
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

            contente.stopAnimation(); contente.setVisible(false);
            froid.stopAnimation();    froid.setVisible(false);
            chaud.stopAnimation();    chaud.setVisible(false);

            contente.invalidate();
            froid.invalidate();
            chaud.invalidate();
        }
    }
}
