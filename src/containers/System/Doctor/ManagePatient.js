import React, { Component } from "react";
import { connect } from "react-redux";
import "./ManagePatient.scss";
import { FormattedMessage } from "react-intl";
import DatePicker from "../../../components/Input/DatePicker";
import {
  getPatientsByDoctor,
  confirmPatientBooking,
} from "../../../services/patientService";
import { LANGUAGES, USER_ROLE } from "../../../utils";
import { handleGetAllDoctorsService } from "../../../services/doctorService";
import { toast } from "react-toastify";

class ManagePatient extends Component {
  constructor(props) {
    super(props);
    this.state = {
      patients: [],
      doctors: [],
      selectedDoctorId: "",
      selectedDate: new Date(),
      isLoading: false,
      errorMessage: "",
    };
  }

  async componentDidMount() {
    await this.fetchDoctors();
    await this.fetchPatients();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.selectedDate !== this.state.selectedDate ||
      prevProps.userInfo !== this.props.userInfo ||
      prevState.selectedDoctorId !== this.state.selectedDoctorId
    ) {
      this.fetchPatients();
    }
  }

  handleChangeDate = (date) => {
    if (!date || !date[0]) return;
    this.setState({ selectedDate: date[0] });
  };

  handleChangeDoctor = (event) => {
    if (!event || !event.target) return;
    this.setState({ selectedDoctorId: event.target.value });
  };

  fetchDoctors = async () => {
    try {
      const { userInfo } = this.props;
      const isDoctorRole = userInfo?.roleId === USER_ROLE.DOCTOR;
      if (isDoctorRole) {
        let doctorId = userInfo.id || userInfo.userId || "";
        if (!doctorId && userInfo.email) {
          try {
            const res = await handleGetAllDoctorsService();
            if (res && res.errCode === 0 && Array.isArray(res.data)) {
              const matched = res.data.find(
                (item) => item && item.email === userInfo.email,
              );
              doctorId = matched?.id || "";
            }
          } catch (e) {}
        }
        this.setState({
          doctors: [],
          selectedDoctorId: doctorId,
        });
        return;
      }

      const res = await handleGetAllDoctorsService();
      if (res && res.errCode === 0 && Array.isArray(res.data)) {
        const doctors = res.data.map((item) => ({
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
        }));

        let selectedDoctorId = this.state.selectedDoctorId;
        if (!selectedDoctorId && this.props.userInfo?.id) {
          selectedDoctorId = this.props.userInfo.id;
        }

        this.setState({ doctors, selectedDoctorId });
      }
    } catch (e) {}
  };

  fetchPatients = async () => {
    const { userInfo } = this.props;
    const { selectedDate, selectedDoctorId } = this.state;
    const isDoctorRole = userInfo?.roleId === USER_ROLE.DOCTOR;
    const isAdmin = userInfo?.roleId === USER_ROLE.ADMIN;
    let doctorId = isDoctorRole
      ? userInfo?.id || userInfo?.userId || ""
      : isAdmin
        ? selectedDoctorId
        : userInfo?.id || userInfo?.userId || selectedDoctorId || "";

    if (isAdmin && !doctorId) {
      this.setState({ patients: [], isLoading: false, errorMessage: "" });
      return;
    }

    if (isDoctorRole && !doctorId && userInfo?.email) {
      try {
        const res = await handleGetAllDoctorsService();
        if (res && res.errCode === 0 && Array.isArray(res.data)) {
          const matched = res.data.find(
            (item) => item && item.email === userInfo.email,
          );
          doctorId = matched?.id || "";
        }
      } catch (e) {}
    }

    if (!doctorId || !selectedDate) return;

    this.setState({ isLoading: true, errorMessage: "" });

    try {
      let dateValue = new Date(selectedDate).setHours(0, 0, 0, 0);

      const res = await getPatientsByDoctor(doctorId, dateValue);

      if (res && res.errCode === 0 && Array.isArray(res.data)) {
        this.setState({ patients: res.data, isLoading: false });
      } else {
        this.setState({
          patients: [],
          isLoading: false,
          errorMessage: res?.message || "Không có dữ liệu",
        });
      }
    } catch (e) {
      this.setState({
        patients: [],
        isLoading: false,
      });
    }
  };

  handleConfirmBooking = async (item) => {
    const bookingId = item?.id;
    if (!bookingId) return;

    const confirmed = window.confirm("Xác nhận bệnh nhân đã khám xong?");
    if (!confirmed) return;

    const doctorId =
      item?.doctorId ||
      this.props.userInfo?.id ||
      this.props.userInfo?.userId ||
      this.state.selectedDoctorId ||
      "";

    try {
      const res = await confirmPatientBooking(bookingId, doctorId, "S3");
      if (res && res.errCode === 0) {
        toast.success("Xác nhận thành công!");
        this.fetchPatients();
      } else {
        toast.error(res?.errMessage || "Xác nhận thất bại!");
      }
    } catch (e) {
      toast.error("Xác nhận thất bại!");
    }
  };

  render() {
    const {
      patients,
      selectedDate,
      isLoading,
      errorMessage,
      doctors,
      selectedDoctorId,
    } = this.state;
    const { language, userInfo } = this.props;
    const isAdmin = userInfo?.roleId === USER_ROLE.ADMIN;
    const doctorDisplayName = userInfo
      ? `${userInfo.lastName || ""} ${userInfo.firstName || ""}`.trim()
      : "";

    const renderFullName = (item) => {
      if (item && item.patientData) {
        const lastName = item.patientData.lastName || "";
        const firstName = item.patientData.firstName || "";
        return `${lastName} ${firstName}`.trim();
      }
      return item?.fullName || "";
    };

    return (
      <div className="manage-patient-container">
        <div className="ms-title">
          <FormattedMessage id="menu.doctor.patient-booking" />
        </div>
        <div className="row">
          <div className="col-12 mb-4">
            <div className="info-card">
              <div className="card-header">
                <span>
                  <i className="fas fa-filter"></i> Bộ lọc tìm kiếm
                </span>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 form-group">
                    <label className="label-bold">
                      <FormattedMessage id="manage-schedule.select-date" />
                    </label>
                    <DatePicker
                      className="form-control"
                      onChange={this.handleChangeDate}
                      value={selectedDate}
                    />
                  </div>
                  {isAdmin ? (
                    <div className="col-md-6 form-group">
                      <label className="label-bold">
                        <FormattedMessage id="menu.manage-doctor.select-doctor" />
                      </label>
                      <select
                        className="form-control"
                        value={selectedDoctorId}
                        onChange={this.handleChangeDoctor}
                      >
                        <option value="">
                          {language === LANGUAGES.VI
                            ? "Chọn bác sĩ"
                            : "Select doctor"}
                        </option>
                        {doctors &&
                          doctors.length > 0 &&
                          doctors.map((item) => (
                            <option key={item.id} value={item.id}>
                              {language === LANGUAGES.VI
                                ? `${item.lastName || ""} ${item.firstName || ""}`.trim()
                                : `${item.firstName || ""} ${item.lastName || ""}`.trim()}
                            </option>
                          ))}
                      </select>
                    </div>
                  ) : (
                    <div className="col-md-6 form-group">
                      <label className="label-bold">
                        <FormattedMessage id="menu.manage-doctor.select-doctor" />
                      </label>
                      <input
                        className="form-control"
                        value={doctorDisplayName}
                        disabled
                        readOnly
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-12">
            <div className="info-card">
              <div className="card-header">
                <span>
                  <i className="fas fa-list-alt"></i> Danh sách bệnh nhân đặt
                  lịch
                </span>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-striped table-bordered mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: "50px", textAlign: "center" }}>
                          #
                        </th>
                        <th>Họ tên</th>
                        <th>Email</th>
                        <th>SĐT</th>
                        <th>Giờ khám</th>
                        <th>Lý do khám</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan="7" className="text-center p-4">
                            <i className="fas fa-spinner fa-spin mr-2"></i> Đang
                            tải dữ liệu...
                          </td>
                        </tr>
                      ) : (
                        <>
                          {patients && patients.length > 0 ? (
                            patients.map((item, index) => (
                              <tr key={item.id || index}>
                                <td className="text-center">{index + 1}</td>
                                <td>{renderFullName(item)}</td>
                                <td>{item.patientData?.email || ""}</td>
                                <td>{item.patientData?.phoneNumber || ""}</td>
                                <td>
                                  {language === LANGUAGES.VI
                                    ? item.bookingTimeTypeData?.value_Vi || ""
                                    : item.bookingTimeTypeData?.value_En || ""}
                                </td>
                                <td>{item.reason || ""}</td>
                                <td>
                                  <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => this.handleConfirmBooking(item)}
                                    disabled={item.statusId === "S3"}
                                  >
                                    {item.statusId === "S3"
                                      ? "Đã xác nhận"
                                      : "Xác nhận"}
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center p-4">
                                {"Chưa có bệnh nhân đặt lịch vào ngày này."}
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.user.userInfo,
    language: state.app.language,
  };
};

export default connect(mapStateToProps)(ManagePatient);