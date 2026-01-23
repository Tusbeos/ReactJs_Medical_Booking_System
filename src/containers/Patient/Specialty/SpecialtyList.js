import React, { Component } from "react";
import { withRouter } from "react-router";
import { FormattedMessage } from "react-intl";
import { handleGetAllSpecialties } from "../../../services/specialtyService";
import "./SpecialtyList.scss";
import HomeHeader from "containers/HomePage/HomeHeader";
import HomeFooter from "containers/HomePage/HomeFooter";
import { getBase64FromBuffer } from "../../../utils/CommonUtils";
import Breadcrumb from "../../../components/Breadcrumb";
import "../../../components/Breadcrumb.scss";
import { LANGUAGES } from "utils";

class SpecialtyItem extends Component {
  render() {
    const { name, imageUrl, isLast, onClick } = this.props;
    return (
      <li
        className={`specialty-item${isLast ? " last" : ""}`}
        onClick={onClick}
        style={{ cursor: "pointer" }}
      >
        <div className="specialty-item__icon">
          <img
            src={imageUrl}
            alt="icon"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/60?text=No+Img";
            }}
          />
        </div>
        <span className="specialty-item__name">{name}</span>
      </li>
    );
  }
}

class SpecialtyList extends Component {
  state = {
    specialties: [],
  };

  componentDidMount() {
    this.fetchSpecialties();
  }

  fetchSpecialties = async () => {
    try {
      const res = await handleGetAllSpecialties();
      if (res && res.errCode === 0 && res.data && Array.isArray(res.data)) {
        const dataArr = res.data;
        const specialties = dataArr.map((item) => ({
          id: item.id,
          name: item.name,
          imageUrl:
            getBase64FromBuffer(item.image) ||
            "https://via.placeholder.com/60?text=No+Img",
        }));

        this.setState({ specialties });
      } else {
        this.setState({ specialties: [] });
      }
    } catch (error) {}
  };

  constructor(props) {
    super(props);
    this.state = {
      specialties: [],
    };
  }

  handleViewDetailSpecialty = (id) => {
    if (this.props.history) {
      this.props.history.push(`/specialty/detail-specialty/${id}`);
    }
  };

  render() {
    const { specialties } = this.state;
    const breadcrumbItems = [
      {
        label: this.props.language === LANGUAGES.VI ? "Trang chủ" : "Home",
        to: "/home",
      },
      {
        label:
          this.props.language === LANGUAGES.VI ? "Chuyên khoa" : "Specialty",
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
          <div className="specialty-list-container">
            <h1 className="specialty-list-title">
              <FormattedMessage id="special-list.title" />
            </h1>
            <ul className="specialty-list-items">
              {specialties && specialties.length > 0 ? (
                specialties.map((item, idx) => (
                  <SpecialtyItem
                    key={item.id}
                    name={item.name}
                    imageUrl={item.imageUrl}
                    isLast={idx === specialties.length - 1}
                    onClick={() => this.handleViewDetailSpecialty(item.id)}
                  />
                ))
              ) : (
                <li
                  className="specialty-item"
                  style={{ justifyContent: "center" }}
                >
                  <span>
                    <FormattedMessage id="special-list.no-info" />
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

export default withRouter(SpecialtyList);