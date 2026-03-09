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
  return axios.get("/api/all-codes", { params: { type: inputType } });
};

export {
  handleLoginApi,
  handleGetAllUsers,
  handleCreateNewUserService,
  handleDeleteUserService,
  handleEditUserService,
  handleGetAllCodeService,
};
