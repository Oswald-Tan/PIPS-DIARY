import { configureStore } from '@reduxjs/toolkit';
import authReducer from "../features/authSlice";
import balanceReducer from "../features/balanceSlice";
import tradeReducer from "../features/tradeSlice";
import subscriptionReducer from '../features/subscriptionSlice';
import gamificationReducer from '../features/gamificationSlice';
import manualRateReducer from '../features/manualRateSlice';
import userReducer from '../features/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    balance: balanceReducer,
    trades: tradeReducer,
    subscription: subscriptionReducer,
    gamification: gamificationReducer,
    manualRates: manualRateReducer,
    users: userReducer
  },
});
