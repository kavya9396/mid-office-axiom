import { Box, Divider, Typography } from "@mui/material"
import CustomButton from "../../../../components/ui/Button/Button"
import CustomTabs from "../../../../components/ui/Tabs/Tabs"
import { AddressProofOptions, applicantInfoTabs, CountryOptions, GenderOptions, IDProofOptions, NationalityOptions, StateOptions } from "../../../../utils/constant"
import { useMemo, useState } from "react"
import type { ApplicantEditForm, ApplicantInfoTab, SummaryResponse } from "../../../../types/drs.types"
import CustomDialog from "../../../../components/ui/Dialog/Dialog"
import { columnFlex, labelStyles, modalTitleStyles } from "../../../../utils/styles"
import CustomTextField from "../../../../components/ui/TextField/TextField"
import CustomSelect from "../../../../components/ui/Select/Select"
import PersonalKYC from "./PersonalKYC"
import ContactAndAddress from "./ContactAndAddress"
import FinanceAndProfession from "./FinanceAndProfession"
import MedicalLifestyle from "./MedicalLifestyle"
import Nominee from "./Nominee"
import Generic from "./Generic"
import Eia from "./Eia"
import { formatDOB } from "../../../../utils/helpers"

export interface ApplicantProfileProps {
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

export const SectionCard = ({
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