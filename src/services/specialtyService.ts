import axios from "../axiosClient";
import { ISpecialty } from "../types";

const createNewSpecialtyService = (data: Partial<ISpecialty>): Promise<any> => {
  return axios.post("/api/create-new-specialty", data);
};

const updateSpecialtyService = (data: Partial<ISpecialty>): Promise<any> => {
  return axios.put("/api/update-specialty", data);
};

const deleteSpecialtyService = (id: number | string): Promise<any> => {
  return axios.delete("/api/delete-specialty", { data: { id } });
};

const handleGetAllSpecialties = (limit?: number): Promise<any> => {
  return axios.get("/api/get-all-specialty", {
    params: { limit },
  });
};

const getSpecialtyByIds = (ids: (number | string)[] = []): Promise<any> => {
  const idsStr = Array.isArray(ids) ? ids.join(",") : String(ids || "");
  return axios.get("/api/get-specialty-by-ids", { params: { ids: idsStr } });
};

export {
  createNewSpecialtyService,
  updateSpecialtyService,
  deleteSpecialtyService,
  handleGetAllSpecialties,
  getSpecialtyByIds,
};
