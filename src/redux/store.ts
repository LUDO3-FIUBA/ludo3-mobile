import { configureStore } from '@reduxjs/toolkit';
import filterSlice from './reducers/filterSlice';
import counterSlice from './reducers/counterSlice';

const rootReducer = {
  counter: counterSlice,
  filter: filterSlice
};

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
