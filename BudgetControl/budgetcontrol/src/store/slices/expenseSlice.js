import {createSlice} from "@reduxjs/toolkit";

const expenseSlice  = createSlice({
    name: 'expense ',
    initialState: {
        value : [       ]
    },
    reducers: {
        AddExpense (state, action) {
            state.value =  [...state.value,action.payload]
        },
        RemoveExpense (state, action) {
            state.value =  [...state.value.filter(item => item.id !== action.payload)];
        }
    }
})


export const { AddExpense, RemoveExpense } = expenseSlice.actions;
export default expenseSlice.reducer;