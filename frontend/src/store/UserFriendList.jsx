import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userFriendList: null
}

export const UserFriendListSlice = createSlice({
    name: "userFriendList",
    initialState,
    reducers: {
        setUserFriendList: (state, action) => {
            const obj = action.payload;
            if (obj != null) {
                state.userFriendList = obj;
                console.log("new USER List 1", state.userFriendList);
            } else {
                console.log("Payload is null, not updating state");
            }
        }
    }
});

export const { setUserFriendList } = UserFriendListSlice.actions;
export default UserFriendListSlice.reducer;
