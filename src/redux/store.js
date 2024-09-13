import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./reducers/authReducer";

const store = configureStore({
  reducer: {
    authSlice: authSlice,
  },
});

export const RootState = store.getState;
export const AppDispatch = store.dispatch;
export default store;
