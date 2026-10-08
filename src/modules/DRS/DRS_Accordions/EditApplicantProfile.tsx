import {
  Box,
  CircularProgress,
  Divider,
  MenuItem,
  Typography,
} from "@mui/material";
import { useEffect, useState, type InputHTMLAttributes } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import { drsThunk } from "../../../store/thunks/drsThunk";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import CustomButton from "../../../components/ui/Button/Button";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { labelStyles } from "../../../utils/styles";
import type { ApplicantProfileSubmitRequest } from "../../../types/drs.types";
import { applicantProfileSubmitThunk } from "../../../store/thunks/applicantProfileSubmitThunk";
import { useParams } from "react-router-dom";
import CustomSnackbar from "../../../components/ui/SnackBar/Snackbar";
type Address = {
  type?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressLine3?: string;
  state?: string;
  city?: string;
  country?: string;
  pinCode?: string;
};
type EditableMember = {
  memberType?: string;
  proposerSummary?: {
    dob?: string;
    gender?: string;
    residentStatus?: string;
  };
  kycDetails?: {
    panNumber?: string;
    panFlag?: string;
    pranNo?: string;
    identityProofType?: string;
    addressProof?: string;
    ageProof?: string;
    isPanValid?: string;
    aadharSeedingStatus?: string;
    nsdlDobMatching?: string;
    nsdlNameMatching?: string;
    immigrationStatus?: string;
    nsdlTab?: string;
    dobDocument?: string;
    genderDocument?: string;
    pincodeDocument?: string;
  };
  address?: Address[];
  contactDetails?: {
    mobileNo?: string;
    emailId?: string;
  };
};
type PanFlag = "Verified" | "Non-Verified";

type FormValues = {
  dob: string;
  gender: string;
  residentialStatus: string;
  panNumber: string;
  panFlag: PanFlag;
  pranNumber: string;
  identityProof: string;
  ageProof: string;
  addressProof: string;
  communicationPincode: string;
  permanentPincode: string;
  isPanValid: string;
  aadharSeedingStatus: string;
  nsdlDobMatching: string;
  nsdlNameMatching: string;
  immigrationStatus: string;
  nsdlTab: string;
  dobDocument: string;
  genderDocument: string;
  pincodeDocument: string;
  mobileNo: string;
  emailId: string;
  zipCode: string;
};
type FormErrors = Partial<Record<keyof FormValues, string>>;
type ChangedField = {
  field: keyof FormValues;
  label: string;
  oldValue: string;
  newValue: string;
};
const FIELD_LABELS: Record<keyof FormValues, string> = {
  dob: "DOB",
  gender: "Gender",
  residentialStatus: "Residential Status",
  panNumber: "PAN Number",
  panFlag: "PAN Flag",
  pranNumber: "PRAN Number",
  identityProof: "Identity Proof",
  ageProof: "Age Proof",
  addressProof: "Address Proof",
  communicationPincode: "Comm. Pincode",
  permanentPincode: "Perm. Pincode",
  isPanValid: "Is PAN Valid",
  aadharSeedingStatus: "Aadhar Seeding Status",
  nsdlDobMatching: "Is NSDL DOB Matching",
  nsdlNameMatching: "Is NSDL Name Matching",
  immigrationStatus: "Immigration Status",
  nsdlTab: "NSDL Tab",
  dobDocument: "DOB Document",
  genderDocument: "Gender Document",
  pincodeDocument: "Pincode Document",
  mobileNo: "Mobile No",
  emailId: "Email ID",
  zipCode: "Zip Code",
};
interface EditApplicantProfileProps {
  open: boolean;
  memberIndex: number;
  onClose: () => void;
  onSave?: (
    values: FormValues,
    memberIndex: number,
  ) => void | Promise<void>;
}
type MasterOption = {
  code: string;
  description: string;
  value?: string | null;
  isActive?: string;
  hasExpiry?: string;
};
type ApplicantProfileMasters = {
  gender?: MasterOption[];
  resident_status?: MasterOption[];
  id_proof_type?: MasterOption[];
};
type ApplicantProfileMasterState = ApplicantProfileMasters & {
  payload?: unknown;
  result?: unknown;
  data?: ApplicantProfileMasters & {
    data?: ApplicantProfileMasters & {
      data?: ApplicantProfileMasters;
    };
  };
};
const EMPTY_APPLICANT_MASTERS: ApplicantProfileMasters = {};
const YES_NO_OPTIONS: MasterOption[] = [
  { code: "YES", description: "Yes" },
  { code: "NO", description: "No" },
];
const getApplicantProfileMasters = (
  value: unknown,
): ApplicantProfileMasters => {
  let current: unknown = value;
  // Different thunk/helper implementations keep the API response under
  // data, payload or result. Unwrap those containers until the master keys
  // from the API response are found.
  for (let depth = 0; depth < 5; depth += 1) {
    if (!current || typeof current !== "object" || Array.isArray(current)) {
      break;
    }
    const candidate = current as ApplicantProfileMasterState;
    if (
      Array.isArray(candidate.gender) ||
      Array.isArray(candidate.resident_status) ||
      Array.isArray(candidate.id_proof_type)
    ) {
      return candidate;
    }
    current = candidate.data ?? candidate.payload ?? candidate.result;
  }
  return EMPTY_APPLICANT_MASTERS;
};
type ApplicantProfileSubmitResponse = {
  success: boolean;
  message: string;
  updatedDetails?: Record<string, string>;
};
type ApiError = {
  message?: string;
  payload?: {
    message?: string;
  };
};
const getActiveOptions = (options?: MasterOption[]): MasterOption[] =>
  options?.filter(
    (option) =>
      option.isActive !== "N" &&
      Boolean(option.code) &&
      Boolean(option.description),
  ) ?? [];
const normalizeMasterValue = (
  value: unknown,
  options?: MasterOption[],
): string => {
  const normalizedValue = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!normalizedValue) {
    return "";
  }
  const matchedOption = options?.find((option) => {
    const code = option.code
      .trim()
      .toLowerCase();
    const description = option.description
      .trim()
      .toLowerCase();
    const masterValue = String(option.value ?? "")
      .trim()
      .toLowerCase();
    return (
      code === normalizedValue ||
      description === normalizedValue ||
      masterValue === normalizedValue
    );
  });
  return matchedOption?.code ?? String(value ?? "");
};
const EMPTY_FORM: FormValues = {
  dob: "",
  gender: "",
  residentialStatus: "",
  panNumber: "",
  panFlag: "Non-Verified",
  pranNumber: "",
  identityProof: "",
  ageProof: "",
  addressProof: "",
  communicationPincode: "",
  permanentPincode: "",
  isPanValid: "",
  aadharSeedingStatus: "",
  nsdlDobMatching: "",
  nsdlNameMatching: "",
  immigrationStatus: "",
  nsdlTab: "",
  dobDocument: "",
  genderDocument: "",
  pincodeDocument: "",
  mobileNo: "",
  emailId: "",
  zipCode: "",
};
const text = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);
// Prefer the dedicated API flag; support existing Is PAN Valid responses too.
const normalizePanFlag = (value: unknown): PanFlag => {
  const flag = text(value).trim().toLowerCase();
  return ["verified", "yes", "y", "true"].includes(flag)
    ? "Verified"
    : "Non-Verified";
};

const hasPanDetailsChanged = (
  current: FormValues,
  original: FormValues,
): boolean =>
  current.panNumber.trim().toUpperCase() !==
    original.panNumber.trim().toUpperCase() ||
  current.dob !== original.dob;

const dateOnly = (value?: string) => {
  const rawValue = value?.trim();
  if (!rawValue) return "";
  const isoMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
  const indianDateMatch = rawValue.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (indianDateMatch) {
    return `${indianDateMatch[3]}-${indianDateMatch[2]}-${indianDateMatch[1]}`;
  }
  return "";
};
const findAddress = (addresses: Address[] = [], type: string) =>
  addresses.find((address) =>
    address.type?.trim().toLowerCase().includes(type),
  );
const mapMemberToForm = (
  member: EditableMember | undefined,
  masters: ApplicantProfileMasters | undefined,
): FormValues => {
  if (!member) {
    return { ...EMPTY_FORM };
  }
  const communication = findAddress(
    member.address,
    "communication",
  );
  const permanent = findAddress(
    member.address,
    "permanent",
  );
  return {
    dob: dateOnly(member.proposerSummary?.dob),
    gender: normalizeMasterValue(
      member.proposerSummary?.gender,
      masters?.gender,
    ),
    residentialStatus: normalizeMasterValue(
      member.proposerSummary?.residentStatus,
      masters?.resident_status,
    ),
    panNumber: text(member.kycDetails?.panNumber).trim().toUpperCase(),
    panFlag: normalizePanFlag(
      member.kycDetails?.panFlag ?? member.kycDetails?.isPanValid,
    ),
    pranNumber: text(member.kycDetails?.pranNo),
    identityProof: normalizeMasterValue(
      member.kycDetails?.identityProofType,
      masters?.id_proof_type,
    ),
    ageProof: normalizeMasterValue(
      member.kycDetails?.ageProof,
      masters?.id_proof_type,
    ),
    addressProof: normalizeMasterValue(
      member.kycDetails?.addressProof,
      masters?.id_proof_type,
    ),
    communicationPincode: text(communication?.pinCode),
    permanentPincode: text(permanent?.pinCode),
    isPanValid: text(member.kycDetails?.isPanValid),
    aadharSeedingStatus: normalizeMasterValue(
      member.kycDetails?.aadharSeedingStatus,
      YES_NO_OPTIONS,
    ),
    nsdlDobMatching: normalizeMasterValue(
      member.kycDetails?.nsdlDobMatching,
      YES_NO_OPTIONS,
    ),
    nsdlNameMatching: normalizeMasterValue(
      member.kycDetails?.nsdlNameMatching,
      YES_NO_OPTIONS,
    ),
    immigrationStatus: text(member.kycDetails?.immigrationStatus),
    nsdlTab: text(member.kycDetails?.nsdlTab),
    dobDocument: text(member.kycDetails?.dobDocument),
    genderDocument: text(member.kycDetails?.genderDocument),
    pincodeDocument: text(member.kycDetails?.pincodeDocument),
    mobileNo: text(member.contactDetails?.mobileNo),
    emailId: text(member.contactDetails?.emailId),
    zipCode: text(communication?.pinCode),
  };
};
const extractSummary = (response: unknown): EditableMember[] => {
  const result = response as {
    data?: {
      data?: { summary?: EditableMember[] };
      summary?: EditableMember[];
    };
    summary?: EditableMember[];
  };
  return (
    result?.data?.data?.summary ??
    result?.data?.summary ??
    result?.summary ??
    []
  );
};
const validate = (values: FormValues, isDvtTaskRole = false): FormErrors => {
  const errors: FormErrors = {};
  if (isDvtTaskRole) {
    const dvtFields: Array<[keyof FormValues, string]> = [
      ["isPanValid", "Is PAN Valid"],
      ["aadharSeedingStatus", "Aadhar Seeding Status"],
      ["nsdlDobMatching", "Is NSDL DOB Matching"],
      ["nsdlNameMatching", "Is NSDL Name Matching"],
      ["immigrationStatus", "Immigration Status"],
      ["dobDocument", "DOB Document"],
      ["genderDocument", "Gender Document"],
      ["pincodeDocument", "Pincode Document"],
      ["dob", "Birthdate"],
      ["mobileNo", "Mobile No"],
      ["panNumber", "PAN No"],
      ["gender", "Gender"],
      ["emailId", "Email ID"],
      ["zipCode", "Zip Code"],
    ];
    dvtFields.forEach(([field, label]) => {
      if (!String(values[field] ?? "").trim()) {
        errors[field] = `${label} is required`;
      }
    });
    return errors;
  }
  const labels: Record<keyof FormValues, string> = {
    dob: "DOB",
    gender: "Gender",
    residentialStatus: "Residential Status",
    panNumber: "PAN Number",
    panFlag: "PAN Flag",
    pranNumber: "PRAN Number",
    identityProof: "Identity Proof",
    ageProof: "Age Proof",
    addressProof: "Address Proof",
    communicationPincode: "Comm. Pincode",
    permanentPincode: "Perm. Pincode",
    isPanValid: "Is PAN Valid",
    aadharSeedingStatus: "Aadhar Seeding Status",
    nsdlDobMatching: "Is NSDL DOB Matching",
    nsdlNameMatching: "Is NSDL Name Matching",
    immigrationStatus: "Immigration Status",
    nsdlTab: "NSDL Tab",
    dobDocument: "DOB Document",
    genderDocument: "Gender Document",
    pincodeDocument: "Pincode Document",
    mobileNo: "Mobile No",
    emailId: "Email ID",
    zipCode: "Zip Code",
  };
  // All fields are mandatory except PRAN number.
  const requiredFields: Array<keyof FormValues> = [
    "dob",
    "gender",
    "residentialStatus",
    "panNumber",
    "identityProof",
    "ageProof",
    "addressProof",
    "communicationPincode",
    "permanentPincode",
  ];
  // Required field validation
  requiredFields.forEach((field) => {
    const value = String(values[field] ?? "").trim();
    if (!value) {
      errors[field] = `${labels[field]} is required`;
    }
  });
  // Explicit dropdown validation
  const requiredDropdowns: Array<keyof FormValues> = [
    "gender",
    "residentialStatus",
    "identityProof",
    "ageProof",
    "addressProof",
  ];
  requiredDropdowns.forEach((field) => {
    const value = String(values[field] ?? "").trim();
    if (!value) {
      errors[field] = `Please select ${labels[field]}`;
    }
  });
  // DOB validation
  if (values.dob) {
    const dob = new Date(values.dob);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (Number.isNaN(dob.getTime())) {
      errors.dob = "Enter a valid DOB";
    } else if (dob > today) {
      errors.dob = "DOB cannot be in the future";
    }
  }
  // PAN validation
  const pan = values.panNumber.trim().toUpperCase();
  if (pan) {
    if (pan.length !== 10) {
      errors.panNumber = "PAN Number must be exactly 10 characters";
    } else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      errors.panNumber = "Enter a valid PAN Number";
    }
  }
  // PRAN validation
  // PRAN is optional.
  const pran = values.pranNumber.trim();
  if (pran && !/^\d{12}$/.test(pran)) {
    errors.pranNumber = "PRAN Number must be exactly 12 digits";
  }
  // Communication Pincode validation
  const communicationPincode = values.communicationPincode.trim();
  if (communicationPincode) {
    if (!/^\d{6}$/.test(communicationPincode)) {
      errors.communicationPincode = "Comm. Pincode must be exactly 6 digits";
    }
  }
  // Permanent Pincode validation
  const permanentPincode = values.permanentPincode.trim();
  if (permanentPincode) {
    if (!/^\d{6}$/.test(permanentPincode)) {
      errors.permanentPincode = "Perm. Pincode must be exactly 6 digits";
    }
  }
  return errors;
};
const EditApplicantProfile = ({
  open,
  memberIndex,
  onClose,
  onSave,
}: EditApplicantProfileProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    applicationNumber,
    businessType: routeBusinessType,
  } = useParams<{
    applicationNumber: string;
    businessType: string;
  }>();
  const roleType = localStorage.getItem("roleType") ?? "CVT_TASK";
  const userId = localStorage.getItem("username") ?? "";
  const businessType =
    String(
      routeBusinessType ?? localStorage.getItem("businessType") ?? "retail",
    )
      .trim()
      .toLowerCase() || "retail";
  const isDvtTaskRole = roleType.trim().toUpperCase() === "DVT_TASK";
  /*
   * MasterDataRoute reloads this shared slice after a browser refresh.
   * Do not read state.drs.masters here because that is not the slice
   * populated by the application-level master-data initializer.
   */
  const masters = useSelector((state: RootState) =>
    getApplicantProfileMasters(state.masterData),
  );
  console.log("masters", masters);
  const drsData = useSelector((state: RootState) => state.drs.data);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [originalValues, setOriginalValues] = useState<FormValues>(EMPTY_FORM);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [changedFields, setChangedFields] = useState<ChangedField[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "warning" | "info";
  }>({
    open: false,
    message: "",
    severity: "success",
  });
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "warning" | "info",
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };
  useEffect(() => {
    if (!open) return;
    let active = true;
    const loadProfile = async () => {
      setLoading(true);
      setApiError("");
      setErrors({});
      try {
        const roleType = localStorage.getItem("roleType") ?? "CVT_TASK";
        const userId = localStorage.getItem("userId") ?? "";
        const response = await dispatch(
          drsThunk({
            applicationNo: applicationNumber ?? "",
            userId,
            roleType,
            businessType,
            sections: [
              "breDecision",
              "summary",
              "applicationOverview",
              "pivvSection",
              "requirementManagement",
              "decision",
              "quickLinks",
            ],
          }),
        ).unwrap();
        if (active) {
          const member = extractSummary(response)[memberIndex];
          const mappedValues = mapMemberToForm(member, masters);
          setValues(mappedValues);
          setOriginalValues(mappedValues);
          setChangedFields([]);
          setReviewOpen(false);
        }
      } catch (error) {
        if (active) {
          setApiError(
            error instanceof Error
              ? error.message
              : "Unable to load applicant details",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadProfile();
    return () => {
      active = false;
    };
  }, [applicationNumber, dispatch, memberIndex, open, masters, businessType]);
  const isRevalidatePanDisabled =
    loading ||
    Boolean(apiError) ||
    (values.panFlag === "Verified" &&
      !hasPanDetailsChanged(values, originalValues));

  const update = (field: keyof FormValues, value: string) => {
    // PAN Flag is controlled by verification status, never by user input.
    if (field === "panFlag") return;
    let nextValue = value;
    if (field === "panNumber") {
      nextValue = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10);
    }
    if (field === "pranNumber") {
      nextValue = value
        .replace(/\D/g, "")
        .slice(0, 12);
    }
    if (
      field === "communicationPincode" ||
      field === "permanentPincode" ||
      field === "zipCode"
    ) {
      nextValue = value
        .replace(/\D/g, "")
        .slice(0, 6);
    }
    if (field === "mobileNo") {
      nextValue = value.replace(/\D/g, "").slice(0, 10);
    }
    setValues((current) => {
      const nextValues = { ...current, [field]: nextValue };
      if (field === "panNumber" || field === "dob") {
        // Edits invalidate verification. Reverting both values restores
        // the status received for the original PAN/DOB combination.
        nextValues.panFlag = hasPanDetailsChanged(nextValues, originalValues)
          ? "Non-Verified"
          : originalValues.panFlag;
      }
      return nextValues;
    });
    // Clear the current field's error as soon as the user changes it.
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }
      const nextErrors = { ...current };
      delete nextErrors[field];
      return nextErrors;
    });
  };
  const createUpdatedMember = (
    member: EditableMember,
    formValues: FormValues,
  ): EditableMember => {
    const existingAddresses = member.address ?? [];
    const updatedAddresses = existingAddresses.map((address) => {
      const addressType = address.type?.trim().toLowerCase();
      if (addressType === "communication") {
        return {
          ...address,
          pinCode:
            formValues.zipCode.trim() || formValues.communicationPincode.trim(),
        };
      }
      if (addressType === "permanent") {
        return {
          ...address,
          pinCode: formValues.permanentPincode.trim(),
        };
      }
      return address;
    });
    return {
      ...member,
      proposerSummary: {
        ...member.proposerSummary,
        dob: formValues.dob,
        gender: formValues.gender,
        residentStatus: formValues.residentialStatus,
      },
      kycDetails: {
        ...member.kycDetails,
        panNumber: formValues.panNumber.trim().toUpperCase(),
        panFlag: formValues.panFlag,
        pranNo: formValues.pranNumber.trim(),
        identityProofType: formValues.identityProof,
        ageProof: formValues.ageProof,
        addressProof: formValues.addressProof,
        isPanValid: formValues.isPanValid,
        aadharSeedingStatus: formValues.aadharSeedingStatus,
        nsdlDobMatching: formValues.nsdlDobMatching,
        nsdlNameMatching: formValues.nsdlNameMatching,
        immigrationStatus: formValues.immigrationStatus,
        nsdlTab: formValues.nsdlTab,
        dobDocument: formValues.dobDocument,
        genderDocument: formValues.genderDocument,
        pincodeDocument: formValues.pincodeDocument,
      },
      contactDetails: {
        ...member.contactDetails,
        mobileNo: formValues.mobileNo.trim(),
        emailId: formValues.emailId.trim(),
      },
      address: updatedAddresses,
    };
  };
  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "object" && error !== null) {
      const apiError = error as ApiError;
      return (
        apiError.payload?.message ||
        apiError.message ||
        "Unable to save applicant details"
      );
    }
    return "Unable to save applicant details";
  };
  const normalizeForCompare = (value: string) => value.trim();
  const getOptionDescription = (
    fieldName: keyof FormValues,
    value: string,
  ): string => {
    if (!value) return "-";
    const optionSets: Partial<Record<keyof FormValues, MasterOption[]>> = {
      gender: masters.gender ?? [],
      residentialStatus: masters.resident_status ?? [],
      identityProof: masters.id_proof_type ?? [],
      ageProof: masters.id_proof_type ?? [],
      addressProof: masters.id_proof_type ?? [],
      dobDocument: masters.id_proof_type ?? [],
      genderDocument: masters.id_proof_type ?? [],
      pincodeDocument: masters.id_proof_type ?? [],
      immigrationStatus: masters.resident_status ?? [],
      isPanValid: YES_NO_OPTIONS,
      aadharSeedingStatus: YES_NO_OPTIONS,
      nsdlDobMatching: YES_NO_OPTIONS,
      nsdlNameMatching: YES_NO_OPTIONS,
    };
    const matched = optionSets[fieldName]?.find(
      (option) =>
        option.code === value ||
        option.description?.trim().toLowerCase() === value.trim().toLowerCase(),
    );
    return matched?.description ?? value;
  };
  const buildChangedFields = (): ChangedField[] =>
    (Object.keys(values) as Array<keyof FormValues>)
      .filter(
        (fieldName) =>
          normalizeForCompare(originalValues[fieldName]) !==
          normalizeForCompare(values[fieldName]),
      )
      .map((fieldName) => ({
        field: fieldName,
        label: FIELD_LABELS[fieldName],
        oldValue: getOptionDescription(fieldName, originalValues[fieldName]),
        newValue: getOptionDescription(fieldName, values[fieldName]),
      }));
  const saveApplicantProfile = async () => {
    if (!drsData?.summary?.[memberIndex]) {
      showSnackbar("Unable to find applicant details", "error");
      return;
    }
    setLoading(true);
    setApiError("");
    try {
      const currentMember = drsData.summary[memberIndex];
      const updatedMember = createUpdatedMember(currentMember, values);
      const updatedSummary = drsData.summary.map((member, index) =>
        index === memberIndex ? updatedMember : member,
      );
      const payload: ApplicantProfileSubmitRequest & {
        businessType: string;
      } = {
        applicationNo: applicationNumber ?? "",
        roleType,
        sections: ["summary"],
        userId,
        businessType,
        data: {
          ...drsData,
          summary: updatedSummary,
        },
        isAccuity: true,
      };
      const response: ApplicantProfileSubmitResponse = await dispatch(
        applicantProfileSubmitThunk(payload),
      ).unwrap();
      if (response.success) {
        setReviewOpen(false);
        setOriginalValues({ ...values });
        setChangedFields([]);
        showSnackbar(
          response.message || "Applicant profile updated successfully",
          "success",
        );
        await onSave?.(values, memberIndex);
        onClose();
      } else {
        showSnackbar(
          response.message || "Unable to update applicant profile",
          "error",
        );
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error);
      setApiError(errorMessage);
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };
  const handleSave = () => {
    const nextErrors = validate(values, isDvtTaskRole);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const changes = buildChangedFields();
    if (changes.length === 0) {
      showSnackbar("No changes found to save", "info");
      return;
    }
    setChangedFields(changes);
    setReviewOpen(true);
  };
  const handleRevalidatePan = () => {
    if (isRevalidatePanDisabled) return;
    const pan = values.panNumber.trim().toUpperCase();
    if (!pan) {
      setErrors((current) => ({
        ...current,
        panNumber: "PAN Number is required",
      }));
      showSnackbar("Please enter PAN Number before revalidation", "warning");
      return;
    }
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      setErrors((current) => ({
        ...current,
        panNumber: "Enter a valid PAN Number",
      }));
      showSnackbar("Please enter a valid PAN Number", "warning");
      return;
    }
    setErrors((current) => {
      if (!current.panNumber) return current;
      const nextErrors = { ...current };
      delete nextErrors.panNumber;
      return nextErrors;
    });
    // Keep PAN revalidation separate from the normal Save flow.
    // Replace this block with the PAN revalidation API dispatch when available.
    showSnackbar("PAN is ready for revalidation", "info");
  };
  const field = (
    name: keyof FormValues,
    label: string,
    options?: MasterOption[],
    htmlInputProps?: InputHTMLAttributes<HTMLInputElement>,
  ) => {
    const activeOptions = getActiveOptions(options);
    const isDropdown = options !== undefined;
    return (
      <Box>
        <Typography sx={labelStyles}>{label}</Typography>
        <CustomTextField
          disabled={name === "panFlag"}
          select={isDropdown}
          type={name === "dob" ? "date" : "text"}
          value={values[name]}
          onChange={(event) => update(name, event.target.value)}
          error={Boolean(errors[name])}
          htmlInputProps={htmlInputProps}
          fullWidth
          size="small"
        >
          {activeOptions.map((option) => (
            <MenuItem key={option.code} value={option.code}>
              {option.description}
            </MenuItem>
          ))}
        </CustomTextField>
        {errors[name] && (
          <Typography
            sx={{
              color: "#d32f2f",
              fontSize: "12px",
              mt: 0.5,
            }}
          >
            {errors[name]}
          </Typography>
        )}
      </Box>
    );
  };
  return (
    <>
      <CustomDialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        title={
          <Typography
            sx={{
              color: "#9A2529",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {isDvtTaskRole ? "EDIT MEMBER PROFILE" : "EDIT APPLICANT PROFILE"}
          </Typography>
        }
        actionsSx={{ justifyContent: "center", pb: 2 }}
        actions={
          <>
            <CustomButton
              type="button"
              variant="outlined"
              onClick={handleRevalidatePan}
              disabled={isRevalidatePanDisabled}
              sx={{
                px: 4,
                borderRadius: "50px",
              }}
            >
              Revalidate PAN
            </CustomButton>
            <CustomButton
              onClick={handleSave}
              disabled={loading || Boolean(apiError)}
              sx={{
                px: 4,
                borderRadius: "50px",
              }}
            >
              {loading ? "Saving..." : "Save"}
            </CustomButton>
          </>
        }
      >
        {loading ? (
          <Box sx={{ minHeight: 300, display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              backgroundColor: "#F6F6F6",
              borderRadius: 2,
              p: 2,
            }}
          >
            {isDvtTaskRole ? (
              <Box>
                <Typography
                  sx={{
                    color: "#444",
                    fontSize: "14px",
                    fontWeight: 700,
                    mb: 1,
                  }}
                >
                  PAN, NSDL &amp; Document Details
                </Typography>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                    gap: 1,
                  }}
                >
                  {field(
                    "dobDocument",
                    "DOB Document",
                    masters.id_proof_type ?? [],
                  )}
                  {field(
                    "genderDocument",
                    "Gender Document",
                    masters.id_proof_type ?? [],
                  )}
                  {field(
                    "pincodeDocument",
                    "Pincode Document",
                    masters.id_proof_type ?? [],
                  )}
                  {field("dob", "Birthdate", undefined, {
                    max: new Date().toISOString().split("T")[0],
                  })}
                  {field("gender", "Gender", masters.gender ?? [])}
                  {field("zipCode", "Zip Code", undefined, {
                    maxLength: 6,
                    inputMode: "numeric",
                  })}
                  {field("mobileNo", "Mobile No", undefined, {
                    maxLength: 10,
                    inputMode: "numeric",
                  })}
                  {field("emailId", "Email ID", undefined)}
                  {field(
                    "immigrationStatus",
                    "Immigration Status",
                    masters.resident_status ?? [],
                  )}
                  {field("panNumber", "PAN No", undefined, { maxLength: 10 })}
                  {field("panFlag", "PAN Flag")}
                  {field("isPanValid", "Is PAN Valid?", YES_NO_OPTIONS)}
                  {field(
                    "aadharSeedingStatus",
                    "Aadhar Seeding Status?",
                    YES_NO_OPTIONS,
                  )}
                  {field(
                    "nsdlNameMatching",
                    "Is NSDL Name Matching?",
                    YES_NO_OPTIONS,
                  )}
                  {field(
                    "nsdlDobMatching",
                    "Is NSDL DOB Matching?",
                    YES_NO_OPTIONS,
                  )}
                  <Box sx={{ display: "flex", alignItems: "end" }}>
                    <CustomButton
                      type="button"
                      variant="outlined"
                      onClick={() => update("nsdlTab", "Y")}
                      sx={{ minWidth: 64, height: 36 }}
                    >
                      NSDL
                    </CustomButton>
                  </Box>
                </Box>
              </Box>
            ) : (
              <>
                <Box>
                  <Typography
                    sx={{
                      color: "#444",
                      fontSize: "14px",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    Personal &amp; KYC
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(3, 1fr)",
                      },
                      gap: 1,
                    }}
                  >
                    {field("dob", "DOB", undefined, {
                      max: new Date().toISOString().split("T")[0],
                    })}
                    {field(
                      "gender",
                      "Gender",
                      masters.gender ?? [],
                    )}
                    {field(
                      "residentialStatus",
                      "Residential Status",
                      masters.resident_status ?? [],
                    )}
                    {field(
                      "panNumber",
                      "PAN Number",
                      undefined,
                      { maxLength: 10 },
                    )}
                    {field("panFlag", "PAN Flag")}
                    {field(
                      "pranNumber",
                      "PRAN Number",
                      undefined,
                      {
                        maxLength: 12,
                        inputMode: "numeric",
                      },
                    )}
                    {field(
                      "identityProof",
                      "Identity Proof",
                      masters.id_proof_type ?? [],
                    )}
                    {field(
                      "ageProof",
                      "Age Proof",
                      masters.id_proof_type ?? [],
                    )}
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography
                    sx={{
                      color: "#444",
                      fontSize: "14px",
                      fontWeight: 700,
                      mb: 1,
                    }}
                  >
                    Contact &amp; Address
                  </Typography>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: "repeat(3, 1fr)",
                      },
                      gap: 2,
                    }}
                  >
                    {field(
                      "addressProof",
                      "Address Proof",
                      masters.id_proof_type ?? [],
                    )}
                    {field(
                      "communicationPincode",
                      "Comm. Pincode",
                      undefined,
                      {
                        maxLength: 6,
                        inputMode: "numeric",
                      },
                    )}
                    {field(
                      "permanentPincode",
                      "Perm. Pincode",
                      undefined,
                      {
                        maxLength: 6,
                        inputMode: "numeric",
                      },
                    )}
                  </Box>
                </Box>
              </>
            )}
          </Box>
        )}
      </CustomDialog>
      <CustomDialog
        open={reviewOpen}
        onClose={() => !loading && setReviewOpen(false)}
        maxWidth="md"
        title={
          <Typography sx={{ color: "#9A2529", fontSize: 14, fontWeight: 700 }}>
            REVIEW CHANGES - OLD VALUE VS NEW VALUE
          </Typography>
        }
        actionsSx={{ justifyContent: "center", pb: 2 }}
        actions={
          <>
            <CustomButton
              variant="outlined"
              onClick={() => setReviewOpen(false)}
              disabled={loading}
              sx={{ px: 4, borderRadius: "50px" }}
            >
              Back to Edit
            </CustomButton>
            <CustomButton
              onClick={() => void saveApplicantProfile()}
              disabled={loading}
              sx={{ px: 4, borderRadius: "50px" }}
            >
              {loading ? "Saving..." : "Confirm & Save"}
            </CustomButton>
          </>
        }
      >
        <Box sx={{ p: 1 }}>
          <Typography sx={{ fontSize: 13, color: "#555", mb: 1.5 }}>
            Please review the changed fields before saving the case.
          </Typography>
          <Box
            sx={{
              border: "1px solid #E0E0E0",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr",
                backgroundColor: "#F3F3F3",
                borderBottom: "1px solid #E0E0E0",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              <Box sx={{ p: 1.25 }}>Field</Box>
              <Box sx={{ p: 1.25 }}>Old Value</Box>
              <Box sx={{ p: 1.25 }}>New Value</Box>
            </Box>
            {changedFields.map((change, index) => (
              <Box
                key={change.field}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1fr 1fr",
                  borderBottom:
                    index === changedFields.length - 1
                      ? "none"
                      : "1px solid #EEEEEE",
                  fontSize: 13,
                  alignItems: "start",
                }}
              >
                <Box sx={{ p: 1.25, fontWeight: 600 }}>{change.label}</Box>
                <Box sx={{ p: 1.25, wordBreak: "break-word" }}>
                  {change.oldValue || "-"}
                </Box>
                <Box
                  sx={{
                    p: 1.25,
                    wordBreak: "break-word",
                    fontWeight: 600,
                    color: "#237A3B",
                  }}
                >
                  {change.newValue || "-"}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </CustomDialog>
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() =>
          setSnackbar((current) => ({
            ...current,
            open: false,
          }))
        }
      />
    </>
  );
};
export type { FormValues as EditApplicantProfileValues };
export default EditApplicantProfile;
