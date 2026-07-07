import { Box, Divider, Typography } from "@mui/material";
import { GridSection } from "../../../../components/layout/GridSection";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store/store";
import { buildFields, formatDOB, maskAadhaar, maskPAN, withDashFallback } from "../../../../utils/helpers";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";
import type { ApplicantTab } from "../../../../types/drs.types";

const mapMaritalStatus = (value?: string): string => {
    const normalized = value?.trim().toUpperCase();
    if (normalized === "M" || normalized === "MARRIED") return "Married";
    if (normalized === "D" || normalized === "DIVORCED") return "Divorced";
    if (normalized === "W" || normalized === "WIDOWED") return "Widowed";
    return "Single";
};

const toRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

const mapMemberType = (memberTypeValue: string | undefined, index: number): ApplicantTab => {
    const normalized = memberTypeValue?.trim().toUpperCase() ?? "";

    if (normalized === "PROPOSER" || normalized.includes("PR")) return "proposer";
    if (normalized === "LIFEASSURED1" || normalized === "LIFE ASSURED 1") return "lifeassured1";
    if (normalized === "LIFEASSURED2" || normalized === "LIFE ASSURED 2") return "lifeassured2";
    if (normalized.includes("LA") || normalized.includes("LIFE")) return index === 1 ? "lifeassured1" : "lifeassured2";
    if (index === 0) return "proposer";
    if (index === 1) return "lifeassured1";
    return "lifeassured2";
};

const mapGender = (value?: string): string => {
    const normalized = value?.trim().toUpperCase();
    if (normalized === "M" || normalized === "MALE") return "Male";
    if (normalized === "F" || normalized === "FEMALE") return "Female";
    return "Other";
};

const getAgeFromDob = (dobValue: string): string => {
    const dob = new Date(dobValue);
    if (Number.isNaN(dob.getTime())) return "-";

    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age -= 1;
    }

    return age >= 0 ? String(age) : "-";
};

const toBoolean = (value: unknown): boolean => {
    if (typeof value === "boolean") return value;
    const normalized = String(value ?? "").trim().toLowerCase();
    return normalized === "y" || normalized === "yes" || normalized === "true";
};

const buildApplicantName = (parts: Array<unknown>): string =>
    parts
        .map((part) => String(part ?? "").trim())
        .filter(Boolean)
        .join(" ");

const PersonalKYC = ({ profile }: ApplicantProfileProps) => {
    const { data } = useSelector((state: RootState) => state.drs);

    const selectedMemberType =
        profile?.memberType ??
        ((localStorage.getItem("drsSelectedApplicantTab") as ApplicantTab | null) ?? "proposer");

    const dataRecord = data as unknown as Record<string, unknown>;
    const summaryEntries = Array.isArray(dataRecord?.summary)
        ? (dataRecord.summary as Array<Record<string, unknown>>)
        : [];

    const summaryWithTabs = summaryEntries.map((entry, index) => ({
        entry,
        memberType: mapMemberType(String(entry.memberType ?? ""), index),
    }));

    const selectedSummaryEntry =
        summaryWithTabs.find((item) => item.memberType === selectedMemberType)?.entry ??
        summaryEntries[0];

    const summaryRecord = toRecord(selectedSummaryEntry);
    const summaryPersonal = toRecord(summaryRecord.personalDetails);
    const summaryKyc = toRecord(summaryRecord.kycDetails);

    const customerDetails = data?.customerDetails ?? [];
    const customerWithTabs = customerDetails.map((customer, index) => ({
        customer,
        memberType: mapMemberType(String(customer.lifeType ?? ""), index),
    }));
    const fallbackCustomer =
        customerWithTabs.find((item) => item.memberType === selectedMemberType)?.customer ??
        customerDetails[0];
    const fallbackPersonal = fallbackCustomer?.personalDetails;
    const summaryDocument = Array.isArray(summaryRecord.documentDetails)
        ? summaryRecord.documentDetails[0]
        : undefined;
    const fallbackDocument = Array.isArray(fallbackCustomer?.documentDetails)
        ? fallbackCustomer.documentDetails[0]
        : undefined;
    const primaryDocument = summaryDocument ?? fallbackDocument;

    const derivedApplicantName = buildApplicantName([
        summaryPersonal?.title ?? fallbackPersonal?.title,
        summaryPersonal?.firstName ?? fallbackPersonal?.firstName,
        summaryPersonal?.middleName ?? fallbackPersonal?.middleName,
        summaryPersonal?.lastName ?? fallbackPersonal?.lastName,
    ]);

    const derivedDob = String(summaryPersonal?.dob ?? fallbackPersonal?.dob ?? profile?.applicantDetails?.dateOfBirth ?? "");
    const apiAge = summaryPersonal?.age ?? fallbackPersonal?.age ?? profile?.proposerSummary?.age;
    const normalizedApiAge = Number(apiAge);
    const derivedAge = Number.isFinite(normalizedApiAge) && normalizedApiAge >= 0
        ? String(normalizedApiAge)
        : getAgeFromDob(derivedDob);

    const personal = {
        ...(profile?.applicantDetails ?? {}),
        dateOfBirth: String(summaryPersonal?.dob ?? fallbackPersonal?.dob ?? ""),
        applicantName: derivedApplicantName,
        age: derivedAge,
        gender: mapGender(String(summaryPersonal?.gender ?? fallbackPersonal?.gender ?? "")),
        maritalStatus: mapMaritalStatus(String(summaryPersonal?.maritalStatus ?? fallbackPersonal?.maritalStatus ?? "")),
        nationality: String(summaryPersonal?.nationality ?? fallbackPersonal?.nationality ?? ""),
        countryOfResidence: String(summaryPersonal?.residentStatus ?? fallbackPersonal?.residentStatus ?? ""),
        education: String(summaryPersonal?.highestQualification ?? fallbackPersonal?.highestQualification ?? ""),
        residentStatus: String(summaryPersonal?.residentStatus ?? fallbackPersonal?.residentStatus ?? ""),
        designation: String(summaryPersonal?.designation ?? fallbackPersonal?.designation ?? ""),
        disabled: String(summaryPersonal?.disabled ?? fallbackPersonal?.disabled ?? ""),
        percentageOfImpairment: String(summaryPersonal?.percentageOfImpairment ?? fallbackPersonal?.percentageOfImpairment ?? ""),
        typeOfImpairment: String(summaryPersonal?.typeOfImpairment ?? fallbackPersonal?.typeOfImpairment ?? ""),
        udidNumber: String(summaryPersonal?.udidNumber ?? fallbackPersonal?.udidNumber ?? ""),
        udsLink: String(summaryPersonal?.UDSLink ?? fallbackPersonal?.UDSLink ?? ""),
    };

    const kyc = profile?.kycDetails ?? {
        pranNo: String(summaryKyc?.pranNo ?? summaryPersonal?.pranNo ?? fallbackPersonal?.pranNo ?? ""),
        pranNoVerifivation: String(summaryKyc?.pranNoVerifivation ?? summaryPersonal?.pranNoVerifivation ?? fallbackPersonal?.pranNoVerifivation ?? ""),
        panNumber: String(summaryKyc?.panNumber ?? summaryPersonal?.panNo ?? fallbackPersonal?.panNo ?? ""),
        panFlag: String(summaryKyc?.panFlag ?? summaryPersonal?.panFlag ?? fallbackPersonal?.panFlag ?? ""),
        panAadharSeedingStatus: String(summaryKyc?.panAadharSeedingStatus ?? summaryPersonal?.panAadharSeedingStatus ?? fallbackPersonal?.panAadharSeedingStatus ?? ""),
        identityProofType: String(summaryKyc?.identityProofType ?? primaryDocument?.documentType ?? ""),
        identityProofNumber: String(summaryKyc?.identityProofNumber ?? primaryDocument?.documentId ?? ""),
        identityProofExpiryDate: String(summaryKyc?.identityProofExpiryDate ?? primaryDocument?.identityProofExpiryDate ?? ""),
        addressProof: String(summaryKyc?.addressProof ?? primaryDocument?.documentName ?? ""),
        incomeProof: String(summaryKyc?.incomeProof ?? summaryPersonal?.incomeProof ?? ""),
        existingCkycNumber: String(summaryKyc?.existingCkycNumber ?? summaryPersonal?.ckycNumber ?? ""),
        pep: toBoolean(summaryKyc?.pep ?? summaryPersonal?.isPEP),
        criminalProceedings: String(
            summaryKyc?.criminalProceedings ?? summaryPersonal?.criminalProceeding ?? "",
        ),
    };

    const personalDetails = withDashFallback(buildFields(personal as Record<string, unknown>, [
        { label: "Applicant Name", key: "applicantName" },
        {
            label: "Date of Birth",
            key: "dateOfBirth",
            format: (value) => formatDOB(String(value ?? "")) || "-",
        },
        { label: "Age", key: "age" },
        { label: "Gender", key: "gender" },
        { label: "Marital Status", key: "maritalStatus" },
        { label: "Nationality", key: "nationality" },
        { label: "Country of Residence", key: "countryOfResidence" },
        { label: "Education", key: "education" },
        { label: "Resident Status", key: "residentStatus" },
        { label: "Designation", key: "designation" },
        { label: "Disabled", key: "disabled" },
        { label: "Percentage Of Impairment", key: "percentageOfImpairment" },
        { label: "Type Of Impairment", key: "typeOfImpairment" },
        { label: "UDID Number", key: "udidNumber" },
        { label: "UDS Link", key: "udsLink" },
    ]));

    const kycDetails = withDashFallback(buildFields(kyc, [
        {
            label: "PRAN Number",
            key: "pranNo",
            format: (value) => maskPAN(String(value ?? "")),
        },
        {
            label: "PRAN Number Verification",
            key: "pranNoVerifivation"
        },
        {
            label: "PAN Number",
            key: "panNumber",
            format: (value) => maskPAN(String(value ?? "")),
        },
        { label: "PAN Flag", key: "panFlag" },
        { label: "PAN Aadhar Seeding Status", key: "panAadharSeedingStatus" },
        { label: "Identity Proof Type", key: "identityProofType" },
        { label: "Identity Proof Expiry Date", key: "identityProofExpiryDate" },
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