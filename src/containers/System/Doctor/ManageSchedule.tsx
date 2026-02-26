import React, { useState, useEffect, useCallback, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
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
import { IRootState } from "../../../types";

const ManageSchedule = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: IRootState) => state.app.language);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const allDoctors = useSelector((state: IRootState) => (state as any).admin.allDoctors);
  const allScheduleTime = useSelector((state: IRootState) => (state as any).admin.allScheduleTime);

  const [selectedDoctor, setSelectedDoctor] = useState<any>({});
  const [listDoctors, setListDoctors] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [rangeTime, setRangeTime] = useState<any[]>([]);

  // Refs để tránh stale closure
  const selectedDoctorRef = useRef(selectedDoctor);
  selectedDoctorRef.current = selectedDoctor;
  const startDateRef = useRef(startDate);
  startDateRef.current = startDate;
  const rangeTimeRef = useRef(rangeTime);
  rangeTimeRef.current = rangeTime;

  const buildDataInputSelect = useCallback((inputData: any[] = []) => {
    return inputData.map((item: any) => {
      const labelVi = `${item.lastName ?? ""} ${item.firstName ?? ""}`.trim();
      const labelEn = `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim();
      return {
        label: language === LANGUAGES.VI ? labelVi : labelEn,
        value: item.id,
      };
    });
  }, [language]);

  const initDoctorForRole = useCallback(async () => {
    if (!userInfo) return;

    if (userInfo.roleId === USER_ROLE.DOCTOR) {
      let doctorId = userInfo.id || userInfo.userId;
      if (!doctorId && userInfo.email) {
        try {
          const res = await handleGetAllDoctorsService();
          if (res && res.errCode === 0 && Array.isArray(res.data)) {
            const matched = res.data.find(
              (item: any) => item && item.email === userInfo.email,
            );
            doctorId = matched?.id || "";
          }
        } catch (e) {}
      }
      const labelVi =
        `${userInfo.lastName ?? ""} ${userInfo.firstName ?? ""}`.trim();
      const labelEn =
        `${userInfo.firstName ?? ""} ${userInfo.lastName ?? ""}`.trim();
      setSelectedDoctor({
        value: doctorId,
        label: language === LANGUAGES.VI ? labelVi : labelEn,
      });
      setListDoctors([]);
    }
  }, [userInfo, language]);

  const fetchScheduleForDate = useCallback(async () => {
    const currentSelectedDoctor = selectedDoctorRef.current;
    const currentStartDate = startDateRef.current;
    const currentRangeTime = rangeTimeRef.current;

    const doctorId = currentSelectedDoctor?.value
      ? currentSelectedDoctor.value
      : userInfo?.roleId === USER_ROLE.DOCTOR
        ? userInfo?.id || userInfo?.userId
        : "";

    if (!doctorId || !currentStartDate) return;

    const parsed = new Date(currentStartDate);
    const dateValue = !isNaN(parsed.getTime()) ? parsed.getTime() : null;
    if (!dateValue) return;

    try {
      const res = await getScheduleDoctorByDate(doctorId, dateValue);
      const scheduled = res && res.errCode === 0 ? res.data || [] : [];
      const scheduledKeys = new Set(
        scheduled.map((item: any) => item.timeType || item.keyMap),
      );

      const updatedRange = (currentRangeTime || []).map((item: any) => ({
        ...item,
        isSelected: scheduledKeys.has(item.keyMap),
      }));

      setRangeTime(updatedRange);
    } catch (e) {}
  }, [userInfo]);

  // Mount: lấy danh sách bác sĩ (nếu admin) hoặc init doctor cho role
  useEffect(() => {
    if (userInfo?.roleId === USER_ROLE.ADMIN) {
      dispatch(actions.fetchAllDoctorsStart());
    } else {
      initDoctorForRole();
    }
    dispatch(actions.fetchAllScheduleTime());
  }, [dispatch, userInfo, initDoctorForRole]);

  // Khi allDoctors thay đổi → build lại select options
  useEffect(() => {
    if (allDoctors) {
      let dataSelect = buildDataInputSelect(allDoctors);
      setListDoctors(dataSelect);
    }
  }, [allDoctors, buildDataInputSelect]);

  // Khi userInfo thay đổi → init lại doctor cho role
  useEffect(() => {
    initDoctorForRole();
  }, [userInfo, initDoctorForRole]);

  // Khi language thay đổi → rebuild select options & re-init
  useEffect(() => {
    if (allDoctors) {
      let dataSelect = buildDataInputSelect(allDoctors);
      setListDoctors(dataSelect);
    }
    if (userInfo?.roleId === USER_ROLE.DOCTOR) {
      initDoctorForRole();
    }
  }, [language, allDoctors, buildDataInputSelect, userInfo, initDoctorForRole]);

  // Khi allScheduleTime thay đổi → set rangeTime với isSelected
  useEffect(() => {
    if (allScheduleTime && allScheduleTime.length > 0) {
      let data = allScheduleTime.map((item: any) => ({ ...item, isSelected: false }));
      setRangeTime(data);
    }
  }, [allScheduleTime]);

  const handleChangeSelectDoctor = useCallback(async (selected: any) => {
    if (userInfo?.roleId === USER_ROLE.DOCTOR) return;
    if (!selected || !selected.value) return;
    setSelectedDoctor(selected);
  }, [userInfo]);

  // Khi selectedDoctor thay đổi → fetch schedule
  useEffect(() => {
    if (selectedDoctor?.value) {
      fetchScheduleForDate();
    }
  }, [selectedDoctor, fetchScheduleForDate]);

  const handleChange = useCallback((selectedDates: Date[]) => {
    let nextDate: Date | null = null;

    if (selectedDates && selectedDates.length > 0) {
      const candidate = selectedDates[0];
      if (candidate && !isNaN(new Date(candidate).getTime())) {
        nextDate = candidate;
      }
    }

    if (!nextDate && selectedDates && selectedDates.length === 0) {
      return;
    }

    setStartDate(nextDate!);
  }, []);

  // Khi startDate thay đổi → fetch schedule
  useEffect(() => {
    if (startDate) {
      fetchScheduleForDate();
    }
  }, [startDate, fetchScheduleForDate]);

  const handleClickTime = useCallback((time: any) => {
    setRangeTime((prev) => {
      return prev.map((item) => {
        if (item.id === time.id) {
          return { ...item, isSelected: !item.isSelected };
        }
        return item;
      });
    });
  }, []);

  const handleSaveSchedule = async () => {
    let result: any[] = [];
    let currentSelectedDoctor = selectedDoctor;

    const resolvedDoctorId =
      currentSelectedDoctor && currentSelectedDoctor.value
        ? currentSelectedDoctor.value
        : userInfo?.roleId === USER_ROLE.DOCTOR
          ? userInfo?.id || userInfo?.userId
          : "";

    if (!startDate) {
      toast.error("Invalid date!");
      return;
    }
    if (!resolvedDoctorId) {
      console.log("[ManageSchedule] missing doctorId", {
        selectedDoctor: currentSelectedDoctor,
        resolvedDoctorId,
        userInfo,
      });
      toast.error("Invalid selected doctor!");
      return;
    }

    if (!currentSelectedDoctor || _.isEmpty(currentSelectedDoctor)) {
      if (userInfo?.roleId === USER_ROLE.DOCTOR && resolvedDoctorId) {
        const labelVi =
          `${userInfo.lastName ?? ""} ${userInfo.firstName ?? ""}`.trim();
        const labelEn =
          `${userInfo.firstName ?? ""} ${userInfo.lastName ?? ""}`.trim();
        currentSelectedDoctor = {
          value: resolvedDoctorId,
          label: language === LANGUAGES.VI ? labelVi : labelEn,
        };
        setSelectedDoctor(currentSelectedDoctor);
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
          let object: any = {};
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
        setRangeTime((prev) => prev.map((item) => ({ ...item, isSelected: false })));
      } else {
        toast.error("Save schedule failed!");
      }
    }
  };

  let currentDay = new Date();
  const isAdmin = userInfo?.roleId === USER_ROLE.ADMIN;
  console.log("Check state manage schedule: ", { selectedDoctor, listDoctors, startDate, rangeTime });

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
                      value={selectedDoctor}
                      onChange={handleChangeSelectDoctor}
                      options={listDoctors}
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
                      value={selectedDoctor?.label || ""}
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
                    onChange={handleChange}
                    value={startDate}
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
                            onClick={() => handleClickTime(item)}
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
                    onClick={() => handleSaveSchedule()}
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
};

export default ManageSchedule;