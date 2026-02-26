import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector, useDispatch } from 'react-redux';
import { LANGUAGES, CRUD_ACTIONS } from "../../../utils";
import CommonUtils from "../../../utils/CommonUtils";
import * as actions from "../../../store/actions";
import Lightbox from "react-image-lightbox";
import "./UserRedux.scss";
import TableManageUser from "./TableManageUser";
import "react-image-lightbox/style.css";
import { Buffer } from "buffer";
import { IRootState } from "../../../types";

const UserRedux: React.FC = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: IRootState) => state.app.language);
  const genderRedux = useSelector((state: IRootState) => (state.admin as any).genders);
  const isLoadingGender = useSelector((state: IRootState) => (state.admin as any).isLoadingGender);
  const positionRedux = useSelector((state: IRootState) => (state.admin as any).position);
  const roleRedux = useSelector((state: IRootState) => (state.admin as any).role);
  const listUsers = useSelector((state: IRootState) => (state.admin as any).users);

  const [genderArr, setGenderArr] = useState<any[]>([]);
  const [positionArr, setPositionArr] = useState<any[]>([]);
  const [roleArr, setRoleArr] = useState<any[]>([]);
  const [previewImgURL, setPreviewImgURL] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [position, setPosition] = useState("");
  const [role, setRole] = useState("");
  const [avatar, setAvatar] = useState<any>("");
  const [currentAction, setCurrentAction] = useState("");
  const [userEditId, setUserEditId] = useState<number | string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lấy dữ liệu gender, position, role khi mount
  useEffect(() => {
    dispatch(actions.fetchGenderStart() as any);
    dispatch(actions.fetchPositionStart() as any);
    dispatch(actions.fetchRoleStart() as any);
  }, [dispatch]);

  // Cập nhật genderArr khi genderRedux thay đổi
  useEffect(() => {
    if (genderRedux) {
      setGenderArr(genderRedux);
      setGender(genderRedux.length > 0 ? genderRedux[0].keyMap : "");
    }
  }, [genderRedux]);

  // Cập nhật roleArr khi roleRedux thay đổi
  useEffect(() => {
    if (roleRedux) {
      setRoleArr(roleRedux);
      setRole(roleRedux.length > 0 ? roleRedux[0].keyMap : "");
    }
  }, [roleRedux]);

  // Cập nhật positionArr khi positionRedux thay đổi
  useEffect(() => {
    if (positionRedux) {
      setPositionArr(positionRedux);
      setPosition(positionRedux.length > 0 ? positionRedux[0].keyMap : "");
    }
  }, [positionRedux]);

  // Reset form khi listUsers thay đổi (sau khi tạo/sửa user)
  useEffect(() => {
    if (listUsers) {
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setAddress("");
      setGender(genderRedux && genderRedux.length > 0 ? genderRedux[0].keyMap : "");
      setPosition(positionRedux && positionRedux.length > 0 ? positionRedux[0].keyMap : "");
      setRoleArr(roleRedux);
      setRole(roleRedux && roleRedux.length > 0 ? roleRedux[0].keyMap : "");
      setAvatar("");
      setPreviewImgURL("");
      setCurrentAction(CRUD_ACTIONS.CREATE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUsers]);

  const handleOnchangeImage = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    let data = event.target.files;
    if (!data) return;
    let file = data[0];
    if (file) {
      let Base64 = await CommonUtils.getBase64(file);
      let objectUrl = URL.createObjectURL(file);
      setPreviewImgURL(objectUrl);
      setAvatar(Base64);
    }
  }, []);

  const openPreviewImage = useCallback(() => {
    if (!previewImgURL) return;
    setIsOpen(true);
  }, [previewImgURL]);

  const checkValidateInput = useCallback(() => {
    const fields: Record<string, string> = {
      email, password, firstName, lastName, phoneNumber, address, gender, position, role
    };
    const arrCheck = ["email", "password", "firstName", "lastName", "phoneNumber", "address", "gender", "position", "role"];
    for (let i = 0; i < arrCheck.length; i++) {
      if (!fields[arrCheck[i]]) {
        alert("Missing parameter: " + arrCheck[i]);
        return false;
      }
    }
    return true;
  }, [email, password, firstName, lastName, phoneNumber, address, gender, position, role]);

  const handleSaveUser = useCallback(() => {
    let isValid = checkValidateInput();
    if (isValid === false) return;
    if (currentAction === CRUD_ACTIONS.CREATE) {
      dispatch(actions.createNewUser({
        email, password, firstName, lastName, address, phoneNumber,
        gender, roleId: role, positionId: position, avatar,
      }) as any);
    } else if (currentAction === CRUD_ACTIONS.EDIT) {
      dispatch(actions.editUserStart({
        id: userEditId as number, email, password, firstName, lastName, address, phoneNumber,
        gender, roleId: role, positionId: position, avatar,
      }) as any);
    }
  }, [checkValidateInput, currentAction, dispatch, email, password, firstName, lastName, address, phoneNumber, gender, role, position, avatar, userEditId]);

  const onChangeInput = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, id: string) => {
    const value = event.target.value;
    switch (id) {
      case "email": setEmail(value); break;
      case "password": setPassword(value); break;
      case "firstName": setFirstName(value); break;
      case "lastName": setLastName(value); break;
      case "phoneNumber": setPhoneNumber(value); break;
      case "address": setAddress(value); break;
      case "gender": setGender(value); break;
      case "position": setPosition(value); break;
      case "role": setRole(value); break;
    }
  }, []);

  const handleEditUserFromParent = useCallback((user: any) => {
    let imageBase64 = "";
    if (user.image) {
      imageBase64 = Buffer.from(user.image, "base64").toString("base64");
    }
    setEmail(user.email);
    setPassword("HARDCODE");
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhoneNumber(user.phoneNumber);
    setAddress(user.address);
    setGender(user.gender);
    setPosition(user.positionId);
    setRole(user.roleId);
    setCurrentAction(CRUD_ACTIONS.EDIT);
    setUserEditId(user.id);
    setAvatar(imageBase64);
    setPreviewImgURL(imageBase64 ? `data:image/jpeg;base64,${imageBase64}` : "");
  }, []);

  let isLoadingGenderRedux = isLoadingGender;

  return (
    <div className="user-crud-redux-container">
      <div className="title">
        <FormattedMessage id="manage-user.title" />
      </div>

      <div className="user-redux-body">
        <div className="container">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-user-plus"></i>{" "}
                <FormattedMessage id="manage-user.add" />
              </span>
              {isLoadingGenderRedux && (
                <span className="loading-text ml-3">
                  <i className="fas fa-spinner fa-spin"></i>{" "}
                  <FormattedMessage id="manage-user.loading" />
                </span>
              )}
            </div>

            <div className="card-body">
              <div className="row">
                <div className="col-md-6 form-group">
                  <label>
                    <FormattedMessage id="manage-user.email" />
                  </label>
                  <input
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(event) => onChangeInput(event, "email")}
                    disabled={currentAction === CRUD_ACTIONS.EDIT}
                  />
                </div>
                <div className="col-md-6 form-group">
                  <label>
                    <FormattedMessage id="manage-user.password" />
                  </label>
                  <input
                    className="form-control"
                    type="password"
                    value={password}
                    onChange={(event) =>
                      onChangeInput(event, "password")
                    }
                    disabled={currentAction === CRUD_ACTIONS.EDIT}
                  />
                </div>
                <div className="col-md-4 form-group">
                  <label>
                    <FormattedMessage id="manage-user.first-name" />
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={firstName}
                    onChange={(event) =>
                      onChangeInput(event, "firstName")
                    }
                  />
                </div>
                <div className="col-md-4 form-group">
                  <label>
                    <FormattedMessage id="manage-user.last-name" />
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={lastName}
                    onChange={(event) =>
                      onChangeInput(event, "lastName")
                    }
                  />
                </div>
                <div className="col-md-4 form-group">
                  <label>
                    <FormattedMessage id="manage-user.phone-number" />
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={phoneNumber}
                    onChange={(event) =>
                      onChangeInput(event, "phoneNumber")
                    }
                  />
                </div>
                <div className="col-md-12 form-group">
                  <label>
                    <FormattedMessage id="manage-user.address" />
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={address}
                    onChange={(event) => onChangeInput(event, "address")}
                  />
                </div>
                <div className="col-md-4 form-group">
                  <label>
                    <FormattedMessage id="manage-user.gender" />
                  </label>
                  <select
                    className="form-select form-control"
                    onChange={(event) => onChangeInput(event, "gender")}
                    value={gender}
                  >
                    {genderArr &&
                      genderArr.length > 0 &&
                      genderArr.map((item, index) => (
                        <option key={index} value={item.keyMap}>
                          {language === LANGUAGES.VI
                            ? item.value_Vi
                            : item.value_En}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="col-md-4 form-group">
                  <label>
                    <FormattedMessage id="manage-user.position" />
                  </label>
                  <select
                    className="form-select form-control"
                    onChange={(event) =>
                      onChangeInput(event, "position")
                    }
                    value={position}
                  >
                    {positionArr &&
                      positionArr.length > 0 &&
                      positionArr.map((item, index) => (
                        <option key={index} value={item.keyMap}>
                          {language === LANGUAGES.VI
                            ? item.value_Vi
                            : item.value_En}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="col-md-4 form-group">
                  <label>
                    <FormattedMessage id="manage-user.role" />
                  </label>
                  <select
                    className="form-select form-control"
                    onChange={(event) => onChangeInput(event, "role")}
                    value={role}
                  >
                    {roleArr &&
                      roleArr.length > 0 &&
                      roleArr.map((item, index) => (
                        <option key={index} value={item.keyMap}>
                          {language === LANGUAGES.VI
                            ? item.value_Vi
                            : item.value_En}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="col-md-6 form-group">
                  <label>
                    <FormattedMessage id="manage-user.image" />
                  </label>
                  <div
                    className="upload-box"
                    style={{
                      backgroundImage: `url(${previewImgURL})`,
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      id="previewImg"
                      type="file"
                      hidden
                      onChange={(event) => handleOnchangeImage(event)}
                    />
                    {!previewImgURL && (
                      <span className="upload-text">
                        <i className="fas fa-cloud-upload-alt"></i>{" "}
                        <FormattedMessage id="manage-user.upload-image" />
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-12 btn-container">
                  <button
                    className={
                      currentAction === CRUD_ACTIONS.EDIT
                        ? "btn btn-warning btn-save-user"
                        : "btn btn-primary btn-save-user"
                    }
                    onClick={() => handleSaveUser()}
                  >
                    {currentAction === CRUD_ACTIONS.EDIT ? (
                      <span>
                        <i className="fas fa-edit"></i>{" "}
                        <FormattedMessage id="manage-user.edit" />
                      </span>
                    ) : (
                      <span>
                        <i className="fas fa-save"></i>{" "}
                        <FormattedMessage id="manage-user.save" />
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-4">
            <div className="col-12">
              <div className="info-card">
                <div className="card-header">
                  <span>
                    <i className="fas fa-users"></i>{" "}
                    <FormattedMessage id="manage-user.title" />
                  </span>
                </div>
                <div className="card-body p-0">
                  <TableManageUser
                    handleEditUserFromParentKey={
                      handleEditUserFromParent
                    }
                    actions={currentAction}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isOpen === true && (
        <Lightbox
          mainSrc={previewImgURL}
          onCloseRequest={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default UserRedux;