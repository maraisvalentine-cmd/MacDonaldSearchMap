import {createSlice} from '@reduxjs/toolkit';

const restaurantsListSlice = createSlice({
    name: 'restaurantList',
    initialState: {value: []},
    reducers: {
        setRestaurantsList: (state, action) => {
            state.value = action.payload;
        },
        resetRestaurantsList: state => {
            state.value = {};
        }
    }

});

export const {setRestaurantsList, resetRestaurantsList} = restaurantsListSlice.actions;
export default restaurantsListSlice.reducer;