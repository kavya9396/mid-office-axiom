import { Box, Divider, Typography } from "@mui/material"
import CustomButton from "../../../../components/ui/Button/Button"
import CustomTabs from "../../../../components/ui/Tabs/Tabs"
import { applicantInfoTabs } from "../../../../utils/constant"
import { useMemo, useState } from "react"
import type {
    ApplicantEditForm,
    ApplicantTab,
    ApplicantInfoTab,
    MasterOption,
    ApplicantProfileSubmitRequest,
    DRSData,
    SummaryResponse,
} from "../../../../types/drs.types"
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
import { useAppDispatch } from "../../../../store/hooks"
import { applicantProfileSubmitThunk } from "../../../../store/thunks/applicantProfileSubmitThunk"
// import { updateApplicantProfile } from "../../../../store/slices/drsSlice"
import { useParams } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../../../../store/store"
import FundDetails from "./FundDetails"

export interface ApplicantProfileProps {
    profile?: Partial<SummaryResponse>;
    selectedApplicantTab?: ApplicantTab;
}

type FormField = {
    name: keyof ApplicantEditForm;
    label: string;
    type?: "text" | "date" | "select";
    options?: { label: string; value: string }[];
};

type FormErrors = Partial<Record<keyof ApplicantEditForm, string>>;

const emptyOptions: MasterOption[] = [];

const getPersonalKycFields = (options: {
    titleOptions: MasterOption[];
    genderOptions: MasterOption[];
    nationalityOptions: MasterOption[];
    idProofOptions: MasterOption[];
}): FormField[] => [
    {
        name: "title",
        label: "Title",
        type: "select",
        options: options.titleOptions,
    },
    { name: "firstName", label: "First Name" },
    { name: "middleName", label: "Middle Name" },
    { name: "lastName", label: "Last Name" },
    { name: "dob", label: "DOB", type: "date" },
    {
        name: "gender",
        label: "Gender",
        type: "select",
        options: options.genderOptions,
    },
    {
        name: "nationality",
        label: "Nationality",
        type: "select",
        options: options.nationalityOptions,
    },
    { name: "panNumber", label: "PAN Number" },
    {
        name: "identityProofType",
        label: "Identity Proof",
        type: "select",
        options: options.idProofOptions,
    },
    {
        name: "identityProofNumber",
        label: "Identity Proof Number",
    },
];

const getAddressFields = (options: {
    addressProofOptions: MasterOption[];
    stateOptions: MasterOption[];
    countryOptions: MasterOption[];
    communicationIsIndia: boolean;
    permanentIsIndia: boolean;
}): FormField[] => [
    {
        name: "addressProof",
        label: "Address Proof",
        type: "select",
        options: options.addressProofOptions,
    },

    { name: "communicationAddressLine1", label: "Comm. Address Line 1" },
    { name: "communicationAddressLine2", label: "Comm. Address Line 2" },
    { name: "communicationAddressLine3", label: "Comm. Address Line 3" },
    {
        name: "communicationCountry",
        label: "Comm. Country",
        type: "select",
        options: options.countryOptions,
    },
    
    {
        name: "communicationState",
        label: "Comm. State",
        type: options.communicationIsIndia ? "select" : "text",
        options: options.communicationIsIndia ? options.stateOptions : undefined,
    },
    { name: "communicationCity", label: "Comm. City" },
    { name: "communicationPincode", label: "Comm. Pincode" },
    { name: "permanentAddressLine1", label: "Perm. Address Line 1" },
    { name: "permanentAddressLine2", label: "Perm. Address Line 2" },
    { name: "permanentAddressLine3", label: "Perm. Address Line 3" },
    {
        name: "permanentCountry",
        label: "Perm. Country",
        type: "select",
        options: options.countryOptions,
    },
    
    {
        name: "permanentState",
        label: "Perm. State",
        type: options.permanentIsIndia ? "select" : "text",
        options: options.permanentIsIndia ? options.stateOptions : undefined,
    },
    { name: "permanentCity", label: "Perm. City" },
    { name: "permanentPincode", label: "Perm. Pincode" },
];

const idProofNumberValidationMap: Record<string, { regex: RegExp; message: string }> = {
    "PAN Card": {
        regex: /^[A-Z]{5}[0-9]{4}[A-Z]$/,
        message: "Enter a valid PAN number (e.g. ABCDE1234F)",
    },
    "Voter ID": {
        regex: /^[A-Z]{3}[0-9]{7}$/i,
        message: "Enter a valid Voter ID (e.g. ABC1234567)",
    },
    "Aadhaar Card": {
        regex: /^\d{12}$/,
        message: "Enter a valid Aadhaar number (12 digits)",
    },
    "Passport": {
        regex: /^[A-PR-WY][1-9]\d{6}$/i,
        message: "Enter a valid Passport number (e.g. A1234567)",
    },
    "Driving's License": {
        regex: /^[A-Z]{2}[0-9]{2}[0-9A-Z]{9,13}$/i,
        message: "Enter a valid Driving License number",
    },
};

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const alphabetOnlyRegex = /^[A-Za-z\s]+$/;
const indiaPincodeRegex = /^\d{6}$/;
const numericRegex = /^\d+$/;
const optionalFormFields: Array<keyof ApplicantEditForm> = ["middleName"];

const getGenderByTitle = (title: string): ApplicantEditForm["gender"] | undefined => {
    const normalizedTitle = title.trim().toLowerCase();

    if (normalizedTitle === "mr" || normalizedTitle === "master") {
        return "Male";
    }

    if (normalizedTitle === "miss" || normalizedTitle === "mrs") {
        return "Female";
    }

    return undefined;
};

const getStoredApplicantTab = (): ApplicantTab => {
    const storedApplicantTab = localStorage.getItem("drsSelectedApplicantTab");

    if (
        storedApplicantTab === "proposer" ||
        storedApplicantTab === "lifeassured1" ||
        storedApplicantTab === "lifeassured2"
    ) {
        return storedApplicantTab;
    }

    return "proposer";
};

const mapGenderToDisplayValue = (gender?: string): ApplicantEditForm["gender"] => {
    const normalizedGender = gender?.trim().toUpperCase();

    if (normalizedGender === "M") {
        return "Male";
    }

    if (normalizedGender === "F") {
        return "Female";
    }

    if (normalizedGender === "MALE") {
        return "Male";
    }

    if (normalizedGender === "FEMALE") {
        return "Female";
    }

    if (normalizedGender === "OTHER") {
        return "Other";
    }

    return "";
};

const mapMemberType = (lifeType: string | undefined, index: number): ApplicantTab => {
    const normalizedLifeType = lifeType?.trim().toUpperCase() ?? "";

    if (normalizedLifeType.includes("PR") || normalizedLifeType.includes("PROPOSER")) {
        return "proposer";
    }

    if (normalizedLifeType.includes("LA") || normalizedLifeType.includes("LIFE")) {
        return index === 1 ? "lifeassured1" : "lifeassured2";
    }

    if (index === 0) {
        return "proposer";
    }

    if (index === 1) {
        return "lifeassured1";
    }

    return "lifeassured2";
};

const toRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

const buildProfileFromReduxData = (
    data?: DRSData | null,
    selectedApplicantTab: ApplicantTab = getStoredApplicantTab()
): Partial<SummaryResponse> | undefined => {
    const dataRecord = data as unknown as Record<string, unknown>;
    const summaryEntries = Array.isArray(dataRecord?.summary)
        ? (dataRecord.summary as Array<Record<string, unknown>>)
        : [];
    const customerDetails = data?.customerDetails ?? [];

    if (summaryEntries.length === 0 && customerDetails.length === 0) {
        return undefined;
    }

    const summaryWithTabs = summaryEntries.map((entry, index) => ({
        entry,
        memberType: mapMemberType(String(entry.memberType ?? ""), index),
    }));

    const selectedSummaryEntry =
        summaryWithTabs.find((item) => item.memberType === selectedApplicantTab)?.entry ??
        summaryEntries[0];

    const customerWithTabs = customerDetails.map((customer, index) => ({
        customer,
        memberType: mapMemberType(String(customer.lifeType ?? ""), index),
    }));

    const currentCustomer =
        customerWithTabs.find((item) => item.memberType === selectedApplicantTab)?.customer ??
        customerDetails[0];

    const summaryRecord = toRecord(selectedSummaryEntry);
    const summaryPersonal = toRecord(summaryRecord.personalDetails);
    const summaryKyc = toRecord(summaryRecord.kycDetails);
    const summaryContact = toRecord(summaryRecord.contactDetails);
    const summaryApplicantFinancial = toRecord(summaryRecord.applicantFinancialDetails);
    const summaryFundDetails = toRecord(summaryRecord.fundDetails);

    const personalDetails = Object.keys(summaryPersonal).length > 0
        ? summaryPersonal
        : toRecord(currentCustomer?.personalDetails);

    const summaryAddresses = Array.isArray(summaryRecord.address)
        ? (summaryRecord.address as Array<Record<string, unknown>>)
        : [];
    const addresses = summaryAddresses.length > 0
        ? summaryAddresses
        : (Array.isArray(currentCustomer?.address) ? currentCustomer.address : []);

    const permanentAddress = addresses.find((item) => String(item.type).toLowerCase() === "permanent") ?? addresses[0] ?? {};
    const communicationAddress =
        addresses.find((item) => String(item.type).toLowerCase() === "communication") ??
        addresses.find((item) => String(item.type).toLowerCase() === "correspondence") ??
        permanentAddress;

    const summaryDocument = Array.isArray(summaryRecord.documentDetails)
        ? summaryRecord.documentDetails[0]
        : undefined;
    const fallbackDocument = Array.isArray(currentCustomer?.documentDetails)
        ? currentCustomer.documentDetails[0]
        : undefined;
    const resolvedDocument = summaryDocument ?? fallbackDocument;

    const resolvedContact = Object.keys(summaryContact).length > 0
        ? summaryContact
        : toRecord(currentCustomer?.communicationDetails);

    const resolvedKyc = Object.keys(summaryKyc).length > 0
        ? summaryKyc
        : {};

    const resolvedApplicantFinancial = Object.keys(summaryApplicantFinancial).length > 0
        ? summaryApplicantFinancial
        : {};

    const topLevelFundDetails = toRecord((data as unknown as Record<string, unknown>)?.fundDetails);
    const resolvedFundDetails = Object.keys(summaryFundDetails).length > 0
        ? summaryFundDetails
        : topLevelFundDetails;
    const rawFundDetail = resolvedFundDetails.fundDetail;
    const fundDetailItems = Array.isArray(rawFundDetail)
        ? rawFundDetail
        : (rawFundDetail && typeof rawFundDetail === "object" ? [rawFundDetail] : []);

    return {
        memberType: selectedApplicantTab,
        proposerSummary: {
            title: String(personalDetails?.title ?? ""),
            firstName: String(personalDetails?.firstName ?? ""),
            middleName: String(personalDetails?.middleName ?? ""),
            lastName: String(personalDetails?.lastName ?? ""),
            dob: String(personalDetails?.dob ?? ""),
            age: 0,
            gender: mapGenderToDisplayValue(String(personalDetails?.gender ?? "")),
            profileImage: "",
            caseStatus: "",
        },
        applicantDetails: {
            dateOfBirth: String(personalDetails?.dob ?? ""),
            gender: mapGenderToDisplayValue(String(personalDetails?.gender ?? "")),
            maritalStatus: String(personalDetails?.maritalStatus ?? ""),
            nationality: String(personalDetails?.nationality ?? ""),
            countryOfResidence: String(personalDetails?.residentStatus ?? ""),
            education: String(personalDetails?.highestQualification ?? ""),
        },
        kycDetails: {
            panNumber: String(resolvedKyc?.panNumber ?? personalDetails?.panNo ?? ""),
            identityProofType: String(resolvedKyc?.identityProofType ?? resolvedDocument?.documentType ?? ""),
            identityProofNumber: String(resolvedKyc?.identityProofNumber ?? resolvedDocument?.documentId ?? ""),
            addressProof: String(resolvedKyc?.addressProof ?? resolvedDocument?.documentName ?? ""),
            incomeProof: String(resolvedKyc?.incomeProof ?? personalDetails?.incomeProof ?? ""),
            existingCkycNumber: String(resolvedKyc?.existingCkycNumber ?? personalDetails?.ckycNumber ?? ""),
            pep: String(resolvedKyc?.pep ?? personalDetails?.isPEP ?? "").toLowerCase() === "yes" || Boolean(personalDetails?.isPEP),
            criminalProceedings: String(resolvedKyc?.criminalProceedings ?? personalDetails?.criminalProceeding ?? ""),
        },
        communicationAddressDetails: {
            addressLine1: String(communicationAddress.addressLine1 ?? ""),
            addressLine2: String(communicationAddress.addressLine2 ?? ""),
            addressLine3: String(communicationAddress.addressLine3 ?? ""),
            landmark: String(communicationAddress.landmark ?? ""),
            city: String(communicationAddress.city ?? ""),
            state: String(communicationAddress.state ?? ""),
            country: String(communicationAddress.residingCountry ?? ""),
            pincode: String(communicationAddress.pinCode ?? ""),
        },
        permanentAddressDetails: {
            addressLine1: String(permanentAddress.addressLine1 ?? ""),
            addressLine2: String(permanentAddress.addressLine2 ?? ""),
            addressLine3: String(permanentAddress.addressLine3 ?? ""),
            landmark: String(permanentAddress.landmark ?? ""),
            city: String(permanentAddress.city ?? ""),
            state: String(permanentAddress.state ?? ""),
            country: String(permanentAddress.residingCountry ?? ""),
            pincode: String(permanentAddress.pinCode ?? ""),
        },
        contactDetails: {
            mobileNumber: String(resolvedContact?.mobileNo ?? ""),
            emailId: String(resolvedContact?.emailId ?? ""),
            alternateMobile: String(resolvedContact?.alternateMobileNo ?? resolvedContact?.mobileNo ?? ""),
            landlineNumber: String(resolvedContact?.landlineNo ?? ""),
            emailPref: String(resolvedContact?.emailPref ?? ""),
            smsPref: String(resolvedContact?.smsPref ?? ""),
        },
        applicantFinancialDetails: {
            occupation: String(resolvedApplicantFinancial?.occupation ?? personalDetails?.occupationType ?? ""),
            annualIncome: Number(
                resolvedApplicantFinancial?.annualIncome ??
                    (toRecord(currentCustomer?.financialDetail).annualIncome) ??
                    personalDetails?.netIncomeAmt ??
                    0
            ),
            gstin: String(resolvedApplicantFinancial?.gstin ?? (data?.producerDetails as Record<string, string> | undefined)?.gstInNumber ?? ""),
            organisationType: String(resolvedApplicantFinancial?.organisationType ?? personalDetails?.orgType ?? ""),
            organisationName: String(resolvedApplicantFinancial?.organisationName ?? personalDetails?.orgName ?? ""),
        },
        fundDetails: {
            allocationStrategy: String(resolvedFundDetails?.allocationStrategy ?? ""),
            totalAllocation: String(resolvedFundDetails?.totalAllocation ?? ""),
            atpOpted: String(resolvedFundDetails?.atpOpted ?? ""),
            fundDetail: fundDetailItems.map((item) => {
                const detail = toRecord(item);
                return {
                    name: String(detail?.name ?? ""),
                    amount: String(detail?.amount ?? ""),
                    sourceFund: String(detail?.sourceFund ?? ""),
                    targetFund: String(detail?.targetFund ?? ""),
                    switchDate: String(detail?.switchDate ?? ""),
                    transferPercentage: String(detail?.transferPercentage ?? ""),
                };
            }),
        },
    } as Partial<SummaryResponse>;
};

const buildFormData = (
    profile?: Partial<SummaryResponse>
): ApplicantEditForm => ({
    title: profile?.proposerSummary?.title ?? "",
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

const applyUpdatedDetailsToProfile = (
    profile: Partial<SummaryResponse>,
    updatedDetails: Partial<ApplicantEditForm>
): Partial<SummaryResponse> => ({
    ...profile,
    proposerSummary: {
        ...profile.proposerSummary,
        title: updatedDetails.title ?? profile.proposerSummary?.title ?? "",
        firstName: updatedDetails.firstName ?? profile.proposerSummary?.firstName ?? "",
        middleName: updatedDetails.middleName ?? profile.proposerSummary?.middleName ?? "",
        lastName: updatedDetails.lastName ?? profile.proposerSummary?.lastName ?? "",
        dob: updatedDetails.dob ?? profile.proposerSummary?.dob ?? "",
    },
    applicantDetails: {
        ...profile.applicantDetails,
        dateOfBirth: updatedDetails.dob ?? profile.applicantDetails?.dateOfBirth ?? "",
        gender: updatedDetails.gender ?? profile.applicantDetails?.gender ?? "",
        nationality: updatedDetails.nationality ?? profile.applicantDetails?.nationality ?? "",
    },
    kycDetails: {
        ...profile.kycDetails,
        panNumber: updatedDetails.panNumber ?? profile.kycDetails?.panNumber ?? "",
        identityProofType: updatedDetails.identityProofType ?? profile.kycDetails?.identityProofType ?? "",
        identityProofNumber: updatedDetails.identityProofNumber ?? profile.kycDetails?.identityProofNumber ?? "",
        addressProof: updatedDetails.addressProof ?? profile.kycDetails?.addressProof ?? "",
    },
    communicationAddressDetails: {
        ...profile.communicationAddressDetails,
        addressLine1: updatedDetails.communicationAddressLine1 ?? profile.communicationAddressDetails?.addressLine1 ?? "",
        addressLine2: updatedDetails.communicationAddressLine2 ?? profile.communicationAddressDetails?.addressLine2 ?? "",
        addressLine3: updatedDetails.communicationAddressLine3 ?? profile.communicationAddressDetails?.addressLine3 ?? "",
        city: updatedDetails.communicationCity ?? profile.communicationAddressDetails?.city ?? "",
        state: updatedDetails.communicationState ?? profile.communicationAddressDetails?.state ?? "",
        country: updatedDetails.communicationCountry ?? profile.communicationAddressDetails?.country ?? "",
        pincode: updatedDetails.communicationPincode ?? profile.communicationAddressDetails?.pincode ?? "",
    },
    permanentAddressDetails: {
        ...profile.permanentAddressDetails,
        addressLine1: updatedDetails.permanentAddressLine1 ?? profile.permanentAddressDetails?.addressLine1 ?? "",
        addressLine2: updatedDetails.permanentAddressLine2 ?? profile.permanentAddressDetails?.addressLine2 ?? "",
        addressLine3: updatedDetails.permanentAddressLine3 ?? profile.permanentAddressDetails?.addressLine3 ?? "",
        city: updatedDetails.permanentCity ?? profile.permanentAddressDetails?.city ?? "",
        state: updatedDetails.permanentState ?? profile.permanentAddressDetails?.state ?? "",
        country: updatedDetails.permanentCountry ?? profile.permanentAddressDetails?.country ?? "",
        pincode: updatedDetails.permanentPincode ?? profile.permanentAddressDetails?.pincode ?? "",
    },
} as Partial<SummaryResponse>);

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

const ApplicantProfile = ({ profile, selectedApplicantTab }: ApplicantProfileProps) => {
    const roleType = localStorage.getItem("roleType") ?? "";
    const { applicationNumber } = useParams<{ applicationNumber: string }>();
    const dispatch = useAppDispatch();
    const masters = useSelector((state: RootState) => state.drs.masters);
    const drsData = useSelector((state: RootState) => state.drs.data);
    const [applicantInfoTab, setApplicantInfoTab] = useState<ApplicantInfoTab>("personalKyc");
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [savedProfile, setSavedProfile] = useState<Partial<SummaryResponse> | undefined>(undefined);
    const resolvedApplicantTab = selectedApplicantTab ?? getStoredApplicantTab();

    const fallbackProfile = useMemo(
        () => buildProfileFromReduxData(drsData, resolvedApplicantTab),
        [drsData, resolvedApplicantTab]
    );

    const baseProfile = profile ?? fallbackProfile;
    const displayProfile =
        savedProfile?.memberType === resolvedApplicantTab
            ? savedProfile
            : baseProfile;

    const initialFormData = useMemo(
        () => buildFormData(displayProfile),
        [displayProfile]
    );

    const [formData, setFormData] = useState<ApplicantEditForm>(initialFormData);
    const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

    const titleOptions = masters.title ?? emptyOptions;
    const genderOptions = masters.gender ?? emptyOptions;
    const nationalityOptions = masters.nationality ?? emptyOptions;
    const idProofOptions = masters.idProof ?? emptyOptions;
    const addressProofOptions = masters.addressProof ?? emptyOptions;
    const stateOptions = masters.state ?? emptyOptions;
    const countryOptions = masters.country ?? emptyOptions;

    const personalKycFields = useMemo(
        () => getPersonalKycFields({ titleOptions, genderOptions, nationalityOptions, idProofOptions }),
        [titleOptions, genderOptions, nationalityOptions, idProofOptions]
    );

    const communicationIsIndia = formData.communicationCountry.trim().toLowerCase() === "india";
    const permanentIsIndia = formData.permanentCountry.trim().toLowerCase() === "india";

    const addressFields = useMemo(
        () => getAddressFields({
            addressProofOptions,
            stateOptions,
            countryOptions,
            communicationIsIndia,
            permanentIsIndia,
        }),
        [
            addressProofOptions,
            stateOptions,
            countryOptions,
            communicationIsIndia,
            permanentIsIndia,
        ]
    );

    const allDialogFields = useMemo(
        () => [...personalKycFields, ...addressFields],
        [personalKycFields, addressFields]
    );

    const hasFundDetails = useMemo(() => {
        const hasAnyFundData = (fund?: Record<string, unknown>) => {
            if (!fund) return false;

            const rawFundDetail = fund.fundDetail;
            const hasFundRows = Array.isArray(rawFundDetail)
                ? rawFundDetail.length > 0
                : Boolean(rawFundDetail && typeof rawFundDetail === "object");

            if (hasFundRows) return true;

            return Boolean(
                String(fund.allocationStrategy ?? "").trim() ||
                String(fund.totalAllocation ?? "").trim() ||
                String(fund.atpOpted ?? "").trim()
            );
        };

        const profileFund = displayProfile?.fundDetails as unknown as Record<string, unknown> | undefined;
        const drsFund = drsData?.fundDetails as unknown as Record<string, unknown> | undefined;

        return hasAnyFundData(profileFund) || hasAnyFundData(drsFund);
    }, [displayProfile?.fundDetails, drsData?.fundDetails]);

    const visibleApplicantInfoTabs = useMemo(
        () => hasFundDetails ? applicantInfoTabs : applicantInfoTabs.filter((tab) => tab.key !== "fundDetails"),
        [hasFundDetails]
    );

    const activeApplicantInfoTab = useMemo(
        () => visibleApplicantInfoTabs.some((tab) => tab.key === applicantInfoTab)
            ? applicantInfoTab
            : visibleApplicantInfoTabs[0]?.key ?? "personalKyc",
        [visibleApplicantInfoTabs, applicantInfoTab]
    );

    const allowedIdProofValues = useMemo(
        () => new Set(idProofOptions.map((option) => option.value)),
        [idProofOptions]
    );

    const allowedTitleValues = useMemo(
        () => new Set(titleOptions.map((option) => option.value)),
        [titleOptions]
    );

    const allowedAddressProofValues = useMemo(
        () => new Set(addressProofOptions.map((option) => option.value)),
        [addressProofOptions]
    );

    const allowedStateValues = useMemo(
        () => new Set(stateOptions.map((option) => option.value)),
        [stateOptions]
    );

    const validateForm = () => {
        const errors: FormErrors = {};

        allDialogFields.forEach((field) => {
            const value = String(formData[field.name] ?? "").trim();
            if (optionalFormFields.includes(field.name)) {
                return;
            }
            if (!value) {
                errors[field.name] = `${field.label} is required`;
            }
        });

        if (formData.panNumber.trim() && !panRegex.test(formData.panNumber.trim().toUpperCase())) {
            errors.panNumber = "Enter a valid PAN number (e.g. ABCDE1234F)";
        }

        if (idProofOptions.length > 0 && formData.identityProofType && !allowedIdProofValues.has(formData.identityProofType)) {
            errors.identityProofType = "Select a valid Identity Proof";
        }

        if (titleOptions.length > 0 && formData.title && !allowedTitleValues.has(formData.title)) {
            errors.title = "Select a valid Title";
        }

        if (addressProofOptions.length > 0 && formData.addressProof && !allowedAddressProofValues.has(formData.addressProof)) {
            errors.addressProof = "Select a valid Address Proof";
        }

        if (formData.communicationCity.trim() && !alphabetOnlyRegex.test(formData.communicationCity.trim())) {
            errors.communicationCity = "Comm. City must contain only alphabets";
        }

        if (formData.permanentCity.trim() && !alphabetOnlyRegex.test(formData.permanentCity.trim())) {
            errors.permanentCity = "Perm. City must contain only alphabets";
        }

        if (communicationIsIndia) {
            if (stateOptions.length > 0 && formData.communicationState && !allowedStateValues.has(formData.communicationState)) {
                errors.communicationState = "Select a valid Comm. State";
            }

            if (formData.communicationPincode.trim() && !indiaPincodeRegex.test(formData.communicationPincode.trim())) {
                errors.communicationPincode = "Comm. Pincode must be exactly 6 digits";
            }
        } else {
            if (formData.communicationState.trim() && !alphabetOnlyRegex.test(formData.communicationState.trim())) {
                errors.communicationState = "Comm. State must contain only alphabets";
            }

            if (formData.communicationPincode.trim() && !numericRegex.test(formData.communicationPincode.trim())) {
                errors.communicationPincode = "Comm. Pincode must contain only digits";
            }
        }

        if (permanentIsIndia) {
            if (stateOptions.length > 0 && formData.permanentState && !allowedStateValues.has(formData.permanentState)) {
                errors.permanentState = "Select a valid Perm. State";
            }

            if (formData.permanentPincode.trim() && !indiaPincodeRegex.test(formData.permanentPincode.trim())) {
                errors.permanentPincode = "Perm. Pincode must be exactly 6 digits";
            }
        } else {
            if (formData.permanentState.trim() && !alphabetOnlyRegex.test(formData.permanentState.trim())) {
                errors.permanentState = "Perm. State must contain only alphabets";
            }

            if (formData.permanentPincode.trim() && !numericRegex.test(formData.permanentPincode.trim())) {
                errors.permanentPincode = "Perm. Pincode must contain only digits";
            }
        }

        const selectedProofValidation = idProofNumberValidationMap[formData.identityProofType];
        if (selectedProofValidation && formData.identityProofNumber.trim()) {
            if (!selectedProofValidation.regex.test(formData.identityProofNumber.trim())) {
                errors.identityProofNumber = selectedProofValidation.message;
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenEdit = () => {
        setFieldErrors({});
        setSubmitError(null);
        setFormData(buildFormData(displayProfile));
        setOpenEditDialog(true);
    };

    const handleInputChange = (
        field: keyof ApplicantEditForm,
        value: string
    ) => {
        setFormData((prev) => {
            const nextFormData: ApplicantEditForm = {
                ...prev,
                [field]: value,
            };

            if (field === "communicationCountry") {
                nextFormData.communicationState = "";
                nextFormData.communicationCity = "";
                nextFormData.communicationPincode = "";
            }

            if (field === "permanentCountry") {
                nextFormData.permanentState = "";
                nextFormData.permanentCity = "";
                nextFormData.permanentPincode = "";
            }

            if (field === "title") {
                const mappedGender = getGenderByTitle(value);
                if (mappedGender) {
                    nextFormData.gender = mappedGender;
                }
            }

            return nextFormData;
        });

        setFieldErrors((prev) => {
            if (!prev[field]) {
                return prev;
            }

            const nextErrors = { ...prev };
            delete nextErrors[field];

            if (field === "title") {
                delete nextErrors.gender;
            }

            return nextErrors;
        });

        if (field === "identityProofType" && fieldErrors.identityProofNumber) {
            setFieldErrors((prev) => {
                const nextErrors = { ...prev };
                delete nextErrors.identityProofNumber;
                return nextErrors;
            });
        }

        if (field === "communicationCountry") {
            setFieldErrors((prev) => {
                const nextErrors = { ...prev };
                delete nextErrors.communicationState;
                delete nextErrors.communicationCity;
                delete nextErrors.communicationPincode;
                return nextErrors;
            });
        }

        if (field === "permanentCountry") {
            setFieldErrors((prev) => {
                const nextErrors = { ...prev };
                delete nextErrors.permanentState;
                delete nextErrors.permanentCity;
                delete nextErrors.permanentPincode;
                return nextErrors;
            });
        }
    };

    const handleSave = async () => {
        const isValid = validateForm();
        if (!isValid) {
            return;
        }

        if (!applicationNumber) {
            setSubmitError("Application ID is missing");
            return;
        }

        const baselineData = buildFormData(displayProfile);
        const updatedDetails = Object.entries(formData).reduce<Partial<ApplicantEditForm>>(
            (acc, [key, value]) => {
                const formKey = key as keyof ApplicantEditForm;
                if (value !== baselineData[formKey]) {
                    acc[formKey] = value;
                }
                return acc;
            },
            {}
        );

        if (Object.keys(updatedDetails).length === 0) {
            setOpenEditDialog(false);
            return;
        }

        try {
            setSubmitLoading(true);
            setSubmitError(null);

            const payload: ApplicantProfileSubmitRequest = {
                applicationId: applicationNumber,
                roleType,
                memberType: resolvedApplicantTab,
                updatedDetails,
            };

            const response = await dispatch(applicantProfileSubmitThunk(payload)).unwrap();

            const serverUpdatedDetails = response.updatedDetails;
            const finalUpdatedDetails = {
                ...(serverUpdatedDetails ?? {}),
                ...updatedDetails,
            };

            // Calculate the updated profile
            if (!displayProfile) {
                return;
            }
            const updatedProfile = applyUpdatedDetailsToProfile(displayProfile, finalUpdatedDetails);

            // Update local state
            setSavedProfile(updatedProfile);

            // Update Redux store so Summary component reflects changes
            // dispatch(updateApplicantProfile(updatedProfile));

            setOpenEditDialog(false);
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "Failed to save applicant profile");
        } finally {
            setSubmitLoading(false);
        }

    }

    const renderField = (field: FormField) => {
        if (field.type === "select") {
            return (
                <CustomSelect
                    label={field.label}
                    value={formData[field.name]}
                    options={field.options ?? []}
                    onChange={(value) => handleInputChange(field.name, value)}
                    error={Boolean(fieldErrors[field.name])}
                    helperText={fieldErrors[field.name]}
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
                    error={Boolean(fieldErrors[field.name])}
                    helperText={fieldErrors[field.name]}
                    onChange={(e) =>
                        handleInputChange(field.name, e.target.value)
                    }
                />
            </>
        );
    };

    const tabComponents: Record<ApplicantInfoTab, React.ReactNode> = {
        personalKyc: <PersonalKYC profile={displayProfile} />,
        contactAddress: <ContactAndAddress profile={displayProfile} />,
        financialProfession: <FinanceAndProfession profile={displayProfile} />,
        medicalLifestyle: <MedicalLifestyle profile={displayProfile} />,
        nominee: <Nominee profile={displayProfile} />,
        generic: <Generic profile={displayProfile} />,
        eia: <Eia profile={displayProfile} />,
        fundDetails: <FundDetails profile={displayProfile}/>,
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
                        tabs={visibleApplicantInfoTabs}
                        value={activeApplicantInfoTab}
                        onChange={setApplicantInfoTab}
                    />
                </Box>

                {tabComponents[activeApplicantInfoTab]}
            </Box>

            <CustomDialog
                open={openEditDialog}
                onClose={() => {
                    if (!submitLoading) {
                        setOpenEditDialog(false)
                    }
                }}
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
                        disabled={submitLoading}
                        sx={{ borderRadius: "50px", paddingX: "40px" }}
                    >
                        {submitLoading ? "Saving..." : "Save"}
                    </CustomButton>
                }
            >
                <Box sx={{ backgroundColor: "#F6F6F6", borderRadius: 2, p: 2, ...columnFlex, gap: 2 }}>
                    {submitError && (
                        <Typography sx={{ color: "#DE2C3B", fontSize: "14px", fontWeight: 500 }}>
                            {submitError}
                        </Typography>
                    )}
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