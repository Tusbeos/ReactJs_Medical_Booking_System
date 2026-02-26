import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { getSpecialtyByIds } from "../../../services/specialtyService";
import { HandleGetDoctorSpecialtyById } from "../../../services/doctorService";
import HomeHeader from "containers/HomePage/HomeHeader";
import HomeFooter from "containers/HomePage/HomeFooter";
import Breadcrumb from "../../../components/Breadcrumb";
import "../../../components/Breadcrumb.scss";
import { getBase64FromBuffer } from "../../../utils/CommonUtils";
import "./DetailSpecialty.scss";
import DoctorCard from "components/Patient/DoctorCard";
import { LANGUAGES } from "utils";
import { IRootState } from "../../../types";

const DetailSpecialty = () => {
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();
  const language = useSelector((state: IRootState) => state.app.language);
  const [specialty, setSpecialty] = useState<any>(null);
  const [isShowDetail, setIsShowDetail] = useState(false);
  const [doctorIds, setDoctorIds] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        const res = await getSpecialtyByIds([id]);
        if (res && res.errCode === 0 && Array.isArray(res.data)) {
          const found = res.data && res.data[0];
          if (found) {
            setSpecialty({
              ...found,
              imageUrl: getBase64FromBuffer(found.image) || "",
            });
          }
        }
        const doctorRes = await HandleGetDoctorSpecialtyById(id);
        if (
          doctorRes &&
          doctorRes.errCode === 0 &&
          Array.isArray(doctorRes.data)
        ) {
          const ids = doctorRes.data
            .map((item: any) => item && (item.id || item.doctorId))
            .filter((value: any) => value);
          setDoctorIds(ids);
        } else {
          setDoctorIds([]);
        }
      }
    };
    fetchData();
  }, [id]);

  const handleShowHideDetail = useCallback(() => {
    setIsShowDetail((prev) => !prev);
  }, []);

  let backgroundImage = specialty ? `url(${specialty.imageUrl})` : "";

  const breadcrumbItems = [
    {
      label: language === LANGUAGES.VI ? "Trang chủ" : "Home",
      to: "/home",
    },
    {
      label: language === LANGUAGES.VI ? "Chuyên khoa" : "Specialty",
      to: "/specialty",
    },
    {
      label:
        specialty && specialty.name
          ? specialty.name
          : language === LANGUAGES.VI
            ? "Chi tiết chuyên khoa"
            : "Specialty Detail",
    },
  ];

  return (
    <>
      <HomeHeader />
      <div className="booking-container">
        <div className="detail-specialty-container">
          <div className="description-specialty">
            <Breadcrumb
              items={breadcrumbItems}
              containerClassName="booking-container"
            />
            {specialty && (
              <div className="description-content-up">
                <div
                  className="description-bg"
                  style={{ backgroundImage: backgroundImage }}
                ></div>

                <div className="description-content-text">
                  <div
                    className="specialty-desc-html"
                    style={
                      isShowDetail
                        ? {}
                        : { maxHeight: "150px", overflow: "hidden" }
                    }
                    dangerouslySetInnerHTML={{
                      __html:
                        specialty.descriptionHTML || "<i>Chưa có mô tả</i>",
                    }}
                  />

                  <div className="view-more-container">
                    <span
                      onClick={handleShowHideDetail}
                      className="view-more-btn"
                    >
                      {isShowDetail
                        ? intl.formatMessage({
                            id: "specialty.detail-specialty.hide-detail",
                          })
                        : intl.formatMessage({
                            id: "specialty.detail-specialty.see-more",
                          })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DoctorCard
            specialtyId={specialty ? specialty.id : null}
            doctorIds={doctorIds}
          />
        </div>
      </div>
      <HomeFooter />
    </>
  );
};

export default DetailSpecialty;