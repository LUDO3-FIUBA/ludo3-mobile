import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPresentSemesterFromCommissionId } from '../../repositories/teacherSemesters';
import { TeacherSemester } from '../../models/TeacherSemester';
import { RootState } from '../store';
import teacherSemestersRepository from '../../repositories/teacherSemesters';
import { ClassAttendance } from '../../models/ClassAttendance';
import { TeacherStudent } from '../../models/TeacherStudent';

interface SemesterState {
  data: TeacherSemester | null;
  attendances: ClassAttendance[];
  loading: boolean;
  error: string | null;
}

const initialState: SemesterState = {
  data: null,
  attendances: [],
  loading: false,
  error: null,
};

export const fetchSemesterDataAsync = createAsyncThunk(
  'teacherSemester/fetchData',
  async (commissionId: number) => {
    try {
      const semester: TeacherSemester = await fetchPresentSemesterFromCommissionId(commissionId);
      console.log("Semester:", semester);
      const attendances: ClassAttendance[] = await teacherSemestersRepository.getSemesterAttendances(semester.id);
      const sortedAttendances = [...attendances].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return { semester, attendances: sortedAttendances };
    } catch (error) {
      throw new Error('Failed to fetch semester data');
    }
  }
);

export const fetchSemesterAttendances = createAsyncThunk(
  'teacherSemester/fetchSemesterAttendances',
  async (semesterId: number) => {
    try {
      const attendances: ClassAttendance[] = await teacherSemestersRepository.getSemesterAttendances(semesterId);
      const sortedAttendances = [...attendances].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return { attendances: sortedAttendances };
    } catch (error) {
      throw new Error('Failed to fetch semester attendances');
    }
  }
);

const teacherSemesterSlice = createSlice({
  name: 'teacherSemester',
  initialState,
  reducers: {
    modifyStudentsOfASemester: (state, action) => {
      const students: TeacherStudent[] = action.payload;
      if (state.data) {
        state.data.students = students;
      }
    },
    modifySemesterDetails: (state, action) => {
      const { classesAmount, minimumAttendance } = action.payload;
      if (state.data) {
        state.data.classesAmount = classesAmount;
        state.data.minimumAttendance = minimumAttendance;
      }
    },
    modifyChiefTeacherWeightInSemester: (state, action) => {
      const { newWeight } = action.payload;
      if (state.data) {
        state.data.commission.chiefTeacherGraderWeight = newWeight;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSemesterDataAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.data = null;
        state.attendances = [];
      })
      .addCase(fetchSemesterDataAsync.fulfilled, (state, action) => {
        state.loading = false;
        const { attendances, semester } = action.payload;
        state.data = semester;
        state.attendances = attendances;
      })
      .addCase(fetchSemesterDataAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching semester data';
      })
      .addCase(fetchSemesterAttendances.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSemesterAttendances.fulfilled, (state, action) => {
        state.loading = false;
        const { attendances } = action.payload;
        state.attendances = attendances;
      })
      .addCase(fetchSemesterAttendances.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Error fetching semester data';
      });
  },
});

export const { modifyStudentsOfASemester, modifySemesterDetails, modifyChiefTeacherWeightInSemester } = teacherSemesterSlice.actions;

export const selectSemesterData = (state: RootState) => state.teacherSemester.data;
export const selectSemesterAttendances = (state: RootState) => state.teacherSemester.attendances;
export const selectSemesterLoading = (state: RootState) => state.teacherSemester.loading;
export const selectSemesterError = (state: RootState) => state.teacherSemester.error;

export default teacherSemesterSlice.reducer;
