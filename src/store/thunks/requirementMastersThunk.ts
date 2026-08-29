import { createApiThunk } from "./createApiThunk";

import { url } from "../../services/apiConfig";

import type {
  MastersRequest,
  MastersResponse,
} from "../../types/drs.types";

/**
 * Fetches cascading Requirement Management options without updating the
 * application-wide masterData slice.
 *
 * Keep this action type separate from `drs/masters`. The master slice listens
 * only to mastersThunk, so this limited API response is returned to the
 * Requirement Management component through `unwrap()` and remains local.
 */
export const requirementMastersThunk = createApiThunk<
  MastersResponse,
  MastersRequest
>(
  "drs/requirementMasters",
  { url: url("masters"), method: "POST" },
);