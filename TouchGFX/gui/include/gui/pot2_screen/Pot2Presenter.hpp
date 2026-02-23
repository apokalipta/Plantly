#ifndef POT2PRESENTER_HPP
#define POT2PRESENTER_HPP

#include <gui/model/ModelListener.hpp>
#include <mvp/Presenter.hpp>

using namespace touchgfx;

class Pot2View;

class Pot2Presenter : public touchgfx::Presenter, public ModelListener
{
public:
    Pot2Presenter(Pot2View& v);

    /**
     * The activate function is called automatically when this screen is "switched in"
     * (ie. made active). Initialization logic can be placed here.
     */
    virtual void activate();

    /**
     * The deactivate function is called automatically when this screen is "switched out"
     * (ie. made inactive). Teardown functionality can be placed here.
     */
    virtual void deactivate();

    virtual ~Pot2Presenter() {}

private:
    Pot2Presenter();

    Pot2View& view;
};

#endif // POT2PRESENTER_HPP
