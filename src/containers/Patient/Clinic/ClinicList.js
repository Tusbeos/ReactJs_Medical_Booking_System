import React, { Component } from "react";
import { withRouter } from "react-router";
import { handleGetAllClinics } from "../../../services/clinicService";
import "./ClinicList.scss";
import HomeHeader from "containers/HomePage/HomeHeader";
import HomeFooter from "containers/HomePage/HomeFooter";
import { getBase64FromBuffer } from "../../../utils/CommonUtils";
import Breadcrumb from "../../../components/Breadcrumb";
import "../../../components/Breadcrumb.scss";
import { LANGUAGES } from "utils";

class ClinicItem extends Component {
  render() {
    const { name, address, imageUrl, isLast, onClick } = this.props;
    return (
      <li
        className={`clinic-item${isLast ? " last" : ""}`}
        onClick={onClick}
        style={{ cursor: "pointer" }}
      >
        <div className="clinic-item__icon">
          <img
            src={imageUrl}
            alt="icon"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/60?text=No+Img";
            }}
          />
        </div>
        <div className="clinic-item__info">
          <span className="clinic-item__name">{name}</span>
          <span className="clinic-item__address">{address}</span>
        </div>
      </li>
    );
  }
}

class ClinicList extends Component {
  state = {
    clinics: [],
  };

  componentDidMount() {
    this.fetchClinics();
  }

  fetchClinics = async () => {
    try {
      const res = await handleGetAllClinics();
      if (res && res.errCode === 0 && res.data && Array.isArray(res.data)) {
        const dataArr = res.data;
        const clinics = dataArr.map((item) => ({
          id: item.id,
          name: item.name,
          address: item.address,
          imageUrl:
            getBase64FromBuffer(item.image) ||
            "https://via.placeholder.com/60?text=No+Img",
        }));

        this.setState({ clinics });
      } else {
        console.log("Fetch failed or no data:", res);
        this.setState({ clinics: [] });
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng khám:", error);
    }
  };

  handleViewDetailClinic = (id) => {
    if (this.props.history) {
      this.props.history.push(`/clinic/detail-clinic/${id}`);
    }
  };

  render() {
    const { clinics } = this.state;
    const breadcrumbItems = [
      {
        label: this.props.language === LANGUAGES.VI ? "Trang chủ" : "Home",
        to: "/home",
      },
      {
        label: this.props.language === LANGUAGES.VI ? "Phòng khám" : "Clinic",
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
          <div className="clinic-list-container">
            <h1 className="clinic-list-title">Phòng khám dành cho bạn</h1>
            <ul className="clinic-list-items">
              {clinics && clinics.length > 0 ? (
                clinics.map((item, idx) => (
                  <ClinicItem
                    key={item.id}
                    name={item.name}
                    address={item.address}
                    imageUrl={item.imageUrl}
                    isLast={idx === clinics.length - 1}
                    onClick={() => this.handleViewDetailClinic(item.id)}
                  />
                ))
              ) : (
                <li
                  className="clinic-item"
                  style={{ justifyContent: "center" }}
                >
                  <span>Không có dữ liệu phòng khám</span>
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

export default withRouter(ClinicList);
