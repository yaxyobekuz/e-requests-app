// Redux Store
import { createSlice } from "@reduxjs/toolkit";

const initialModalData = { isOpen: false, data: {}, isLoading: false };

// Initial state
const initialState = {
  profile: initialModalData,
  createAdmin: initialModalData,
  editAdmin: initialModalData,
  assignRegions: initialModalData,
  requestDetail: initialModalData,
  createService: initialModalData,
  editService: initialModalData,
  createMskCategory: initialModalData,
  editMskCategory: initialModalData,
  mskOrderDetail: initialModalData,
  createRegion: initialModalData,
  editRegion: initialModalData,
  serviceReportDetail: initialModalData,
  createRequestType: initialModalData,
  editRequestType: initialModalData,
  createAdminRole: initialModalData,
  editAdminRole: initialModalData,
};

export const modalSlice = createSlice({
  initialState,
  name: "modal",
  reducers: {
    open: (state, action) => {
      const { modal, data } = action.payload;
      if (!state[modal]) return;
      state[modal].isOpen = true;
      state[modal].data = data || {};
    },

    close: (state, action) => {
      const { modal } = action.payload;
      if (!state[modal]) return;
      state[modal].isOpen = false;
      state[modal].data = {};
    },

    updateData: (state, action) => {
      const { modal, data } = action.payload;
      if (!state[modal]) return;
      Object.assign(state[modal].data, data || {});
    },

    updateLoading: (state, action) => {
      const { modal, value } = action.payload;
      if (!state[modal]) return;
      state[modal].isLoading = value;
    },
  },
});

// Export actions
export const { open, close, updateLoading, updateData } = modalSlice.actions;

// Export reducer
export default modalSlice.reducer;
