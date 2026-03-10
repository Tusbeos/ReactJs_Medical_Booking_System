import React from 'react';
import { useSelector } from "react-redux";
import { Route, Switch } from "react-router-dom";
import ManageSchedule from "containers/System/Doctor/ManageSchedule";
import Header from "containers/Header/Header";
import ManagePatient from "containers/System/Doctor/ManagePatient";
import Prescription from "containers/System/Doctor/Prescription";
import { userIsDoctorOrAdmin } from "../hoc/authentication";
import { IRootState } from "../types";

const Doctor = () => {
  const isLoggedIn = useSelector((state: IRootState) => state.user.isLoggedIn);

  return (
    <React.Fragment>
      {isLoggedIn && <Header />}
      <div className="Doctor-container">
        <div className="Doctor-list">
          <Switch>
            <Route
              path="/doctor/manage-schedule"
              component={userIsDoctorOrAdmin(ManageSchedule)}
            />
            <Route
              path="/doctor/manage-patient"
              component={userIsDoctorOrAdmin(ManagePatient)}
            />
            <Route
              path="/doctor/prescription/:bookingId"
              component={userIsDoctorOrAdmin(Prescription)}
            />
          </Switch>
        </div>
      </div>
    </React.Fragment>
  );
};

export default Doctor;
