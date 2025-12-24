import {createSlice} from "@reduxjs/toolkit";

const incomeSlice  = createSlice({
    name: 'income',
    initialState: {
        value : []
    },
    reducers: {
        AddIncome (state, action) {
            state.value =  [...state.value,action.payload]
        },
        RemoveIncome (state, action) {
            state.value =  [...state.value.filter(item => item.id !== action.payload)];
        }
    }
})


export const { AddIncome, RemoveIncome } = incomeSlice.actions;
export default incomeSlice.reducer;