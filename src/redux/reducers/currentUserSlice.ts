import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface CurrentUserState {
  // `undefined` means "not loaded yet" so consumers can fall back to their own
  // fetched value; `string | null` is a known photo (or known to be absent).
  profilePhoto: string | null | undefined;
}

const initialState: CurrentUserState = {
  profilePhoto: undefined,
};

const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState,
  reducers: {
    setProfilePhoto(state, action: PayloadAction<string | null>) {
      state.profilePhoto = action.payload;
    },
  },
});

export const { setProfilePhoto } = currentUserSlice.actions;

export const selectCurrentUserProfilePhoto = (state: RootState) => state.currentUser.profilePhoto;

export default currentUserSlice.reducer;
