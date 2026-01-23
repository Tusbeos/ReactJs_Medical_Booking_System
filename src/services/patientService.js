import axios from "../axios";

const getPatientsByDoctor = (doctorId, date) => {
  return axios.get("/api/get-patients-by-doctor", {
    params: { doctorId, date },
  });
};

const confirmPatientBooking = (bookingId, doctorId, statusId = "S3") => {
  return axios.post("/api/confirm-patient-booking", {
    bookingId,
    doctorId,
    statusId,
  });
};

export { getPatientsByDoctor, confirmPatientBooking };
