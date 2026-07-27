import React from "react";
import { StatItem, useGetAdminStatsQuery } from "store/api/adminStatsApi";
import { DataState, Panel, PanelHeading } from "components/System/SystemShared";
import "./AdminStats.scss";

/**
 * Thống kê báo cáo cho Quản trị viên.
 *
 * Số tổng dùng ô số liệu (stat tile) vì một con số không cần biểu đồ.
 * Ba phần phân rã dùng biểu đồ thanh ngang một chuỗi: tên hạng mục nằm ở trục,
 * giá trị ghi trực tiếp cuối thanh nên không cần chú giải và không phụ thuộc màu.
 */

type TileProps = {
  label: string;
  value: number;
  icon: string;
  hint?: string;
};

const formatNumber = (value: number) => value.toLocaleString("vi-VN");

const StatTile: React.FC<TileProps> = ({ label, value, icon, hint }) => (
  <div className="stat-tile">
    <div className="stat-tile-icon" aria-hidden="true">
      <i className={icon} />
    </div>
    <div className="stat-tile-body">
      <span className="stat-tile-label">{label}</span>
      <strong className="stat-tile-value">{formatNumber(value)}</strong>
      {hint && <span className="stat-tile-hint">{hint}</span>}
    </div>
  </div>
);

type BreakdownProps = {
  title: string;
  icon: string;
  items: StatItem[];
  /** Một chuỗi dữ liệu nên toàn bộ thanh dùng chung một màu. */
  tone: "blue" | "orange" | "aqua";
};

const Breakdown: React.FC<BreakdownProps> = ({ title, icon, items, tone }) => {
  const rows = items ?? [];
  const total = rows.reduce((sum, item) => sum + item.count, 0);
  const max = Math.max(...rows.map((item) => item.count), 1);

  return (
    <section className={`breakdown breakdown--${tone}`}>
      <h3 className="breakdown-title">
        <i className={icon} aria-hidden="true" /> {title}
      </h3>

      {total === 0 ? (
        <p className="breakdown-empty">Chưa có dữ liệu.</p>
      ) : (
        <ul className="breakdown-list">
          {rows.map((item) => {
            const percent = total === 0 ? 0 : Math.round((item.count / total) * 100);
            return (
              <li key={item.code} className="breakdown-row">
                <span className="breakdown-label" title={`${item.label} (${item.code})`}>
                  {item.label}
                </span>
                <span className="breakdown-track">
                  <span
                    className="breakdown-bar"
                    style={{ width: `${(item.count / max) * 100}%` }}
                    title={`${item.label}: ${formatNumber(item.count)} (${percent}%)`}
                  />
                </span>
                <span className="breakdown-value">
                  {formatNumber(item.count)}
                  <em>{percent}%</em>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

const AdminStats: React.FC = () => {
  const { data, isLoading, isError, isFetching, refetch } = useGetAdminStatsQuery();
  const stats = data?.data;

  if (isLoading || isError || !stats) {
    return (
      <div className="admin-stats-page">
        <Panel>
          <PanelHeading title="Thống kê báo cáo" icon="fas fa-chart-column" />
          <DataState
            variant={isError ? "error" : "loading"}
            text={
              isError
                ? "Không thể tải số liệu thống kê."
                : "Đang tải số liệu thống kê..."
            }
            onRetry={isError ? refetch : undefined}
          />
        </Panel>
      </div>
    );
  }

  return (
    <div className="admin-stats-page">
      <Panel>
        <PanelHeading title="Thống kê báo cáo" icon="fas fa-chart-column">
          <button
            type="button"
            className="stats-refresh"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <i className="fas fa-rotate" aria-hidden="true" />
            {isFetching ? " Đang cập nhật..." : " Làm mới"}
          </button>
        </PanelHeading>

        <div className="stat-tiles">
          <StatTile
            label="Tài khoản"
            value={stats.userTotal}
            icon="fas fa-users"
          />
          <StatTile
            label="Cơ sở y tế"
            value={stats.clinicCount}
            icon="far fa-building"
          />
          <StatTile
            label="Chuyên khoa"
            value={stats.specialtyCount}
            icon="fas fa-shapes"
          />
          <StatTile
            label="Gói khám"
            value={stats.packageCount}
            icon="fas fa-briefcase-medical"
          />
          <StatTile
            label="Lượt đặt lịch bác sĩ"
            value={stats.bookingTotal}
            icon="far fa-calendar-check"
          />
          <StatTile
            label="Lượt đặt gói khám"
            value={stats.packageBookingTotal}
            icon="fas fa-clipboard-list"
          />
          <StatTile
            label="Bài viết"
            value={stats.articleTotal}
            icon="far fa-newspaper"
          />
          <StatTile
            label="Đánh giá bác sĩ"
            value={stats.reviewCount}
            icon="far fa-star"
          />
        </div>

        <div className="doctor-approval">
          <div className="approval-item approval-item--approved">
            <i className="fas fa-circle-check" aria-hidden="true" />
            <span>Hồ sơ bác sĩ đã duyệt</span>
            <strong>{formatNumber(stats.doctorApproved)}</strong>
          </div>
          <div className="approval-item approval-item--pending">
            <i className="fas fa-clock" aria-hidden="true" />
            <span>Hồ sơ bác sĩ chờ duyệt</span>
            <strong>{formatNumber(stats.doctorPending)}</strong>
          </div>
        </div>

        <div className="breakdown-grid">
          <Breakdown
            title="Tài khoản theo vai trò"
            icon="fas fa-user-shield"
            items={stats.usersByRole}
            tone="blue"
          />
          <Breakdown
            title="Lượt đặt lịch theo trạng thái"
            icon="fas fa-list-check"
            items={stats.bookingsByStatus}
            tone="orange"
          />
          <Breakdown
            title="Bài viết theo trạng thái"
            icon="fas fa-file-lines"
            items={stats.articlesByStatus}
            tone="aqua"
          />
        </div>
      </Panel>
    </div>
  );
};

export default AdminStats;
