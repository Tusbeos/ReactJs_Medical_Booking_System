import axios from "../axiosClient";
import { IClinic } from "../types";

const createNewClinicService = (data: Partial<IClinic>): Promise<any> => {
  return axios.post("/api/create-new-clinic", data);
};

const updateClinicService = (data: Partial<IClinic>): Promise<any> => {
  return axios.put("/api/update-clinic", data);
};

const deleteClinicService = (id: number | string): Promise<any> => {
  return axios.delete("/api/delete-clinic", { data: { id } });
};

const getDetailClinicById = (clinicId: number | string): Promise<any> => {
  return axios.get("/api/get-detail-clinic-by-id", {
    params: { id: clinicId },
  });
};

const handleGetAllClinics = (limit?: number): Promise<any> => {
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
