import { configureStore } from '@reduxjs/toolkit';
import filterSlice from './reducers/filterSlice';
import counterSlice from './reducers/counterSlice';
import teacherSemesterSlice from './reducers/teacherSemesterSlice';
import teacherStaffSlice from './reducers/teacherStaffSlice';
import teacherUserDataSlice from './reducers/teacherUserDataSlice';
import currentUserSlice from './reducers/currentUserSlice';

const rootReducer = {
  counter: counterSlice,
  filter: filterSlice,
  teacherSemester: teacherSemesterSlice,
  teacherStaff: teacherStaffSlice,
  teacherUserData: teacherUserDataSlice,
  currentUser: currentUserSlice,
};

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
