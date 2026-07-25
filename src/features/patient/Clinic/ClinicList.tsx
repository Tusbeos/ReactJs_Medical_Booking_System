import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./ClinicList.scss";
import HomeHeader from "layout/HomeHeader";
import HomeFooter from "layout/HomeFooter";
import { getBase64FromBuffer } from "utils/CommonUtils";
import Breadcrumb from "components/Breadcrumb";
import { LANGUAGES } from "utils";
import type { IRootState } from "types";
import { useGetClinicsQuery } from "store/api/publicApi";

const ClinicList: React.FC = () => {
  const navigate = useNavigate();
  const language = useSelector((state: IRootState) => state.app.language);
  const [keyword, setKeyword] = useState("");
  const { data: clinicsResponse, isLoading, isError, refetch } = useGetClinicsQuery();
  const clinics = useMemo(() => {
    const data = Array.isArray(clinicsResponse?.data) ? clinicsResponse.data : [];
    return data.map((item: any) => ({
      id: item.id,
      name: item.name || "Cơ sở y tế MediBook",
      address: item.address || "Đang cập nhật địa chỉ",
      imageUrl: getBase64FromBuffer(item.image) || "",
    }));
  }, [clinicsResponse]);
  const visibleClinics = useMemo(() => {
    const query = keyword.trim().toLocaleLowerCase("vi-VN");
    if (!query) return clinics;
    return clinics.filter((clinic) => `${clinic.name} ${clinic.address}`.toLocaleLowerCase("vi-VN").includes(query));
  }, [clinics, keyword]);
  const openClinic = useCallback((id: number) => navigate(`/clinic/detail-clinic/${id}`), [navigate]);

  return <div className="clinic-list-page">
    <HomeHeader isShowBanner={false} />
    <Breadcrumb containerClassName="booking-container" items={[
      { label: language === LANGUAGES.VI ? "Trang chủ" : "Home", to: "/home" },
      { label: language === LANGUAGES.VI ? "Cơ sở y tế" : "Medical facilities" },
    ]} />
    <main className="booking-container">
      <div className="clinic-list-container">
        <section className="clinic-directory-hero">
          <div><span>Chọn cơ sở phù hợp</span><h1>Cơ sở y tế</h1><p>Tra cứu bệnh viện và phòng khám trước khi đặt lịch khám.</p></div>
          <i className="fas fa-hospital" aria-hidden="true" />
        </section>
        <div className="clinic-directory-toolbar">
          <div><span>Kết quả tra cứu</span><h2>{visibleClinics.length} cơ sở y tế</h2></div>
          <label><i className="fas fa-search" aria-hidden="true" /><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tên hoặc địa chỉ cơ sở" /></label>
        </div>
        {isLoading ? <div className="clinic-list-state"><i className="fas fa-spinner fa-spin" /> Đang tải danh sách cơ sở y tế...</div>
          : isError ? <div className="clinic-list-state"><i className="fas fa-exclamation-circle" /> Không thể tải danh sách. <button type="button" onClick={() => refetch()}>Thử lại</button></div>
            : visibleClinics.length ? <ul className="clinic-list-items">
              {visibleClinics.map((clinic) => <li key={clinic.id} className="clinic-item">
                <button type="button" onClick={() => openClinic(clinic.id)}>
                  <span className="clinic-item__icon">{clinic.imageUrl ? <img src={clinic.imageUrl} alt="" onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <i className="fas fa-hospital" />}</span>
                  <span className="clinic-item__info"><strong>{clinic.name}</strong><span><i className="fas fa-map-marker-alt" /> {clinic.address}</span><em>Xem thông tin cơ sở <i className="fas fa-arrow-right" /></em></span>
                </button>
              </li>)}
            </ul> : <div className="clinic-list-state"><i className="fas fa-hospital-user" /> Chưa tìm thấy cơ sở phù hợp.</div>}
      </div>
    </main>
    <HomeFooter />
  </div>;
};

export default ClinicList;
