import React, { Component } from 'react';
import { connect } from 'react-redux';
import HomeHeader from "./HomeHeader";
import Specialty from "./Section/Specialty";
import OutStandingDoctor from "./Section/OutStandingDoctor";
// import Handbook from "./Section/Handbook";
import About from "./Section/About";
import MedicalFacility from "./Section/MedicalFacility";
import HomeFooter from "./HomeFooter";
import "./HomePage.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const PrevArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} sp-arrow sp-prev`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    >
      <span style={{ fontSize: "20px", fontWeight: "bold" }}>&#10094;</span>
    </div>
  );
};

const NextArrow = (props) => {
  const { className, style, onClick } = props;
  return (
    <div
      className={`${className} sp-arrow sp-next`}
      style={{ ...style, display: "flex" }}
      onClick={onClick}
    >
      <span style={{ fontSize: "20px", fontWeight: "bold" }}>&#10095;</span>
    </div>
  );
};

class HomePage extends Component {
  render() {
    let settings = {
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 2,
      nextArrow: <NextArrow />,
      prevArrow: <PrevArrow />,
      responsive: [
        {
          breakpoint: 1024,
          settings: { slidesToShow: 3, slidesToScroll: 3, infinite: false },
        },
        {
          breakpoint: 768,
          settings: { slidesToShow: 2, slidesToScroll: 2, arrows: false },
        },
      ],
    };

    return (
      <div className="hide-caret">
        <HomeHeader isShowBanner={true} />
        <Specialty settings={settings} />
        <MedicalFacility settings={settings} />
        <OutStandingDoctor settings={settings} />
        {/* <Handbook settings={settings} /> */}

        <About />
        <HomeFooter />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isLoggedIn: state.user.isLoggedIn,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);