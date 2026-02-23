#ifndef POT2VIEW_HPP
#define POT2VIEW_HPP

#include <gui_generated/pot2_screen/Pot2ViewBase.hpp>
#include <gui/pot2_screen/Pot2Presenter.hpp>

class Pot2View : public Pot2ViewBase
{
public:
    Pot2View();
    virtual ~Pot2View() {}

    virtual void setupScreen() override;
    virtual void tearDownScreen() override;

    virtual void handleTickEvent() override;

private:
    void updateIdleVideo();
    bool videoShown = false;

    uint32_t lastSoilPct = 0xFFFFFFFF;
};

#endif // POT2VIEW_HPP
