import { Alert, Box, Container, Snackbar, Typography } from "@mui/material"
import CustomAccordion from "../../../components/ui/Accordion/Accordion"
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useEffect, useMemo, useState } from "react";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomButton from "../../../components/ui/Button/Button";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import { decisionCodeThunk } from "../../../store/thunks/decisionCodeThunk";
import { openRequirementManagement } from "./requirementManagementEvents";
import { completeTaskThunk } from "../../../store/thunks/completeTaskThunk";
import { getDecisionTaskContext } from "./decisionTaskContext";
import { getCompleteTaskResult } from "./completeTaskResponse";
import { toMasterLabel } from "../../../utils/masterOptions";
import { filterAcceptDecisionOptions, validateDrsFinalBre } from "../../../validations/drsBreValidation";
import { validateApplicantTabsVisited } from "../../../validations/drsApplicantTabValidation";
import { getRequirementRows, validateRequirementDecision } from "../../../validations/drsRequirementDecisionValidation";

const DVTDecision = () => {
    const [uwDecisionRemarks, setUwDecisionRemarks] = useState("");
    const [decision, setDecision] = useState<string>("");
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [submitStatus, setSubmitStatus] = useState<"success" | "failure" | null>(null);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { businessType, applicationNumber } = useAppContext();
    const decisionCodes = useSelector((state: RootState) => state.decisionCodes.decisionCodes);
    const drsData = useSelector((state: RootState) => state.drs.data as unknown as Record<string, unknown> | null);
    const masters = useSelector((state: RootState) => state.drs.masters);
    const dvtDecisionOptions = useMemo(() => {
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
        const dvtRaw = rawList.filter((opt) => String(opt?.code ?? opt?.key ?? "").trim().toUpperCase() === "DVT");

        const mapped = dvtRaw
            .map((option) => {
                const code = String(option.code ?? option.key ?? option.value ?? "").trim();
                const rawValue = String(option.value ?? "").trim();
                const description = String(option.description ?? option.label ?? option.code ?? "").trim();
                const disabled = Boolean(option.disabled ?? (String(option.isActive ?? "").toUpperCase() === "N"));
                const optType = String(option.type ?? "").trim();

                if (!description && !code && !rawValue) return null;

                const val = rawValue || code || description;
                const lab = rawValue || description || code;

                return {
                    label: lab,
                    value: val,
                    description,
                    type: optType,
                    code,
                    disabled,
                } as { label: string; value: string; description: string; type: string; code: string; disabled?: boolean };
            })
            .filter(Boolean) as { label: string; value: string; description: string; type: string; disabled?: boolean }[];

        return filterAcceptDecisionOptions(mapped, drsData);
    }, [drsData, masters]);
    const effectiveDecision = dvtDecisionOptions.some((option) => option.value === decision)
        ? decision
        : "";
    const decisionLabel = toMasterLabel(effectiveDecision, dvtDecisionOptions);
    

    const hasRequirements = getRequirementRows(drsData).length > 0;
    const isAcceptDecision = decisionLabel === "Accept";
    const resolvedDecisionCode = isAcceptDecision
        ? (decisionCodes[0]?.value || "")
        : "";

        const isRaiseRequirementsSelected = decisionLabel === "Raise Requirements";
        const submitBlocked =
            isRaiseRequirementsSelected && !hasRequirements;
    const safeBusinessType =
        normalizeBusinessType(businessType) ??
        normalizeBusinessType(localStorage.getItem("businessType")) ??
        "retail";
    const taskContext = getDecisionTaskContext(drsData, applicationNumber);

    const handleSubmit = async () => {
        const breValidation = validateDrsFinalBre(drsData);
        if (!breValidation.canPerformAction) {
            setSubmitMessage(breValidation.message);
            setSubmitStatus("failure");
            return;
        }

        if (!taskContext.taskId || !taskContext.userId || !taskContext.appNo || !taskContext.instanceId) {
            setSubmitMessage("Missing required case information. Please open the case from inbox again.");
            setSubmitStatus("failure");
            return;
        }

        try {
            setSubmitLoading(true);
            setSubmitMessage(null);
            setSubmitStatus(null);

            const selectedOption = dvtDecisionOptions.find((o) => o.value === effectiveDecision) as (typeof dvtDecisionOptions[number] & { code?: string }) | undefined;
            const payloadDecision = selectedOption
                ? (String(selectedOption.code ?? selectedOption.type ?? "").toUpperCase() === "DVT"
                    ? String(selectedOption.description ?? selectedOption.value ?? "")
                    : String(selectedOption.value ?? ""))
                : effectiveDecision;

            const response = await dispatch(
                completeTaskThunk({
                    requestContext: {
                        taskId: taskContext.taskId,
                        userId: taskContext.userId,
                        appNo: taskContext.appNo,
                        instanceId: taskContext.instanceId,
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
        const applicantTabsValidation = validateApplicantTabsVisited(drsData);
        if (!applicantTabsValidation.isValid) {
            setSubmitMessage(applicantTabsValidation.message);
            setSubmitStatus("failure");
            return;
        }

        const requirementValidation = validateRequirementDecision(drsData, decisionLabel);
        if (!requirementValidation.isValid) {
            setSubmitMessage(requirementValidation.message);
            setSubmitStatus("failure");
            return;
        }

        setConfirmationDialogOpen(true);
    };

    useEffect(() => {
        if (!isAcceptDecision) return;

        dispatch(
            decisionCodeThunk({
                decision: "Accept",
            })
        );
    }, [isAcceptDecision, dispatch]);

    return (
        <Container disableGutters>
            <Box sx={{ mt: 1 }}>
                <CustomAccordion title="DVT Decision" defaultExpanded>
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
                            }}>DVT Remarks</Typography>

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
                                label="DVT Decision"
                                value={effectiveDecision}
                                onChange={(value) => {
                                    setDecision(value);

                                    if (toMasterLabel(value, dvtDecisionOptions) === "Raise Requirements") {
                                        openRequirementManagement(true);
                                    }
                                }}
                                options={dvtDecisionOptions}
                            />

                            {isAcceptDecision && (
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: "12px",
                                            fontWeight: 400,
                                            color: "#444",
                                            mb: 0.5,
                                        }}
                                    >
                                        Decision Code
                                    </Typography>
                                    <CustomTextField
                                        fullWidth
                                        size="small"
                                        value={resolvedDecisionCode}
                                        disabled
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                height: 36,
                                                borderRadius: "6px",
                                                backgroundColor: "#fff",
                                            },
                                        }}
                                    />
                                </Box>
                            )}
                        </Box>

                       
                        {decisionLabel === "Raise Requirements" && !hasRequirements && (
                            <Alert severity="warning" sx={{ mt: 1, py: 0.25, borderRadius: 1 }}>
                                Please add at least one requirement in the <strong>Requirement Management</strong> section above before selecting "Raise Requirements".
                            </Alert>
                        )}

                        {/* {hasRequirements && decision !== "" && decision !== "Raise Requirements" && (
                            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                                Requirements have been raised. You must select <strong>Raise Requirements</strong> as the decision.
                            </Alert>
                        )} */}

                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            mt: 1,
                        }}
                    >
                        <CustomButton
                            variant="contained"
                            disabled={!effectiveDecision || submitBlocked || submitLoading}
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
            </Box>
        </Container>
    )
}

export default DVTDecision