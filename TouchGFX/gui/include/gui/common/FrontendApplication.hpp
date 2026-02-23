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

private:
    void resetInactivity();
    void activateIdleVideo();
    void deactivateIdleVideo();

    void enterScreenSleep();
    void exitScreenSleep();

private:
    uint32_t inactivityTicks = 0;
    uint32_t videoIdleTicks = 0;

    bool idleVideoActive = false;
    bool screenSleeping = false;

    static constexpr uint32_t TICKS_PER_SECOND = 30;
    static constexpr uint32_t IDLE_VIDEO_DELAY = 10000 * TICKS_PER_SECOND;   // 5 s
    static constexpr uint32_t SCREEN_SLEEP_DELAY = 10000 * TICKS_PER_SECOND; // 5 s après vidéo
};

#endif // FRONTENDAPPLICATION_HPP
