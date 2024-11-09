import {configureStore} from "@reduxjs/toolkit"
import userReducer from "./UserInfo"
import userFriendListReducer from "./UserFriendList"
import userChatReducer from "./chat"
export const store  = configureStore({
    reducer:{
        user:userReducer,
        userFriendList:userFriendListReducer,
        chat:userChatReducer
    }
})