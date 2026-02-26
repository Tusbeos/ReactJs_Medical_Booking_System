import React, { useState, useEffect, useCallback } from "react";
import "./UserManage.scss";
import {
  handleGetAllUsers,
  handleCreateNewUserService,
  handleDeleteUserService,
  handleEditUserService,
} from "../../services/userService";
import "@fortawesome/fontawesome-free/css/all.min.css";
import ModalUser from "./ModalUser";
import ModalEditUser from "./ModalEditUser";
import emitter from "../../utils/emitter";

const UserManage: React.FC = () => {
  const [arrUser, setArrUser] = useState<any[]>([]);
  const [isOpenModalUser, setIsOpenModalUser] = useState(false);
  const [isOpenModalEditUser, setIsOpenModalEditUser] = useState(false);
  const [userEdit, setUserEdit] = useState<any>({});

  const getAllUsersFromReact = useCallback(async () => {
    let response = await handleGetAllUsers("ALL");
    if (response && response.errCode === 0) {
      setArrUser(response.users);
    }
  }, []);

  useEffect(() => {
    getAllUsersFromReact();
  }, [getAllUsersFromReact]);

  const handleAddNewUser = useCallback(() => {
    setIsOpenModalUser(true);
  }, []);

  const toggleUserModal = useCallback(() => {
    setIsOpenModalUser((prev) => !prev);
  }, []);

  const toggleUserEditModal = useCallback(() => {
    setIsOpenModalEditUser((prev) => !prev);
  }, []);

  const createNewUser = useCallback(async (data: any) => {
    try {
      let response = await handleCreateNewUserService(data);
      if (response && response.errCode !== 0) {
        alert(response.errMessage);
      } else {
        await getAllUsersFromReact();
        setIsOpenModalUser(false);
        emitter.emit("EVENT_CLEAR_MODAL_DATA");
      }
    } catch (e) {
      console.log(e);
    }
    console.log("check data from chill", data);
  }, [getAllUsersFromReact]);

  const deleteUser = useCallback(async (user: any) => {
    try {
      let res = await handleDeleteUserService(user.id);
      if (res && res.errCode === 0) {
        await getAllUsersFromReact();
      } else {
        alert(res.errMessage);
      }
    } catch (e) {
      console.log(e);
    }
  }, [getAllUsersFromReact]);

  const editUser = useCallback((user: any) => {
    console.log("check edit user", user);
    setIsOpenModalEditUser(true);
    setUserEdit(user);
  }, []);

  const doEditUser = useCallback(async (user: any) => {
    try {
      let res = await handleEditUserService(user);
      if (res && res.errCode === 0) {
        setIsOpenModalEditUser(false);
        await getAllUsersFromReact();
      } else {
        alert(res.errMessage);
      }
    } catch (e) {
      console.log(e);
    }
  }, [getAllUsersFromReact]);

  return (
    <div className="user-container">
      <ModalUser
        isOpen={isOpenModalUser}
        toggleFromParent={toggleUserModal}
        createNewUser={createNewUser}
      />
      {isOpenModalEditUser && (
        <ModalEditUser
          isOpen={isOpenModalEditUser}
          toggleFromParent={toggleUserEditModal}
          currentUser={userEdit}
          editUser={doEditUser}
        ></ModalEditUser>
      )}
      <div className="title text-center"> Manage User</div>
      <div className="mx-1">
        <button
          className="btn btn-primary px-3"
          onClick={() => handleAddNewUser()}
        >
          <i className="fas fa-plus"></i>
          Add New User
        </button>
      </div>
      <div className="user-table mt-3 mx-2">
        <table id="customers">
          <tbody>
            <tr>
              <th>Email</th>
              <th>FirstName</th>
              <th>LastName</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
            {arrUser &&
              arrUser.map((item, index) => {
                return (
                  <tr key={index}>
                    <td>{item.email}</td>
                    <td>{item.firstName}</td>
                    <td>{item.lastName}</td>
                    <td>{item.address}</td>
                    <td>
                      <button
                        className="btn-edit"
                        onClick={() => editUser(item)}
                      >
                        <i className="fas fa-pencil"></i>
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => deleteUser(item)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManage;
