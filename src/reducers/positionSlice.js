import {createSlice} from '@reduxjs/toolkit';

const positionSlice = createSlice({
    name: 'mapPosition',
    initialState: {value: [48.8611, 2.3484]},
    reducers: {
        setPosition: (state, action) => {
            state.value = action.payload;
        },
        resetPosition: state => {
            state.value = [48.8611, 2.3484];
        }
    }

});

export const {setPosition, resetPosition} = positionSlice.actions;
export default positionSlice.reducer;