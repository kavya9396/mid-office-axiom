import { Alert, Box, Snackbar, Typography } from "@mui/material"
import CustomAccordion from "../../../components/ui/Accordion/Accordion"
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useEffect, useMemo, useState } from "react";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomButton from "../../../components/ui/Button/Button";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { completeTaskThunk } from "../../../store/thunks/completeTaskThunk";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import type { ApplicantTab } from "../../../types/drs.types";
import { openRequirementManagement } from "./requirementManagementEvents";
import { getCompleteTaskResult } from "./completeTaskResponse";
import { normalizeMasterOptions, toMasterLabel } from "../../../utils/masterOptions";
import { filterAcceptDecisionOptions, validateDrsFinalBre } from "../../../validations/drsBreValidation";
import { validateApplicantTabsVisited } from "../../../validations/drsApplicantTabValidation";
import { validateRequirementDecision } from "../../../validations/drsRequirementDecisionValidation";
import { getErrorMessage } from "../../../config/errorMessages";

const DRS_REQUIRED_APPLICANT_TABS_KEY = "drsRequiredApplicantTabs";
const DRS_VISITED_APPLICANT_TABS_KEY = "drsVisitedApplicantTabs";
const DRS_TAB_VISIT_EVENT = "drsApplicantTabsVisitedChanged";

const APPLICANT_TAB_LABELS: Record<ApplicantTab, string> = {
    proposer: "Proposer",
    lifeassured:"Life Assured",
    lifeassured1: "Life Assured 1",
    lifeassured2: "Life Assured 2",
};

const getStoredTabs = (key: string): ApplicantTab[] => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.map((value) => String(value) as ApplicantTab)
            : [];
    } catch {
        return [];
    }
};

const formatPendingTabLabels = (tabs: ApplicantTab[]): string => {
    const labels = tabs.map((tab) => APPLICANT_TAB_LABELS[tab] ?? tab);

    if (labels.length <= 1) return labels[0] ?? "applicant section";
    if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;

    return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
};

const toRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

const normalizeTaskId = (value: unknown): string => {
    const task = String(value ?? "").trim();
    if (!task) return "";
    return task.includes(".") ? task.split(".").pop() ?? "" : task;
};

const parseInstanceFromCompositeTaskId = (value: unknown): string => {
    const task = String(value ?? "").trim();
    if (!task.includes(".")) return "";

    const [instancePart = ""] = task.split(".");
    return String(instancePart).trim();
};

type SelectedCaseContext = {
    applicationNo?: string;
    taskId?: string;
    instanceId?: string;
    taskCompositeId?: string;
};

type BreMandatoryGuidance = {
    action: string;
    requirements: string;
    remarks: string;
};

const toText = (value: unknown): string => String(value ?? "").trim();

const joinUnique = (values: string[]): string =>
    Array.from(new Set(values.map((value) => value.trim()).filter(Boolean))).join(", ");

const getBreMandatoryGuidance = (drsData: Record<string, unknown> | null): BreMandatoryGuidance | null => {
    if (!drsData) return null;

    const rootBreDecision = toRecord(drsData.breDecision);
    const externalApis = toRecord(drsData.externalAPIs);
    const breOutput = toRecord(externalApis.breOutput);
    const decisionTypes = toRecord(breOutput.decisionTypes);

    const actionCandidates = [
        toText(decisionTypes.breAction),
        toText(rootBreDecision.action),
        toText(breOutput.action),
    ];

    const remarksCandidates = [
        toText(breOutput.breRemarks),
        toText(rootBreDecision.remarks),
        toText(decisionTypes.breRemarks),
    ];

    const requirementsFromArray = Array.isArray(breOutput.requirements)
        ? breOutput.requirements
            .map((item) => {
                const row = toRecord(item);
                return toText(
                    row.requirement ??
                    row.code ??
                    row.name ??
                    row.type ??
                    row.value,
                );
            })
            .filter(Boolean)
        : [];

    const requirementsCandidates = [
        ...requirementsFromArray,
        toText(decisionTypes.breRequirement),
        toText(rootBreDecision.discrepancy),
    ];

    const action = joinUnique(actionCandidates);
    const requirements = joinUnique(requirementsCandidates);
    const remarks = joinUnique(remarksCandidates);

    if (!action && !requirements && !remarks) {
        return null;
    }

    return {
        action,
        requirements,
        remarks,
    };
};

const getSelectedCaseContext = (): SelectedCaseContext | null => {
    try {
        const raw = localStorage.getItem("selectedCaseContext");
        if (!raw) return null;

        const parsed = JSON.parse(raw) as SelectedCaseContext;
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
        return null;
    }
};

const CVTDecision = () => {
    const dispatch = useAppDispatch();
    const [uwDecisionRemarks, setUwDecisionRemarks] = useState("");
    const [decision, setDecision] = useState<string>("");
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [submitStatus, setSubmitStatus] = useState<"success" | "failure" | null>(null);
    const [tabValidationMessage, setTabValidationMessage] = useState<string | null>(null);
    const [tabValidationDismissed, setTabValidationDismissed] = useState(false);
    const [breActionDialogOpen, setBreActionDialogOpen] = useState(false);
    const [requiredApplicantTabs, setRequiredApplicantTabs] = useState<ApplicantTab[]>(() =>
        getStoredTabs(DRS_REQUIRED_APPLICANT_TABS_KEY),
    );
    const [visitedApplicantTabs, setVisitedApplicantTabs] = useState<ApplicantTab[]>(() =>
        getStoredTabs(DRS_VISITED_APPLICANT_TABS_KEY),
    );
    const navigate = useNavigate();
    const pendingApplicantTabs = useMemo(
        () => requiredApplicantTabs.filter((tab) => !visitedApplicantTabs.includes(tab)),
        [requiredApplicantTabs, visitedApplicantTabs],
    );
    const pendingApplicantTabsMessage = useMemo(() => {
        if (pendingApplicantTabs.length === 0) return "";

        const formattedTabs = formatPendingTabLabels(pendingApplicantTabs);
        return `Please visit ${formattedTabs} at least once before submitting.`;
    }, [pendingApplicantTabs]);
    const hasVisitedAllApplicantTabs = pendingApplicantTabs.length === 0;
    const { businessType, applicationNumber } = useAppContext();
    const drsData = useAppSelector((state) => state.drs.data as unknown as Record<string, unknown> | null);
    const masters = useAppSelector((state) => state.drs.masters);
    const cvtDecisionOptions = useMemo(() => {
        // Safely extract an array of MasterOption from masters.misc (supports various shapes)
        const misc = (masters as Record<string, unknown> | undefined)?.misc;

        const toMasterList = (options?: unknown) => {
            if (Array.isArray(options)) return options as unknown[];
            if (!options || typeof options !== "object") return [] as unknown[];

            const record = options as Record<string, unknown>;
            if (Array.isArray(record.data)) return record.data as unknown[];
            if (Array.isArray(record.options)) return record.options as unknown[];
            if (Array.isArray(record.values)) return record.values as unknown[];

            return Object.values(record).flatMap((v) => (Array.isArray(v) ? v : []));
        };

        const rawList = toMasterList(misc) as Array<Record<string, unknown>>;

        const cvtRaw = rawList.filter((opt) => String(opt?.code ?? opt?.key ?? "").trim().toUpperCase() === "CVT");

     

        const mapped = cvtRaw
            .map((option) => {
                const code = String(option.code ?? option.key ?? "").trim();
                const description = String(option.description ?? option.label ?? "").trim();
                const disabled = Boolean(option.disabled ?? (String(option.isActive ?? "").toUpperCase() === "N"));
                const optType = String(option.type ?? "").trim();

                if (!description || !code) return null;

                return {
                    label: description,
                    value: code,
                    description,
                    type: optType,
                    code,
                    disabled,
                } as { label: string; value: string; description: string; type: string; code: string; disabled?: boolean };
            })
            .filter(Boolean) as { label: string; value: string; description: string; type: string; code: string; disabled?: boolean }[];

        const final = filterAcceptDecisionOptions(mapped, drsData);

        if (final.length === 0) {
            // Fallback to legacy cvtDecision master (keeps previous behavior)
            try {
                const legacy = normalizeMasterOptions((masters as Record<string, unknown>)?.cvtDecision);
                return filterAcceptDecisionOptions(legacy, drsData);
            } catch (e) {
                console.log("Error: ", e)
                return final;
            }
        }

        return final;
    }, [drsData, masters]);
    const effectiveDecision = cvtDecisionOptions.some((option) => option.value === decision)
        ? decision
        : "";
    const decisionLabel = toMasterLabel(effectiveDecision, cvtDecisionOptions);
    const isDecisionAndRemarksReady =
        uwDecisionRemarks.trim().length > 0 &&
        effectiveDecision.trim().length > 0;
    
    const isSubmitEnabled =
        isDecisionAndRemarksReady &&
        hasVisitedAllApplicantTabs;
    const shouldShowTabValidationHint =
        isDecisionAndRemarksReady &&
        !hasVisitedAllApplicantTabs &&
        !tabValidationDismissed;
    const breMandatoryGuidance = useMemo(() => getBreMandatoryGuidance(drsData), [drsData]);
    const safeBusinessType =
        normalizeBusinessType(businessType) ??
        normalizeBusinessType(localStorage.getItem("businessType")) ??
        "retail";
    const userId = String(localStorage.getItem("username") ?? "").trim();
    const selectedCaseContext = getSelectedCaseContext();
    const isSelectedCaseSameApplication =
        String(selectedCaseContext?.applicationNo ?? "").trim() === String(applicationNumber ?? "").trim();

    const taskId = useMemo(() => {
        const fromSelectedCase = isSelectedCaseSameApplication
            ? String(selectedCaseContext?.taskId ?? "").trim()
            : "";
        if (fromSelectedCase) return fromSelectedCase;

        const fromRoleListSelection = String(localStorage.getItem("taskId") ?? "").trim();
        if (fromRoleListSelection) return fromRoleListSelection;

        const compositeTaskId = isSelectedCaseSameApplication
            ? selectedCaseContext?.taskCompositeId
            : localStorage.getItem("taskCompositeId");
        const fromCompositeTaskId = normalizeTaskId(compositeTaskId);
        if (fromCompositeTaskId) return fromCompositeTaskId;

        const root = toRecord(drsData);
        const appInfo = toRecord(root.applicationInfo);

        const fromRoot = String(root.taskId ?? root.taskID ?? "").trim();
        if (fromRoot) return fromRoot;

        const fromApplicationInfo = String(appInfo.taskId ?? appInfo.taskID ?? "").trim();
        if (fromApplicationInfo) return fromApplicationInfo;

        return "";
    }, [drsData, isSelectedCaseSameApplication, selectedCaseContext?.taskCompositeId, selectedCaseContext?.taskId]);

    const instanceId = useMemo(() => {
        const fromSelectedCase = isSelectedCaseSameApplication
            ? String(selectedCaseContext?.instanceId ?? "").trim()
            : "";
        if (fromSelectedCase) return fromSelectedCase;

        const fromRoleListSelection = String(localStorage.getItem("instanceId") ?? "").trim();
        if (fromRoleListSelection) return fromRoleListSelection;

        const compositeTaskId = isSelectedCaseSameApplication
            ? selectedCaseContext?.taskCompositeId
            : localStorage.getItem("taskCompositeId");
        const fromCompositeTaskId = parseInstanceFromCompositeTaskId(compositeTaskId);
        if (fromCompositeTaskId) return fromCompositeTaskId;

        const root = toRecord(drsData);
        const appInfo = toRecord(root.applicationInfo);

        const fromRoot = String(root.instanceId ?? root.instanceID ?? "").trim();
        if (fromRoot) return fromRoot;

        const fromApplicationInfo = String(appInfo.instanceId ?? appInfo.instanceID ?? "").trim();
        if (fromApplicationInfo) return fromApplicationInfo;

        return "";
    }, [drsData, isSelectedCaseSameApplication, selectedCaseContext?.instanceId, selectedCaseContext?.taskCompositeId]);

    const syncTabVisitState = () => {
        setRequiredApplicantTabs(getStoredTabs(DRS_REQUIRED_APPLICANT_TABS_KEY));
        setVisitedApplicantTabs(getStoredTabs(DRS_VISITED_APPLICANT_TABS_KEY));
    };

    useEffect(() => {
        const onStorage = (event: StorageEvent) => {
            if (
                event.key === DRS_REQUIRED_APPLICANT_TABS_KEY ||
                event.key === DRS_VISITED_APPLICANT_TABS_KEY
            ) {
                syncTabVisitState();
            }
        };

        const onVisitEvent = () => {
            syncTabVisitState();
        };

        window.addEventListener("storage", onStorage);
        window.addEventListener(DRS_TAB_VISIT_EVENT, onVisitEvent);

        return () => {
            window.removeEventListener("storage", onStorage);
            window.removeEventListener(DRS_TAB_VISIT_EVENT, onVisitEvent);
        };
    }, []);

    const handleSubmit = async () => {
        const breValidation = validateDrsFinalBre(drsData);
        if (!breValidation.canPerformAction) {
            setSubmitMessage(breValidation.message);
            setSubmitStatus("failure");
            return;
        }

        if (!taskId || !userId || !applicationNumber || !instanceId) {
            setSubmitMessage("Missing required case information. Please open the case from inbox again.");
            setSubmitStatus("failure");
            return;
        }

        try {
            setSubmitLoading(true);
            setSubmitMessage(null);
            setSubmitStatus(null);

            // For CVT decisions, send the code field from the selected option
            const payloadDecision = effectiveDecision;

            const response = await dispatch(
                completeTaskThunk({
                    requestContext: {
                        taskId,
                        userId,
                        appNo: applicationNumber,
                        instanceId,
                        remarks: uwDecisionRemarks.trim(),
                        decision: String(payloadDecision).trim(),
                    },
                }),
            ).unwrap();

            const { success, message } = getCompleteTaskResult(response);
            setSubmitMessage(message);
            setSubmitStatus(success ? "success" : "failure");

            if (success) {
                navigate(getInboxPath(safeBusinessType), {
                    state: {
                        snackbarMessage: message,
                    },
                });
            }
        } catch (error) {
            setSubmitMessage(error instanceof Error ? error.message : "Failed to complete task.");
            setSubmitStatus("failure");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleSubmitIntent = () => {
        const breValidation = validateDrsFinalBre(drsData);
        if (!breValidation.canPerformAction) {
            setSubmitMessage(breValidation.message);
            setSubmitStatus("failure");
            return;
        }
        const applicantTabsValidation = validateApplicantTabsVisited(drsData);
        if (!applicantTabsValidation.isValid) {
            setTabValidationMessage(applicantTabsValidation.message);
            return;
        }

        if (!hasVisitedAllApplicantTabs) {
            setTabValidationMessage(pendingApplicantTabsMessage || getErrorMessage("drsApplicantTabsNotVisited"));
            return;
        }

        const requirementValidation = validateRequirementDecision(drsData, decisionLabel);
        if (!requirementValidation.isValid) {
            setTabValidationMessage(requirementValidation.message);
            return;
        }

        const isAcceptDecision = decisionLabel.trim().toLowerCase() === "accept";
        if (isAcceptDecision && breMandatoryGuidance) {
            setBreActionDialogOpen(true);
            return;
        }

        setConfirmationDialogOpen(true);
    };

    return (
        <>
            <Box sx={{ mt: 1,p:1 }}>
                <CustomAccordion title="CVT Decision" defaultExpanded>
                    <Box
                        sx={{
                            backgroundColor: "#F6F6F6",
                            p: 1.25,
                            mt: 0.75,
                            borderRadius: "6px",
                        }}
                    >

                        <Typography
                            sx={{
                                fontSize: "12px",
                                fontWeight: 400,
                                color: "#444",
                                mb: 0.5,
                            }}>CVT Remarks</Typography>

                        <CustomTextField
                            fullWidth
                            multiline
                            minRows={2}
                            placeholder="Enter remarks..."
                            value={uwDecisionRemarks}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 10000) {
                                    setUwDecisionRemarks(value);
                                    setSubmitMessage(null);
                                    setSubmitStatus(null);
                                    setTabValidationDismissed(false);
                                }
                            }} variant="outlined"
                            size="small"
                            sx={{
                                backgroundColor: "#fff",
                                borderRadius: "6px",
                            }}
                        />

                        <Typography sx={{ display: "flex", justifyContent: "flex-end", fontSize: "11px", color: "#888", mt: 0.25 }}>
                            {uwDecisionRemarks.length}/10000
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: 1,
                            }}
                        >
                            <CustomSelect
                                label="CVT Decision"
                                value={effectiveDecision}
                                onChange={(value: string) => {
                                    setDecision(value);
                                    setSubmitMessage(null);
                                    setSubmitStatus(null);
                                    setTabValidationDismissed(false);

                                    if (toMasterLabel(value, cvtDecisionOptions) === "Raise Requirements") {
                                        openRequirementManagement(true);
                                    }
                                }}
                                options={cvtDecisionOptions}
                            />
                        </Box>

                        {/* BRE validation message intentionally not shown upfront.
                            It will be displayed in the snackbar when user attempts submit. */}
                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
        mt: "5px",
                        }}
                    >
                        <CustomButton
                            variant="contained"
                            disabled={!isSubmitEnabled || !taskId || submitLoading}
                            onClick={handleSubmitIntent}
                            sx={{
                                minWidth: 150,
                                height: 36,
                                borderRadius: "50px",
                                fontWeight: 600,
                                px: 2.5,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {submitLoading ? "Submitting..." : "Submit"}
                        </CustomButton>
                    </Box>
                </CustomAccordion>
                <ConfirmationDialog
                    open={confirmationDialogOpen}
                    message="Do you want to submit the case?"
                    onClose={() => setConfirmationDialogOpen(false)}
                    onConfirm={() => {
                        setConfirmationDialogOpen(false);
                        void handleSubmit();
                    }}
                />
                <Snackbar
                    open={Boolean(submitMessage) && submitStatus === "failure"}
                    autoHideDuration={3000}
                    onClose={() => {
                        setSubmitMessage(null);
                        setSubmitStatus(null);
                    }}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert
                        onClose={() => {
                            setSubmitMessage(null);
                            setSubmitStatus(null);
                        }}
                        severity="error"
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {submitMessage}
                    </Alert>
                </Snackbar>

                <Snackbar
                    open={Boolean(tabValidationMessage) || shouldShowTabValidationHint}
                    autoHideDuration={5000}
                    onClose={() => {
                        setTabValidationMessage(null);
                        setTabValidationDismissed(true);
                    }}
                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                >
                    <Alert
                        onClose={() => {
                            setTabValidationMessage(null);
                            setTabValidationDismissed(true);
                        }}
                        severity="warning"
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {tabValidationMessage ?? pendingApplicantTabsMessage ?? getErrorMessage("drsApplicantTabsNotVisited")}
                    </Alert>
                </Snackbar>

                <CustomDialog
                    open={breActionDialogOpen}
                    onClose={() => setBreActionDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    title={
                        <Typography sx={{ fontSize: 18, fontWeight: 700 }}>
                            BRE Action Required
                        </Typography>
                    }
                    actions={
                        <CustomButton
                            onClick={() => setBreActionDialogOpen(false)}
                            sx={{ borderRadius: "50px", px: 4 }}
                        >
                            Understood
                        </CustomButton>
                    }
                >
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                        <Typography sx={{ fontSize: 14, color: "#444" }}>
                            CVT decision cannot be submitted as "Accept" until BRE mandated action is completed.
                        </Typography>

                        {!!breMandatoryGuidance?.action && (
                            <Box>
                                <Typography sx={{ fontSize: 12, color: "#666" }}>Action</Typography>
                                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#161616" }}>
                                    {breMandatoryGuidance.action}
                                </Typography>
                            </Box>
                        )}

                        {!!breMandatoryGuidance?.requirements && (
                            <Box>
                                <Typography sx={{ fontSize: 12, color: "#666" }}>Requirements</Typography>
                                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#161616" }}>
                                    {breMandatoryGuidance.requirements}
                                </Typography>
                            </Box>
                        )}

                        {!!breMandatoryGuidance?.remarks && (
                            <Box>
                                <Typography sx={{ fontSize: 12, color: "#666" }}>BRE Remarks</Typography>
                                <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#161616", whiteSpace: "pre-wrap" }}>
                                    {breMandatoryGuidance.remarks}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </CustomDialog>
            </Box>
        </>
    )
}

export default CVTDecision