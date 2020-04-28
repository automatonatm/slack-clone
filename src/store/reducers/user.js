
import * as actionTypes from '../actions/actionTypes'

const initialUserState = {
    currentUser: null,
    isLoading: true
}

const user_reducer = (state = initialUserState, action) => {
    switch (action.type) {
        case actionTypes.SET_USER:
            return {
                ...state,
                currentUser:action.payload.currentUser,
                isLoading: false
            }

        case actionTypes.CLEAR_USER:
            return {
                ...state,
                currentUser: null,
                isLoading: false
            }
        case actionTypes.SET_USER_POSTS:
            return  {
                ...state,
                posts: action.payload.posts
            }
        default:
            return state
    }
}

export default user_reducer





