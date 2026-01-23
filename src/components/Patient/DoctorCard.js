import React, { Component } from "react";
import { connect } from "react-redux";
import "./DoctorCard.scss";
import { FormattedMessage } from "react-intl";
import {
  handleGetAllDoctorsService,
  getDetailInfoDoctor,
  getScheduleDoctorByDate,
  HandleGetDoctorSpecialtyById,
} from "../../services/doctorService";
import { LANGUAGES, path } from "utils";
import { getBase64FromBuffer } from "utils/CommonUtils";
import DoctorExtraInfo from "../../containers/Patient/Doctor/DoctorExtraInfo";
import { withRouter } from "react-router";

class DoctorCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      doctors: [],
      filteredDoctors: [],
      provinceOptions: [],
      selectedProvince: "ALL",
      schedulesByDoctor: {},
      selectedDateByDoctor: {},
      dateOptions: this.buildDateOptions(),
    };
  }

  async componentDidMount() {
    await this.fetchDoctors();
  }

  async componentDidUpdate(prevProps, prevState, snapShot) {
    if (this.props.language !== prevProps.language) {
      this.setState({});
    }
    if (
      this.props.specialtyId !== prevProps.specialtyId ||
      this.props.clinicId !== prevProps.clinicId ||
      this.props.doctorIds !== prevProps.doctorIds
    ) {
      await this.fetchDoctors();
    }
  }

  buildDateOptions = () => {
    const today = new Date();
    const options = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const label =
        i === 0
          ? "Hôm nay"
          : i === 1
            ? "Ngày mai"
            : d.toLocaleDateString("vi-VN");
      const value = new Date(d.setHours(0, 0, 0, 0)).getTime();
      options.push({ label, value });
    }
    return options;
  };

  fetchDoctors = async () => {
    try {
      const { specialtyId, clinicId, doctorIds } = this.props;
      let res = {};
      if (Array.isArray(doctorIds)) {
        if (doctorIds.length === 0) {
          this.setState({
            doctors: [],
            filteredDoctors: [],
            provinceOptions: [],
          });
          return;
        }
        const detailPromises = doctorIds.map((id) => getDetailInfoDoctor(id));
        const detailResults = await Promise.all(detailPromises);
        const doctors = detailResults
          .filter((item) => item && item.errCode === 0 && item.data)
          .map((item) => this.normalizeDoctor(item.data));
        const provinceOptions = this.buildProvinceOptions(doctors);
        this.setState(
          {
            doctors,
            filteredDoctors: doctors,
            provinceOptions,
            selectedProvince: "ALL",
          },
          () => {
            doctors.forEach((doc) => {
              const defaultDate = this.state.dateOptions[0]?.value;
              if (defaultDate) {
                this.handleFetchSchedule(doc.id, defaultDate);
              }
            });
          },
        );
        return;
      }
      if (specialtyId) {
        res = await HandleGetDoctorSpecialtyById(specialtyId);
      } else if (clinicId) {
      } else {
        res = await handleGetAllDoctorsService();
      }
      if (res && res.errCode === 0) {
        let list = [];
        if (clinicId && res.data && res.data.doctorClinic) {
          list = res.data.doctorClinic;
        } else if (Array.isArray(res.data)) {
          list = res.data;
        }

        const detailPromises = list.map((item) => {
          const hasDetail =
            item &&
            (item.Markdown || item.DoctorInfo || item.positionData || item.id);

          if (hasDetail && item.Markdown) {
            return Promise.resolve({ errCode: 0, data: item });
          }
          const doctorId = item.doctorId || item.id;
          if (!doctorId) return Promise.resolve(null);
          return getDetailInfoDoctor(doctorId);
        });

        const detailResults = await Promise.all(detailPromises);
        const doctors = detailResults
          .filter((item) => item && item.errCode === 0 && item.data)
          .map((item) => this.normalizeDoctor(item.data));

        const provinceOptions = this.buildProvinceOptions(doctors);

        this.setState(
          {
            doctors,
            filteredDoctors: doctors,
            provinceOptions,
            selectedProvince: "ALL",
          },
          () => {
            doctors.forEach((doc) => {
              const defaultDate = this.state.dateOptions[0]?.value;
              if (defaultDate) {
                this.handleFetchSchedule(doc.id, defaultDate);
              }
            });
          },
        );
      } else {
        this.setState({
          doctors: [],
          filteredDoctors: [],
          provinceOptions: [],
        });
      }
    } catch (e) {
      console.error(e);
      this.setState({ doctors: [], filteredDoctors: [], provinceOptions: [] });
    }
  };

  normalizeDoctor = (data) => {
    const { language } = this.props;
    const positionVi = data.positionData?.value_Vi || "";
    const positionEn = data.positionData?.value_En || "";
    const nameVi =
      `${positionVi}, ${data.lastName || ""} ${data.firstName || ""}`.trim();
    const nameEn =
      `${positionEn}, ${data.firstName || ""} ${data.lastName || ""}`.trim();
    const name = language === LANGUAGES.VI ? nameVi : nameEn;

    return {
      id: data.id,
      name,
      desc: data.Markdown?.description || "Chưa có mô tả",
      image: data.image ? getBase64FromBuffer(data.image) : "",
      province:
        data.DoctorInfo?.provinceTypeData?.value_Vi ||
        data.DoctorInfo?.provinceTypeData?.value_En ||
        "",
      address: data.DoctorInfo?.addressClinic || "",
    };
  };

  handleFetchSchedule = async (doctorId, dateValue) => {
    try {
      const res = await getScheduleDoctorByDate(doctorId, dateValue);
      const schedules = res && res.errCode === 0 ? res.data || [] : [];
      this.setState((prevState) => ({
        schedulesByDoctor: {
          ...prevState.schedulesByDoctor,
          [doctorId]: schedules,
        },
        selectedDateByDoctor: {
          ...prevState.selectedDateByDoctor,
          [doctorId]: dateValue,
        },
      }));
    } catch (e) {
      this.setState((prevState) => ({
        schedulesByDoctor: { ...prevState.schedulesByDoctor, [doctorId]: [] },
      }));
    }
  };

  buildProvinceOptions = (doctors = []) => {
    const map = new Map();
    doctors.forEach((doc) => {
      if (doc && doc.province) map.set(doc.province, doc.province);
    });
    return [
      { label: "Tất cả tỉnh thành", value: "ALL" },
      ...Array.from(map.values()).map((value) => ({ label: value, value })),
    ];
  };

  handleFilterProvince = (event) => {
    const selectedProvince = event.target.value;
    const { doctors } = this.state;
    const filteredDoctors =
      selectedProvince === "ALL"
        ? doctors
        : doctors.filter((doc) => doc.province === selectedProvince);
    this.setState({ selectedProvince, filteredDoctors });
  };

  handleBookingDoctor = (scheduleTime, doctorIdFromList) => {
    if (!scheduleTime) return;
    const doctorId = scheduleTime.doctorId || doctorIdFromList;
    if (!doctorId || !path.BOOKING_DOCTOR || !this.props.history) return;

    const linkRedirect = path.BOOKING_DOCTOR.replace(":id", doctorId);
    this.props.history.push({
      pathname: linkRedirect,
      state: { dataTime: scheduleTime },
    });
  };

  handleViewDetailDoctor = (doctorId) => {
    if (this.props.history) {
      this.props.history.push(`/detail-doctor/${doctorId}`);
    }
  };

  handleChangeDate = (doctorId, event) => {
    const dateValue = Number(event.target.value);
    this.handleFetchSchedule(doctorId, dateValue);
  };

  renderProvinceOptions = () => {
    const { provinceOptions, selectedProvince } = this.state;
    return (
      <select
        className="province-select"
        value={selectedProvince}
        onChange={this.handleFilterProvince}
      >
        {provinceOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };

  renderScheduleTimes = (schedules, doctorId) => {
    const { language } = this.props;
    if (schedules && schedules.length > 0) {
      return schedules.map((item, idx) => (
        <button
          className="time-btn"
          key={idx}
          onClick={() => this.handleBookingDoctor(item, doctorId)}
        >
          {language === LANGUAGES.VI
            ? item.timeTypeData?.value_Vi
            : item.timeTypeData?.value_En}
        </button>
      ));
    }
    return (
      <div className="no-schedule">
        <FormattedMessage id="patient.detail-doctor.no-schedule" />
      </div>
    );
  };

  renderDoctorList = () => {
    const {
      filteredDoctors,
      schedulesByDoctor,
      selectedDateByDoctor,
      dateOptions,
    } = this.state;
    const { language, clinicId } = this.props;
    const displayDoctors = filteredDoctors || [];

    if (displayDoctors.length === 0) {
      return (
        <div className="doctor-empty">
          <FormattedMessage id="components.doctor-card.no-doctors" />
        </div>
      );
    }

    return displayDoctors.map((doctor) => {
      const schedules = schedulesByDoctor[doctor.id] || [];
      const selectedDate =
        selectedDateByDoctor[doctor.id] || dateOptions[0]?.value;

      return (
        <div className="doctor-card" key={doctor.id}>
          <div className="doctor-card-left">
            <div className="doctor-intro">
              <div
                className="doctor-avatar"
                style={{ backgroundImage: `url(${doctor.image})` }}
                onClick={() => this.handleViewDetailDoctor(doctor.id)}
              ></div>
              <div className="doctor-info">
                <div
                  className="doctor-name"
                  onClick={() => this.handleViewDetailDoctor(doctor.id)}
                >
                  {doctor.name}
                </div>
                <div className="doctor-desc">{doctor.desc}</div>
                <div className="location-text">
                  <i className="fas fa-map-marker-alt"></i>{" "}
                  {doctor.province || "Hà Nội"}
                </div>
                <span
                  className="doctor-view-more"
                  onClick={() => this.handleViewDetailDoctor(doctor.id)}
                >
                  <FormattedMessage id="components.doctor-card.more-info" />
                </span>
              </div>
            </div>
          </div>

          <div className="doctor-card-right">
            <div className="doctor-schedule">
              <div className="schedule-header">
                <select
                  className="schedule-select"
                  value={selectedDate}
                  onChange={(e) => this.handleChangeDate(doctor.id, e)}
                >
                  {dateOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="schedule-title">
                <i className="fas fa-calendar-alt"></i>
                <span>
                  <FormattedMessage
                    id="patient.detail-doctor.schedule"
                    defaultMessage="LỊCH KHÁM"
                  />
                </span>
              </div>

              <div className="schedule-times">
                {this.renderScheduleTimes(schedules, doctor.id)}
              </div>

              <div className="book-free-text">
                <FormattedMessage id="patient.detail-doctor.choose" />{" "}
                <i className="far fa-hand-point-up"></i>{" "}
                <FormattedMessage id="patient.detail-doctor.book-free" />
              </div>
            </div>

            <div className="doctor-extra-info-container">
              <DoctorExtraInfo detailDoctorFromParent={doctor.id} />
            </div>
          </div>
        </div>
      );
    });
  };

  render() {
    const { clinicId } = this.props;

    return (
      <div className="doctor-specialty-container">
        {!clinicId && (
          <div className="doctor-specialty-filter">
            {this.renderProvinceOptions()}
          </div>
        )}
        <div className="doctor-specialty-list">{this.renderDoctorList()}</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ language: state.app.language });
export default withRouter(connect(mapStateToProps)(DoctorCard));