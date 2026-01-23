import React, { Component } from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import { handleGetTopDoctorHomeService } from "../../../services/doctorService";
import "./TopDoctorList.scss";
import HomeHeader from "containers/HomePage/HomeHeader";
import HomeFooter from "containers/HomePage/HomeFooter";
import { getBase64FromBuffer } from "../../../utils/CommonUtils";
import Breadcrumb from "../../../components/Breadcrumb";
import "../../../components/Breadcrumb.scss";
import { LANGUAGES } from "utils";

class DoctorItem extends Component {
  render() {
    const { name, subTitle, imageUrl, isLast, onClick } = this.props;
    return (
      <li
        className={`top-doctor-item${isLast ? " last" : ""}`}
        onClick={onClick}
        style={{ cursor: "pointer" }}
      >
        <div className="top-doctor-item__icon">
          <img
            src={imageUrl}
            alt="icon"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/60?text=No+Img";
            }}
          />
        </div>
        <div className="top-doctor-item__info">
          <span className="top-doctor-item__name">{name}</span>
          <span className="top-doctor-item__sub-title">{subTitle}</span>
        </div>
      </li>
    );
  }
}

class TopDoctorList extends Component {
  state = {
    doctors: [],
  };

  componentDidMount() {
    this.fetchTopDoctors();
  }

  buildDoctorName = (doctor) => {
    const { language } = this.props;
    if (doctor && doctor.positionData) {
      let nameVi = `${doctor.positionData.value_Vi}, ${doctor.lastName} ${doctor.firstName}`;
      let nameEn = `${doctor.positionData.value_En}, ${doctor.firstName} ${doctor.lastName}`;
      return language === LANGUAGES.VI ? nameVi : nameEn;
    }
    if (doctor && doctor.firstName && doctor.lastName) {
      return language === LANGUAGES.VI
        ? `${doctor.lastName} ${doctor.firstName}`
        : `${doctor.firstName} ${doctor.lastName}`;
    }
    return "";
  };

  buildDoctorSubTitle = (doctor) => {
    const { language } = this.props;
    const count =
      (doctor && doctor.DoctorInfo && doctor.DoctorInfo.count) ||
      doctor.count ||
      null;
    if (count !== null && count !== undefined) {
      return language === LANGUAGES.VI
        ? `Lượt khám: ${count}`
        : `Visits: ${count}`;
    }
    return language === LANGUAGES.VI ? "Bác sĩ nổi bật" : "Top doctor";
  };

  fetchTopDoctors = async () => {
    try {
      const res = await handleGetTopDoctorHomeService(100);
      if (res && res.errCode === 0 && res.data && Array.isArray(res.data)) {
        const dataArr = res.data;
        const doctors = dataArr.map((item) => ({
          id: item.id,
          name: this.buildDoctorName(item),
          subTitle: this.buildDoctorSubTitle(item),
          imageUrl:
            getBase64FromBuffer(item.image) ||
            "https://via.placeholder.com/60?text=No+Img",
        }));

        this.setState({ doctors });
      } else {
        console.log("Fetch failed or no data:", res);
        this.setState({ doctors: [] });
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bác sĩ nổi bật:", error);
    }
  };

  handleViewDetailDoctor = (id) => {
    if (this.props.history) {
      this.props.history.push(`/detail-doctor/${id}`);
    }
  };

  render() {
    const { doctors } = this.state;
    const { language } = this.props;
    const breadcrumbItems = [
      {
        label: language === LANGUAGES.VI ? "Trang chủ" : "Home",
        to: "/home",
      },
      {
        label: language === LANGUAGES.VI ? "Bác sĩ" : "Doctor",
      },
    ];
    return (
      <>
        <HomeHeader />
        <Breadcrumb
          items={breadcrumbItems}
          containerClassName="booking-container"
        />
        <div className="booking-container">
          <div className="top-doctor-list-container">
            <h1 className="top-doctor-list-title">
              {language === LANGUAGES.VI
                ? "Bác sĩ nổi bật dành cho bạn"
                : "Top doctors for you"}
            </h1>
            <ul className="top-doctor-list-items">
              {doctors && doctors.length > 0 ? (
                doctors.map((item, idx) => (
                  <DoctorItem
                    key={item.id}
                    name={item.name}
                    subTitle={item.subTitle}
                    imageUrl={item.imageUrl}
                    isLast={idx === doctors.length - 1}
                    onClick={() => this.handleViewDetailDoctor(item.id)}
                  />
                ))
              ) : (
                <li
                  className="top-doctor-item"
                  style={{ justifyContent: "center" }}
                >
                  <span>
                    {language === LANGUAGES.VI
                      ? "Không có dữ liệu bác sĩ"
                      : "No doctor data"}
                  </span>
                </li>
              )}
            </ul>
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

export default withRouter(connect(mapStateToProps)(TopDoctorList));
