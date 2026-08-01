import React, { FormEvent, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import HomeFooter from "layout/HomeFooter";
import HomeHeader from "layout/HomeHeader";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "store/api/passwordResetApi";
import "./PatientPasswordRecovery.scss";

const MIN_PASSWORD_LENGTH = 6;
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const PatientRecoveryLayout: React.FC<React.PropsWithChildren> = ({ children }) => (
  <div className="patient-recovery-page">
    <HomeHeader isShowBanner={false} />
    <main className="patient-recovery-main">{children}</main>
    <HomeFooter />
  </div>
);

export const PatientForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    setError("");
    try {
      await forgotPassword({ email: normalizedEmail }).unwrap();
      setSent(true);
    } catch (requestError: any) {
      setError(requestError?.data?.message || "Không thể gửi yêu cầu. Vui lòng thử lại sau.");
    }
  };

  return (
    <PatientRecoveryLayout>
      <section className="patient-recovery-card">
        <span className="patient-recovery-icon" aria-hidden="true"><i className="fas fa-key" /></span>
        <h1>Quên mật khẩu?</h1>
        {sent ? (
          <>
            <p>Nếu email thuộc tài khoản hợp lệ, MediBook đã gửi liên kết đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.</p>
            <Link className="patient-recovery-primary" to="/patient/auth?mode=login">Quay lại đăng nhập bệnh nhân</Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p>Nhập email tài khoản bệnh nhân để nhận liên kết đặt lại mật khẩu.</p>
            <label htmlFor="patient-recovery-email">Email</label>
            <input id="patient-recovery-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" autoFocus />
            {error && <div className="patient-recovery-error" role="alert">{error}</div>}
            <button className="patient-recovery-primary" type="submit" disabled={isLoading}>{isLoading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}</button>
            <Link className="patient-recovery-back" to="/patient/auth?mode=login">Quay lại đăng nhập bệnh nhân</Link>
          </form>
        )}
      </section>
    </PatientRecoveryLayout>
  );
};

export const PatientResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
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
      setError(requestError?.data?.message || "Liên kết không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.");
    }
  };

  return (
    <PatientRecoveryLayout>
      <section className="patient-recovery-card">
        <span className="patient-recovery-icon" aria-hidden="true"><i className="fas fa-lock" /></span>
        <h1>{done ? "Đặt lại mật khẩu thành công" : "Đặt lại mật khẩu"}</h1>
        {!token ? (
          <>
            <p>Liên kết thiếu mã xác nhận. Vui lòng yêu cầu một liên kết mới.</p>
            <Link className="patient-recovery-primary" to="/patient/forgot-password">Yêu cầu lại liên kết</Link>
          </>
        ) : done ? (
          <>
            <p>Hãy đăng nhập lại bằng mật khẩu mới để tiếp tục quản lý lịch khám.</p>
            <button className="patient-recovery-primary" type="button" onClick={() => navigate("/patient/auth?mode=login")}>Đăng nhập bệnh nhân</button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <p>Nhập mật khẩu mới cho tài khoản bệnh nhân của bạn.</p>
            <label htmlFor="patient-new-password">Mật khẩu mới</label>
            <input id="patient-new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" />
            <label htmlFor="patient-confirm-password">Xác nhận mật khẩu</label>
            <input id="patient-confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" />
            {error && <div className="patient-recovery-error" role="alert">{error}</div>}
            <button className="patient-recovery-primary" type="submit" disabled={isLoading}>{isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}</button>
          </form>
        )}
      </section>
    </PatientRecoveryLayout>
  );
};
