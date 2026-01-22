import React, { Component } from "react";
import { connect } from "react-redux";
import "./ManagePatient.scss";
import { FormattedMessage } from "react-intl";
import DatePicker from "../../../components/Input/DatePicker";
import { getPatientsByDoctor } from "../../../services/patientService";
import { LANGUAGES } from "../../../utils";
import { handleGetAllDoctorsService } from "../../../services/doctorService";

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

  componentDidMount() {
    this.fetchDoctors();
    this.fetchPatients();
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
      const res = await handleGetAllDoctorsService();
      if (res && res.errCode === 0 && Array.isArray(res.data)) {
        const doctors = res.data.map((item) => ({
          id: item.id,
          firstName: item.firstName,
          lastName: item.lastName,
        }));

        let selectedDoctorId = this.state.selectedDoctorId;
        // Automatically select the logged-in doctor if not admin/already selected
        if (!selectedDoctorId && this.props.userInfo?.id) {
             // Logic to check if user is doctor or admin could go here.
             // For now, defaulting to userInfo.id if available might be intended for doctor view.
             // If this is an admin view managing all doctors, you might want to leave it empty initially.
             selectedDoctorId = this.props.userInfo.id;
        }

        this.setState({ doctors, selectedDoctorId });
      }
    } catch (e) {}
  };

  fetchPatients = async () => {
    const { userInfo } = this.props;
    const { selectedDate, selectedDoctorId } = this.state;

    // Use selected doctor if available, otherwise fallback to logged-in user (for doctor role)
    const doctorId = selectedDoctorId || userInfo?.id || "";
    
    if (!doctorId || !selectedDate) return;

    this.setState({ isLoading: true, errorMessage: "" });

    try {
      // Reset time to start of day for consistent querying if needed, or pass full date object
      // Ideally, pass the timestamp. DatePicker usually returns a Date object.
      let dateValue = new Date(selectedDate).getTime();
      
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
        errorMessage: "Lỗi khi tải danh sách bệnh nhân",
      });
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
    const { language } = this.props;

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

        {/* --- CARD 1: FILTER SECTION --- */}
        <div className="row">
            <div className="col-12 mb-4">
                <div className="info-card">
                    <div className="card-header">
                        <span><i className="fas fa-filter"></i> Bộ lọc tìm kiếm</span>
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
                                    // You might want to restrict selection to valid booking dates
                                />
                            </div>
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
                                        {language === LANGUAGES.VI ? "Chọn bác sĩ" : "Select doctor"}
                                    </option>
                                    {doctors && doctors.length > 0 &&
                                        doctors.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {language === LANGUAGES.VI
                                                    ? `${item.lastName || ""} ${item.firstName || ""}`.trim()
                                                    : `${item.firstName || ""} ${item.lastName || ""}`.trim()}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* --- CARD 2: PATIENT LIST TABLE --- */}
        <div className="row">
            <div className="col-12">
                <div className="info-card">
                    <div className="card-header">
                        <span><i className="fas fa-list-alt"></i> Danh sách bệnh nhân đặt lịch</span>
                    </div>
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-striped table-bordered mb-0">
                                <thead>
                                    <tr>
                                        <th style={{ width: '50px', textAlign: 'center'}}>#</th>
                                        <th>Họ tên</th>
                                        <th>Email</th>
                                        <th>SĐT</th>
                                        <th>Giờ khám</th>
                                        <th>Lý do khám</th>
                                        {/* You might want an 'Actions' column here later */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="6" className="text-center p-4">
                                                <i className="fas fa-spinner fa-spin mr-2"></i> Đang tải dữ liệu...
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
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center p-4">
                                                        {errorMessage || "Chưa có bệnh nhân đặt lịch vào ngày này."}
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