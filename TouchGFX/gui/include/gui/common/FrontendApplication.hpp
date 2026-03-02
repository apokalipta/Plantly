#ifndef FRONTENDAPPLICATION_HPP
#define FRONTENDAPPLICATION_HPP

#include <gui_generated/common/FrontendApplicationBase.hpp>
#include <touchgfx/events/ClickEvent.hpp>
#include <touchgfx/events/DragEvent.hpp>
#include <touchgfx/events/GestureEvent.hpp>

class FrontendHeap;

using namespace touchgfx;

class FrontendApplication : public FrontendApplicationBase
{
public:
    FrontendApplication(Model& m, FrontendHeap& heap);
    virtual ~FrontendApplication() { }

    virtual void handleTickEvent() override;
    virtual void handleClickEvent(const touchgfx::ClickEvent& evt) override;
    virtual void handleDragEvent(const touchgfx::DragEvent& evt) override;
    virtual void handleGestureEvent(const touchgfx::GestureEvent& evt) override;

    bool isIdleVideoActive() const { return idleVideoActive; }

    // ✅ Mode extérieur (persistant tant que l’app tourne)
    void setExteriorMode(bool enabled);
    bool isExteriorModeEnabled() const { return exteriorMode; }

private:
    void resetInactivity();
    void activateIdleVideo();
    void deactivateIdleVideo();

    void enterScreenSleep();
    void exitScreenSleep();

private:
    uint32_t inactivityTicks = 0;
    uint32_t videoIdleTicks  = 0;

    bool idleVideoActive = false;
    bool screenSleeping = false;

    // ✅ mode extérieur
    bool exteriorMode = false;

    static constexpr uint32_t TICKS_PER_SECOND = 30;

    // ✅ délais dynamiques (en ticks)
    uint32_t idleVideoDelayTicks   = 30u * 60u * TICKS_PER_SECOND; // défaut 30 min
    uint32_t screenSleepDelayTicks = 30u * 60u * TICKS_PER_SECOND; // défaut 30 min
};

#endif // FRONTENDAPPLICATION_HPP