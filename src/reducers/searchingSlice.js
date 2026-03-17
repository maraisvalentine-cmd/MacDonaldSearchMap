import {createSlice} from '@reduxjs/toolkit';

const searchingSlice = createSlice({
    name: 'mapSearch',
    initialState: {value: false},
    reducers: {
        doSearch: state => {
            state.value = true;
        },
        resetSearch: state => {
            state.value = false;
        }
    }

});

export const {doSearch, resetSearch} = searchingSlice.actions;
export default searchingSlice.reducer;