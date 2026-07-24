import { Alert, Box, Container, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import CustomAccordion from "../../../components/ui/Accordion/Accordion"
import { useEffect, useMemo, useRef, useState } from "react";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomRadioGroup from "../../../components/ui/Radio/Radio";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import { referralUsersThunk } from "../../../store/thunks/referralUsersThunk";
import CustomButton from "../../../components/ui/Button/Button";
import UWReinsurer, { UWReinsurerFields } from "./ReInsurer/UWReinsurer";
import { useNavigate } from "react-router-dom";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { decisionCodeThunk } from "../../../store/thunks/decisionCodeThunk";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";
import { openRequirementManagement } from "./requirementManagementEvents";
import { completeTaskThunk } from "../../../store/thunks/completeTaskThunk";
import { getDecisionTaskContext } from "./decisionTaskContext";
import { getCompleteTaskResult } from "./completeTaskResponse";
import { normalizeMasterOptions, toMasterLabel } from "../../../utils/masterOptions";
import { filterAcceptDecisionOptions, validateDrsFinalBre } from "../../../validations/drsBreValidation";
import { validateApplicantTabsVisited } from "../../../validations/drsApplicantTabValidation";
import { validateRequirementDecision } from "../../../validations/drsRequirementDecisionValidation";

const referralRoleMap: Record<string, string> = {
    "Refer to HoD": "HoD",
    "Refer to Sr.UW": "SrUW",
    "Refer to HO CMO": "HO CMO",
    "Refer to Reinsurer": "Reinsurer",
};

type CounterOfferRowKey = "baseSumAssured" | "riderSumAssured";
type CounterOfferFieldKey =
    | "changedSA"
    | "changedPT"
    | "changedPPT"
    | "extraPremiumDecision"
    | "revisedPremium"
    | "gst"
    | "reasons";

const createCounterOfferTableState = () => ({
    baseSumAssured: {
        changedSA: "",
        changedPT: "",
        changedPPT: "",
        extraPremiumDecision: "",
        revisedPremium: "",
        gst: "",
        reasons: "",
    },
    riderSumAssured: {
        changedSA: "",
        changedPT: "",
        changedPPT: "",
        extraPremiumDecision: "",
        revisedPremium: "",
        gst: "",
        reasons: "",
    },
});

const UWDecision = () => {
    const users = useSelector((state: RootState) => state.referralUsers.users);
    const decisionCodes = useSelector((state: RootState) => state.decisionCodes.decisionCodes)
    const masters = useSelector((state: RootState) => state.drs.masters);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const { businessType, applicationNumber } = useAppContext();
    const drsData = useSelector((state: RootState) => state.drs.data as unknown as Record<string, unknown> | null);
    const safeBusinessType =
        normalizeBusinessType(businessType) ??
        normalizeBusinessType(localStorage.getItem("businessType")) ??
        "retail";

    const [uwDecisionRemarks, setUwDecisionRemarks] = useState("");
    const [caseUWDecision, setCaseUWDecision] = useState("");
    const [uwDecision, setUwDecision] = useState("");
    const [decisionCode, setDecisionCode] = useState("");
    const [rejectReason, setRejectReason] = useState("");
    const [declineReasons, setDeclineReasons] = useState(["", "", ""]);
    const [postponeReason, setPostponeReason] = useState("");
    const [postponementPeriod, setPostponementPeriod] = useState("");
    const [smokerStatus, setSmokerStatus] = useState("");
    const [counterOfferTable, setCounterOfferTable] = useState(createCounterOfferTableState);
    const [parallelDecision, setParallelDecision] = useState("");
    const [holdReasons, setHoldReasons] = useState("");
    const [cuwReasons, setCuwReasons] = useState("");
    const [decisionType, setDecisionType] = useState("counterSign");
    const [referralValue, setReferralValue] = useState("");
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [submitStatus, setSubmitStatus] = useState<"success" | "failure" | null>(null);

    const [excludedUserIds, setExcludedUserIds] = useState<string[]>([]);
    const [selectedThresholdUserId, setSelectedThresholdUserId] = useState("");

    const lastRoleRef = useRef<string | null>(null);

    const caseUWDecisionOptions = useMemo(() => {
        const masterOptions = normalizeMasterOptions(masters.caseUWDecision);
        return filterAcceptDecisionOptions(masterOptions, drsData);
    }, [drsData, masters.caseUWDecision]);
    const effectiveCaseUWDecision = caseUWDecisionOptions.some((option) => option.value === caseUWDecision)
        ? caseUWDecision
        : "";
    const firstUWDecisionOptions = useMemo(() => {
        return normalizeMasterOptions(masters.firstUWDecision);
    }, [masters.firstUWDecision]);
    const parallelUWDecisionOptions = useMemo(() => {
        return normalizeMasterOptions(masters.parallelUWDecision);
    }, [masters.parallelUWDecision]);
    const rejectReasonOptions = useMemo(() => {
        return normalizeMasterOptions(masters.rejectReason);
    }, [masters.rejectReason]);
    const declineReasonOptions = useMemo(() => {
        return normalizeMasterOptions(masters.declineReason);
    }, [masters.declineReason]);
    const postponeReasonOptions = useMemo(() => {
        return normalizeMasterOptions(masters.postponeReason);
    }, [masters.postponeReason]);
    const postponementPeriodOptions = useMemo(() => {
        return normalizeMasterOptions(masters.postponementPeriod);
    }, [masters.postponementPeriod]);
    const riskReferralReasonOptions = useMemo(() => {
        return normalizeMasterOptions(masters.riskReferralReason);
    }, [masters.riskReferralReason]);
    const accuityReferralReasonOptions = useMemo(() => {
        return normalizeMasterOptions(masters.accuityReferralReason);
    }, [masters.accuityReferralReason]);
    const reinsurerReferralReasonOptions = useMemo(() => {
        return normalizeMasterOptions(masters.reinsurerReferralReason);
    }, [masters.reinsurerReferralReason]);
    const holdReasonOptions = useMemo(() => {
        return normalizeMasterOptions(masters.holdReason);
    }, [masters.holdReason]);
    const cuwReferralReasonOptions = useMemo(() => {
        return normalizeMasterOptions(masters.cuwReferralReason);
    }, [masters.cuwReferralReason]);
    const caseUWDecisionLabel = toMasterLabel(effectiveCaseUWDecision, caseUWDecisionOptions);

    const showDecisionCode = [
        "Accept",
        "Reject",
        "Decline",
        "Postpone",
    ].includes(caseUWDecisionLabel);

    const showParallelDecision = [
        "Refer to HO CMO",
        "Refer to Risk",
        "Refer to Accuity",
        "Raise Requirement",
    ].includes(caseUWDecisionLabel);

    const showFirstUWDecision = [
        "Refer to HoD",
        "Refer to Sr.UW",
        "Refer to Reinsurer",
        "Refer to HO CMO",
    ].includes(caseUWDecisionLabel);

    const fetchDecisionCodes = new Set([
        "Accept",
        "Reject",
        "Decline",
        "Postpone",
    ]);

    const showDecisionType = caseUWDecisionLabel === "Refer to Sr.UW" || caseUWDecisionLabel === "Refer to HoD";
    const isAcceptDecision = caseUWDecisionLabel === "Accept";
    const isRejectDecision = caseUWDecisionLabel === "Reject";
    const isDeclineDecision = caseUWDecisionLabel === "Decline";
    const isPostponeDecision = caseUWDecisionLabel === "Postpone";
    const isCounterOfferDecision = caseUWDecisionLabel === "Counter Offer";
    const resolvedDecisionCode = (isAcceptDecision || isRejectDecision || isDeclineDecision || isPostponeDecision)
        ? (decisionCode || decisionCodes[0]?.value || "")
        : decisionCode;
    const resolvedSmokerStatus = isAcceptDecision
        ? (smokerStatus || "Non Smoker")
        : smokerStatus;

    const getDeclineReasonOptions = (index: number) => {
        const selectedInOtherDropdowns = new Set(
            declineReasons
                .filter((reason, reasonIndex) => reasonIndex !== index && reason)
        );

        return declineReasonOptions.filter(
            (option) =>
                !selectedInOtherDropdowns.has(option.value) || option.value === declineReasons[index]
        );
    };

    const updateCounterOfferCell = (
        rowKey: CounterOfferRowKey,
        field: CounterOfferFieldKey,
        value: string
    ) => {
        setCounterOfferTable((prev) => ({
            ...prev,
            [rowKey]: {
                ...prev[rowKey],
                [field]: value,
            },
        }));
    };

    const dialogMessage = `Kindly reconfirm if you want to proceed with the case as "${caseUWDecisionLabel}"`;
    const thresholdMessage = `Threshold is achieved for this user, kindly refer the case to another ${caseUWDecisionLabel}`;

    const riskMessage = "Kindly reconfirm if you want to initiate a risk investigation process for the applicant?";
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

            const response = await dispatch(
                completeTaskThunk({
                    requestContext: {
                        taskId: taskContext.taskId,
                        userId: taskContext.userId,
                        appNo: taskContext.appNo,
                        instanceId: taskContext.instanceId,
                        remarks: uwDecisionRemarks.trim(),
                        decision: effectiveCaseUWDecision.trim(),
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

        const requirementValidation = validateRequirementDecision(drsData, caseUWDecisionLabel);
        if (!requirementValidation.isValid) {
            setSubmitMessage(requirementValidation.message);
            setSubmitStatus("failure");
            return;
        }

        setConfirmationDialogOpen(true);
    };

    const userOptions = useMemo(() => {
        return users
            .filter(user => !excludedUserIds.includes(user.userId))
            .map((user) => ({
                label: user.userName,
                value: user.userId,
                ticketsInPool: String(user.ticketsInPool),
            }));
    }, [users, excludedUserIds]);

    const referralConfig = {
        "Refer to HoD": {
            label: "Name of HoD",
            options: userOptions,
        },

        "Refer to Sr.UW": {
            label: "Name of Sr.UW",
            options: userOptions,
        },

        "Refer to HO CMO": {
            label: "Name of HO CMO",
            options: userOptions,
        },

        "Refer to Risk": {
            label: "Risk Referral Reasons",
            options: riskReferralReasonOptions,
        },

        "Refer to Accuity": {
            label: "Accuity Referral Reasons",
            options: accuityReferralReasonOptions,
        },

        "Refer to Reinsurer": {
            label: "Reinsurer Referral reasons",
            options: reinsurerReferralReasonOptions,
        },
    }

    const selectedReferralConfig = referralConfig[caseUWDecisionLabel as keyof typeof referralConfig];

    const filteredParallelOptions = useMemo(() => {
        return parallelUWDecisionOptions.filter(
            (option) => option.label !== caseUWDecisionLabel
        );
    }, [caseUWDecisionLabel, parallelUWDecisionOptions]);

    useEffect(() => {
        const role = referralRoleMap[caseUWDecisionLabel];

        if (!role) return;

        if (lastRoleRef.current === role) return;

        lastRoleRef.current = role;
        dispatch(referralUsersThunk({ role }));
    }, [caseUWDecisionLabel, dispatch]);

    return (
        <Container disableGutters>
            <Box sx={{ mt: 1 }}>
                <CustomAccordion title="UW Decision" defaultExpanded>
                    <Box
                        sx={{
                            mt: 0.75,
                            p: 1.25,
                            borderRadius: "6px",
                            backgroundColor: "#f6f6f6",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "12px",
                                fontWeight: 400,
                                color: "#444",
                                mb: 0.5,
                            }}
                        >
                            UW Remarks
                        </Typography>

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
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 1,
                            }}
                        >
                            <CustomSelect
                                label="Case UW Decision"
                                value={effectiveCaseUWDecision}
                                onChange={(value: string) => {
                                    const selectedLabel = toMasterLabel(value, caseUWDecisionOptions);
                                    setCaseUWDecision(value);
                                    setReferralValue("");
                                    setRejectReason("");
                                    setDeclineReasons(["", "", ""]);
                                    setPostponeReason("");
                                    setPostponementPeriod("");
                                    setCounterOfferTable(createCounterOfferTableState());
                                    setSubmitMessage(null);
                                    setSubmitStatus(null);

                                    if (!fetchDecisionCodes.has(selectedLabel)) {
                                        setDecisionCode("");
                                        setSmokerStatus("");
                                    }

                                    if (fetchDecisionCodes.has(selectedLabel)) {
                                        dispatch(
                                            decisionCodeThunk({
                                                decision: selectedLabel,
                                            })
                                        );
                                    }

                                    if (selectedLabel === "Raise Requirement") {
                                        openRequirementManagement(true);
                                    }
                                }}
                                options={caseUWDecisionOptions}
                            />

                            {showDecisionCode && (
                                (isAcceptDecision || isRejectDecision || isDeclineDecision || isPostponeDecision) ? (
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
                                ) : (
                                    <CustomSelect
                                        label="Decision Code"
                                        value={resolvedDecisionCode}
                                        onChange={setDecisionCode}
                                        options={decisionCodes}
                                    />
                                )
                            )}

                            {isRejectDecision && (
                                <CustomSelect
                                    label="Reject Reason"
                                    value={rejectReason}
                                    onChange={setRejectReason}
                                    options={rejectReasonOptions}
                                />
                            )}

                            {isDeclineDecision && (
                                <>
                                    <CustomSelect
                                        label="Decline Reason 1"
                                        value={declineReasons[0]}
                                        onChange={(value: string) => {
                                            setDeclineReasons((prev) => {
                                                const next = [...prev];
                                                next[0] = value;
                                                return next;
                                            });
                                        }}
                                        options={getDeclineReasonOptions(0)}
                                    />
                                    <CustomSelect
                                        label="Decline Reason 2"
                                        value={declineReasons[1]}
                                        onChange={(value: string) => {
                                            setDeclineReasons((prev) => {
                                                const next = [...prev];
                                                next[1] = value;
                                                return next;
                                            });
                                        }}
                                        options={getDeclineReasonOptions(1)}
                                    />
                                    <CustomSelect
                                        label="Decline Reason 3"
                                        value={declineReasons[2]}
                                        onChange={(value: string) => {
                                            setDeclineReasons((prev) => {
                                                const next = [...prev];
                                                next[2] = value;
                                                return next;
                                            });
                                        }}
                                        options={getDeclineReasonOptions(2)}
                                    />
                                </>
                            )}

                            {isPostponeDecision && (
                                <>
                                    <CustomSelect
                                        label="Postpone Reason"
                                        value={postponeReason}
                                        onChange={setPostponeReason}
                                        options={postponeReasonOptions}
                                    />
                                    <CustomSelect
                                        label="Postponement Period"
                                        value={postponementPeriod}
                                        onChange={setPostponementPeriod}
                                        options={postponementPeriodOptions}
                                    />
                                </>
                            )}

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
                                        Smoker Status
                                    </Typography>
                                    <CustomTextField
                                        fullWidth
                                        size="small"
                                        value={resolvedSmokerStatus}
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

                            {selectedReferralConfig && (
                                <CustomSelect
                                    label={selectedReferralConfig.label}
                                    value={referralValue}
                                    onChange={(value: string) => {
                                        setReferralValue(value);

                                        const selectedUser = users.find(
                                            (user) => user.userId === value
                                        );

                                        if ((selectedUser?.ticketsInPool ?? 0) >= 15) {
                                            setSelectedThresholdUserId(value);
                                            setThresholdDialogOpen(true);
                                        }
                                    }}
                                    options={selectedReferralConfig.options}
                                />
                            )}

                            {showParallelDecision && (
                                <CustomSelect
                                    label="Parallel UW Decision"
                                    value={parallelDecision}
                                    onChange={setParallelDecision}
                                    options={filteredParallelOptions}
                                />
                            )}

                            {
                                caseUWDecisionLabel === "Hold" && (
                                    <CustomSelect
                                        label="Hold Reasons"
                                        value={holdReasons}
                                        onChange={setHoldReasons}
                                        options={holdReasonOptions}
                                    />
                                )
                            }

                            {
                                caseUWDecisionLabel === "Refer to CUW Claim Pool" && (
                                    <CustomSelect
                                        label="CUW Claim Pool Reasons"
                                        value={cuwReasons}
                                        onChange={setCuwReasons}
                                        options={cuwReferralReasonOptions}
                                    />
                                )
                            }

                            {showFirstUWDecision && (
                                <CustomSelect
                                    label="1st UW Decision"
                                    value={uwDecision}
                                    onChange={setUwDecision}
                                    options={firstUWDecisionOptions}
                                />
                            )}
                        </Box>

                        {selectedReferralConfig && caseUWDecisionLabel === "Refer to Reinsurer" && (
                            <>
                                <UWReinsurerFields />
                            </>
                        )}

                        {showDecisionType && (
                            <Box sx={{ mt: 1 }}>
                                <CustomRadioGroup
                                    row
                                    value={decisionType}
                                    onChange={(e) => setDecisionType(e.target.value)}
                                    options={[
                                        { label: "Counter Sign", value: "counterSign" },
                                        { label: "Opinion", value: "opinion" },
                                    ]}
                                />
                            </Box>
                        )}

                        {isCounterOfferDecision && (
                            <Box sx={{ mt: 1.25 }}>
                                <Typography
                                    sx={{
                                        fontSize: "13px",
                                        fontWeight: 600,
                                        color: "#1f2937",
                                        mb: 0.75,
                                    }}
                                >
                                    Counter Offer Details
                                </Typography>

                                <TableContainer
                                    sx={{
                                        border: "1px solid #d7d7d7",
                                        borderRadius: "6px",
                                        overflowX: "auto",
                                        backgroundColor: "#fff",
                                    }}
                                >
                                    <Table size="small" sx={{ minWidth: 1900 }}>
                                        <TableHead>
                                            <TableRow>
                                                {[
                                                    "Application No.",
                                                    "Proposer / Life Assured (auto filled)",
                                                    "Applied SA (auto filled)",
                                                    "Changed SA",
                                                    "PT (auto filled)",
                                                    "Changed PT",
                                                    "PPT (auto filled)",
                                                    "Changed PPT",
                                                    "Extra Premium / Decision",
                                                    "Premium Collected (auto filled)",
                                                    "Revised Premium",
                                                    "GST",
                                                    "Reasons",
                                                ].map((header) => (
                                                    <TableCell
                                                        key={header}
                                                        sx={{
                                                            backgroundColor: "#f3f7fc",
                                                            fontSize: "12px",
                                                            fontWeight: 600,
                                                            color: "#2b2b2b",
                                                            whiteSpace: "normal",
                                                            minWidth: 130,
                                                            borderRight: "1px solid #e3e3e3",
                                                        }}
                                                    >
                                                        {header}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>

                                        <TableBody>
                                            {[
                                                { key: "baseSumAssured", label: "Base Sum Assured" },
                                                { key: "riderSumAssured", label: "Rider Sum Assured" },
                                            ].map((row) => (
                                                <TableRow key={row.key}>
                                                    <TableCell sx={{ minWidth: 160, fontWeight: 600 }}>{row.label}</TableCell>
                                                    <TableCell><CustomTextField fullWidth size="small" value="Auto-filled" disabled /></TableCell>
                                                    <TableCell><CustomTextField fullWidth size="small" value="Auto-filled" disabled /></TableCell>
                                                    <TableCell>
                                                        <CustomTextField
                                                            fullWidth
                                                            size="small"
                                                            value={counterOfferTable[row.key as CounterOfferRowKey].changedSA}
                                                            onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "changedSA", e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell><CustomTextField fullWidth size="small" value="Auto-filled" disabled /></TableCell>
                                                    <TableCell>
                                                        <CustomTextField
                                                            fullWidth
                                                            size="small"
                                                            value={counterOfferTable[row.key as CounterOfferRowKey].changedPT}
                                                            onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "changedPT", e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell><CustomTextField fullWidth size="small" value="Auto-filled" disabled /></TableCell>
                                                    <TableCell>
                                                        <CustomTextField
                                                            fullWidth
                                                            size="small"
                                                            value={counterOfferTable[row.key as CounterOfferRowKey].changedPPT}
                                                            onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "changedPPT", e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <CustomTextField
                                                            fullWidth
                                                            size="small"
                                                            value={counterOfferTable[row.key as CounterOfferRowKey].extraPremiumDecision}
                                                            onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "extraPremiumDecision", e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell><CustomTextField fullWidth size="small" value="Auto-filled" disabled /></TableCell>
                                                    <TableCell>
                                                        <CustomTextField
                                                            fullWidth
                                                            size="small"
                                                            value={counterOfferTable[row.key as CounterOfferRowKey].revisedPremium}
                                                            onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "revisedPremium", e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <CustomTextField
                                                            fullWidth
                                                            size="small"
                                                            value={counterOfferTable[row.key as CounterOfferRowKey].gst}
                                                            onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "gst", e.target.value)}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <CustomTextField
                                                            fullWidth
                                                            size="small"
                                                            value={counterOfferTable[row.key as CounterOfferRowKey].reasons}
                                                            onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "reasons", e.target.value)}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        )}

                    </Box>
                    {/* Submit Button */}
                    {caseUWDecision && caseUWDecisionLabel !== "Refer to Reinsurer" && (
                        <Box
                            sx={{
                                display: "flex",
                                gap: 1,
                                mt: 1,
                            }}
                        >
                            <CustomButton
                                variant="contained"
                                disabled={submitLoading}
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
                    )}

                    {selectedReferralConfig && caseUWDecisionLabel === "Refer to Reinsurer" && (
                        <UWReinsurer onOpenConfirmation={handleSubmitIntent} />
                    )}
                </CustomAccordion>

                {/* Confirmation Dialog */}
                <ConfirmationDialog
                    open={confirmationDialogOpen}
                    message={
                        caseUWDecisionLabel === "Refer to Risk"
                            ? riskMessage
                            : dialogMessage
                    }
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

                {/* Threshold Dialog */}
                <ConfirmationDialog
                    open={thresholdDialogOpen}
                    title="Threshold Limit"
                    buttonText="Ok"
                    message={thresholdMessage}
                    onClose={() => {
                        if (selectedThresholdUserId) {
                            setExcludedUserIds(prev => [
                                ...prev,
                                selectedThresholdUserId,
                            ]);
                        }
                        setReferralValue("");
                        setSelectedThresholdUserId("");
                        setThresholdDialogOpen(false);
                    }}
                />
            </Box>
        </Container>
    )
}

export default UWDecision