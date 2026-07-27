import { publicApi } from "./publicApi";
import type { ApiResponse } from "./articleApi";

export const passwordResetApi = publicApi.injectEndpoints({
  endpoints: (builder) => ({
    forgotPassword: builder.mutation<ApiResponse<void>, { email: string }>({
      query: (body) => ({
        url: "/api/auth/forgot-password",
        method: "POST",
        data: body,
      }),
    }),
    resetPassword: builder.mutation<
      ApiResponse<void>,
      { token: string; newPassword: string; confirmPassword: string }
    >({
      query: (body) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        data: body,
      }),
    }),
  }),
});

export const { useForgotPasswordMutation, useResetPasswordMutation } =
  passwordResetApi;
