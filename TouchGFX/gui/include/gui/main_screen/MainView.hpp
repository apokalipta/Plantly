#ifndef MAINVIEW_HPP
#define MAINVIEW_HPP

#include <gui_generated/main_screen/MainViewBase.hpp>
#include <gui/main_screen/MainPresenter.hpp>
#include <touchgfx/Unicode.hpp>

class MainView : public MainViewBase
{
public:
    MainView();
    virtual ~MainView() {}

    virtual void setupScreen() override;
    virtual void tearDownScreen() override;

    virtual void handleTickEvent() override;

private:
    void updateIdleVideo();
    bool videoShown = false;

    // Buffer wildcard pour TextDate
    touchgfx::Unicode::UnicodeChar textDateBuffer[40];

    // Dernière valeur affichée (évite de refresh pour rien)
    uint8_t last_h = 255, last_m = 255, last_s = 255;
    uint8_t last_d = 255, last_mo = 255;
    uint16_t last_y = 65535;

    touchgfx::Unicode::UnicodeChar humBuffer[10];
    uint32_t lastHum = 0xFFFFFFFF;

    touchgfx::Unicode::UnicodeChar tempBuffer[10];
    int32_t lastTemp = 0x7FFFFFFF;

    // Luminosité
    touchgfx::Unicode::UnicodeChar luxBuffer[16];
    uint32_t lastLux = 0xFFFFFFFF;


    void updateClockAndDate(uint8_t hh, uint8_t mm, uint8_t ss, uint8_t dd, uint8_t mo, uint16_t yyyy);
};

#endif // MAINVIEW_HPP
