import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import HomeHeader from "layout/HomeHeader";
import HomeFooter from "layout/HomeFooter";
import Breadcrumb from "components/Breadcrumb";
import "./DetailDoctor.scss";
import { LANGUAGES, normalizeImageSrc, sanitizeHtml } from "utils";
import DoctorSchedules from "./DoctorSchedules";
import DoctorExtraInfo from "./DoctorExtraInfo";
import DoctorReviews from "./DoctorReviews";
import { IRootState } from "../../../types";
import { useGetPublicDoctorByIdQuery } from "../../../store/api/publicApi";

const DetailDoctor = () => {
  const { id } = useParams<{ id: string }>();
  const language = useSelector((state: IRootState) => state.app.language);
  const { data: doctorResponse } = useGetPublicDoctorByIdQuery(id || "", { skip: !id });
  const detailDoctor = doctorResponse?.errCode === 0 && doctorResponse.data
    ? doctorResponse.data
    : { image: "", positionData: {} };
  const doctorDescriptionHtml = useMemo(
    () => sanitizeHtml(detailDoctor?.Markdown?.contentHTML),
    [detailDoctor?.Markdown?.contentHTML],
  );
  const doctorImage = normalizeImageSrc(detailDoctor?.image);

  const buildDoctorName = useCallback(
    (doctor: any) => {
      if (doctor && doctor.positionData) {
        let nameVi = `${doctor.positionData.valueVi}, ${
          doctor.roleData?.valueVi || ""
        } ${doctor.lastName} ${doctor.firstName}`;
        let nameEn = `${doctor.positionData.valueEn}, ${
          doctor.roleData?.valueEn || ""
        } ${doctor.firstName} ${doctor.lastName}`;
        return language === LANGUAGES.VI ? nameVi : nameEn;
      }
      return "";
    },
    [language]
  );

  const breadcrumbItems = [
    {
      label: language === LANGUAGES.VI ? "Trang chủ" : "Home",
      to: "/home",
    },
    {
      label: language === LANGUAGES.VI ? "Bác sĩ" : "Doctor",
      to: "/doctors",
    },
    {
      label:
        buildDoctorName(detailDoctor) ||
        (language === LANGUAGES.VI ? "Chi tiết bác sĩ" : "Doctor Detail"),
    },
  ];

  return (
    <>
      <HomeHeader isShowBanner={false} />
      <Breadcrumb
        items={breadcrumbItems}
        containerClassName="booking-container"
      />
      <div className="detail-doctor-container">
        <div className="booking-container">
          <div className="intro-doctor">
            <div className="content-left">
              {doctorImage ? <img src={doctorImage} alt="" /> : <i className="fas fa-user-md" aria-hidden="true" />}
            </div>
            <div className="content-right">
              <span className="doctor-detail-eyebrow">Hồ sơ bác sĩ</span>
              <div className="up">{buildDoctorName(detailDoctor)}</div>
              <div className="down">
                {detailDoctor.Markdown &&
                  detailDoctor.Markdown.description && (
                    <span>{detailDoctor.Markdown.description}</span>
                  )}
              </div>
            </div>
          </div>
          <div className="schedule-doctor">
            <div className="content-left">
              <h2 className="doctor-detail-section-title"><i className="far fa-calendar-alt" /> Chọn lịch khám</h2>
              <DoctorSchedules
                detailDoctorFromParent={
                  detailDoctor && detailDoctor.id ? detailDoctor.id : -1
                }
              />
            </div>
            <div className="content-right">
              <h2 className="doctor-detail-section-title"><i className="fas fa-hospital" /> Thông tin khám</h2>
              <DoctorExtraInfo
                detailDoctorFromParent={
                  detailDoctor && detailDoctor.id ? detailDoctor.id : -1
                }
              />
            </div>
          </div>
          <div className="detail-info">
            {doctorDescriptionHtml && <h2><i className="fas fa-user-doctor" /> Giới thiệu bác sĩ</h2>}
            {detailDoctor &&
              detailDoctor.Markdown &&
              doctorDescriptionHtml && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: doctorDescriptionHtml,
                  }}
                ></div>
            )}
          </div>
          {detailDoctor?.id && <DoctorReviews doctorId={detailDoctor.id} />}
        </div>
      </div>
      <HomeFooter />
    </>
  );
};

export default DetailDoctor;
