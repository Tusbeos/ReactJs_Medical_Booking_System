import locationHelperBuilder from "redux-auth-wrapper/history4/locationHelper";
import { connectedRouterRedirect } from "redux-auth-wrapper/history4/redirect";
import { USER_ROLE } from "../utils";
import { IRootState } from "../types";

const locationHelper = locationHelperBuilder({});

export const userIsAuthenticated = connectedRouterRedirect({
  authenticatedSelector: (state) => state.user.isLoggedIn,
  wrapperDisplayName: "UserIsAuthenticated",
  redirectPath: "/login",
});

export const userIsAdmin = connectedRouterRedirect({
  authenticatedSelector: (state) =>
    state.user.isLoggedIn && state.user.userInfo?.roleId === USER_ROLE.ADMIN,
  wrapperDisplayName: "UserIsAdmin",
  redirectPath: (state) => {
    if (
      state.user.isLoggedIn &&
      state.user.userInfo?.roleId === USER_ROLE.DOCTOR
    ) {
      return "/doctor/manage-schedule";
    }
    return "/login";
  },
});

export const userIsDoctorOrAdmin = connectedRouterRedirect({
  authenticatedSelector: (state) => {
    const role = state.user.userInfo?.roleId;
    return (
      state.user.isLoggedIn &&
      (role === USER_ROLE.DOCTOR || role === USER_ROLE.ADMIN)
    );
  },
  wrapperDisplayName: "UserIsDoctorOrAdmin",
  redirectPath: (state) => {
    if (state.user.isLoggedIn) return "/";
    return "/login";
  },
});

export const userIsDoctor = connectedRouterRedirect({
  authenticatedSelector: (state) =>
    state.user.isLoggedIn && state.user.userInfo?.roleId === USER_ROLE.DOCTOR,
  wrapperDisplayName: "UserIsDoctor",
  redirectPath: (state) => {
    if (
      state.user.isLoggedIn &&
      state.user.userInfo?.roleId === USER_ROLE.ADMIN
    ) {
      return "/system/user-manage";
    }
    return "/login";
  },
});

export const userIsNotAuthenticated = connectedRouterRedirect({
  authenticatedSelector: (state) => !state.user.isLoggedIn,
  wrapperDisplayName: "UserIsNotAuthenticated",
  redirectPath: (state, ownProps) =>
    locationHelper.getRedirectQueryParam(ownProps) || "/",
  allowRedirectBack: false,
});