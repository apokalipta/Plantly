#ifndef POT1VIEW_HPP
#define POT1VIEW_HPP

#include <gui_generated/pot1_screen/Pot1ViewBase.hpp>
#include <gui/pot1_screen/Pot1Presenter.hpp>
#include <cstdint>

class Pot1View : public Pot1ViewBase
{
public:
    Pot1View();
    virtual ~Pot1View() {}

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

#endif // POT1VIEW_HPP
