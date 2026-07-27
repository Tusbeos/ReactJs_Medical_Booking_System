import { publicApi } from "./publicApi";
import type { ApiResponse } from "./articleApi";

export const AUDIT_EVENT_LABELS: Record<string, string> = {
  LOGIN: "Đăng nhập",
  REFRESH_TOKEN: "Làm mới phiên",
  LOGOUT: "Đăng xuất",
  LOGOUT_ALL: "Đăng xuất toàn bộ thiết bị",
  PASSWORD_CHANGED: "Đổi mật khẩu",
  ROLE_CHANGED: "Thay đổi vai trò",
  ACCOUNT_STATUS_CHANGED: "Thay đổi trạng thái tài khoản",
};

export type AuditLogItem = {
  id: number;
  eventType: string;
  eventTypeLabel?: string | null;
  outcome: "SUCCESS" | "FAILURE";
  userId?: number | null;
  email?: string | null;
  actorEmail?: string | null;
  ipAddress?: string | null;
  device?: string | null;
  userAgent?: string | null;
  failureReason?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  createdAt?: string | null;
};

export type AuditLogArgs = {
  eventType?: string;
  outcome?: string;
  email?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
};

/** Chỉ gửi các tham số thực sự có giá trị để mỗi bộ lọc tạo một cache key rõ ràng. */
const auditParams = (args: AuditLogArgs) => {
  const params: Record<string, string | number> = {
    page: args.page ?? 0,
    size: args.size ?? 20,
  };
  if (args.eventType) params.eventType = args.eventType;
  if (args.outcome) params.outcome = args.outcome;
  if (args.email?.trim()) params.email = args.email.trim();
  if (args.from) params.from = args.from;
  if (args.to) params.to = args.to;
  return params;
};

export const auditLogApi = publicApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<ApiResponse<AuditLogItem[]>, AuditLogArgs>({
      query: (args) => ({
        url: "/api/admin/audit-logs",
        params: auditParams(args),
      }),
      // Nhật ký chỉ đọc và luôn tăng dần, nên không dùng cache dài.
      keepUnusedDataFor: 10,
    }),
  }),
});

export const { useGetAuditLogsQuery } = auditLogApi;
