import { Box, Divider, Typography } from "@mui/material"
import CustomButton from "../../../components/ui/Button/Button"
import CustomTabs from "../../../components/ui/Tabs/Tabs"
import { applicantInfoTabs } from "../../../utils/constant"
import { useState } from "react"
import type { ApplicantInfoTab, NomineeRow, SummaryResponse } from "../../../types/drs.types"
import { GridSection } from "../../../components/layout/GridSection"
import KeyValueTable from "../../../components/ui/KeyValueTable/KeyValueTable"
import type { Column } from "../../../components/ui/Table/Table"
import CustomTable from "../../../components/ui/Table/Table"
import { buildFields, buildPairFields, formatCurrencyINR, formatPhone } from "../../../utils/helpers"

interface ApplicantProfileProps {
    profile?: SummaryResponse;
}

const nomineeColumns: Column<NomineeRow>[] = [
    { key: "nomineeName", header: "Nominee Name", width: "14%" },
    { key: "nomineeDOB", header: "Nominee DOB", width: "12%" },
    { key: "gender", header: "Gender", width: "10%" },
    { key: "relationship", header: "Relationship", width: "12%" },
    { key: "accountNumber", header: "Account Number", width: "14%" },
    { key: "ifsc", header: "IFSC", width: "12%" },
    { key: "sharePercentage", header: "Share %", width: "10%" },
    { key: "appointeeName", header: "Appointee Name", width: "14%" },
    { key: "appointeeGender", header: "Appointee Gender", width: "12%" },
    { key: "appointeeDOB", header: "Appointee DOB", width: "12%" },
];

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
        { label: "PAN Number", key: "panNumber" },
        { label: "Identity Proof Type", key: "identityProofType" },
        { label: "Identity Proof Number", key: "identityProofNumber" },
        { label: "Address Proof", key: "addressProof" },
        { label: "Income Proof", key: "incomeProof" },
        { label: "CKYC Number", key: "existingCkycNumber" },
        { label: "PEP", key: "pep" },
        { label: "Criminal Proceedings", key: "criminalProceedings" },
    ]);

    return (
        <Box
            sx={{
                p: 2,
                mt: 2,
                boxShadow: 1,
                borderRadius: 2,
                backgroundColor: "#F6F6F6",
            }}
        >
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
        </Box>
    )
};

const ContactAndAddress = ({ profile }: ApplicantProfileProps) => {
    const communication = profile?.communicationAddressDetails;
    const permanent = profile?.permanentAddressDetails;
    const contact = profile?.contactDetails;

    const communicationAddressDetails = buildFields(communication, [
        { label: "Address Line 1", key: "addressLine1" },
        { label: "Address Line 2", key: "addressLine2" },
        { label: "Address Line 3", key: "addressLine3" },
        { label: "Landmark", key: "landmark" },
        { label: "City", key: "city" },
        { label: "State", key: "state" },
        { label: "Country", key: "country" },
        { label: "Pincode", key: "pincode" },
    ]);

    const permanentAddressDetails = buildFields(permanent, [
        { label: "Address Line 1", key: "addressLine1" },
        { label: "Address Line 2", key: "addressLine2" },
        { label: "Address Line 3", key: "addressLine3" },
        { label: "Landmark", key: "landmark" },
        { label: "City", key: "city" },
        { label: "State", key: "state" },
        { label: "Country", key: "country" },
        { label: "Pincode", key: "pincode" },
    ]);

    const contactDetails = buildFields(contact, [
        { label: "Mobile No.", key: "mobileNumber", format: formatPhone },
        { label: "Email ID", key: "emailId" },
        { label: "Alternate Mobile", key: "alternateMobile" },
        { label: "Landline Number", key: "landlineNumber" },
    ]);

    return (
        <Box sx={{ mt: 2 }}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 2,
                }}
            >
                {/* Communication Address */}
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "#F6F6F6",
                    }}
                >

                    <Typography sx={{ fontWeight: 700, mb: 2 }}>Communication Address</Typography>
                    <GridSection columns={3} items={communicationAddressDetails} />
                </Box>

                {/* Permanent Address */}
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "#F6F6F6",
                    }}
                >
                    <Typography sx={{ fontWeight: 700, mb: 2 }}>Permanent Address</Typography>
                    <GridSection columns={3} items={permanentAddressDetails} />
                </Box>
            </Box>
            <Box
                sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "#F6F6F6",
                    mt: 2
                }}
            >
                <Typography sx={{ fontWeight: 700, mb: 2 }}>Contact Details</Typography>
                <GridSection columns={4} items={contactDetails} />
            </Box>
        </Box>
    )
};

const FinanceAndProfession = ({ profile }: ApplicantProfileProps) => {
    const financial = profile?.applicantFinancialDetails;

    const financialDetails = buildFields(financial, [
        { label: "Occupation", key: "occupation" },
        { label: "Annual Income", key: "annualIncome", format: formatCurrencyINR },
        { label: "GSTIN", key: "gstin" },
        { label: "Organisation Type", key: "organisationType" },
        { label: "Organisation Name", key: "organisationName" },
    ] as const);

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#F6F6F6",
            }}
        >
            <GridSection columns={5} items={financialDetails} />
        </Box>
    )
};

const MedicalLifestyle = ({ profile }: ApplicantProfileProps) => {
    const health = profile?.healthInformation;
    const lifestyle = profile?.lifestyleHabits;

    const healthInformationRows = buildPairFields(health, [
        {
            left: { label: "Height", key: "height" },
            right: { label: "Neurological Disorder", key: "neurologicalDisorder" },
        },
        {
            left: { label: "Weight", key: "weight" },
            right: { label: "Mental Disorder", key: "mentalDisorder" },
        },
        {
            left: { label: "Diabetes", key: "diabetes" },
            right: { label: "HIV/AIDS", key: "hivAids" },
        },
        {
            left: { label: "Hypertension", key: "hypertension" },
            right: { label: "Any Surgery", key: "anySurgery" },
        },
        {
            left: { label: "Heart Disease", key: "heartDisease" },
            right: { label: "Hospitalization", key: "hospitalization" },
        },
        {
            left: { label: "Cancer", key: "cancer" },
            right: { label: "Other Illness", key: "otherIllness" },
        },
        {
            left: { label: "Kidney Disease", key: "kidneyDisease" },
            right: { label: "Family Heart Disease", key: "familyHeartDisease" },
        },
        {
            left: { label: "Liver Disease", key: "liverDisease" },
            right: { label: "Family Cancer", key: "familyCancer" },
        },
        {
            left: { label: "Lung Disease", key: "lungDisease" },
            right: { label: "Family Diabetes", key: "familyDiabetes" },
        },
    ]);

    const lifestyleHabitsRows = buildPairFields(lifestyle, [
        {
            left: { label: "Alcohol Consumption", key: "alcoholConsumption" },
            right: { label: "Hazardous Occupation", key: "hazardousOccupation" },
        },
        {
            left: { label: "Alcohol Quantity", key: "alcoholQuantity" },
            right: { label: "Aviation Activities", key: "aviationActivities" },
        },
        {
            left: { label: "Smoking", key: "smoking" },
            right: { label: "Diving", key: "diving" },
        },
        {
            left: { label: "Smoking Quantity", key: "smokingQuantity" },
            right: { label: "Mountaineering", key: "mountaineering" },
        },
        {
            left: { label: "Tobacco/Gut", key: "tobaccoGutka" },
            right: { label: "Tobacco/Gut", key: "tobaccoGutka" },
        },
        {
            left: { label: "Narcotics", key: "narcotics" },
            right: { label: "Other Hazardous Activities", key: "otherHazardousActivities" },
        },
    ]);

    return (
        <>
            <KeyValueTable title="Health Information" rows={healthInformationRows} />
            <Box sx={{ mt: 2 }}>
                <KeyValueTable title="Lifestyle Habits" rows={lifestyleHabitsRows} />
            </Box>
        </>
    );
};

const Nominee = ({ profile }: ApplicantProfileProps) => {
    const nominees: NomineeRow[] = profile?.nominees ?? [];

    if (nominees.length === 0) {
        return (
            <Typography
                component="span"
                sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                }}
            >
                No nominees have been selected
            </Typography>
        );
    }

    return (
        <CustomTable<NomineeRow>
            title="Nominee Details"
            columns={nomineeColumns}
            data={nominees}
        />
    );
};

const Generic = ({ profile }: ApplicantProfileProps) => {
    const generic = profile?.genericDetails;

    const genericDetails = buildFields(generic, [
        { label: "Existing Policy Number", key: "existingPolicyNumber" },
        { label: "Client ID", key: "clientId" },
        { label: "Self Proposed", key: "selfProposed" },
        { label: "Type of Proposer", key: "typeOfProposer" },
        {
            label: "Relationship with Life Assured",
            key: "relationshipWithLifeAssured",
        },
        { label: "Type of Proposal", key: "typeOfProposal" },
    ]);

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#F6F6F6",
            }}
        >
            <GridSection columns={6} items={genericDetails} />
        </Box>
    );
};

const Eia = ({ profile }: ApplicantProfileProps) => {
    const eia = profile?.eiaDetails;

    const eiaDetails = buildFields(eia, [
        { label: "Open eIA", key: "openEIA" },
        { label: "Existing eIA Number", key: "existingEIANumber" },
        { label: "Preferred Repository", key: "preferredRepository" },
        { label: "Convert Policies", key: "convertPolicies" },
    ]);

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#F6F6F6",
            }}
        >
            <GridSection columns={4} items={eiaDetails} />
        </Box>
    );
};

const ApplicantProfile = ({ profile }: ApplicantProfileProps) => {
    const [applicantInfoTab, setApplicantInfoTab] = useState<ApplicantInfoTab>("personalKyc");

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", mt: 1 }}>
                <CustomButton
                    variant="outlined"
                    //   onClick={handleOpenEdit}
                    sx={{ borderRadius: "50px", paddingX: "24px" }}
                >
                    Edit
                </CustomButton>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", my: 2, width: "100%" }}>
                <CustomTabs
                    tabs={applicantInfoTabs}
                    value={applicantInfoTab}
                    onChange={setApplicantInfoTab}
                />
            </Box>

            {applicantInfoTab === "personalKyc" ? (
                <PersonalKYC profile={profile} />
            ) : applicantInfoTab === "contactAddress" ? (
                <ContactAndAddress profile={profile} />
            ) : applicantInfoTab === "financialProfession" ? (
                <FinanceAndProfession profile={profile} />
            ) : applicantInfoTab === "medicalLifestyle" ? (
                <MedicalLifestyle profile={profile} />
            ) : applicantInfoTab === "nominee" ? (
                <Nominee profile={profile} />
            ) : applicantInfoTab === "generic" ? (
                <Generic profile={profile} />
            ) : (
                applicantInfoTab === "eia" && <Eia profile={profile} />
            )}
        </Box>
    )
}

export default ApplicantProfile