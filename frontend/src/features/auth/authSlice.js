import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: JSON.parse(localStorage.getItem('rems_user') || 'null'),
  accessToken: localStorage.getItem('rems_access') || null
};

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      localStorage.setItem('rems_user', JSON.stringify(action.payload.user));
      if (action.payload.accessToken) localStorage.setItem('rems_access', action.payload.accessToken);
    },
    logoutLocal(state) {
      state.user = null;
      state.accessToken = null;
      localStorage.removeItem('rems_user');
      localStorage.removeItem('rems_access');
    }
  }
});

export const { setCredentials, logoutLocal } = slice.actions;
export default slice.reducer;

