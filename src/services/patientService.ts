import axios from "../axiosClient";

const getPatientsByDoctor = (
  doctorId: number | string,
  date: number | string,
): Promise<any> => {
  return axios.get(`/api/doctors/${doctorId}/patients`, {
    params: { date },
  });
};

const confirmPatientBooking = (
  bookingId: number | string,
  doctorId: number | string,
  statusId: string = "S3",
): Promise<any> => {
  return axios.post(`/api/bookings/${bookingId}/confirm`, {
    doctorId,
    statusId,
  });
};

export { getPatientsByDoctor, confirmPatientBooking };
