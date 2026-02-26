import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import * as actions from "../../store/actions";
import Navigator from '../../components/Navigator';
import { adminMenu, doctorMenu } from "./menuApp";
import { LANGUAGES, USER_ROLE } from "../../utils";
import { changeLanguageApp } from "../../store/actions/appActions";
import "./Header.scss";
import { FormattedMessage } from "react-intl";
import _ from "lodash";
import { IRootState, IMenuGroup } from "../../types";

// Header chuyển sang Function Component + Hooks
const Header: React.FC = () => {
  const dispatch = useDispatch();
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const language = useSelector((state: IRootState) => state.app.language);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);

  const [menuApp, setMenuApp] = useState<IMenuGroup[]>([]);

  useEffect(() => {
    let menu: IMenuGroup[] = [];
    if (userInfo && !_.isEmpty(userInfo)) {
      let role = userInfo.roleId;
      if (role === USER_ROLE.ADMIN) {
        menu = adminMenu;
      }
      if (role === USER_ROLE.DOCTOR) {
        menu = doctorMenu;
      }
    }
    setMenuApp(menu);
  }, [userInfo]);

  const handleChangeLanguage = useCallback((lang: string) => {
    dispatch(changeLanguageApp(lang));
  }, [dispatch]);

  const processLogout = useCallback(() => {
    dispatch(actions.processLogout());
  }, [dispatch]);

  return (
    <div className="header-container">
      <div className="header-tabs-container">
        <Navigator menus={menuApp} />
      </div>
      <div className="languages">
        <span className="welcome">
          <FormattedMessage id="home-header.welcome" />
          {userInfo && userInfo.lastName ? userInfo.lastName : ""}
        </span>
        <span
          className={
            language === LANGUAGES.VI ? "language-vi active" : "language-vi"
          }
          onClick={() => handleChangeLanguage(LANGUAGES.VI)}
        >
          VN
        </span>
        <span
          className={
            language === LANGUAGES.EN ? "language-en active" : "language-en"
          }
          onClick={() => handleChangeLanguage(LANGUAGES.EN)}
        >
          EN
        </span>
        <div
          className="btn btn-logout"
          onClick={processLogout}
          title="Log out"
        >
          <i className="fas fa-sign-out-alt"></i>
        </div>
      </div>
    </div>
  );
};

export default Header;
