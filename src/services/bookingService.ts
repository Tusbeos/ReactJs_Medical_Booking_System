import axios from "../axiosClient";
import { IBookingData } from "../types";

const postPatientBookAppointment = (data: IBookingData): Promise<any> => {
  return axios.post(`/api/bookings`, data);
};

const handleVerifyEmail = (data: {
  token: string;
  doctorId: number;
}): Promise<any> => {
  return axios.post(`/api/bookings/verify`, data);
};

export { postPatientBookAppointment, handleVerifyEmail };
