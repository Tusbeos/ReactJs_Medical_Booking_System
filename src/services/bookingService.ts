import axios from "../axios";
import { IBookingData } from "../types";

const postPatientBookAppointment = (data: IBookingData): Promise<any> => {
  return axios.post(`/api/patient-book-appointment`, data);
};

const handleVerifyEmail = (data: { token: string; doctorId: string }): Promise<any> => {
  return axios.post(`/api/verify-book-appointment`, data);
};

export {
  postPatientBookAppointment,
  handleVerifyEmail,
};
