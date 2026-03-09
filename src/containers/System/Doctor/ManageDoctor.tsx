import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./ManageDoctor.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import * as actions from "../../../store/actions";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import Select from "react-select";
import { CRUD_ACTIONS, LANGUAGES } from "utils";
import {
  getDetailInfoDoctor,
  getSpecialtiesByDoctorId,
} from "../../../services/doctorService";
import { handleGetAllSpecialties } from "../../../services/specialtyService";
import { handleGetAllClinics } from "../../../services/clinicService";
import { FormattedMessage, useIntl } from "react-intl";
import DoctorServices from "./DoctorServices";
import { IRootState } from "../../../types";

const mdParser = new MarkdownIt();

const ManageDoctor: React.FC = () => {
  const dispatch = useDispatch();
  const intl = useIntl();
  const language = useSelector((state: IRootState) => state.app.language);
  const allDoctors = useSelector((state: IRootState) => (state.admin as any).allDoctors);
  const allRequiredDoctorInfo = useSelector((state: IRootState) => (state.admin as any).allRequiredDoctorInfo);

  const serviceRef = useRef<any>(null);

  // Lưu vào bảng markdown
  const [contentHTML, setContentHTML] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [description, setDescription] = useState("");
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [listDoctors, setListDoctors] = useState<any[]>([]);
  const [hasOldData, setHasOldData] = useState(false);

  // Lưu vào bảng doctor_info
  const [listPrice, setListPrice] = useState<any[]>([]);
  const [listPayment, setListPayment] = useState<any[]>([]);
  const [listProvince, setListProvince] = useState<any[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [nameClinic, setNameClinic] = useState("");
  const [addressClinic, setAddressClinic] = useState("");
  const [note, setNote] = useState("");
  const [listSpecialty, setListSpecialty] = useState<any[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);
  const [listClinic, setListClinic] = useState<any[]>([]);

  const buildDataClinicSelect = useCallback((inputData: any[] = []) => {
    return inputData
      .filter((item) => item && item.id && item.name)
      .map((item) => ({
        label: item.name,
        value: item.id,
        address: item.address || "",
      }));
  }, []);

  const buildDataSpecialtySelect = useCallback((inputData: any[] = []) => {
    return inputData
      .filter((item) => item && item.id && item.name)
      .map((item) => ({
        label: item.name,
        value: item.id,
      }));
  }, []);

  const buildDataInputSelect = useCallback((inputData: any, type: string) => {
    if (!inputData) return [];
    return inputData.map((item: any) => {
      let label = "";
      let objectValue = "";
      if (type === "USERS") {
        const labelVi = `${item.lastName ?? ""} ${item.firstName ?? ""}`;
        const labelEn = `${item.firstName ?? ""} ${item.lastName ?? ""}`;
        label = language === LANGUAGES.VI ? labelVi : labelEn;
        objectValue = item.id;
      } else {
        label = language === LANGUAGES.VI ? item.valueVi : item.valueEn;
        objectValue = item.keyMap;
      }
      return { label: label ? label.trim() : "", value: objectValue };
    });
  }, [language]);

  // Khởi tạo dữ liệu khi mount
  useEffect(() => {
    dispatch(actions.fetchRequiredDoctorInfo() as any);
    dispatch(actions.fetchAllDoctorsStart() as any);

    const fetchData = async () => {
      try {
        const res = await handleGetAllSpecialties();
        if (res && res.errCode === 0 && Array.isArray(res.data)) {
          setListSpecialty(buildDataSpecialtySelect(res.data));
        } else {
          setListSpecialty([]);
        }
        const resClinic = await handleGetAllClinics();
        if (resClinic && resClinic.errCode === 0 && Array.isArray(resClinic.data)) {
          setListClinic(buildDataClinicSelect(resClinic.data));
        } else {
          setListClinic([]);
        }
      } catch (e) {
        console.error("Lỗi khi lấy chuyên khoa hoặc clinic:", e);
        setListSpecialty([]);
        setListClinic([]);
      }
    };
    fetchData();
  }, [dispatch, buildDataSpecialtySelect, buildDataClinicSelect]);

  // Cập nhật listDoctors khi allDoctors thay đổi
  useEffect(() => {
    if (allDoctors) {
      setListDoctors(buildDataInputSelect(allDoctors, "USERS"));
    }
  }, [allDoctors, buildDataInputSelect]);

  // Cập nhật price/payment/province khi allRequiredDoctorInfo thay đổi
  useEffect(() => {
    if (allRequiredDoctorInfo) {
      const { resPrice, resPayment, resProvince } = allRequiredDoctorInfo;
      setListPrice(buildDataInputSelect(resPrice, "PRICE"));
      setListPayment(buildDataInputSelect(resPayment, "PAYMENT"));
      setListProvince(buildDataInputSelect(resProvince, "PROVINCE"));
    }
  }, [allRequiredDoctorInfo, buildDataInputSelect]);

  const handleChangeSelectSpecialty = useCallback((value: any) => {
    setSelectedSpecialty(value || []);
  }, []);

  const handleChangeSelectClinic = useCallback((value: any) => {
    if (!value) return;
    setSelectedClinic(value);
    setNameClinic(value.label || "");
    setAddressClinic(value.address || "");
  }, []);

  const handleEditorChange = useCallback(({ html, text }: { html: string; text: string }) => {
    setContentMarkdown(text);
    setContentHTML(html);
  }, []);

  const handleChange = useCallback(async (option: any) => {
    setSelectedOption(option);
    let res = await getDetailInfoDoctor(option.value);
    let specialtyRes = await getSpecialtiesByDoctorId(option.value);

    if (res && res.errCode === 0 && res.data) {
      let data = res.data;
      let markdown = data.Markdown;
      let doctorInfo = data.DoctorInfo;
      let addrClinic = "", nmClinic = "", nt = "";
      let selPayment: any = null, selPrice: any = null, selProvince: any = null,
        selSpecialty: any[] = [], selClinic: any = null;
      let cHTML = "", cMarkdown = "", desc = "";
      let oldData = false;

      if (markdown) {
        cHTML = markdown.contentHTML;
        cMarkdown = markdown.contentMarkdown;
        desc = markdown.description;
        oldData = true;
      }

      if (doctorInfo) {
        addrClinic = doctorInfo.addressClinic;
        nmClinic = doctorInfo.nameClinic;
        nt = doctorInfo.note;
        oldData = true;
        selPayment = listPayment.find((item) => item.value === doctorInfo.paymentId);
        selPrice = listPrice.find((item) => item.value === doctorInfo.priceId);
        selProvince = listProvince.find((item) => item.value === doctorInfo.provinceId);
        if (doctorInfo.clinicId && Array.isArray(listClinic)) {
          selClinic = listClinic.find((item) => item.value === doctorInfo.clinicId);
          if (selClinic) {
            nmClinic = selClinic.label || nmClinic;
            addrClinic = selClinic.address || addrClinic;
          }
        }
        if (listSpecialty && listSpecialty.length > 0) {
          const apiSpecialtyIds = specialtyRes && specialtyRes.errCode === 0 ? specialtyRes.data : [];
          const normalizedIds = Array.isArray(apiSpecialtyIds) ? apiSpecialtyIds.map((id: any) => Number(id)) : [];
          if (normalizedIds.length > 0) {
            selSpecialty = listSpecialty.filter((item) => normalizedIds.includes(Number(item.value)));
          }
        }
      }
      setContentHTML(cHTML);
      setContentMarkdown(cMarkdown);
      setDescription(desc);
      setHasOldData(oldData);
      setAddressClinic(addrClinic);
      setNameClinic(nmClinic);
      setNote(nt);
      setSelectedPayment(selPayment);
      setSelectedPrice(selPrice);
      setSelectedProvince(selProvince);
      setSelectedSpecialty(selSpecialty);
      setSelectedClinic(selClinic);
    } else {
      setContentHTML("");
      setContentMarkdown("");
      setDescription("");
      setHasOldData(false);
      setAddressClinic("");
      setNameClinic("");
      setNote("");
      setSelectedPayment(null);
      setSelectedPrice(null);
      setSelectedProvince(null);
      setSelectedSpecialty([]);
      setSelectedClinic(null);
    }
  }, [listPayment, listPrice, listProvince, listSpecialty, listClinic]);

  const handleChangeSelectDoctorInfo = useCallback((value: any, name: any) => {
    let nameState = name.name;
    switch (nameState) {
      case "selectedPrice": setSelectedPrice(value); break;
      case "selectedPayment": setSelectedPayment(value); break;
      case "selectedProvince": setSelectedProvince(value); break;
    }
  }, []);

  const handleSaveContentMarkDown = useCallback(() => {
    if (!selectedOption)
      return alert(intl.formatMessage({ id: "menu.manage-doctor.error-selected-doctor" }));
    if (!selectedPrice)
      return alert(intl.formatMessage({ id: "menu.manage-doctor.error-selected-price" }));
    if (!selectedPayment)
      return alert(intl.formatMessage({ id: "menu.manage-doctor.error-selected-payment" }));
    if (!selectedProvince)
      return alert(intl.formatMessage({ id: "menu.manage-doctor.error-selected-province" }));

    let arrDoctorService: any[] = [];
    if (serviceRef.current) {
      const childData = serviceRef.current.getDataFromChild();
      if (childData.isValid === false) return;
      arrDoctorService = childData.data;
    }

    dispatch(actions.saveDetailDoctorsStart({
      contentHTML,
      contentMarkdown,
      description,
      doctorId: selectedOption.value,
      selectedPrice: selectedPrice.value,
      selectedPayment: selectedPayment.value,
      selectedProvince: selectedProvince.value,
      nameClinic,
      addressClinic,
      note,
      specialtyIds: selectedSpecialty && selectedSpecialty.length > 0
        ? selectedSpecialty.map((item) => item.value) : [],
      clinicId: selectedClinic ? selectedClinic.value : null,
      action: hasOldData === true ? CRUD_ACTIONS.EDIT : CRUD_ACTIONS.CREATE,
    }) as any);

    if (arrDoctorService && arrDoctorService.length > 0) {
      dispatch(actions.saveDoctorServices({
        arrDoctorService,
        doctorId: selectedOption.value,
      }) as any);
    }
  }, [dispatch, intl, selectedOption, selectedPrice, selectedPayment, selectedProvince,
    contentHTML, contentMarkdown, description, nameClinic, addressClinic, note,
    selectedSpecialty, selectedClinic, hasOldData]);

  const handleOnChangeText = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: string) => {
    const value = event.target.value;
    switch (id) {
      case "description": setDescription(value); break;
      case "nameClinic": setNameClinic(value); break;
      case "addressClinic": setAddressClinic(value); break;
      case "note": setNote(value); break;
    }
  }, []);

  return (
    <div className="manage-doctor-container">
      <div className="manage-doctor-title">
        <FormattedMessage id="menu.manage-doctor.title" />
      </div>

      <div className="info-card general-info">
        <div className="card-body row">
          <div className="content-left col-md-4 form-group">
            <label className="label-bold">
              <i className="fas fa-user-md"></i>{" "}
              <FormattedMessage id="menu.manage-doctor.select-doctor" />
            </label>
            <Select
              value={selectedOption}
              onChange={handleChange}
              options={listDoctors}
              placeholder={
                <FormattedMessage id="menu.manage-doctor.select-doctor" />
              }
              menuPortalTarget={document.body}
              styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
            />
          </div>
          <div className="content-right col-md-8 form-group">
            <label className="label-bold">
              <i className="fas fa-info-circle"></i>{" "}
              <FormattedMessage id="menu.manage-doctor.introductory-information" />
            </label>
            <textarea
              className="doctor-description form-control"
              rows={3}
              onChange={(event) => handleOnChangeText(event, "description")}
              value={description}
            ></textarea>
          </div>
        </div>
      </div>
      <div className="row detail-info-grid">
        <div className="col-md-6">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-cogs"></i> Thiết lập chuyên môn & Quản trị
              </span>
            </div>
            <div className="card-body row">
              <div className="col-6 form-group">
                <label>
                  <FormattedMessage id="menu.manage-doctor.select-price" />
                </label>
                <Select
                  value={selectedPrice}
                  onChange={handleChangeSelectDoctorInfo}
                  options={listPrice}
                  name="selectedPrice"
                  placeholder={<FormattedMessage id="menu.manage-doctor.price" />}
                />
              </div>
              <div className="col-6 form-group">
                <label>
                  <FormattedMessage id="menu.manage-doctor.select-payment" />
                </label>
                <Select
                  value={selectedPayment}
                  onChange={handleChangeSelectDoctorInfo}
                  options={listPayment}
                  name="selectedPayment"
                  placeholder={<FormattedMessage id="menu.manage-doctor.payment" />}
                />
              </div>
              <div className="col-6 form-group">
                <label>
                  <FormattedMessage id="menu.manage-doctor.select-province" />
                </label>
                <Select
                  value={selectedProvince}
                  onChange={handleChangeSelectDoctorInfo}
                  options={listProvince}
                  name="selectedProvince"
                  placeholder={<FormattedMessage id="menu.manage-doctor.province" />}
                />
              </div>
              <div className="col-6 form-group">
                <label>
                  <FormattedMessage id="menu.manage-doctor.select-specialty" defaultMessage="Chuyên khoa" />
                </label>
                <Select
                  value={selectedSpecialty}
                  onChange={handleChangeSelectSpecialty}
                  options={listSpecialty}
                  name="selectedSpecialty"
                  isMulti
                  placeholder={intl.formatMessage({ id: "menu.manage-doctor.select-specialty" })}
                />
              </div>
              <div className="col-12 form-group">
                <label>
                  <FormattedMessage id="menu.manage-doctor.select-clinic" defaultMessage="Phòng khám" />
                </label>
                <Select
                  value={selectedClinic}
                  onChange={handleChangeSelectClinic}
                  options={listClinic}
                  name="selectedClinic"
                  placeholder={intl.formatMessage({ id: "menu.manage-doctor.select-clinic" })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-clinic-medical"></i> Chi tiết tại phòng khám
              </span>
            </div>
            <div className="card-body row">
              <div className="col-12 form-group">
                <label>
                  <FormattedMessage id="menu.manage-doctor.name-clinic" />
                </label>
                <input
                  className="form-control"
                  onChange={(event) => handleOnChangeText(event, "nameClinic")}
                  value={nameClinic}
                  disabled
                />
              </div>
              <div className="col-12 form-group">
                <label>
                  <FormattedMessage id="menu.manage-doctor.address-clinic" />
                </label>
                <input
                  className="form-control"
                  onChange={(event) => handleOnChangeText(event, "addressClinic")}
                  value={addressClinic}
                  disabled
                />
              </div>
              <div className="col-12 form-group">
                <label>
                  <FormattedMessage id="menu.manage-doctor.note" />
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  onChange={(event) => handleOnChangeText(event, "note")}
                  value={note}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="doctor-services row mt-3">
        <div className="col-12">
          {selectedOption && (
            <DoctorServices
              ref={serviceRef}
              doctorIdFromParent={selectedOption.value}
            />
          )}
        </div>
      </div>

      <div className="manage-doctor-editor mt-4">
        <label className="label-bold mb-2">
          <i className="fas fa-pen-fancy"></i> Chi tiết bài viết
        </label>
        <MdEditor
          value={contentMarkdown}
          style={{ height: "500px" }}
          renderHTML={(text) => mdParser.render(text)}
          onChange={handleEditorChange}
        />
      </div>

      <button
        className={
          hasOldData === true
            ? "save-content-doctor btn btn-warning btn-lg mt-3"
            : "create-content-doctor btn btn-primary btn-lg mt-3"
        }
        onClick={() => handleSaveContentMarkDown()}
      >
        {hasOldData === true ? (
          <span>
            <FormattedMessage id="menu.manage-doctor.edit" />
          </span>
        ) : (
          <span>
            <FormattedMessage id="menu.manage-doctor.save" />
          </span>
        )}
      </button>
    </div>
  );
};

export default ManageDoctor;
