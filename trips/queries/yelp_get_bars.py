# import get_locations from LocationRepo
from .requests_yelp import (API_KEY, yelp_get_bar)
from .bars import BarsRepository, BarIn

def bar_in_db(API_KEY, yelp_id):
    # use get_bars to check if location exists in db
    bars_repo = BarsRepository()
    db_result = bars_repo.get_bar(yelp_id=yelp_id)
    if db_result:
        return db_result
    else:
        try:
            yelp_result = yelp_get_bar(API_KEY, yelp_id)
            yelp_id = yelp_result["id"]
            bar_name = yelp_result["name"]
            url = yelp_result["url"]
            lat = yelp_result["coordinates"]["latitude"]
            long = yelp_result["coordinates"]["longitude"]
            price = yelp_result["price"]
            new_bar = BarIn(yelp_id=yelp_id, bar_name=bar_name, url=url, lat=lat, long=long, price=price)
            return bars_repo.create_bar(bar=new_bar)
        except Exception as e:
            print(e)
            return "please enter valid Business id"



def categories():
    pass