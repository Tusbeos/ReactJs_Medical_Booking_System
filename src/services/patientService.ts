import axios from "../axios";

const getPatientsByDoctor = (doctorId: number | string, date: number | string): Promise<any> => {
  return axios.get("/api/get-patients-by-doctor", {
    params: { doctorId, date },
  });
};

const confirmPatientBooking = (bookingId: number | string, doctorId: number | string, statusId: string = "S3"): Promise<any> => {
  return axios.post("/api/confirm-patient-booking", {
    bookingId,
    doctorId,
    statusId,
  });
};

export { getPatientsByDoctor, confirmPatientBooking };
