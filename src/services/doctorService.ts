import axios from "../axiosClient";

const handleGetTopDoctorHome = (limit: number): Promise<any> => {
  return axios.get("/api/doctors/top", { params: { limit } });
};

const handleGetAllDoctors = (): Promise<any> => {
  return axios.get("/api/doctors");
};

const saveDetailDoctor = (data: any): Promise<any> => {
  const { doctorId, ...body } = data;
  return axios.post(`/api/doctors/${doctorId}/info`, body);
};

const getDetailInfoDoctor = (inputId: number | string): Promise<any> => {
  return axios.get(`/api/doctors/${inputId}`);
};

const saveBulkScheduleDoctor = (data: any): Promise<any> => {
  const { doctorId, ...body } = data;
  return axios.post(`/api/doctors/${doctorId}/schedules`, body);
};

const getScheduleDoctorByDate = (
  doctorId: number | string,
  date: number | string,
): Promise<any> => {
  return axios.get(`/api/doctors/${doctorId}/schedules`, {
    params: { date },
  });
};

const saveBulkDoctor = (data: any): Promise<any> => {
  const { doctorId, ...body } = data;
  return axios.post(`/api/doctors/${doctorId}/services`, body);
};

const getAllDoctorService = (doctorId: number | string): Promise<any> => {
  return axios.get(`/api/doctors/${doctorId}/services`);
};

const getExtraInfoDoctorById = (doctorId: number | string): Promise<any> => {
  return axios.get(`/api/doctors/${doctorId}/extra-info`);
};

const getSpecialtiesByDoctorId = (doctorId: number | string): Promise<any> => {
  return axios.get(`/api/doctors/${doctorId}/specialties`);
};

const HandleGetDoctorSpecialtyById = (
  specialtyId: number | string,
): Promise<any> => {
  return axios.get(`/api/specialties/${specialtyId}/doctors`);
};

const getDoctorsByClinicId = (clinicId: number | string): Promise<any> => {
  return axios.get(`/api/clinics/${clinicId}/doctors`);
};

export {
  handleGetTopDoctorHome,
  handleGetAllDoctors,
  saveDetailDoctor,
  getDetailInfoDoctor,
  saveBulkScheduleDoctor,
  getScheduleDoctorByDate,
  saveBulkDoctor,
  getAllDoctorService,
  getExtraInfoDoctorById,
  getSpecialtiesByDoctorId,
  HandleGetDoctorSpecialtyById,
  getDoctorsByClinicId,
};
