import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { FormattedMessage } from "react-intl";
import HomeHeader from "../../HomePage/HomeHeader";
import { IRootState, IUser } from "../../../types";
import { handleEditUser, handleGetAllCode, handleGetUserById } from "../../../services/userService";
import { userLoginSuccess } from "../../../store/actions/userActions";
import { LANGUAGES } from "../../../utils";
import "./PatientProfile.scss";

const PatientProfile: React.FC = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: IRootState) => state.app.language);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const token = useSelector((state: IRootState) => state.user.token);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState("");
  const [genders, setGenders] = useState<any[]>([]);
  const [previewAvatar, setPreviewAvatar] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Load thông tin user hiện tại vào form
  useEffect(() => {
    if (userInfo) {
      setFirstName(userInfo.firstName || "");
      setLastName(userInfo.lastName || "");
      setEmail(userInfo.email || "");
      setPhoneNumber(userInfo.phoneNumber || "");
      setAddress(userInfo.address || "");
      setGender(userInfo.gender || "");
      if (userInfo.image) {
        const src = userInfo.image.startsWith("data:")
          ? userInfo.image
          : `data:image/jpeg;base64,${userInfo.image}`;
        setPreviewAvatar(src);
      }
    }
  }, [userInfo]);

  // Fetch dữ liệu mới nhất từ server khi vào trang (tránh Redux state cũ)
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = userInfo?.id || userInfo?.userId;
      if (!userId) return;
      try {
        const res = await handleGetUserById(userId);
        if (res && res.errCode === 0 && res.data) {
          const u = res.data;
          setFirstName(u.firstName || "");
          setLastName(u.lastName || "");
          setEmail(u.email || "");
          setPhoneNumber(u.phoneNumber || "");
          setAddress(u.address || "");
          setGender(u.gender || "");
          if (u.image) {
            setPreviewAvatar(`data:image/jpeg;base64,${u.image}`);
          }
        }
      } catch (e) {
        // Giữ nguyên dữ liệu Redux nếu lỗi mạng
      }
    };
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo?.id]);

  // Lấy danh sách giới tính
  useEffect(() => {
    const fetchGenders = async () => {
      try {
        const res = await handleGetAllCode("GENDER");
        if (res && res.errCode === 0) {
          setGenders(res.data || []);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchGenders();
  }, []);

  const handleAvatarChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setPreviewAvatar(base64);
        setAvatar(base64);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleSave = useCallback(async () => {
    if (!userInfo?.id) return;

    const data: Partial<IUser> = {
      id: userInfo.id,
      firstName,
      lastName,
      phoneNumber,
      address,
      gender,
      roleId: userInfo.roleId || "R3",
      positionId: userInfo.positionId || "P0",
      // Gửi ảnh dưới key "image" — BE UpdateUserRequest đọc field "image"
      image: avatar || undefined,
    };

    try {
      const res = await handleEditUser(data);
      if (res && res.errCode === 0) {
        toast.success(
          language === LANGUAGES.VI
            ? "Cập nhật thông tin thành công!"
            : "Profile updated successfully!",
        );
        // Fetch lại dữ liệu mới nhất từ server để cập nhật Redux store
        try {
          const fresh = await handleGetUserById(userInfo.id);
          if (fresh && fresh.errCode === 0 && fresh.data) {
            const updatedUser: IUser = {
              ...userInfo,
              ...fresh.data,
              image: fresh.data.image
                ? `data:image/jpeg;base64,${fresh.data.image}`
                : (avatar || userInfo.image),
            };
            dispatch(userLoginSuccess(updatedUser, token || undefined));
          }
        } catch (_) {
          // Fallback: cập nhật Redux từ state form nếu không fetch được
          const updatedUser: IUser = {
            ...userInfo,
            firstName,
            lastName,
            phoneNumber,
            address,
            gender,
            image: avatar || userInfo.image,
          };
          dispatch(userLoginSuccess(updatedUser, token || undefined));
        }
        setAvatar("");
        setIsEditing(false);
      } else {
        toast.error(res?.errMessage || "Update failed");
      }
    } catch (err) {
      toast.error(
        language === LANGUAGES.VI
          ? "Có lỗi xảy ra khi cập nhật"
          : "Error updating profile",
      );
    }
  }, [userInfo, firstName, lastName, phoneNumber, address, gender, avatar, language, dispatch, token]);

  const handleCancel = useCallback(() => {
    if (userInfo) {
      setFirstName(userInfo.firstName || "");
      setLastName(userInfo.lastName || "");
      setPhoneNumber(userInfo.phoneNumber || "");
      setAddress(userInfo.address || "");
      setGender(userInfo.gender || "");
      if (userInfo.image) {
        const src = userInfo.image.startsWith("data:")
          ? userInfo.image
          : `data:image/jpeg;base64,${userInfo.image}`;
        setPreviewAvatar(src);
      }
      setAvatar("");
    }
    setIsEditing(false);
  }, [userInfo]);

  return (
    <>
      <HomeHeader isShowBanner={false} />
      <div className="patient-profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h2>
              <FormattedMessage
                id="patient.profile.title"
                defaultMessage="Thông tin cá nhân"
              />
            </h2>
            {!isEditing && (
              <button
                className="btn-edit"
                onClick={() => setIsEditing(true)}
              >
                <i className="fas fa-pen" />
                <span>
                  <FormattedMessage
                    id="patient.profile.edit"
                    defaultMessage="Chỉnh sửa"
                  />
                </span>
              </button>
            )}
          </div>

          <div className="profile-body">
            {/* Avatar */}
            <div className="avatar-section">
              <div className="avatar-wrapper">
                {previewAvatar ? (
                  <img src={previewAvatar} alt="avatar" />
                ) : (
                  <i className="fas fa-user-circle default-avatar" />
                )}
                {isEditing && (
                  <label className="avatar-upload" htmlFor="avatar-input">
                    <i className="fas fa-camera" />
                    <input
                      type="file"
                      id="avatar-input"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      hidden
                    />
                  </label>
                )}
              </div>
              <span className="user-display-name">
                {`${lastName} ${firstName}`.trim() || email}
              </span>
            </div>

            {/* Form fields */}
            <div className="form-grid">
              <div className="form-group">
                <label>
                  <FormattedMessage
                    id="patient.profile.lastName"
                    defaultMessage="Họ"
                  />
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                ) : (
                  <span className="field-value">{lastName || "—"}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FormattedMessage
                    id="patient.profile.firstName"
                    defaultMessage="Tên"
                  />
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                ) : (
                  <span className="field-value">{firstName || "—"}</span>
                )}
              </div>

              <div className="form-group">
                <label>Email</label>
                <span className="field-value readonly">{email || "—"}</span>
              </div>

              <div className="form-group">
                <label>
                  <FormattedMessage
                    id="patient.profile.phone"
                    defaultMessage="Số điện thoại"
                  />
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                ) : (
                  <span className="field-value">{phoneNumber || "—"}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label>
                  <FormattedMessage
                    id="patient.profile.address"
                    defaultMessage="Địa chỉ"
                  />
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                ) : (
                  <span className="field-value">{address || "—"}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FormattedMessage
                    id="patient.profile.gender"
                    defaultMessage="Giới tính"
                  />
                </label>
                {isEditing ? (
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">--</option>
                    {genders.map((g: any) => (
                      <option key={g.keyMap} value={g.keyMap}>
                        {language === LANGUAGES.VI ? g.valueVi : g.valueEn}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="field-value">
                    {genders.find((g: any) => g.keyMap === gender)
                      ? language === LANGUAGES.VI
                        ? genders.find((g: any) => g.keyMap === gender)?.valueVi
                        : genders.find((g: any) => g.keyMap === gender)?.valueEn
                      : "—"}
                  </span>
                )}
              </div>
            </div>

            {/* Nút hành động */}
            {isEditing && (
              <div className="form-actions">
                <button className="btn-save" onClick={handleSave}>
                  <i className="fas fa-check" />
                  <span>
                    <FormattedMessage
                      id="patient.profile.save"
                      defaultMessage="Lưu thay đổi"
                    />
                  </span>
                </button>
                <button className="btn-cancel" onClick={handleCancel}>
                  <i className="fas fa-times" />
                  <span>
                    <FormattedMessage
                      id="patient.profile.cancel"
                      defaultMessage="Huỷ"
                    />
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientProfile;
