#ifndef POT3PRESENTER_HPP
#define POT3PRESENTER_HPP

#include <gui/model/ModelListener.hpp>
#include <mvp/Presenter.hpp>

using namespace touchgfx;

class Pot3View;

class Pot3Presenter : public touchgfx::Presenter, public ModelListener
{
public:
    Pot3Presenter(Pot3View& v);

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

    virtual ~Pot3Presenter() {}

private:
    Pot3Presenter();

    Pot3View& view;
};

#endif // POT3PRESENTER_HPP
