import axios from "../axiosClient";
import { ISpecialty } from "../types";

const createNewSpecialtyService = (data: Partial<ISpecialty>): Promise<any> => {
  return axios.post("/api/specialties", data);
};

const updateSpecialtyService = (data: Partial<ISpecialty>): Promise<any> => {
  const { id, ...body } = data;
  return axios.put(`/api/specialties/${id}`, body);
};

const deleteSpecialtyService = (id: number | string): Promise<any> => {
  return axios.delete(`/api/specialties/${id}`);
};

const handleGetAllSpecialties = (limit?: number): Promise<any> => {
  return axios.get("/api/specialties", {
    params: { limit },
  });
};

const getSpecialtyByIds = (ids: (number | string)[] = []): Promise<any> => {
  return axios.get("/api/specialties/by-ids", {
    params: { ids: ids.join(",") },
  });
};

export {
  createNewSpecialtyService,
  updateSpecialtyService,
  deleteSpecialtyService,
  handleGetAllSpecialties,
  getSpecialtyByIds,
};
