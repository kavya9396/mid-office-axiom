import { Alert, Box, Chip, Paper, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import CustomButton from "../../../components/ui/Button/Button";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTable from "../../../components/ui/Table/Table";
import type { Column } from "../../../components/ui/Table/Table";
import type { AdditionalRequirementRow } from "../../../types/drs.types";
import {
    rm_category,
    rm_document,
    rm_profile,
    rm_reason,
    rm_sub_category,
    rm_team,
} from "../../../utils/constant";
import { toDisplayValue } from "../../../utils/helpers";
import type { RootState } from "../../../store/store";
import {
    requirementMasterRows,
    type RequirementMasterRow,
} from "./requirementMasterData";
import { CloseIcon, EditIcon } from "../../../icons/Icons";
import {
    OPEN_REQUIREMENT_MANAGEMENT_EVENT,
    type OpenRequirementManagementEvent,
} from "./requirementManagementEvents";

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

const getTeamOptionsFromMaster = (roleType: string): Option[] => {
    const normalizedRoleType = roleType.trim().toLowerCase();
    const hasUW = requirementMasterRows.some((row) => row.team === "UW");
    const hasGops = requirementMasterRows.some((row) => row.team === "Gops");
    const options: Option[] = [];

    if (hasUW) {
        const uwLabel = normalizedRoleType.includes("cvt") ? "CVT Team" : "UW";
        options.push({ label: uwLabel, value: uwLabel });
    }

    if (hasGops) {
        options.push({ label: "DVT Team", value: "DVT Team" });
    }

    return options;
};

const MASTER_TEAM_BY_UI: Record<LookupTeam, RequirementMasterRow["team"]> = {
    "CVT Team": "UW",
    "DVT Team": "Gops",
    UW: "UW",
};

const STATUS_OPTIONS: Option[] = [
    { label: "Pending", value: "Pending" },
    { label: "Waived", value: "Waived" },
    { label: "Rejected", value: "Rejected" },
    { label: "Accept", value: "Accept" },
];

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

const toOption = (value: string): Option => ({ label: value, value });

const mapTeamValueToUi = (team: string, roleType: string): string => {
    const normalizedTeam = team.trim().toLowerCase();
    const normalizedRoleType = roleType.trim().toLowerCase();

    if (!normalizedTeam) {
        return "";
    }

    if (normalizedTeam === "gops" || normalizedTeam.includes("dvt")) {
        return "DVT Team";
    }

    if (normalizedTeam === "uw") {
        return normalizedRoleType.includes("cvt") ? "CVT Team" : "UW";
    }

    return team;
};

const toOptionsFromList = (items: Array<{ label: string; value: string }>): Option[] =>
    uniqueNonEmpty(items.map((item) => String(item.value ?? item.label ?? ""))).map(toOption);

const FALLBACK_PROFILE_OPTIONS = toOptionsFromList(rm_profile);
const FALLBACK_CATEGORY_OPTIONS = toOptionsFromList(rm_category);
const FALLBACK_SUB_CATEGORY_OPTIONS = toOptionsFromList(rm_sub_category);
const FALLBACK_DOCUMENT_OPTIONS = toOptionsFromList(rm_document);
const FALLBACK_REASON_OPTIONS = toOptionsFromList(rm_reason);

const getFallbackTeamOptions = (roleType: string): Option[] =>
    uniqueNonEmpty(rm_team.map((item) => mapTeamValueToUi(String(item.value ?? item.label ?? ""), roleType))).map(
        toOption,
    );

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
) => {
    const masterTeam = getMasterTeamForUiValue(row.team);
    if (!masterTeam) {
        return [];
    }

    return requirementMasterRows.filter(
        (entry) =>
            entry.team === masterTeam &&
            (!row.profile || entry.profile === row.profile) &&
            (!row.category || entry.category === row.category) &&
            (!row.subCategory || entry.subCategory === row.subCategory) &&
            (!row.document || entry.document === row.document) &&
            (!row.reason || entry.reason === row.reason),
    );
};

const applyLookupToRow = (row: EditableRequirementRow, requiresProfile: boolean): EditableRequirementRow => {
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

    const matches = getScopedMasterRows(row);

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

interface RequirementManagementTableProps {
    requirements?: AdditionalRequirementRow[];
}

const RequirementManagementTable = ({ requirements }: RequirementManagementTableProps) => {
    const roleType = String(localStorage.getItem("roleType") ?? "");
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

    const isVisible = roleType !== "Ready For Issuance Pool";
    const teamOptions = useMemo(() => {
        const masterOptions = getTeamOptionsFromMaster(roleType);
        const fallbackOptions = getFallbackTeamOptions(roleType);
        return uniqueNonEmpty([
            ...masterOptions.map((item) => item.value),
            ...fallbackOptions.map((item) => item.value),
        ]).map(toOption);
    }, [roleType]);
    const finalRequirements = requirements ?? reduxRequirements;
    const normalizedExistingRows = useMemo(
        () => finalRequirements.map((row, index) => normalizeExistingRow(row, index)),
        [finalRequirements],
    );

    const [localRows, setLocalRows] = useState<EditableRequirementRow[]>([]);
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
                return currentUserHasRaisedRequirement ? previousRows : [...previousRows, createDraftRow()];
            });
        };

        window.addEventListener(OPEN_REQUIREMENT_MANAGEMENT_EVENT, handleOpenRequirementManagement);

        return () => {
            window.removeEventListener(OPEN_REQUIREMENT_MANAGEMENT_EVENT, handleOpenRequirementManagement);
        };
    }, [isVisible, normalizedExistingRows]);

    const getCategoryOptions = (row: EditableRequirementRow) => {
        const options = uniqueNonEmpty(
            getScopedMasterRows({ ...row, profile: shouldShowProfileAndSpecialTest ? row.profile : "", category: "", subCategory: "", document: "", reason: "" }).map(
                (entry) => entry.category,
            ),
        ).map(toOption);

        return options.length > 0 ? options : FALLBACK_CATEGORY_OPTIONS;
    };

    const getProfileOptions = (row: EditableRequirementRow) => {
        const options = uniqueNonEmpty(
            getScopedMasterRows({ ...row, profile: "", category: "", subCategory: "", document: "", reason: "" }).map(
                (entry) => entry.profile,
            ),
        ).map(toOption);

        return options.length > 0 ? options : FALLBACK_PROFILE_OPTIONS;
    };

    const getSubCategoryOptions = (row: EditableRequirementRow) => {
        const options = uniqueNonEmpty(
            getScopedMasterRows({ ...row, subCategory: "", document: "", reason: "" }).map(
                (entry) => entry.subCategory,
            ),
        ).map(toOption);

        return options.length > 0 ? options : FALLBACK_SUB_CATEGORY_OPTIONS;
    };

    const getDocumentOptions = (row: EditableRequirementRow) => {
        const options = uniqueNonEmpty(
            getScopedMasterRows({ ...row, document: "", reason: "" }).map((entry) => entry.document),
        ).map(toOption);

        return options.length > 0 ? options : FALLBACK_DOCUMENT_OPTIONS;
    };

    const getReasonOptions = (row: EditableRequirementRow) => {
        const options = uniqueNonEmpty(
            getScopedMasterRows({ ...row, reason: "" }).map((entry) => entry.reason),
        ).map(toOption);

        return options.length > 0 ? options : FALLBACK_REASON_OPTIONS;
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

            return applyLookupToRow(nextRow, shouldShowProfileAndSpecialTest);
        });
    };

    const handleSave = (rowId: string) => {
        updateRow(rowId, (row) => {
            const preparedRow = applyLookupToRow(row, shouldShowProfileAndSpecialTest);
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
        setLocalRows((previousRows) => previousRows.filter((row) => row.__rowId !== rowId));
    };

    const handleEditLocalSaved = (rowId: string) => {
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

    const savedColumns: Column<EditableRequirementRow>[] = [
        { key: "team", header: "Team", width: "2%" },
        ...(shouldShowProfileAndSpecialTest
            ? ([{ key: "profile", header: "Profile", width: "4%" }] as Column<EditableRequirementRow>[])
            : []),
        { key: "category", header: "Category", width: "4%" },
        { key: "subCategory", header: "Sub Category", width: "7%" },
        { key: "document", header: "Document", width: "5%" },
        { key: "reason", header: "Reason", width: "5%" },
        ...(shouldShowProfileAndSpecialTest
            ? ([{ key: "specialTest", header: "Special Test", width: "6%" }] as Column<EditableRequirementRow>[])
            : []),
        { key: "fupCode", header: "FUP Code", width: "5%" },
        { key: "description", header: "Description", width: "8%" },
        {
            key: "status",
            header: "Status",
            width: "6%",
            render: (_value, row) => {
                if (!isPendingStatus(row.status)) {
                    return (
                        <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                            {toDisplayValue(row.status)}
                        </Typography>
                    );
                }

                return renderEditableSelect(row, "status", STATUS_OPTIONS, false);
            },
        },
        { key: "raisedDate", header: "Raised Date", width: "6%" },
        { key: "raisedBy", header: "Raised By", width: "6%" },
        { key: "receivedDate", header: "Received Date", width: "7%" },
        { key: "receivedBy", header: "Received By", width: "6%" },
        {
            key: "__rowId",
            header: "Actions",
            width: "2%",
            sticky: "right",
            render: (_value, row) => {
                if (!row.__isLocal) {
                    return (
                        <Typography sx={{ fontSize: 12, color: "#94A3B8" }}>
                            -
                        </Typography>
                    );
                }

                return (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, whiteSpace: "nowrap" }}>
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
                            px: 2,
                            "&:hover": { backgroundColor: "#FFFFFF" },
                        }}
                        onClick={() => setLocalRows((previousRows) => [...previousRows, createDraftRow()])}
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
                    <Box sx={{ display: "grid", gap: 2, overflowX: "auto" }}>
                        {savedRows.length > 0 ? (
                            <Box>
                                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#334155", mb: 1.25 }}>
                                    Saved Requirements
                                </Typography>
                                <Box
                                    sx={{
                                        width: "100%",
                                        overflowX: "auto",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            minWidth: shouldShowProfileAndSpecialTest ? 1800 : 1500,
                                        }}
                                    >
                                        <CustomTable<EditableRequirementRow>
                                            columns={savedColumns}
                                            data={savedRows}
                                        />
                                    </Box>
                                </Box>
                            </Box>
                        ) : null}

                        {draftRows.map((row, rowIndex) => {
                            const profileOptions = getProfileOptions(row);
                            const categoryOptions = getCategoryOptions(row);
                            const subCategoryOptions = getSubCategoryOptions(row);
                            const documentOptions = getDocumentOptions(row);
                            const reasonOptions = getReasonOptions(row);
                            const canEditStatus = row.__isDraft || isPendingStatus(row.status);

                            return (
                                <Box
                                    key={row.__rowId}
                                    sx={{
                                        borderRadius: 3,
                                        border: row.__isDraft ? "1px solid #9A2529" : "1px solid #D7DEE7",
                                        backgroundColor: "#FFFFFF",
                                        boxShadow: row.__isDraft ? "0 10px 24px rgba(154, 37, 41, 0.08)" : "none",
                                        overflow: "hidden",
                                        width: "89vw",
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
                                                    Delete
                                                </CustomButton>
                                                <CustomButton
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleSave(row.__rowId)}
                                                    sx={{ borderRadius: 999, px: 2 }}
                                                >
                                                    Save
                                                </CustomButton>
                                            </Box>
                                        ) : (
                                            <Typography sx={{ fontSize: 11, color: "#64748B" }}>
                                                {canEditStatus
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
                                            {renderField(
                                                "Status",
                                                canEditStatus
                                                    ? renderEditableSelect(row, "status", STATUS_OPTIONS, false)
                                                    : renderReadOnlyField(row.status),
                                            )}
                                            {renderField("Raised Date", renderReadOnlyField(row.raisedDate))}
                                            {renderField("Raised By", renderReadOnlyField(row.raisedBy))}
                                            {renderField("Received Date", renderReadOnlyField(row.receivedDate))}
                                            {renderField("Received By", renderReadOnlyField(row.receivedBy))}
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
                        gap: 2,
                        mt: 2,
                    }}
                >
                    <CustomButton
                        variant="contained"
                        sx={{
                            minWidth: 200,
                            height: 44,
                            borderRadius: "50px",
                            fontWeight: 600,
                            px: 3,
                            whiteSpace: "nowrap",
                        }}
                    >
                        Submit
                    </CustomButton>
                </Box>
            </Box>
        </Paper>
    );
};

export default RequirementManagementTable;
