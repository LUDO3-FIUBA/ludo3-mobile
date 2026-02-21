import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { TeacherCommission } from '../../models/TeacherCommission';
import { TeacherModel } from '../../models/TeacherModel';
import teacherCommissionsRepository from '../../repositories/teacherCommissions';
import { SessionManager } from '../../managers';
import { decodeJWT } from '../../utils/decodeJWT';
import User from '../../models/User';

interface UserDataState {
  data: TeacherModel | null;
  commissions: TeacherCommission[]
  loading: boolean
  error: string | null;
}

const initialState: UserDataState = {
  data: null,
  commissions: [],
  loading: false,
  error: null,
};

export const fetchTeacherCommissionsAsync = createAsyncThunk(
  'teacherUserData/fetchTeacherCommissions',
  async () => {
    try {
      return await teacherCommissionsRepository.fetchAll()
    } catch (error) {
      throw new Error('Failed to fetch semester data');
    }
  }
);

export const fetchUserDataAsync = createAsyncThunk(
  'teacherUserData/fetchData',
  async (user: User) => {
    try {
      const accessToken = SessionManager.getInstance()!.getAuthToken();
      const decoded = decodeJWT(accessToken);
      return { user: user.toObject(), userId: decoded["user_id"] };
    } catch (error) {
      throw new Error('Failed to fetch user data');
    }
  }
);


const teacherUserDataSlice = createSlice({
  name: 'teacherUserData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherCommissionsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTeacherCommissionsAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.commissions = action.payload;
      })
      .addCase(fetchTeacherCommissionsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching teacher commissions data';
      })
      .addCase(fetchUserDataAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDataAsync.fulfilled, (state, action) => {
        const dataAsTeacher: TeacherModel = {
          id: action.payload.userId,
          firstName: action.payload.user.firstName,
          lastName: action.payload.user.lastName,
          dni: action.payload.user.dni,
          email: action.payload.user.email,
          padron: action.payload.user.studentId,
        } as TeacherModel

        state.loading = false;
        state.data = dataAsTeacher;
      })
      .addCase(fetchUserDataAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching user data';
      });;
  },
});

export const selectUserData = (state: RootState) => state.teacherUserData.data;
export const selectTeacherCommissions = (state: RootState) => state.teacherUserData.commissions;
export const selectTeacherLoading = (state: RootState) => state.teacherUserData.loading;
export const selectTeacherError = (state: RootState) => state.teacherUserData.error;

export default teacherUserDataSlice.reducer;
