import { logger } from "redux-logger";

import {
  configureStore,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { createStateSyncMiddleware } from 'redux-state-sync';
import { persistStore } from 'redux-persist';

import rootReducer from "store/reducers/rootReducer";
import { publicApi } from "store/api/publicApi";
import {
  processLogout,
  userLoginSuccessAction,
} from "store/slices/userSlice";

const environment = import.meta.env.MODE || "development";
let isDevelopment = environment === "development";

isDevelopment = false;

const reduxStateSyncConfig = {
  whitelist: [processLogout.type],
};

// API responses that depend on the authenticated user must never survive a
// login switch.  RTK Query keys are based on endpoint arguments, so two
// accounts requesting the same writer page would otherwise share the same
// cached result.  Clear the API cache at the auth boundary; active queries
// will be re-created by their hooks with the new token.
const authCacheListener = createListenerMiddleware();

authCacheListener.startListening({
  actionCreator: userLoginSuccessAction,
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(publicApi.util.resetApiState());
  },
});

authCacheListener.startListening({
  actionCreator: processLogout,
  effect: async (_action, listenerApi) => {
    listenerApi.dispatch(publicApi.util.resetApiState());
  },
});

const middleware: any[] = [createStateSyncMiddleware(reduxStateSyncConfig)];
if (isDevelopment) middleware.push(logger);

const reduxStore = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      publicApi.middleware,
      authCacheListener.middleware,
      ...middleware,
    ),
  devTools: isDevelopment,
});

// Required by RTK Query for refetch-on-focus/reconnect and focus-aware polling.
setupListeners(reduxStore.dispatch);

export const dispatch = reduxStore.dispatch;
export type AppDispatch = typeof reduxStore.dispatch;
export type RootState = ReturnType<typeof reduxStore.getState>;

export const persistor = persistStore(reduxStore);

export default reduxStore;
