import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useClinicContext } from "./useClinicContext";
import "./ClinicManagerShared.scss";
import {
  useApproveClinicManagerPackageMutation,
  useGetClinicManagerPackagesQuery,
  useUpdateClinicManagerPackageStatusMutation,
} from "../../../store/api/publicApi";
import { DataState } from "components/System/SystemShared";

const getStatusKey = (pkg: any) =>
  pkg.statusId || pkg.status_id || pkg.statusData?.keyMap || "";

const formatPrice = (price?: number) =>
  price ? `${price.toLocaleString("vi-VN")} VNĐ` : "—";

const getStatusLabel = (pkg: any) => {
  const statusKey = getStatusKey(pkg);
  if (statusKey === "SD2") return "Hoạt động";
  if (statusKey === "SD3") return "Ngừng hoạt động";
  return "Chờ duyệt";
};

const getStatusClass = (statusKey: string) => {
  if (statusKey === "SD2") return "active";
  if (statusKey === "SD3") return "inactive";
  return "pending";
};

const ClinicManagerPackages: React.FC = () => {
  const { isClinicManager, selectedClinicId } = useClinicContext();
  const {
    data: packagesResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchPackages,
  } = useGetClinicManagerPackagesQuery(selectedClinicId, {
    skip: !selectedClinicId,
  });
  const [approvePackage] = useApproveClinicManagerPackageMutation();
  const [updatePackageStatus] = useUpdateClinicManagerPackageStatusMutation();
  const [search, setSearch] = useState("");

  const packages = useMemo(
    () =>
      packagesResponse?.errCode === 0 && Array.isArray(packagesResponse.data)
        ? packagesResponse.data
        : [],
    [packagesResponse],
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return packages;
    const kw = search.trim().toLowerCase();
    return packages.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(kw) ||
        (p.typeData?.valueVi || "").toLowerCase().includes(kw),
    );
  }, [packages, search]);

  const handleApprove = async (pkgId: number) => {
    try {
      await approvePackage(pkgId).unwrap();
      toast.success("Duyệt gói khám thành công!");
    } catch (err: any) {
      toast.error(
        err?.data?.errMessage || err?.data?.message || "Duyệt thất bại.",
      );
    }
  };

  const handleChangeStatus = async (
    pkgId: number,
    statusId: "SD2" | "SD3",
  ) => {
    try {
      await updatePackageStatus({ packageId: pkgId, statusId }).unwrap();
      toast.success(
        statusId === "SD3"
          ? "Đã ngừng hoạt động gói khám."
          : "Đã kích hoạt lại gói khám.",
      );
    } catch (err: any) {
      toast.error(
        err?.data?.errMessage ||
          err?.data?.message ||
          "Cập nhật trạng thái thất bại.",
      );
    }
  };

  if (!isClinicManager || !selectedClinicId) {
    return (
      <div className="cm-page">
        <div className="cm-empty">
          <i className="fas fa-lock" />
          Bạn không có quyền truy cập trang này.
        </div>
      </div>
    );
  }

  return (
    <div className="cm-page">
      <div className="cm-toolbar">
        <div className="cm-search">
          <i className="fas fa-search" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên gói khám..."
          />
        </div>
        <button
          className="cm-refresh-btn"
          onClick={() => refetchPackages()}
          disabled={isFetching}
        >
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>

      <div className="cm-table">
        <div
          className="cm-table-header"
          style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr" }}
        >
          <span>Tên gói</span>
          <span>Loại</span>
          <span>Giá</span>
          <span>Trạng thái</span>
          <span>Hành động</span>
        </div>

        {isLoading || isFetching ? (
          <DataState variant="loading" text="Đang tải danh sách gói khám..." />
        ) : isError ? (
          <DataState
            variant="error"
            text="Không thể tải danh sách gói khám."
            onRetry={() => void refetchPackages()}
          />
        ) : filtered.length === 0 ? (
          <DataState
            variant="empty"
            text={
              packages.length > 0
                ? "Không có gói khám phù hợp với từ khóa."
                : "Chưa có gói khám nào."
            }
          />
        ) : (
          filtered.map((pkg) => {
            const statusKey = getStatusKey(pkg);
            const isPending = statusKey === "SD1" || !statusKey;

            return (
              <div
                className="cm-table-row"
                key={pkg.id || pkg.name}
                style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr" }}
              >
                <div className="cm-name-cell">
                  <div className="cm-avatar">PK</div>
                  <div className="cm-name-info">
                    <strong>{pkg.name || "N/A"}</strong>
                    <small>{pkg.note || ""}</small>
                  </div>
                </div>
                <span>{pkg.typeData?.valueVi || pkg.typeCode || "—"}</span>
                <span>{formatPrice(pkg.price)}</span>
                <span
                  className={`cm-status ${getStatusClass(statusKey)}`}
                >
                  <span className="status-dot" />
                  {getStatusLabel(pkg)}
                </span>
                <div className="cm-actions-cell">
                  {isPending && (
                    <button
                      className="cm-action-btn approve"
                      onClick={() => handleApprove(pkg.id)}
                    >
                      Duyệt
                    </button>
                  )}
                  {statusKey === "SD2" && (
                    <button
                      className="cm-action-btn reject"
                      onClick={() => handleChangeStatus(pkg.id, "SD3")}
                    >
                      Ngừng hoạt động
                    </button>
                  )}
                  {statusKey === "SD3" && (
                    <button
                      className="cm-action-btn approve"
                      onClick={() => handleChangeStatus(pkg.id, "SD2")}
                    >
                      Kích hoạt lại
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClinicManagerPackages;
