import React, { Fragment, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { ConnectedRouter as Router } from "connected-react-router";
import { history } from "../reduxStore";
import { ToastContainer } from "react-toastify";
import {
  userIsAuthenticated,
  userIsNotAuthenticated,
  userIsAdmin,
  userIsDoctorOrAdmin,
} from "../hoc/authentication";
import Doctor from "../routes/Doctor";

import { path } from "../utils";
import { IRootState } from "../types";

import Home from "../routes/Home";
import Login from "./Auth/Login";
import System from "../routes/System";
import HomePage from "./HomePage/HomePage";
import CustomScrollbars from "../components/CustomScrollbars";
import DetailDoctor from "./Patient/Doctor/DetailDoctor";
import BookingDoctor from "./Patient/Booking/BookingDoctor";
import VerifyEmail from "./Patient/VerifyEmail";
import SpecialtyList from "./Patient/Specialty/SpecialtyList";
import detailSpecialty from "./Patient/Specialty/DetailSpecialty";
import detailClinic from "./Patient/Clinic/DetailClinic";
import ClinicList from "./Patient/Clinic/ClinicList";
import TopDoctorList from "./Patient/Doctor/TopDoctorList";
import PatientProfile from "./Patient/Profile/PatientProfile";
import PatientHistory from "./Patient/History/PatientHistory";

interface IAppProps {
  persistor: any;
  onBeforeLift?: () => Promise<void>;
}

// App chuyển sang Function Component + Hooks
const App: React.FC<IAppProps> = ({ persistor, onBeforeLift }) => {
  const started = useSelector((state: IRootState) => state.app.started);
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);
  const [bootstrapped, setBootstrapped] = useState(false);

  const handlePersistorState = useCallback(() => {
    let { bootstrapped: bsState } = persistor.getState();
    if (bsState) {
      if (onBeforeLift) {
        Promise.resolve(onBeforeLift())
          .then(() => setBootstrapped(true))
          .catch(() => setBootstrapped(true));
      } else {
        setBootstrapped(true);
      }
    }
  }, [persistor, onBeforeLift]);

  useEffect(() => {
    handlePersistorState();
  }, [handlePersistorState]);

  return (
    <Fragment>
      <Router history={history}>
        <div className="main-container">
          <div className="content-container">
            <CustomScrollbars style={{ height: "100vh", width: "100%" }}>
              <Switch>
                <Route path={path.HOME} exact component={Home} />
                <Route
                  path={path.LOGIN}
                  component={userIsNotAuthenticated(Login)}
                />
                <Route path={path.SYSTEM} component={userIsAdmin(System)} />
                <Route
                  path={path.DETAIL_SPECIALTY}
                  component={detailSpecialty}
                />
                <Route
                  path={path.LIST_SPECIALTY}
                  exact
                  component={SpecialtyList}
                />

                <Route
                  path={"/doctor"}
                  component={userIsDoctorOrAdmin(Doctor)}
                />
                <Route path={path.HOMEPAGE} component={HomePage} />
                <Route path={path.DETAIL_DOCTOR} component={DetailDoctor} />
                <Route path={path.BOOKING_DOCTOR} component={BookingDoctor} />
                <Route
                  path={path.VERIFY_EMAIL_BOOKING}
                  component={VerifyEmail}
                />
                <Route path={path.LIST_CLINIC} exact component={ClinicList} />
                <Route path={path.DETAIL_CLINIC} component={detailClinic} />
                <Route
                  path={path.LIST_TOP_DOCTOR}
                  exact
                  component={TopDoctorList}
                />
                <Route
                  path={path.PATIENT_PROFILE}
                  component={userIsAuthenticated(PatientProfile)}
                />
                <Route
                  path={path.PATIENT_HISTORY}
                  component={userIsAuthenticated(PatientHistory)}
                />
              </Switch>
            </CustomScrollbars>
          </div>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </Fragment>
  );
};

export default App;
