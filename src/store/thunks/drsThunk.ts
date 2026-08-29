import { url } from "../../services/apiConfig";
import type { DRSResponse, DRSViewRequest } from "../../types/drs.types";
import { createApiThunk } from "./createApiThunk";

type BusinessAwareRequest<T> = T & {
  businessType: string;
};

/*
 * Used when initially loading/viewing DRS data.
 */
export const drsThunk = createApiThunk<
  DRSResponse,
  BusinessAwareRequest<DRSViewRequest>
>("drs/view", {
  url: (request) => url("drs", request.businessType),
  method: "POST",
});

/*
 * The PUT API receives the complete inner DRS object.
 * DRSResponse["data"] matches state.drs.data, so it also contains the
 * updated requirementManagement array passed by RequirementManagement.
 */
export type DRSUpdateRequest = NonNullable<DRSResponse["data"]> & {
  businessType: string;
};

export const updateDrsThunk = createApiThunk<DRSResponse, DRSUpdateRequest>(
  "drs/update",
  {
    url: (request) => url("drs", request.businessType),
    method: "PUT",
  },
);