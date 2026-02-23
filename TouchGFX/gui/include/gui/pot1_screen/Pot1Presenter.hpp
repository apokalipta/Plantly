#ifndef POT1PRESENTER_HPP
#define POT1PRESENTER_HPP

#include <gui/model/ModelListener.hpp>
#include <mvp/Presenter.hpp>

using namespace touchgfx;

class Pot1View;

class Pot1Presenter : public touchgfx::Presenter, public ModelListener
{
public:
    Pot1Presenter(Pot1View& v);

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

    virtual ~Pot1Presenter() {}

private:
    Pot1Presenter();

    Pot1View& view;
};

#endif // POT1PRESENTER_HPP
