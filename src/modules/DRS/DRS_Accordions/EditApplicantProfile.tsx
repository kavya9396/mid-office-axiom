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
  code?: string;
  description?: string;
  value?: string | null;
  isActive?: string;
  hasExpiry?: string;
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

const getDropdownOptions = (options?: MasterOption[]) =>
  options
    ?.filter((item) => item.isActive === "Y")
    .map((item) => item.description)
    .filter((description): description is string => Boolean(description)) ?? [];

const getOptionCode = (
  options: MasterOption[] | undefined,
  description: string,
) =>
  options?.find(
    (item) =>
      item.description?.trim().toLowerCase() ===
      description.trim().toLowerCase(),
  )?.code ?? "";

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

const dateOnly = (value?: string) => (value ? value.split("T")[0] : "");

const findAddress = (addresses: Address[] = [], type: string) =>
  addresses.find((address) => address.type?.trim().toLowerCase() === type);

const mapMemberToForm = (member?: EditableMember): FormValues => {
  if (!member) return EMPTY_FORM;

  const communication = findAddress(member.address, "communication");
  const permanent = findAddress(member.address, "permanent");

  return {
    dob: dateOnly(member.proposerSummary?.dob),
    gender: text(member.proposerSummary?.gender),
    residentialStatus: text(member.proposerSummary?.residentStatus),
    panNumber: text(member.kycDetails?.panNumber).toUpperCase(),
    pranNumber: text(member.kycDetails?.pranNo),
    identityProof: text(member.kycDetails?.identityProofType),
    ageProof: text(member.kycDetails?.ageProof),
    addressProof: text(member.kycDetails?.addressProof),
    communicationPincode: text(communication?.pinCode),
    permanentPincode: text(permanent?.pinCode),
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
  const masters = useSelector((state: RootState) => state.drs.masters);
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
            sections: ["summary"],
          }),
        ).unwrap();
        if (active) setValues(mapMemberToForm(extractSummary(response)[memberIndex]));
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
  }, [applicationNumber, dispatch, memberIndex, open]);

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
    return {
      ...member,

      proposerSummary: {
        ...member.proposerSummary,
        dob: formValues.dob,
        gender: getOptionCode(masters?.gender, formValues.gender),
        residentStatus: getOptionCode(
          masters?.resident_status,
          formValues.residentialStatus,
        ),
      },

      kycDetails: {
        ...member.kycDetails,
        panNumber: formValues.panNumber.trim().toUpperCase(),
        pranNo: formValues.pranNumber.trim(),
        identityProofType: getOptionCode(
          masters?.idProof,
          formValues.identityProof,
        ),
        ageProof: getOptionCode(
          masters?.idProof,
          formValues.ageProof,
        ),
        addressProof: getOptionCode(
          masters?.addressProof,
          formValues.addressProof,
        ),
      },

      address: member.address?.map((address) => {
        const type = address.type?.trim().toLowerCase();

        if (type === "communication") {
          return {
            ...address,
            pinCode: formValues.communicationPincode.trim(),
          };
        }

        if (type === "permanent") {
          return {
            ...address,
            pinCode: formValues.permanentPincode.trim(),
          };
        }

        return address;
      }),
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
        isAcuity: true,
      };

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
    options?: string[],
    htmlInputProps?: React.InputHTMLAttributes<HTMLInputElement>,
  ) => (
    <Box>
      <Typography sx={labelStyles}>{label}</Typography>

      <CustomTextField
        select={Boolean(options)}
        type={name === "dob" ? "date" : "text"}
        value={values[name]}
        onChange={(event) => update(name, event.target.value)}
        error={Boolean(errors[name])}
        htmlInputProps={htmlInputProps}
        fullWidth
        size="small"
      >
        {options?.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
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
                  getDropdownOptions(masters?.gender),
                )}

                {field(
                  "residentialStatus",
                  "Residential Status",
                  getDropdownOptions(masters?.resident_status),
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
                  getDropdownOptions(masters?.idProof),
                )}

                {field(
                  "ageProof",
                  "Age Proof",
                  getDropdownOptions(masters?.idProof),
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
                  getDropdownOptions(masters?.addressProof),
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
