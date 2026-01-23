import axios from "../axios";

const createNewSpecialtyService = (data) => {
  return axios.post("/api/create-new-specialty", data);
};

const updateSpecialtyService = (data) => {
  return axios.put("/api/update-specialty", data);
};

const deleteSpecialtyService = (id) => {
  return axios.delete("/api/delete-specialty", { data: { id } });
};

const handleGetAllSpecialties = (limit) => {
  return axios.get("/api/get-all-specialty", {
    params: { limit },
  });
};

const getSpecialtyByIds = (ids = []) => {
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
