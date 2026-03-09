import actionTypes from "../actions/actionTypes";
import { IUserState } from "../../types";

const initialState: IUserState = {
  isLoggedIn: false,
  userInfo: null,
  token: null,
};

const appReducer = (
  state: IUserState = initialState,
  action: any,
): IUserState => {
  switch (action.type) {
    case actionTypes.USER_LOGIN_SUCCESS:
      return {
        ...state,
        isLoggedIn: true,
        userInfo: action.userInfo,
        token: action.token || null,
      };
    case actionTypes.USER_LOGIN_FAIL:
      return {
        ...state,
        isLoggedIn: false,
        userInfo: null,
        token: null,
      };
    case actionTypes.PROCESS_LOGOUT:
      return {
        ...state,
        isLoggedIn: false,
        userInfo: null,
        token: null,
      };
    default:
      return state;
  }
};

export default appReducer;
