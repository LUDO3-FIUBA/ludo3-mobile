import { configureStore } from '@reduxjs/toolkit';
import filterSlice from './reducers/filterSlice';
import counterSlice from './reducers/counterSlice';
import teacherSemesterSlice from './reducers/teacherSemesterSlice';
import teacherStaffSlice from './reducers/teacherStaffSlice';
import teacherUserDataSlice from './reducers/teacherUserDataSlice';

const rootReducer = {
  counter: counterSlice,
  filter: filterSlice,
  teacherSemester: teacherSemesterSlice,
  teacherStaff: teacherStaffSlice,
  teacherUserData: teacherUserDataSlice,
};

const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
