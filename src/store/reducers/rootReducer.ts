import {combineReducers} from 'redux';
import { connectRouter } from "connected-react-router";
import appReducer from "./appReducer";
import userReducer from "./userReducer";
import adminReducer from "./adminReducer";
import autoMergeLevel2 from "redux-persist/lib/stateReconciler/autoMergeLevel2";
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";
import { History } from "history";

const persistCommonConfig = {
  storage: storage,
  stateReconciler: autoMergeLevel2,
};
const appPersistConfig = {
  ...persistCommonConfig,
  key: "app",
  whitelist: ["language"],
};

const userPersistConfig = {
  ...persistCommonConfig,
  key: "user",
  whitelist: ["isLoggedIn", "userInfo", "language"],
};

const rootReducer = (history: History) =>
  combineReducers({
    router: connectRouter(history),
    user: persistReducer(userPersistConfig, userReducer),
    app: persistReducer(appPersistConfig, appReducer),
    admin: adminReducer,
  });

export default rootReducer;