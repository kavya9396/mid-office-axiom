import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import type { AppDispatch } from "../../../store/store";
import { drsThunk } from "../../../store/thunks/drsThunk";
import { CloseIcon } from "../../../icons/Icons";

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
    immigrationStatus?: string;
  };
  applicantDetails?: {
    dateOfBirth?: string;
    gender?: string;
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
  applicationNumber: string;
  memberIndex: number;
  onClose: () => void;
  onSave?: (values: FormValues, memberIndex: number) => void;
}

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
    dob: dateOnly(
      member.proposerSummary?.dob || member.applicantDetails?.dateOfBirth,
    ),
    gender: text(
      member.proposerSummary?.gender || member.applicantDetails?.gender,
    ),
    residentialStatus: text(
      member.proposerSummary?.immigrationStatus ||
        member.proposerSummary?.residentStatus,
    ),
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
  const required: Array<keyof FormValues> = [
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
  required.forEach((field) => {
    if (!values[field].trim()) errors[field] = "This field is required";
  });

  if (values.dob && new Date(values.dob) > new Date()) {
    errors.dob = "Date of birth cannot be in the future";
  }
  if (values.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(values.panNumber)) {
    errors.panNumber = "Enter a valid PAN number";
  }
  if (values.pranNumber && !/^\d{12}$/.test(values.pranNumber)) {
    errors.pranNumber = "PRAN number must contain 12 digits";
  }
  if (values.communicationPincode && !/^\d{6}$/.test(values.communicationPincode)) {
    errors.communicationPincode = "Pincode must contain 6 digits";
  }
  if (values.permanentPincode && !/^\d{6}$/.test(values.permanentPincode)) {
    errors.permanentPincode = "Pincode must contain 6 digits";
  }
  return errors;
};

const EditApplicantProfile = ({
  open,
  applicationNumber,
  memberIndex,
  onClose,
  onSave,
}: EditApplicantProfileProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [values, setValues] = useState<FormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

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
            applicationNo: applicationNumber,
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
    const nextValue = field === "panNumber" ? value.toUpperCase() : value;
    setValues((current) => ({ ...current, [field]: nextValue }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSave = () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSave?.(values, memberIndex);
    onClose();
  };

  const field = (
    name: keyof FormValues,
    label: string,
    options?: string[],
    inputProps?: Record<string, unknown>,
  ) => (
    <TextField
      select={Boolean(options)}
      type={name === "dob" ? "date" : "text"}
      label={label}
      value={values[name]}
      onChange={(event) => update(name, event.target.value)}
      error={Boolean(errors[name])}
      helperText={errors[name] ?? " "}
      InputLabelProps={name === "dob" ? { shrink: true } : undefined}
      inputProps={inputProps}
      fullWidth
      size="small"
    >
      {options?.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography sx={{ color: "#06447D", fontSize: 14, fontWeight: 700 }}>
            EDIT APPLICANT PROFILE
          </Typography>
          <IconButton onClick={onClose} aria-label="Close edit applicant profile">
            <CloseIcon sx={{ color: "#06447D" }} />
          </IconButton>
        </Box>

        {loading ? (
          <Box sx={{ minHeight: 300, display: "grid", placeItems: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ borderRadius: 2, backgroundColor: "#F6F6F6" }}>
            {apiError && <Typography color="error" sx={{ mb: 2 }}>{apiError}</Typography>}
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 2 }}>Personal &amp; KYC</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
              {field("dob", "DOB")}
              {field("gender", "Gender", ["Male", "Female", "Other"])}
              {field("residentialStatus", "Residential Status", ["Indian Resident", "Non Resident Indian", "Foreign National"])}
              {field("panNumber", "PAN Number", undefined, { maxLength: 10 })}
              {field("pranNumber", "PRAN Number", undefined, { maxLength: 12, inputMode: "numeric" })}
              {field("identityProof", "Identity Proof", ["Aadhaar", "Adhr", "PAN", "Passport", "Voter ID"])}
              {field("ageProof", "Age Proof", ["Aadhaar", "Adhr", "PAN", "Passport", "Birth Certificate"])}
            </Box>

            <Box sx={{ borderTop: "1px solid #D1D1D1", my: 2 }} />
            <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 2 }}>Contact &amp; Address</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
              {field("addressProof", "Address Proof", ["Aadhaar", "Adhr", "Passport", "Voter ID"])}
              {field("communicationPincode", "Comm. Pincode", undefined, { maxLength: 6, inputMode: "numeric" })}
              {field("permanentPincode", "Perm. Pincode", undefined, { maxLength: 6, inputMode: "numeric" })}
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading || Boolean(apiError)}
            sx={{ minWidth: 168, borderRadius: 5, backgroundColor: "#A92129", textTransform: "none" }}
          >
            Save
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export type { FormValues as EditApplicantProfileValues };
export default EditApplicantProfile;
