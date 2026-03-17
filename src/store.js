import {configureStore} from '@reduxjs/toolkit';
import searchingReducer from './reducers/searchingSlice.js';
import locateReducer from './reducers/locateSlice.js';
import positionReducer from './reducers/positionSlice.js';
import selectedRestaurantReducer from './reducers/selectedRestaurantSlice.js';
import restaurantsListReducer from './reducers/restaurantsListSlice.js';

const store = configureStore({
    reducer: {
        mapSearch: searchingReducer,
        mapLocate: locateReducer,
        position: positionReducer,
        selectedRestaurant: selectedRestaurantReducer,
        restaurantsList: restaurantsListReducer,
    }
});

export default store;