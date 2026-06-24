import { Box, Divider, Typography } from "@mui/material";
import { GridSection } from "../../../../components/layout/GridSection";
import { buildFields, maskAadhaar, maskPAN } from "../../../../utils/helpers";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";

const PersonalKYC = ({ profile }: ApplicantProfileProps) => {
    const personal = profile?.applicantDetails;
    const kyc = profile?.kycDetails;

    const personalDetails = buildFields(personal, [
        { label: "Date of Birth", key: "dateOfBirth" },
        { label: "Gender", key: "gender" },
        { label: "Marital Status", key: "maritalStatus" },
        { label: "Nationality", key: "nationality" },
        { label: "Country of Residence", key: "countryOfResidence" },
        { label: "Education", key: "education" },
    ]);

    const kycDetails = buildFields(kyc, [
        { label: "PAN Number", key: "panNumber", format: maskPAN },
        { label: "Identity Proof Type", key: "identityProofType" },
        { label: "Identity Proof Number", key: "identityProofNumber", format: maskAadhaar },
        { label: "Address Proof", key: "addressProof" },
        { label: "Income Proof", key: "incomeProof" },
        { label: "CKYC Number", key: "existingCkycNumber" },
        { label: "PEP", key: "pep" },
        { label: "Criminal Proceedings", key: "criminalProceedings" },
    ]);

    return (
        <SectionCard>
            <GridSection columns={6} items={personalDetails} />
            <Divider sx={{ marginY: "20px", bgcolor: "#737373" }} />
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Typography
                    component="span"
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                    }}
                >
                    KYC
                </Typography>
            </Box>
            <Box sx={{ marginY: 1 }} />
            <GridSection columns={6} items={kycDetails} />
        </SectionCard>
    )
};

export default PersonalKYC