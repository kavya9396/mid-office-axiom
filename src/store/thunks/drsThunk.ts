import { url } from "../../services/apiConfig";
import type { DRSResponse, DRSViewRequest } from "../../types/drs.types";
import { createApiThunk } from "./createApiThunk";

/*
 * Used when initially loading/viewing DRS data.
 */
export const drsThunk = createApiThunk<DRSResponse, DRSViewRequest>(
  "drs/view",
  {
    url: url("drs"),
    method: "POST",
  },
);

/*
 * The PUT API receives the complete inner DRS object.
 * DRSResponse["data"] matches state.drs.data, so it also contains the
 * updated requirementManagement array passed by RequirementManagement.
 */
export type DRSUpdateRequest = NonNullable<DRSResponse["data"]>;

export const updateDrsThunk = createApiThunk<
  DRSResponse,
  DRSUpdateRequest
>(
  "drs/update",
  {
    url: url("drs"),
    method: "PUT",
  },
);