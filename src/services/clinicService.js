import axios from "../axios";

const createNewClinicService = (data) => {
  return axios.post("/api/create-new-clinic", data);
};

const updateClinicService = (data) => {
  return axios.put("/api/update-clinic", data);
};

const deleteClinicService = (id) => {
  return axios.delete("/api/delete-clinic", { data: { id } });
};

const getDetailClinicById = (clinicId) => {
  return axios.get("/api/get-detail-clinic-by-id", {
    params: { id: clinicId },
  });
};

const handleGetAllClinics = (limit) => {
  return axios.get("/api/get-all-clinic", {
    params: { limit },
  });
};

export {
  createNewClinicService,
  updateClinicService,
  deleteClinicService,
  getDetailClinicById,
  handleGetAllClinics,
};