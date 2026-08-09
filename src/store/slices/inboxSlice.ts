import type { UserContextResponse } from '../../types/inbox';
import { fetchInboxThunk } from '../thunks/inboxThunk';
import { createSlice } from "@reduxjs/toolkit";

interface InboxState {
  data: UserContextResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: InboxState = {
  data: null,
  loading: false,
  error: null,
};

const inboxSlice = createSlice({
  name: "inbox",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInboxThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInboxThunk.fulfilled, (state, action) => {
        console.log("FULL PAYLOAD:", action.payload);
        state.loading = false;
        state.data = action.payload; // or action.payload.data depending on API
      })
      .addCase(fetchInboxThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? null;
      });
  },
});

export default inboxSlice.reducer;
