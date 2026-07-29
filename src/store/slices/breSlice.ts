import { breThunk } from './../thunks/breThunk';
import { createSlice } from "@reduxjs/toolkit";

interface BreState {
  data: any;
  loading: boolean;
  error: string | null;
}

const initialState: BreState = {
  data: null,
  loading: false,
  error: null,
};

const breSlice = createSlice({
  name: "bre",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(breThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(breThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // or action.payload.data depending on API
      })
      .addCase(breThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

export default breSlice.reducer;
