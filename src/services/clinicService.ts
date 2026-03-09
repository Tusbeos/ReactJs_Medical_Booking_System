import axios from "../axiosClient";
import { IClinic } from "../types";

const createNewClinicService = (data: Partial<IClinic>): Promise<any> => {
  return axios.post("/api/clinics", data);
};

const updateClinicService = (data: Partial<IClinic>): Promise<any> => {
  const { id, ...body } = data;
  return axios.put(`/api/clinics/${id}`, body);
};

const deleteClinicService = (id: number | string): Promise<any> => {
  return axios.delete(`/api/clinics/${id}`);
};

const getDetailClinicById = (clinicId: number | string): Promise<any> => {
  return axios.get(`/api/clinics/${clinicId}`);
};

const handleGetAllClinics = (limit?: number): Promise<any> => {
  return axios.get("/api/clinics", {
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
