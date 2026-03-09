import axios from "../axiosClient";
import { IUser } from "../types";

const handleLoginApi = (
  userEmail: string,
  userPassword: string,
): Promise<any> => {
  return axios.post("/api/auth/login", {
    email: userEmail,
    password: userPassword,
  });
};

const handleGetAllUsers = (): Promise<any> => {
  return axios.get("/api/users");
};

const handleCreateNewUser = (data: Partial<IUser>): Promise<any> => {
  return axios.post("/api/users", data);
};

const handleDeleteUser = (userId: number | string): Promise<any> => {
  return axios.delete(`/api/users/${userId}`);
};

const handleGetUserById = (userId: number | string): Promise<any> => {
  return axios.get(`/api/users/${userId}`);
};

const handleEditUser = (inputData: Partial<IUser>): Promise<any> => {
  return axios.put(`/api/users/${inputData.id}`, inputData);
};

const handleGetAllCode = (inputType: string): Promise<any> => {
  return axios.get("/api/all-codes", { params: { type: inputType } });
};

export {
  handleLoginApi,
  handleGetAllUsers,
  handleGetUserById,
  handleCreateNewUser,
  handleDeleteUser,
  handleEditUser,
  handleGetAllCode,
};
