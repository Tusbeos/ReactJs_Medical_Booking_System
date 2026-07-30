import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import HomeFooter from "layout/HomeFooter";
import HomeHeader from "layout/HomeHeader";
import { useVerifyBookingMutation } from "store/api/publicApi";
import { getApiErrorMessage } from "utils";
import "./VerifyEmail.scss";

type VerifyStatus = "LOADING" | "SUCCESS" | "EXPIRED" | "FAILED";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token")?.trim() || "";
  const doctorId = Number(searchParams.get("doctorId"));
  const validParams =
    Boolean(token) && Number.isInteger(doctorId) && doctorId > 0;
  const [status, setStatus] = useState<VerifyStatus>(
    validParams ? "LOADING" : "FAILED",
  );
  const [message, setMessage] = useState(
    validParams
      ? ""
      : "Link xác nhận thiếu token hoặc mã bác sĩ không hợp lệ.",
  );
  const attemptedKeyRef = useRef("");
  const [verifyBooking] = useVerifyBookingMutation();

  useEffect(() => {
    if (!validParams) return;

    const requestKey = `${doctorId}:${token}`;
    if (attemptedKeyRef.current === requestKey) return;
    attemptedKeyRef.current = requestKey;
    setStatus("LOADING");
    setMessage("");

    const verify = async () => {
      try {
        const response = await verifyBooking({ token, doctorId }).unwrap();
        if (response.errCode !== 0) throw response;
        setStatus("SUCCESS");
      } catch (error: any) {
        const serverMessage = getApiErrorMessage(
          error,
          "Không thể xác nhận lịch khám.",
        );
        const normalizedMessage = serverMessage.toLocaleLowerCase("vi");

        if (
          error?.status === 409 &&
          normalizedMessage.includes("hết hạn")
        ) {
          setStatus("EXPIRED");
        } else {
          setStatus("FAILED");
        }
        setMessage(serverMessage);
      }
    };

    void verify();
  }, [doctorId, token, validParams, verifyBooking]);

  return (
    <div className="verify-booking-page">
      <HomeHeader isShowBanner={false} />
      <main className="booking-container verify-booking-main">
        <section className={`verify-booking-card ${status.toLowerCase()}`}>
          {status === "LOADING" && (
            <>
              <div className="verify-spinner" aria-hidden="true" />
              <h1>Đang xác nhận lịch khám</h1>
              <p>Vui lòng giữ nguyên trang trong giây lát.</p>
            </>
          )}

          {status === "SUCCESS" && (
            <>
              <i className="fas fa-check-circle status-icon" />
              <h1>Xác nhận email thành công</h1>
              <p>
                Lịch khám của bạn đã được chuyển tới phòng khám. Phòng khám sẽ
                xác nhận lịch hẹn trước khi bạn đến khám.
              </p>
              <div className="verify-actions">
                <Link to={`/detail-doctor/${doctorId}`}>Xem lại bác sĩ</Link>
                <Link className="secondary" to="/home">
                  Về trang chủ
                </Link>
              </div>
            </>
          )}

          {status === "EXPIRED" && (
            <>
              <i className="fas fa-clock status-icon" />
              <h1>Link xác nhận đã hết hạn</h1>
              <p>
                {message ||
                  "Link xác nhận lịch khám chỉ có hiệu lực trong 5 phút."}
              </p>
              <Link to={`/detail-doctor/${doctorId}`}>Đặt lịch khám lại</Link>
            </>
          )}

          {status === "FAILED" && (
            <>
              <i className="fas fa-exclamation-triangle status-icon" />
              <h1>Không thể xác nhận</h1>
              <p>
                {message ||
                  "Link không hợp lệ hoặc lịch khám đã được xác nhận trước đó."}
              </p>
              <div className="verify-actions">
                {Number.isInteger(doctorId) && doctorId > 0 && (
                  <Link to={`/detail-doctor/${doctorId}`}>Xem bác sĩ</Link>
                )}
                <Link className="secondary" to="/doctors">
                  Danh sách bác sĩ
                </Link>
              </div>
            </>
          )}
        </section>
      </main>
      <HomeFooter />
    </div>
  );
};

export default VerifyEmail;
