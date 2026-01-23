import React, { Component } from 'react';
import { connect } from "react-redux";
import Slider from "react-slick";
import { FormattedMessage } from "react-intl";
import { handleGetAllSpecialties } from "../../../services/specialtyService";
import { withRouter } from "react-router";
import SectionItem from "./SectionItem";

class Specialty extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSpecialty: [],
    };
  }

  componentDidMount() {
    this.getAllSpecialties();
  }

  getAllSpecialties = async () => {
    let res = await handleGetAllSpecialties(6);
    if (res && res.errCode === 0) {
      this.setState({
        dataSpecialty: res.data ? res.data : [],
      });
    }
  };

  handleViewDetailSpecialty = (item) => {
    if (this.props.history) {
      this.props.history.push(`/specialty/detail-specialty/${item.id}`);
    }
  };
  handleViewAllSpecialty = (item) => {
    if (this.props.history) {
      this.props.history.push(`/specialty`);
    }
  };
  render() {
    let { dataSpecialty } = this.state;

    return (
      <div className="section-share section-specialty">
        <div className="booking-container">
          <div className="section-container">
            <div className="section-header">
              <span className="title-section">
                <FormattedMessage id="home-header.popular-speciality" />
              </span>
              <button
                className="btn-section"
                onClick={this.handleViewAllSpecialty}
              >
                <FormattedMessage id="home-header.see-more" />
              </button>
            </div>
            <div className="section-body">
              <Slider {...this.props.settings}>
                {dataSpecialty &&
                  dataSpecialty.length > 0 &&
                  dataSpecialty.map((item, index) => {
                    return (
                      <SectionItem
                        key={index}
                        item={item}
                        isCircular={false}
                        onClick={this.handleViewDetailSpecialty}
                      />
                    );
                  })}
              </Slider>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Specialty)
);