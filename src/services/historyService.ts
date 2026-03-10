import axios from "../axiosClient";

/**
 * Bác sĩ tạo / cập nhật hồ sơ khám bệnh sau khi kết thúc khám (S3).
 * POST /api/histories
 */
const createHistory = (data: {
  bookingId: number;
  diagnosis: string;
  prescription: string;
  notes: string;
  examinationDate?: string; // định dạng YYYY-MM-DD
}): Promise<any> => {
  return axios.post("/api/histories", data);
};

/**
 * Lấy hồ sơ khám của 1 lịch hẹn cụ thể (dùng để pre-fill form kê đơn).
 * GET /api/histories/booking/{bookingId}
 */
const getHistoryByBooking = (bookingId: number | string): Promise<any> => {
  return axios.get(`/api/histories/booking/${bookingId}`);
};

export { createHistory, getHistoryByBooking };
