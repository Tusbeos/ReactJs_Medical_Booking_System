import React, { useState, useEffect, useCallback, useRef } from "react";
import "./ManageClinic.scss";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { CommonUtils, getBase64FromBuffer } from "../../../utils";
import {
  createNewClinicService,
  updateClinicService,
  deleteClinicService,
  getDetailClinicById,
  handleGetAllClinics,
} from "../../../services/clinicService";
import { toast } from "react-toastify";

const mdParser = new MarkdownIt({ html: true });

const ManageClinic = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [imageCoverBase64, setImageCoverBase64] = useState("");
  const [previewImageCover, setPreviewImageCover] = useState("");
  const [descriptionHTML, setDescriptionHTML] = useState("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");
  const [clinics, setClinics] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editClinicId, setEditClinicId] = useState<number | string | null>(null);

  const fileInputLogo = useRef<HTMLInputElement>(null);
  const fileInputCover = useRef<HTMLInputElement>(null);

  const fetchAllClinics = useCallback(async () => {
    try {
      let res = await handleGetAllClinics();
      if (res && res.errCode === 0) {
        setClinics(res.data ? res.data : []);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  // Lấy danh sách phòng khám khi mount
  useEffect(() => {
    fetchAllClinics();
  }, [fetchAllClinics]);

  const handleOnChangeInput = useCallback((event: any, id: string) => {
    if (!event || !event.target) return;
    const valueInput = event.target.value;
    switch (id) {
      case "name": setName(valueInput); break;
      case "address": setAddress(valueInput); break;
      default: break;
    }
  }, []);

  const handleEditorChange = useCallback(({ html, text }: { html: string; text: string }) => {
    setDescriptionHTML(html);
    setDescriptionMarkdown(text);
  }, []);

  const handleOnChangeImage = useCallback(async (event: any, type = "logo") => {
    if (!event || !event.target || !event.target.files) return;
    const file = event.target.files[0];
    if (!file) return;

    const Base64 = await CommonUtils.getBase64(file);
    if (type === "cover") {
      setImageCoverBase64(Base64 || "");
      setPreviewImageCover(Base64 || "");
    } else {
      setImageBase64(Base64 || "");
      setPreviewImage(Base64 || "");
    }
  }, []);

  const resetForm = useCallback(() => {
    setName("");
    setAddress("");
    setImageBase64("");
    setPreviewImage("");
    setImageCoverBase64("");
    setPreviewImageCover("");
    setDescriptionHTML("");
    setDescriptionMarkdown("");
    setIsEditing(false);
    setEditClinicId(null);
  }, []);

  const handleSaveNewClinic = async () => {
    if (!name || !address || !descriptionMarkdown) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const payload = {
        id: editClinicId as number,
        name,
        address,
        imageBase64,
        imageCoverBase64,
        descriptionHTML,
        descriptionMarkdown,
      };

      const res = isEditing
        ? await updateClinicService(payload)
        : await createNewClinicService(payload);

      if (res && res.errCode === 0) {
        toast.success(
          isEditing
            ? "Cập nhật phòng khám thành công!"
            : "Tạo phòng khám thành công!",
        );
        resetForm();
        await fetchAllClinics();
      } else {
        toast.error(
          res?.errMessage ||
            (isEditing
              ? "Cập nhật phòng khám thất bại!"
              : "Tạo phòng khám thất bại!"),
        );
      }
    } catch (e) {
      console.log(e);
      toast.error(
        isEditing
          ? "Có lỗi xảy ra khi cập nhật phòng khám!"
          : "Có lỗi xảy ra khi tạo phòng khám!",
      );
    }
  };

  const handleEditClinic = async (clinic: any) => {
    if (!clinic || !clinic.id) return;
    try {
      const res = await getDetailClinicById(clinic.id);
      if (res && res.errCode === 0 && res.data) {
        const imgBase64 = res.data.image
          ? getBase64FromBuffer(res.data.image) || ""
          : "";
        const imgCoverBase64 = res.data.imageCover
          ? getBase64FromBuffer(res.data.imageCover) || ""
          : "";

        setName(res.data.name || "");
        setAddress(res.data.address || "");
        setImageBase64(imgBase64);
        setPreviewImage(imgBase64);
        setImageCoverBase64(imgCoverBase64);
        setPreviewImageCover(imgCoverBase64);
        setDescriptionHTML(res.data.descriptionHTML || "");
        setDescriptionMarkdown(res.data.descriptionMarkdown || "");
        setIsEditing(true);
        setEditClinicId(res.data.id);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteClinic = async (clinic: any) => {
    if (!clinic || !clinic.id) return;
    try {
      const res = await deleteClinicService(clinic.id);
      if (res && res.errCode === 0) {
        toast.success("Xóa phòng khám thành công!");
        await fetchAllClinics();
      } else {
        toast.error(res?.errMessage || "Xóa phòng khám thất bại!");
      }
    } catch (e) {
      console.log(e);
      toast.error("Có lỗi xảy ra khi xóa phòng khám!");
    }
  };

  const logoPreviewUrl = previewImage ? `url(${previewImage})` : "";
  const coverPreviewUrl = previewImageCover
    ? `url(${previewImageCover})`
    : "";

  return (
    <div className="manage-clinic-container">
      <div className="ms-title">Quản lý Phòng khám</div>

      <div className="add-new-clinic row">
        {/* --- CARD 1: GENERAL INFORMATION --- */}
        <div className="col-12 mb-4">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-hospital-alt"></i> Thông tin chung
              </span>
            </div>
            <div className="card-body row">
              {/* LEFT COLUMN: INPUTS */}
              <div className="col-md-6">
                <div className="form-group">
                  <label className="label-bold">
                    Tên phòng khám <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Ví dụ: Bệnh viện Việt Đức..."
                    value={name}
                    onChange={(event) =>
                      handleOnChangeInput(event, "name")
                    }
                  />
                </div>
                <div className="form-group">
                  <label className="label-bold">
                    Địa chỉ phòng khám <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={5}
                    placeholder="Ví dụ: 40 Tràng Thi, Hoàn Kiếm, Hà Nội..."
                    value={address}
                    onChange={(event) =>
                      handleOnChangeInput(event, "address")
                    }
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: IMAGES */}
              <div className="col-md-6">
                <div className="row">
                  {/* Logo Box */}
                  <div className="col-md-6 form-group">
                    <label className="label-bold">Logo</label>
                    <div
                      className="upload-box logo-box"
                      style={{ backgroundImage: logoPreviewUrl }}
                      onClick={() => fileInputLogo.current?.click()}
                    >
                      <input
                        ref={fileInputLogo}
                        type="file"
                        hidden
                        onChange={(event) =>
                          handleOnChangeImage(event, "logo")
                        }
                      />
                      {!imageBase64 && (
                        <span className="upload-text">
                          <i className="fas fa-cloud-upload-alt"></i> Tải Logo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Cover Box */}
                  <div className="col-md-6 form-group">
                    <label className="label-bold">Ảnh bìa (Cover)</label>
                    <div
                      className="upload-box cover-box"
                      style={{ backgroundImage: coverPreviewUrl }}
                      onClick={() => fileInputCover.current?.click()}
                    >
                      <input
                        ref={fileInputCover}
                        type="file"
                        hidden
                        onChange={(event) =>
                          handleOnChangeImage(event, "cover")
                        }
                      />
                      {!imageCoverBase64 && (
                        <span className="upload-text">
                          <i className="fas fa-image"></i> Tải Cover
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-12">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-pen-nib"></i> Thông tin giới thiệu chi
                tiết
              </span>
            </div>
            <div className="card-body">
              <MdEditor
                style={{ height: "400px" }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={handleEditorChange}
                value={descriptionMarkdown}
              />
            </div>
          </div>
        </div>

        <div className="col-12 action-btn btn-container">
          <button
            className="btn btn-primary btn-lg btn-save-clinic"
            onClick={() => handleSaveNewClinic()}
          >
            <i className="fas fa-save"></i>{" "}
            {isEditing ? "Cập nhật" : "Lưu thông tin"}
          </button>
          {isEditing && (
            <button
              className="btn btn-secondary btn-lg ml-3 btn-cancel"
              onClick={() => resetForm()}
            >
              <i className="fas fa-times"></i> Hủy
            </button>
          )}
        </div>
      </div>

      <div className="clinic-list-container mt-5">
        <div className="info-card">
          <div className="card-header">
            <span>
              <i className="fas fa-list"></i> Danh sách phòng khám
            </span>
          </div>
          <div className="card-body p-0">
            <table className="table table-striped table-bordered mb-0 table-hover">
              <thead className="thead-light">
                <tr>
                  <th>Tên phòng khám</th>
                  <th>Địa chỉ</th>
                  <th style={{ width: "150px", textAlign: "center" }}>
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {clinics && clinics.length > 0 ? (
                  clinics.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.address}</td>
                      <td className="text-center">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditClinic(item)}
                          title="Sửa"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteClinic(item)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="text-center">
                      Chưa có dữ liệu phòng khám
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageClinic;