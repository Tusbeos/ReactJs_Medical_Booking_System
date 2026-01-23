import React, { Component } from "react";
import { connect } from "react-redux";
import HomeHeader from "containers/HomePage/HomeHeader";
import HomeFooter from "containers/HomePage/HomeFooter";
import "./DetailClinic.scss";
import { FormattedMessage } from "react-intl";
import { getDetailClinicById } from "../../../services/clinicService";
import { getDoctorsByClinicId } from "../../../services/doctorService";
import { getBase64FromBuffer } from "../../../utils/CommonUtils";
import DoctorCard from "../../../components/Patient/DoctorCard";
const HEADER_SELECTOR = "h2";

class DetailClinic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      clinic: {},
      notFound: false,
      doctorIds: [],
      tableOfContents: [],
    };

    this.introRef = React.createRef();
    this.doctorsRef = React.createRef();
    this.contentRef = React.createRef();
  }

  async componentDidMount() {
    const idFromParams =
      this.props.match && this.props.match.params && this.props.match.params.id
        ? this.props.match.params.id
        : null;
    const idFromState = this.props.location?.state?.clinicId || null;
    const id = idFromParams || idFromState;

    if (id) {
      try {
        let res = await getDetailClinicById(id);
        if (res && res.errCode === 0 && res.data) {
          this.setState({ clinic: res.data, notFound: false });
        } else {
          this.setState({ notFound: true });
        }

        const doctorRes = await getDoctorsByClinicId(id);
        if (
          doctorRes &&
          doctorRes.errCode === 0 &&
          Array.isArray(doctorRes.data)
        ) {
          this.setState({ doctorIds: doctorRes.data });
        } else {
          this.setState({ doctorIds: [] });
        }
      } catch (e) {
        this.setState({ notFound: true });
      }
    } else {
      this.setState({ notFound: true });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.clinic !== prevState.clinic &&
      this.state.clinic.descriptionHTML
    ) {
      setTimeout(() => this.buildTableOfContents(), 100);
    }
  }

  normalizeString = (str) => {
    if (!str) return "";
    return str.toLowerCase().trim().replace(/\s+/g, " ");
  };

  buildTableOfContents = () => {
    const container = this.contentRef.current;
    if (!container) return;

    const headers = container.querySelectorAll(HEADER_SELECTOR);
    const toc = [];
    const ignoredKeywords = [
      "giới thiệu",
      "thế mạnh chuyên môn",
      "đặt lịch khám",
    ];

    headers.forEach((header, index) => {
      const originalText = header.innerText || "";
      const cleanText = this.normalizeString(originalText);

      if (cleanText.length === 0 || cleanText.length > 150) return;
      if (ignoredKeywords.some((keyword) => cleanText.includes(keyword)))
        return;

      toc.push({ title: originalText, originalIndex: index });
    });

    this.setState({ tableOfContents: toc });
  };

  handleScrollTo = (key, originalIndex = null) => {
    let element = null;
    const container = this.contentRef.current;

    const findHeaderByKeywords = (keywords = []) => {
      if (!container) return null;
      const headers = container.querySelectorAll(HEADER_SELECTOR);
      const normalizedKeywords = keywords.map((kw) => this.normalizeString(kw));
      return Array.from(headers).find((header) => {
        const text = this.normalizeString(header.innerText || "");
        return normalizedKeywords.some((kw) => text.includes(kw));
      });
    };

    if (key === "intro") {
      element = findHeaderByKeywords(["giới thiệu"]) || this.introRef.current;
    } else if (key === "doctors") {
      element =
        findHeaderByKeywords(["thế mạnh", "chuyên môn"]) ||
        this.doctorsRef.current;
    } else if (key === "markdown" && originalIndex !== null) {
      if (container) {
        const headers = container.querySelectorAll(HEADER_SELECTOR);
        if (headers && headers[originalIndex]) element = headers[originalIndex];
      }
    }

    if (element) {
      const wrapper = document.querySelector(".custom-scrollbar");
      let scrollContainer = document.documentElement;

      if (wrapper) {
        const innerDiv = wrapper.firstElementChild;
        if (innerDiv) {
          scrollContainer = innerDiv;
        }
      }
      const headerOffset = 100;
      const elementTop = element.getBoundingClientRect().top;
      const containerTop = scrollContainer.getBoundingClientRect
        ? scrollContainer.getBoundingClientRect().top
        : 0;
      const currentScroll = scrollContainer.scrollTop || 0;

      const targetScroll =
        currentScroll + (elementTop - containerTop) - headerOffset;

      if (scrollContainer && scrollContainer.scrollTo) {
        scrollContainer.scrollTo({ top: targetScroll, behavior: "smooth" });
      }
    }
  };

  render() {
    const { clinic, notFound, doctorIds, tableOfContents } = this.state;

    if (notFound) {
      return (
        <div className="detail-clinic-wrapper">
          <HomeHeader />
          <div className="not-found-msg">
            <FormattedMessage id="clinic-detail.notFound" />
          </div>
        </div>
      );
    }
    let coverUrl = getBase64FromBuffer(clinic.imageCover);
    let logoUrl = getBase64FromBuffer(clinic.image);

    return (
      <div className="detail-clinic-wrapper">
        <HomeHeader />
        <div className="clinic-hero-container">
          <div
            className="hero-cover"
            style={{ backgroundImage: `url(${coverUrl})` }}
          >
            <div className="overlay-gradient"></div>
            <div className="hero-content booking-container">
              <div className="profile-box">
                <div
                  className="clinic-logo"
                  style={{ backgroundImage: `url(${logoUrl})` }}
                ></div>
                <div className="clinic-info-header">
                  <h1 className="clinic-name-hero">{clinic.name}</h1>
                  <p className="clinic-addr-hero">
                    <i className="fas fa-map-marker-alt"></i> {clinic.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="clinic-nav-tabs">
          <div className="booking-container">
            <div className="tab-list">
              <span
                className="tab-item"
                onClick={() => this.handleScrollTo("intro")}
              >
                Giới thiệu
              </span>
              <span
                className="tab-item"
                onClick={() => this.handleScrollTo("doctors")}
              >
                Thế mạnh chuyên môn
              </span>
              {tableOfContents &&
                tableOfContents.map((item, i) => (
                  <span
                    key={i}
                    className="tab-item"
                    onClick={() =>
                      this.handleScrollTo("markdown", item.originalIndex)
                    }
                  >
                    {item.title}
                  </span>
                ))}
            </div>
          </div>
        </div>

        <div className="clinic-body-section">
          <div className="booking-container">
            <div className="intro-section" ref={this.introRef}>
              <div className="notice-box-yellow">
                <strong>BookingCare</strong> là Nền tảng Y tế chăm sóc sức khỏe
                toàn diện...
              </div>
              <div className="info-box-blue">
                <p>
                  Từ nay, người bệnh có thể đặt lịch tại{" "}
                  <strong>{clinic.name}</strong>...
                </p>
                <ul>
                  <li>
                    Được lựa chọn các giáo sư, tiến sĩ, bác sĩ chuyên khoa giàu
                    kinh nghiệm
                  </li>
                  <li>
                    Hỗ trợ đặt khám trực tuyến trước khi đi khám (miễn phí đặt
                    lịch)
                  </li>
                </ul>
              </div>
            </div>
            <div ref={this.doctorsRef}>
              <DoctorCard
                clinicId={clinic && clinic.id ? clinic.id : null}
                doctorIds={doctorIds}
              />
            </div>
            <div className="clinic-html-content" ref={this.contentRef}>
              {clinic.descriptionHTML && (
                <div
                  dangerouslySetInnerHTML={{ __html: clinic.descriptionHTML }}
                ></div>
              )}
            </div>
          </div>
        </div>
        <HomeFooter />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({ language: state.app.language });
export default connect(mapStateToProps)(DetailClinic);