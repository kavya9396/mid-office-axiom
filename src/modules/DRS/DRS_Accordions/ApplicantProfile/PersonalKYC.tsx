import { Box, Divider, Typography } from "@mui/material";
import { GridSection } from "../../../../components/layout/GridSection";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store/store";
import { buildFields, formatDOB, maskAadhaar, maskPAN, withDashFallback } from "../../../../utils/helpers";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";

const mapMaritalStatus = (value?: string): string => {
    const normalized = value?.trim().toUpperCase();
    if (normalized === "M" || normalized === "MARRIED") return "Married";
    if (normalized === "D" || normalized === "DIVORCED") return "Divorced";
    if (normalized === "W" || normalized === "WIDOWED") return "Widowed";
    return "Single";
};

const PersonalKYC = ({ profile }: ApplicantProfileProps) => {
    const { data } = useSelector((state: RootState) => state.drs);

    const fallbackCustomer = data?.customerDetails?.[0];
    const fallbackPersonal = fallbackCustomer?.personalDetails;
    const fallbackDocument = Array.isArray(fallbackCustomer?.documentDetails)
        ? fallbackCustomer.documentDetails[0]
        : undefined;

    const personal = profile?.applicantDetails ?? {
        dateOfBirth: String(fallbackPersonal?.dob ?? ""),
        gender: String(fallbackPersonal?.gender ?? ""),
        maritalStatus: mapMaritalStatus(String(fallbackPersonal?.maritalStatus ?? "")),
        nationality: String(fallbackPersonal?.nationality ?? ""),
        countryOfResidence: String(fallbackPersonal?.residentStatus ?? ""),
        education: String(fallbackPersonal?.highestQualification ?? ""),
    };

    const kyc = profile?.kycDetails ?? {
        panNumber: String(fallbackPersonal?.panNo ?? ""),
        identityProofType: String(fallbackDocument?.documentType ?? ""),
        identityProofNumber: String(fallbackDocument?.documentId ?? ""),
        addressProof: String(fallbackDocument?.documentName ?? ""),
        incomeProof: "",
        existingCkycNumber: "",
        pep: Boolean(fallbackPersonal?.isPEP),
        criminalProceedings: "",
    };

    const personalDetails = withDashFallback(buildFields(personal, [
        {
            label: "Date of Birth",
            key: "dateOfBirth",
            format: (value) => formatDOB(String(value ?? "")) || "-",
        },
        { label: "Gender", key: "gender" },
        { label: "Marital Status", key: "maritalStatus" },
        { label: "Nationality", key: "nationality" },
        { label: "Country of Residence", key: "countryOfResidence" },
        { label: "Education", key: "education" },
    ]));

    const kycDetails = withDashFallback(buildFields(kyc, [
        {
            label: "PAN Number",
            key: "panNumber",
            format: (value) => maskPAN(String(value ?? "")),
        },
        { label: "Identity Proof Type", key: "identityProofType" },
        {
            label: "Identity Proof Number",
            key: "identityProofNumber",
            format: (value) => maskAadhaar(String(value ?? "")),
        },
        { label: "Address Proof", key: "addressProof" },
        { label: "Income Proof", key: "incomeProof" },
        { label: "CKYC Number", key: "existingCkycNumber" },
        { label: "PEP", key: "pep", format: (value) => (value ? "Yes" : "No") },
        { label: "Criminal Proceedings", key: "criminalProceedings" },
    ]));

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