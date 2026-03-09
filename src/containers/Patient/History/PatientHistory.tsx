import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";
import HomeHeader from "../../HomePage/HomeHeader";
import { IRootState } from "../../../types";
import { getPatientHistory } from "../../../services/patientService";
import { LANGUAGES } from "../../../utils";
import "./PatientHistory.scss";

interface IHistoryRecord {
  id: number;
  bookingId: number;
  bookingDate: string;
  timeType: string;
  timeTypeValueVi: string;
  timeTypeValueEn: string;
  doctorId: number;
  doctorFirstName: string;
  doctorLastName: string;
  patientId: number;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  reason: string;
  diagnosis: string;
  prescription: string;
  notes: string;
  createdAt: string;
}

const PatientHistory: React.FC = () => {
  const language = useSelector((state: IRootState) => state.app.language);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);

  const [histories, setHistories] = useState<IHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      const userId = userInfo?.id || (userInfo as any)?.userId;
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await getPatientHistory(userId);
        if (res && res.errCode === 0) {
          setHistories(res.data || []);
        }
      } catch (e) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userInfo?.id, (userInfo as any)?.userId]);

  // Chuyển timestamp sang ngày hiển thị
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const ts = Number(dateStr);
    if (!isNaN(ts) && ts > 0) {
      const d = new Date(ts);
      return d.toLocaleDateString(language === LANGUAGES.VI ? "vi-VN" : "en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    return dateStr;
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      <HomeHeader isShowBanner={false} />
      <div className="patient-history-container">
        <div className="history-card">
          <div className="history-header">
            <h2>
              <i className="fas fa-file-medical-alt" />
              <FormattedMessage
                id="patient.history.title"
                defaultMessage="Lịch sử khám bệnh"
              />
            </h2>
          </div>

          <div className="history-body">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin" />
                <span>
                  <FormattedMessage
                    id="patient.history.loading"
                    defaultMessage="Đang tải..."
                  />
                </span>
              </div>
            ) : histories.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-clipboard-list" />
                <p>
                  <FormattedMessage
                    id="patient.history.empty"
                    defaultMessage="Bạn chưa có lịch sử khám bệnh nào"
                  />
                </p>
              </div>
            ) : (
              <div className="history-list">
                {histories.map((record) => {
                  const isExpanded = expandedId === record.id;
                  const doctorName =
                    language === LANGUAGES.VI
                      ? `${record.doctorLastName || ""} ${record.doctorFirstName || ""}`.trim()
                      : `${record.doctorFirstName || ""} ${record.doctorLastName || ""}`.trim();
                  const timeLabel =
                    language === LANGUAGES.VI
                      ? record.timeTypeValueVi
                      : record.timeTypeValueEn;

                  return (
                    <div
                      key={record.id}
                      className={`history-item ${isExpanded ? "expanded" : ""}`}
                    >
                      <div
                        className="item-summary"
                        onClick={() => toggleExpand(record.id)}
                      >
                        <div className="summary-left">
                          <div className="date-badge">
                            <i className="far fa-calendar-alt" />
                            <span>{formatDate(record.bookingDate)}</span>
                          </div>
                          <div className="doctor-info">
                            <i className="fas fa-user-md" />
                            <span>{doctorName || "—"}</span>
                          </div>
                          {timeLabel && (
                            <div className="time-badge">
                              <i className="far fa-clock" />
                              <span>{timeLabel}</span>
                            </div>
                          )}
                        </div>
                        <i
                          className={`fas fa-chevron-down expand-icon ${isExpanded ? "rotated" : ""}`}
                        />
                      </div>

                      {isExpanded && (
                        <div className="item-detail">
                          {record.reason && (
                            <div className="detail-row">
                              <span className="detail-label">
                                <FormattedMessage
                                  id="patient.history.reason"
                                  defaultMessage="Lý do khám"
                                />
                              </span>
                              <span className="detail-value">{record.reason}</span>
                            </div>
                          )}
                          {record.diagnosis && (
                            <div className="detail-row">
                              <span className="detail-label">
                                <FormattedMessage
                                  id="patient.history.diagnosis"
                                  defaultMessage="Chẩn đoán"
                                />
                              </span>
                              <span className="detail-value">{record.diagnosis}</span>
                            </div>
                          )}
                          {record.prescription && (
                            <div className="detail-row">
                              <span className="detail-label">
                                <FormattedMessage
                                  id="patient.history.prescription"
                                  defaultMessage="Đơn thuốc"
                                />
                              </span>
                              <span className="detail-value prescription">
                                {record.prescription}
                              </span>
                            </div>
                          )}
                          {record.notes && (
                            <div className="detail-row">
                              <span className="detail-label">
                                <FormattedMessage
                                  id="patient.history.notes"
                                  defaultMessage="Ghi chú"
                                />
                              </span>
                              <span className="detail-value">{record.notes}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientHistory;
