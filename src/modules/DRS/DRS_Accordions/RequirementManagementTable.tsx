/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps */
import { Alert, Box, Chip, Paper, Typography, Pagination } from "@mui/material";
import { useEffect, useMemo, useState, useRef } from "react";
import { apiRequest } from "../../../services/api";
import { url as apiUrl } from "../../../services/apiConfig";
import { useSelector } from "react-redux";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTable from "../../../components/ui/Table/Table";
import CustomTextField from "../../../components/ui/TextField/TextField";
import type { Column } from "../../../components/ui/Table/Table";
import { useAppContext } from "../../../hooks/useAppContext";
import {
    getFinancialPath,
    getMedicalPath,
    normalizeBusinessType,
} from "../../../routes/routes";
import type { AdditionalRequirementRow, RequirementMasterOption } from "../../../types/drs.types";
import { toDisplayValue } from "../../../utils/helpers";
import type { RootState } from "../../../store/store";
import { CloseIcon, EyeIcon } from "../../../icons/Icons";
// removed unused import: getErrorMessage
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import {
    OPEN_REQUIREMENT_MANAGEMENT_EVENT,
    type OpenRequirementManagementEvent,
} from "./requirementManagementEvents";
import { saveLocalRequirementRows } from "../../../validations/drsRequirementDecisionValidation";

type BreRequirementRow = {
    requirementType?: string;
    requirementValue?: string;
    ruleId?: string;
    ruleName?: string;
    metaphorName?: string;
};

type LookupTeam = "COPS" | "GOPS" | "UW";

type EditableField =
    | "team"
    | "profile"
    | "category"
    | "subCategory"
    | "document"
    | "reason"
    | "fupCode"
    | "status"
    | "remarks";

type RowErrors = Partial<Record<EditableField | "lookup", string>>;

type EditableRequirementRow = AdditionalRequirementRow & {
    __rowId: string;
    __isDraft: boolean;
    __isLocal: boolean;
    __isNewLocal?: boolean;
    __errors?: RowErrors;
    __lookupMessage?: string;
};

type Option = {
    label: string;
    value: string;
    description?: string;
};

const MASTER_TEAM_BY_UI: Record<LookupTeam, RequirementMasterOption["team"]> = {
    COPS: "Gops",
    GOPS: "Gops",
    UW: "UW",
};

const EMPTY_OPTIONS: Option[] = [];
const EMPTY_REQUIREMENT_MASTER_ROWS: RequirementMasterOption[] = [];
const DRS_NEW_TAB_CONTEXT_KEY = "drsNewTabContext";

const REQUIRED_SELECTION_FIELDS: Array<Exclude<EditableField, "status" | "profile">> = [
    "team",
    "category",
    "subCategory",
    "document",
    "reason",
];

const getRequiredSelectionFields = (requiresProfile: boolean) =>
    (requiresProfile
        ? (["team", "profile", "category", "subCategory", "document", "reason"] as const)
        : REQUIRED_SELECTION_FIELDS) as Array<Exclude<EditableField, "status">>;

const INITIAL_ROW_STATE: AdditionalRequirementRow = {
    team: "",
    profile: "",
    category: "",
    subCategory: "",
    document: "",
    specialTest: "",
    reason: "",
    fupCode: "",
    description: "",
    status: "",
    raisedDate: "",
    raisedBy: "",
    receivedDate: "",
    receivedBy: "",
    validity: "",
    userId: "",
    remarks: "",
    udsLink: "",
};

const uniqueNonEmpty = (values: string[]) =>
    Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));

const toSummaryEntries = (value: unknown): Array<Record<string, unknown>> => {
    if (Array.isArray(value)) {
        return value.filter(
            (entry): entry is Record<string, unknown> =>
                !!entry && typeof entry === "object" && !Array.isArray(entry),
        );
    }

    if (value && typeof value === "object") {
        return [value as Record<string, unknown>];
    }

    return [];
};

const getSelectedCaseContext = (): Record<string, unknown> => {
    try {
            const parsed = JSON.parse(localStorage.getItem("selectedCaseContext") || "{}");
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : {};
    } catch {
        return {};
    }
};

const toOption = (value: string): Option => ({ label: value, value });

const dedupeOptions = (options: Option[]) => {
    const seen = new Set<string>();
    const result: Option[] = [];
    for (const opt of options) {
        const key = String(opt?.value ?? opt?.label ?? "").trim();
        if (!key) continue;
        if (seen.has(key)) continue;
        seen.add(key);
        result.push({ label: opt.label, value: opt.value });
    }
    return result;
};

const getTodayDate = () => new Date().toISOString().slice(0, 10);

const getCurrentActor = () =>
    String(
        localStorage.getItem("username") ??
        localStorage.getItem("userName") ??
        localStorage.getItem("userId") ??
        "System",
    ).trim() || "System";

const getCurrentUserId = () =>
    String(localStorage.getItem("userId") ?? localStorage.getItem("username") ?? "").trim();

const normalizeIdentifier = (value: string) => value.trim().toLowerCase();

const getCurrentUserIdentifiers = () =>
    uniqueNonEmpty([
        String(localStorage.getItem("userId") ?? ""),
        String(localStorage.getItem("username") ?? ""),
        String(localStorage.getItem("userName") ?? ""),
    ]).map(normalizeIdentifier);

const isRaisedByCurrentUser = (row: Pick<AdditionalRequirementRow, "raisedBy" | "userId">) => {
    const currentUserIdentifiers = getCurrentUserIdentifiers();

    if (currentUserIdentifiers.length === 0) {
        return false;
    }

    return [row.userId, row.raisedBy]
        .map((value) => normalizeIdentifier(String(value ?? "")))
        .some((value) => value && currentUserIdentifiers.includes(value));
};

const clearErrors = (errors: RowErrors | undefined, keys: Array<keyof RowErrors>): RowErrors => {
    const next = { ...(errors ?? {}) };
    keys.forEach((key) => {
        delete next[key];
    });
    return next;
};

const getDefaultTeam = (): LookupTeam => {
    const roleType = String(localStorage.getItem("roleType") ?? "").toLowerCase();

    if (roleType.includes("cvt")) {
        return "COPS";
    }

    if (roleType.includes("dvt") || roleType.includes("gops")) {
        return "GOPS";
    }

    return "UW";
};

// mapStoredTeamToDisplay removed — use mapDisplayTeamToStored or master mapping where needed

const normalizeStatus = (status: string) => {
    const trimmed = status.trim();
    return trimmed || "Pending";
};

const isPendingStatus = (status: string) => status.trim().toLowerCase() === "pending";

const getMasterTeamForUiValue = (team: string) => MASTER_TEAM_BY_UI[team as LookupTeam];

const getScopedMasterRows = (
    row: Pick<AdditionalRequirementRow, "team" | "profile" | "category" | "subCategory" | "document" | "reason">,
    requirementMasterRows: RequirementMasterOption[],
) => {
    const masterTeam = getMasterTeamForUiValue(row.team);
    if (!masterTeam) {
        return [];
    }

    return requirementMasterRows.filter(
        (entry) =>
            entry.team === masterTeam &&
            (!row.profile || !entry.profile || entry.profile === row.profile) &&
            (!row.category || entry.category === row.category) &&
            (!row.subCategory || entry.subCategory === row.subCategory) &&
            (!row.document || entry.document === row.document) &&
            (!row.reason || entry.reason === row.reason),
    );
};

const applyLookupToRow = (
    row: EditableRequirementRow,
    requiresProfile: boolean,
    requirementMasterRows: RequirementMasterOption[],
): EditableRequirementRow => {
    if (!row.__isDraft) {
        return row;
    }

    const nextErrors = clearErrors(row.__errors, ["lookup"]);
    const requiredSelectionFields = getRequiredSelectionFields(requiresProfile);
    const hasCompleteSelection = requiredSelectionFields.every((field) =>
        String(row[field] ?? "").trim(),
    );

    if (!hasCompleteSelection) {
        return {
            ...row,
            fupCode: "",
            description: "",
            specialTest: "",
            __lookupMessage: "",
            __errors: nextErrors,
        };
    }

    const matches = getScopedMasterRows(row, requirementMasterRows);

    if (matches.length === 1) {
        return {
            ...row,
            fupCode: matches[0].fupCode,
            description: matches[0].description,
            specialTest: String(matches[0].specialTest ?? ""),
            __lookupMessage: "",
            __errors: nextErrors,
        };
    }

    return {
        ...row,
        fupCode: "TRS",
        description: "",
        specialTest: "",
        __lookupMessage: "",
        __errors: nextErrors,
    };
};

const createDraftRow = (): EditableRequirementRow => ({
    ...INITIAL_ROW_STATE,
    team: getDefaultTeam(),
    // store status as code where possible (use 'PEN' for Pending by default)
    status: "PEN",
    raisedDate: getTodayDate(),
    raisedBy: getCurrentActor(),
    userId: getCurrentUserId(),
    __rowId: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    __isDraft: true,
    __isLocal: true,
    __isNewLocal: true,
    __errors: {},
    __lookupMessage: "",
});

const normalizeExistingRow = (row: AdditionalRequirementRow, index: number): EditableRequirementRow => {
    const baseId = String(row.udsLink ?? row.fupCode ?? row.raisedDate ?? "").trim();
    const uniqueId = baseId ? `${baseId}-${index}` : `existing-${index}`;

    return {
        ...INITIAL_ROW_STATE,
        ...row,
        // existing row.status may be an object or string; prefer storing code if available
        status: ((): string => {
            try {
                const raw = row.status as unknown;
                if (!raw) return normalizeStatus("");
                if (typeof raw === "string") return normalizeStatus(raw);
                if (typeof raw === "object") {
                    const obj = raw as Record<string, unknown>;
                    const code = String(obj.code ?? obj.value ?? obj.description ?? "").trim();
                    return normalizeStatus(code || "");
                }
                return normalizeStatus(String(raw ?? ""));
            } catch {
                return normalizeStatus(String(row.status ?? ""));
            }
        })(),
        __rowId: uniqueId,
        __isDraft: false,
        __isLocal: false,
        __errors: {},
        __lookupMessage: "",
    };
};


interface RequirementManagementTableProps {
    requirements?: AdditionalRequirementRow[];
}

interface RequirementManagementTableProps {
    requirements?: AdditionalRequirementRow[];
}

const RequirementManagementTable = ({ requirements }: RequirementManagementTableProps) => {
    const roleType = String(localStorage.getItem("roleType") ?? "");
    const { businessType, applicationNumber } = useAppContext();
    const normalizedRoleType = roleType.trim().toLowerCase();
    const isCvtOrDvtRole = normalizedRoleType.includes("CVT_TASK") || normalizedRoleType.includes("dvt");
    const shouldShowProfileAndSpecialTest = !isCvtOrDvtRole;

    const mapBreRequirementToRow = (item: BreRequirementRow): AdditionalRequirementRow => {
        return {
            team: getDefaultTeam(),
            profile: "",
            category: String(item.requirementType ?? ""),
            subCategory: "",
            document: "",
            specialTest: String(item.metaphorName ?? ""),
            reason: String(item.requirementValue ?? ""),
            fupCode: String(item.ruleId ?? ""),
            description: String(item.ruleName ?? item.requirementValue ?? ""),
            status: "Pending",
            raisedDate: getTodayDate(),
            raisedBy: getCurrentActor(),
            receivedDate: "",
            receivedBy: "",
            validity: "",
            userId: getCurrentUserId(),
            remarks: "",
            udsLink: "",
        } as AdditionalRequirementRow;
    };
    const reduxRequirements = useSelector((state: RootState) => {
        const drsData = state.drs.data as unknown as Record<string, unknown> | null;

        // support both flat and nested `data` structures from DRS API
        const requirementManagement = (drsData?.requirementManagement ?? (drsData?.data as any)?.requirementManagement) as
            | unknown
            | undefined;
        if (Array.isArray(requirementManagement) && requirementManagement.length > 0) {
            return requirementManagement as AdditionalRequirementRow[];
        }

        const directRequirements = drsData?.requirements;
        if (Array.isArray(directRequirements)) {
            return directRequirements as AdditionalRequirementRow[];
        }

        const breOutput = (drsData?.externalAPIs as Record<string, unknown> | undefined)?.breOutput as
            | Record<string, unknown>
            | undefined;
        const breRequirements = breOutput?.requirements;
        if (Array.isArray(breRequirements) && breRequirements.length > 0) {
            return breRequirements.map((item) =>
                mapBreRequirementToRow(item as BreRequirementRow),
            );
        }

        return [];
    });
    const drsData = useSelector((state: RootState) => state.drs.data as unknown);
    const masters = useSelector((state: RootState) => state.drs.masters);
    const effectiveRequirementMasterRows = EMPTY_REQUIREMENT_MASTER_ROWS;
    const requirementProfileOptions = EMPTY_OPTIONS;
    const requirementCategoryOptions = EMPTY_OPTIONS;
    const requirementSubCategoryOptions = EMPTY_OPTIONS;
    const requirementDocumentOptions = EMPTY_OPTIONS;
    const requirementReasonOptions = EMPTY_OPTIONS;

    const [teamOptionsState, setTeamOptionsState] = useState<Option[]>(EMPTY_OPTIONS);
    // profile options are now derived from masters.misc (type: PROFILE) and are standalone
    const [profileOptionsState, setProfileOptionsState] = useState<Option[]>(EMPTY_OPTIONS);
    const [requirementOptionsCache, setRequirementOptionsCache] = useState<Record<string, Option[]>>({});
    const [requirementStatusOptions, setRequirementStatusOptions] = useState<Option[]>(EMPTY_OPTIONS);

    const isVisible = roleType !== "Ready For Issuance Pool" && roleType !== "DVT_FORMAL_TASK" && roleType !== "Exceptional Pool";
    const teamOptions = teamOptionsState;
    const finalRequirements = requirements ?? reduxRequirements;
    const normalizedExistingRows = useMemo(
        () => finalRequirements.map((row, index) => normalizeExistingRow(row, index)),
        [finalRequirements],
    );

    const [localRows, setLocalRows] = useState<EditableRequirementRow[]>([]);
    const [lastAddedDraftRowId, setLastAddedDraftRowId] = useState<string | null>(null);
    const [isTableSaved, setIsTableSaved] = useState(false);
    const [hasRequirementChanges, setHasRequirementChanges] = useState(false);
    const [editableStatusRowIds, setEditableStatusRowIds] = useState<Set<string>>(() => new Set());
    const [sourceRowOverrides, setSourceRowOverrides] = useState<
        Record<string, Pick<EditableRequirementRow, "status" | "receivedDate" | "receivedBy">>
    >({});
    const [deletedRowIds, setDeletedRowIds] = useState<Set<string>>(() => new Set());
    const [descriptionDialogOpen, setDescriptionDialogOpen] = useState(false);
    const [descriptionDialogText, setDescriptionDialogText] = useState("");

    const [savedPage, setSavedPage] = useState(0);
    const PAGE_SIZE = 5;

    // Ensure existing rows are editable on initial load only. After a successful save
    // the handler clears `editableStatusRowIds` so saved rows become read-only.
    const _editableInitRef = useRef(false);
    useEffect(() => {
        if (_editableInitRef.current) return;
        const ids = new Set<string>(normalizedExistingRows.map((r) => r.__rowId));
        if (ids.size > 0) {
            setEditableStatusRowIds(ids);
            _editableInitRef.current = true;
        }
    }, [normalizedExistingRows]);

    const rows = useMemo(
        () => [
            ...localRows,
            ...normalizedExistingRows
                .filter((row) => !deletedRowIds.has(row.__rowId))
                .map((row) => ({
                    ...row,
                    ...(sourceRowOverrides[row.__rowId] ?? {}),
                })),
        ],
        [localRows, normalizedExistingRows, sourceRowOverrides, deletedRowIds],
    );

    const anyPending = useMemo(() => rows.some((r) => isPendingStatus(String(r.status ?? ""))), [rows]);

    const openDescriptionDialog = (text: string) => {
        setDescriptionDialogText(text);
        setDescriptionDialogOpen(true);
    };

    const closeDescriptionDialog = () => {
        setDescriptionDialogOpen(false);
        setDescriptionDialogText("");
    };

    const safeBusinessType =
        normalizeBusinessType(businessType) ??
        normalizeBusinessType(localStorage.getItem("businessType")) ??
        "retail";
    const safeApplicationNumber = applicationNumber ?? "";
    const selectedApplicantTab = localStorage.getItem("drsSelectedApplicantTab") ?? "proposer";

    const summaryEntries = toSummaryEntries(
        (drsData as { summary?: unknown } | null)?.summary,
    );

    const selectedSummary = summaryEntries.find((entry, index) => {
        const memberType = String(entry.memberType ?? "").trim().toUpperCase();

        if (memberType === "PROPOSER" || memberType.includes("PR")) {
            return selectedApplicantTab === "proposer";
        }

        if (memberType === "LIFEASSURED1" || memberType === "LIFE ASSURED 1") {
            return selectedApplicantTab === "lifeassured1";
        }

        if (memberType === "LIFEASSURED2" || memberType === "LIFE ASSURED 2") {
            return selectedApplicantTab === "lifeassured2";
        }

        if (memberType.includes("LA") || memberType.includes("LIFE")) {
            return (index === 1 && selectedApplicantTab === "lifeassured1") || (index > 1 && selectedApplicantTab === "lifeassured2");
        }

        return index === 0 && selectedApplicantTab === "proposer";
    }) ?? summaryEntries[0];

    const summaryPersonal = (selectedSummary?.personalDetails as Record<string, unknown> | undefined) ?? {};
    const proposalFormAndDocumentsLink = String(
        (drsData as any)?.quickLinks?.proposerForm ?? (drsData as any)?.data?.quickLinks?.proposerForm ?? summaryPersonal.UDSLink ?? "",
    ).trim();

    const openLinkInNewTab = (path: string) => {
        const trimmedPath = path.trim();
        if (!trimmedPath) {
            return;
        }

        if (/^https?:\/\//i.test(trimmedPath)) {
            window.open(trimmedPath, "_blank");
            return;
        }

        const targetUrl = new URL(trimmedPath, window.location.origin).toString();
        window.open(targetUrl, "_blank");
    };

    const mapDisplayTeamToStored = (display: string) => {
        const normalized = String(display ?? "").trim().toLowerCase();
        if (!normalized) return "";
        if (normalized.includes("cvt")) return "COPS";
        if (normalized.includes("dvt") || normalized === "dvt team" || normalized === "dvt") return "GOPS";
        if (normalized === "uw") return "UW";
        if (normalized === "system requirement") return "System Requirement";
        return display;
    };

    const persistNewTabContext = () => {
        const drsRecord = drsData as Record<string, unknown> | null;
        const externalApis = (drsRecord?.externalAPIs as Record<string, unknown> | undefined) ?? {};
        const partyId = String(selectedSummary?.partyId ?? "").trim();

        const payload = {
            applicationNumber: safeApplicationNumber,
            partyId,
            selectedApplicantTab,
            breDecision: drsRecord?.breDecision ?? externalApis.breOutput ?? null,
            applicantProfile: selectedSummary ?? null,
            savedAt: Date.now(),
        };

        localStorage.setItem(DRS_NEW_TAB_CONTEXT_KEY, JSON.stringify(payload));
    };

    const selectedCaseContext = getSelectedCaseContext();
    const selectedCaseRoleType = String(selectedCaseContext.roleType ?? "").trim();
    const selectedCaseIsMedical = Boolean(
        (selectedCaseContext as { isMedical?: unknown }).isMedical ??
        (drsData as { isMedical?: unknown } | null)?.isMedical,
    );
    // prefer using requirementManagement from DRS if present (handled in selector)
    const effectiveCptRoleType = roleType === "CPT_TASK"
        ? (selectedCaseRoleType || (selectedCaseIsMedical ? "CPT_DATA_ENTRY_MR_TASK" : "CPT_DATA_ENTRY_NMR_TASK"))
        : roleType;
    const showCptActionButtons = effectiveCptRoleType === "CPT_DATA_ENTRY_NMR_TASK"
        || effectiveCptRoleType === "CPT_DATA_ENTRY_MR_TASK"
        || roleType === "CPT_TASK";
    const cptSecondaryAction = effectiveCptRoleType === "CPT_DATA_ENTRY_NMR_TASK"
        ? {
            label: "View Financial",
            path: safeApplicationNumber ? getFinancialPath(safeBusinessType, safeApplicationNumber) : "",
        }
        : {
            label: "View Medicals",
            path: safeApplicationNumber ? getMedicalPath(safeBusinessType, safeApplicationNumber) : "",
        };

    useEffect(() => {
        saveLocalRequirementRows(drsData, rows.map((row) => ({ status: row.status })), hasRequirementChanges);
    }, [drsData, hasRequirementChanges, rows]);
    const savedRows = useMemo(() => rows.filter((row) => !row.__isDraft), [rows]);
    const draftRows = useMemo(() => rows.filter((row) => row.__isDraft), [rows]);

    const totalSavedPages = Math.max(1, Math.ceil(savedRows.length / PAGE_SIZE));
    const pagedSavedRows = savedRows.slice(savedPage * PAGE_SIZE, (savedPage + 1) * PAGE_SIZE);

    useEffect(() => {
        if (savedPage >= totalSavedPages) {
            setSavedPage(0);
        }
    }, [savedRows.length, savedPage, totalSavedPages]);

    const savedRequirementTableSx = {
        "& .MuiFormControl-root": {
            minWidth: 0,
            width: "100%",
        },
        "& .MuiInputBase-root": {
            height: 32,
            minWidth: 0,
            width: "100%",
            fontSize: "11px",
        },
        "& .MuiSelect-select": {
            px: "6px !important",
            py: "6px !important",
            minHeight: "unset !important",
            whiteSpace: "nowrap !important",
            overflow: "hidden",
            textOverflow: "ellipsis",
        },
    } as const;

    useEffect(() => {
        const handleOpenRequirementManagement = (event: Event) => {
            const { openAddRequirement } = (event as OpenRequirementManagementEvent).detail ?? {};

            if (!openAddRequirement || !isVisible) {
                return;
            }

            let didAdd = false;
            setLocalRows((previousRows) => {
                const currentUserHasRaisedRequirement = [...normalizedExistingRows, ...previousRows].some(
                    isRaisedByCurrentUser,
                );
                if (currentUserHasRaisedRequirement) {
                    return previousRows;
                }

                setIsTableSaved(false);
                setHasRequirementChanges(true);
                didAdd = true;
                return [createDraftRow(), ...previousRows];
            });

            // If a draft row was added, prefetch master data for the default team
            // using the same payload/key shape as team selection so dropdowns are primed.
            if (didAdd) {
                (async () => {
                    try {
                        const defaultTeam = getDefaultTeam();
                        const payloadBody: Record<string, string> = { team: defaultTeam };
                        const payload = { types: ["requirement_mst"], requirementMst: payloadBody };
                        const cacheKeyObj = { team: defaultTeam };
                        const cacheKey = JSON.stringify(cacheKeyObj);

                        if (!requirementOptionsCache[cacheKey]) {
                            const mst = await fetchRequirementMst(payload);
                            const entries = parseFirstArrayFromRequirementMst(mst);
                            const opts = entries.map(toOption);
                            cacheOptionsForPayload(cacheKeyObj, opts);
                        }
                    } catch (e) {
                        // ignore
                    }
                })();
            }
        };

        window.addEventListener(OPEN_REQUIREMENT_MANAGEMENT_EVENT, handleOpenRequirementManagement);

        return () => {
            window.removeEventListener(OPEN_REQUIREMENT_MANAGEMENT_EVENT, handleOpenRequirementManagement);
        };
    }, [isVisible, normalizedExistingRows, requirementOptionsCache, shouldShowProfileAndSpecialTest]);

    useEffect(() => {
        if (!lastAddedDraftRowId) return;
        const id = lastAddedDraftRowId;
        // allow DOM to update before querying
        requestAnimationFrame(() => {
            const el = document.getElementById(id);
            if (el) {
                try {
                    // Scroll the document so the element appears near the top with some offset
                    const rect = el.getBoundingClientRect();
                    const offset = 80; // leave some space from the top
                    const absoluteTop = rect.top + window.scrollY - offset;
                    window.scrollTo({ top: Math.max(0, absoluteTop), behavior: "smooth" });
                } catch {
                    // fallback to element scrollIntoView
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }

                const control = el.querySelector('input, select, textarea, button, [tabindex]') as HTMLElement | null;
                if (control) control.focus();
            }
            setLastAddedDraftRowId(null);
        });
    }, [lastAddedDraftRowId]);

    const getCategoryOptions = (row: EditableRequirementRow) => {
        // Category is fetched by team only now — profile is standalone
        const payload: Record<string, string> = { team: row.team };
        const cacheKey = JSON.stringify(payload);
        return requirementOptionsCache[cacheKey] ?? requirementCategoryOptions;
    };

    const getProfileOptions = () => {
        // Profile dropdown is standalone and sourced from masters.misc (type: 'PROFILE')
        return profileOptionsState.length > 0 ? profileOptionsState : requirementProfileOptions;
    };

    const getSubCategoryOptions = (row: EditableRequirementRow) => {
        const payload: Record<string, string> = { team: row.team };
        if (String(row.category ?? "").trim()) payload.category = row.category;
        const cacheKey = JSON.stringify(payload);
        return requirementOptionsCache[cacheKey] ?? requirementSubCategoryOptions;
    };

    const getDocumentOptions = (row: EditableRequirementRow) => {
        const payload: Record<string, string> = { team: row.team };
        if (String(row.category ?? "").trim()) payload.category = row.category;
        if (String(row.subCategory ?? "").trim()) payload.subCategory = row.subCategory;
        const cacheKey = JSON.stringify(payload);
        return requirementOptionsCache[cacheKey] ?? requirementDocumentOptions;
    };

    const getReasonOptions = (row: EditableRequirementRow) => {
        const payload: Record<string, string> = { team: row.team };
        if (String(row.category ?? "").trim()) payload.category = row.category;
        if (String(row.subCategory ?? "").trim()) payload.subCategory = row.subCategory;
        if (String(row.document ?? "").trim()) payload.document = row.document;
        const cacheKey = JSON.stringify(payload);
        return requirementOptionsCache[cacheKey] ?? requirementReasonOptions;
    };

    const getFupCodeOptions = (row: EditableRequirementRow): Option[] => {
        const payload = {
            team: row.team || "",
            category: row.category || "",
            subCategory: row.subCategory || "",
            document: row.document || "",
            reason: row.reason || "",
            fupCodes: true,
        };
        const key = JSON.stringify(payload);
        return requirementOptionsCache[key] ?? [];
    };

    function parseFirstArrayFromRequirementMst(mst: unknown): string[] {
        if (!mst || typeof mst !== "object") return [];
        const obj = mst as Record<string, unknown>;
        // Prefer known keys
        const preferredKeys = ["teams", "profiles", "categories", "subCategories", "documents", "reasons", "profile", "category", "subCategory", "document", "reason"];
        for (const key of preferredKeys) {
            const v = obj[key];
            if (Array.isArray(v) && v.length > 0) {
                return v.map(String);
            }
        }

        // Fallback: first property that's an array
        for (const key of Object.keys(obj)) {
            const v = obj[key];
            if (Array.isArray(v) && v.length > 0) return v.map(String);
        }

        return [];
    }

    async function fetchRequirementMst(payload: unknown) {
        try {
            console.debug("RequirementManagement: fetching masters with payload:", payload, "url:", apiUrl("masters"));
            const data = await apiRequest<Record<string, unknown>>({ url: apiUrl("masters"), method: "POST", body: payload });
            // mock file structure: { data: { requirement_mst: { ... } } }
            const mst = (data as any)?.data?.requirement_mst ?? (data as any)?.requirement_mst ?? data;
            return mst;
        } catch (err) {
            console.debug("RequirementManagement: fetch masters failed", err);
            return null;
        }
    }

    function cacheOptionsForPayload(payload: Record<string, unknown>, options: Option[]) {
        const key = JSON.stringify(payload);
        console.debug("RequirementManagement: caching options for", payload, options);
        setRequirementOptionsCache((prev) => ({ ...prev, [key]: options }));
    }

    useEffect(() => {
        const loadInitial = async () => {
            // load teams (requirement_mst) as before
            try {
                const payload = { types: ["requirement_mst"] };
                const mst = await fetchRequirementMst(payload);
                if (mst) {
                    const teams = parseFirstArrayFromRequirementMst(mst);
                    const opts = teams.map(toOption);
                    setTeamOptionsState(opts.length > 0 ? opts : EMPTY_OPTIONS);
                    cacheOptionsForPayload(payload, opts);
                }
            } catch (e) {
                // ignore
            }

            // Prefer masters.misc-based status values when available (code === 'REQT_ST')
            let foundFromMisc = false;
            try {
                const toMasterList = (options?: unknown) => {
                    if (Array.isArray(options)) return options as unknown[];
                    if (!options || typeof options !== "object") return [] as unknown[];

                    const record = options as Record<string, unknown>;
                    if (Array.isArray(record.data)) return record.data as unknown[];
                    if (Array.isArray(record.options)) return record.options as unknown[];
                    if (Array.isArray(record.values)) return record.values as unknown[];

                    return Object.values(record).flatMap((v) => (Array.isArray(v) ? v : []));
                };
                // Search for misc across common shapes: masters.misc, masters.data.misc, masters.data, or masters itself
                const candidateSources = [
                    (masters as any)?.misc,
                    (masters as any)?.data?.misc,
                    (masters as any)?.data,
                    masters,
                ];

                const rawList = candidateSources
                    .flatMap((src) => toMasterList(src))
                    .filter(Boolean) as Array<Record<string, unknown>>;

                try {
                    // eslint-disable-next-line no-console
                    console.debug("RequirementManagement: candidateSources:", candidateSources);
                    // eslint-disable-next-line no-console
                    console.debug("RequirementManagement: rawList length:", rawList.length);
                } catch {
                    // ignore
                }
                // misc entries use `type: 'REQT_ST'` to indicate requirement-status rows
                const statusRaw = rawList.filter((opt) => String(opt?.type ?? "").trim().toUpperCase() === "REQT_ST");
                if (statusRaw.length > 0) {
                    const extractString = (v: unknown): string => {
                        if (v === null || v === undefined) return "";
                        if (typeof v === "string") return v.trim();
                        if (typeof v === "number" || typeof v === "boolean") return String(v);
                        if (typeof v === "object") {
                            try {
                                // try common fields
                                const obj = v as Record<string, unknown>;
                                const candidates = ["label", "description", "value", "name", "code", "key"];
                                for (const k of candidates) {
                                    const vv = obj[k];
                                    if (typeof vv === "string" && vv.trim()) return vv.trim();
                                    if ((typeof vv === "number" || typeof vv === "boolean") && String(vv).trim()) return String(vv);
                                }
                                // fallback: find first primitive property
                                for (const key of Object.keys(obj)) {
                                    const vv = obj[key];
                                    if (typeof vv === "string" && vv.trim()) return vv.trim();
                                    if ((typeof vv === "number" || typeof vv === "boolean") && String(vv).trim()) return String(vv);
                                }
                            } catch {
                                // ignore
                            }
                        }
                        return "";
                    };

                    const mapped = statusRaw
                        .map((option) => {
                            const code = extractString(option.code ?? option.key ?? "");
                            const rawValue = extractString(option.value ?? "");
                            const description = extractString(option.description ?? option.label ?? "");
                            // prefer code as value, and description as label
                            const val = code || rawValue || description;
                            const lab = description || rawValue || code;
                            if (!val && !lab) return null;
                            return { label: lab, value: val, description } as Option & { description?: string };
                        })
                        .filter(Boolean) as Option[];

                    try {
                        // eslint-disable-next-line no-console
                        console.debug("RequirementManagement: statusRaw length:", statusRaw.length, "mapped:", mapped);
                    } catch {
                        // ignore
                    }

                    if (mapped.length > 0) {
                        foundFromMisc = true;
                        const unique = dedupeOptions(mapped).map((o) => ({
                            ...o,
                            label: (String(o.label ?? "") || "").trim()
                                ? String(o.label).charAt(0).toUpperCase() + String(o.label).slice(1).toLowerCase()
                                : String(o.label ?? ""),
                            description: (String(o.description ?? "") || "").trim()
                                ? String(o.description).charAt(0).toUpperCase() + String(o.description).slice(1).toLowerCase()
                                : String(o.description ?? ""),
                        }));
                        setRequirementStatusOptions(unique);
                        cacheOptionsForPayload({ types: ["requirementStatus"] }, unique);
                    }
                }
            } catch (e) {
                // ignore
            }

            // Prefer masters.misc-based profile values when available (type === 'PROFILE')
            try {
                const toMasterList = (options?: unknown) => {
                    if (Array.isArray(options)) return options as unknown[];
                    if (!options || typeof options !== "object") return [] as unknown[];

                    const record = options as Record<string, unknown>;
                    if (Array.isArray(record.data)) return record.data as unknown[];
                    if (Array.isArray(record.options)) return record.options as unknown[];
                    if (Array.isArray(record.values)) return record.values as unknown[];

                    return Object.values(record).flatMap((v) => (Array.isArray(v) ? v : []));
                };

                const candidateSources = [
                    (masters as any)?.misc,
                    (masters as any)?.data?.misc,
                    (masters as any)?.data,
                    masters,
                ];

                const rawList = candidateSources
                    .flatMap((src) => toMasterList(src))
                    .filter(Boolean) as Array<Record<string, unknown>>;

                const profileRaw = rawList.filter((opt) => String(opt?.type ?? "").trim().toUpperCase() === "PROFILE");
                if (profileRaw.length > 0) {
                    const extractString = (v: unknown): string => {
                        if (v === null || v === undefined) return "";
                        if (typeof v === "string") return v.trim();
                        if (typeof v === "number" || typeof v === "boolean") return String(v);
                        if (typeof v === "object") {
                            try {
                                const obj = v as Record<string, unknown>;
                                const candidates = ["label", "description", "value", "name", "code", "key"];
                                for (const k of candidates) {
                                    const vv = obj[k];
                                    if (typeof vv === "string" && vv.trim()) return vv.trim();
                                    if ((typeof vv === "number" || typeof vv === "boolean") && String(vv).trim()) return String(vv);
                                }
                                for (const key of Object.keys(obj)) {
                                    const vv = obj[key];
                                    if (typeof vv === "string" && vv.trim()) return vv.trim();
                                    if ((typeof vv === "number" || typeof vv === "boolean") && String(vv).trim()) return String(vv);
                                }
                            } catch {
                                // ignore
                            }
                        }
                        return "";
                    };

                    const mapped = profileRaw
                        .map((option) => {
                            const code = extractString(option.code ?? option.key ?? option.value ?? "");
                            const rawValue = extractString(option.value ?? option.description ?? option.label ?? "");
                            const description = extractString(option.description ?? option.label ?? "");
                            const val = code || rawValue || description;
                            const lab = description || rawValue || code;
                            if (!val && !lab) return null;
                            return { label: lab, value: val, description } as Option & { description?: string };
                        })
                        .filter(Boolean) as Option[];

                    if (mapped.length > 0) {
                        const unique = dedupeOptions(mapped).map((o) => ({
                            ...o,
                            label: (String(o.label ?? "") || "").trim()
                                ? String(o.label).charAt(0).toUpperCase() + String(o.label).slice(1).toLowerCase()
                                : String(o.label ?? ""),
                        }));
                        setProfileOptionsState(unique);
                        cacheOptionsForPayload({ types: ["profiles_from_misc"] }, unique);
                    }
                }
            } catch (e) {
                // ignore
            }

            // load requirement status master (try several possible keys returned by API)
            try {
                // If we already populated from misc, skip the generic status fetch to avoid overwriting
                if (foundFromMisc) return;
                const statusPayload = { types: ["requirementStatus", "requirement_status_master", "requirement_status"] };
                const resp = await apiRequest<Record<string, unknown>>({ url: apiUrl("masters"), method: "POST", body: statusPayload });
                const data = (resp as any)?.data ?? resp;

                const statusCandidates: unknown[] = [];
                const extractString = (v: unknown): string => {
                    if (v === null || v === undefined) return "";
                    if (typeof v === "string") return v.trim();
                    if (typeof v === "number" || typeof v === "boolean") return String(v);
                    if (typeof v === "object") {
                        try {
                            const obj = v as Record<string, unknown>;
                            const candidates = ["label", "description", "value", "name", "code", "key"];
                            for (const k of candidates) {
                                const vv = obj[k];
                                if (typeof vv === "string" && vv.trim()) return vv.trim();
                                if ((typeof vv === "number" || typeof vv === "boolean") && String(vv).trim()) return String(vv);
                            }
                            for (const key of Object.keys(obj)) {
                                const vv = obj[key];
                                if (typeof vv === "string" && vv.trim()) return vv.trim();
                                if ((typeof vv === "number" || typeof vv === "boolean") && String(vv).trim()) return String(vv);
                            }
                        } catch {
                            // ignore
                        }
                    }
                    return "";
                };
                const tryKeys = [
                    "requirementStatus",
                    "requirement_status_master",
                    "requirement_status",
                    "requirementStatusMaster",
                    "requirement_status_master"
                ];

                for (const key of tryKeys) {
                    const candidate = (data as any)?.[key] ?? (resp as any)?.[key];
                    if (Array.isArray(candidate) && candidate.length > 0) {
                        statusCandidates.push(...candidate);
                        break;
                    }
                }

                // fallback: if data.masterOptions-like shape exists, try to find the most
                // likely requirement-status array (prefer entries with type === 'REQT_ST'
                // or codes/descriptions like 'PEN'/'Pending'). Only fall back to the
                // first array if no better match is found.
                if (statusCandidates.length === 0 && data && typeof data === "object") {
                    const arrays: Array<unknown[]> = [];
                    for (const k of Object.keys(data as Record<string, unknown>)) {
                        const v = (data as Record<string, unknown>)[k];
                        if (Array.isArray(v) && v.length > 0) arrays.push(v as unknown[]);
                    }

                    const looksLikeReqStatus = (arr: unknown[]) => {
                        try {
                            return arr.some((item) => {
                                if (!item || typeof item !== "object") return false;
                                const obj = item as Record<string, unknown>;
                                const t = String(obj.type ?? "").trim().toUpperCase();
                                if (t === "REQT_ST") return true;
                                const code = String(obj.code ?? obj.key ?? "").trim().toUpperCase();
                                if (code === "PEN" || code === "PENDING") return true;
                                const desc = String(obj.description ?? obj.value ?? obj.label ?? "").toLowerCase();
                                if (desc.includes("pending")) return true;
                                return false;
                            });
                        } catch {
                            return false;
                        }
                    };

                    let chosen: unknown[] | null = null;
                    for (const arr of arrays) {
                        if (looksLikeReqStatus(arr)) {
                            chosen = arr;
                            break;
                        }
                    }

                    if (!chosen && arrays.length > 0) {
                        chosen = arrays[0];
                    }

                    if (chosen) statusCandidates.push(...chosen);
                }

                const statusOpts = statusCandidates.length > 0
                    ? statusCandidates
                          .map((c) => {
                              if (c === null || c === undefined) return null;
                              if (typeof c === "string") {
                                  const s = extractString(c);
                                  return s ? { label: s, value: s } as Option : null;
                              }
                              if (typeof c === "object") {
                                  const obj = c as Record<string, unknown>;
                                  const code = extractString(obj.code ?? obj.key ?? "");
                                  const rawValue = extractString(obj.value ?? "");
                                  const description = extractString(obj.description ?? obj.label ?? "");
                                  const val = code || rawValue || description;
                                  const lab = description || rawValue || code || String(val);
                                  return val ? ({ label: lab, value: val, description } as Option) : null;
                              }
                              return null;
                          })
                          .filter(Boolean) as Option[]
                    : EMPTY_OPTIONS;
                const uniqueStatusOpts = dedupeOptions(statusOpts).map((o) => ({
                    ...o,
                    label: (String(o.label ?? "") || "").trim()
                        ? String(o.label).charAt(0).toUpperCase() + String(o.label).slice(1).toLowerCase()
                        : String(o.label ?? ""),
                    description: (String(o.description ?? "") || "").trim()
                        ? String(o.description).charAt(0).toUpperCase() + String(o.description).slice(1).toLowerCase()
                        : String(o.description ?? ""),
                }));
                setRequirementStatusOptions(uniqueStatusOpts);
                cacheOptionsForPayload(statusPayload, uniqueStatusOpts);
            } catch (e) {
                // ignore failures to fetch status master
            }
        };

        loadInitial();
    }, []);

    // If masters are loaded/updated later, derive profile options from masters.misc (type === 'PROFILE')
    useEffect(() => {
        try {
            const toMasterList = (options?: unknown) => {
                if (Array.isArray(options)) return options as unknown[];
                if (!options || typeof options !== "object") return [] as unknown[];

                const record = options as Record<string, unknown>;
                if (Array.isArray(record.data)) return record.data as unknown[];
                if (Array.isArray(record.options)) return record.options as unknown[];
                if (Array.isArray(record.values)) return record.values as unknown[];

                return Object.values(record).flatMap((v) => (Array.isArray(v) ? v : []));
            };

            const candidateSources = [
                (masters as any)?.misc,
                (masters as any)?.data?.misc,
                (masters as any)?.data,
                masters,
            ];

            const rawList = candidateSources
                .flatMap((src) => toMasterList(src))
                .filter(Boolean) as Array<Record<string, unknown>>;

            const profileRaw = rawList.filter((opt) => String(opt?.type ?? "").trim().toUpperCase() === "PROFILE");
            if (profileRaw.length > 0) {
                const extractString = (v: unknown): string => {
                    if (v === null || v === undefined) return "";
                    if (typeof v === "string") return v.trim();
                    if (typeof v === "number" || typeof v === "boolean") return String(v);
                    if (typeof v === "object") {
                        try {
                            const obj = v as Record<string, unknown>;
                            const candidates = ["label", "description", "value", "name", "code", "key"];
                            for (const k of candidates) {
                                const vv = obj[k];
                                if (typeof vv === "string" && vv.trim()) return vv.trim();
                                if ((typeof vv === "number" || typeof vv === "boolean") && String(vv).trim()) return String(vv);
                            }
                            for (const key of Object.keys(obj)) {
                                const vv = obj[key];
                                if (typeof vv === "string" && vv.trim()) return vv.trim();
                                if ((typeof vv === "number" || typeof vv === "boolean") && String(vv).trim()) return String(vv);
                            }
                        } catch {
                            // ignore
                        }
                    }
                    return "";
                };

                const mapped = profileRaw
                    .map((option) => {
                        const code = extractString(option.code ?? option.key ?? option.value ?? "");
                        const rawValue = extractString(option.value ?? option.description ?? option.label ?? "");
                        const description = extractString(option.description ?? option.label ?? "");
                        const val = code || rawValue || description;
                        const lab = description || rawValue || code;
                        if (!val && !lab) return null;
                        return { label: lab, value: val, description } as Option & { description?: string };
                    })
                    .filter(Boolean) as Option[];

                if (mapped.length > 0) {
                    const unique = dedupeOptions(mapped).map((o) => ({
                        ...o,
                        label: (String(o.label ?? "") || "").trim()
                            ? String(o.label).charAt(0).toUpperCase() + String(o.label).slice(1).toLowerCase()
                            : String(o.label ?? ""),
                    }));
                    setProfileOptionsState(unique);
                    cacheOptionsForPayload({ types: ["profiles_from_misc"] }, unique);
                }
            }
        } catch {
            // ignore
        }
    }, [masters]);

    const updateRow = (rowId: string, updater: (row: EditableRequirementRow) => EditableRequirementRow) => {
        const currentRow = rows.find((row) => row.__rowId === rowId);
        if (!currentRow) {
            return;
        }

        if (currentRow.__isLocal) {
            setLocalRows((previousRows) =>
                previousRows.map((row) => (row.__rowId === rowId ? updater(row) : row)),
            );
            return;
        }

        const updatedRow = updater(currentRow);
        setSourceRowOverrides((previousOverrides) => ({
            ...previousOverrides,
            [rowId]: {
                status: updatedRow.status,
                receivedDate: updatedRow.receivedDate,
                receivedBy: updatedRow.receivedBy,
            },
        }));
    };

    const handleInlineChange = (rowId: string, field: EditableField, value: string) => {
        setIsTableSaved(false);
        setHasRequirementChanges(true);
        if (field === "status") {
            setEditableStatusRowIds((previousIds) => new Set(previousIds).add(rowId));
        }
        const currentRowBefore = rows.find((r) => r.__rowId === rowId);

        updateRow(rowId, (row) => {
            const nextErrors = clearErrors(row.__errors, [field, "lookup"]);

            if (field === "status") {
                return {
                    ...row,
                    status: value,
                    receivedDate:
                        !row.__isDraft && isPendingStatus(row.status) && !isPendingStatus(value)
                            ? row.receivedDate || getTodayDate()
                            : row.receivedDate,
                    receivedBy:
                        !row.__isDraft && isPendingStatus(row.status) && !isPendingStatus(value)
                            ? row.receivedBy || getCurrentActor()
                            : row.receivedBy,
                    __errors: nextErrors,
                };
            }

            let nextRow: EditableRequirementRow;

            switch (field) {
                case "team":
                    nextRow = {
                        ...row,
                        team: value,
                        category: "",
                        subCategory: "",
                        document: "",
                        reason: "",
                        fupCode: "",
                        description: "",
                        __lookupMessage: "",
                        __errors: nextErrors,
                    };
                    break;
                case "category":
                    nextRow = {
                        ...row,
                        category: value,
                        subCategory: "",
                        document: "",
                        reason: "",
                        fupCode: "",
                        description: "",
                        __lookupMessage: "",
                        __errors: nextErrors,
                    };
                    break;
                case "profile":
                    nextRow = {
                        ...row,
                        profile: value,
                        category: "",
                        subCategory: "",
                        document: "",
                        reason: "",
                        fupCode: "",
                        description: "",
                        specialTest: "",
                        __lookupMessage: "",
                        __errors: nextErrors,
                    };
                    break;
                case "subCategory":
                    nextRow = {
                        ...row,
                        subCategory: value,
                        document: "",
                        reason: "",
                        fupCode: "",
                        description: "",
                        __lookupMessage: "",
                        __errors: nextErrors,
                    };
                    break;
                case "document":
                    nextRow = {
                        ...row,
                        document: value,
                        reason: "",
                        fupCode: "",
                        description: "",
                        __lookupMessage: "",
                        __errors: nextErrors,
                    };
                    break;
                case "reason":
                    nextRow = {
                        ...row,
                        reason: value,
                        fupCode: "",
                        description: "",
                        __lookupMessage: "",
                        __errors: nextErrors,
                    };
                    break;
                case "fupCode":
                    nextRow = {
                        ...row,
                        fupCode: value,
                        // leave description/specialTest to be populated by fetch below
                        __errors: nextErrors,
                    };
                    break;
                default:
                    nextRow = {
                        ...row,
                        [field]: value,
                        __errors: nextErrors,
                    } as EditableRequirementRow;
                    break;
            }

            return applyLookupToRow(nextRow, shouldShowProfileAndSpecialTest, effectiveRequirementMasterRows);
        });

        // fetch next level options based on selection (only for draft rows)
        (async () => {
            try {
                const before = currentRowBefore;
                if (!before) return;

                if (field === "team") {
                    // fetch categories and related options by team only; profile is independent
                    const payloadBody: Record<string, string> = { team: value };
                    const payload = { types: ["requirement_mst"], requirementMst: payloadBody };
                    const cacheKeyObj = { team: value };
                    const cacheKey = JSON.stringify(cacheKeyObj);
                    if (!requirementOptionsCache[cacheKey]) {
                        const mst = await fetchRequirementMst(payload);
                        const entries = parseFirstArrayFromRequirementMst(mst);
                        const opts = entries.map(toOption);
                        cacheOptionsForPayload(cacheKeyObj, opts);
                    }
                }

                if (field === "category") {
                    const teamVal = before.team || "";
                    const payload = { types:["requirement_mst"], requirementMst: { team: teamVal, category: value } };
                    const cacheKey = JSON.stringify({ team: teamVal, category: value });
                    if (!requirementOptionsCache[cacheKey]) {
                        const mst = await fetchRequirementMst(payload);
                        const entries = parseFirstArrayFromRequirementMst(mst);
                        const opts = entries.map(toOption);
                        cacheOptionsForPayload({ team: teamVal, category: value }, opts);
                    }
                }

                if (field === "subCategory") {
                    const teamVal = before.team || "";
                    const payload = { types:["requirement_mst"], requirementMst: { team: teamVal, category: before.category || "", subCategory: value } };
                    const cacheKey = JSON.stringify({ team: teamVal, category: before.category || "", subCategory: value });
                    if (!requirementOptionsCache[cacheKey]) {
                        const mst = await fetchRequirementMst(payload);
                        const entries = parseFirstArrayFromRequirementMst(mst);
                        const opts = entries.map(toOption);
                        cacheOptionsForPayload({ team: teamVal, category: before.category || "", subCategory: value }, opts);
                    }
                }

                if (field === "document") {
                    const teamVal = before.team || "";
                    const payload = { types:["requirement_mst"], requirementMst: { team: teamVal, category: before.category || "", subCategory: before.subCategory || "", document: value } };
                    const cacheKey = JSON.stringify({ team: teamVal, category: before.category || "", subCategory: before.subCategory || "", document: value });
                    if (!requirementOptionsCache[cacheKey]) {
                            const mst = await fetchRequirementMst(payload);
                            // Prefer explicit `reasons` array when API returns both documents and reasons
                            let entries: string[] = [];
                            try {
                                const candidate = (mst as any)?.data?.requirement_mst ?? mst;
                                if (candidate && typeof candidate === "object") {
                                    if (Array.isArray(candidate.reasons) && candidate.reasons.length > 0) {
                                        entries = candidate.reasons.map(String);
                                    } else {
                                        entries = parseFirstArrayFromRequirementMst(candidate);
                                    }
                                } else {
                                    entries = parseFirstArrayFromRequirementMst(mst);
                                }
                            } catch (e) {
                                entries = parseFirstArrayFromRequirementMst(mst);
                            }

                            const opts = entries.map(toOption);
                            cacheOptionsForPayload({ team: teamVal, category: before.category || "", subCategory: before.subCategory || "", document: value }, opts);
                    }
                }
                
                if (field === "reason") {
                    const teamVal = before.team || "";
                    const payloadBody: Record<string, string> = {
                        team: teamVal,
                        category: before.category || "",
                        subCategory: before.subCategory || "",
                        document: before.document || "",
                        reason: value,
                    };
                    const payload = { types: ["requirement_mst"], requirementMst: payloadBody };
                    const cacheKeyObj = payloadBody;
                    const cacheKey = JSON.stringify(cacheKeyObj);
                    let mstResponse: unknown = null;
                    if (!requirementOptionsCache[cacheKey]) {
                        mstResponse = await fetchRequirementMst(payload);
                        const entries = parseFirstArrayFromRequirementMst(mstResponse);
                        const opts = entries.map(toOption);
                        cacheOptionsForPayload(cacheKeyObj, opts);
                    } else {
                        // still try to fetch to obtain details in case cached options only exist
                        mstResponse = await fetchRequirementMst(payload);
                    }

                    try {
                        const mst = mstResponse as any;
                        let detail: any = null;

                        if (Array.isArray(mst) && mst.length > 0 && typeof mst[0] === "object") {
                            detail = mst[0];
                        } else if (mst && typeof mst === "object") {
                            // prefer known nested structures
                            detail = mst;
                            if (mst.data && mst.data.requirement_mst && typeof mst.data.requirement_mst === "object") {
                                detail = mst.data.requirement_mst;
                            }
                        }

                        if (detail) {
                                // Support explicit `requirements` array shape: map `code` -> fupCode, `description` -> description, `special` -> specialTest
                                const candidate = detail;
                                // Build FUP options when available
                                if (Array.isArray(candidate.requirements) && candidate.requirements.length > 0 && typeof candidate.requirements[0] === "object") {
                                    const fupOptions = candidate.requirements
                                        .map((req: Record<string, unknown>) => {
                                            const val = String(req.code ?? req.fupCode ?? req.fup_code ?? req.fup ?? "").trim();
                                            const lab = String(req.description ?? req.ruleName ?? req.desc ?? val).trim();
                                            const special = String(req.special ?? req.specialTest ?? req.special_test ?? "").trim();
                                            if (!val && !lab) return null;
                                            return { value: val || lab, label: lab || val, description: String(req.description ?? ""), specialTest: special } as Option & { specialTest?: string };
                                        })
                                        .filter(Boolean) as Array<Option & { specialTest?: string }>;

                                    if (fupOptions.length > 0) {
                                        const cacheKeyObj = { team: teamVal, category: before.category || "", subCategory: before.subCategory || "", document: before.document || "", reason: value, fupCodes: true };
                                        const uniqueMap = new Map<string, Option & { description?: string, specialTest?: string }>();
                                        for (const o of fupOptions) {
                                            uniqueMap.set(String(o.value), o);
                                        }
                                        const unique = Array.from(uniqueMap.values());
                                        cacheOptionsForPayload(cacheKeyObj, unique.map((o) => ({ label: o.label, value: o.value, description: o.description, specialTest: (o as any).specialTest })));
                                    }

                                    // Use first requirement to populate fields as before
                                    const req = candidate.requirements[0] as Record<string, unknown>;
                                    const fup = String(req.code ?? req.fupCode ?? req.fup_code ?? req.fup ?? "").trim();
                                    const desc = String(req.description ?? req.desc ?? req.ruleName ?? "").trim();
                                    const specialTest = String(req.special ?? req.specialTest ?? req.special_test ?? "").trim();

                                    if (fup || desc || specialTest) {
                                        updateRow(currentRowBefore?.__rowId ?? rowId, (r) => ({
                                            ...r,
                                            fupCode: fup || r.fupCode,
                                            description: desc || r.description,
                                            specialTest: specialTest || r.specialTest,
                                            __lookupMessage: "",
                                            __errors: clearErrors(r.__errors, ["lookup"]),
                                        }));
                                    }
                                } else {
                                    // single-object detail fallbacks
                                    const fup = String(detail.fupCode ?? detail.fup_code ?? detail.fup ?? "").trim();
                                    const desc = String(detail.description ?? detail.desc ?? detail.ruleName ?? "").trim();
                                    const specialTest = String(detail.specialTest ?? detail.special_test ?? detail.specialTest ?? "").trim();

                                    // also support explicit fupCodes array
                                    const explicitFup = Array.isArray(detail.fupCodes) ? detail.fupCodes : Array.isArray(detail.fucpCodes) ? detail.fucpCodes : null;
                                    if (explicitFup && explicitFup.length > 0) {
                                        const fupOptions = explicitFup.map((item: unknown) => {
                                            if (!item) return null;
                                            if (typeof item === 'string') return { label: String(item), value: String(item) } as Option;
                                            if (typeof item === 'object') {
                                                const obj = item as Record<string, unknown>;
                                                const v = String(obj.code ?? obj.value ?? obj.key ?? "").trim();
                                                const l = String(obj.description ?? obj.label ?? v).trim();
                                                return { label: l || v, value: v || l } as Option;
                                            }
                                            return null;
                                        }).filter(Boolean) as Option[];

                                        if (fupOptions.length > 0) {
                                            const cacheKeyObj = { team: teamVal, category: before.category || "", subCategory: before.subCategory || "", document: before.document || "", reason: value, fupCodes: true };
                                            const uniqueMap = new Map<string, Option>();
                                            for (const o of fupOptions) uniqueMap.set(String(o.value), o);
                                            cacheOptionsForPayload(cacheKeyObj, Array.from(uniqueMap.values()) as unknown as Option[]);
                                        }
                                    }

                                    if (fup || desc || specialTest) {
                                        updateRow(currentRowBefore?.__rowId ?? rowId, (r) => ({
                                            ...r,
                                            fupCode: fup || r.fupCode,
                                            description: desc || r.description,
                                            specialTest: specialTest || r.specialTest,
                                            __lookupMessage: "",
                                            __errors: clearErrors(r.__errors, ["lookup"]),
                                        }));
                                    }
                                }
                        }
                    } catch (e) {
                        // ignore extraction errors
                    }
                }
                // when user selects a fupCode, populate description/specialTest from cached options if available
                if (field === "fupCode") {
                    try {
                        const cacheKeyObj = { team: before.team || "", category: before.category || "", subCategory: before.subCategory || "", document: before.document || "", reason: before.reason || "", fupCodes: true };
                        const cached = requirementOptionsCache[JSON.stringify(cacheKeyObj)] as Array<Option & { description?: string, specialTest?: string }> | undefined;
                        const match = (cached ?? []).find((o) => String(o.value) === String(value));
                        if (match) {
                            updateRow(currentRowBefore?.__rowId ?? rowId, (r) => ({
                                ...r,
                                description: match.description ?? r.description,
                                specialTest: (match as any).specialTest ?? r.specialTest,
                                __errors: clearErrors(r.__errors, ["lookup"]),
                            }));
                        }
                    } catch {
                        // ignore
                    }
                }
            } catch {
                // ignore fetch errors
            }
        })();
    };

    

    // Add draft row to saved rows without performing validation checks.
    const handleAddDraft = (rowId: string) => {
        setIsTableSaved(false);
        setHasRequirementChanges(true);

        updateRow(rowId, (row) => {
            const preparedRow = applyLookupToRow(row, shouldShowProfileAndSpecialTest, effectiveRequirementMasterRows);

            return {
                ...preparedRow,
                __isDraft: false,
                __errors: {},
                __lookupMessage: "",
            };
        });

        // newly added (saved) local rows should allow status editing
        setEditableStatusRowIds((prev) => {
            const next = new Set(prev);
            next.add(rowId);
            return next;
        });
    };

    const handleDelete = (rowId: string) => {
        setIsTableSaved(false);
        setHasRequirementChanges(true);
        // if it's a local draft, remove from localRows, otherwise mark as deleted
        const isLocal = localRows.some((r) => r.__rowId === rowId);
        if (isLocal) {
            setLocalRows((previousRows) => previousRows.filter((row) => row.__rowId !== rowId));
            return;
        }

        setDeletedRowIds((prev) => new Set(prev).add(rowId));
    };

    // const handleEditLocalSaved = (rowId: string) => {
    //     setIsTableSaved(false);
    //     setHasRequirementChanges(true);

    //     const existing = rows.find((r) => r.__rowId === rowId && !r.__isLocal);
    //     if (existing) {
    //         // create a local editable draft prefilled from existing row
    //         const draft = {
    //             ...existing,
    //             __rowId: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    //             __isDraft: true,
    //             __isLocal: true,
    //             // mark this as NOT a new add-created row so delete remains disabled
    //             __isNewLocal: false,
    //             __errors: {},
    //             __lookupMessage: "",
    //         } as EditableRequirementRow;
    //         setLocalRows((prev) => [...prev, draft]);
    //         setLastAddedDraftRowId(draft.__rowId);
    //         return;
    //     }

    //     // if already a local row, just toggle to draft (shouldn't usually happen)
    //     setLocalRows((previousRows) =>
    //         previousRows.map((row) =>
    //             row.__rowId === rowId
    //                 ? {
    //                     ...row,
    //                     __isDraft: true,
    //                     __errors: {},
    //                     __lookupMessage: "",
    //                 }
    //                 : row,
    //         ),
    //     );
    // };

    const renderEditableSelect = (
        row: EditableRequirementRow,
        field: EditableField,
        options: Option[],
        disabled = false,
    ) => (
        <CustomSelect
            value={getRowFieldValue(row, field)}
            onChange={(value) => handleInlineChange(row.__rowId, field, value)}
            options={options}
            placeholder="Select"
            disabled={disabled}
            error={Boolean(row.__errors?.[field])}
            helperText={row.__errors?.[field]}
        />
    );

    const getRowFieldValue = (row: EditableRequirementRow, field: EditableField): string => {
        switch (field) {
            case "team":
                return String(row.team ?? "");
            case "profile":
                return String(row.profile ?? "");
            case "category":
                return String(row.category ?? "");
            case "subCategory":
                return String(row.subCategory ?? "");
            case "document":
                return String(row.document ?? "");
            case "reason":
                return String(row.reason ?? "");
            case "status":
                return String(row.status ?? "");
            default:
                return String((row as any)[field] ?? "");
        }
    };

    // validateDraftRow removed (unused) to avoid TS unused-value errors

    const renderReadOnlyField = (value: string, helperText?: string) => (
        <>
            <Typography
                sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#1F2937",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                }}
            >
                {toDisplayValue(value)}
            </Typography>
            {helperText && (
                <Typography sx={{ mt: 0.75, fontSize: 11, color: "#C62828" }}>
                    {helperText}
                </Typography>
            )}
        </>
    );

    const renderField = (
        label: string,
        content: React.ReactNode,
        accent = false,
    ) => (
        <Box
            sx={{
                minWidth: 0,
                borderRadius: 2,
                border: accent ? "1px solid #C8D7E6" : "1px solid #E5E7EB",
                backgroundColor: accent ? "#F7FAFD" : "#FFFFFF",
                p: 1.5,
            }}
        >
            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#52606D", mb: 1 }}>
                {label}
            </Typography>
            {content}
        </Box>
    );

    const renderDisabledActionIcons = () => (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, whiteSpace: "nowrap" }}>
            {/* <Box
                component="span"
                sx={{
                    color: "#CBD5E1",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    opacity: 0.55,
                    cursor: "not-allowed",
                }}
                aria-disabled="true"
                aria-label="Edit requirement unavailable"
            >
                <EditIcon />
            </Box> */}

            <CustomDialog open={descriptionDialogOpen} onClose={closeDescriptionDialog} title="Description" maxWidth="sm">
                <Typography sx={{ whiteSpace: "pre-wrap", fontSize: 14, color: "#182026" }}>{descriptionDialogText}</Typography>
            </CustomDialog>
            <Box
                component="span"
                sx={{
                    color: "#CBD5E1",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    opacity: 0.55,
                    cursor: "not-allowed",
                }}
                aria-disabled="true"
                aria-label="Delete requirement unavailable"
            >
                <CloseIcon />
            </Box>
        </Box>
    );

    const savedColumns: Column<EditableRequirementRow>[] = [
        {
            key: "__rowId",
            header: "Actions",
            width: "5%",
            sticky: "left",
            render: (_value, row) => {
                const isLocalDraft = Boolean(row.__isLocal && row.__isDraft && (row as any).__isNewLocal);
                const showActions = row.__isLocal || (!isTableSaved && editableStatusRowIds.has(row.__rowId));
                if (!showActions) {
                    return renderDisabledActionIcons();
                }

                return (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, whiteSpace: "nowrap" }}>
                        {/* <Box
                            component="button"
                            type="button"
                            onClick={() => handleEditLocalSaved(row.__rowId)}
                            sx={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: "#0F4C81",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 22,
                                height: 22,
                                flexShrink: 0,
                                p: 0,
                            }}
                            aria-label="Edit requirement"
                        >
                            <EditIcon />
                        </Box> */}

                        {isLocalDraft ? (
                            <Box
                                component="button"
                                type="button"
                                onClick={() => handleDelete(row.__rowId)}
                                sx={{
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    color: "#9A2529",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 22,
                                    height: 22,
                                    flexShrink: 0,
                                    p: 0,
                                }}
                                aria-label="Delete requirement"
                            >
                                <CloseIcon />
                            </Box>
                        ) : (
                            <Box
                                component="span"
                                sx={{
                                    color: "#CBD5E1",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 22,
                                    height: 22,
                                    flexShrink: 0,
                                    opacity: 0.55,
                                    cursor: "not-allowed",
                                }}
                                aria-disabled="true"
                                aria-label="Delete requirement unavailable"
                            >
                                <CloseIcon />
                            </Box>
                        )}
                    </Box>
                );
            },
        },
        {
            key: "status",
            header: "Status",
            width: "7%",
            render: (_value, row) => {
                // allow editing status only for draft/local-new rows or rows explicitly marked editable
                const canEditStatus = Boolean(row.__isDraft) || editableStatusRowIds.has(row.__rowId);
                if (row.__rowId === lastAddedDraftRowId) {
                    // help debug why the newly added draft may still be disabled
                    console.debug("RequirementManagement: status render", {
                        rowId: row.__rowId,
                        __isDraft: row.__isDraft,
                        canEditStatus,
                        isTableSaved,
                        editableStatusRowIdsSize: editableStatusRowIds.size,
                    });
                }

                // Always render the select so the dropdown remains visible,
                // but disable it when editing isn't allowed (including after save
                // or when status is not pending).
                return (
                    <Box
                        sx={{
                            width: 100,
                            minWidth: 100,
                            // ensure select text and menu items show capitalized form only in this table
                            '& .MuiSelect-select': { textTransform: 'capitalize' },
                            '& .MuiMenuItem-root': { textTransform: 'capitalize' },
                        }}
                    >
                        {renderEditableSelect(
                            row,
                            "status",
                            requirementStatusOptions.map((o) => ({
                                ...o,
                                label: (String(o.label ?? "") || "")
                                    ? String(o.label).charAt(0).toUpperCase() + String(o.label).slice(1).toLowerCase()
                                    : String(o.label ?? ""),
                            })),
                            !canEditStatus,
                        )}
                    </Box>
                );
            },
        },
         { key: "ocrStatus", header: "OCR Status", width: "6%" },
        ...(shouldShowProfileAndSpecialTest
            ? ([{ key: "profile", header: "Profile", width: "7%" }] as Column<EditableRequirementRow>[])
            : []),
        { key: "category", header: "Category", width: "8%" },
        { key: "subCategory", header: "Sub Category", width: "10%"},
        { key: "document", header: "Document", width: "10%" },
        { key: "reason", header: "Reason", width: "12%" },
        ...(shouldShowProfileAndSpecialTest
            ? ([{ key: "specialTest", header: "Special Test", width: "7%" }] as Column<EditableRequirementRow>[])
            : []),
        { key: "fupCode", header: "FUP Code", width: "8%"},
        { key: "remarks", header: "Extra Remarks", width: "12%", render: (_v, row) => renderReadOnlyField(String(row.remarks ?? "")) },
        {
            key: "description",
            header: "Description",
            width: shouldShowProfileAndSpecialTest ? "5%" : "7%",
            render: (_value, row) => {
                const desc = String(row.description ?? "");
                if (!desc) return <Typography sx={{ fontSize: 13, color: "#334155" }}>-</Typography>;

                return (
                    <Box sx={{ display: "flex", alignItems: "start ", justifyContent: "center" }}>
                        <Box
                            component="button"
                            onClick={() => openDescriptionDialog(desc)}
                            sx={{ border: "none", background: "transparent", p: 0, cursor: "pointer", color: "#0F4C81" }}
                            aria-label="View description"
                        >
                            <EyeIcon />
                        </Box>
                    </Box>
                );
            },
        },
        // { key: "raisedDate", header: "Raised Date", width: "7%" },
        // { key: "raisedBy", header: "Raised By", width: "7%" },
        // { key: "receivedDate", header: "Received Date", width: "7%" },
        // { key: "receivedBy", header: "Received By", width: "7%" },
    ];

    return (
        <Paper
            elevation={0}
            sx={{
                border: "1px solid #D8D8D8",
                borderRadius: "14px",
                overflow: "hidden",
            }}
        >
            <Box
                sx={{
                    backgroundColor: "#004A80",
                    color: "#FFFFFF",
                    px: 3,
                    py: 1.5,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                }}
            >
                <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                        Requirement Management
                    </Typography>
                </Box>

                {isVisible && (
                    <CustomButton
                        variant="contained"
                        size="small"
                        sx={{
                            backgroundColor: "#FFFFFF",
                            color: "#063E6F",
                            fontWeight: 700,
                            fontSize: 14,
                            px: 1,
                            "&:hover": { backgroundColor: "#FFFFFF" },
                        }}
                        onClick={async () => {
                                    // mark table as not-saved (there are pending changes)
                                    setIsTableSaved(false);
                                    setHasRequirementChanges(true);
                                    const draft = createDraftRow();
                                    setLocalRows((previousRows) => [draft, ...previousRows]);
                                    setLastAddedDraftRowId(draft.__rowId);

                                    // Prefetch masters for the default team so dropdowns are primed
                                    try {
                                        const defaultTeam = getDefaultTeam();
                                        const payloadBody: Record<string, string> = { team: defaultTeam };
                                        const payload = { types: ["requirement_mst"], requirementMst: payloadBody };
                                        const cacheKeyObj = { team: defaultTeam };
                                        const cacheKey = JSON.stringify(cacheKeyObj);

                                        if (!requirementOptionsCache[cacheKey]) {
                                            const mst = await fetchRequirementMst(payload);
                                            const entries = parseFirstArrayFromRequirementMst(mst);
                                            const opts = entries.map(toOption);
                                            cacheOptionsForPayload(cacheKeyObj, opts);
                                        }
                                    } catch (e) {
                                        // ignore
                                    }
                                }}
                    >
                        + Add Requirement
                    </CustomButton>
                ) }
            </Box>

            <Box sx={{ p: 2, backgroundColor: "#F5F7FA" }}>
                {/* {import.meta.env.DEV && (
                    <Box sx={{ mb: 1, p: 1, backgroundColor: "#fff7e6", borderRadius: 1 }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#444" }}>Debug: requirementStatusOptions</Typography>
                        <Typography sx={{ fontSize: 11, color: "#666", whiteSpace: "pre-wrap" }}>{JSON.stringify(requirementStatusOptions, null, 2)}</Typography>
                    </Box>
                )} */}
                {rows.length === 0 ? (
                    <Box
                        sx={{
                            borderRadius: 3,
                            border: "1px dashed #B8C4D2",
                            backgroundColor: "#FFFFFF",
                            px: 2,
                            py: 3,
                            textAlign: "center",
                        }}
                    >
                        <Typography sx={{ fontSize: 13, fontWeight: 600, color: "#334155" }}>
                            No requirements available.
                        </Typography>
                        <Typography sx={{ fontSize: 12, color: "#64748B", mt: 0.75 }}>
                            Add a requirement to start capturing category, document, and FUP details inline.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: "grid", gap: 2, minWidth: 0 }}>
                        {savedRows.length > 0 && (
                            <Box>
                                <Box
                                    sx={{
                                        width: "100%",
                                        minWidth: 0,
                                        overflowX: "auto",
                                        borderRadius: 2,
                                        ...savedRequirementTableSx,
                                    }}
                                >
                                    <CustomTable<EditableRequirementRow>
                                        columns={savedColumns}
                                        data={pagedSavedRows}
                                    />
                                    {savedRows.length > PAGE_SIZE && (
                                        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                                            <Pagination
                                                count={totalSavedPages}
                                                page={savedPage + 1}
                                                onChange={(_e, p) => setSavedPage(p - 1)}
                                                color="primary"
                                                size="small"
                                            />
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        )}

                        {draftRows.map((row, rowIndex) => {
                            const profileOptions = getProfileOptions();
                            const categoryOptions = getCategoryOptions(row);
                            const subCategoryOptions = getSubCategoryOptions(row);
                            const documentOptions = getDocumentOptions(row);
                            const reasonOptions = getReasonOptions(row);

                            return (
                                <Box
                                    id={row.__rowId}
                                    key={row.__rowId}
                                    sx={{
                                        borderRadius: 3,
                                        border: row.__isDraft ? "1px solid #9A2529" : "1px solid #D7DEE7",
                                        backgroundColor: "#FFFFFF",
                                        boxShadow: row.__isDraft ? "0 10px 24px rgba(154, 37, 41, 0.08)" : "none",
                                        overflow: "hidden",
                                        width: "100%",
                                        maxWidth: "100%",
                                        position: "sticky",
                                        left: 0,
                                        zIndex: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            px: 2,
                                            py: 1.5,
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: 1.5,
                                            flexWrap: "wrap",
                                            background: row.__isDraft
                                                ? "linear-gradient(90deg, #FFF8F8 0%, #FDFDFD 100%)"
                                                : "linear-gradient(90deg, #F8FAFC 0%, #FFFFFF 100%)",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>
                                                Draft Requirement {rowIndex + 1}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                label={row.__isDraft ? "Draft" : "Saved"}
                                                sx={{
                                                    height: 24,
                                                    backgroundColor: row.__isDraft ? "#FDECEC" : "#E8F3EC",
                                                    color: row.__isDraft ? "#9A2529" : "#1B5E20",
                                                    fontWeight: 700,
                                                }}
                                            />
                                            <Chip
                                                size="small"
                                                label={(() => {
                                                    const rawLabel = requirementStatusOptions.find((o) => String(o.value) === String(row.status))?.label ?? String(row.status ?? "");
                                                    return rawLabel ? String(rawLabel).charAt(0).toUpperCase() + String(rawLabel).slice(1).toLowerCase() : "";
                                                })()
                                                }
                                                sx={{
                                                    height: 24,
                                                    backgroundColor: isPendingStatus(row.status) ? "#FFF5D6" : "#E8EEF5",
                                                    color: isPendingStatus(row.status) ? "#8A5A00" : "#334155",
                                                    fontWeight: 700,
                                                }}
                                            />
                                        </Box>

                                        {row.__isDraft ? (
                                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                                <CustomButton
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => handleDelete(row.__rowId)}
                                                    sx={{ borderRadius: 999, px: 2 }}
                                                >
                                                    Close
                                                </CustomButton>
                                                <CustomButton
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleAddDraft(row.__rowId)}
                                                    sx={{ borderRadius: 999, px: 2 }}
                                                >
                                                    Add
                                                </CustomButton>
                                            </Box>
                                        ) : (
                                            <Typography sx={{ fontSize: 11, color: "#64748B" }}>
                                                {isPendingStatus(row.status)
                                                    ? "Only status remains editable while it is pending."
                                                    : "This requirement is locked because status is no longer pending."}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Box sx={{ p: 2 }}>
                                        {row.__errors?.lookup && row.__isDraft ? (
                                            <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                                                {row.__errors.lookup}
                                            </Alert>
                                        ) : null}

                                        <Box
                                            sx={{
                                                display: "grid",
                                                gridTemplateColumns: {
                                                    xs: "1fr",
                                                    sm: "repeat(2, minmax(0, 1fr))",
                                                    lg: "repeat(3, minmax(0, 1fr))",
                                                    xl: "repeat(6, minmax(0, 1fr))",
                                                },
                                                gap: 1.5,
                                            }}
                                        >
                                            {renderField(
                                                "Team",
                                                row.__isDraft
                                                    ? renderEditableSelect(row, "team", teamOptions)
                                                    : renderReadOnlyField(row.team),
                                                true,
                                            )}
                                            {shouldShowProfileAndSpecialTest && renderField(
                                                "Profile",
                                                row.__isDraft
                                                    ? renderEditableSelect(row, "profile", profileOptions, !row.team)
                                                    : renderReadOnlyField(row.profile),
                                                true,
                                            )}
                                            {renderField(
                                                "Category",
                                                row.__isDraft
                                                    ? renderEditableSelect(
                                                        row,
                                                        "category",
                                                        categoryOptions,
                                                        !row.team,
                                                    )
                                                    : renderReadOnlyField(row.category),
                                                true,
                                            )}
                                            {renderField(
                                                "Sub Category",
                                                row.__isDraft
                                                    ? renderEditableSelect(row, "subCategory", subCategoryOptions, !row.category)
                                                    : renderReadOnlyField(row.subCategory),
                                                true,
                                            )}
                                            {renderField(
                                                "Document",
                                                row.__isDraft
                                                    ? renderEditableSelect(row, "document", documentOptions, !row.subCategory)
                                                    : renderReadOnlyField(row.document),
                                                true,
                                            )}
                                            {renderField(
                                                "Reason",
                                                row.__isDraft
                                                    ? renderEditableSelect(row, "reason", reasonOptions, !row.document)
                                                    : renderReadOnlyField(row.reason),
                                                true,
                                            )}
                                            {shouldShowProfileAndSpecialTest && renderField(
                                                "Special Test",
                                                renderReadOnlyField(row.specialTest),
                                            )}
                                            {renderField(
                                                "FUP Code",
                                                row.__isDraft
                                                    ? renderEditableSelect(row, "fupCode", getFupCodeOptions(row), !row.reason)
                                                    : renderReadOnlyField(row.fupCode, row.__isDraft ? row.__lookupMessage : undefined),
                                            )}
                                            {renderField(
                                                "Description",
                                                renderReadOnlyField(row.description),
                                            )}
                                            {renderField(
                                                "Extra Remarks",
                                                row.__isDraft
                                                    ? (
                                                        <CustomTextField
                                                            value={String(row.remarks ?? "")}
                                                            onChange={(e) => handleInlineChange(row.__rowId, "remarks", String((e.target as HTMLInputElement).value))}
                                                            placeholder="Optional remarks"
                                                            sx={{ width: "100%" }}
                                                        />
                                                      )
                                                    : renderReadOnlyField(row.remarks ?? ""),
                                            )}
                                        </Box>
                                    </Box>


                                </Box>
                            );
                        })}
                    </Box>
                ) }

                {/* requirementManagement raw debug view removed to show entries in main table */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        mt: 1,
                    }}
                >
                   
                    {isVisible && (
                            <CustomButton
                                variant="contained"
                                disabled={isTableSaved || draftRows.length > 0}
                            onClick={async () => {
                                // Build a full DRS payload by cloning current drsData and replacing requirementManagement
                                try {
                                    const source = (drsData && typeof drsData === "object") ? (drsData as Record<string, unknown>) : {};
                                    const cloned: Record<string, unknown> = JSON.parse(JSON.stringify(source || {}));

                                    const payloadRequirements = rows.map((r) => {
                                        const statusCode = String(r.status ?? "").trim() || "PEN";
                                        const matchedStatus = (requirementStatusOptions as Array<Option & { description?: string }>).find(
                                            (o) => String(o.value ?? "").trim() === statusCode || String(o.label ?? "").trim().toLowerCase() === String(r.status ?? "").trim().toLowerCase(),
                                        );
                                        const statusDescription = matchedStatus?.description ?? matchedStatus?.label ?? String(r.status ?? "");

                                        return {
                                            team: mapDisplayTeamToStored(r.team ?? ""),
                                            profile: r.profile ?? "",
                                            category: r.category ?? "",
                                            subCategory: r.subCategory ?? "",
                                            document: r.document ?? "",
                                            reason: r.reason ?? "",
                                            fupCode: r.fupCode ?? "",
                                            description: r.description ?? "",
                                            status: { value: statusCode, description: statusDescription },
                                            raisedDate: r.raisedDate ?? "",
                                            raisedBy: r.raisedBy ?? "",
                                            receivedDate: r.receivedDate ?? "",
                                            receivedBy: r.receivedBy ?? "",
                                            validity: r.validity ?? "",
                                            userId: r.userId ?? "",
                                            remarks: r.remarks ?? "",
                                            udsLink: r.udsLink ?? "",
                                        };
                                    });

                                    // Replace requirementManagement in cloned object. Support both top-level and data.requirementManagement
                                    if (Array.isArray(cloned.requirementManagement) || cloned.requirementManagement == null) {
                                        cloned.requirementManagement = payloadRequirements;
                                    } else if (cloned.data && typeof cloned.data === "object") {
                                        (cloned.data as Record<string, unknown>).requirementManagement = payloadRequirements;
                                    } else {
                                        cloned.requirementManagement = payloadRequirements;
                                    }

                                    const userId = (localStorage.getItem("userId") ?? localStorage.getItem("username") ?? "").trim();
                                    const requestBody = {
                                        applicationNo: applicationNumber,
                                        roleType: roleType,
                                        sections: ["requirementManagement"],
                                        userId: userId,
                                        data: cloned,
                                    } as unknown;
                                    console.log('requirement save payload', requestBody);
                                    await apiRequest<{ success?: boolean; message?: string }, unknown>({
                                        url: apiUrl("requirementManagementSave"),
                                        method: "PUT",
                                        body: requestBody,
                                    });

                                    // persist local snapshot and update state
                                    saveLocalRequirementRows(drsData, rows.map((row) => ({ status: row.status })), false);
                                    setIsTableSaved(true);
                                    setHasRequirementChanges(false);
                                    setEditableStatusRowIds(new Set());
                                } catch (err) {
                                    console.warn("Requirement save failed", err);
                                    // persist unsaved flag so user doesn't lose changes
                                    saveLocalRequirementRows(drsData, rows.map((row) => ({ status: row.status })), true);
                                    setIsTableSaved(false);
                                    setHasRequirementChanges(true);
                                }
                            }}
                            sx={{
                                minWidth: 200,
                                height: 44,
                                borderRadius: "50px",
                                fontWeight: 600,
                                px: 3,
                                whiteSpace: "nowrap",
                            }}
                        >
                             Save
                        </CustomButton>
                    )}
                    {showCptActionButtons && (<><CustomButton
                        variant="contained"
                        //disabled={draftRows.length > 0 || isTableSaved}
                        onClick={() => {
                            saveLocalRequirementRows(drsData, rows.map((row) => ({ status: row.status })), false);
                            setIsTableSaved(true);
                            setHasRequirementChanges(false);
                            setEditableStatusRowIds(new Set());
                            openLinkInNewTab(proposalFormAndDocumentsLink);
                        }}
                        sx={{
                            minWidth: 200,
                            height: 44,
                            borderRadius: "50px",
                            fontWeight: 600,
                            px: 3,
                            whiteSpace: "nowrap",
                        }}
                    >
                        View Documents
                    </CustomButton>
                        <CustomButton
                            variant="contained"
                            //disabled={draftRows.length > 0 || isTableSaved}
                            onClick={() => {
                                saveLocalRequirementRows(drsData, rows.map((row) => ({ status: row.status })), false);
                                setIsTableSaved(true);
                                setHasRequirementChanges(false);
                                setEditableStatusRowIds(new Set());
                                persistNewTabContext();
                                openLinkInNewTab(cptSecondaryAction.path);
                            }}
                            sx={{
                                minWidth: 200,
                                height: 44,
                                borderRadius: "50px",
                                fontWeight: 600,
                                px: 3,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {cptSecondaryAction.label}
                        </CustomButton></>)}
                </Box>
            </Box>
        </Paper>
    );
};

export default RequirementManagementTable;
