import { createSlice } from '@reduxjs/toolkit';

const TOKEN_KEY = 'mb_access_token';

const initialState = {
  user: null,
  accessToken: localStorage.getItem(TOKEN_KEY) || null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      if (user !== undefined) state.user = user;
      if (accessToken !== undefined) {
        state.accessToken = accessToken;
        localStorage.setItem(TOKEN_KEY, accessToken);
      }
      state.isAuthenticated = true;
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem(TOKEN_KEY);
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
