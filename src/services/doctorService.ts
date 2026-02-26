import axios from "../axios";

const handleGetTopDoctorHomeService = (limit: number): Promise<any> => {
  return axios.get("/api/top-doctor-home", { params: { limit } });
};

const handleGetAllDoctorsService = (): Promise<any> => {
  return axios.get("/api/get-all-doctors");
};

const saveDetailDoctorService = (data: any): Promise<any> => {
  return axios.post("/api/save-info-doctors", data);
};

const getDetailInfoDoctor = (inputId: number | string): Promise<any> => {
  return axios.get("/api/get-detail-doctor-by-id", { params: { id: inputId } });
};

const saveBulkScheduleDoctor = (data: any): Promise<any> => {
  return axios.post("/api/bulk-create-schedule", data);
};

const getScheduleDoctorByDate = (doctorId: number | string, date: number | string): Promise<any> => {
  return axios.get("/api/get-schedule-doctor-by-date", {
    params: { doctorId: doctorId, date: date },
  });
};

const saveBulkDoctorServices = (data: any): Promise<any> =>
  axios.post("/api/bulk-create-doctor-services", data);

const getAllDoctorServices = (inputId: number | string): Promise<any> => {
  return axios.get(`/api/get-list-doctor-services?doctorId=${inputId}`);
};

const getExtraInfoDoctorById = (doctorId: number | string): Promise<any> => {
  return axios.get(`/api/get-extra-info-doctor-by-id?doctorId=${doctorId}`);
};

const getSpecialtiesByDoctorId = (doctorId: number | string): Promise<any> => {
  return axios.get(`/api/get-specialties-by-doctor-id?doctorId=${doctorId}`);
};

const HandleGetDoctorSpecialtyById = (inputId: number | string): Promise<any> => {
  return axios.get(`/api/get-doctor-specialty-by-id?id=${inputId}`);
};

const getDoctorsByClinicId = (clinicId: number | string): Promise<any> => {
  return axios.get(`/api/get-doctors-by-clinic-id?clinicId=${clinicId}`);
};

export {
  handleGetTopDoctorHomeService,
  handleGetAllDoctorsService,
  saveDetailDoctorService,
  getDetailInfoDoctor,
  saveBulkScheduleDoctor,
  getScheduleDoctorByDate,
  saveBulkDoctorServices,
  getAllDoctorServices,
  getExtraInfoDoctorById,
  getSpecialtiesByDoctorId,
  HandleGetDoctorSpecialtyById,
  getDoctorsByClinicId,
};
