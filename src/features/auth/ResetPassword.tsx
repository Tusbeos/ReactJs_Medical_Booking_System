import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useResetPasswordMutation } from "../../store/api/passwordResetApi";
import systemLogo from "../../assets/Logo Medibook.png";
import { path } from "../../utils";
import "./ResetPassword.scss";

const MIN_PASSWORD_LENGTH = 6;

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Mật khẩu mới phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự.`);
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setError("");
    try {
      await resetPassword({ token, newPassword, confirmPassword }).unwrap();
      setDone(true);
    } catch (requestError: any) {
      setError(
        requestError?.data?.errMessage ||
          requestError?.data?.message ||
          "Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.",
      );
    }
  };

  // Truy cập trực tiếp không kèm token thì không thể đặt lại mật khẩu.
  if (!token) {
    return (
      <div className="reset-password-page">
        <div className="reset-card">
          <img className="reset-logo" src={systemLogo} alt="MediBook" />
          <div className="reset-icon reset-icon--error" aria-hidden="true">
            <i className="fas fa-triangle-exclamation" />
          </div>
          <h1>Liên kết không hợp lệ</h1>
          <p>
            Đường dẫn thiếu mã xác thực. Hãy mở lại liên kết trong email đặt lại
            mật khẩu, hoặc gửi một yêu cầu mới.
          </p>
          <Link className="reset-primary-btn" to={path.LOGIN}>
            Về trang đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="reset-password-page">
        <div className="reset-card">
          <img className="reset-logo" src={systemLogo} alt="MediBook" />
          <div className="reset-icon reset-icon--success" aria-hidden="true">
            <i className="fas fa-circle-check" />
          </div>
          <h1>Đổi mật khẩu thành công</h1>
          <p>
            Mọi phiên đăng nhập cũ trên các thiết bị khác đã bị đăng xuất. Hãy
            đăng nhập lại bằng mật khẩu mới.
          </p>
          <button
            type="button"
            className="reset-primary-btn"
            onClick={() => navigate(path.LOGIN)}
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-card">
        <img className="reset-logo" src={systemLogo} alt="MediBook" />
        <div className="reset-icon" aria-hidden="true">
          <i className="fas fa-key" />
        </div>
        <h1>Đặt lại mật khẩu</h1>
        <p>Nhập mật khẩu mới cho tài khoản MediBook của bạn.</p>

        <div className="reset-field">
          <label htmlFor="reset-new-password">Mật khẩu mới</label>
          <div className="reset-input-wrap">
            <input
              id="reset-new-password"
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setError("");
              }}
              placeholder={`Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`}
              autoComplete="new-password"
            />
            <button
              type="button"
              className="reset-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
            </button>
          </div>
        </div>

        <div className="reset-field">
          <label htmlFor="reset-confirm-password">Xác nhận mật khẩu</label>
          <input
            id="reset-confirm-password"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(event) => {
              setConfirmPassword(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSubmit();
            }}
            placeholder="Nhập lại mật khẩu mới"
            autoComplete="new-password"
          />
        </div>

        {error && (
          <div className="reset-error" role="alert">
            {error}
          </div>
        )}

        <button
          type="button"
          className="reset-primary-btn"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
        </button>

        <Link className="reset-back-link" to={path.LOGIN}>
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;
