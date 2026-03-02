#ifndef POT4VIEW_HPP
#define POT4VIEW_HPP

#include <gui_generated/pot4_screen/Pot4ViewBase.hpp>
#include <gui/pot4_screen/Pot4Presenter.hpp>
#include <touchgfx/Unicode.hpp>
#include <cstdint>

class Pot4View : public Pot4ViewBase
{
public:
    Pot4View();
    virtual ~Pot4View() {}

    virtual void setupScreen() override;
    virtual void tearDownScreen() override;
    virtual void handleTickEvent() override;

    virtual void SetEau() override;
    virtual void ResetEau() override;

private:
    void updateIdleVideo();

    bool videoShown = false;
    uint32_t lastSoilPct = 0xFFFFFFFF;

    // ✅ détecter si le nom change
    char lastTitleName[33];
};

#endif // POT4VIEW_HPP
