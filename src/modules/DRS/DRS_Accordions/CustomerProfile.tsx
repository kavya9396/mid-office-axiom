import { Alert, Avatar, Box, CircularProgress, IconButton, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { EditIcon } from "../../../icons/Icons";
import { useAppContext } from "../../../hooks/useAppContext";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { customerProfileSubmitThunk } from "../../../store/thunks/customerProfileSubmitThunk";
import type { CustomerProfileForm } from "../../../types/drs.types";
import { formatDOB } from "../../../utils/helpers";
import { normalizeMasterOptions, toMasterKey, toMasterLabel, type SelectOption } from "../../../utils/masterOptions";
import { labelStyles, modalTitleStyles } from "../../../utils/styles";

type DetailItem = {
  label: string;
  value: string;
};

type FormField = {
  name: keyof CustomerProfileForm;
  label: string;
  type?: "text" | "date" | "select";
  options?: SelectOption[];
};

const getFormFields = (options: {
  genderOptions: SelectOption[];
  maritalStatusOptions: SelectOption[];
  pepOptions: SelectOption[];
}): FormField[] => [
    { name: "productApplied", label: "Product Applied" },
    { name: "appliedSumAssured", label: "Applied Sum Assured" },
    { name: "lifeAssuredName", label: "Life Assured Name" },
    { name: "dob", label: "DOB", type: "date" },
    { name: "gender", label: "Gender", type: "select", options: options.genderOptions },
    { name: "maritalStatus", label: "Marital Status", type: "select", options: options.maritalStatusOptions },
    { name: "education", label: "Education" },
    { name: "occupation", label: "Occupation" },
    { name: "designation", label: "Designation" },
    { name: "companyName", label: "Company Name" },
    { name: "earnedIncome", label: "Earned Income" },
    { name: "website", label: "Website" },
    { name: "personalLinkedInProfile", label: "Personal LinkedIn Profile" },
    { name: "pep", label: "PEP", type: "select", options: options.pepOptions },
    { name: "criminalHistory", label: "Criminal History" },
  ];

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const toText = (value: unknown): string => String(value ?? "").trim();

const getFirstText = (source: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = toText(source[key]);
    if (value) {
      return value;
    }
  }

  return "";
};

const formatCurrency = (value: unknown): string => {
  const textValue = toText(value);
  if (!textValue) {
    return "";
  }

  const numericValue = Number(textValue.replace(/,/g, ""));
  if (Number.isNaN(numericValue)) {
    return textValue;
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericValue);
};

const mapGenderToDisplay = (value: unknown): string => {
  const normalized = toText(value).toUpperCase();

  if (normalized === "M" || normalized === "MALE") {
    return "Male";
  }

  if (normalized === "F" || normalized === "FEMALE") {
    return "Female";
  }

  if (normalized === "OTHER") {
    return "Other";
  }

  return toText(value);
};

const formatDisplayDate = (value: unknown): string => {
  const dateValue = formatDOB(toText(value));
  if (!dateValue) {
    return "";
  }

  const [year, month, day] = dateValue.split("-");
  return day && month && year ? `${day}/${month}/${year}` : dateValue;
};

const getSummaryProfile = (data: unknown): Record<string, unknown> => {
  const dataRecord = toRecord(data);
  const summary = dataRecord.summary;

  if (Array.isArray(summary) && summary.length > 0) {
    return toRecord(summary[0]);
  }

  const customerDetails = dataRecord.customerDetails;
  if (Array.isArray(customerDetails) && customerDetails.length > 0) {
    return toRecord(customerDetails[0]);
  }

  return {};
};

const buildProfileForm = (profile: Record<string, unknown>): CustomerProfileForm => {
  const personalDetails = toRecord(profile.personalDetails);
  const applicantFinancialDetails = toRecord(profile.applicantFinancialDetails);
  const financialDetails = toRecord(profile.financialDetails);
  const policyDetails = toRecord(profile.policyDetails);
  const kycDetails = toRecord(profile.kycDetails);
  const contactDetails = toRecord(profile.contactDetails);
  const addressList = Array.isArray(profile.address) ? profile.address.map(toRecord) : [];
  const communicationAddress = addressList.find((item) => toText(item.type).toLowerCase() === "communication") ?? addressList[0] ?? {};
  const firstName = toText(personalDetails.firstName);
  const middleName = toText(personalDetails.middleName);
  const lastName = toText(personalDetails.lastName);
  const fullName = [toText(personalDetails.title), firstName, middleName, lastName].filter(Boolean).join(" ");

  return {
    productApplied: getFirstText(policyDetails, ["productName", "name"]),
    appliedSumAssured: toText(financialDetails.appliedSumAssured),
    lifeAssuredName: fullName,
    dob: formatDOB(toText(personalDetails.dob)),
    gender: mapGenderToDisplay(personalDetails.gender),
    maritalStatus: toText(personalDetails.maritalStatus),
    education: getFirstText(personalDetails, ["highestQualification", "education"]),
    occupation: getFirstText(applicantFinancialDetails, ["occupation", "occupationType"]) || toText(personalDetails.occupationType),
    designation: toText(personalDetails.designation),
    companyName: getFirstText(applicantFinancialDetails, ["organisationName", "companyName"]) || toText(personalDetails.orgName),
    earnedIncome: getFirstText(applicantFinancialDetails, ["annualIncome", "earnedIncome"]) || toText(personalDetails.netIncomeAmt),
    website: getFirstText(contactDetails, ["website"]) || toText(personalDetails.website),
    personalLinkedInProfile: toText(personalDetails.personalLinkedInProfile),
    pep: typeof personalDetails.isPEP === "boolean" ? (personalDetails.isPEP ? "Yes" : "No") : getFirstText(kycDetails, ["pep"]),
    criminalHistory: getFirstText(personalDetails, ["criminalProceeding", "criminalHistory"]) || getFirstText(kycDetails, ["criminalProceedings"]),
    location: [toText(communicationAddress.city), toText(communicationAddress.residingCountry)].filter(Boolean).join(", "),
    annualIncome: getFirstText(financialDetails, ["annualIncome"]) || getFirstText(applicantFinancialDetails, ["annualIncome"]),
    modalPremium: toText(policyDetails.modalPremium),
  };
};

const getProfileImage = (profile: Record<string, unknown>): string =>
  toText(toRecord(profile.personalDetails).profileImage);

const toMasterCustomerForm = (
  formData: CustomerProfileForm,
  optionMap: Partial<Record<keyof CustomerProfileForm, SelectOption[]>>,
): CustomerProfileForm => ({
  ...formData,
  ...Object.entries(optionMap).reduce<Partial<CustomerProfileForm>>((accumulator, [fieldName, options]) => {
    const formKey = fieldName as keyof CustomerProfileForm;
    accumulator[formKey] = toMasterKey(formData[formKey], options ?? []);
    return accumulator;
  }, {}),
});

const toDisplayCustomerDetails = (
  details: Partial<CustomerProfileForm>,
  optionMap: Partial<Record<keyof CustomerProfileForm, SelectOption[]>>,
): Partial<CustomerProfileForm> => ({
  ...details,
  ...Object.entries(optionMap).reduce<Partial<CustomerProfileForm>>((accumulator, [fieldName, options]) => {
    const formKey = fieldName as keyof CustomerProfileForm;
    const value = details[formKey];
    if (typeof value === "string") {
      accumulator[formKey] = toMasterLabel(value, options ?? []);
    }
    return accumulator;
  }, {}),
});

type CustomerProfileProps = {
  data?: unknown;
};

const CustomerProfile = ({ data: dataOverride }: CustomerProfileProps = {}) => {
  const dispatch = useAppDispatch();
  const { applicationNumber } = useAppContext();
  const storeData = useAppSelector(
    (state) => state.prelogin.data,
  );
  const masters = useAppSelector((state) => state.drs.masters);
  const data = dataOverride ?? storeData;
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formValues, setFormValues] = useState<CustomerProfileForm | null>(null);
  const [savedValues, setSavedValues] = useState<Partial<CustomerProfileForm> | null>(null);
  const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const profile = useMemo(() => getSummaryProfile(data), [data]);
  const sourceForm = useMemo(() => buildProfileForm(profile), [profile]);
  const displayProfile = useMemo(
    () => ({ ...sourceForm, ...(savedValues ?? {}) }),
    [savedValues, sourceForm],
  );
  const genderOptions = normalizeMasterOptions(masters.gender);
  const maritalStatusOptions = normalizeMasterOptions(masters.maritalStatus);
  const pepOptions = normalizeMasterOptions(masters.pep);
  const customerProfileMasterOptions = useMemo<Partial<Record<keyof CustomerProfileForm, SelectOption[]>>>(
    () => ({
      gender: genderOptions,
      maritalStatus: maritalStatusOptions,
      pep: pepOptions,
    }),
    [genderOptions, maritalStatusOptions, pepOptions],
  );
  const formFields = useMemo(
    () => getFormFields({ genderOptions, maritalStatusOptions, pepOptions }),
    [genderOptions, maritalStatusOptions, pepOptions],
  );
  const profileImage = getProfileImage(profile);
  const detailItems: DetailItem[] = [
    { label: "Marital Status", value: displayProfile.maritalStatus },
    { label: "Location", value: displayProfile.location },
    { label: "Occupation", value: displayProfile.occupation },
    { label: "Annual Income", value: formatCurrency(displayProfile.annualIncome) },
    { label: "Applied SA", value: formatCurrency(displayProfile.appliedSumAssured) },
    { label: "Modal Premium", value: formatCurrency(displayProfile.modalPremium) },
    { label: "Product", value: displayProfile.productApplied },
    { label: "Education", value: displayProfile.education },
    { label: "Designation", value: displayProfile.designation },
    { label: "Company Name", value: displayProfile.companyName },
    { label: "Personal LinkedIn Profile", value: displayProfile.personalLinkedInProfile },
    { label: "Website", value: displayProfile.website },
    { label: "PEP", value: displayProfile.pep },
    { label: "Criminal History", value: displayProfile.criminalHistory },
  ];

  const handleEditOpen = () => {
    setFormValues(toMasterCustomerForm(displayProfile, customerProfileMasterOptions));
    setSubmitStatus(null);
    setIsEditOpen(true);
  };

  const handleChange = (name: keyof CustomerProfileForm, value: string) => {
    setFormValues((current) => ({ ...(current ?? displayProfile), [name]: value }));
  };

  const handleClose = () => {
    if (!isSaving) {
      setIsEditOpen(false);
    }
  };

  const handleSave = async () => {
    const nextValues = formValues ?? toMasterCustomerForm(displayProfile, customerProfileMasterOptions);
    const roleType = localStorage.getItem("roleType") ?? "";
    const userId = localStorage.getItem("userId") ?? localStorage.getItem("username") ?? "";

    setIsSaving(true);
    setSubmitStatus(null);

    try {
      const response = await dispatch(
        customerProfileSubmitThunk({
          applicationId: applicationNumber ?? "",
          roleType,
          userId,
          updatedDetails: nextValues,
        }),
      ).unwrap();

      setSavedValues(toDisplayCustomerDetails(response.updatedDetails ?? nextValues, customerProfileMasterOptions));
      setSubmitStatus({ type: "success", message: response.message || "Customer profile updated successfully" });
      setIsEditOpen(false);
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: typeof error === "string" ? error : "Unable to save customer profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!Object.keys(profile).length) {
    return null;
  }

  return (
    <Box sx={{ px: 1 }}>
      <CustomAccordion title="Customer Profile" defaultExpanded>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
          <IconButton
            aria-label="Edit customer profile"
            onClick={handleEditOpen}
            sx={{ color: "#9A2529", border: "1px solid #e7b6b8", width: 34, height: 34 }}
          >
            <EditIcon width={16} height={16} />
          </IconButton>
        </Box>

        {submitStatus && !isEditOpen && (
          <Alert severity={submitStatus.type} sx={{ mb: 1.5 }}>
            {submitStatus.message}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "96px minmax(0, 1fr)" },
            gap: 2.5,
            p: 2,
            borderRadius: "8px",
            backgroundColor: "#eaf1f5",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
            <Avatar src={profileImage} alt={displayProfile.lifeAssuredName} sx={{ width: 76, height: 76 }} />
            {displayProfile.pep !== "Yes" && (
              <Typography
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: "999px",
                  backgroundColor: "#43a047",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                }}
              >
                Green Case
              </Typography>
            )}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2,
                borderBottom: "1px solid #bdd1df",
                pb: 1.2,
                mb: 1.4,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: "18px", fontWeight: 800, color: "#1f2937" }}>
                  {displayProfile.lifeAssuredName || "-"}
                </Typography>
                <Typography sx={{ fontSize: "13px", color: "#4b5563" }}>
                  DOB: {formatDisplayDate(displayProfile.dob) || "-"}
                </Typography>
              </Box>
              <Typography
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "999px",
                  backgroundColor: "#fff",
                  color: "#063E6F",
                  fontSize: "13px",
                  fontWeight: 700,
                  border: "1px solid #c8d7e3",
                  whiteSpace: "nowrap",
                }}
              >
                {[displayProfile.gender, toText(toRecord(profile.personalDetails).age) ? `${toText(toRecord(profile.personalDetails).age)} Years` : ""]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, minmax(0, 1fr))" },
                gap: "14px 24px",
              }}
            >
              {detailItems.map((item) => (
                <Box key={item.label} sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: "12px", color: "#637381", mb: 0.25 }}>{item.label}</Typography>
                  <Typography sx={{ fontSize: "14px", color: "#111827", fontWeight: 700, overflowWrap: "anywhere" }}>
                    {item.value || "-"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <CustomDialog
          open={isEditOpen}
          onClose={handleClose}
          title="Edit Customer Profile"
          maxWidth="md"
          titleSx={modalTitleStyles}
          contentSx={{ pt: 1 }}
          actionsSx={{ justifyContent: "center", pb: 2.5 }}
          actions={
            <CustomButton onClick={handleSave} disabled={isSaving} sx={{ minWidth: 140, borderRadius: "999px" }}>
              {isSaving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Save"}
            </CustomButton>
          }
        >
          {submitStatus && isEditOpen && (
            <Alert severity={submitStatus.type} sx={{ mb: 2 }}>
              {submitStatus.message}
            </Alert>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
              gap: 1.5,
              p: 1.5,
              borderRadius: "8px",
              backgroundColor: "#f7f7f7",
            }}
          >
            {formFields.map((field) => (
              <Box key={field.name}>
                {field.type === "select" ? (
                  <CustomSelect
                    label={field.label}
                    value={toText(formValues?.[field.name])}
                    options={field.options ?? []}
                    onChange={(value) => handleChange(field.name, value)}
                  />
                ) : (
                  <>
                    <Typography sx={labelStyles}>{field.label}</Typography>
                    <CustomTextField
                      fullWidth
                      type={field.type === "date" ? "date" : "text"}
                      value={toText(formValues?.[field.name])}
                      onChange={(event) => handleChange(field.name, event.target.value)}
                      sx={{ backgroundColor: "#fff" }}
                    />
                  </>
                )}
              </Box>
            ))}
          </Box>
        </CustomDialog>
      </CustomAccordion>
    </Box>
  );
};

export default CustomerProfile;
