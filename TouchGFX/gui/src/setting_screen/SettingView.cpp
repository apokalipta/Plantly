#include <gui/setting_screen/SettingView.hpp>
#include <gui/common/FrontendApplication.hpp>
#include <touchgfx/Unicode.hpp>
#include <cstdio>
#include <cstring>

// Valeurs venant du main.c (4 pots)
extern "C" volatile uint32_t g_soil_adc[4];
extern "C" volatile uint32_t g_soil_percent[4];

extern "C" bool Plantly_IP_Get(char* out, uint16_t outLen);
extern "C" bool Plantly_SSID_Get(char* out, uint16_t outLen);
extern "C" void Plantly_WiFi_Clear_Request(void);

namespace
{
    static constexpr uint32_t SETTING_POT_INDEX = 0;

    // Seuils ADC (à ajuster)
    static constexpr uint32_t ADC_TRES_SEC = 500;
    static constexpr uint32_t ADC_OK       = 1000;

    static constexpr uint16_t UI_STR_LEN = 16; // 15 + '\0'
}

SettingView::SettingView()
{
}

void SettingView::setupScreen()
{
    SettingViewBase::setupScreen();

    // ✅ Remet le toggle selon l’état mémorisé dans l’app
    FrontendApplication& app = static_cast<FrontendApplication&>(application());
    toggle_exterieur.forceState(app.isExteriorModeEnabled());
    toggle_exterieur.invalidate();

    // IP
    ValIp.setWildcard(ipBuffer);
    touchgfx::Unicode::snprintf(ipBuffer, UI_STR_LEN, "0.0.0.0");
    ValIp.invalidate();

    // SSID
    ValSSID.setWildcard(ssidBuffer);
    touchgfx::Unicode::snprintf(ssidBuffer, UI_STR_LEN, "...");
    ValSSID.invalidate();

    // QR init
    std::strncpy(lastQrIp, "0.0.0.0", sizeof(lastQrIp));
    lastQrIp[sizeof(lastQrIp) - 1] = '\0';
    updateQRCodeWithIp(lastQrIp);

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
    // IP + QR
    char ip[16] = {0};
    if (Plantly_IP_Get(ip, sizeof(ip)))
    {
        touchgfx::Unicode::fromUTF8((uint8_t*)ip, ipBuffer, UI_STR_LEN);
        ValIp.invalidate();

        if (std::strncmp(ip, lastQrIp, sizeof(lastQrIp)) != 0)
        {
            std::strncpy(lastQrIp, ip, sizeof(lastQrIp));
            lastQrIp[sizeof(lastQrIp) - 1] = '\0';
            updateQRCodeWithIp(lastQrIp);
        }
    }

    // SSID
    char ssid[64] = {0};
    if (Plantly_SSID_Get(ssid, sizeof(ssid)))
    {
        touchgfx::Unicode::fromUTF8((uint8_t*)ssid, ssidBuffer, UI_STR_LEN);
        ValSSID.invalidate();
    }

    updateIdleVideo();
    SettingViewBase::handleTickEvent();
}

void SettingView::toggleexterieur()
{
    // ✅ TouchGFX a déjà changé l’état du toggle au moment où cette action est appelée.
    // On récupère le nouvel état et on l’enregistre dans FrontendApplication.
    FrontendApplication& app = static_cast<FrontendApplication&>(application());

    bool enabled = toggle_exterieur.getState();
    app.setExteriorMode(enabled);

    // (optionnel) si tu veux être sûr que le widget est bien à jour
    toggle_exterieur.forceState(enabled);
    toggle_exterieur.invalidate();
}

void SettingView::updateQRCodeWithIp(const char* ip)
{
    if (!ip || !ip[0])
    {
        qrCode.convertStringToQRCode("0.0.0.0");
        qrCode.invalidate();
        return;
    }

    bool ok = qrCode.convertStringToQRCode(ip);
    if (!ok)
    {
        qrCode.convertStringToQRCode("0.0.0.0");
    }
    qrCode.invalidate();
}

void SettingView::updateIdleVideo()
{
    FrontendApplication& app = static_cast<FrontendApplication&>(application());

    if (app.isIdleVideoActive())
    {
        if (!videoShown)
        {
            videoShown = true;

            uint32_t hum_adc = g_soil_adc[SETTING_POT_INDEX];

            contente.setVisible(false);
            froid.setVisible(false);
            chaud.setVisible(false);

            contente.stopAnimation();
            froid.stopAnimation();
            chaud.stopAnimation();

            contente.invalidate();
            froid.invalidate();
            chaud.invalidate();

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

void SettingView::RestartWIFI()
{
    // 1) Commande vers ESP32
    Plantly_WiFi_Clear_Request();

    // 2) Feedback UI
    touchgfx::Unicode::snprintf(ssidBuffer, UI_STR_LEN, "reset...");
    ValSSID.invalidate();

    touchgfx::Unicode::snprintf(ipBuffer, UI_STR_LEN, "0.0.0.0");
    ValIp.invalidate();

    // 3) QR reset
    std::strncpy(lastQrIp, "0.0.0.0", sizeof(lastQrIp));
    lastQrIp[sizeof(lastQrIp) - 1] = '\0';
    updateQRCodeWithIp(lastQrIp);
}
