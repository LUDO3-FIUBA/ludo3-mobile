import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import teacherStaffRepository from '../../repositories/teacherStaff';
import { TeacherTuple } from '../../models/TeacherTuple';
import { TeacherModel } from '../../models/TeacherModel';
import { RootState } from '../store';

interface State {
  staffTeachers: TeacherTuple[];
  allTeachers: TeacherModel[];
  isLoading: boolean;
  error: any;
}

const initialState: State = {
  allTeachers: [],
  staffTeachers: [],
  isLoading: false,
  error: null,
};

export const updateTeacherInCommission = createAsyncThunk(
  'teacherStaff/updateRole',
  async ({ commissionId, teacherId, newRole, newWeight }: any, { rejectWithValue }) => {
    try {
      const response = await teacherStaffRepository.modifyRoleOfTeacherInCommission(commissionId, teacherId, newRole, newWeight);
      return { teacherId, newRole, newWeight };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTeachers = createAsyncThunk(
  'teacherStaff/fetchTeachers',
  async (commissionId: number, { rejectWithValue }) => {
    try {
      const allTeachers: TeacherModel[] = await teacherStaffRepository.fetchAllTeachers();
      const staffTeachers: TeacherTuple[] = await teacherStaffRepository.fetchTeachersOfCommission(commissionId);
      return { allTeachers, staffTeachers };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch teachers');
    }
  }
);

export const addTeacherRoleToCommission = createAsyncThunk(
  'teacherStaff/addTeacherRoleToCommission',
  async ({ commissionId, teacherId, role }: { commissionId: number; teacherId: number; role: string; }, { rejectWithValue }) => {
    try {
      const response = await teacherStaffRepository.createRoleForTeacherInCommission(commissionId, teacherId, role);
      console.log('Response from adding teacher role to commission', response);
      return response;
    } catch (error: any) {
      console.log('Error adding teacher role to commission', error.message);
      return rejectWithValue(error.message);
    }
  }
);

export const teacherStaffSlice = createSlice({
  name: 'teacherStaff',
  initialState,
  reducers: {
    modifyTeacherRoleLocally: (state, action) => {
      const { teacherDNI, newRole } = action.payload;
      state.staffTeachers = state.staffTeachers.map(teacher =>
        teacher.teacher.dni === teacherDNI ? { ...teacher, role: newRole } : teacher
      );
    },
    modifyTeacherWeightLocally: (state, action) => {
      const { teacherDNI, newWeight } = action.payload;
      state.staffTeachers = state.staffTeachers.map(teacher =>
        teacher.teacher.dni === teacherDNI ? { ...teacher, graderWeight: newWeight } : teacher
      );
    },
    modifyChiefTeacherWeightLocally: (state, action) => {
      const { newWeight } = action.payload;
      state.staffTeachers = state.staffTeachers.map(teacher =>
        ({ ...teacher, commission: { ...teacher.commission, chiefTeacherGraderWeight: newWeight } })
      );
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeachers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTeachers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffTeachers = action.payload.staffTeachers;
        state.allTeachers = action.payload.allTeachers;
      })
      .addCase(fetchTeachers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(addTeacherRoleToCommission.fulfilled, (state, action) => {
        console.log('Teacher role added to commission', action.payload);
        state.staffTeachers.push(action.payload as TeacherTuple);
      })
      .addCase(updateTeacherInCommission.fulfilled, (state, action) => {
        const { teacherId, newRole, newWeight } = action.payload;
        const index = state.staffTeachers.findIndex(teacher => teacher.teacher.id === teacherId);
        if (index !== -1) {
          state.staffTeachers[index].role = newRole;
          state.staffTeachers[index].graderWeight = newWeight;
        }
      });
  },
});

export const { modifyTeacherRoleLocally, modifyTeacherWeightLocally, modifyChiefTeacherWeightLocally } = teacherStaffSlice.actions;

export const selectStaffTeachers = (state: RootState) => state.teacherStaff.staffTeachers;

export default teacherStaffSlice.reducer;
