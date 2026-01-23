import React, { Component } from "react";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import "./ManageSchedule.scss";
import Select from "react-select";
import * as actions from "../../../store/actions";
import { LANGUAGES, USER_ROLE } from "../../../utils";
import DatePicker from "../../../components/Input/DatePicker";
import { toast } from "react-toastify";
import _ from "lodash";
import moment from "moment";
import {
  saveBulkScheduleDoctor,
  getScheduleDoctorByDate,
} from "../../../services/doctorService";
import { handleGetAllDoctorsService } from "../../../services/doctorService";

class ManageSchedule extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDoctor: {},
      listDoctors: [],
      startDate: new Date(),
      rangeTime: [],
    };
  }

  componentDidMount() {
    if (this.props.userInfo?.roleId === USER_ROLE.ADMIN) {
      this.props.getAllDoctors();
    } else {
      this.initDoctorForRole();
    }
    this.props.getAllScheduleTime();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.allDoctors !== this.props.allDoctors) {
      let dataSelect = this.buildDataInputSelect(this.props.allDoctors);
      this.setState({ listDoctors: dataSelect });
    }
    if (prevProps.userInfo !== this.props.userInfo) {
      this.initDoctorForRole();
    }
    if (prevProps.language !== this.props.language) {
      let dataSelect = this.buildDataInputSelect(this.props.allDoctors);
      this.setState({ listDoctors: dataSelect });
      if (this.props.userInfo?.roleId === USER_ROLE.DOCTOR) {
        this.initDoctorForRole();
      }
    }
    if (prevProps.allScheduleTime !== this.props.allScheduleTime) {
      let data = this.props.allScheduleTime;
      if (data && data.length > 0) {
        data = data.map((item) => ({ ...item, isSelected: false }));
      }
      this.setState({ rangeTime: data });
    }
  }

  initDoctorForRole = async () => {
    const { userInfo, language } = this.props;
    if (!userInfo) return;

    if (userInfo.roleId === USER_ROLE.DOCTOR) {
      let doctorId = userInfo.id || userInfo.userId;
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
      const labelVi =
        `${userInfo.lastName ?? ""} ${userInfo.firstName ?? ""}`.trim();
      const labelEn =
        `${userInfo.firstName ?? ""} ${userInfo.lastName ?? ""}`.trim();
      this.setState({
        selectedDoctor: {
          value: doctorId,
          label: language === LANGUAGES.VI ? labelVi : labelEn,
        },
        listDoctors: [],
      });
    }
  };

  buildDataInputSelect = (inputData = []) => {
    const { language } = this.props;
    return inputData.map((item) => {
      const labelVi = `${item.lastName ?? ""} ${item.firstName ?? ""}`.trim();
      const labelEn = `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim();
      return {
        label: language === LANGUAGES.VI ? labelVi : labelEn,
        value: item.id,
      };
    });
  };

  handleChangeSelectDoctor = async (selectedDoctor) => {
    const { userInfo } = this.props;
    if (userInfo?.roleId === USER_ROLE.DOCTOR) return;
    if (!selectedDoctor || !selectedDoctor.value) return;
    this.setState({ selectedDoctor }, () => {
      this.fetchScheduleForDate();
    });
  };

  handleChange = (selectedDates, dateStr) => {
    let nextDate = null;

    if (selectedDates && selectedDates.length > 0) {
      const candidate = selectedDates[0];
      if (candidate && !isNaN(new Date(candidate).getTime())) {
        nextDate = candidate;
      }
    }

    if (!nextDate && dateStr) {
      const parsed = moment(dateStr, "DD/MM/YYYY", true);
      if (parsed.isValid()) {
        nextDate = parsed.toDate();
      }
    }

    if (!nextDate && selectedDates && selectedDates.length === 0 && !dateStr) {
      return;
    }

    this.setState({ startDate: nextDate }, () => {
      this.fetchScheduleForDate();
    });
  };

  fetchScheduleForDate = async () => {
    const { userInfo } = this.props;
    const { selectedDoctor, startDate, rangeTime } = this.state;

    const doctorId = selectedDoctor?.value
      ? selectedDoctor.value
      : userInfo?.roleId === USER_ROLE.DOCTOR
        ? userInfo?.id || userInfo?.userId
        : "";

    if (!doctorId || !startDate) return;

    const parsed = new Date(startDate);
    const dateValue = !isNaN(parsed.getTime()) ? parsed.getTime() : null;
    if (!dateValue) return;

    try {
      const res = await getScheduleDoctorByDate(doctorId, dateValue);
      const scheduled = res && res.errCode === 0 ? res.data || [] : [];
      const scheduledKeys = new Set(
        scheduled.map((item) => item.timeType || item.keyMap),
      );

      const updatedRange = (rangeTime || []).map((item) => ({
        ...item,
        isSelected: scheduledKeys.has(item.keyMap),
      }));

      this.setState({ rangeTime: updatedRange });
    } catch (e) {}
  };

  handleClickTime = (time) => {
    let { rangeTime } = this.state;
    if (rangeTime && rangeTime.length > 0) {
      rangeTime = rangeTime.map((item) => {
        if (item.id === time.id) item.isSelected = !item.isSelected;
        return item;
      });
      this.setState({ rangeTime: rangeTime });
    }
  };

  handleSaveSchedule = async () => {
    let { rangeTime, selectedDoctor, startDate } = this.state;
    const { userInfo, language } = this.props;
    let result = [];

    const resolvedDoctorId =
      selectedDoctor && selectedDoctor.value
        ? selectedDoctor.value
        : userInfo?.roleId === USER_ROLE.DOCTOR
          ? userInfo?.id || userInfo?.userId
          : "";

    if (!startDate) {
      toast.error("Invalid date!");
      return;
    }
    if (!resolvedDoctorId) {
      console.log("[ManageSchedule] missing doctorId", {
        selectedDoctor,
        resolvedDoctorId,
        userInfo,
      });
      toast.error("Invalid selected doctor!");
      return;
    }

    if (!selectedDoctor || _.isEmpty(selectedDoctor)) {
      if (userInfo?.roleId === USER_ROLE.DOCTOR && resolvedDoctorId) {
        const labelVi =
          `${userInfo.lastName ?? ""} ${userInfo.firstName ?? ""}`.trim();
        const labelEn =
          `${userInfo.firstName ?? ""} ${userInfo.lastName ?? ""}`.trim();
        selectedDoctor = {
          value: resolvedDoctorId,
          label: language === LANGUAGES.VI ? labelVi : labelEn,
        };
        this.setState({ selectedDoctor });
      }
    }

    const parsedStartDate = startDate ? new Date(startDate) : null;
    const formatDate =
      parsedStartDate && !isNaN(parsedStartDate.getTime())
        ? parsedStartDate.getTime()
        : null;

    if (!formatDate) {
      toast.error("Invalid date!");
      return;
    }

    if (rangeTime && rangeTime.length > 0) {
      let selectedTime = rangeTime.filter((item) => item.isSelected === true);
      if (selectedTime && selectedTime.length > 0) {
        selectedTime.map((item) => {
          let object = {};
          object.doctorId = resolvedDoctorId;
          object.date = formatDate;
          object.timeType = item.keyMap;
          result.push(object);
          return item;
        });
      } else {
        toast.error("Invalid selected time!");
        return;
      }

      let res = await saveBulkScheduleDoctor({
        arrSchedule: result,
        doctorId: resolvedDoctorId,
        formattedDate: formatDate,
      });

      console.log("[ManageSchedule] save schedule payload", {
        doctorId: resolvedDoctorId,
        formattedDate: formatDate,
        arrSchedule: result,
      });

      if (res && res.errCode === 0) {
        toast.success("Save schedule succeed!");
        this.setState({
          rangeTime: rangeTime.map((item) => ({ ...item, isSelected: false })),
        });
      } else {
        toast.error("Save schedule failed!");
      }
    }
  };

  render() {
    let currentDay = new Date();
    let { rangeTime } = this.state;
    let { language, userInfo } = this.props;
    const isAdmin = userInfo?.roleId === USER_ROLE.ADMIN;
    console.log("Check state manage schedule: ", this.state);
    return (
      <div className="manage-schedule-container">
        <div className="m-s-title">
          <FormattedMessage id="manage-schedule.title" />
        </div>

        <div className="row">
          <div className="col-12">
            <div className="info-card">
              <div className="card-header">
                <span>
                  <i className="fas fa-calendar-alt"></i> Thông tin kế hoạch
                </span>
              </div>

              <div className="card-body">
                <div className="row">
                  {isAdmin ? (
                    <div className="col-md-6 form-group">
                      <label>
                        <FormattedMessage id="manage-schedule.select-doctor" />
                      </label>
                      <Select
                        value={this.state.selectedDoctor}
                        onChange={this.handleChangeSelectDoctor}
                        options={this.state.listDoctors}
                        menuPortalTarget={document.body}
                        styles={{
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                      />
                    </div>
                  ) : (
                    <div className="col-md-6 form-group">
                      <label>
                        <FormattedMessage id="manage-schedule.select-doctor" />
                      </label>
                      <input
                        className="form-control"
                        value={this.state.selectedDoctor?.label || ""}
                        disabled
                        readOnly
                      />
                    </div>
                  )}

                  {/* Chọn Ngày */}
                  <div className="col-md-6 form-group">
                    <label>
                      <FormattedMessage id="manage-schedule.select-date" />
                    </label>
                    <DatePicker
                      className="form-control"
                      onChange={this.handleChange}
                      value={this.state.startDate}
                      minDate={currentDay}
                    />
                  </div>
                  <div className="col-12 pick-hour-container">
                    <label className="mb-3">Chọn khung giờ khám:</label>
                    <div className="time-content">
                      {rangeTime &&
                        rangeTime.length > 0 &&
                        rangeTime.map((item, index) => {
                          return (
                            <button
                              className={
                                item.isSelected === true
                                  ? "btn btn-schedule active"
                                  : "btn btn-schedule"
                              }
                              key={index}
                              onClick={() => this.handleClickTime(item)}
                            >
                              {language === LANGUAGES.VI
                                ? item.value_Vi
                                : item.value_En}
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* Nút Lưu */}
                  <div className="col-12 btn-container">
                    <button
                      className="btn btn-primary btn-save-schedule"
                      onClick={() => this.handleSaveSchedule()}
                    >
                      <i className="fas fa-save"></i>{" "}
                      <FormattedMessage id="manage-schedule.save" />
                    </button>
                  </div>
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
    isLoggedIn: state.user.isLoggedIn,
    userInfo: state.user.userInfo,
    allDoctors: state.admin.allDoctors,
    language: state.app.language,
    allScheduleTime: state.admin.allScheduleTime,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    getAllDoctors: () => dispatch(actions.fetchAllDoctorsStart()),
    getAllScheduleTime: () => dispatch(actions.fetchAllScheduleTime()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(ManageSchedule);
