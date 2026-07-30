import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { DataState } from "components/System/SystemShared";
import {
  PackageBookingRecord,
  PackageBookingStatus,
  useGetClinicPackageBookingsQuery,
  useGetPackageBookingStatusHistoryQuery,
  useUpdatePackageBookingStatusMutation,
} from "store/api/publicApi";
import { useClinicContext } from "./useClinicContext";
import "./ClinicManagerPackageBookings.scss";

const STATUS_OPTIONS: Array<{
  value: "" | PackageBookingStatus;
  label: string;
}> = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "PENDING_EMAIL", label: "Chờ xác nhận email" },
  { value: "PENDING_CLINIC", label: "Chờ phòng khám xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "COMPLETED", label: "Đã hoàn thành" },
  { value: "CANCELLED", label: "Đã hủy / từ chối" },
  { value: "EXPIRED", label: "Đã hết hạn" },
];

const STATUS_META: Record<
  PackageBookingStatus,
  { label: string; tone: string }
> = {
  PENDING_EMAIL: { label: "Chờ xác nhận email", tone: "neutral" },
  PENDING_CLINIC: { label: "Chờ phòng khám xác nhận", tone: "warning" },
  CONFIRMED: { label: "Đã xác nhận", tone: "info" },
  COMPLETED: { label: "Đã hoàn thành", tone: "success" },
  CANCELLED: { label: "Đã hủy / từ chối", tone: "danger" },
  EXPIRED: { label: "Đã hết hạn", tone: "neutral" },
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
};

const formatDateTime = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
};

const PackageBookingHistory = ({ bookingId }: { bookingId: number }) => {
  const { data, isLoading, isError, refetch } =
    useGetPackageBookingStatusHistoryQuery(bookingId);
  const histories = data?.data || [];

  if (isLoading) {
    return <p className="cm-package-history-state">Đang tải nhật ký...</p>;
  }
  if (isError) {
    return (
      <button
        className="cm-package-history-retry"
        type="button"
        onClick={() => void refetch()}
      >
        Tải lại nhật ký
      </button>
    );
  }
  if (histories.length === 0) {
    return <p className="cm-package-history-state">Chưa có nhật ký trạng thái.</p>;
  }

  return (
    <ol className="cm-package-history">
      {histories.map((history) => (
        <li key={history.id}>
          <span className={`history-dot ${STATUS_META[history.toStatus].tone}`} />
          <div>
            <strong>{STATUS_META[history.toStatus].label}</strong>
            <small>
              {formatDateTime(history.createdAt)}
              {history.actorName ? ` · ${history.actorName}` : ""}
            </small>
            {history.note && <p>{history.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
};

const ClinicManagerPackageBookings = () => {
  const { isClinicManager, selectedClinicId } = useClinicContext();
  const [status, setStatus] = useState<"" | PackageBookingStatus>("");
  const [page, setPage] = useState(0);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const queryArgs = {
    clinicId: selectedClinicId || "",
    page,
    size: 20,
    ...(status ? { status } : {}),
  };
  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetClinicPackageBookingsQuery(queryArgs, {
    skip: !selectedClinicId,
    pollingInterval: 10_000,
    skipPollingIfUnfocused: true,
    refetchOnFocus: true,
  });
  const [updateStatus] = useUpdatePackageBookingStatusMutation();

  const bookings = useMemo(
    () => (response?.errCode === 0 && Array.isArray(response.data) ? response.data : []),
    [response],
  );

  const handleStatusChange = async (
    booking: PackageBookingRecord,
    nextStatus: PackageBookingStatus,
  ) => {
    const actionLabel =
      nextStatus === "CONFIRMED"
        ? "xác nhận"
        : nextStatus === "COMPLETED"
          ? "đánh dấu hoàn thành"
          : "hủy / từ chối";
    if (
      !window.confirm(
        `Bạn chắc chắn muốn ${actionLabel} yêu cầu #${booking.id}?`,
      )
    ) {
      return;
    }

    setUpdatingId(booking.id);
    try {
      await updateStatus({
        bookingId: booking.id,
        status: nextStatus,
        note: notes[booking.id]?.trim() || undefined,
      }).unwrap();
      toast.success(`Đã ${actionLabel} yêu cầu đặt gói.`);
    } catch (error: any) {
      toast.error(
        error?.data?.message ||
          error?.data?.errMessage ||
          "Không thể cập nhật yêu cầu đặt gói.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isClinicManager || !selectedClinicId) {
    return (
      <div className="cm-package-bookings-page">
        <DataState
          variant="error"
          text="Bạn không có quyền quản lý yêu cầu đặt gói của phòng khám."
        />
      </div>
    );
  }

  return (
    <div className="cm-package-bookings-page">
      <header className="cm-package-page-header">
        <div>
          <h2>Yêu cầu đặt gói khám</h2>
          <p>Xác nhận, hoàn tất và theo dõi lịch sử xử lý của phòng khám.</p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
        >
          <i className={`fas fa-sync-alt ${isFetching ? "fa-spin" : ""}`} />
          Làm mới
        </button>
      </header>

      <div className="cm-package-toolbar">
        <label htmlFor="package-booking-status">Trạng thái</label>
        <select
          id="package-booking-status"
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
        {isFetching && !isLoading && <span>Đang đồng bộ dữ liệu...</span>}
      </div>

      {isLoading ? (
        <DataState variant="loading" text="Đang tải yêu cầu đặt gói..." />
      ) : isError ? (
        <DataState
          variant="error"
          text="Không thể tải yêu cầu đặt gói."
          onRetry={() => void refetch()}
        />
      ) : bookings.length === 0 ? (
        <DataState variant="empty" text="Chưa có yêu cầu phù hợp." />
      ) : (
        <div className="cm-package-list">
          {bookings.map((booking) => {
            const meta = STATUS_META[booking.status];
            const expanded = expandedId === booking.id;
            const canConfirm = booking.status === "PENDING_CLINIC";
            const canComplete = booking.status === "CONFIRMED";
            const canCancel =
              booking.status === "PENDING_CLINIC" ||
              booking.status === "CONFIRMED";

            return (
              <article
                className={`cm-package-booking-card ${expanded ? "expanded" : ""}`}
                key={booking.id}
              >
                <button
                  type="button"
                  className="cm-package-summary"
                  onClick={() => setExpandedId(expanded ? null : booking.id)}
                  aria-expanded={expanded}
                >
                  <span className="request-code">#{booking.id}</span>
                  <span>
                    <strong>{booking.patientName}</strong>
                    <small>{booking.packageName}</small>
                  </span>
                  <span>
                    <strong>{formatDate(booking.desiredDate)}</strong>
                    <small>{booking.desiredTime || "Chưa chọn giờ"}</small>
                  </span>
                  <span className={`status-pill ${meta.tone}`}>
                    {meta.label}
                  </span>
                  <i className={`fas fa-chevron-${expanded ? "up" : "down"}`} />
                </button>

                {expanded && (
                  <div className="cm-package-detail">
                    <dl>
                      <div><dt>Người khám</dt><dd>{booking.patientName}</dd></div>
                      <div><dt>Email</dt><dd>{booking.email}</dd></div>
                      <div><dt>Điện thoại</dt><dd>{booking.phoneNumber}</dd></div>
                      <div><dt>Gói khám</dt><dd>{booking.packageName}</dd></div>
                      <div><dt>Ngày mong muốn</dt><dd>{formatDate(booking.desiredDate)}</dd></div>
                      <div><dt>Khung giờ</dt><dd>{booking.desiredTime || "—"}</dd></div>
                      <div><dt>Lý do</dt><dd>{booking.reason || "—"}</dd></div>
                    </dl>

                    <div className="cm-package-workflow">
                      <div>
                        <label htmlFor={`clinic-note-${booking.id}`}>
                          Ghi chú phòng khám
                        </label>
                        <textarea
                          id={`clinic-note-${booking.id}`}
                          maxLength={2000}
                          value={notes[booking.id] ?? booking.clinicNote ?? ""}
                          onChange={(event) =>
                            setNotes((current) => ({
                              ...current,
                              [booking.id]: event.target.value,
                            }))
                          }
                          placeholder="Ví dụ: Phòng khám sẽ liên hệ trước ngày khám..."
                          disabled={!canConfirm && !canComplete && !canCancel}
                        />
                        <div className="cm-package-actions">
                          {canConfirm && (
                            <button
                              type="button"
                              className="confirm"
                              disabled={updatingId === booking.id}
                              onClick={() =>
                                void handleStatusChange(booking, "CONFIRMED")
                              }
                            >
                              Xác nhận yêu cầu
                            </button>
                          )}
                          {canComplete && (
                            <button
                              type="button"
                              className="complete"
                              disabled={updatingId === booking.id}
                              onClick={() =>
                                void handleStatusChange(booking, "COMPLETED")
                              }
                            >
                              Đánh dấu hoàn thành
                            </button>
                          )}
                          {canCancel && (
                            <button
                              type="button"
                              className="cancel"
                              disabled={updatingId === booking.id}
                              onClick={() =>
                                void handleStatusChange(booking, "CANCELLED")
                              }
                            >
                              Hủy / từ chối
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <h3>Nhật ký xử lý</h3>
                        <PackageBookingHistory bookingId={booking.id} />
                      </div>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {(response?.pagination?.totalPages || 0) > 1 && (
        <nav className="cm-package-pagination" aria-label="Phân trang yêu cầu gói">
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
        </nav>
      )}
    </div>
  );
};

export default ClinicManagerPackageBookings;
