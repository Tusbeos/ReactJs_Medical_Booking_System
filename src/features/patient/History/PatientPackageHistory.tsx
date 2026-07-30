import { useState } from "react";
import { DataState } from "components/System/SystemShared";
import {
  PackageBookingStatus,
  useGetMyPackageBookingsQuery,
  useGetPackageBookingStatusHistoryQuery,
} from "store/api/publicApi";

const PACKAGE_STATUS: Record<
  PackageBookingStatus,
  { label: string; tone: string; description: string }
> = {
  PENDING_EMAIL: {
    label: "Chờ xác nhận email",
    tone: "neutral",
    description: "Vui lòng mở email và xác nhận yêu cầu đặt gói.",
  },
  PENDING_CLINIC: {
    label: "Chờ phòng khám xác nhận",
    tone: "warning",
    description: "Phòng khám đang tiếp nhận yêu cầu của bạn.",
  },
  CONFIRMED: {
    label: "Phòng khám đã xác nhận",
    tone: "info",
    description: "Yêu cầu đã được phòng khám xác nhận.",
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    tone: "success",
    description: "Bạn đã hoàn thành gói khám.",
  },
  CANCELLED: {
    label: "Đã hủy / từ chối",
    tone: "danger",
    description: "Yêu cầu không còn hiệu lực.",
  },
  EXPIRED: {
    label: "Đã hết hạn",
    tone: "neutral",
    description: "Yêu cầu hết hạn do chưa xác nhận email.",
  },
};

const STATUS_OPTIONS: Array<{
  value: "" | PackageBookingStatus;
  label: string;
}> = [
  { value: "", label: "Tất cả trạng thái" },
  ...Object.entries(PACKAGE_STATUS).map(([value, meta]) => ({
    value: value as PackageBookingStatus,
    label: meta.label,
  })),
];

const formatDate = (value?: string) => {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString("vi-VN");
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
};

const PatientPackageStatusHistory = ({ bookingId }: { bookingId: number }) => {
  const { data, isLoading, isError, refetch } =
    useGetPackageBookingStatusHistoryQuery(bookingId);

  if (isLoading) return <p className="package-timeline-state">Đang tải tiến trình...</p>;
  if (isError) {
    return (
      <button
        type="button"
        className="package-timeline-retry"
        onClick={() => void refetch()}
      >
        Tải lại tiến trình
      </button>
    );
  }

  const histories = data?.data || [];
  if (histories.length === 0) {
    return <p className="package-timeline-state">Chưa có tiến trình xử lý.</p>;
  }

  return (
    <ol className="package-booking-timeline">
      {histories.map((history) => {
        const meta = PACKAGE_STATUS[history.toStatus];
        return (
          <li key={history.id}>
            <span className={`timeline-dot ${meta.tone}`} />
            <div>
              <strong>{meta.label}</strong>
              <small>{formatDateTime(history.createdAt)}</small>
              {history.note && <p>{history.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
};

const PatientPackageHistory = () => {
  const [status, setStatus] = useState<"" | PackageBookingStatus>("");
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetMyPackageBookingsQuery(
    { page, size: 10, ...(status ? { status } : {}) },
    {
      pollingInterval: 30_000,
      skipPollingIfUnfocused: true,
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
    },
  );
  const bookings = response?.errCode === 0 ? response.data || [] : [];

  return (
    <div className="patient-package-history">
      <div className="history-filters">
        <label htmlFor="package-history-status">Trạng thái gói khám</label>
        <select
          id="package-history-status"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as "" | PackageBookingStatus);
            setPage(0);
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {isFetching && !isLoading && (
          <span className="filter-loading">
            <i className="fas fa-spinner fa-spin" /> Đang cập nhật
          </span>
        )}
      </div>

      <div className="history-body">
        {isLoading ? (
          <DataState variant="loading" text="Đang tải lịch sử gói khám..." />
        ) : isError || (response != null && response.errCode !== 0) ? (
          <DataState
            variant="error"
            text="Không thể tải lịch sử gói khám."
            onRetry={() => void refetch()}
          />
        ) : bookings.length === 0 ? (
          <DataState variant="empty" text="Bạn chưa có yêu cầu đặt gói phù hợp." />
        ) : (
          <div className="package-history-list">
            {bookings.map((booking) => {
              const meta = PACKAGE_STATUS[booking.status];
              const expanded = expandedId === booking.id;
              return (
                <article
                  className={`package-history-item ${expanded ? "expanded" : ""}`}
                  key={booking.id}
                >
                  <button
                    type="button"
                    className="package-history-summary"
                    onClick={() => setExpandedId(expanded ? null : booking.id)}
                    aria-expanded={expanded}
                  >
                    <span className="package-icon">
                      <i className="fas fa-briefcase-medical" />
                    </span>
                    <span className="package-main">
                      <strong>{booking.packageName}</strong>
                      <small>{booking.clinicName}</small>
                    </span>
                    <span className="package-date">
                      <strong>{formatDate(booking.desiredDate)}</strong>
                      <small>{booking.desiredTime || "Chưa chọn giờ"}</small>
                    </span>
                    <span className={`package-status ${meta.tone}`}>
                      {meta.label}
                    </span>
                    <i className={`fas fa-chevron-${expanded ? "up" : "down"}`} />
                  </button>

                  {expanded && (
                    <div className="package-history-detail">
                      <p className={`package-status-message ${meta.tone}`}>
                        {meta.description}
                      </p>
                      <dl>
                        <div><dt>Mã yêu cầu</dt><dd>#{booking.id}</dd></div>
                        <div><dt>Người khám</dt><dd>{booking.patientName}</dd></div>
                        <div><dt>Ngày mong muốn</dt><dd>{formatDate(booking.desiredDate)}</dd></div>
                        <div><dt>Khung giờ</dt><dd>{booking.desiredTime || "—"}</dd></div>
                        <div><dt>Lý do</dt><dd>{booking.reason || "—"}</dd></div>
                        <div><dt>Ghi chú phòng khám</dt><dd>{booking.clinicNote || "—"}</dd></div>
                      </dl>
                      <h3>Tiến trình xử lý</h3>
                      <PatientPackageStatusHistory bookingId={booking.id} />
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {(response?.pagination?.totalPages || 0) > 1 && (
        <div className="history-pagination">
          <button
            type="button"
            disabled={response?.pagination?.first || isFetching}
            onClick={() => setPage((current) => Math.max(0, current - 1))}
          >
            Trang trước
          </button>
          <span>
            Trang {page + 1}/{response?.pagination?.totalPages || 1}
          </span>
          <button
            type="button"
            disabled={response?.pagination?.last || isFetching}
            onClick={() => setPage((current) => current + 1)}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
};

export default PatientPackageHistory;
