#ifndef SETTINGVIEW_HPP
#define SETTINGVIEW_HPP

#include <gui_generated/setting_screen/SettingViewBase.hpp>
#include <gui/setting_screen/SettingPresenter.hpp>
#include <touchgfx/Unicode.hpp>

class SettingView : public SettingViewBase
{
public:
    SettingView();
    virtual ~SettingView() {}

    virtual void setupScreen() override;
    virtual void tearDownScreen() override;
    virtual void handleTickEvent() override;

    // Bouton "RestartWIFI"
    virtual void RestartWIFI() override;

    // ✅ Toggle extérieur (persistant)
    virtual void toggleexterieur() override;

private:
    void updateIdleVideo();
    void updateQRCodeWithIp(const char* ip);

    bool videoShown = false;

    // 15 + fin
    touchgfx::Unicode::UnicodeChar ipBuffer[16];

    // SSID affiché (15 max)
    touchgfx::Unicode::UnicodeChar ssidBuffer[16];

    // dernière IP encodée dans QR
    char lastQrIp[16] = "0.0.0.0";
};

#endif // SETTINGVIEW_HPP
