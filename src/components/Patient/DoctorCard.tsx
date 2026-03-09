import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import "./DoctorCard.scss";
import { FormattedMessage } from "react-intl";
import {
  handleGetAllDoctors,
  getDetailInfoDoctor,
  getScheduleDoctorByDate,
  HandleGetDoctorSpecialtyById,
} from "../../services/doctorService";
import { LANGUAGES, path } from "utils";
import { getBase64FromBuffer } from "utils/CommonUtils";
import DoctorExtraInfo from "../../containers/Patient/Doctor/DoctorExtraInfo";
import { useHistory } from "react-router";
import { IRootState } from "../../types";

interface IDoctorCardProps {
  specialtyId?: number | string;
  clinicId?: number | string;
  doctorIds?: (number | string)[];
}

// Hàm helper tạo date options
const buildDateOptions = () => {
  const today = new Date();
  const options: { label: string; value: number }[] = [];
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

// DoctorCard chuyển sang Function Component + Hooks
const DoctorCard: React.FC<IDoctorCardProps> = ({
  specialtyId,
  clinicId,
  doctorIds,
}) => {
  const language = useSelector((state: IRootState) => state.app.language);
  const history = useHistory();

  const [doctors, setDoctors] = useState<any[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("ALL");
  const [schedulesByDoctor, setSchedulesByDoctor] = useState<
    Record<string, any[]>
  >({});
  const [selectedDateByDoctor, setSelectedDateByDoctor] = useState<
    Record<string, number>
  >({});
  const [dateOptions] = useState(() => buildDateOptions());

  const normalizeDoctor = useCallback(
    (data: any) => {
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
    },
    [language],
  );

  const buildProvinceOptions = useCallback((doctorsList: any[] = []) => {
    const map = new Map();
    doctorsList.forEach((doc) => {
      if (doc && doc.province) map.set(doc.province, doc.province);
    });
    return [
      { label: "Tất cả tỉnh thành", value: "ALL" },
      ...Array.from(map.values()).map((value) => ({ label: value, value })),
    ];
  }, []);

  const handleFetchSchedule = useCallback(
    async (doctorId: any, dateValue: number) => {
      try {
        const res = await getScheduleDoctorByDate(doctorId, dateValue);
        const schedules = res && res.errCode === 0 ? res.data || [] : [];
        setSchedulesByDoctor((prev) => ({ ...prev, [doctorId]: schedules }));
        setSelectedDateByDoctor((prev) => ({ ...prev, [doctorId]: dateValue }));
      } catch (e) {
        setSchedulesByDoctor((prev) => ({ ...prev, [doctorId]: [] }));
      }
    },
    [],
  );

  const fetchDoctors = useCallback(async () => {
    try {
      let res: any = {};
      if (Array.isArray(doctorIds)) {
        if (doctorIds.length === 0) {
          setDoctors([]);
          setFilteredDoctors([]);
          setProvinceOptions([]);
          return;
        }
        const detailPromises = doctorIds.map((id) => getDetailInfoDoctor(id));
        const detailResults = await Promise.all(detailPromises);
        const docs = detailResults
          .filter((item) => item && item.errCode === 0 && item.data)
          .map((item) => normalizeDoctor(item.data));
        const provOpts = buildProvinceOptions(docs);
        setDoctors(docs);
        setFilteredDoctors(docs);
        setProvinceOptions(provOpts);
        setSelectedProvince("ALL");
        docs.forEach((doc) => {
          const defaultDate = dateOptions[0]?.value;
          if (defaultDate) handleFetchSchedule(doc.id, defaultDate);
        });
        return;
      }
      if (specialtyId) {
        res = await HandleGetDoctorSpecialtyById(specialtyId);
      } else if (clinicId) {
        // clinicId case
      } else {
        res = await handleGetAllDoctors();
      }
      if (res && res.errCode === 0) {
        let list: any[] = [];
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
        const docs = detailResults
          .filter((item) => item && item.errCode === 0 && item.data)
          .map((item: any) => normalizeDoctor(item.data));

        const provOpts = buildProvinceOptions(docs);

        setDoctors(docs);
        setFilteredDoctors(docs);
        setProvinceOptions(provOpts);
        setSelectedProvince("ALL");
        docs.forEach((doc) => {
          const defaultDate = dateOptions[0]?.value;
          if (defaultDate) handleFetchSchedule(doc.id, defaultDate);
        });
      } else {
        setDoctors([]);
        setFilteredDoctors([]);
        setProvinceOptions([]);
      }
    } catch (e) {
      console.error(e);
      setDoctors([]);
      setFilteredDoctors([]);
      setProvinceOptions([]);
    }
  }, [
    specialtyId,
    clinicId,
    doctorIds,
    normalizeDoctor,
    buildProvinceOptions,
    handleFetchSchedule,
    dateOptions,
  ]);

  // componentDidMount + componentDidUpdate khi props thay đổi
  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleFilterProvince = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const selected = event.target.value;
      const filtered =
        selected === "ALL"
          ? doctors
          : doctors.filter((doc) => doc.province === selected);
      setSelectedProvince(selected);
      setFilteredDoctors(filtered);
    },
    [doctors],
  );

  const handleBookingDoctor = useCallback(
    (scheduleTime: any, doctorIdFromList: any) => {
      if (!scheduleTime) return;
      const doctorId = scheduleTime.doctorId || doctorIdFromList;
      if (!doctorId || !path.BOOKING_DOCTOR || !history) return;

      const linkRedirect = path.BOOKING_DOCTOR.replace(":id", doctorId);
      history.push({
        pathname: linkRedirect,
        state: { dataTime: scheduleTime },
      });
    },
    [history],
  );

  const handleViewDetailDoctor = useCallback(
    (doctorId: any) => {
      if (history) {
        history.push(`/detail-doctor/${doctorId}`);
      }
    },
    [history],
  );

  const handleChangeDate = useCallback(
    (doctorId: any, event: React.ChangeEvent<HTMLSelectElement>) => {
      const dateValue = Number(event.target.value);
      handleFetchSchedule(doctorId, dateValue);
    },
    [handleFetchSchedule],
  );

  const renderProvinceOptions = () => {
    return (
      <select
        className="province-select"
        value={selectedProvince}
        onChange={handleFilterProvince}
      >
        {provinceOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };

  const renderScheduleTimes = (schedules: any[], doctorId: any) => {
    if (schedules && schedules.length > 0) {
      return schedules.map((item, idx) => (
        <button
          className="time-btn"
          key={idx}
          onClick={() => handleBookingDoctor(item, doctorId)}
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

  const renderDoctorList = () => {
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
                onClick={() => handleViewDetailDoctor(doctor.id)}
              ></div>
              <div className="doctor-info">
                <div
                  className="doctor-name"
                  onClick={() => handleViewDetailDoctor(doctor.id)}
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
                  onClick={() => handleViewDetailDoctor(doctor.id)}
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
                  onChange={(e) => handleChangeDate(doctor.id, e)}
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
                {renderScheduleTimes(schedules, doctor.id)}
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

  return (
    <div className="doctor-specialty-container">
      {!clinicId && (
        <div className="doctor-specialty-filter">{renderProvinceOptions()}</div>
      )}
      <div className="doctor-specialty-list">{renderDoctorList()}</div>
    </div>
  );
};

export default DoctorCard;