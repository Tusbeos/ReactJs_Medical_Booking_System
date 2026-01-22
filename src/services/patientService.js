import axios from "../axios";

const getPatientsByDoctor = (doctorId, date) => {
  return axios.get("/api/get-patients-by-doctor", {
    params: { doctorId, date },
  });
};

export {
  getPatientsByDoctor,
};
