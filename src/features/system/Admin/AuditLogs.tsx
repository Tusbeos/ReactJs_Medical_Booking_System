import React, { useMemo, useState } from "react";
import {
  AUDIT_EVENT_LABELS,
  AuditLogItem,
  useGetAuditLogsQuery,
} from "store/api/auditLogApi";
import {
  DataTable,
  Panel,
  PanelHeading,
  SearchBox,
  StatusBadge,
} from "components/System/SystemShared";
import "./AuditLogs.scss";

const PAGE_SIZE = 20;

const EVENT_OPTIONS = Object.entries(AUDIT_EVENT_LABELS);

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const AuditLogs: React.FC = () => {
  const [eventType, setEventType] = useState("");
  const [outcome, setOutcome] = useState("");
  const [email, setEmail] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);

  const query = useGetAuditLogsQuery(
    {
      eventType,
      outcome,
      email,
      from,
      to,
      page,
      size: PAGE_SIZE,
    },
    // Nhật ký có thể được ghi bởi phiên khác, nên luôn đọc lại khi mở màn hình.
    { refetchOnMountOrArgChange: true },
  );

  const rows = useMemo<AuditLogItem[]>(() => query.data?.data ?? [], [query.data]);
  const pagination = query.data?.pagination;
  const totalPages = pagination?.totalPages ?? 0;
  const totalElements = pagination?.totalElements ?? 0;

  /** Mọi thay đổi bộ lọc đều đưa về trang đầu để không hiển thị trang trống. */
  const updateFilter = (apply: () => void) => {
    apply();
    setPage(0);
  };

  const resetFilters = () => {
    setEventType("");
    setOutcome("");
    setEmail("");
    setFrom("");
    setTo("");
    setPage(0);
  };

  const hasFilter = Boolean(eventType || outcome || email || from || to);

  const columns = [
    {
      key: "createdAt",
      title: "Thời gian",
      className: "audit-col-time",
      render: (item: AuditLogItem) => formatDateTime(item.createdAt),
    },
    {
      key: "eventType",
      title: "Hành động",
      render: (item: AuditLogItem) =>
        item.eventTypeLabel || AUDIT_EVENT_LABELS[item.eventType] || item.eventType,
    },
    {
      key: "outcome",
      title: "Kết quả",
      render: (item: AuditLogItem) => (
        <StatusBadge
          label={item.outcome === "SUCCESS" ? "Thành công" : "Thất bại"}
          variant={item.outcome === "SUCCESS" ? "success" : "danger"}
        />
      ),
    },
    {
      key: "email",
      title: "Tài khoản",
      render: (item: AuditLogItem) => item.email || "—",
    },
    {
      key: "actorEmail",
      title: "Người thực hiện",
      render: (item: AuditLogItem) => item.actorEmail || "—",
    },
    {
      key: "ipAddress",
      title: "Địa chỉ IP",
      render: (item: AuditLogItem) => item.ipAddress || "—",
    },
    {
      key: "device",
      title: "Thiết bị",
      render: (item: AuditLogItem) => item.device || "—",
    },
    {
      key: "detail",
      title: "Chi tiết",
      render: (item: AuditLogItem) => {
        if (item.failureReason) {
          return <span className="audit-failure">{item.failureReason}</span>;
        }
        if (item.previousValue || item.newValue) {
          return `${item.previousValue || "—"} → ${item.newValue || "—"}`;
        }
        return "—";
      },
    },
  ];

  return (
    <div className="audit-logs-page">
      <Panel>
        <PanelHeading title="Nhật ký hoạt động" icon="fas fa-clipboard-list">
          <SearchBox
            value={email}
            onChange={(value) => updateFilter(() => setEmail(value))}
            placeholder="Tìm theo email..."
          />
        </PanelHeading>

        <div className="audit-filters">
          <label>
            <span>Hành động</span>
            <select
              value={eventType}
              onChange={(e) => updateFilter(() => setEventType(e.target.value))}
            >
              <option value="">Tất cả</option>
              {EVENT_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span>Kết quả</span>
            <select
              value={outcome}
              onChange={(e) => updateFilter(() => setOutcome(e.target.value))}
            >
              <option value="">Tất cả</option>
              <option value="SUCCESS">Thành công</option>
              <option value="FAILURE">Thất bại</option>
            </select>
          </label>

          <label>
            <span>Từ ngày</span>
            <input
              type="date"
              value={from}
              onChange={(e) => updateFilter(() => setFrom(e.target.value))}
            />
          </label>

          <label>
            <span>Đến ngày</span>
            <input
              type="date"
              value={to}
              onChange={(e) => updateFilter(() => setTo(e.target.value))}
            />
          </label>

          <button
            type="button"
            className="audit-reset-btn"
            onClick={resetFilters}
            disabled={!hasFilter}
          >
            <i className="fas fa-rotate-left" /> Xóa bộ lọc
          </button>
        </div>

        {!query.isLoading && !query.isError && (
          <div className="audit-summary">
            Tìm thấy <strong>{totalElements}</strong> bản ghi
            {query.isFetching && <span className="audit-syncing"> · đang cập nhật…</span>}
          </div>
        )}

        <DataTable<AuditLogItem>
          columns={columns}
          data={rows}
          rowKey={(item) => item.id}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={query.refetch}
          loadingText="Đang tải nhật ký..."
          errorText="Không thể tải nhật ký hoạt động."
          emptyText="Chưa có bản ghi nào khớp bộ lọc."
        />

        {totalPages > 1 && (
          <div className="audit-pagination">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(current - 1, 0))}
              disabled={page === 0 || query.isFetching}
            >
              <i className="fas fa-chevron-left" /> Trước
            </button>
            <span>
              Trang {page + 1} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(current + 1, totalPages - 1))
              }
              disabled={page >= totalPages - 1 || query.isFetching}
            >
              Sau <i className="fas fa-chevron-right" />
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
};

export default AuditLogs;
