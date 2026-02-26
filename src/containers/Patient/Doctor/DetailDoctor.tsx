import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import HomeHeader from "containers/HomePage/HomeHeader";
import HomeFooter from "containers/HomePage/HomeFooter";
import Breadcrumb from "../../../components/Breadcrumb";
import "../../../components/Breadcrumb.scss";
import "./DetailDoctor.scss";
import { getDetailInfoDoctor } from "../../../services/doctorService";
import { LANGUAGES } from "utils";
import DoctorSchedules from "./DoctorSchedules";
import DoctorExtraInfo from "./DoctorExtraInfo";
import { IRootState } from "../../../types";

const DetailDoctor = () => {
  const { id } = useParams<{ id: string }>();
  const language = useSelector((state: IRootState) => state.app.language);
  const [detailDoctor, setDetailDoctor] = useState<any>({
    image: "",
    positionData: {},
  });

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) return;
      try {
        const res = await getDetailInfoDoctor(id);
        if (res && res.errCode === 0) {
          setDetailDoctor(res.data);
        }
      } catch (e) {}
    };
    fetchDoctor();
  }, [id]);

  const buildDoctorName = useCallback(
    (doctor: any) => {
      if (doctor && doctor.positionData) {
        let nameVi = `${doctor.positionData.value_Vi}, ${
          doctor.roleData?.value_Vi || ""
        } ${doctor.lastName} ${doctor.firstName}`;
        let nameEn = `${doctor.positionData.value_En}, ${
          doctor.roleData?.value_En || ""
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
      to: "/top-doctor",
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
            <div
              className="content-left"
              style={{
                backgroundImage: `url(data:image/jpeg;base64,${
                  detailDoctor.image ? detailDoctor.image : ""
                })`,
              }}
            ></div>
            <div className="content-right">
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
              <DoctorSchedules
                detailDoctorFromParent={
                  detailDoctor && detailDoctor.id ? detailDoctor.id : -1
                }
              />
            </div>
            <div className="content-right">
              <DoctorExtraInfo
                detailDoctorFromParent={
                  detailDoctor && detailDoctor.id ? detailDoctor.id : -1
                }
              />
            </div>
          </div>
          <div className="detail-info">
            {detailDoctor &&
              detailDoctor.Markdown &&
              detailDoctor.Markdown.contentHTML && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: detailDoctor.Markdown.contentHTML,
                  }}
                ></div>
              )}
          </div>
          <div className="comment-doctor"></div>
        </div>
      </div>
      <HomeFooter />
    </>
  );
};

export default DetailDoctor;
