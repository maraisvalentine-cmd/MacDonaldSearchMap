import {createSlice} from '@reduxjs/toolkit';

const selectedRestaurantSlice = createSlice({
    name: 'selectedRestaurant',
    initialState: {value: {}},
    reducers: {
        setSelectedRestaurant: (state, action) => {
            state.value = action.payload;
        },
        resetSelectedRestaurant: state => {
            state.value = {};
        }
    }

});

export const {setSelectedRestaurant, resetSelectedRestaurant} = selectedRestaurantSlice.actions;
export default selectedRestaurantSlice.reducer;