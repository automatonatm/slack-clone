import {combineReducers} from "redux";
import  user_reducer from './user'
import channels from './channels'



const rootReducer = combineReducers({
    user: user_reducer,
    channels: channels //currentChannel: channels
})


export default rootReducer



