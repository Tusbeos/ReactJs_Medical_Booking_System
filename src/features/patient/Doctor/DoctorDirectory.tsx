import React, { useCallback, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import HomeFooter from "layout/HomeFooter";
import HomeHeader from "layout/HomeHeader";
import Breadcrumb from "components/Breadcrumb";
import { DataState } from "components/System/SystemShared";
import {
  PublicDoctorCard,
  PublicDoctorDirectoryArgs,
  useGetClinicsQuery,
  useGetPublicDoctorsQuery,
  useGetSpecialtiesQuery,
} from "store/api/publicApi";
import "./DoctorDirectory.scss";

const DIRECTORY_PAGE_SIZE = 12;

const toPositiveNumber = (value: string | null) => {
  const numberValue = Number(value);
  return Number.isInteger(numberValue) && numberValue > 0
    ? numberValue
    : undefined;
};

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(date);
};

const getDoctorName = (doctor: PublicDoctorCard) =>
  [doctor.positionName, doctor.lastName, doctor.firstName]
    .filter(Boolean)
    .join(" ") || "Bác sĩ MediBook";

const DoctorCard: React.FC<{ doctor: PublicDoctorCard }> = ({ doctor }) => {
  const navigate = useNavigate();
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  const avatar = doctor.avatarUrl ? `${backendUrl}${doctor.avatarUrl}` : "";
  const specialties = doctor.specialties || [];

  return (
    <article className="doctor-directory-card">
      <Link
        to={`/detail-doctor/${doctor.id}`}
        className="doctor-directory-card__profile"
      >
        <span className="doctor-directory-card__avatar" aria-hidden="true">
          <i className="fas fa-user-md" />
          {avatar && (
            <img
              src={avatar}
              alt=""
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          )}
        </span>
        <span className="doctor-directory-card__identity">
          <span className="doctor-directory-card__name">
            {getDoctorName(doctor)}
          </span>
          <span className="doctor-directory-card__clinic">
            {doctor.clinicName || "Đang cập nhật cơ sở khám"}
          </span>
        </span>
      </Link>

      <div className="doctor-directory-card__body">
        <div className="doctor-directory-card__specialties">
          {specialties.length > 0 ? (
            specialties.map((specialty) => <span key={specialty}>{specialty}</span>)
          ) : (
            <span>Chuyên khoa đang cập nhật</span>
          )}
        </div>

        {doctor.location && (
          <p>
            <i className="fas fa-map-marker-alt" aria-hidden="true" /> {doctor.location}
          </p>
        )}
        <p>
          <i className="far fa-credit-card" aria-hidden="true" /> {doctor.priceLabel || "Liên hệ cơ sở khám"}
        </p>

        <div className="doctor-directory-card__availability">
          <i className="far fa-calendar-check" aria-hidden="true" />
          {doctor.nextAvailableDate ? (
            <span>
              Gần nhất: <strong>{formatDate(doctor.nextAvailableDate)}{doctor.nextAvailableTime ? ` · ${doctor.nextAvailableTime}` : ""}</strong>
            </span>
          ) : (
            <span>Lịch khám đang được cập nhật</span>
          )}
        </div>
      </div>

      <div className="doctor-directory-card__actions">
        <Link to={`/detail-doctor/${doctor.id}`}>Xem hồ sơ</Link>
        <button type="button" onClick={() => navigate(`/booking-doctor/${doctor.id}`)}>
          Đặt lịch <i className="fas fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </article>
  );
};

const DoctorDirectory: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(Number(searchParams.get("page") || "1"), 1) - 1;
  const queryArgs = useMemo<PublicDoctorDirectoryArgs>(() => ({
    page,
    size: DIRECTORY_PAGE_SIZE,
    keyword: searchParams.get("q") || undefined,
    specialtyId: toPositiveNumber(searchParams.get("specialty")),
    clinicId: toPositiveNumber(searchParams.get("clinic")),
    location: searchParams.get("location") || undefined,
    date: searchParams.get("date") || undefined,
    availableOnly: searchParams.get("available") === "1",
    sort: (searchParams.get("sort") as PublicDoctorDirectoryArgs["sort"]) || "relevance",
  }), [page, searchParams]);
  const directoryQuery = useGetPublicDoctorsQuery(queryArgs);
  const specialtiesQuery = useGetSpecialtiesQuery(100);
  const clinicsQuery = useGetClinicsQuery(100);
  const directory = directoryQuery.data?.data;
  const doctors = directory?.doctors || [];

  const updateFilters = useCallback((changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    if (!Object.prototype.hasOwnProperty.call(changes, "page")) next.delete("page");
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const hasFilters = Array.from(searchParams.keys()).some((key) => key !== "page");
  const specialtyOptions = Array.isArray(specialtiesQuery.data?.data)
    ? specialtiesQuery.data.data
    : [];
  const clinicOptions = Array.isArray(clinicsQuery.data?.data)
    ? clinicsQuery.data.data
    : [];

  return (
    <div className="doctor-directory-page">
      <HomeHeader isShowBanner={false} />
      <Breadcrumb
        containerClassName="doctor-directory-container"
        items={[{ label: "Trang chủ", to: "/home" }, { label: "Tìm bác sĩ" }]}
      />
      <main className="doctor-directory-container">
        <section className="doctor-directory-hero">
          <div>
            <span>Tìm đúng bác sĩ, đặt đúng lịch</span>
            <h1>Danh sách bác sĩ</h1>
            <p>Tra cứu bác sĩ theo chuyên khoa, cơ sở khám, khu vực và lịch khám phù hợp với bạn.</p>
          </div>
          <i className="fas fa-stethoscope" aria-hidden="true" />
        </section>

        <section className="doctor-directory-layout" aria-label="Danh sách và bộ lọc bác sĩ">
          <aside className="doctor-directory-filters">
            <div className="doctor-directory-filters__heading">
              <h2><i className="fas fa-sliders-h" aria-hidden="true" /> Bộ lọc</h2>
              {hasFilters && <button type="button" onClick={() => setSearchParams({})}>Xóa lọc</button>}
            </div>
            <label>
              Từ khóa
              <span className="doctor-directory-input-icon">
                <i className="fas fa-search" />
                <input value={searchParams.get("q") || ""} onChange={(event) => updateFilters({ q: event.target.value || undefined })} placeholder="Tên bác sĩ, chuyên khoa..." />
              </span>
            </label>
            <label>
              Chuyên khoa
              <select value={searchParams.get("specialty") || ""} onChange={(event) => updateFilters({ specialty: event.target.value || undefined })}>
                <option value="">Tất cả chuyên khoa</option>
                {specialtyOptions.map((specialty: any) => <option key={specialty.id} value={specialty.id}>{specialty.name}</option>)}
              </select>
            </label>
            <label>
              Cơ sở khám
              <select value={searchParams.get("clinic") || ""} onChange={(event) => updateFilters({ clinic: event.target.value || undefined })}>
                <option value="">Tất cả cơ sở</option>
                {clinicOptions.map((clinic: any) => <option key={clinic.id} value={clinic.id}>{clinic.name}</option>)}
              </select>
            </label>
            <label>
              Khu vực
              <input value={searchParams.get("location") || ""} onChange={(event) => updateFilters({ location: event.target.value || undefined })} placeholder="Ví dụ: Hà Nội" />
            </label>
            <label>
              Ngày muốn khám
              <input type="date" min={new Date().toISOString().slice(0, 10)} value={searchParams.get("date") || ""} onChange={(event) => updateFilters({ date: event.target.value || undefined })} />
            </label>
            <label className="doctor-directory-checkbox">
              <input type="checkbox" checked={searchParams.get("available") === "1"} onChange={(event) => updateFilters({ available: event.target.checked ? "1" : undefined })} />
              <span>Chỉ hiển thị bác sĩ còn lịch</span>
            </label>
          </aside>

          <section className="doctor-directory-results">
            <div className="doctor-directory-results__heading">
              <div>
                <span>Kết quả tìm kiếm</span>
                <h2>{directory ? `${directory.totalElements} bác sĩ phù hợp` : "Danh sách bác sĩ"}</h2>
              </div>
              <label>
                <span>Sắp xếp</span>
                <select value={searchParams.get("sort") || "relevance"} onChange={(event) => updateFilters({ sort: event.target.value === "relevance" ? undefined : event.target.value })}>
                  <option value="relevance">Phù hợp nhất</option>
                  <option value="name-asc">Tên A–Z</option>
                  <option value="name-desc">Tên Z–A</option>
                </select>
              </label>
            </div>

            {directoryQuery.isLoading ? (
              <DataState variant="loading" text="Đang tải danh sách bác sĩ..." />
            ) : directoryQuery.isError && doctors.length === 0 ? (
              <DataState variant="error" text="Không thể tải danh sách bác sĩ." onRetry={directoryQuery.refetch} />
            ) : doctors.length === 0 ? (
              <DataState variant="empty" text="Chưa tìm thấy bác sĩ phù hợp với bộ lọc hiện tại." />
            ) : (
              <>
                {directoryQuery.isFetching && <p className="doctor-directory-updating" aria-live="polite"><i className="fas fa-sync-alt fa-spin" /> Đang cập nhật kết quả...</p>}
                <div className="doctor-directory-grid">
                  {doctors.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)}
                </div>
              </>
            )}

            {!!directory && directory.totalPages > 1 && (
              <nav className="doctor-directory-pagination" aria-label="Phân trang danh sách bác sĩ">
                <button type="button" disabled={directory.page <= 0} onClick={() => updateFilters({ page: String(directory.page) })}><i className="fas fa-chevron-left" /> Trước</button>
                <span>Trang {directory.page + 1} / {directory.totalPages}</span>
                <button type="button" disabled={directory.page >= directory.totalPages - 1} onClick={() => updateFilters({ page: String(directory.page + 2) })}>Sau <i className="fas fa-chevron-right" /></button>
              </nav>
            )}
          </section>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
};

export default DoctorDirectory;
