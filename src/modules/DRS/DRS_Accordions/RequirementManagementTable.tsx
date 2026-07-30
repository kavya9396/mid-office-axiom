import { Alert, Box, Chip, Paper, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../../services/api";
import { url as apiUrl } from "../../../services/apiConfig";
import { useSelector } from "react-redux";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTable from "../../../components/ui/Table/Table";
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
import { CloseIcon, EditIcon } from "../../../icons/Icons";
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
    | "status";

type RowErrors = Partial<Record<EditableField | "lookup", string>>;

type EditableRequirementRow = AdditionalRequirementRow & {
    __rowId: string;
    __isDraft: boolean;
    __isLocal: boolean;
    __errors?: RowErrors;
    __lookupMessage?: string;
};

type Option = {
    label: string;
    value: string;
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
        const raw = localStorage.getItem("selectedCaseContext");
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : {};
    } catch {
        return {};
    }
};

const toOption = (value: string): Option => ({ label: value, value });

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
    status: "Pending",
    raisedDate: getTodayDate(),
    raisedBy: getCurrentActor(),
    userId: getCurrentUserId(),
    __rowId: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    __isDraft: true,
    __isLocal: true,
    __errors: {},
    __lookupMessage: "",
});

const normalizeExistingRow = (row: AdditionalRequirementRow, index: number): EditableRequirementRow => {
    return {
        ...INITIAL_ROW_STATE,
        ...row,
        status: normalizeStatus(String(row.status ?? "")),
        __rowId: String(row.udsLink ?? row.fupCode ?? row.raisedDate ?? index),
        __isDraft: false,
        __isLocal: true,
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
    const isCvtOrDvtRole = normalizedRoleType.includes("cvt") || normalizedRoleType.includes("dvt");
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
    const effectiveRequirementMasterRows = EMPTY_REQUIREMENT_MASTER_ROWS;
    const requirementProfileOptions = EMPTY_OPTIONS;
    const requirementCategoryOptions = EMPTY_OPTIONS;
    const requirementSubCategoryOptions = EMPTY_OPTIONS;
    const requirementDocumentOptions = EMPTY_OPTIONS;
    const requirementReasonOptions = EMPTY_OPTIONS;

    const [teamOptionsState, setTeamOptionsState] = useState<Option[]>(EMPTY_OPTIONS);
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

    const rows = useMemo(
        () => [
            ...normalizedExistingRows.map((row) => ({
                ...row,
                ...(sourceRowOverrides[row.__rowId] ?? {}),
            })),
            ...localRows,
        ],
        [localRows, normalizedExistingRows, sourceRowOverrides],
    );

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
                return [...previousRows, createDraftRow()];
            });

            // If a draft row was added, prefetch master data for the default team
            // using the same payload/key shape as team selection so dropdowns are primed.
            if (didAdd) {
                (async () => {
                    try {
                        const defaultTeam = getDefaultTeam();
                        const includeBlankProfile = !shouldShowProfileAndSpecialTest;
                        const payloadBody: Record<string, string> = includeBlankProfile
                            ? { team: defaultTeam, profile: "" }
                            : { team: defaultTeam };
                        const payload = { types: ["requirement_mst"], requirementMst: payloadBody };
                        console.log('payload',payload)
                        const cacheKeyObj = includeBlankProfile ? { team: defaultTeam, profile: "" } : { team: defaultTeam };
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
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                const control = el.querySelector('input, select, textarea, button, [tabindex]') as HTMLElement | null;
                if (control) control.focus();
            }
            setLastAddedDraftRowId(null);
        });
    }, [lastAddedDraftRowId]);

    const getCategoryOptions = (row: EditableRequirementRow) => {
        const payload: Record<string, string> = { team: row.team };
        if (shouldShowProfileAndSpecialTest) {
            if (String(row.profile ?? "").trim()) payload.profile = row.profile;
        } else {
            // profile dropdown hidden — use explicit empty profile to match cached payloads
            payload.profile = "";
        }
        const cacheKey = JSON.stringify(payload);
        return requirementOptionsCache[cacheKey] ?? requirementCategoryOptions;
    };

    const getProfileOptions = (row: EditableRequirementRow) => {
        // When profile is hidden there won't be a profile dropdown, but keep lookup consistent
        const payload: Record<string, string> = { team: row.team };
        if (!shouldShowProfileAndSpecialTest) payload.profile = "";
        const cacheKey = JSON.stringify(payload);
        return requirementOptionsCache[cacheKey] ?? requirementProfileOptions;
    };

    const getSubCategoryOptions = (row: EditableRequirementRow) => {
        const payload: Record<string, string> = { team: row.team };
        if (shouldShowProfileAndSpecialTest) {
            if (String(row.profile ?? "").trim()) payload.profile = row.profile;
        } else {
            payload.profile = "";
        }
        if (String(row.category ?? "").trim()) payload.category = row.category;
        const cacheKey = JSON.stringify(payload);
        return requirementOptionsCache[cacheKey] ?? requirementSubCategoryOptions;
    };

    const getDocumentOptions = (row: EditableRequirementRow) => {
        const payload: Record<string, string> = { team: row.team };
        if (shouldShowProfileAndSpecialTest) {
            if (String(row.profile ?? "").trim()) payload.profile = row.profile;
        } else {
            payload.profile = "";
        }
        if (String(row.category ?? "").trim()) payload.category = row.category;
        if (String(row.subCategory ?? "").trim()) payload.subCategory = row.subCategory;
        const cacheKey = JSON.stringify(payload);
        return requirementOptionsCache[cacheKey] ?? requirementDocumentOptions;
    };

    const getReasonOptions = (row: EditableRequirementRow) => {
        const payload: Record<string, string> = { team: row.team };
        if (shouldShowProfileAndSpecialTest) {
            if (String(row.profile ?? "").trim()) payload.profile = row.profile;
        } else {
            payload.profile = "";
        }
        if (String(row.category ?? "").trim()) payload.category = row.category;
        if (String(row.subCategory ?? "").trim()) payload.subCategory = row.subCategory;
        if (String(row.document ?? "").trim()) payload.document = row.document;
        const cacheKey = JSON.stringify(payload);
        return requirementOptionsCache[cacheKey] ?? requirementReasonOptions;
    };

    const parseFirstArrayFromRequirementMst = (mst: unknown): string[] => {
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
    };

    const fetchRequirementMst = async (payload: unknown) => {
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
    };

    const cacheOptionsForPayload = (payload: Record<string, unknown>, options: Option[]) => {
        const key = JSON.stringify(payload);
        console.debug("RequirementManagement: caching options for", payload, options);
        setRequirementOptionsCache((prev) => ({ ...prev, [key]: options }));
    };

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

            // load requirement status master (try several possible keys returned by API)
            try {
                const statusPayload = { types: ["requirementStatus", "requirement_status_master", "requirement_status"] };
                const resp = await apiRequest<Record<string, unknown>>({ url: apiUrl("masters"), method: "POST", body: statusPayload });
                const data = (resp as any)?.data ?? resp;

                const statusCandidates: string[] = [];
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
                        statusCandidates.push(...candidate.map(String));
                        break;
                    }
                }

                // fallback: if data.masterOptions-like shape exists, try to find a first array
                if (statusCandidates.length === 0 && data && typeof data === "object") {
                    for (const k of Object.keys(data as Record<string, unknown>)) {
                        const v = (data as Record<string, unknown>)[k];
                        if (Array.isArray(v) && v.length > 0) {
                            statusCandidates.push(...v.map(String));
                            break;
                        }
                    }
                }

                const statusOpts = statusCandidates.length > 0 ? statusCandidates.map(toOption) : EMPTY_OPTIONS;
                setRequirementStatusOptions(statusOpts);
                cacheOptionsForPayload(statusPayload, statusOpts);
            } catch (e) {
                // ignore failures to fetch status master
            }
        };

        loadInitial();
    }, []);

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
                    const includeBlankProfile = !shouldShowProfileAndSpecialTest;
                    const payloadBody: Record<string, string> = includeBlankProfile
                        ? { team: value, profile: "" }
                        : { team: value };
                    const payload = { types: ["requirement_mst"], requirementMst: payloadBody };
                    const cacheKeyObj = includeBlankProfile ? { team: value, profile: "" } : { team: value };
                    const cacheKey = JSON.stringify(cacheKeyObj);
                    if (!requirementOptionsCache[cacheKey]) {
                        const mst = await fetchRequirementMst(payload);
                        const entries = parseFirstArrayFromRequirementMst(mst);
                        const opts = entries.map(toOption);
                        cacheOptionsForPayload(cacheKeyObj, opts);
                    }
                }

                if (field === "profile") {
                    const teamVal = before.team || "";
                    const payload = { types:["requirement_mst"],requirementMst: { team: teamVal, profile: value } };
                    const cacheKey = JSON.stringify({ team: teamVal, profile: value });
                    if (!requirementOptionsCache[cacheKey]) {
                        const mst = await fetchRequirementMst(payload);
                        const entries = parseFirstArrayFromRequirementMst(mst);
                        const opts = entries.map(toOption);
                        cacheOptionsForPayload({ team: teamVal, profile: value }, opts);
                    }
                }

                if (field === "category") {
                    const teamVal = before.team || "";
                    const profileVal = before.profile || "";
                    const payload = { types:["requirement_mst"],requirementMst: { team: teamVal, profile: profileVal, category: value } };
                    const cacheKey = JSON.stringify({ team: teamVal, profile: profileVal, category: value });
                    if (!requirementOptionsCache[cacheKey]) {
                        const mst = await fetchRequirementMst(payload);
                        const entries = parseFirstArrayFromRequirementMst(mst);
                        const opts = entries.map(toOption);
                        cacheOptionsForPayload({ team: teamVal, profile: profileVal, category: value }, opts);
                    }
                }

                if (field === "subCategory") {
                    const teamVal = before.team || "";
                    const profileVal = before.profile || "";
                    const payload = { types:["requirement_mst"],requirementMst: { team: teamVal, profile: profileVal, category: before.category || "", subCategory: value } };
                    const cacheKey = JSON.stringify({ team: teamVal, profile: profileVal, category: before.category || "", subCategory: value });
                    if (!requirementOptionsCache[cacheKey]) {
                        const mst = await fetchRequirementMst(payload);
                        const entries = parseFirstArrayFromRequirementMst(mst);
                        const opts = entries.map(toOption);
                        cacheOptionsForPayload({ team: teamVal, profile: profileVal, category: before.category || "", subCategory: value }, opts);
                    }
                }

                if (field === "document") {
                    const teamVal = before.team || "";
                    const profileVal = before.profile || "";
                    const payload = { types:["requirement_mst"],requirementMst: { team: teamVal, profile: profileVal, category: before.category || "", subCategory: before.subCategory || "", document: value } };
                    const cacheKey = JSON.stringify({ team: teamVal, profile: profileVal, category: before.category || "", subCategory: before.subCategory || "", document: value });
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
                            cacheOptionsForPayload({ team: teamVal, profile: profileVal, category: before.category || "", subCategory: before.subCategory || "", document: value }, opts);
                    }
                }
                
                if (field === "reason") {
                    const teamVal = before.team || "";
                    const profileVal = shouldShowProfileAndSpecialTest ? (before.profile || "") : "";
                    const payloadBody: Record<string, string> = {
                        team: teamVal,
                        profile: profileVal,
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
                                if (Array.isArray(candidate.requirements) && candidate.requirements.length > 0 && typeof candidate.requirements[0] === "object") {
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
                                    const fup = String(detail.fupCode ?? detail.fup_code ?? detail.fup ?? "").trim();
                                    const desc = String(detail.description ?? detail.desc ?? detail.ruleName ?? "").trim();
                                    const specialTest = String(detail.specialTest ?? detail.special_test ?? detail.specialTest ?? "").trim();

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
            } catch {
                // ignore fetch errors
            }
        })();
    };

    const handleSave = (rowId: string) => {
        setIsTableSaved(false);
        setHasRequirementChanges(true);
        updateRow(rowId, (row) => {
            const preparedRow = applyLookupToRow(row, shouldShowProfileAndSpecialTest, effectiveRequirementMasterRows);
            const errors = validateDraftRow(preparedRow, shouldShowProfileAndSpecialTest);

            if (Object.keys(errors).length > 0) {
                return {
                    ...preparedRow,
                    __errors: errors,
                };
            }

            return {
                ...preparedRow,
                __isDraft: false,
                __errors: {},
                __lookupMessage: "",
            };
        });
    };

    const handleDelete = (rowId: string) => {
        setIsTableSaved(false);
        setHasRequirementChanges(true);
        setLocalRows((previousRows) => previousRows.filter((row) => row.__rowId !== rowId));
    };

    const handleEditLocalSaved = (rowId: string) => {
        setIsTableSaved(false);
        setHasRequirementChanges(true);
        setLocalRows((previousRows) =>
            previousRows.map((row) =>
                row.__rowId === rowId
                    ? {
                        ...row,
                        __isDraft: true,
                        __errors: {},
                        __lookupMessage: "",
                    }
                    : row,
            ),
        );
    };

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

    const validateDraftRow = (row: EditableRequirementRow, requiresProfile: boolean): RowErrors => {
        const errors: RowErrors = {};
        const required = getRequiredSelectionFields(requiresProfile);
        required.forEach((f) => {
            const v = String(row[f] ?? "").trim();
            if (!v) {
                // simple message — kept generic
                (errors as any)[f] = "This field is required";
            }
        });

        return errors;
    };

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
                aria-label="Edit requirement unavailable"
            >
                <EditIcon />
            </Box>
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
            width: "auto",
            sticky: "left",
            render: (_value, row) => {
                if (!row.__isLocal || isTableSaved) {
                    return renderDisabledActionIcons();
                }

                return (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, whiteSpace: "nowrap" }}>
                        <Box
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
                        </Box>
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
                    </Box>
                );
            },
        },
        {
            key: "status",
            header: "Status",
            width: "110px",
            render: (_value, row) => {
                const canEditStatus = !isTableSaved && (isPendingStatus(row.status) || editableStatusRowIds.has(row.__rowId));

                if (!canEditStatus) {
                    return (
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                            {toDisplayValue(row.status)}
                        </Typography>
                    );
                }

                return (
                    <Box sx={{ width: 100, minWidth: 100 }}>
                        {renderEditableSelect(row, "status", requirementStatusOptions, false)}
                    </Box>
                );
            },
        },
        { key: "team", header: "Team", width: "6%" },
        ...(shouldShowProfileAndSpecialTest
            ? ([{ key: "profile", header: "Profile", width: "7%" }] as Column<EditableRequirementRow>[])
            : []),
        { key: "category", header: "Category", width: "8%" },
        { key: "subCategory", header: "Sub Category", width: "9%" },
        { key: "document", header: "Document", width: "8%" },
        { key: "reason", header: "Reason", width: "8%" },
        ...(shouldShowProfileAndSpecialTest
            ? ([{ key: "specialTest", header: "Special Test", width: "7%" }] as Column<EditableRequirementRow>[])
            : []),
        { key: "fupCode", header: "FUP Code", width: "6%" },
        { key: "description", header: "Description", width: shouldShowProfileAndSpecialTest ? "9%" : "12%" },
        { key: "raisedDate", header: "Raised Date", width: "7%" },
        { key: "raisedBy", header: "Raised By", width: "7%" },
        { key: "receivedDate", header: "Received Date", width: "7%" },
        { key: "receivedBy", header: "Received By", width: "7%" },
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
                        onClick={() => {
                                    setIsTableSaved(false);
                                    setHasRequirementChanges(true);
                                    const draft = createDraftRow();
                                    setLocalRows((previousRows) => [...previousRows, draft]);
                                    setLastAddedDraftRowId(draft.__rowId);

                                    // Prefetch masters for the default team so dropdowns are primed
                                    (async () => {
                                        try {
                                            const defaultTeam = getDefaultTeam();
                                            const includeBlankProfile = !shouldShowProfileAndSpecialTest;
                                            const payloadBody: Record<string, string> = includeBlankProfile
                                                ? { team: defaultTeam, profile: "" }
                                                : { team: defaultTeam };
                                            const payload = { types: ["requirement_mst"], requirementMst: payloadBody };
                                            const cacheKeyObj = includeBlankProfile ? { team: defaultTeam, profile: "" } : { team: defaultTeam };
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
                                }}
                    >
                        + Add Requirement
                    </CustomButton>
                ) }
            </Box>

            <Box sx={{ p: 2, backgroundColor: "#F5F7FA" }}>
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
                                        data={savedRows}
                                    />
                                </Box>
                            </Box>
                        )}

                        {draftRows.map((row, rowIndex) => {
                            const profileOptions = getProfileOptions(row);
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
                                                label={toDisplayValue(row.status)}
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
                                                    onClick={() => handleSave(row.__rowId)}
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
                                                        !row.team || (shouldShowProfileAndSpecialTest && !row.profile),
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
                                                renderReadOnlyField(row.fupCode, row.__isDraft ? row.__lookupMessage : undefined),
                                            )}
                                            {renderField(
                                                "Description",
                                                renderReadOnlyField(row.description),
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
                                disabled={draftRows.length > 0 || isTableSaved}
                            onClick={async () => {
                                // Build a full DRS payload by cloning current drsData and replacing requirementManagement
                                try {
                                    const source = (drsData && typeof drsData === "object") ? (drsData as Record<string, unknown>) : {};
                                    const cloned: Record<string, unknown> = JSON.parse(JSON.stringify(source || {}));

                                    const payloadRequirements = rows.map((r) => ({
                                        team: mapDisplayTeamToStored(r.team ?? ""),
                                        profile: r.profile ?? "",
                                        category: r.category ?? "",
                                        subCategory: r.subCategory ?? "",
                                        document: r.document ?? "",
                                        reason: r.reason ?? "",
                                        fupCode: r.fupCode ?? "",
                                        description: r.description ?? "",
                                        status: String(r.status ?? "").trim() || "Pending",
                                        raisedDate: r.raisedDate ?? "",
                                        raisedBy: r.raisedBy ?? "",
                                        receivedDate: r.receivedDate ?? "",
                                        receivedBy: r.receivedBy ?? "",
                                        validity: r.validity ?? "",
                                        userId: r.userId ?? "",
                                        remarks: r.remarks ?? "",
                                        udsLink: r.udsLink ?? "",
                                    }));

                                    // Replace requirementManagement in cloned object. Support both top-level and data.requirementManagement
                                    if (Array.isArray(cloned.requirementManagement) || cloned.requirementManagement == null) {
                                        cloned.requirementManagement = payloadRequirements;
                                    } else if (cloned.data && typeof cloned.data === "object") {
                                        (cloned.data as Record<string, unknown>).requirementManagement = payloadRequirements;
                                    } else {
                                        cloned.requirementManagement = payloadRequirements;
                                    }

                                    const requestBody = cloned;

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
