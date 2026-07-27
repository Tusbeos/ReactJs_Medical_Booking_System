import React, { useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import * as actions from "../../store/actions";
import "./Login.scss";
import systemLogo from "../../assets/Logo Medibook.png";
import {
  handleGetUserById,
  handleSystemLoginApi,
} from "../../services/userService";
import { USER_ROLE } from "../../utils";
import { useForgotPasswordMutation } from "../../store/api/passwordResetApi";

const Login: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errMessage, setErrMessage] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);
  const [forgotPassword, forgotPasswordState] = useForgotPasswordMutation();
  const isSendingRecovery = forgotPasswordState.isLoading;

  const openForgotPassword = () => {
    setErrMessage("");
    setShowPassword(false);
    // Đưa sẵn email đang nhập ở form đăng nhập sang để đỡ phải gõ lại.
    setRecoveryEmail(username.trim());
    setRecoveryError("");
    setRecoverySent(false);
    setIsForgotPasswordOpen(true);
  };

  const closeForgotPassword = () => {
    setIsForgotPasswordOpen(false);
    setRecoveryError("");
    setRecoverySent(false);
  };

  const handleSendRecovery = useCallback(async () => {
    const email = recoveryEmail.trim();
    if (!email) {
      setRecoveryError("Vui lòng nhập email tài khoản.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setRecoveryError("Email không hợp lệ.");
      return;
    }
    setRecoveryError("");
    try {
      await forgotPassword({ email }).unwrap();
      // Backend cố tình trả thành công kể cả khi email không tồn tại,
      // nên giao diện cũng không được tiết lộ email có tồn tại hay không.
      setRecoverySent(true);
    } catch (error: any) {
      const status = error?.status;
      setRecoveryError(
        status === 429
          ? "Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau."
          : error?.data?.errMessage ||
              error?.data?.message ||
              "Không thể gửi yêu cầu. Vui lòng thử lại.",
      );
    }
  }, [recoveryEmail, forgotPassword]);

  const handleLogin = useCallback(async () => {
    setErrMessage("");
    try {
      const data = await handleSystemLoginApi(username, password);
      if (!data || !data.success) {
        return setErrMessage(data?.message || "Login failed");
      }

      let userInfo = data.data;
      if (userInfo?.roleId === USER_ROLE.PATIENT) {
        return setErrMessage(
          "Tài khoản bệnh nhân vui lòng đăng nhập ở khu vực bệnh nhân.",
        );
      }

      dispatch(actions.userLoginSuccess(userInfo, data.data?.token));

      if (data.data?.id) {
        try {
          const userDetailRes = await handleGetUserById(data.data.id);
          if (
            userDetailRes?.data &&
            (userDetailRes.success || userDetailRes.errCode === 0)
          ) {
            userInfo = {
              ...data.data,
              ...userDetailRes.data,
              token: data.data.token,
              refreshToken: data.data.refreshToken,
            };
            dispatch(actions.userLoginSuccess(userInfo, data.data?.token));
          }
        } catch (e) {
          // Login vẫn thành công; avatar sẽ fallback nếu không lấy được profile.
        }
      }
      console.log("Login success");

      // System login supports Admin, Doctor, Clinic Manager, and Writer.
      const roleId = userInfo?.roleId;
      if (roleId === USER_ROLE.ADMIN) {
        navigate("/system");
      } else if (roleId === USER_ROLE.CLINIC_MANAGER) {
        navigate("/system/clinic-manager");
      } else if (roleId === USER_ROLE.DOCTOR) {
        navigate("/doctor/manage-schedule");
      } else if (roleId === USER_ROLE.WRITER) {
        navigate("/system/writer/articles");
      } else {
        navigate("/");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        "Something went wrong. Please try again.";
      setErrMessage(msg);
      console.log("login error:", e);
    }
  }, [username, password, dispatch, navigate]);

  const handleKeyDown = useCallback(
    (event: any) => {
      if (event.key === "Enter" || event.keyCode === 13) {
        handleLogin();
      }
    },
    [handleLogin],
  );

  return (
    <div className="login_background">
      <section className="login-brand-panel">
        <div className="brand-content">
          <div className="brand-logo-row">
            <div className="brand-logo-icon">
              <img src={systemLogo} alt="MediBook" />
            </div>
            <span>MediBook</span>
          </div>

          <h1>Cổng quản trị MediBook</h1>
          <p>
            Không gian làm việc dành cho quản trị viên, bác sĩ và quản lý phòng
            khám.
          </p>

          <div className="brand-stats">
            <div>
              <strong>R1</strong>
              <span>Quản trị hệ thống</span>
            </div>
            <div>
              <strong>R2/R4</strong>
              <span>Vận hành phòng khám</span>
            </div>
            <div>
              <strong>R5</strong>
              <span>Người viết bài / Cộng tác viên nội dung</span>
            </div>
          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-container">
          <div
            className={`login-content${isForgotPasswordOpen ? " login-content--recovery" : ""}`}
          >
            {isForgotPasswordOpen ? (
              <div className="forgot-password-view">
                <button
                  type="button"
                  className="forgot-back-button"
                  onClick={closeForgotPassword}
                  autoFocus
                >
                  <i className="fas fa-arrow-left" aria-hidden="true" />
                  Quay lại đăng nhập
                </button>

                <div className="forgot-password-icon" aria-hidden="true">
                  <i className="fas fa-key" />
                </div>

                <div className="login-heading forgot-password-heading">
                  <span className="forgot-password-eyebrow">
                    Hỗ trợ tài khoản
                  </span>
                  <h2>Quên mật khẩu?</h2>
                  <p>
                    Nhập email tài khoản của bạn. Hệ thống sẽ gửi một liên kết
                    đặt lại mật khẩu có thời hạn tới hộp thư đó.
                  </p>
                </div>

                {recoverySent ? (
                  <>
                    <div className="recovery-security-note">
                      <i className="fas fa-paper-plane" aria-hidden="true" />
                      <p>
                        <strong>Đã gửi yêu cầu</strong>
                        Nếu email tồn tại trong hệ thống, liên kết đặt lại mật
                        khẩu đã được gửi. Vui lòng kiểm tra cả mục thư rác.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-login recovery-login-button"
                      onClick={closeForgotPassword}
                    >
                      Quay lại đăng nhập
                    </button>
                  </>
                ) : (
                  <>
                    <div className="form-group input-login">
                      <label htmlFor="recovery-email">Email tài khoản</label>
                      <input
                        id="recovery-email"
                        type="email"
                        value={recoveryEmail}
                        onChange={(event) => {
                          setRecoveryEmail(event.target.value);
                          setRecoveryError("");
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") handleSendRecovery();
                        }}
                        placeholder="Nhập email đã đăng ký"
                        autoComplete="email"
                      />
                    </div>

                    {recoveryError && (
                      <div className="login-error" role="alert">
                        {recoveryError}
                      </div>
                    )}

                    <div className="recovery-security-note">
                      <i className="fas fa-shield-alt" aria-hidden="true" />
                      <p>
                        <strong>Lưu ý bảo mật</strong>
                        Liên kết chỉ dùng được một lần. Sau khi đổi mật khẩu,
                        mọi phiên đăng nhập trên thiết bị khác sẽ bị đăng xuất.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn-login recovery-login-button"
                      onClick={handleSendRecovery}
                      disabled={isSendingRecovery}
                    >
                      {isSendingRecovery
                        ? "Đang gửi..."
                        : "Gửi liên kết đặt lại mật khẩu"}
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="login-heading">
                  <h2>Đăng nhập hệ thống</h2>
                  <p>
                    Dành cho Admin, Bác sĩ, Quản lý phòng khám và Người viết bài
                  </p>
                </div>

                <div className="form-group input-login">
                  <label htmlFor="system-login-email">Email nội bộ</label>
                  <div className="input-shell">
                    <i className="fas fa-at" aria-hidden="true" />
                    <input
                      id="system-login-email"
                      type="email"
                      placeholder="admin@medibook.vn"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoComplete="username"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="form-group input-login password-input-group">
                  <label htmlFor="system-login-password">Mật khẩu</label>
                  <div className="input-shell password-shell">
                    <i className="fas fa-lock" aria-hidden="true" />
                    <input
                      id="system-login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={handleKeyDown}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"
                      }
                      aria-pressed={showPassword}
                    >
                      <i
                        className={
                          showPassword ? "fas fa-eye-slash" : "fas fa-eye"
                        }
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <div className="password-actions-row">
                    <button
                      type="button"
                      className="text-link"
                      onClick={openForgotPassword}
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                </div>

                <label className="remember-row">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>

                {errMessage && <div className="login-error">{errMessage}</div>}

                <button className="btn-login" onClick={handleLogin}>
                  Đăng nhập
                </button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
