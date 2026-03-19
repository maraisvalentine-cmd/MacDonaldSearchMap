import {createSlice} from '@reduxjs/toolkit';

const locateSlice = createSlice({
    name: 'mapLocate',
    initialState: {value: false},
    reducers: {
        doLocate: state => {
            state.value = true;
        },
        resetLocate: state => {
            state.value = false;
        }
    }

});

export const {doLocate, resetLocate} = locateSlice.actions;
export default locateSlice.reducer;