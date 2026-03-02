#ifndef POT3VIEW_HPP
#define POT3VIEW_HPP

#include <gui_generated/pot3_screen/Pot3ViewBase.hpp>
#include <gui/pot3_screen/Pot3Presenter.hpp>
#include <touchgfx/Unicode.hpp>
#include <cstdint>

class Pot3View : public Pot3ViewBase
{
public:
    Pot3View();
    virtual ~Pot3View() {}

    virtual void setupScreen() override;
    virtual void tearDownScreen() override;
    virtual void handleTickEvent() override;

    virtual void SetEau() override;
    virtual void ResetEau() override;

private:
    void updateIdleVideo();

    bool videoShown = false;
    uint32_t lastSoilPct = 0xFFFFFFFF;

    char lastTitleName[33];
};

#endif // POT3VIEW_HPP
