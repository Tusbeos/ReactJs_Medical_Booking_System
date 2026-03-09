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
  return axios.post("/api/create-new-user", data);
};

const handleDeleteUser = (userId: number | string): Promise<any> => {
  return axios.delete("/api/delete-user", { data: { id: userId } });
};

const handleEditUser = (inputData: Partial<IUser>): Promise<any> => {
  return axios.put("/api/edit-user", inputData);
};

const handleGetAllCode = (inputType: string): Promise<any> => {
  return axios.get("/api/all-codes", { params: { type: inputType } });
};

export {
  handleLoginApi,
  handleGetAllUsers,
  handleCreateNewUser,
  handleDeleteUser,
  handleEditUser,
  handleGetAllCode,
};
