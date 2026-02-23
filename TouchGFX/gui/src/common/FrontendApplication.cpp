#include <gui/common/FrontendApplication.hpp>
#include <touchgfx/hal/HAL.hpp>
#include "main.h"   // pour LCD_BL_CTRL_GPIO_Port / LCD_BL_CTRL_Pin

FrontendApplication::FrontendApplication(Model& m, FrontendHeap& heap)
    : FrontendApplicationBase(m, heap)
{
}

void FrontendApplication::handleTickEvent()
{
    model.tick();

    // 1️⃣ Si écran en veille → on ne fait rien
    if (screenSleeping)
    {
        FrontendApplicationBase::handleTickEvent();
        return;
    }

    // 2️⃣ Si la vidéo n'est pas encore lancée → timer normal
    if (!idleVideoActive)
    {
        inactivityTicks++;
        if (inactivityTicks >= IDLE_VIDEO_DELAY)
        {
            activateIdleVideo();
        }
    }
    else
    {
        // 3️⃣ Vidéo active → on compte avant mise en veille écran
        videoIdleTicks++;
        if (videoIdleTicks >= SCREEN_SLEEP_DELAY)
        {
            enterScreenSleep();
        }
    }

    FrontendApplicationBase::handleTickEvent();
}

void FrontendApplication::handleClickEvent(const touchgfx::ClickEvent& evt)
{
    // 🔥 Si écran éteint → on le rallume et on bloque l'event
    if (screenSleeping)
    {
        exitScreenSleep();
        return;
    }

    // 🔥 Si vidéo active → stop vidéo + retour main
    if (idleVideoActive)
    {
        if (evt.getType() == touchgfx::ClickEvent::RELEASED)
        {
            deactivateIdleVideo();
            gotoMainScreenNoTransition();
        }
        return;
    }

    resetInactivity();
    FrontendApplicationBase::handleClickEvent(evt);
}

void FrontendApplication::handleDragEvent(const touchgfx::DragEvent& evt)
{
    if (screenSleeping)
    {
        exitScreenSleep();
        return;
    }

    if (idleVideoActive)
    {
        deactivateIdleVideo();
        gotoMainScreenNoTransition();
        return;
    }

    resetInactivity();
    FrontendApplicationBase::handleDragEvent(evt);
}

void FrontendApplication::handleGestureEvent(const touchgfx::GestureEvent& evt)
{
    if (screenSleeping)
    {
        exitScreenSleep();
        return;
    }

    if (idleVideoActive)
    {
        deactivateIdleVideo();
        gotoMainScreenNoTransition();
        return;
    }

    resetInactivity();
    FrontendApplicationBase::handleGestureEvent(evt);
}

// ------------------ LOGIQUE ------------------

void FrontendApplication::resetInactivity()
{
    inactivityTicks = 0;
    videoIdleTicks = 0;
}

void FrontendApplication::activateIdleVideo()
{
    idleVideoActive = true;
    videoIdleTicks = 0;
}

void FrontendApplication::deactivateIdleVideo()
{
    idleVideoActive = false;
    resetInactivity();
}

void FrontendApplication::enterScreenSleep()
{
    screenSleeping = true;
    HAL_GPIO_WritePin(LCD_BL_CTRL_GPIO_Port, LCD_BL_CTRL_Pin, GPIO_PIN_RESET);
    HAL_GPIO_WritePin(LCD_DISP_GPIO_Port, LCD_DISP_Pin, GPIO_PIN_RESET);
}

void FrontendApplication::exitScreenSleep()
{
    HAL_GPIO_WritePin(LCD_DISP_GPIO_Port, LCD_DISP_Pin, GPIO_PIN_SET);
    HAL_GPIO_WritePin(LCD_BL_CTRL_GPIO_Port, LCD_BL_CTRL_Pin, GPIO_PIN_SET);

    screenSleeping = false;
    deactivateIdleVideo();
    gotoMainScreenNoTransition();
}


