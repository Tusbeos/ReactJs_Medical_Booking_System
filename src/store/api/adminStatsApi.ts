import { publicApi } from "./publicApi";
import type { ApiResponse } from "./articleApi";

export type StatItem = {
  code: string;
  label: string;
  count: number;
};

export type AdminStats = {
  userTotal: number;
  usersByRole: StatItem[];
  clinicCount: number;
  specialtyCount: number;
  packageCount: number;
  doctorApproved: number;
  doctorPending: number;
  bookingTotal: number;
  bookingsByStatus: StatItem[];
  packageBookingTotal: number;
  articleTotal: number;
  articlesByStatus: StatItem[];
  reviewCount: number;
};

export const adminStatsApi = publicApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminStats: builder.query<ApiResponse<AdminStats>, void>({
      query: () => ({ url: "/api/admin/stats" }),
      // Số liệu tổng hợp thay đổi liên tục nên không giữ cache lâu.
      keepUnusedDataFor: 15,
    }),
  }),
});

export const { useGetAdminStatsQuery } = adminStatsApi;
