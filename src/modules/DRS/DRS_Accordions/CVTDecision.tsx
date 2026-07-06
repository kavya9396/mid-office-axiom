import { Alert, Box, Container, Snackbar, Typography } from "@mui/material"
import CustomAccordion from "../../../components/ui/Accordion/Accordion"
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useMemo, useState } from "react";
import CustomSelect from "../../../components/ui/Select/Select";
import { cvtDecisionOptions } from "../../../utils/constant";
import CustomButton from "../../../components/ui/Button/Button";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import RequirementManagementTable from "./RequirementManagementTable";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { completeTaskThunk } from "../../../store/thunks/completeTaskThunk";

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
    const navigate = useNavigate();
    const isSubmitEnabled = uwDecisionRemarks.trim().length > 0 && decision.trim().length > 0;
    const { businessType, applicationNumber } = useAppContext();
    const drsData = useAppSelector((state) => state.drs.data as unknown as Record<string, unknown> | null);
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

    const handleSubmit = async () => {
        if (!taskId || !userId || !applicationNumber || !instanceId) {
            setSubmitMessage("Missing required case information. Please open the case from inbox again.");
            setSubmitStatus("failure");
            return;
        }

        try {
            setSubmitLoading(true);
            setSubmitMessage(null);
            setSubmitStatus(null);

            const response = await dispatch(
                completeTaskThunk({
                    taskId,
                    userId,
                    appNo: applicationNumber,
                    instanceId,
                    remarks: uwDecisionRemarks.trim(),
                    decision: decision.trim(),
                }),
            ).unwrap();

            const success = response.success;
            const message = response.message || (success ? "Task completed successfully." : "Task completion failed.");
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

    return (
        <Container disableGutters>
            <Box sx={{ mt: 2 }}>
                <CustomAccordion title="CVT Decision" defaultExpanded>
                    <Box
                        sx={{
                            backgroundColor: "#F6F6F6",
                            p: 2,
                            mt: 1,
                            borderRadius: "8px",
                        }}
                    >

                        <Typography
                            sx={{
                                fontSize: "14px",
                                fontWeight: 400,
                                color: "#444",
                                mb: 1,
                            }}>CVT Remarks</Typography>

                        <CustomTextField
                            fullWidth
                            multiline
                            minRows={3}
                            placeholder="Enter remarks..."
                            value={uwDecisionRemarks}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value.length <= 10000) {
                                    setUwDecisionRemarks(value);
                                    setSubmitMessage(null);
                                    setSubmitStatus(null);
                                }
                            }} variant="outlined"
                            size="small"
                            sx={{
                                backgroundColor: "#fff",
                                borderRadius: "10px",
                            }}
                        />

                        <Typography sx={{ display: "flex", justifyContent: "flex-end", fontSize: "12px", color: "#888", mt: 0.5 }}>
                            {uwDecisionRemarks.length}/10000
                        </Typography>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: 2,
                            }}
                        >
                            <CustomSelect
                                label="CVT Decision"
                                value={decision}
                                onChange={(value: string) => {
                                    setDecision(value);
                                    setSubmitMessage(null);
                                    setSubmitStatus(null);
                                }}
                                options={cvtDecisionOptions}
                            />
                        </Box>

                        {
                            (decision === "Raise Requirements" || decision === "Reraise PIVV") && (
                                <Box sx={{mt:2}}>
                                    <RequirementManagementTable />
                                </Box>
                            )
                        }

                    </Box>
                    <Box
                        sx={{
                            display: "flex",
                            gap: 2,
                            mt: 2,
                        }}
                    >
                        <CustomButton
                            variant="contained"
                            disabled={!isSubmitEnabled || !taskId || submitLoading}
                            onClick={() => setConfirmationDialogOpen(true)}
                            sx={{
                                minWidth: 200,
                                height: 44,
                                borderRadius: "50px",
                                fontWeight: 600,
                                px: 3,
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

export default CVTDecision