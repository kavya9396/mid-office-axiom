import type { AppDispatch, RootState } from "../store";
import { DRS_MASTER_KEYS } from "../../modules/DRS/drsMasters";
import { getSessionMasters, normalizeMastersData, saveSessionMasters } from "../../utils/masterDataSession";
import { setMastersData } from "../slices/drsSlice";
import { mastersThunk } from "./mastersThunk";

const hasMasters = (masters: RootState["drs"]["masters"]): boolean =>
  Object.keys(masters ?? {}).length > 0;

export const fetchMastersForSession = () => async (
  dispatch: AppDispatch,
  getState: () => RootState,
) => {
  const cachedMasters = getSessionMasters();
  if (cachedMasters && hasMasters(cachedMasters)) {
    if (!hasMasters(getState().drs.masters)) {
      dispatch(setMastersData(cachedMasters));
    }
    return cachedMasters;
  }

  const response = await dispatch(
    mastersThunk({
      types: DRS_MASTER_KEYS,
    }),
  ).unwrap();
  const masters = normalizeMastersData(response.data ?? {});
  saveSessionMasters(masters);

  return masters;
};