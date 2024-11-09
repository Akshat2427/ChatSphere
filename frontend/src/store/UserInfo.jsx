import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user : null , 
    currentTakingTo: null
}
export const UserSlice = createSlice({
    name:"user",
    initialState,
    reducers:{
        setUser:(state,action)=>{
            state.user =  action.payload
            console.log("new USER", state.user);
        },
        setCurrentTakingTo:(state,action)=>{
            state.currentTakingTo =  action.payload
            console.log("new USER", state.currentTakingTo);
      
    }
}
})

export const {setUser} = UserSlice.actions
export const {setCurrentTakingTo} = UserSlice.actions
export default UserSlice.reducer