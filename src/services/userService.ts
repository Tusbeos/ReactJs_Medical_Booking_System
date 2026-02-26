import axios from "../axios";
import { IUser } from "../types";

const handleLoginApi = (userEmail: string, userPassword: string): Promise<any> => {
  return axios.post("/api/login", { email: userEmail, password: userPassword });
};

const handleGetAllUsers = (inputId: string | number): Promise<any> => {
  return axios.get("/api/get-all-users", { params: { id: inputId } });
};

const handleCreateNewUserService = (data: Partial<IUser>): Promise<any> => {
  return axios.post("/api/create-new-user", data);
};

const handleDeleteUserService = (userId: number | string): Promise<any> => {
  return axios.delete("/api/delete-user", { data: { id: userId } });
};

const handleEditUserService = (inputData: Partial<IUser>): Promise<any> => {
  return axios.put("/api/edit-user", inputData);
};

const handleGetAllCodeService = (inputType: string): Promise<any> => {
  return axios.get("/api/allcode", { params: { type: inputType } });
};

export {
  handleLoginApi,
  handleGetAllUsers,
  handleCreateNewUserService,
  handleDeleteUserService,
  handleEditUserService,
  handleGetAllCodeService,
};
