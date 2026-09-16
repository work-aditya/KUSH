import { createSlice } from '@reduxjs/toolkit';

let nextToastId = 1;

export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toasts: [],
    mobileMenuOpen: false,
  },
  reducers: {
    addToast: (state, action) => {
      const { type = 'info', message, duration = 4000 } = action.payload;
      state.toasts.push({
        id: nextToastId++,
        type,
        message,
        duration,
      });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen;
    },
    closeMobileMenu: (state) => {
      state.mobileMenuOpen = false;
    },
  },
});

export const { addToast, removeToast, toggleMobileMenu, closeMobileMenu } = uiSlice.actions;
export default uiSlice.reducer;
