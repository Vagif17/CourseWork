import {configureStore} from '@reduxjs/toolkit'
import incomeSlice from './slices/incomeSlice.js'
import expenseSlice from "./slices/expenseSlice.js";

export const store = configureStore({
    reducer: {
        income: incomeSlice,
        expense : expenseSlice,
    }
})