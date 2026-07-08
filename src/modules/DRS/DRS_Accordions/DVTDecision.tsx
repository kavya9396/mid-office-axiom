import { Alert, Box, Container, Typography } from "@mui/material"
import CustomAccordion from "../../../components/ui/Accordion/Accordion"
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useState } from "react";
import CustomSelect from "../../../components/ui/Select/Select";
import {  dvtDecisionOptions } from "../../../utils/constant";
import CustomButton from "../../../components/ui/Button/Button";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import type { AdditionalRequirementRow } from "../../../types/drs.types";

const DVTDecision = () => {
    const [uwDecisionRemarks, setUwDecisionRemarks] = useState("");
    const [decision, setDecision] = useState<string>("");
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const navigate = useNavigate();
    const { businessType } = useAppContext();

    const savedRequirements = useSelector((state: RootState) => {
        const drsData = state.drs.data as unknown as Record<string, unknown> | null;
        const directRequirements = drsData?.requirements;
        if (Array.isArray(directRequirements)) {
            return directRequirements as AdditionalRequirementRow[];
        }
        const requirementManagement = drsData?.requirementManagement;
        return Array.isArray(requirementManagement)
            ? (requirementManagement as AdditionalRequirementRow[])
            : [];
    });
    const hasRequirements = savedRequirements.length > 0;

        const isRaiseRequirementsSelected = decision === "Raise Requirements";
        const submitBlocked =
            (isRaiseRequirementsSelected && !hasRequirements) ||
            (hasRequirements && decision !== "" && !isRaiseRequirementsSelected);
    const safeBusinessType =
        normalizeBusinessType(businessType) ??
        normalizeBusinessType(localStorage.getItem("businessType")) ??
        "retail";

    return (
        <Container disableGutters>
            <Box sx={{ mt: 2 }}>
                <CustomAccordion title="DVT Decision" defaultExpanded>
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
                            }}>DVT Remarks</Typography>

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
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: 2,
                            }}
                        >
                            <CustomSelect
                                label="DVT Decision"
                                value={decision}
                                onChange={(value) => {
                                    setDecision(value);
                                }}
                                options={dvtDecisionOptions}
                            />
                        </Box>

                       
                        {decision === "Raise Requirements" && !hasRequirements && (
                            <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                                Please add at least one requirement in the <strong>Requirement Management</strong> section above before selecting "Raise Requirements".
                            </Alert>
                        )}

                        {hasRequirements && decision !== "" && decision !== "Raise Requirements" && (
                            <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                                Requirements have been raised. You must select <strong>Raise Requirements</strong> as the decision.
                            </Alert>
                        )}

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
                            disabled={!decision || submitBlocked}
                            onClick={() => {
                                  setConfirmationDialogOpen(true);
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
                            Submit
                        </CustomButton>
                    </Box>
                </CustomAccordion>
                <ConfirmationDialog
                    open={confirmationDialogOpen}
                    message="Do you want to submit the case?"
                    onClose={() => setConfirmationDialogOpen(false)}
                    onConfirm={() => navigate(getInboxPath(safeBusinessType))}
                />
            </Box>
        </Container>
    )
}

export default DVTDecision