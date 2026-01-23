import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "containers/HomePage/HomeHeader";
import HomeFooter from "containers/HomePage/HomeFooter";
import Breadcrumb from "../../../components/Breadcrumb";
import "../../../components/Breadcrumb.scss";
import "./DetailDoctor.scss";
import { getDetailInfoDoctor } from "../../../services/doctorService";
import { LANGUAGES } from "utils";
import DoctorSchedules from "./DoctorSchedules";
import DoctorExtraInfo from "./DoctorExtraInfo";
class DetailDoctor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      detailDoctor: {
        image: "",
        positionData: {},
      },
    };
  }

  async componentDidMount() {
    const id = this.props.match?.params?.id || this.props.router?.params?.id;
    if (!id) return;
    try {
      const res = await getDetailInfoDoctor(id);
      if (res && res.errCode === 0) {
        this.setState({
          detailDoctor: res.data,
        });
      }
    } catch (e) {}
  }

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
  render() {
    let { detailDoctor } = this.state;

    const breadcrumbItems = [
      {
        label: this.props.language === LANGUAGES.VI ? "Trang chủ" : "Home",
        to: "/home",
      },
      {
        label: this.props.language === LANGUAGES.VI ? "Bác sĩ" : "Doctor",
        to: "/top-doctor",
      },
      {
        label:
          this.buildDoctorName(detailDoctor) ||
          (this.props.language === LANGUAGES.VI
            ? "Chi tiết bác sĩ"
            : "Doctor Detail"),
      },
    ];

    return (
      <>
        <HomeHeader isShowBanner={false} />
        <Breadcrumb
          items={breadcrumbItems}
          containerClassName="booking-container"
        />
        <div className="detail-doctor-container">
          <div className="booking-container">
            <div className="intro-doctor">
              <div
                className="content-left"
                style={{
                  backgroundImage: `url(data:image/jpeg;base64,${
                    detailDoctor.image ? detailDoctor.image : ""
                  })`,
                }}
              ></div>
              <div className="content-right">
                <div className="up">{this.buildDoctorName(detailDoctor)}</div>
                <div className="down">
                  {detailDoctor.Markdown &&
                    detailDoctor.Markdown.description && (
                      <span>{detailDoctor.Markdown.description}</span>
                    )}
                </div>
              </div>
            </div>
            <div className="schedule-doctor">
              <div className="content-left">
                <DoctorSchedules
                  detailDoctorFromParent={
                    detailDoctor && detailDoctor.id ? detailDoctor.id : -1
                  }
                />
              </div>
              <div className="content-right">
                <DoctorExtraInfo
                  detailDoctorFromParent={
                    detailDoctor && detailDoctor.id ? detailDoctor.id : -1
                  }
                />
              </div>
            </div>
            <div className="detail-info">
              {detailDoctor &&
                detailDoctor.Markdown &&
                detailDoctor.Markdown.contentHTML && (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: detailDoctor.Markdown.contentHTML,
                    }}
                  ></div>
                )}
            </div>
            <div className="comment-doctor"></div>
          </div>
        </div>
        <HomeFooter />
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

export default connect(mapStateToProps, mapDispatchToProps)(DetailDoctor);
