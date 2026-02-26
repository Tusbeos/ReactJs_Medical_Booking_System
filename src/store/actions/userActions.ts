import actionTypes from './actionTypes';
import { IUser } from '../../types';

export const addUserSuccess = () => ({
    type: actionTypes.ADD_USER_SUCCESS as typeof actionTypes.ADD_USER_SUCCESS
})
export const userLoginSuccess = (userInfo: IUser) => ({
  type: actionTypes.USER_LOGIN_SUCCESS as typeof actionTypes.USER_LOGIN_SUCCESS,
  userInfo: userInfo,
});
export const userLoginFail = () => ({
  type: actionTypes.USER_LOGIN_FAIL as typeof actionTypes.USER_LOGIN_FAIL,
});

export const processLogout = () => ({
  type: actionTypes.PROCESS_LOGOUT as typeof actionTypes.PROCESS_LOGOUT,
});