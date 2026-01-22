import React, { Component } from "react";
import { connect } from "react-redux";
import "./BookingDoctor.scss";
import { LANGUAGES } from "utils";
import moment from "moment";
import { NumericFormat } from "react-number-format";
import { injectIntl, FormattedMessage } from "react-intl";
import HomeHeader from "containers/HomePage/HomeHeader";
import { getDetailInfoDoctor } from "../../../services/doctorService";
import { postPatientBookAppointment } from "../../../services/bookingService";
import DatePicker from "../../../components/Input/DatePicker";
import { toast } from "react-toastify";

class BookingModel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      lastName: "",
      firstName: "",
      gender: "",
      phoneNumber: "",
      email: "",
      birthday: "",
      address: "",
      reason: "",
      doctorId: "",
      timeType: "",
      bookingTimeText: "",
      doctorName: "",
      detailDoctor: {},
      timeBooking: {},
      doctorInfo: {},
    };
  }

  async componentDidMount() {
    if (this.props.location && this.props.location.state) {
      let { id } = this.props.match.params;
      let { dataTime } = this.props.location.state;
      try {
        const time = dataTime;
        const res = await getDetailInfoDoctor(id);
        if (res && res.errCode === 0) {
          this.setState({
            doctorId: this.props.match.params.id,
            doctorInfo: res.data.DoctorInfo,
            timeBooking: time,
            detailDoctor: res.data,
            timeType: time.timeType,
            paymentMethod: "cash",
          });
        }
      } catch (e) {}
    }
  }

  async componentDidUpdate(prevProps, prevState, snapShot) {
    if (this.props.language !== prevProps.language) {
    }
  }

  renderTimeBooking = (timeBooking) => {
    let { language } = this.props;
    if (timeBooking && timeBooking.timeTypeData) {
      let time =
        language === LANGUAGES.VI
          ? timeBooking.timeTypeData.value_Vi
          : timeBooking.timeTypeData.value_En;
      let dateResult = "";
      if (timeBooking.date) {
        let startTime = +timeBooking.date;
        let dateFormatted = moment(startTime).format("DD/MM/YYYY");
        if (language === LANGUAGES.VI) {
          let dayNumber = moment(startTime).day();
          let days = [
            "Chủ Nhật",
            "Thứ 2",
            "Thứ 3",
            "Thứ 4",
            "Thứ 5",
            "Thứ 6",
            "Thứ 7",
          ];
          let dayName = days[dayNumber];
          dateResult = `${dayName} - ${dateFormatted}`;
        } else {
          let dayNameEn = moment(startTime).locale("en").format("dddd");
          dateResult = `${dayNameEn} - ${dateFormatted}`;
        }
      }
      let bookingTime = `${time} - ${dateResult}`;
      return bookingTime;
    }
    return "";
  };

  getDoctorImage = (detailDoctor) => {
    if (detailDoctor && detailDoctor.image) {
      return `url(data:image/png;base64,${detailDoctor.image})`;
    }
    return "none";
  };

  buildDoctorName = (detailDoctor) => {
    let { language } = this.props;
    if (detailDoctor && detailDoctor.positionData) {
      let nameVi = `${detailDoctor.positionData.value_Vi}, ${
        detailDoctor.roleData?.value_Vi || ""
      } ${detailDoctor.lastName} ${detailDoctor.firstName}`;
      let nameEn = `${detailDoctor.positionData.value_En}, ${
        detailDoctor.roleData?.value_En || ""
      } ${detailDoctor.firstName} ${detailDoctor.lastName}`;

      return language === LANGUAGES.VI ? nameVi : nameEn;
    }
    return "";
  };

  handleOnChangeInput = (event, id) => {
    let valueInput = event.target.value;
    let stateCopy = { ...this.state };
    stateCopy[id] = valueInput;
    this.setState({
      ...stateCopy,
    });
  };

  handleChangeDatePicker = (date) => {
    this.setState({
      birthday: date[0],
    });
  };
  handleConfirmBooking = async () => {
    let timeString = this.renderTimeBooking(this.state.timeBooking);
    let doctorName = this.buildDoctorName(this.state.detailDoctor);
    let appointmentDate = this.state.timeBooking?.date || "";
    let birthday = this.state.birthday
      ? new Date(this.state.birthday).getTime()
      : "";
    let fullName = `${this.state.lastName || ""} ${
      this.state.firstName || ""
    }`.trim();

    let res = await postPatientBookAppointment({
      fullName: fullName,
      lastName: this.state.lastName,
      firstName: this.state.firstName,
      gender: this.state.gender,
      phoneNumber: this.state.phoneNumber,
      email: this.state.email,
      date: appointmentDate,
      birthday: birthday,
      address: this.state.address,
      reason: this.state.reason,
      doctorId: this.state.doctorId,
      timeType: this.state.timeType,
      language: this.props.language,
      timeString: timeString,
      doctorName: doctorName,
    });
    console.log("check data", res);

    if (res && res.errCode === 0) {
      toast.success("Booking a new appointment succeed!");
      this.props.history.push(`/detail-doctor/${this.state.doctorId}`);
    } else {
      toast.error("Booking a new appointment error!");
    }
  };

  render() {
    let { intl, language } = this.props;
    let { detailDoctor, timeBooking, doctorInfo } = this.state;
    console.log("check props booking modal", this.state);
    return (
      <>
        <HomeHeader isShowBanner={false} />
        <div className="booking-modal-container">
          <div className="booking-container">
            <div className="booking-modal-content">
              <div className="doctor-info-section">
                <div
                  className="doctor-image"
                  style={{
                    backgroundImage: this.getDoctorImage(detailDoctor),
                  }}
                ></div>
                <div className="doctor-details">
                  <div className="title-booking">
                    <FormattedMessage id="booking.booking-doctor.title-booking" />
                  </div>
                  <div className="doctor-name">
                    <div className="up">
                      {this.buildDoctorName(detailDoctor)}
                    </div>
                  </div>
                  <div className="time-booking">
                    <div>
                      <i className="fas fa-calendar-alt"></i>
                      {this.renderTimeBooking(timeBooking)}
                    </div>
                  </div>
                  <div className="name-clinic">
                    <i class="fas fa-clinic-medical"></i>
                    {doctorInfo && doctorInfo.nameClinic
                      ? doctorInfo.nameClinic
                      : ""}
                  </div>
                  <div className="address-clinic">
                    {doctorInfo && doctorInfo.addressClinic
                      ? doctorInfo.addressClinic
                      : ""}
                  </div>
                </div>
              </div>

              <div className="price-section">
                <label className="price-box">
                  <div>
                    <input
                      type="radio"
                      name="priceGroup"
                      value="fixedPrice"
                      defaultChecked={true}
                    />
                    &nbsp;
                    <FormattedMessage id="booking.booking-doctor.price" />:{""}
                  </div>
                  <div>
                    {doctorInfo &&
                      doctorInfo.priceTypeData &&
                      language === LANGUAGES.VI && (
                        <NumericFormat
                          className="currency"
                          value={doctorInfo.priceTypeData.value_Vi}
                          thousandsGroupStyle="thousand"
                          thousandSeparator=","
                          suffix="đ"
                          displayType="text"
                        />
                      )}
                    {doctorInfo &&
                      doctorInfo.priceTypeData &&
                      language === LANGUAGES.EN && (
                        <NumericFormat
                          className="currency"
                          value={doctorInfo.priceTypeData.value_En}
                          thousandsGroupStyle="thousand"
                          thousandSeparator=","
                          suffix="$"
                          displayType="text"
                        />
                      )}
                  </div>
                </label>
              </div>

              <div className="booking-modal-body">
                <div className="row">
                  <div className="col-12 col-md-6 form-group">
                    <div className="input-icon-group">
                      <i class="fas fa-user"></i>
                      <input
                        className="form-control"
                        type="text"
                        placeholder={intl.formatMessage({
                          id: "booking.booking-doctor.last-name",
                        })}
                        value={this.state.lastName}
                        onChange={(event) =>
                          this.handleOnChangeInput(event, "lastName")
                        }
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6 form-group">
                    <div className="input-icon-group">
                      <i class="fas fa-user"></i>
                      <input
                        className="form-control"
                        type="text"
                        placeholder={intl.formatMessage({
                          id: "booking.booking-doctor.first-name",
                        })}
                        value={this.state.firstName}
                        onChange={(event) =>
                          this.handleOnChangeInput(event, "firstName")
                        }
                      />
                    </div>
                  </div>

                  <div className="col-12 form-group">
                    <div className="gender-options">
                      <label>
                        <input
                          type="radio"
                          name="gender"
                          value="M"
                          onChange={(event) =>
                            this.handleOnChangeInput(event, "gender")
                          }
                        />{" "}
                        <FormattedMessage id="booking.booking-doctor.male" />
                      </label>
                      <label style={{ marginLeft: "20px" }}>
                        <input
                          type="radio"
                          name="gender"
                          value="F"
                          onChange={(event) =>
                            this.handleOnChangeInput(event, "gender")
                          }
                        />{" "}
                        <FormattedMessage id="booking.booking-doctor.female" />
                      </label>
                    </div>
                  </div>

                  <div className="col-12 form-group">
                    <div className="input-icon-group">
                      <i class="fas fa-phone"></i>
                      <input
                        className="form-control"
                        type="text"
                        placeholder={intl.formatMessage({
                          id: "booking.booking-doctor.phone-number",
                        })}
                        value={this.state.phoneNumber}
                        onChange={(event) =>
                          this.handleOnChangeInput(event, "phoneNumber")
                        }
                      />
                    </div>
                  </div>

                  <div className="col-12 form-group">
                    <div className="input-icon-group">
                      <i class="fas fa-envelope"></i>
                      <input
                        className="form-control"
                        type="email"
                        placeholder={intl.formatMessage({
                          id: "booking.booking-doctor.email",
                        })}
                        value={this.state.email}
                        onChange={(event) =>
                          this.handleOnChangeInput(event, "email")
                        }
                      />
                    </div>
                  </div>

                  <div className="col-12 form-group">
                    <div className="input-icon-group">
                      <i class="fas fa-calendar-alt"></i>
                      <DatePicker
                        className="form-control"
                        value={this.state.birthday}
                        onChange={this.handleChangeDatePicker}
                        placeholder={intl.formatMessage({
                          id: "booking.booking-doctor.birthday",
                        })}
                      />
                    </div>
                  </div>

                  <div className="col-12 form-group">
                    <div className="input-icon-group">
                      <i class="fas fa-map-marker-alt"></i>
                      <input
                        className="form-control"
                        type="text"
                        placeholder={intl.formatMessage({
                          id: "booking.booking-doctor.address",
                        })}
                        value={this.state.address}
                        onChange={(event) =>
                          this.handleOnChangeInput(event, "address")
                        }
                      />
                    </div>
                  </div>

                  <div className="col-12 form-group">
                    <div className="input-icon-group">
                      <i class="fas fa-plus-circle"></i>
                      <input
                        className="form-control"
                        type="text"
                        placeholder={intl.formatMessage({
                          id: "booking.booking-doctor.reason",
                        })}
                        value={this.state.reason}
                        onChange={(event) =>
                          this.handleOnChangeInput(event, "reason")
                        }
                      />
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="payment">
                      <FormattedMessage id="booking.booking-doctor.payment-method" />
                    </label>
                    <div className="payment-options">
                      <label>
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cash"
                          checked={this.state.paymentMethod === "cash"}
                        />{" "}
                        &nbsp;
                        <FormattedMessage id="booking.booking-doctor.payment-attention" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="more-info">
                <div className="tag-price">
                  <span className="left">
                    <FormattedMessage id="booking.booking-doctor.price" />
                  </span>
                  <span className="right">
                    {" "}
                    <div>
                      {doctorInfo &&
                        doctorInfo.priceTypeData &&
                        language === LANGUAGES.VI && (
                          <NumericFormat
                            className="currency"
                            value={doctorInfo.priceTypeData.value_Vi}
                            thousandsGroupStyle="thousand"
                            thousandSeparator=","
                            suffix="đ"
                            displayType="text"
                          />
                        )}
                      {doctorInfo &&
                        doctorInfo.priceTypeData &&
                        language === LANGUAGES.EN && (
                          <NumericFormat
                            className="currency"
                            value={doctorInfo.priceTypeData.value_En}
                            thousandsGroupStyle="thousand"
                            thousandSeparator=","
                            suffix="$"
                            displayType="text"
                          />
                        )}
                    </div>
                  </span>
                </div>
                <div className="tag-price">
                  <span className="left">
                    <FormattedMessage id="booking.booking-doctor.booking-fee" />
                  </span>
                  <span className="right">
                    <FormattedMessage id="booking.booking-doctor.free" />
                  </span>
                </div>
                <div className="tag-price">
                  <span className="left">
                    <FormattedMessage id="booking.booking-doctor.total" />
                  </span>
                  <span className="right text-danger">
                    {" "}
                    <div>
                      {doctorInfo &&
                        doctorInfo.priceTypeData &&
                        language === LANGUAGES.VI && (
                          <NumericFormat
                            className="currency"
                            value={doctorInfo.priceTypeData.value_Vi}
                            thousandsGroupStyle="thousand"
                            thousandSeparator=","
                            suffix="đ"
                            displayType="text"
                          />
                        )}
                      {doctorInfo &&
                        doctorInfo.priceTypeData &&
                        language === LANGUAGES.EN && (
                          <NumericFormat
                            className="currency"
                            value={doctorInfo.priceTypeData.value_En}
                            thousandsGroupStyle="thousand"
                            thousandSeparator=","
                            suffix="$"
                            displayType="text"
                          />
                        )}
                    </div>
                  </span>
                </div>
              </div>
              <div className="note-booking">
                <div className="note-title">
                  <FormattedMessage id="booking.booking-doctor.note" />
                </div>

                <div className="note-table">
                  <span className="note">
                    <FormattedMessage id="booking.booking-doctor.attention" />
                  </span>
                  <p className="note-desc">
                    <FormattedMessage id="booking.booking-doctor.note-info" />
                  </p>
                  <ul className="note-list">
                    <li>
                      <FormattedMessage id="booking.booking-doctor.info-1" />
                    </li>
                    <li>
                      <FormattedMessage id="booking.booking-doctor.info-2" />
                    </li>
                  </ul>
                </div>
              </div>

              <div className="booking-modal-footer">
                <button
                  className="btn-booking-confirm col-12"
                  onClick={() => this.handleConfirmBooking()}
                >
                  <FormattedMessage id="booking.booking-doctor.confirm-booking" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    language: state.app.language,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(BookingModel));
