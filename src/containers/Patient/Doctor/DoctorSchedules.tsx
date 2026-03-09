import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import "./DoctorSchedules.scss";
import moment from "moment";
import { LANGUAGES, path } from "../../../utils";
import { getScheduleDoctorByDate } from "../../../services/doctorService";
import { FormattedMessage } from "react-intl";
import { IRootState } from "../../../types";

interface IDoctorSchedulesProps {
  detailDoctorFromParent: number | string;
}

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getArrDays = (language: string) => {
  let allDays: any[] = [];
  for (let i = 0; i < 7; i++) {
    let object: any = {};
    if (language === LANGUAGES.VI) {
      if (i === 0) {
        let ddMM = moment(new Date()).format("DD/MM");
        let today = `Hôm nay - ${ddMM}`;
        object.label = today;
      } else {
        let labelVi = moment(new Date())
          .add(i, "days")
          .format("dddd - DD/MM");
        object.label = capitalizeFirstLetter(labelVi);
      }
    } else {
      if (i === 0) {
        let ddMM = moment(new Date()).format("DD/MM");
        let today = `Today - ${ddMM}`;
        object.label = today;
      } else {
        object.label = moment(new Date())
          .add(i, "days")
          .locale("en")
          .format("dddd - DD/MM");
      }
    }
    object.value = moment(new Date()).add(i, "days").startOf("day").valueOf();
    allDays.push(object);
  }
  return allDays;
};

const DoctorSchedules = ({ detailDoctorFromParent }: IDoctorSchedulesProps) => {
  const language = useSelector((state: IRootState) => state.app.language);
  const history = useHistory();
  const [allDays, setAllDays] = useState<any[]>([]);
  const [availableTime, setAvailableTime] = useState<any[]>([]);

  useEffect(() => {
    const initSchedule = async () => {
      let days = getArrDays(language);
      setAllDays(days);
      if (detailDoctorFromParent) {
        let res = await getScheduleDoctorByDate(
          detailDoctorFromParent,
          days[0].value
        );
        setAvailableTime(res.data ? res.data : []);
      }
    };
    initSchedule();
  }, [detailDoctorFromParent, language]);

  const handleOnChangeSelect = useCallback(
    async (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (detailDoctorFromParent && detailDoctorFromParent !== -1) {
        let doctorId = detailDoctorFromParent;
        let date = event.target.value;
        let res = await getScheduleDoctorByDate(doctorId, date);
        if (res && res.errCode === 0) {
          setAvailableTime(res.data ? res.data : []);
        }
      }
    },
    [detailDoctorFromParent]
  );

  const handleBookingDoctor = useCallback(
    (scheduleTime: any) => {
      let doctorId =
        scheduleTime.doctorId ||
        (detailDoctorFromParent && (detailDoctorFromParent as any).id);
      if (path.BOOKING_DOCTOR && doctorId) {
        let linkRedirect = path.BOOKING_DOCTOR.replace(":id", doctorId);
        history.push({
          pathname: linkRedirect,
          state: {
            dataTime: scheduleTime,
          },
        });
      }
    },
    [detailDoctorFromParent, history]
  );

  return (
    <div className="doctor-schedules-container">
      <div className="all-schedules">
        <select onChange={(event) => handleOnChangeSelect(event)}>
          {allDays &&
            allDays.length > 0 &&
            allDays.map((item, index) => {
              return (
                <option value={item.value} key={index}>
                  {item.label}
                </option>
              );
            })}
        </select>
      </div>
      <div className="available-schedules">
        <div className="text-calender">
          <i className="fas fa-calendar-alt"></i>{" "}
          <span>
            <FormattedMessage id="patient.detail-doctor.schedule" />
          </span>
        </div>
        <div className="time-content">
          {availableTime && availableTime.length > 0 ? (
            <>
              <div className="time-content-btns">
                {availableTime.map((item, index) => {
                  let timeDisplay =
                    language === LANGUAGES.VI
                      ? item.timeTypeData.valueVi
                      : item.timeTypeData.valueEn;
                  return (
                    <button
                      onClick={() => handleBookingDoctor(item)}
                      key={index}
                      className={
                        language === LANGUAGES.VI ? "btn-vi" : "btn-en"
                      }
                    >
                      {timeDisplay}
                    </button>
                  );
                })}
              </div>

              <div className="book-free">
                <span>
                  <FormattedMessage id="patient.detail-doctor.choose" />
                  <i className="far fa-hand-point-up"></i>
                  <FormattedMessage id="patient.detail-doctor.book-free" />
                </span>
              </div>
            </>
          ) : (
            <div className="no-schedule">
              <FormattedMessage id="patient.detail-doctor.no-schedule" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedules;
