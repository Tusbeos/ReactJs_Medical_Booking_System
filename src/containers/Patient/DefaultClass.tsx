import React from "react";
import { useSelector } from "react-redux";
import "./DefaultClass.scss";
import { FormattedMessage } from "react-intl";
import { IRootState } from "../../types";

const DefaultClass = () => {
  const language = useSelector((state: IRootState) => state.app.language);

  return <div></div>;
};

export default DefaultClass;
