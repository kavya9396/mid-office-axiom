import {
  Box,
  CircularProgress,
  Divider,
  MenuItem,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
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
    pranNo?: string;
    identityProofType?: string;
    addressProof?: string;
    ageProof?: string;
  };
  address?: Address[];
};

type FormValues = {
  dob: string;
  gender: string;
  residentialStatus: string;
  panNumber: string;
  pranNumber: string;
  identityProof: string;
  ageProof: string;
  addressProof: string;
  communicationPincode: string;
  permanentPincode: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

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

const getActiveOptions = (
  options?: MasterOption[],
): MasterOption[] =>
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

    const masterValue = String(
      option.value ?? "",
    )
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
  pranNumber: "",
  identityProof: "",
  ageProof: "",
  addressProof: "",
  communicationPincode: "",
  permanentPincode: "",
};

const text = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

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
    dob: dateOnly(
      member.proposerSummary?.dob,
    ),

    gender: normalizeMasterValue(
      member.proposerSummary?.gender,
      masters?.gender,
    ),

    residentialStatus: normalizeMasterValue(
      member.proposerSummary?.residentStatus,
      masters?.resident_status,
    ),

    panNumber: text(
      member.kycDetails?.panNumber,
    ).toUpperCase(),

    pranNumber: text(
      member.kycDetails?.pranNo,
    ),

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

    communicationPincode: text(
      communication?.pinCode,
    ),

    permanentPincode: text(
      permanent?.pinCode,
    ),
  };
};


const extractSummary = (response: unknown): EditableMember[] => {
  const result = response as {
    data?: { data?: { summary?: EditableMember[] }; summary?: EditableMember[] };
    summary?: EditableMember[];
  };
  return result?.data?.data?.summary ?? result?.data?.summary ?? result?.summary ?? [];
};

const validate = (values: FormValues): FormErrors => {
  const errors: FormErrors = {};

  const labels: Record<keyof FormValues, string> = {
    dob: "DOB",
    gender: "Gender",
    residentialStatus: "Residential Status",
    panNumber: "PAN Number",
    pranNumber: "PRAN Number",
    identityProof: "Identity Proof",
    ageProof: "Age Proof",
    addressProof: "Address Proof",
    communicationPincode: "Comm. Pincode",
    permanentPincode: "Perm. Pincode",
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
      errors.communicationPincode =
        "Comm. Pincode must be exactly 6 digits";
    }
  }

  // Permanent Pincode validation
  const permanentPincode = values.permanentPincode.trim();

  if (permanentPincode) {
    if (!/^\d{6}$/.test(permanentPincode)) {
      errors.permanentPincode =
        "Perm. Pincode must be exactly 6 digits";
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
  const { applicationNumber } = useParams<{ applicationNumber: string }>();
  const roleType = localStorage.getItem("roleType") ?? "CVT_TASK";
  const userId = localStorage.getItem("username") ?? "";
  /*
   * MasterDataRoute reloads this shared slice after a browser refresh.
   * Do not read state.drs.masters here because that is not the slice
   * populated by the application-level master-data initializer.
   */
  const masters = useSelector((state: RootState) =>
    getApplicantProfileMasters(state.masterData),
  );
  console.log('masters', masters)
  const drsData = useSelector((state: RootState) => state.drs.data);
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
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
            sections: [
              "breDecision",
              "summary",
              "applicationOverview",
              "pivvSection",
              "requirementManagement",
              "decision",
              "quickLinks"
            ],
          }),
        ).unwrap();
        if (active) {
          const member =
            extractSummary(response)[memberIndex];

          setValues(
            mapMemberToForm(member, masters),
          );
        }
      } catch (error) {
        if (active) {
          setApiError(
            error instanceof Error ? error.message : "Unable to load applicant details",
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
  }, [
    applicationNumber,
    dispatch,
    memberIndex,
    open,
    masters,
  ]);
  const update = (field: keyof FormValues, value: string) => {
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
      field === "permanentPincode"
    ) {
      nextValue = value
        .replace(/\D/g, "")
        .slice(0, 6);
    }

    setValues((current) => ({
      ...current,
      [field]: nextValue,
    }));

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

        pinCode: formValues.communicationPincode.trim(),

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

      pranNo: formValues.pranNumber.trim(),

      identityProofType: formValues.identityProof,

      ageProof: formValues.ageProof,

      addressProof: formValues.addressProof,

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

  const handleSave = async () => {
    const nextErrors = validate(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    if (!drsData?.summary?.[memberIndex]) {
      showSnackbar("Unable to find applicant details", "error");
      return;
    }

    setLoading(true);
    setApiError("");

    try {
      const currentMember = drsData.summary[memberIndex];

      const updatedMember = createUpdatedMember(
        currentMember,
        values,
      );

      const updatedSummary = drsData.summary.map((member, index) =>
        index === memberIndex ? updatedMember : member,
      );

      const payload: ApplicantProfileSubmitRequest = {
        applicationNo: applicationNumber ?? "",
        roleType,
        sections: ["summary"],
        userId,
        data: {
          ...drsData,
          summary: updatedSummary,
        },
        isAccuity: true,
      };
      console.log('payload--------', payload)
      const response: ApplicantProfileSubmitResponse =
        await dispatch(
          applicantProfileSubmitThunk(payload),
        ).unwrap();

      console.log("Applicant profile save response:", response);

      if (response.success) {
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

      console.error("Applicant profile save error:", error);

      setApiError(errorMessage);

      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const field = (
    name: keyof FormValues,
    label: string,
    options?: MasterOption[],
    htmlInputProps?: React.InputHTMLAttributes<HTMLInputElement>,
  ) => {
    const activeOptions =
      getActiveOptions(options);

    const isDropdown =
      options !== undefined;

    return (
      <Box>
        <Typography sx={labelStyles}>
          {label}
        </Typography>

        <CustomTextField
          select={isDropdown}
          type={name === "dob" ? "date" : "text"}
          value={values[name]}
          onChange={(event) =>
            update(name, event.target.value)
          }
          error={Boolean(errors[name])}
          htmlInputProps={htmlInputProps}
          fullWidth
          size="small"
        >
          {activeOptions.map((option) => (
            <MenuItem
              key={option.code}
              value={option.code}
            >
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
            EDIT APPLICANT PROFILE
          </Typography>
        }
        actionsSx={{ justifyContent: "center", pb: 2 }}
        actions={
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
                  { maxLength: 10 }
                )}

                {field(
                  "pranNumber",
                  "PRAN Number",
                  undefined,
                  {
                    maxLength: 12,
                    inputMode: "numeric",
                  }
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
                  }
                )}

                {field(
                  "permanentPincode",
                  "Perm. Pincode",
                  undefined,
                  {
                    maxLength: 6,
                    inputMode: "numeric",
                  }
                )}
              </Box>
            </Box>
          </Box>
        )}
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
