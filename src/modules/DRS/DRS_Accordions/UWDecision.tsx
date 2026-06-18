import { Box, Container, Typography } from "@mui/material"
import CustomAccordion from "../../../components/ui/Accordion/Accordion"
import { useEffect, useMemo, useRef, useState } from "react";
import CustomSelect from "../../../components/ui/Select/Select";
import { AccuityReferralReasons, caseUWDecisionOptions, CUWReferralReasons, firstUWDecisionOptions, HoldReasons, parallelUWDecisionOptions, ReferralRisk, ReinsurerReferralReasons } from "../../../utils/constant";
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

const referralRoleMap: Record<string, string> = {
    "Refer to HoD": "HoD",
    "Refer to Sr.UW": "SrUW",
    "Refer to HO CMO": "HO CMO",
    "Refer to Reinsurer": "Reinsurer",
};

const UWDecision = () => {
    const users = useSelector((state: RootState) => state.referralUsers.users);
    const decisionCodes = useSelector((state: RootState) => state.decisionCodes.decisionCodes)
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [uwDecisionRemarks, setUwDecisionRemarks] = useState("");
    const [caseUWDecision, setCaseUWDecision] = useState("");
    const [uwDecision, setUwDecision] = useState("");
    const [decisionCode, setDecisionCode] = useState("");
    const [parallelDecision, setParallelDecision] = useState("");
    const [holdReasons, setHoldReasons] = useState("");
    const [cuwReasons, setCuwReasons] = useState("");
    const [decisionType, setDecisionType] = useState("counterSign");
    const [referralValue, setReferralValue] = useState("");
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);

    const [excludedUserIds, setExcludedUserIds] = useState<string[]>([]);
    const [selectedThresholdUserId, setSelectedThresholdUserId] = useState("");

    const lastRoleRef = useRef<string | null>(null);

    const showDecisionCode = [
        "Accept",
        "Reject",
        "Decline",
        "Postpone",
        "Counter Offer",
    ].includes(caseUWDecision);

    const showParallelDecision = [
        "Refer to HO CMO",
        "Refer to Risk",
        "Refer to Accuity",
        "Raise Requirement",
    ].includes(caseUWDecision);

    const showFirstUWDecision = [
        "Refer to HoD",
        "Refer to Sr.UW",
        "Refer to Reinsurer",
        "Refer to HO CMO",
    ].includes(caseUWDecision);

    const fetchDecisionCodes = new Set([
        "Accept",
        "Reject",
        "Decline",
        "Postpone",
        "Counter Offer"
    ]);

    const showDecisionType = caseUWDecision === "Refer to Sr.UW" || caseUWDecision === "Refer to HoD";

    const dialogMessage = `Kindly reconfirm if you want to proceed with the case as "${caseUWDecision}"`;
    const thresholdMessage = `Threshold is achieved for this user, kindly refer the case to another ${caseUWDecision}`;

    const riskMessage = "Kindly reconfirm if you want to initiate a risk investigation process for the applicant?";

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
            options: ReferralRisk,
        },

        "Refer to Accuity": {
            label: "Accuity Referral Reasons",
            options: AccuityReferralReasons,
        },

        "Refer to Reinsurer": {
            label: "Reinsurer Referral reasons",
            options: ReinsurerReferralReasons,
        },
    }

    const selectedReferralConfig = referralConfig[caseUWDecision as keyof typeof referralConfig];

    const filteredParallelOptions = useMemo(() => {
        return parallelUWDecisionOptions.filter(
            (option) => option.value !== caseUWDecision
        );
    }, [caseUWDecision]);

    useEffect(() => {
        const role = referralRoleMap[caseUWDecision];

        if (!role) return;

        if (lastRoleRef.current === role) return;

        lastRoleRef.current = role;
        dispatch(referralUsersThunk({ role }));
    }, [caseUWDecision, dispatch]);

    return (
        <Container disableGutters>
            <Box sx={{ mt: 2 }}>
                <CustomAccordion title="UW Decision" defaultExpanded>
                    <Box
                        sx={{
                            mt: 1,
                            p: 2,
                            borderRadius: "12px",
                            backgroundColor: "#f6f6f6",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: "14px",
                                fontWeight: 400,
                                color: "#444",
                                mb: 1,
                            }}
                        >
                            UW Remarks
                        </Typography>

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
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 2,
                            }}
                        >
                            <CustomSelect
                                label="Case UW Decision"
                                value={caseUWDecision}
                                onChange={(value: string) => {
                                    setCaseUWDecision(value);
                                    setReferralValue("");

                                    if (fetchDecisionCodes.has(value)) {
                                        dispatch(
                                            decisionCodeThunk({
                                                decision: value,
                                            })
                                        );
                                    }
                                }}
                                options={caseUWDecisionOptions}
                            />

                            {showDecisionCode && (
                                <CustomSelect
                                    label="Decision Code"
                                    value={decisionCode}
                                    onChange={setDecisionCode}
                                    options={decisionCodes}
                                />
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
                                caseUWDecision === "Hold" && (
                                    <CustomSelect
                                        label="Hold Reasons"
                                        value={holdReasons}
                                        onChange={setHoldReasons}
                                        options={HoldReasons}
                                    />
                                )
                            }

                            {
                                caseUWDecision === "Refer to CUW Claim Pool" && (
                                    <CustomSelect
                                        label="CUW Claim Pool Reasons"
                                        value={cuwReasons}
                                        onChange={setCuwReasons}
                                        options={CUWReferralReasons}
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

                        {selectedReferralConfig && caseUWDecision === "Refer to Reinsurer" && (
                            <>
                                <UWReinsurerFields />
                            </>
                        )}

                        {showDecisionType && (
                            <Box sx={{ mt: 2 }}>
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

                    </Box>
                    {/* Submit Button */}
                    {caseUWDecision && caseUWDecision !== "Refer to Reinsurer" && (
                        <Box
                            sx={{
                                display: "flex",
                                gap: 2,
                                mt: 2,
                            }}
                        >
                            <CustomButton
                                variant="contained"
                                //   disabled={!isFormValid}
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
                                Submit
                            </CustomButton>
                        </Box>
                    )}

                    {selectedReferralConfig && caseUWDecision === "Refer to Reinsurer" && (
                        <UWReinsurer setConfirmationDialogOpen={setConfirmationDialogOpen} />
                    )}
                </CustomAccordion>

                {/* Confirmation Dialog */}
                <ConfirmationDialog
                    open={confirmationDialogOpen}
                    message={
                        caseUWDecision === "Refer to Risk"
                            ? riskMessage
                            : dialogMessage
                    }
                    onClose={() => setConfirmationDialogOpen(false)}
                    onConfirm={() => navigate("/group/inbox")}
                />

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