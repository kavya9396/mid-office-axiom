import { Box, Divider, Typography } from "@mui/material";
import { KeyRightArrowIcon, LinkIcon, PlusIcon } from "../../icons/Icons";
import { centerFlex, columnFlex } from "../../utils/styles";
import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import {
    getAuditTrailPath,
    getFinancialPath,
    getInboxPath,
    getMedicalPath,
    getOpenTasksPath,
    getPreviousPoliciesPath,
    getRiskDetailsPath,
    getSearchApplicationPath,
    normalizeBusinessType,
} from "../../routes/routes";
import { useAppContext } from "../../hooks/useAppContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { completeTaskThunk } from "../../store/thunks/completeTaskThunk";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import CustomButton from "../../components/ui/Button/Button";
import CustomSnackbar from "../../components/ui/SnackBar/Snackbar";
import { modalTitleStyles } from "../../utils/styles";

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

interface QuickLinksProps {
    applicationNo?: string;
    hideSearchApplication?: boolean;
}

interface QuickLinkItem {
    label: string;
    path: string;
    unavailableMessage?: string;
}

interface DrsQuickLinksData {
    proposerForm?: unknown;
    previousPolicies?: unknown;
    openOtherTasks?: unknown;
    riskDetails?: unknown;
    auditTrail?: unknown;
}

interface SnackbarState {
    open: boolean;
    message: string;
}

const getEmptyArrayMessage = (
    value: unknown,
    message: string,
): string | undefined =>
    Array.isArray(value) && value.length === 0 ? message : undefined;

const NEW_TAB_LABELS = new Set([
    "Proposal Form & Documents",
    "Document link",
]);

const openOrFocusNamedWindow = (url: string, name: string): void => {
    try {
        const win = window.open(url, name);

        if (win) {
            try {
                win.focus();
            } catch {
                // Ignore cross-origin focus errors.
            }
        }
    } catch {
        try {
            window.open(url, "_blank");
        } catch {
            // Ignore browser popup errors.
        }
    }
};

const getSelectedCaseApplicationNo = (): string => {
    try {
        const context = JSON.parse(
            localStorage.getItem("selectedCaseContext") ?? "{}",
        ) as { applicationNo?: unknown };

        return String(context.applicationNo ?? "").trim();
    } catch {
        return "";
    }
};

interface SelectedCaseContext {
    applicationNo?: string;
    userId?: string;
    businessType?: string;
    taskId?: string;
    instanceId?: string;
    taskCompositeId?: string;
    roleType?: string;
}

interface MiscMaster {
    type?: unknown;
    code?: unknown;
    miscMastType?: unknown;
    miscMastCode?: unknown;
}

const getMiscType = (master: MiscMaster): string =>
    String(master.type ?? master.miscMastType ?? "").trim().toUpperCase();

const getMiscCode = (master: MiscMaster | undefined): string =>
    String(master?.code ?? master?.miscMastCode ?? "").trim();

const toRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

const getNestedData = (value: unknown): Record<string, unknown> => {
    let current = toRecord(value);

    for (let depth = 0; depth < 4; depth += 1) {
        const nested = toRecord(current.data);

        if (Object.keys(nested).length === 0) break;
        current = nested;
    }

    return current;
};

const getMiscMasters = (value: unknown): MiscMaster[] => {
    const misc = getNestedData(value).misc;

    return Array.isArray(misc)
        ? misc.filter(
            (item): item is MiscMaster =>
                !!item && typeof item === "object" && !Array.isArray(item),
        )
        : [];
};

const normalizeTaskId = (value: string): string => {
    const normalizedValue = value.trim();

    if (!normalizedValue) return "";
    return normalizedValue.split(".").at(-1)?.trim() ?? normalizedValue;
};

const getSelectedCaseContext = (): SelectedCaseContext => {
    try {
        return JSON.parse(
            localStorage.getItem("selectedCaseContext") ?? "{}",
        ) as SelectedCaseContext;
    } catch {
        return {};
    }
};

const QuickLinks = ({
    applicationNo,
    hideSearchApplication = false,
}: QuickLinksProps) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [openReferToItDialog, setOpenReferToItDialog] = useState(false);
    const [referToItLoading, setReferToItLoading] = useState(false);
    const [referToItError, setReferToItError] = useState<string | null>(null);
    const [quickLinkSnackbar, setQuickLinkSnackbar] = useState<SnackbarState>({
        open: false,
        message: "",
    });
    const {
        businessType,
        applicationNumber,
    } = useAppContext();
    const drsData = useAppSelector((state) => state.drs.data);
    const masterData = useAppSelector((state) => state.masterData);
    const selectedCaseContext = getSelectedCaseContext();

    const safeBusinessType =
        normalizeBusinessType(businessType) ??
        normalizeBusinessType(selectedCaseContext.businessType) ??
        normalizeBusinessType(localStorage.getItem("businessType")) ??
        "retail";
    const safeApplicationNumber = String(
        applicationNo ??
        applicationNumber ??
        selectedCaseContext.applicationNo ??
        localStorage.getItem("applicationNo") ??
        getSelectedCaseApplicationNo(),
    ).trim();
    const safeUserId = String(
        selectedCaseContext.userId ??
        localStorage.getItem("userId") ??
        localStorage.getItem("username") ??
        "",
    ).trim();
    const roleType =
        selectedCaseContext.roleType ?? localStorage.getItem("roleType") ?? "";
    const referToItDecisionCode = getMiscCode(
        getMiscMasters(masterData).find(
            (master) => getMiscType(master) === "REF_IT",
        ),
    );
    const visibleButtons = [
        'CPT_TASK',
        'CPT_DATA_ENTRY_MR_TASK',
        'GUW_FORMAL_TASK',
    ];

    const isPoolRole = visibleButtons.includes(roleType);
    const selectedApplicantTab = localStorage.getItem("drsSelectedApplicantTab") ?? "proposer";

    const summaryEntries = toSummaryEntries(
        (drsData as unknown as { summary?: unknown } | null)?.summary,
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
    const drsQuickLinks = (
        drsData as unknown as { quickLinks?: DrsQuickLinksData } | null
    )?.quickLinks;

    const proposerFormLink = String(
        drsQuickLinks?.proposerForm ??
        summaryPersonal.UDSLink ??
        "",
    ).trim();

    const quickLinks: QuickLinkItem[] = [
        ...(roleType !== 'DVT_FORMAL_TASK' ? [
        {
            label: "Proposal Form & Documents",
            path: proposerFormLink,
            unavailableMessage: !proposerFormLink
                ? "There is no document link found."
                : undefined,
        },
        {
            label: "Previous Policies",
            path: safeApplicationNumber ? getPreviousPoliciesPath(safeBusinessType, safeApplicationNumber) : "",
            unavailableMessage: getEmptyArrayMessage(
                drsQuickLinks?.previousPolicies,
                "There are no previous policies found.",
            ),
        },
        {
            label: "Open Tasks",
            path: safeApplicationNumber ? getOpenTasksPath(safeBusinessType, safeApplicationNumber) : "",
            unavailableMessage: getEmptyArrayMessage(
                drsQuickLinks?.openOtherTasks,
                "There are no open tasks found.",
            ),
        },
        ] : []),
        ...(roleType !== 'DVT Pool' && roleType !== 'DVT_FORMAL_TASK' ? [
            {
                label: "Risk Details",
                path: safeApplicationNumber ? getRiskDetailsPath(safeBusinessType, safeApplicationNumber) : "",
                unavailableMessage: getEmptyArrayMessage(
                    drsQuickLinks?.riskDetails,
                    "There are no risk details found.",
                ),
            },
        ] : []),
        {
            label: "Audit Trail",
            path: safeApplicationNumber ? getAuditTrailPath(safeBusinessType, safeApplicationNumber) : "",
            unavailableMessage: getEmptyArrayMessage(
                drsQuickLinks?.auditTrail,
                "There is no audit trail found.",
            ),
        },
        { label: "Refer to IT", path: "" },
        ...(isPoolRole
            ? [
                { label: "View Medical", path: safeApplicationNumber ? getMedicalPath(safeBusinessType, safeApplicationNumber) : "" },
            ]
            : []),
            ...(roleType == 'CPT_DATA_ENTRY_NMR_TASK' || roleType == 'GUW_FORMAL_TASK' ? [
                { label: "View Financial", path: safeApplicationNumber ? getFinancialPath(safeBusinessType, safeApplicationNumber) : "" },
            ]:[]),
        ...(hideSearchApplication
            ? []
            : [
                {
                    label: "Search Application",
                    path: getSearchApplicationPath(),
                },
            ]),
    ];

    const toggleQuickLinks = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const handleReferToIt = useCallback(async () => {
        const rawTaskId = String(
            selectedCaseContext.taskId ??
            selectedCaseContext.taskCompositeId ??
            localStorage.getItem("taskId") ??
            localStorage.getItem("taskCompositeId") ??
            "",
        ).trim();
        const taskId = normalizeTaskId(rawTaskId);
        const instanceId = String(
            selectedCaseContext.instanceId ??
            localStorage.getItem("instanceId") ??
            "",
        ).trim();

        if (!safeApplicationNumber || !safeUserId) {
            setReferToItError("Application number or user ID is missing.");
            return;
        }

        if (!taskId || !instanceId) {
            setReferToItError("Task ID or instance ID is missing.");
            return;
        }

        if (!referToItDecisionCode) {
            setReferToItError("Refer to IT decision code is not available in masters.");
            return;
        }

        try {
            setReferToItLoading(true);
            setReferToItError(null);

            await dispatch(
                completeTaskThunk({
                    businessType: safeBusinessType,
                    requestContext: {
                        taskId,
                        userId: safeUserId,
                        appNo: safeApplicationNumber,
                        instanceId,
                        remarks: "",
                        decision: referToItDecisionCode,
                    },
                }),
            ).unwrap();

            setOpenReferToItDialog(false);
            navigate(getInboxPath(safeBusinessType), {
                state: {
                    snackbarMessage: "Case has been referred to IT successfully",
                },
            });
        } catch (error) {
            setReferToItError(error instanceof Error ? error.message : "Failed to refer to IT.");
        } finally {
            setReferToItLoading(false);
        }
    }, [
        dispatch,
        navigate,
        referToItDecisionCode,
        safeApplicationNumber,
        safeBusinessType,
        safeUserId,
        selectedCaseContext.instanceId,
        selectedCaseContext.taskId,
        selectedCaseContext.taskCompositeId,
    ]);

    const handleNavigate = useCallback(
        (label: string, path: string, unavailableMessage?: string) => {
            if (label === "Refer to IT") {
                setReferToItError(null);
                setOpenReferToItDialog(true);
                return;
            }

            if (unavailableMessage) {
                setQuickLinkSnackbar({
                    open: true,
                    message: unavailableMessage,
                });
                return;
            }

            if (!path) return;

            const targetUrl = new URL(path, window.location.origin).toString();

            if (NEW_TAB_LABELS.has(label)) {
                // Use a stable window name so repeated clicks reuse the same tab instead of opening many.
                const safeName = `drs_${label.replace(/\s+/g, "_").toLowerCase()}_${String(safeApplicationNumber ?? "").replace(/[^a-z0-9_-]/gi, "")}`;
                openOrFocusNamedWindow(targetUrl, safeName);
                return;
            }

            // open same-tab for internal links
            try {
                // If the target is same-origin and a route, use navigate; otherwise fallback to location.href
                if (targetUrl.startsWith(window.location.origin)) {
                    const relative = targetUrl.slice(window.location.origin.length);
                    navigate(relative, { replace: false });
                    return;
                }
            } catch {
                // ignore and fallback
            }

            // external but not in NEW_TAB_LABELS -> open in same tab
            window.location.href = targetUrl;
        },
        [navigate, safeApplicationNumber]
    );

    return (
        <Box
            data-drs-quick-links="true"
            sx={{
                position: "fixed",
                bottom: "10%",
                right: "3%",
                zIndex: 1000,
            }}
        >
            {isOpen && (
                <Box
                    sx={{
                        ...columnFlex,
                        gap: 2,
                        width: 276,
                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 2,
                            boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#1e1e1e",
                                px: 2,
                                py: 1.5,
                                bgcolor: "#F5F5F5",
                                borderRadius: "8px 8px 0 0",
                            }}
                        >
                            Quick Links
                        </Typography>

                        <Divider />

                        {quickLinks.map(({ label, path, unavailableMessage }, index) => (
                            <Box key={label}>
                                <Box
                                    onClick={() =>
                                        handleNavigate(label, path, unavailableMessage)
                                    }
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        cursor:
                                            path ||
                                            unavailableMessage ||
                                            label === "Refer to IT" ||
                                            label === "Proposal Form & Documents"
                                                ? "pointer"
                                                : "default",
                                    }}
                                >
                                    <Typography sx={{ fontSize: 14, color: "#444" }}>
                                        {label}
                                    </Typography>

                                    <KeyRightArrowIcon />
                                </Box>

                                {index !== quickLinks.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box
                    onClick={toggleQuickLinks}
                    sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        bgcolor: "#9A2529",
                        cursor: "pointer",
                        ...centerFlex,
                    }}
                >
                    <Box
                        sx={{
                            position: "relative",
                            width: 24,
                            height: 24,
                        }}
                    >
                        {[{
                            visible: !isOpen,
                            icon: <LinkIcon />,
                        }, {
                            visible: isOpen,
                            icon: <PlusIcon width={24} height={24} />,
                            rotate: "45deg",
                        }].map(({ visible, icon, rotate = "0deg" }, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    ...centerFlex,
                                    color: "#fff",
                                    transition: "all 300ms ease",
                                    opacity: visible ? 1 : 0,
                                    transform: visible
                                        ? `${rotate} scale(1)`
                                        : "rotate(-90deg) scale(0.5)",
                                }}
                            >
                                {icon}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            <CustomSnackbar
                open={quickLinkSnackbar.open}
                message={quickLinkSnackbar.message}
                severity="error"
                onClose={() =>
                    setQuickLinkSnackbar((previous) => ({
                        ...previous,
                        open: false,
                    }))
                }
            />

            <CustomDialog
                open={openReferToItDialog}
                showCloseIcon={true}
                onClose={() => setOpenReferToItDialog(false)}
                title={
                    <Typography
                        sx={{
                            ...modalTitleStyles,
                        }}
                    >
                        Refer to IT
                    </Typography>
                }
                actionsSx={{
                    justifyContent: "center",
                    pb: 2,
                }}
                actions={
                    <CustomButton
                        onClick={() => {
                            void handleReferToIt();
                        }}
                        disabled={referToItLoading}
                        sx={{ borderRadius: "50px", paddingX: "40px" }}
                    >
                        {referToItLoading ? "Submitting..." : "Refer to IT"}
                    </CustomButton>
                }
            >
                <Typography
                    sx={{
                        fontSize: "14px",
                        color: "#161616",
                    }}
                >
                    Kindly refer this ticket to IT Team.
                </Typography>
                {referToItError && (
                    <Typography
                        sx={{
                            mt: 1,
                            fontSize: "13px",
                            color: "#DE2C3B",
                        }}
                    >
                        {referToItError}
                    </Typography>
                )}
            </CustomDialog>
        </Box>
    );
};

export default QuickLinks;
