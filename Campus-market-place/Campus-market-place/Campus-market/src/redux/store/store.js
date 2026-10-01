import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../slice/createSlice.js";

export const store = configureStore({
    reducer: {
        counter: counterReducer,    
        },  
    });