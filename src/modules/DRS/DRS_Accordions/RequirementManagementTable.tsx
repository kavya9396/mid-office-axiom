import { Alert, Box, Chip, Paper, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
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

type LookupTeam = "CVT Team" | "DVT Team" | "UW";

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
    "CVT Team": "UW",
    "DVT Team": "Gops",
    UW: "UW",
};

const EMPTY_OPTIONS: Option[] = [];
const EMPTY_REQUIREMENT_MASTER_ROWS: RequirementMasterOption[] = [];

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
        return "CVT Team";
    }

    if (roleType.includes("dvt") || roleType.includes("gops")) {
        return "DVT Team";
    }

    return "UW";
};

const mapStoredTeamToDisplay = (team: string): string => {
    const normalized = team.trim().toLowerCase();

    if (!normalized) {
        return "";
    }

    if (normalized.includes("cvt")) {
        return "CVT Team";
    }

    if (normalized === "gops" || normalized.includes("dvt")) {
        return "DVT Team";
    }

    if (normalized === "uw") {
        return "UW";
    }

    if (normalized === "system requirement") {
        return "System Requirement";
    }

    return team;
};

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

const normalizeExistingRow = (
    row: Partial<AdditionalRequirementRow>,
    index: number,
): EditableRequirementRow => ({
    ...INITIAL_ROW_STATE,
    ...row,
    team: mapStoredTeamToDisplay(String(row.team ?? "")) || getDefaultTeam(),
    status: normalizeStatus(String(row.status ?? "")),
    raisedDate: String(row.raisedDate ?? ""),
    raisedBy: String(row.raisedBy ?? ""),
    receivedDate: String(row.receivedDate ?? ""),
    receivedBy: String(row.receivedBy ?? ""),
    __rowId: `existing-${index}-${String(row.fupCode ?? "")}-${String(row.description ?? "")}`,
    __isDraft: false,
    __isLocal: false,
    __errors: {},
    __lookupMessage: "",
});

const mapBreRequirementToRow = (requirement: BreRequirementRow): AdditionalRequirementRow => ({
    ...INITIAL_ROW_STATE,
    team: "UW",
    profile: "",
    category: String(requirement.requirementType ?? ""),
    subCategory: String(requirement.requirementValue ?? ""),
    document: String(requirement.ruleName ?? ""),
    reason: String(requirement.metaphorName ?? ""),
    fupCode: String(requirement.ruleId ?? ""),
    description: String(requirement.ruleName ?? requirement.requirementValue ?? ""),
    status: "Pending",
});

const validateDraftRow = (row: EditableRequirementRow, requiresProfile: boolean): RowErrors => {
    const errors: RowErrors = {};
    const requiredSelectionFields = getRequiredSelectionFields(requiresProfile);

    requiredSelectionFields.forEach((field) => {
        if (!String(row[field] ?? "").trim()) {
            errors[field] = "Required";
        }
    });

    if (!String(row.status ?? "").trim()) {
        errors.status = "Required";
    }

    return errors;
};

const getRowFieldValue = (row: EditableRequirementRow, field: EditableField) =>
    String(row[field] ?? "");

const savedRequirementTableSx = {
    "& .MuiTable-root": {
        tableLayout: "fixed",
        width: "100%",
    },
    "& .MuiTableCell-root": {
        px: 0.75,
        py: 0.75,
        fontSize: "11px",
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
        verticalAlign: "top",
    },
    "& .MuiTableCell-head": {
        px: 0.75,
        py: 0.75,
    },
    "& .MuiTableCell-root:first-of-type": {
        width: "68px",
        minWidth: "68px",
        maxWidth: "68px",
        px: 0.5,
        whiteSpace: "nowrap",
        overflowWrap: "normal",
        wordBreak: "normal",
    },
    "& .MuiTableCell-root:nth-of-type(2)": {
        width: "110px",
        minWidth: "110px",
        maxWidth: "110px",
        px: 0.5,
        whiteSpace: "nowrap",
        overflowWrap: "normal",
        wordBreak: "normal",
    },
    "& .MuiTableCell-head .MuiTypography-root": {
        fontSize: "11px",
        lineHeight: 1.15,
        whiteSpace: "normal",
    },
    "& .MuiTableCell-body .MuiTypography-root": {
        fontSize: "11px",
        lineHeight: 1.25,
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        wordBreak: "break-word",
    },
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

interface RequirementManagementTableProps {
    requirements?: AdditionalRequirementRow[];
}

const RequirementManagementTable = ({ requirements }: RequirementManagementTableProps) => {
    const roleType = String(localStorage.getItem("roleType") ?? "");
    const { businessType, applicationNumber } = useAppContext();
    const normalizedRoleType = roleType.trim().toLowerCase();
    const isCvtOrDvtRole = normalizedRoleType.includes("cvt") || normalizedRoleType.includes("dvt");
    const shouldShowProfileAndSpecialTest = !isCvtOrDvtRole;
    const reduxRequirements = useSelector((state: RootState) => {
        const drsData = state.drs.data as unknown as Record<string, unknown> | null;
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

        const requirementManagement = drsData?.requirementManagement;
        return Array.isArray(requirementManagement)
            ? (requirementManagement as AdditionalRequirementRow[])
            : [];
    });
    const drsData = useSelector((state: RootState) => state.drs.data as unknown);
    const masterRequirementRows = EMPTY_REQUIREMENT_MASTER_ROWS;
    const effectiveRequirementMasterRows = EMPTY_REQUIREMENT_MASTER_ROWS;
    const requirementProfileOptions = EMPTY_OPTIONS;
    const requirementCategoryOptions = EMPTY_OPTIONS;
    const requirementSubCategoryOptions = EMPTY_OPTIONS;
    const requirementDocumentOptions = EMPTY_OPTIONS;
    const requirementReasonOptions = EMPTY_OPTIONS;
    const requirementStatusOptions = EMPTY_OPTIONS;

    const isVisible = roleType !== "Ready For Issuance Pool" && roleType !== "DVT_FORMAL_TASK" && roleType !== "Exceptional Pool";
    const teamOptions = EMPTY_OPTIONS;
    const finalRequirements = requirements ?? reduxRequirements;
    const normalizedExistingRows = useMemo(
        () => finalRequirements.map((row, index) => normalizeExistingRow(row, index)),
        [finalRequirements],
    );

    const [localRows, setLocalRows] = useState<EditableRequirementRow[]>([]);
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
        (drsData as { quickLinks?: { proposerForm?: string } } | null)?.quickLinks?.proposerForm ??
        summaryPersonal.UDSLink ??
        "",
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

    const selectedCaseContext = getSelectedCaseContext();
    const selectedCaseRoleType = String(selectedCaseContext.roleType ?? "").trim();
    const selectedCaseIsMedical = Boolean(
        (selectedCaseContext as { isMedical?: unknown }).isMedical ??
        (drsData as { isMedical?: unknown } | null)?.isMedical,
    );
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

    useEffect(() => {
        const handleOpenRequirementManagement = (event: Event) => {
            const { openAddRequirement } = (event as OpenRequirementManagementEvent).detail ?? {};

            if (!openAddRequirement || !isVisible) {
                return;
            }

            setLocalRows((previousRows) => {
                const currentUserHasRaisedRequirement = [...normalizedExistingRows, ...previousRows].some(
                    isRaisedByCurrentUser,
                );
                if (currentUserHasRaisedRequirement) {
                    return previousRows;
                }

                setIsTableSaved(false);
                setHasRequirementChanges(true);
                return [...previousRows, createDraftRow()];
            });
        };

        window.addEventListener(OPEN_REQUIREMENT_MANAGEMENT_EVENT, handleOpenRequirementManagement);

        return () => {
            window.removeEventListener(OPEN_REQUIREMENT_MANAGEMENT_EVENT, handleOpenRequirementManagement);
        };
    }, [isVisible, normalizedExistingRows]);

    const getCategoryOptions = (row: EditableRequirementRow) => {
        const options = uniqueNonEmpty(
            getScopedMasterRows({ ...row, profile: shouldShowProfileAndSpecialTest ? row.profile : "", category: "", subCategory: "", document: "", reason: "" }, masterRequirementRows).map(
                (entry) => entry.category,
            ),
        ).map(toOption);

        return options.length > 0 ? options : requirementCategoryOptions;
    };

    const getProfileOptions = (row: EditableRequirementRow) => {
        const options = uniqueNonEmpty(
            getScopedMasterRows({ ...row, profile: "", category: "", subCategory: "", document: "", reason: "" }, masterRequirementRows).map(
                (entry) => entry.profile,
            ),
        ).map(toOption);

        return options.length > 0 ? options : requirementProfileOptions;
    };

    const getSubCategoryOptions = (row: EditableRequirementRow) => {
        const options = uniqueNonEmpty(
            getScopedMasterRows({ ...row, subCategory: "", document: "", reason: "" }, masterRequirementRows).map(
                (entry) => entry.subCategory,
            ),
        ).map(toOption);

        return options.length > 0 ? options : requirementSubCategoryOptions;
    };

    const getDocumentOptions = (row: EditableRequirementRow) => {
        const options = uniqueNonEmpty(
            getScopedMasterRows({ ...row, document: "", reason: "" }, masterRequirementRows).map((entry) => entry.document),
        ).map(toOption);

        return options.length > 0 ? options : requirementDocumentOptions;
    };

    const getReasonOptions = (row: EditableRequirementRow) => {
        const options = uniqueNonEmpty(
            getScopedMasterRows({ ...row, reason: "" }, masterRequirementRows).map((entry) => entry.reason),
        ).map(toOption);

        return options.length > 0 ? options : requirementReasonOptions;
    };

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
            width: "68px",
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

                {isVisible ? (
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
                            setLocalRows((previousRows) => [...previousRows, createDraftRow()]);
                        }}
                    >
                        + Add Requirement
                    </CustomButton>
                ) : null}
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
                        {savedRows.length > 0 ? (
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
                        ) : null}

                        {draftRows.map((row, rowIndex) => {
                            const profileOptions = getProfileOptions(row);
                            const categoryOptions = getCategoryOptions(row);
                            const subCategoryOptions = getSubCategoryOptions(row);
                            const documentOptions = getDocumentOptions(row);
                            const reasonOptions = getReasonOptions(row);

                            return (
                                <Box
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
                                            {shouldShowProfileAndSpecialTest
                                                ? renderField(
                                                    "Profile",
                                                    row.__isDraft
                                                        ? renderEditableSelect(row, "profile", profileOptions, !row.team)
                                                        : renderReadOnlyField(row.profile),
                                                    true,
                                                )
                                                : null}
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
                                            {shouldShowProfileAndSpecialTest
                                                ? renderField(
                                                    "Special Test",
                                                    renderReadOnlyField(row.specialTest),
                                                )
                                                : null}
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
                )}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 1,
                        mt: 1,
                    }}
                >
                    {
                        isVisible && (
                            <CustomButton
                                variant="contained"
                                disabled={draftRows.length > 0}
                                onClick={() => {
                                    saveLocalRequirementRows(drsData, rows.map((row) => ({ status: row.status })), false);
                                    setIsTableSaved(true);
                                    setHasRequirementChanges(false);
                                    setEditableStatusRowIds(new Set());
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
                        )
                    }
                    {showCptActionButtons && (<><CustomButton
                        variant="contained"
                        disabled={draftRows.length > 0}
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
                            disabled={draftRows.length > 0}
                            onClick={() => {
                                saveLocalRequirementRows(drsData, rows.map((row) => ({ status: row.status })), false);
                                setIsTableSaved(true);
                                setHasRequirementChanges(false);
                                setEditableStatusRowIds(new Set());
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
