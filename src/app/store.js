// Redux Store
import { configureStore } from "@reduxjs/toolkit";

// Slices
import { modalReducer } from "@/features/modal";

export default configureStore({
  reducer: {
    modal: modalReducer,
  },
});
