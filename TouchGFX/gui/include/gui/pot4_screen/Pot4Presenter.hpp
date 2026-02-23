#ifndef POT4PRESENTER_HPP
#define POT4PRESENTER_HPP

#include <gui/model/ModelListener.hpp>
#include <mvp/Presenter.hpp>

using namespace touchgfx;

class Pot4View;

class Pot4Presenter : public touchgfx::Presenter, public ModelListener
{
public:
    Pot4Presenter(Pot4View& v);

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

    virtual ~Pot4Presenter() {}

private:
    Pot4Presenter();

    Pot4View& view;
};

#endif // POT4PRESENTER_HPP
