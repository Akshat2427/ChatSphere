import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    chat: []  
};

export const UserChatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setChat: (state, action) => {
            state.chat = []
            state.chat.push(action.payload);
            console.log("action in chat", action.payload);
            console.log("Updated chat:", state.chat);
        },
    }
});

export const { setChat } = UserChatSlice.actions;
export default UserChatSlice.reducer;