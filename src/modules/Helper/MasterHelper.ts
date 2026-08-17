import type { AppDispatch } from "../../store/store";
import { masterThunk } from "../../store/thunks/masterThunk";
import type {
  MasterRequest,
  MasterResponse,
} from "../../types/drs.types";

const MASTER_KEY = "masterData";

export const loadMasterData = async (
  dispatch: AppDispatch,
  payload: MasterRequest,
): Promise<MasterResponse> => {
  const result = await dispatch(
    masterThunk(payload),
  ).unwrap();

  sessionStorage.setItem(
    MASTER_KEY,
    JSON.stringify(result),
  );

  return result;
};