import actionTypes from "../actions/actionTypes";
import { IAdminState } from "../../types";

const initialState: IAdminState = {
  isLoadingGender: false,
  genders: [],
  role: [],
  position: [],
  users: [],
  topDoctors: [],
  allDoctors: [],
  allScheduleTime: [],
  allRequiredDoctorInfo: {},
  allDoctorServices: [],
};

const adminReducer = (state: IAdminState = initialState, action: any): IAdminState => {
  switch (action.type) {
    case actionTypes.FETCH_GENDER_START:
      state.isLoadingGender = true;
      return {
        ...state,
      };

    case actionTypes.FETCH_GENDER_SUCCESS:
      state.genders = action.data;
      state.isLoadingGender = false;
      return {
        ...state,
      };

    case actionTypes.FETCH_GENDER_FAILED:
      state.genders = [];
      state.isLoadingGender = false;
      return {
        ...state,
      };

    case actionTypes.FETCH_POSITION_SUCCESS:
      state.position = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_POSITION_FAILED:
      state.position = [];
      return {
        ...state,
      };

    case actionTypes.FETCH_ROLE_SUCCESS:
      state.role = action.data;
      return {
        ...state,
      };

    case actionTypes.FETCH_ROLE_FAILED:
      state.role = [];
      return {
        ...state,
      };

    case actionTypes.FETCH_ALL_USER_SUCCESS:
      state.users = action.users;
      return {
        ...state,
      };

    case actionTypes.FETCH_ALL_USER_FAILED:
      state.users = [];
      return {
        ...state,
      };

    case actionTypes.FETCH_TOP_DOCTORS_SUCCESS:
      state.topDoctors = action.dataDoctor;
      return {
        ...state,
      };

    case actionTypes.FETCH_TOP_DOCTORS_FAILED:
      state.topDoctors = [];
      return {
        ...state,
      };

    case actionTypes.FETCH_ALL_DOCTORS_SUCCESS:
      state.allDoctors = action.dataDoctor;
      return {
        ...state,
      };

    case actionTypes.FETCH_ALL_DOCTORS_FAILED:
      state.allDoctors = [];
      return {
        ...state,
      };

    case actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_SUCCESS:
      state.allScheduleTime = action.dataTime;
      return {
        ...state,
      };

    case actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_FAILED:
      state.allScheduleTime = [];
      return {
        ...state,
      };
    default:
      return state;
    case actionTypes.FETCH_REQUIRED_DOCTOR_SUCCESS:
      state.allRequiredDoctorInfo = action.data;
      return {
        ...state,
      };
    case actionTypes.FETCH_REQUIRED_DOCTOR_FAILED:
      state.allRequiredDoctorInfo = {};
      return {
        ...state,
      };
    case actionTypes.FETCH_DOCTOR_SERVICES_SUCCESS:
      state.allDoctorServices = action.data;
      return {
        ...state,
      };
    case actionTypes.FETCH_DOCTOR_SERVICES_FAILED:
      return {
        ...state,
      };
  }
};

export default adminReducer;
