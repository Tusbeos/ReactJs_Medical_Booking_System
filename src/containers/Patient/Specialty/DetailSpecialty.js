import React, { Component } from "react";
import { withRouter } from "react-router";
import { injectIntl } from "react-intl";
import { getSpecialtyByIds } from "../../../services/specialtyService";
import { HandleGetDoctorSpecialtyById } from "../../../services/doctorService";
import HomeHeader from "containers/HomePage/HomeHeader";
import Breadcrumb from "../../../components/Breadcrumb";
import "../../../components/Breadcrumb.scss";
import { getBase64FromBuffer } from "../../../utils/CommonUtils";
import "./DetailSpecialty.scss";
import DoctorCard from "components/Patient/DoctorCard";
import { LANGUAGES } from "utils";

class DetailSpecialty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      specialty: null,
      isShowDetail: false,
      doctorIds: [],
    };
  }

  async componentDidMount() {
    const { match } = this.props;
    const id = match && match.params && match.params.id;
    if (id) {
      const res = await getSpecialtyByIds([id]);
      if (res && res.errCode === 0 && Array.isArray(res.data)) {
        const found = res.data && res.data[0];
        if (found) {
          this.setState({
            specialty: {
              ...found,
              imageUrl: getBase64FromBuffer(found.image) || "",
            },
          });
        }
      }
      const doctorRes = await HandleGetDoctorSpecialtyById(id);
      if (
        doctorRes &&
        doctorRes.errCode === 0 &&
        Array.isArray(doctorRes.data)
      ) {
        const ids = doctorRes.data
          .map((item) => item && (item.id || item.doctorId))
          .filter((value) => value);
        this.setState({ doctorIds: ids });
      } else {
        this.setState({ doctorIds: [] });
      }
    }
  }

  handleShowHideDetail = () => {
    this.setState({
      isShowDetail: !this.state.isShowDetail,
    });
  };

  render() {
    let intl = this.props.intl;
    const { specialty, isShowDetail, doctorIds } = this.state;
    let backgroundImage = specialty ? `url(${specialty.imageUrl})` : "";

    const breadcrumbItems = [
      {
        label: this.props.language === LANGUAGES.VI ? "Trang chủ" : "Home",
        to: "/home",
      },
      {
        label:
          this.props.language === LANGUAGES.VI ? "Chuyên khoa" : "Specialty",
        to: "/specialty",
      },
      {
        label:
          specialty && specialty.name
            ? specialty.name
            : this.props.language === LANGUAGES.VI
              ? "Chi tiết chuyên khoa"
              : "Specialty Detail",
      },
    ];

    return (
      <>
        <HomeHeader />
        <div className="booking-container">
          <div className="detail-specialty-container">
            <div className="description-specialty">
              <Breadcrumb
                items={breadcrumbItems}
                containerClassName="booking-container"
              />
              {specialty && (
                <div className="description-content-up">
                  <div
                    className="description-bg"
                    style={{ backgroundImage: backgroundImage }}
                  ></div>

                  <div className="description-content-text">
                    <div
                      className="specialty-desc-html"
                      style={
                        isShowDetail
                          ? {}
                          : { maxHeight: "150px", overflow: "hidden" }
                      }
                      dangerouslySetInnerHTML={{
                        __html:
                          specialty.descriptionHTML || "<i>Chưa có mô tả</i>",
                      }}
                    />

                    <div className="view-more-container">
                      <span
                        onClick={() => this.handleShowHideDetail()}
                        className="view-more-btn"
                      >
                        {isShowDetail
                          ? intl.formatMessage({
                              id: "specialty.detail-specialty.hide-detail",
                            })
                          : intl.formatMessage({
                              id: "specialty.detail-specialty.see-more",
                            })}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DoctorCard
              specialtyId={specialty ? specialty.id : null}
              doctorIds={doctorIds}
            />
          </div>
        </div>
      </>
    );
  }
}

export default withRouter(injectIntl(DetailSpecialty));