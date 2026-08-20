import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Pagination,
  Select,
  Snackbar,
  Tooltip,
  Typography,
  type SelectChangeEvent,
} from "@mui/material";

import {
  useEffect,
  useCallback,
  useMemo,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import type { RootState } from "../../../store/store";
import { masterThunk } from "../../../store/thunks/masterThunk";
import { applicantProfileSubmitThunk } from "../../../store/thunks/applicantProfileSubmitThunk";
import { drsThunk } from "../../../store/thunks/drsThunk";
import type {
  AdditionalRequirementRow,
  ApplicantProfileSubmitRequest,
  MasterRequest,
} from "../../../types/drs.types";
import {
  CloseIcon,
  FilterIcon,
} from "../../../icons/Icons";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  markLocalRequirementRowsUnsaved,
  saveLocalRequirementRows,
} from "../../../validations/drsRequirementDecisionValidation";
import { getFinancialPath, getMedicalPath } from "../../../routes/routes";

interface RequirementManagementTableProps {
  requirements: AdditionalRequirementRow[];
  onSave?: (rows: AdditionalRequirementRow[]) => void | Promise<void>;
  onAddRequirement?: () => void;
  addRowSignal?: number;
}

interface MiscMasterItem {
  code?: string;
  description?: string;
  value?: string;
  isActive?: string;
  type?: string;
  miscMastId?: string;
}

interface MasterDataResponse {
  misc?: MiscMasterItem[];
  data?: {
    misc?: MiscMasterItem[];
    data?: {
      misc?: MiscMasterItem[];
    };
  };
}

interface DrsSummaryItem {
  memberType?: unknown;
}

interface SaveValidationResult {
  isValid: boolean;
  message: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error";
}

type AddRowField =
  | "team"
  | "profile"
  | "category"
  | "subCategory"
  | "document"
  | "reason"
  | "fupCode";

const ADD_ROW_FIELD_SEQUENCE: AddRowField[] = [
  "team",
  "category",
  "subCategory",
  "document",
  "reason",
  "fupCode",
];

const REQUIRED_NEW_ROW_FIELDS: Array<{
  field: AddRowField;
  label: string;
}> = [
  { field: "team", label: "Team" },
  { field: "profile", label: "Profile" },
  { field: "category", label: "Category" },
  { field: "subCategory", label: "Sub Category" },
  { field: "document", label: "Document" },
  { field: "reason", label: "Reason" },
  { field: "fupCode", label: "FUP Code" },
];

type RowMasterOptions = Partial<Record<AddRowField, string[]>>;

interface RequirementTableRow extends AdditionalRequirementRow {
  __clientRowId: string;
  __isInitiallyAccepted: boolean;
}

const createTableRows = (
  requirementRows: AdditionalRequirementRow[],
): RequirementTableRow[] =>
  requirementRows.map((row, index) => {
    const apiRow = { ...row } as Record<string, unknown>;
    delete apiRow.requirementId;

    return {
      ...(apiRow as AdditionalRequirementRow),
      __clientRowId: `existing-${index}`,
      __isInitiallyAccepted: ["ACCEPT", "ACCEPTED"].includes(
        getStatusComparableValue(row.status),
      ),
    };
  });

const createRequestRows = (
  tableRows: RequirementTableRow[],
): AdditionalRequirementRow[] =>
  tableRows.map((row) => {
    const requestRow = { ...row } as Record<string, unknown>;
    delete requestRow.__clientRowId;
    delete requestRow.__isInitiallyAccepted;
    delete requestRow.requirementId;

    return requestRow as AdditionalRequirementRow;
  });

const ROWS_PER_PAGE = 5;
const COLUMN_HEADINGS = [
  "Actions",
  "Status",
  "OCR Status",
  "Team",
  "Profile",
  "Category",
  "Sub Category",
  "Document",
  "Reason",
  "Special Test",
  "FUP Code",
  "Extra Remarks",
  "Description",
] as const;

const DEFAULT_COLUMN_WIDTHS = [
  60, 125, 95, 85, 95, 105, 115, 120, 145, 100, 85, 95, 85,
];
const MIN_COLUMN_WEIGHT = 30;

type FilterField = "profile" | "category" | "subCategory" | "fupCode";

const FILTERABLE_COLUMNS: Partial<Record<(typeof COLUMN_HEADINGS)[number], FilterField>> = {
  Profile: "profile",
  Category: "category",
  "Sub Category": "subCategory",
  "FUP Code": "fupCode",
};

const EMPTY_FILTERS: Record<FilterField, string[]> = {
  profile: [],
  category: [],
  subCategory: [],
  fupCode: [],
};

const FILTER_LABELS: Array<{ field: FilterField; label: string }> = [
  { field: "category", label: "Category" },
  { field: "subCategory", label: "Sub Category" },
  { field: "profile", label: "Profile" },
  { field: "fupCode", label: "FUP Code" },
];

const normalizeText = (value: unknown): string =>
  value === null || value === undefined ? "" : String(value).trim();

const getExtraRemarks = (row: AdditionalRequirementRow): unknown => {
  const requirementRow = row as unknown as Record<string, unknown>;

  return requirementRow.extraRemarks ?? requirementRow.extraRemark;
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const getDrsPayload = (value: unknown): Record<string, unknown> => {
  const root = toRecord(value);
  let currentPayload = root;

  for (let depth = 0; depth < 5; depth += 1) {
    if (
      Array.isArray(currentPayload.summary) ||
      Array.isArray(currentPayload.requirementManagement)
    ) {
      return currentPayload;
    }

    const nestedData = toRecord(currentPayload.data);

    if (Object.keys(nestedData).length === 0) {
      break;
    }

    currentPayload = nestedData;
  }

  return currentPayload;
};

const getMasterPayload = (value: unknown): Record<string, unknown> => {
  const root = toRecord(value);
  const firstData = toRecord(root.data);
  const secondData = toRecord(firstData.data);

  return Object.keys(secondData).length > 0
    ? secondData
    : Object.keys(firstData).length > 0
      ? firstData
      : root;
};

const getMasterItems = (
  response: unknown,
  key: "misc" | "requirement_mst",
): Record<string, unknown>[] => {
  const payload = getMasterPayload(response);
  const value = payload[key] ?? payload.requirementMst;

  if (Array.isArray(value)) {
    return value.map(toRecord);
  }

  if (key === "requirement_mst") {
    const requirementMaster = toRecord(value);
    const normalizedLevel = normalizeText(requirementMaster.level)
      .replace(/[_\s-]/g, "")
      .toLowerCase();
    const levelConfig: Record<
      string,
      { arrayKeys: string[]; field: AddRowField }
    > = {
      team: { arrayKeys: ["teams"], field: "team" },
      teams: { arrayKeys: ["teams"], field: "team" },
      profile: { arrayKeys: ["profiles", "teams"], field: "profile" },
      profiles: { arrayKeys: ["profiles", "teams"], field: "profile" },
      category: { arrayKeys: ["categories", "teams"], field: "category" },
      categories: { arrayKeys: ["categories", "teams"], field: "category" },
      subcategory: {
        arrayKeys: ["subCategories", "subcategories", "teams"],
        field: "subCategory",
      },
      subcategories: {
        arrayKeys: ["subCategories", "subcategories", "teams"],
        field: "subCategory",
      },
      document: { arrayKeys: ["documents", "teams"], field: "document" },
      documents: { arrayKeys: ["documents", "teams"], field: "document" },
      reason: { arrayKeys: ["reasons", "teams"], field: "reason" },
      reasons: { arrayKeys: ["reasons", "teams"], field: "reason" },
      fupcode: {
        arrayKeys: ["fupCodes", "fupcodes", "fup_codes", "teams"],
        field: "fupCode",
      },
      fupcodes: {
        arrayKeys: ["fupCodes", "fupcodes", "fup_codes", "teams"],
        field: "fupCode",
      },
    };
    const config = levelConfig[normalizedLevel];

    if (config) {
      const optionValues = config.arrayKeys
        .map((arrayKey) => requirementMaster[arrayKey])
        .find(Array.isArray);

      if (Array.isArray(optionValues)) {
        return optionValues.map((option) =>
          option && typeof option === "object"
            ? toRecord(option)
            : { [config.field]: option },
        );
      }
    }
  }

  return [];
};

const getDefaultTeamByRole = (roleType: string): string => {
  if (["CVT_TASK", "CPT_DATA_ENTRY_NMR_TASK","CPT_DATA_ENTRY_MR_TASK"].includes(roleType)) {
    return "COPS";
  }

  if (roleType === "CUW_TASK") {
    return "UW";
  }

  return "SYSTEM REQUIREMENT";
};

const getOptionText = (item: Record<string, unknown>, field: AddRowField) => {
  const aliases: Record<AddRowField, string[]> = {
    team: ["team", "teamCode", "teamName"],
    profile: ["profile", "code", "value", "description"],
    category: ["category", "categoryName"],
    subCategory: ["subCategory", "subcategory", "subCategoryName"],
    document: ["document", "documentName"],
    reason: ["reason", "reasonName"],
    fupCode: ["fupCode", "fup_code", "code"],
  };

  return (
    aliases[field]
      .map((key) => normalizeText(item[key]))
      .find(Boolean) ?? ""
  );
};

const MASTER_OPTION_KEYS: Record<AddRowField, string[]> = {
  team: ["teams"],
  profile: ["profiles"],
  category: ["categories"],
  subCategory: ["subCategories", "subcategories"],
  document: ["documents"],
  reason: ["reasons"],
  fupCode: ["fupCodes", "fupcodes", "fup_codes", "fupCode"],
};

const getRequirementMaster = (response: unknown): Record<string, unknown> => {
  const payload = getMasterPayload(response);

  return toRecord(payload.requirement_mst ?? payload.requirementMst);
};

const getRequirementOptions = (
  requirementMaster: Record<string, unknown>,
  field: AddRowField,
): string[] => {
  const rawOptions = MASTER_OPTION_KEYS[field]
    .map((key) => requirementMaster[key])
    .find(Array.isArray);

  if (!Array.isArray(rawOptions)) {
    return [];
  }

  return Array.from(
    new Set(
      rawOptions
        .map((option) =>
          option && typeof option === "object"
            ? getOptionText(toRecord(option), field)
            : normalizeText(option),
        )
        .filter(Boolean),
    ),
  );
};

const getFupDescription = (
  requirementMaster: Record<string, unknown>,
  requirementItems: Record<string, unknown>[],
  selectedFupCode: unknown,
): string => {
  const selectedCode = normalizeText(selectedFupCode).toUpperCase();
  const nestedItems = [
    ...MASTER_OPTION_KEYS.fupCode,
    "descriptions",
    "requirements",
  ].flatMap((key) => {
    const value = requirementMaster[key];
    return Array.isArray(value) ? value.map(toRecord) : [];
  });
  const matchingItem = [...requirementItems, ...nestedItems].find((item) =>
    [item.fupCode, item.fup_code, item.code]
      .map((value) => normalizeText(value).toUpperCase())
      .includes(selectedCode),
  );

  return normalizeText(
    matchingItem?.description ??
      matchingItem?.desc ??
      requirementMaster.description ??
      requirementMaster.desc,
  );
};

const formatStatus = (status: unknown): string => {
  const value = normalizeText(status);

  if (!value) {
    return "";
  }

  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const getStatusComparableValue = (value: unknown): string =>
  normalizeText(value).toUpperCase();

const validateRequirementsForSave = (
  rows: AdditionalRequirementRow[],
  roleType: string,
): SaveValidationResult => {
  switch (roleType) {
    case "PIVV_TASK": {
      const hasPendingRequirement = rows.some(
        (row) => getStatusComparableValue(row.status) === "PENDING",
      );

      if (hasPendingRequirement) {
        return {
          isValid: false,
          message:
            "Please take action on all pending requirements before saving.",
        };
      }

      return { isValid: true, message: "" };
    }

    case "CVT_TASK":
      /*
       * Saving is mandatory for CVT even when no status was changed.
       * Therefore this role intentionally has no change-comparison check.
       */
      return { isValid: true, message: "" };

    default:
      return { isValid: true, message: "" };
  }
};

const EyeDetailIcon = () => (
  <Box
    component="span"
    sx={{
      position: "relative",
      display: "inline-flex",
      width: 14,
      height: 14,
      alignItems: "center",
      justifyContent: "center",
      border: "1.6px solid currentColor",
      borderRadius: "70% 15%",
      transform: "rotate(45deg)",
      boxSizing: "border-box",
    }}
  >
    <Box
      component="span"
      sx={{
        width: 4.5,
        height: 4.5,
        borderRadius: "50%",
        bgcolor: "currentColor",
      }}
    />
  </Box>
);

const filterRequirementsByRole = (
  requirements: AdditionalRequirementRow[],
  roleType: string,
): AdditionalRequirementRow[] => {
  const normalizedRoleType = normalizeText(roleType).toUpperCase();

  if (normalizedRoleType === "CPT_DATA_ENTRY_NMR_TASK") {
    return requirements.filter(
      (row) => normalizeText(row.category).toUpperCase() !== "MEDICAL" || normalizeText(row.category).toUpperCase() !== "MEDICALS",
    );
  }
    if (normalizedRoleType === "CPT_DATA_ENTRY_MR_TASK") {
    return requirements.filter(
      (row) => normalizeText(row.category).toUpperCase() === "MEDICAL",
    );
  }

  if (normalizedRoleType === "PIVV_TASK") {
    return requirements.filter(
      (row) => normalizeText(row.fupCode).toUpperCase() === "PIV",
    );
  }

  return requirements;
};
interface ApplicationRow {
  applicationNo?: string;
  businessType?: string;
  roleType?: string;
  userId?: string;
  [key: string]: unknown;
}
const actionButtonSx = {
  minWidth: 170,
  borderRadius: "28px",
  bgcolor: "#ad252a",
  py: 0.65,
  textTransform: "none",
  fontSize: "13px",
  fontWeight: 600,
  boxShadow: "none",
  "&:hover": {
    bgcolor: "#941f24",
    boxShadow: "none",
  },
};

const RequirementManagementTable = ({
  requirements,
  onAddRequirement,
  addRowSignal = 0,
}: RequirementManagementTableProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { applicationNumber: routeApplicationNumber } = useParams<{
    applicationNumber: string;
  }>();
  const [roleType] = useState(
    () => localStorage.getItem("roleType") ?? "",
  );
  const application = location.state?.application as ApplicationRow | undefined;
  const applicationNumber = normalizeText(
    routeApplicationNumber ??
      application?.applicationNo ??
      localStorage.getItem("applicationNo"),
  );
  const businessType = (
    application?.businessType ??
    localStorage.getItem("businessType") ??
    ""
  )
    .trim()
    .toLowerCase();

  const userId = localStorage.getItem("username") ?? "";
  const normalizedRoleType = normalizeText(roleType).toUpperCase();
  console.log('normalizedRoleType',normalizedRoleType)
  const requirementSaveStorageKey = `requirementManagementSaved:${
    applicationNumber ?? ""
  }:${normalizedRoleType}`;
  const isNonEditable = [
    "AMR_MEDICAL_TASK",
    "AMR_NON_MEDICAL_TASK",
    "RECONSIDERATION_TASK",
    "ACUITY_TASK"
  ].includes(normalizedRoleType);
  const isAddRequirementEnabled =
    Boolean(onAddRequirement) && !isNonEditable;
  const isSaveButtonVisible = normalizedRoleType !== "ACUITY_TASK" && normalizedRoleType !== "AMR_MEDICAL_TASK" && normalizedRoleType !== "AMR_NON_MEDICAL_TASK" && normalizedRoleType !== "RECONSIDERATION_TASK";

  const roleBasedRequirements = filterRequirementsByRole(
    requirements,
    roleType,
  );

  const masterData = useAppSelector(
    (state: RootState) => state.masterData,
  ) as MasterDataResponse;

  const drsStateData = useAppSelector(
    (state: RootState) => state.drs.data,
  ) as unknown;
  const drsPayload = getDrsPayload(drsStateData);
  const quickLinks = toRecord(drsPayload.quickLinks);
  const proposerFormUrl = normalizeText(quickLinks.proposerForm);
  const applicationOverview = toRecord(drsPayload.applicationOverview);
  const summarySource = Array.isArray(applicationOverview.summary)
    ? applicationOverview.summary
    : drsPayload.summary;
  const drsSummary = Array.isArray(summarySource)
    ? (summarySource as DrsSummaryItem[])
    : [];

  const profileOptions = Array.from(
    new Set(
      drsSummary
        .map((summaryItem) => {
          const item = toRecord(summaryItem);

          return normalizeText(
            item.memberType ?? item.membertype ?? item.member_type,
          );
        })
        .filter(Boolean),
    ),
  );

  const [rows, setRows] = useState<RequirementTableRow[]>(() =>
    createTableRows(filterRequirementsByRole(requirements, roleType)),
  );

  const [previousRequirements, setPreviousRequirements] =
    useState(requirements);
  const [handledAddRowSignal, setHandledAddRowSignal] = useState(addRowSignal);
  const [newRowIds, setNewRowIds] = useState<string[]>([]);
  const [rowMasterOptions, setRowMasterOptions] = useState<
    Record<string, RowMasterOptions>
  >({});
  const [loadingMasterField, setLoadingMasterField] = useState<{
    rowId: string;
    field: AddRowField;
  } | null>(null);

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedFilterField, setSelectedFilterField] =
    useState<FilterField>("category");
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [columnWidths, setColumnWidths] = useState(DEFAULT_COLUMN_WIDTHS);

  const [selectedDetail, setSelectedDetail] = useState<{
    title: string;
    value: string;
  } | null>(null);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleViewDocuments = () => {
    if (!proposerFormUrl) {
      setSnackbar({
        open: true,
        message: "Proposer form is not available.",
        severity: "error",
      });
      return;
    }

    window.open(proposerFormUrl, "_blank", "noopener,noreferrer");
  };

  const markRequirementsAsUnsaved = () => {
    markLocalRequirementRowsUnsaved(drsPayload);

    sessionStorage.setItem(requirementSaveStorageKey, "false");
  };

  useEffect(() => {
    const currentRoleType = normalizeText(roleType).toUpperCase();

    const storageKey = `requirementManagementSaved:${applicationNumber}:${currentRoleType}`;
    sessionStorage.setItem(storageKey, "false");
  }, [addRowSignal, applicationNumber, roleType]);

  /*
   * Reset local edits when a new requirements array is received.
   * This guarded render update avoids synchronously setting state
   * inside an effect and React completes the rerender before children
   * are committed.
   */
  if (previousRequirements !== requirements) {
    setPreviousRequirements(requirements);
    setRows((currentRows) =>
      createTableRows(roleBasedRequirements).map((nextRow) => {
        const currentRow = currentRows.find(
          (row) => row.__clientRowId === nextRow.__clientRowId,
        );

        return {
          ...nextRow,
          /*
           * Do not lock a dropdown merely because Save returned an updated
           * Accept status during the current screen session. The lock state
           * is recalculated from the API only after a full page refresh,
           * when this component mounts again.
           */
          __isInitiallyAccepted:
            currentRow?.__isInitiallyAccepted ??
            nextRow.__isInitiallyAccepted,
        };
      }),
    );
    setPage(1);
  }

  if (handledAddRowSignal !== addRowSignal) {
    const clientRowId = `new-${Math.max(1, addRowSignal)}`;
    const newRequirement: RequirementTableRow = {
      __clientRowId: clientRowId,
      __isInitiallyAccepted: false,
      team: getDefaultTeamByRole(normalizedRoleType),
      profile: "",
      category: "",
      subCategory: "",
      document: "",
      reason: "",
      fupCode: "",
      description: "",
      status: "PENDING",
     
      specialTest: "",
    
      userId: normalizeText(localStorage.getItem("userId")),
      remarks: "",
      udsLink: "",
      ocrStatus: "",
     
    };

    setHandledAddRowSignal(addRowSignal);
    setRows((currentRows) => [newRequirement, ...currentRows]);
    setNewRowIds((currentIds) => [...currentIds, clientRowId]);
    setFilters({ ...EMPTY_FILTERS });
    setDraftFilters({ ...EMPTY_FILTERS });
    setPage(1);
  }

  /*
   * Supports common master API response structures:
   *
   * state.masterData.misc
   * state.masterData.data.misc
   * state.masterData.data.data.misc
   */
  const miscData = useMemo<MiscMasterItem[]>(() => {
    if (Array.isArray(masterData?.misc)) {
      return masterData.misc;
    }

    if (Array.isArray(masterData?.data?.misc)) {
      return masterData.data.misc;
    }

    if (Array.isArray(masterData?.data?.data?.misc)) {
      return masterData.data.data.misc;
    }

    return [];
  }, [masterData]);

  const statusOptions = useMemo(
    () =>
      miscData.filter(
        (item) =>
          normalizeText(item.type).toUpperCase() === "REQT_ST" &&
          normalizeText(item.isActive).toUpperCase() !== "N",
      ),
    [miscData],
  );

  const loadMasterOptions = useCallback(async (
    rowId: string,
    nextField: AddRowField,
    row?: AdditionalRequirementRow,
  ) => {
    setLoadingMasterField({ rowId, field: nextField });

    const requirementMst = row
      ? {
          ...(normalizeText(row.team) && {
            team: normalizeText(row.team),
          }),
          ...(normalizeText(row.profile) && {
            profile: normalizeText(row.profile),
          }),
          ...(normalizeText(row.category) && {
            category: normalizeText(row.category),
          }),
          ...(normalizeText(row.subCategory) && {
            subCategory: normalizeText(row.subCategory),
          }),
          ...(normalizeText(row.document) && {
            document: normalizeText(row.document),
          }),
          ...(normalizeText(row.reason) && {
            reason: normalizeText(row.reason),
          }),
          ...(normalizeText(row.fupCode) && {
            fupCode: normalizeText(row.fupCode),
          }),
        }
      : undefined;

    const requestPayload = {
      types: ["requirement_mst"],
      ...(requirementMst && Object.keys(requirementMst).length > 0
        ? { requirementMst }
        : {}),
    } as unknown as MasterRequest;

    try {
      const response = await dispatch(masterThunk(requestPayload)).unwrap();
      const requirementMaster = getRequirementMaster(response);
      const requirementItems = getMasterItems(response, "requirement_mst");
      const directOptions = getRequirementOptions(requirementMaster, nextField);
      const fallbackOptions = Array.from(
        new Set(
          requirementItems
            .map((item) => getOptionText(item, nextField))
            .filter(Boolean),
        ),
      );
      const options = directOptions.length > 0 ? directOptions : fallbackOptions;

      if (
        nextField === "team" &&
        normalizeText(row?.team) &&
        !options.includes(normalizeText(row?.team))
      ) {
        options.unshift(normalizeText(row?.team));
      }

      const returnedOptions = ADD_ROW_FIELD_SEQUENCE.reduce<RowMasterOptions>(
        (allOptions, field) => {
          const fieldOptions = getRequirementOptions(requirementMaster, field);

          if (fieldOptions.length > 0) {
            allOptions[field] = fieldOptions;
          }

          return allOptions;
        },
        {},
      );

      setRowMasterOptions((currentOptions) => ({
        ...currentOptions,
        [rowId]: {
          ...currentOptions[rowId],
          ...returnedOptions,
          [nextField]: options,
        },
      }));

      if (nextField === "fupCode" && normalizeText(row?.fupCode)) {
        const description = getFupDescription(
          requirementMaster,
          requirementItems,
          row?.fupCode,
        );

        if (description) {
          setRows((currentRows) =>
            currentRows.map((currentRow) =>
              currentRow.__clientRowId === rowId
                ? { ...currentRow, description }
                : currentRow,
            ),
          );
        }
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error && error.message
            ? error.message
            : "Unable to load requirement master data.",
        severity: "error",
      });
    } finally {
      setLoadingMasterField(null);
    }
  }, [
    dispatch,
    setLoadingMasterField,
    setRowMasterOptions,
    setRows,
    setSnackbar,
  ]);

  useEffect(() => {
    const newestRowId = newRowIds[newRowIds.length - 1];

    if (newestRowId === undefined) {
      return undefined;
    }

    const newRow = rows.find(
      (row) => row.__clientRowId === newestRowId,
    );

    if (!newRow) {
      return undefined;
    }

    const currentOptions = rowMasterOptions[newestRowId] ?? {};

    if (!Object.prototype.hasOwnProperty.call(currentOptions, "team")) {
      const timeoutId = window.setTimeout(() => {
        void loadMasterOptions(newestRowId, "team");
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    /*
     * A role-based team is already selected on a newly added row.
     * Once the Team list is available, load Category for that default.
     * Changing Team later repeats this call with the newly selected value.
     */
    if (
      normalizeText(newRow.team) &&
      !Object.prototype.hasOwnProperty.call(currentOptions, "category")
    ) {
      const timeoutId = window.setTimeout(() => {
        void loadMasterOptions(newestRowId, "category", newRow);
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }

    return undefined;
  }, [loadMasterOptions, newRowIds, rowMasterOptions, rows]);

  const filterOptions = useMemo(() => {
    const fields = Object.values(FILTERABLE_COLUMNS) as FilterField[];

    return fields.reduce<Record<FilterField, string[]>>(
      (options, field) => {
        options[field] = Array.from(
          new Set(rows.map((row) => normalizeText(row[field])).filter(Boolean)),
        ).sort((first, second) =>
          first.localeCompare(second, undefined, { sensitivity: "base" }),
        );
        return options;
      },
      { ...EMPTY_FILTERS },
    );
  }, [rows]);

  const filteredRows = useMemo(
    () =>
      rows.filter((row) =>
        (Object.keys(filters) as FilterField[]).every((field) => {
          const selectedValues = filters[field];

          return (
            selectedValues.length === 0 ||
            selectedValues.some(
              (value) =>
                normalizeText(value).toUpperCase() ===
                normalizeText(row[field]).toUpperCase(),
            )
          );
        }),
      ),
    [filters, rows],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredRows.length / ROWS_PER_PAGE),
  );

  const visibleRows = useMemo(() => {
    const startIndex = (page - 1) * ROWS_PER_PAGE;

    return filteredRows.slice(startIndex, startIndex + ROWS_PER_PAGE);
  }, [filteredRows, page]);

  const gridTemplateColumns = columnWidths
    .map((width) => `minmax(0, ${width}fr)`)
    .join(" ");

  const handleColumnResizeStart = (
    columnIndex: number,
    event: ReactMouseEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startWidth = columnWidths[columnIndex];
    const adjacentIndex =
      columnIndex === columnWidths.length - 1
        ? columnIndex - 1
        : columnIndex + 1;
    const startAdjacentWidth = columnWidths[adjacentIndex];
    const combinedWidth = startWidth + startAdjacentWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const direction =
        columnIndex === columnWidths.length - 1 ? -1 : 1;
      const widthChange =
        ((moveEvent.clientX - startX) / 6) * direction;
      const nextWidth = Math.min(
        combinedWidth - MIN_COLUMN_WEIGHT,
        Math.max(MIN_COLUMN_WEIGHT, startWidth + widthChange),
      );
      const nextAdjacentWidth = combinedWidth - nextWidth;

      setColumnWidths((currentWidths) =>
        currentWidths.map((width, index) =>
          index === columnIndex
            ? nextWidth
            : index === adjacentIndex
              ? nextAdjacentWidth
              : width,
        ),
      );
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleOpenFilterDialog = () => {
    setDraftFilters({
      profile: [...filters.profile],
      category: [...filters.category],
      subCategory: [...filters.subCategory],
      fupCode: [...filters.fupCode],
    });
    setFilterDialogOpen(true);
  };

  const handleDraftFilterToggle = (field: FilterField, value: string) => {
    setDraftFilters((currentFilters) => {
      const selectedValues = currentFilters[field];

      return {
        ...currentFilters,
        [field]: selectedValues.includes(value)
          ? selectedValues.filter((item) => item !== value)
          : [...selectedValues, value],
      };
    });
  };

  const handleClearAllFilters = () => {
    setDraftFilters({ ...EMPTY_FILTERS });
  };

  const handleApplyFilters = () => {
    setFilters({
      profile: [...draftFilters.profile],
      category: [...draftFilters.category],
      subCategory: [...draftFilters.subCategory],
      fupCode: [...draftFilters.fupCode],
    });
    setPage(1);
    setFilterDialogOpen(false);
  };

  const handleClearAppliedFilters = () => {
    setFilters({ ...EMPTY_FILTERS });
    setDraftFilters({ ...EMPTY_FILTERS });
    setPage(1);
  };

  const handleAddRowFieldChange = (
    rowId: string,
    field: AddRowField,
    selectedValue: string,
  ) => {
    const fieldIndex = ADD_ROW_FIELD_SEQUENCE.indexOf(field);
    const downstreamFields =
      field === "profile"
        ? []
        : ADD_ROW_FIELD_SEQUENCE.slice(fieldIndex + 1);
    const currentRow = rows.find(
      (row) => row.__clientRowId === rowId,
    );

    if (!currentRow) {
      return;
    }

    markRequirementsAsUnsaved();

    const updatedRow = {
      ...currentRow,
      [field]: selectedValue,
      ...Object.fromEntries(
        downstreamFields.map((downstreamField) => [downstreamField, ""]),
      ),
      ...(!["profile", "fupCode"].includes(field)
        ? { description: "" }
        : {}),
    } as RequirementTableRow;

    setRows((currentRows) =>
      currentRows.map((row) =>
        row.__clientRowId === rowId ? updatedRow : row,
      ),
    );

    setRowMasterOptions((currentOptions) => ({
      ...currentOptions,
      [rowId]: {
        ...currentOptions[rowId],
        ...Object.fromEntries(
          downstreamFields.map((downstreamField) => [downstreamField, []]),
        ),
      },
    }));

    const nextField = field === "profile"
      ? undefined
      : field === "fupCode"
        ? "fupCode"
        : ADD_ROW_FIELD_SEQUENCE[fieldIndex + 1];

    if (nextField) {
      void loadMasterOptions(rowId, nextField, updatedRow);
    }
  };

  const handleStatusChange = (
    rowId: string,
    event: SelectChangeEvent<string>,
  ) => {
    const selectedStatus = event.target.value;

    markRequirementsAsUnsaved();

    setRows((currentRows) =>
      currentRows.map((row) =>
        row.__clientRowId === rowId
          ? {
              ...row,
              status: selectedStatus,
            }
          : row,
      ),
    );
  };

  const handleRemove = (rowId: string) => {
    markRequirementsAsUnsaved();

    setRows((currentRows) =>
      currentRows.filter((row) => row.__clientRowId !== rowId),
    );

    setNewRowIds((currentIds) =>
      currentIds.filter((currentRowId) => currentRowId !== rowId),
    );
    setRowMasterOptions((currentOptions) => {
      const nextOptions = { ...currentOptions };
      delete nextOptions[rowId];
      return nextOptions;
    });

    const remainingRows = rows.length - 1;
    const updatedPageCount = Math.max(
      1,
      Math.ceil(remainingRows / ROWS_PER_PAGE),
    );

    if (page > updatedPageCount) {
      setPage(updatedPageCount);
    }
  };

  const handleSave = async () => {
    const incompleteNewRow = rows.find((row) =>
      newRowIds.includes(row.__clientRowId) &&
      REQUIRED_NEW_ROW_FIELDS.some(
        ({ field }) => !normalizeText(row[field]),
      ),
    );

    if (incompleteNewRow) {
      const missingFields = REQUIRED_NEW_ROW_FIELDS
        .filter(({ field }) => !normalizeText(incompleteNewRow[field]))
        .map(({ label }) => label);

      setSnackbar({
        open: true,
        message: `Please fill all mandatory fields: ${missingFields.join(", ")}.`,
        severity: "error",
      });
      return;
    }

    const validation = validateRequirementsForSave(rows, normalizedRoleType);

    if (!validation.isValid) {
      setSnackbar({
        open: true,
        message: validation.message,
        severity: "error",
      });
      return;
    }

    try {
      // const selectedCaseContext = toRecord(
      //   (() => {
      //     try {
      //       return JSON.parse(
      //         localStorage.getItem("selectedCaseContext") ?? "{}",
      //       ) as unknown;
      //     } catch {
      //       return {};
      //     }
      //   })(),
      // );
     

      if (!applicationNumber || !normalizedRoleType || !userId) {
        setSnackbar({
          open: true,
          message:
            "Application number, role type, and user ID are required to save requirements.",
          severity: "error",
        });
        return;
      }

      const updatedDrsData = {
        ...drsPayload,
        requirementManagement: createRequestRows(rows),
      } as unknown as ApplicantProfileSubmitRequest["data"];
      const payload = {applicationNo:applicationNumber,
          roleType: roleType,
          sections: ["requirementManagement"],
          userId,
          data: updatedDrsData}
          console.log('payload----------',payload)

      await dispatch(
        applicantProfileSubmitThunk(
          payload
        ),
      ).unwrap();

      // Reload Requirement Management from the server after the PUT succeeds.
      // The decision dropdown must always use this refreshed API response.
      await dispatch(
        drsThunk({
          applicationNo: applicationNumber,
          roleType,
          sections: ["requirementManagement", "requirementCategoryInfo"],
          userId,
        }),
      ).unwrap();

      saveLocalRequirementRows(
        drsPayload,
        createRequestRows(rows),
        false,
      );

      sessionStorage.setItem(requirementSaveStorageKey, "true");

      setNewRowIds([]);
      setRowMasterOptions({});
      setSnackbar({
        open: true,
        message: "Requirements saved successfully.",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message:
          error instanceof Error && error.message
            ? error.message
            : "Unable to save requirements. Please try again.",
        severity: "error",
      });
    }
  };

  const cellTextStyles = {
    width: "100%",
    minWidth: 0,
    fontSize: "11px",
    color: "#4f4f4f",
    lineHeight: 1.25,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  const renderCompactCell = (value: unknown) => {
    const text = normalizeText(value);

    return (
      <Tooltip title={text} arrow disableHoverListener={!text}>
        <Typography sx={cellTextStyles}>{text || "-"}</Typography>
      </Tooltip>
    );
  };

  const renderDetailAction = (title: string, value: unknown) => {
    const text = normalizeText(value);

    return (
      <Box sx={{ display: "flex", justifyContent: "center" }}>
        <Tooltip title={text || `No ${title.toLowerCase()} available`} arrow>
          <span>
            <IconButton
              size="small"
              disabled={!text}
              aria-label={`View ${title}`}
              onClick={() => setSelectedDetail({ title, value: text })}
              sx={{
                width: 24,
                height: 24,
                p: 0,
                color: "#075184",
                border: "1px solid transparent",
                "&:hover": {
                  borderColor: "#b9d1e0",
                  bgcolor: "#edf5fa",
                },
                "&.Mui-disabled": {
                  color: "#b8c0c5",
                },
              }}
            >
              <EyeDetailIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    );
  };

  const renderAddRowSelect = (
    row: AdditionalRequirementRow,
    rowId: string,
    field: AddRowField,
  ) => {
    const options =
      field === "profile"
        ? profileOptions
        : rowMasterOptions[rowId]?.[field] ?? [];
    const fieldIndex = ADD_ROW_FIELD_SEQUENCE.indexOf(field);
    const parentField = ADD_ROW_FIELD_SEQUENCE[fieldIndex - 1];
    const isLoading =
      loadingMasterField?.rowId === rowId &&
      loadingMasterField.field === field;
    const isDisabled =
      field === "profile"
        ? false
        : isLoading ||
          options.length === 0 ||
          (Boolean(parentField) && !normalizeText(row[parentField]));

    return (
      <Select
        size="small"
        displayEmpty
        value={normalizeText(row[field])}
        disabled={isDisabled}
        onChange={(event) =>
          handleAddRowFieldChange(rowId, field, event.target.value)
        }
        sx={{
          width: "100%",
          minWidth: 0,
          height: 25,
          borderRadius: "5px",
          bgcolor: "#ffffff",
          fontSize: "10px",
          "& .MuiSelect-select": {
            minWidth: "0 !important",
            px: 0.45,
            py: 0.25,
            pr: "17px !important",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          },
          "& .MuiSelect-icon": { right: 0, fontSize: 15 },
        }}
      >
        <MenuItem value="" disabled sx={{ fontSize: "11px" }}>
          {isLoading ? "Loading..." : "Select"}
        </MenuItem>
        {options.map((option) => (
          <MenuItem key={option} value={option} sx={{ fontSize: "11px" }}>
            {option}
          </MenuItem>
        ))}
      </Select>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      {isAddRequirementEnabled && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 1,
          }}
        >
          <Button
            variant="outlined"
            onClick={onAddRequirement}
            sx={{
              borderColor: "#E45F14",
              color: "#E45F14",
              bgcolor: "#ffffff",
              minHeight: 30,
              borderRadius: "6px",
              px: 1.5,
              py: 0.35,
              fontSize: "12px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#E45F14",
                bgcolor: "#f4f8fb",
              },
            }}
          >
            Add Requirement
          </Button>
        </Box>
      )}

      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          border: "1px solid #d5dbe1",
          borderRadius: "10px",
          overflow: "hidden",
          overflowX: "hidden",
          bgcolor: "#ffffff",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns,
            alignItems: "center",
            columnGap: "4px",
            bgcolor: "#E45F14",
            color: "#FFF",
            borderBottom: "1px solid #d5dbe1",
            minHeight: 36,
            px: 0.75,
            py: 0.45,
            boxSizing: "border-box",
          }}
        >
          {COLUMN_HEADINGS.map((heading, columnIndex) => (
            <Box
              key={heading}
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 0.4,
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <Typography
                component="span"
                sx={{
                  appearance: "none",
                  border: 0,
                  p: 0,
                  bgcolor: "transparent",
                  fontFamily: "inherit",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  color: "#FFF",
                  lineHeight: 1.15,
                  whiteSpace: "normal",
                  overflow: "hidden",
                  minWidth: 0,
                  cursor: "default",
                }}
              >
                {heading}
              </Typography>

              <Box
                onMouseDown={(event) =>
                  handleColumnResizeStart(columnIndex, event)
                }
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "7px",
                  height: "100%",
                  cursor: "col-resize",
                  borderRight: "1px solid rgba(255,255,255,0.3)",
                  "&:hover": {
                    bgcolor: "rgba(255,255,255,0.22)",
                  },
                }}
              />
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 0.6,
            minHeight: 36,
            px: 0.75,
            py: 0.3,
            bgcolor: "#fafbfc",
            borderBottom: "1px solid #e1e5e8",
            boxSizing: "border-box",
          }}
        >
          {Object.values(filters).some((values) => values.length > 0) && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearAppliedFilters}
              sx={{
                minWidth: 0,
                height: 28,
                px: 1,
                borderColor: "#c73434",
                borderRadius: "7px",
                color: "#c73434",
                bgcolor: "#ffffff",
                fontSize: "10.5px",
                fontWeight: 600,
                lineHeight: 1,
                textTransform: "none",
                "&:hover": {
                  borderColor: "#a52227",
                  bgcolor: "#fff5f5",
                },
              }}
            >
              Clear filters
            </Button>
          )}

          <Tooltip title="Filter requirements">
            <IconButton
              size="small"
              onClick={handleOpenFilterDialog}
              sx={{
                width: 30,
                height: 28,
                border: "1px solid #dfe3e7",
                borderRadius: "7px",
                color: Object.values(filters).some(
                  (values) => values.length > 0,
                )
                  ? "#E45F14"
                  : "#555555",
                bgcolor: Object.values(filters).some(
                  (values) => values.length > 0,
                )
                  ? "#fff1e6"
                  : "#ffffff",
                "&:hover": {
                  borderColor: "#E45F14",
                  bgcolor: "#fff5ee",
                },
              }}
            >
              <FilterIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {visibleRows.length > 0 ? (
          visibleRows.map((row, visibleIndex) => {
            const absoluteIndex = (page - 1) * ROWS_PER_PAGE + visibleIndex;

            const rowKey = row.__clientRowId;
            const isNewRow = newRowIds.includes(rowKey);

            const currentStatus = normalizeText(row.status);

            const matchingStatusOption = statusOptions.find((option) => {
              const optionValues = [
                option.code,
                option.value,
                option.description,
              ].map(getStatusComparableValue);

              return optionValues.includes(
                getStatusComparableValue(currentStatus),
              );
            });

            /*
             * Keep the API status value when it already
             * matches a master record. Otherwise show the
             * formatted API value.
             */
            const selectedStatus =
              matchingStatusOption?.value ||
              matchingStatusOption?.description ||
              matchingStatusOption?.code ||
              formatStatus(currentStatus);

            return (
              <Box
                key={rowKey}
                sx={{
                  display: "grid",
                  gridTemplateColumns,
                  alignItems: "center",
                  columnGap: "4px",
                  position: "relative",
                  minHeight: 36,
                  px: 0.75,
                  py: 0.15,
                  boxSizing: "border-box",
                  bgcolor: absoluteIndex % 2 === 0 ? "#ffffff" : "#fafbfc",
                  borderBottom:
                    visibleIndex === visibleRows.length - 1
                      ? "none"
                      : "1px solid #e0e0e0",
                  "&:hover": {
                    bgcolor: "#f3f7fa",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {isNewRow && (
                    <Tooltip title="Remove requirement">
                      <IconButton
                        size="small"
                        onClick={() => handleRemove(rowKey)}
                        sx={{
                          width: 24,
                          height: 24,
                          p: 0,
                          border: "1px solid #d9e2ea",
                          color: "#78909c",
                          fontSize: "16px",
                          "&:hover": {
                            borderColor: "#d32f2f",
                            color: "#d32f2f",
                            bgcolor: "#fff5f5",
                          },
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>

                <Select
                  size="small"
                  value={selectedStatus}
                  disabled={
                    isNonEditable ||
                    isNewRow ||
                    row.__isInitiallyAccepted
                  }
                  onChange={(event) =>
                    handleStatusChange(rowKey, event)
                  }
                  displayEmpty
                  sx={{
                    width: "70%",
                    minWidth: 0,
                    height: 25,
                    borderRadius: "6px",
                    bgcolor: "#ffffff",
                    fontSize: "11px",
                    "& .MuiSelect-select": {
                      minWidth: "0 !important",
                      px: 0.6,
                      py: 0.35,
                      pr: "20px !important",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    },
                    "& .MuiSelect-icon": {
                      right: 1,
                      fontSize: 17,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#cfd8e1",
                    },
                  }}
                >
                  {!selectedStatus && (
                    <MenuItem value="" disabled>
                      Select
                    </MenuItem>
                  )}

                  {selectedStatus && !matchingStatusOption && (
                    <MenuItem value={selectedStatus}>{selectedStatus}</MenuItem>
                  )}

                  {statusOptions.map((option) => {
                    const optionValue =
                      normalizeText(option.value) ||
                      normalizeText(option.description) ||
                      normalizeText(option.code);

                    return (
                      <MenuItem
                        key={
                          option.miscMastId || `${option.code}-${optionValue}`
                        }
                        value={optionValue}
                      >
                        {option.description}
                      </MenuItem>
                    );
                  })}
                </Select>

                {renderCompactCell(row.ocrStatus)}

                {isNewRow
                  ? renderAddRowSelect(row, rowKey, "team")
                  : renderCompactCell(row.team)}

                {isNewRow
                  ? renderAddRowSelect(row, rowKey, "profile")
                  : renderCompactCell(row.profile)}

                {isNewRow
                  ? renderAddRowSelect(row, rowKey, "category")
                  : renderCompactCell(row.category)}

                {isNewRow
                  ? renderAddRowSelect(row, rowKey, "subCategory")
                  : renderCompactCell(row.subCategory)}

                {isNewRow
                  ? renderAddRowSelect(row, rowKey, "document")
                  : renderCompactCell(row.document)}

                {isNewRow
                  ? renderAddRowSelect(row, rowKey, "reason")
                  : renderCompactCell(row.reason)}

                {renderCompactCell(row.specialTest)}

                {isNewRow
                  ? renderAddRowSelect(row, rowKey, "fupCode")
                  : renderCompactCell(row.fupCode)}

                {renderDetailAction("Extra Remarks", getExtraRemarks(row))}

                {renderDetailAction("Description", row.description)}

              </Box>
            );
          })
        ) : (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "14px",
                color: "#757575",
              }}
            >
              No requirements available
            </Typography>
          </Box>
        )}
      </Box>

      {filteredRows.length > ROWS_PER_PAGE && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 1,
          }}
        >
          <Pagination
            count={pageCount}
            page={page}
            onChange={(_, nextPage) => setPage(nextPage)}
            shape="rounded"
            sx={{
              "& .MuiPaginationItem-root": {
                color: "#555555",
              },
              "& .MuiPaginationItem-root.Mui-selected": {
                color: "#ffffff",
                bgcolor: "#E45F14",
                "&:hover": {
                  bgcolor: "#E45F14",
                },
              },
            }}
            size="small"
          />
        </Box>
      )}

      <Box
        sx={{
          mt: 1,
          mb: 0.5,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        {isSaveButtonVisible && (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={rows.length === 0}
            sx={actionButtonSx}
          >
            Save
          </Button>
        )}

        {normalizedRoleType === "CPT_DATA_ENTRY_NMR_TASK" && (
          <>
            <Button
              variant="contained"
              onClick={() =>
                navigate(
                  getFinancialPath(
                    businessType,
                    applicationNumber ?? "",
                  ),
                )
              }
              sx={actionButtonSx}
            >
              View Financials
            </Button>

            <Button
              variant="contained"
              onClick={handleViewDocuments}
              sx={actionButtonSx}
            >
              View Documents
            </Button>
          </>
        )}

        {normalizedRoleType === "CPT_DATA_ENTRY_MR_TASK" && (
          <>
          <Button
            variant="contained"
            onClick={() =>
              navigate(
                getMedicalPath(
                  businessType,
                  applicationNumber ?? "",
                ),
              )
            }
            sx={actionButtonSx}
          >
            View Medicals
          </Button>
          <Button
              variant="contained"
              onClick={handleViewDocuments}
              sx={actionButtonSx}
            >
              View Documents
            </Button>
            </>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        onClose={(_, reason) => {
          if (reason !== "clickaway") {
            setSnackbar((currentSnackbar) => ({
              ...currentSnackbar,
              open: false,
            }));
          }
        }}
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
          onClose={() =>
            setSnackbar((currentSnackbar) => ({
              ...currentSnackbar,
              open: false,
            }))
          }
          sx={{ width: "100%", fontSize: "12px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              width: "620px",
              maxWidth: "calc(100% - 24px)",
              minHeight: 430,
              borderRadius: "18px",
              overflow: "hidden",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: 64,
            px: 2.25,
            py: 1,
            borderBottom: "1px solid #e1e4e7",
          }}
        >
          <Typography sx={{ fontSize: "20px", fontWeight: 700, color: "#075184" }}>
            FILTER
          </Typography>
          <IconButton
            size="small"
            onClick={() => setFilterDialogOpen(false)}
            sx={{
              width: 28,
              height: 28,
              border: "2px solid #075184",
              color: "#075184",
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ display: "flex", p: "0 !important", minHeight: 290 }}>
          <Box
            sx={{
              width: "35%",
              flexShrink: 0,
              borderRight: "1px solid #e1e4e7",
              bgcolor: "#ffffff",
            }}
          >
            {FILTER_LABELS.map(({ field, label }) => {
              const isSelected = selectedFilterField === field;
              const selectedCount = draftFilters[field].length;

              return (
                <Button
                  key={field}
                  fullWidth
                  onClick={() => setSelectedFilterField(field)}
                  sx={{
                    minHeight: 54,
                    justifyContent: "space-between",
                    px: 1.5,
                    borderRadius: 0,
                    borderBottom: "1px solid #e1e4e7",
                    borderLeft: isSelected ? "4px solid #E45F14" : "4px solid transparent",
                    bgcolor: isSelected ? "#fff5ee" : "#ffffff",
                    color: isSelected ? "#E45F14" : "#4f4f4f",
                    fontSize: "13px",
                    fontWeight: isSelected ? 700 : 500,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#fff8f3" },
                  }}
                >
                  <span>{label}</span>
                  {selectedCount > 0 && (
                    <Box
                      component="span"
                      sx={{
                        minWidth: 20,
                        height: 20,
                        px: 0.5,
                        borderRadius: "10px",
                        bgcolor: "#E45F14",
                        color: "#ffffff",
                        fontSize: "10px",
                        lineHeight: "20px",
                      }}
                    >
                      {selectedCount}
                    </Box>
                  )}
                </Button>
              );
            })}
          </Box>

          <Box sx={{ flex: 1, p: 1.75, overflowY: "auto", maxHeight: 290 }}>
            {filterOptions[selectedFilterField].length > 0 ? (
              filterOptions[selectedFilterField].map((option) => (
                <Box
                  key={option}
                  component="label"
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    minHeight: 40,
                    px: 0.5,
                    borderRadius: "6px",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#fafafa" },
                  }}
                >
                  <Checkbox
                    size="small"
                    checked={draftFilters[selectedFilterField].includes(option)}
                    onChange={() =>
                      handleDraftFilterToggle(selectedFilterField, option)
                    }
                    sx={{
                      mr: 0.75,
                      color: "#b8b8b8",
                      "&.Mui-checked": { color: "#E45F14" },
                    }}
                  />
                  <Typography sx={{ fontSize: "13px", color: "#4f4f4f" }}>
                    {option}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ py: 2, textAlign: "center", fontSize: "13px", color: "#777" }}>
                No filter values available
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 1.5,
            minHeight: 78,
            px: 2,
            py: 1.25,
            borderTop: "1px solid #e1e4e7",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleClearAllFilters}
            sx={{
              minWidth: 160,
              height: 42,
              borderRadius: "24px",
              borderColor: "#bd292f",
              color: "#bd292f",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Clear All
          </Button>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            sx={{
              minWidth: 160,
              height: 42,
              borderRadius: "24px",
              bgcolor: "#bd292f",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
              boxShadow: "none",
              "&:hover": { bgcolor: "#a52227", boxShadow: "none" },
            }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selectedDetail)}
        onClose={() => setSelectedDetail(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontSize: "18px",
            fontWeight: 600,
            color: "#0a5285",
          }}
        >
          {selectedDetail?.title}
        </DialogTitle>

        <DialogContent dividers>
          <Typography
            sx={{
              fontSize: "14px",
              lineHeight: 1.6,
              color: "#404040",
              overflowWrap: "anywhere",
            }}
          >
            {selectedDetail?.value}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setSelectedDetail(null)}
            sx={{
              textTransform: "none",
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RequirementManagementTable;