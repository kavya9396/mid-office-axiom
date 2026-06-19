import { Box, Divider, Typography } from "@mui/material"
import CustomButton from "../../../components/ui/Button/Button"
import CustomTabs from "../../../components/ui/Tabs/Tabs"
import { AddressProofOptions, applicantInfoTabs, CountryOptions, GenderOptions, IDProofOptions, NationalityOptions, StateOptions } from "../../../utils/constant"
import { useMemo, useState } from "react"
import type { ApplicantEditForm, ApplicantInfoTab, NomineeRow, SummaryResponse } from "../../../types/drs.types"
import { GridSection } from "../../../components/layout/GridSection"
import KeyValueTable from "../../../components/ui/KeyValueTable/KeyValueTable"
import type { Column } from "../../../components/ui/Table/Table"
import CustomTable from "../../../components/ui/Table/Table"
import { buildFields, buildTripleFields, formatCurrencyINR, formatDOB, formatPhone, maskAadhaar, maskPAN } from "../../../utils/helpers"
import CustomDialog from "../../../components/ui/Dialog/Dialog"
import { columnFlex, labelStyles, modalTitleStyles } from "../../../utils/styles"
import CustomTextField from "../../../components/ui/TextField/TextField"
import CustomSelect from "../../../components/ui/Select/Select"

interface ApplicantProfileProps {
    profile?: SummaryResponse;
}

type FormField = {
    name: keyof ApplicantEditForm;
    label: string;
    type?: "text" | "date" | "select";
    options?: { label: string; value: string }[];
};

const personalKycFields: FormField[] = [
    { name: "firstName", label: "First Name" },
    { name: "middleName", label: "Middle Name" },
    { name: "lastName", label: "Last Name" },
    { name: "dob", label: "DOB", type: "date" },
    {
        name: "gender",
        label: "Gender",
        type: "select",
        options: GenderOptions,
    },
    {
        name: "nationality",
        label: "Nationality",
        type: "select",
        options: NationalityOptions,
    },
    { name: "panNumber", label: "PAN Number" },
    {
        name: "identityProofType",
        label: "Identity Proof",
        type: "select",
        options: IDProofOptions,
    },
    {
        name: "identityProofNumber",
        label: "Identity Proof Number",
    },
];

const addressFields: FormField[] = [
    {
        name: "addressProof",
        label: "Address Proof",
        type: "select",
        options: AddressProofOptions,
    },

    { name: "communicationAddressLine1", label: "Comm. Address Line 1" },
    { name: "communicationAddressLine2", label: "Comm. Address Line 2" },
    { name: "communicationAddressLine3", label: "Comm. Address Line 3" },
    { name: "communicationCity", label: "Comm. City" },

    {
        name: "communicationState",
        label: "Comm. State",
        type: "select",
        options: StateOptions,
    },
    {
        name: "communicationCountry",
        label: "Comm. Country",
        type: "select",
        options: CountryOptions,
    },

    { name: "communicationPincode", label: "Comm. Pincode" },

    { name: "permanentAddressLine1", label: "Perm. Address Line 1" },
    { name: "permanentAddressLine2", label: "Perm. Address Line 2" },
    { name: "permanentAddressLine3", label: "Perm. Address Line 3" },
    { name: "permanentCity", label: "Perm. City" },

    {
        name: "permanentState",
        label: "Perm. State",
        type: "select",
        options: StateOptions,
    },
    {
        name: "permanentCountry",
        label: "Perm. Country",
        type: "select",
        options: CountryOptions,
    },

    { name: "permanentPincode", label: "Perm. Pincode" },
];

const buildFormData = (
    profile?: SummaryResponse
): ApplicantEditForm => ({
    firstName: profile?.proposerSummary?.firstName ?? "",
    middleName: profile?.proposerSummary?.middleName ?? "",
    lastName: profile?.proposerSummary?.lastName ?? "",
    dob: formatDOB(profile?.proposerSummary?.dob ?? "") ?? "",
    gender: profile?.proposerSummary?.gender ?? "",
    nationality: profile?.applicantDetails?.nationality ?? "",
    panNumber: profile?.kycDetails?.panNumber ?? "",
    identityProofType: profile?.kycDetails?.identityProofType ?? "",
    identityProofNumber: profile?.kycDetails?.identityProofNumber ?? "",
    addressProof: profile?.kycDetails?.addressProof ?? "",
    communicationAddressLine1: profile?.communicationAddressDetails?.addressLine1 ?? "",
    communicationAddressLine2: profile?.communicationAddressDetails?.addressLine2 ?? "",
    communicationAddressLine3: profile?.communicationAddressDetails?.addressLine3 ?? "",
    communicationCity: profile?.communicationAddressDetails?.city ?? "",
    communicationState: profile?.communicationAddressDetails?.state ?? "",
    communicationCountry: profile?.communicationAddressDetails?.country ?? "",
    communicationPincode: profile?.communicationAddressDetails?.pincode ?? "",
    permanentAddressLine1: profile?.permanentAddressDetails?.addressLine1 ?? "",
    permanentAddressLine2: profile?.permanentAddressDetails?.addressLine2 ?? "",
    permanentAddressLine3: profile?.permanentAddressDetails?.addressLine3 ?? "",
    permanentCity: profile?.permanentAddressDetails?.city ?? "",
    permanentState: profile?.permanentAddressDetails?.state ?? "",
    permanentCountry: profile?.permanentAddressDetails?.country ?? "",
    permanentPincode: profile?.permanentAddressDetails?.pincode ?? "",
});

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

const SectionCard = ({
    children,
}: {
    children: React.ReactNode;
}) => (
    <Box
        sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: "#F6F6F6",
        }}
    >
        {children}
    </Box>
);

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
                <SectionCard>
                    <Typography sx={{ fontWeight: 700, mb: 2 }}>Communication Address</Typography>
                    <GridSection columns={3} items={communicationAddressDetails} />
                </SectionCard>

                {/* Permanent Address */}
                <SectionCard>
                    <Typography sx={{ fontWeight: 700, mb: 2 }}>Permanent Address</Typography>
                    <GridSection columns={3} items={permanentAddressDetails} />
                </SectionCard>
            </Box>
            <Box sx={{ mt: 2 }}>
                <SectionCard>
                    <Typography sx={{ fontWeight: 700, mb: 2 }}>Contact Details</Typography>
                    <GridSection columns={4} items={contactDetails} />
                </SectionCard>
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
        <SectionCard>
            <GridSection columns={5} items={financialDetails} />
        </SectionCard>
    )
};

const MedicalLifestyle = ({ profile }: ApplicantProfileProps) => {
    const health = profile?.healthInformation;
    const lifestyle = profile?.lifestyleHabits;

    const healthInformationRows = buildTripleFields(health, [
        {
            first: { label: "Height", key: "height" },
            second: { label: "Weight", key: "weight" },
            third: { label: "Diabetes", key: "diabetes" },
        },
        {
            first: { label: "Hypertension", key: "hypertension" },
            second: { label: "Heart Disease", key: "heartDisease" },
            third: { label: "Cancer", key: "cancer" },
        },
        {
            first: { label: "Kidney Disease", key: "kidneyDisease" },
            second: { label: "Liver Disease", key: "liverDisease" },
            third: { label: "Lung Disease", key: "lungDisease" },
        },
        {
            first: { label: "Neurological Disorder", key: "neurologicalDisorder" },
            second: { label: "Mental Disorder", key: "mentalDisorder" },
            third: { label: "HIV/AIDS", key: "hivAids" },
        },
        {
            first: { label: "Any Surgery", key: "anySurgery" },
            second: { label: "Hospitalization", key: "hospitalization" },
            third: { label: "Other Illness", key: "otherIllness" },
        },
        {
            first: { label: "Family Heart Disease", key: "familyHeartDisease" },
            second: { label: "Family Cancer", key: "familyCancer" },
            third: { label: "Family Diabetes", key: "familyDiabetes" },
        },
    ]);

    const lifestyleHabitsRows = buildTripleFields(lifestyle, [
        {
            first: { label: "Alcohol Consumption", key: "alcoholConsumption" },
            second: { label: "Alcohol Quantity", key: "alcoholQuantity" },
            third: { label: "Smoking", key: "smoking" },
        },
        {
            first: { label: "Smoking Quantity", key: "smokingQuantity" },
            second: { label: "Tobacco/Gutka", key: "tobaccoGutka" },
            third: { label: "Narcotics", key: "narcotics" },
        },
        {
            first: { label: "Hazardous Occupation", key: "hazardousOccupation" },
            second: { label: "Aviation Activities", key: "aviationActivities" },
            third: { label: "Diving", key: "diving" },
        },
        {
            first: { label: "Mountaineering", key: "mountaineering" },
            second: { label: "Other Hazardous Activities", key: "otherHazardousActivities" },
            third: { label: "Racing", key: "racing" },
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
        <SectionCard>
            <GridSection columns={4} items={eiaDetails} />
        </SectionCard>
    );
};

const ApplicantProfile = ({ profile }: ApplicantProfileProps) => {
    const roleType = localStorage.getItem("roleType") ?? "";
    const [applicantInfoTab, setApplicantInfoTab] = useState<ApplicantInfoTab>("personalKyc");
    const [openEditDialog, setOpenEditDialog] = useState(false);

    const initialFormData = useMemo(
        () => buildFormData(profile),
        [profile]
    );

    const [formData, setFormData] = useState<ApplicantEditForm>(initialFormData);

    const handleOpenEdit = () => {
        // initializeFormFromDisplay();
        // setFieldErrors({});
        setFormData(buildFormData(profile));
        setOpenEditDialog(true);
    };

    const handleInputChange = (
        field: keyof ApplicantEditForm,
        value: string
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = () => {

    }

    const renderField = (field: FormField) => {
        if (field.type === "select") {
            return (
                <CustomSelect
                    label={field.label}
                    value={formData[field.name]}
                    options={field.options ?? []}
                    onChange={(value) => handleInputChange(field.name, value)}
                />
            );
        }

        return (
            <>
                <Typography sx={labelStyles}>{field.label}</Typography>
                <CustomTextField
                    fullWidth
                    type={field.type}
                    sx={{
                        backgroundColor: "#fff",
                        borderRadius: "10px",
                    }}
                    value={formData[field.name]}
                    onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                    }
                />
            </>
        );
    };

    const tabComponents: Record<ApplicantInfoTab, React.ReactNode> = {
        personalKyc: <PersonalKYC profile={profile} />,
        contactAddress: <ContactAndAddress profile={profile} />,
        financialProfession: <FinanceAndProfession profile={profile} />,
        medicalLifestyle: <MedicalLifestyle profile={profile} />,
        nominee: <Nominee profile={profile} />,
        generic: <Generic profile={profile} />,
        eia: <Eia profile={profile} />,
    };

    return (
        <>
            <Box sx={{ mt: 2 }}>
                {
                    roleType === "CVT Pool" && (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", width: "100%", mt: 1 }}>
                            <CustomButton
                                variant="outlined"
                                onClick={handleOpenEdit}
                                sx={{ borderRadius: "50px", paddingX: "24px" }}
                            >
                                Edit
                            </CustomButton>
                        </Box>
                    )
                }

                <Box sx={{ display: "flex", justifyContent: "center", my: 2, width: "100%" }}>
                    <CustomTabs
                        tabs={applicantInfoTabs}
                        value={applicantInfoTab}
                        onChange={setApplicantInfoTab}
                    />
                </Box>

                {tabComponents[applicantInfoTab]}
            </Box>

            <CustomDialog
                open={openEditDialog}
                onClose={() => setOpenEditDialog(false)}
                maxWidth="md"
                title={
                    <Typography
                        sx={{
                            ...modalTitleStyles
                        }}
                    >
                        Edit APPLICANT PROFILE
                    </Typography>
                }
                actionsSx={{ justifyContent: "center", pb: 2 }}
                actions={
                    <CustomButton
                        onClick={handleSave}
                        sx={{ borderRadius: "50px", paddingX: "40px" }}
                    >
                        Save
                    </CustomButton>
                }
            >
                <Box sx={{ backgroundColor: "#F6F6F6", borderRadius: 2, p: 2, ...columnFlex, gap: 2 }}>
                    <Box>
                        <Typography sx={{ color: "#444", fontSize: "14px", fontWeight: 700 }}>Personal & KYC</Typography>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 2,
                                mt: 1,
                            }}
                        >
                            {personalKycFields.map((field) => (
                                <Box key={field.name}>
                                    {renderField(field)}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                    <Divider />
                    <Box>
                        <Typography sx={{ color: "#444", fontSize: "14px", fontWeight: 700 }}>Contact & Address</Typography>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 1fr)",
                                gap: 2,
                                mt: 1,
                            }}
                        >
                            {addressFields.map((field) => (
                                <Box key={field.name}>
                                    {renderField(field)}
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>
            </CustomDialog>
        </>
    )
}

export default ApplicantProfile