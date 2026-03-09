import actionTypes from "./actionTypes";
import { toast } from "react-toastify";
import {
  handleGetAllCodeService,
  handleCreateNewUserService,
  handleGetAllUsers,
  handleDeleteUserService,
  handleEditUserService,
} from "../../services/userService";
import {
  handleGetTopDoctorHomeService,
  handleGetAllDoctorsService,
  saveDetailDoctorService,
  saveBulkDoctorServices,
  getAllDoctorServices,
} from "../../services/doctorService";
import { IUser } from "../../types";

// Create a new user
export const createNewUser = (data: Partial<IUser>) => {
  return async (dispatch: any) => {
    try {
      let res = await handleCreateNewUserService(data);
      console.log("check create user redux", res);
      if (res && res.success) {
        toast.success("Create a new user success!");
        dispatch(saveUserSuccess());
        dispatch(fetchAllUsersStart());
      } else {
        dispatch(saveUserFailed());
      }
    } catch (e) {
      dispatch(saveUserFailed());
      console.error(e);
    }
  };
};

export const fetchAllUsersStart = () => {
  return async (dispatch: any) => {
    try {
      let res = await handleGetAllUsers();
      if (res && res.success) {
        dispatch(fetchAllUsersSuccess(res.data.reverse()));
      } else {
        toast.error("Fetch all users failed!");
        dispatch(fetchAllUsersFailed());
      }
    } catch (e) {
      toast.error("Fetch all users failed!");
      dispatch(fetchAllUsersFailed());
      console.error(e);
    }
  };
};
// Delete a user
export const deleteUserStart = (userId: number | string) => {
  return async (dispatch: any) => {
    try {
      let res = await handleDeleteUserService(userId);
      if (res && res.success) {
        toast.success("Delete the user success!");
        dispatch(fetchAllUsersStart());
        dispatch(deleteUserSuccess(res.data));
      } else {
        toast.error("Delete the user failed!");
        dispatch(deleteUserFailed());
      }
    } catch (e) {
      toast.error("Delete the user failed!");
      dispatch(deleteUserFailed());
      console.error(e);
    }
  };
};
// Edit a user
export const editUserStart = (data: Partial<IUser>) => {
  return async (dispatch: any) => {
    try {
      let res = await handleEditUserService(data);
      if (res && res.success) {
        toast.success("Update the user success!");
        dispatch(editUserSuccess());
        dispatch(fetchAllUsersStart());
      } else {
        dispatch(editUserFailed());
      }
    } catch (e) {
      toast.error("Update the user failed!");
      dispatch(editUserFailed());
      console.error(e);
    }
  };
};
// Fetch top doctors for home page
export const fetchTopDoctorStart = () => {
  return async (dispatch: any) => {
    try {
      let res = await handleGetTopDoctorHomeService(10);
      if (res && res.success) {
        dispatch({
          type: actionTypes.FETCH_TOP_DOCTORS_SUCCESS,
          dataDoctor: res.data,
        });
      } else {
        dispatch({ type: actionTypes.FETCH_TOP_DOCTORS_FAILED });
      }
    } catch (e) {
      dispatch({ type: actionTypes.FETCH_TOP_DOCTORS_FAILED });
      console.error(e);
    }
  };
};
// Fetch all doctors
export const fetchAllDoctorsStart = () => {
  return async (dispatch: any) => {
    try {
      let res = await handleGetAllDoctorsService();
      if (res && res.success) {
        dispatch({
          type: actionTypes.FETCH_ALL_DOCTORS_SUCCESS,
          dataDoctor: res.data,
        });
      } else {
        dispatch({ type: actionTypes.FETCH_ALL_DOCTORS_FAILED });
      }
    } catch (e) {
      dispatch({ type: actionTypes.FETCH_ALL_DOCTORS_FAILED });
      console.error(e);
    }
  };
};
// Save Info doctor to Markdown table
export const saveDetailDoctorsStart = (data: any) => {
  return async (dispatch: any) => {
    try {
      let res = await saveDetailDoctorService(data);
      if (res && res.success) {
        toast.success("Save info doctor success!");
        dispatch({
          type: actionTypes.SAVE_DETAIL_DOCTOR_SUCCESS,
        });
      } else {
        toast.error("Save info doctor failed!");
        dispatch({ type: actionTypes.SAVE_DETAIL_DOCTOR_FAILED });
      }
    } catch (e) {
      toast.error("Save info doctor failed!");
      dispatch({ type: actionTypes.SAVE_DETAIL_DOCTOR_FAILED });
      console.error(e);
    }
  };
};
// Fetch all schedule time
export const fetchAllScheduleTime = () => {
  return async (dispatch: any) => {
    try {
      let res = await handleGetAllCodeService("TIME");
      if (res && res.success) {
        dispatch({
          type: actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_SUCCESS,
          dataTime: res.data,
        });
      } else {
        dispatch({ type: actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_FAILED });
      }
    } catch (e) {
      dispatch({ type: actionTypes.FETCH_ALLCODE_SCHEDULE_TIME_FAILED });
      console.error(e);
    }
  };
};
// Fetch doctor price, payment, province
export const fetchRequiredDoctorInfo = () => {
  return async (dispatch: any) => {
    try {
      let resPrice = await handleGetAllCodeService("PRICE");
      let resPayment = await handleGetAllCodeService("PAYMENT");
      let resProvince = await handleGetAllCodeService("PROVINCE");
      if (
        resPrice &&
        resPrice.errCode === 0 &&
        resPayment &&
        resPayment.errCode === 0 &&
        resProvince &&
        resProvince.errCode === 0
      ) {
        let data = {
          resPrice: resPrice.data,
          resPayment: resPayment.data,
          resProvince: resProvince.data,
        };
        dispatch(fetchRequiredDoctorInfoSuccess(data));
      } else {
        dispatch(fetchRequiredDoctorInfoFailed());
      }
    } catch (e) {
      dispatch(fetchRequiredDoctorInfoFailed());
      console.error(e);
    }
  };
};
// Save doctor services
export const saveDoctorServices = (data: any) => {
  return async (dispatch: any) => {
    try {
      let res = await saveBulkDoctorServices(data);
      if (res && res.success) {
        dispatch({ type: actionTypes.SAVE_DOCTOR_SERVICES_SUCCESS });
      } else {
        dispatch({ type: actionTypes.SAVE_DOCTOR_SERVICES_FAILED });
      }
    } catch (e) {
      dispatch({ type: actionTypes.SAVE_DOCTOR_SERVICES_FAILED });
    }
  };
};
// Fetch doctor services
export const fetchDoctorServices = (doctorId: number | string) => {
  return async (dispatch: any) => {
    try {
      let res = await getAllDoctorServices(doctorId);
      if (res && res.success) {
        dispatch({
          type: actionTypes.FETCH_DOCTOR_SERVICES_SUCCESS,
          data: res.data,
        });
      } else {
        dispatch({ type: actionTypes.FETCH_DOCTOR_SERVICES_FAILED });
      }
    } catch (e) {
      dispatch({ type: actionTypes.FETCH_DOCTOR_SERVICES_FAILED });
      console.error(e);
    }
  };
};
export const fetchGenderStart = () => {
  return async (dispatch: any) => {
    try {
      dispatch({ type: actionTypes.FETCH_GENDER_START });
      let res = await handleGetAllCodeService("GENDER");
      if (res && (res.success || res.errCode === 0)) {
        dispatch(fetchGenderSuccess(res.data));
      } else {
        dispatch(fetchGenderFailed());
      }
    } catch (e) {
      dispatch(fetchGenderFailed());
      console.error(e);
    }
  };
};

export const fetchPositionStart = () => {
  return async (dispatch: any) => {
    try {
      let res = await handleGetAllCodeService("POSITION");
      if (res && (res.success || res.errCode === 0)) {
        dispatch(fetchPositionSuccess(res.data));
      } else {
        dispatch(fetchPositionFailed());
      }
    } catch (e) {
      dispatch(fetchPositionFailed());
      console.error(e);
    }
  };
};

export const fetchRoleStart = () => {
  return async (dispatch: any) => {
    try {
      let res = await handleGetAllCodeService("ROLE");
      if (res && (res.success || res.errCode === 0)) {
        dispatch(fetchRoleSuccess(res.data));
      } else {
        dispatch(fetchRoleFailed());
      }
    } catch (e) {
      dispatch(fetchRoleFailed());
      console.error(e);
    }
  };
};

export const fetchGenderSuccess = (genderData: any[]) => ({
  type: actionTypes.FETCH_GENDER_SUCCESS,
  data: genderData,
});

export const fetchGenderFailed = () => ({
  type: actionTypes.FETCH_GENDER_FAILED,
});

export const fetchPositionSuccess = (positionData: any[]) => ({
  type: actionTypes.FETCH_POSITION_SUCCESS,
  data: positionData,
});

export const fetchPositionFailed = () => ({
  type: actionTypes.FETCH_POSITION_FAILED,
});

export const fetchRoleSuccess = (roleData: any[]) => ({
  type: actionTypes.FETCH_ROLE_SUCCESS,
  data: roleData,
});

export const fetchRoleFailed = () => ({
  type: actionTypes.FETCH_ROLE_FAILED,
});

export const saveUserSuccess = () => ({
  type: actionTypes.CREATE_USER_SUCCESS,
});

export const saveUserFailed = () => ({
  type: actionTypes.CREATE_USER_FAILED,
});

export const fetchAllUsersSuccess = (data: any[]) => ({
  type: actionTypes.FETCH_ALL_USER_SUCCESS,
  users: data,
});

export const fetchAllUsersFailed = () => ({
  type: actionTypes.FETCH_ALL_USER_FAILED,
});

export const editUserSuccess = () => ({
  type: actionTypes.EDIT_USER_SUCCESS,
});

export const editUserFailed = () => ({
  type: actionTypes.EDIT_USER_FAILED,
});

export const deleteUserSuccess = (data: any) => ({
  type: actionTypes.DELETE_USER_SUCCESS,
});

export const deleteUserFailed = () => ({
  type: actionTypes.DELETE_USER_FAILED,
});
// Fetch doctor price, payment, province
export const fetchRequiredDoctorInfoSuccess = (allRequiredData: any) => ({
  type: actionTypes.FETCH_REQUIRED_DOCTOR_SUCCESS,
  data: allRequiredData,
});
export const fetchRequiredDoctorInfoFailed = () => ({
  type: actionTypes.FETCH_REQUIRED_DOCTOR_FAILED,
});

