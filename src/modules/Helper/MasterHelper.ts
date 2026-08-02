import type { AppDispatch } from "../../store/store";
import { masterThunk } from "../../store/thunks/masterThunk";
import type { MasterRequest, MasterResponse } from "../../types/drs.types";

const MASTER_KEY = "masterData";

export const loadMasterData = async (
  dispatch: AppDispatch,
  payload:MasterRequest
): Promise<MasterResponse | null> => {

  const storedMaster = sessionStorage.getItem(MASTER_KEY);

  // Already available
  if (storedMaster) {
    return JSON.parse(storedMaster);
  }

  // Call thunk
  const result = await dispatch(masterThunk(payload));

  if (masterThunk.fulfilled.match(result)) {

    sessionStorage.setItem(
      MASTER_KEY,
      JSON.stringify(result.payload)
    );

    return result.payload;
  }

  return null;
};
