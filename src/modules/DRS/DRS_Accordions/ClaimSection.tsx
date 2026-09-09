import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { Column } from "../../../components/ui/Table/Table";
import CustomButton from "../../../components/ui/Button/Button";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import CustomTable from "../../../components/ui/Table/Table";
import CustomTextField from "../../../components/ui/TextField/TextField";
import type { RootState } from "../../../store/store";

type ClaimRow = {
  policyNumber: string;
  productCode: string;
  claimKey: string;
  canonicalId: string;
  patientName: string;
  ailmentForCommunication: string;
  claimType: string;
  subType: string;
  intimationDate: string;
  doa: string;
  dod: string;
  decisionStatus: string;
};

type AddClaimForm = ClaimRow;

const claimsColumns: Column<ClaimRow>[] = [
  {
    key: "policyNumber",
    header: "Policy Number",
    width: "12%",
    render: (value) => (
      <Typography
        sx={{
          color: "#004A80",
          textDecoration: "underline",
          fontSize: "12px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        {String(value || "-")}
      </Typography>
    ),
  },
  { key: "productCode", header: "Product Code", width: "8%" },
  { key: "claimKey", header: "Claim Key", width: "10%" },
  { key: "canonicalId", header: "Canonical ID", width: "12%" },
  { key: "patientName", header: "Patient Name", width: "12%" },
  { key: "ailmentForCommunication", header: "Ailment For Communication", width: "20%" },
  { key: "claimType", header: "Claim Type", width: "10%" },
  { key: "subType", header: "Sub Type", width: "8%" },
  { key: "intimationDate", header: "Intimation Date", width: "11%" },
  { key: "doa", header: "DOA", width: "10%" },
  { key: "dod", header: "DOD", width: "10%" },
  { key: "decisionStatus", header: "Decision Status", width: "11%" },
];

const SAMPLE_CLAIM_ROWS: ClaimRow[] = [
  {
    policyNumber: "POL12345678",
    productCode: "AG",
    claimKey: "CLM1001",
    canonicalId: "CANON001",
    patientName: "Rudra Sangha",
    ailmentForCommunication: "Cardiac evaluation",
    claimType: "Health",
    subType: "Hospitalisation",
    intimationDate: "2026-07-01",
    doa: "2026-07-02",
    dod: "2026-07-05",
    decisionStatus: "Approved",
  },
  {
    policyNumber: "POL98765432",
    productCode: "IP",
    claimKey: "CLM1002",
    canonicalId: "CANON002",
    patientName: "Kavya Mehta",
    ailmentForCommunication: "Dengue fever",
    claimType: "Reimbursement",
    subType: "Medical",
    intimationDate: "2026-08-10",
    doa: "2026-08-11",
    dod: "2026-08-16",
    decisionStatus: "Under Review",
  },
];

const DEFAULT_CLAIM_FORM: AddClaimForm = {
  policyNumber: "",
  productCode: "",
  claimKey: "",
  canonicalId: "",
  patientName: "",
  ailmentForCommunication: "",
  claimType: "",
  subType: "",
  intimationDate: "",
  doa: "",
  dod: "",
  decisionStatus: "",
};
// const DEFAULT_CLAIM_FORM: AddClaimForm = {
//   policyNumber: "POL45678901",
//   productCode: "ULIP",
//   claimKey: "CLM1003",
//   canonicalId: "CANON003",
//   patientName: "Aarav Shah",
//   ailmentForCommunication: "Accidental injury",
//   claimType: "Cashless",
//   subType: "Accident",
//   intimationDate: "2026-09-01",
//   doa: "2026-09-02",
//   dod: "2026-09-06",
//   decisionStatus: "Pending",
// };

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
};

const toText = (value: unknown): string => {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
};

const pickValue = (record: Record<string, unknown>, keys: string[]): string => {
  for (const key of keys) {
    const value = toText(record[key]);
    if (value) {
      return value;
    }
  }

  return "";
};

const toDateInputValue = (value: unknown): string => {
  const text = toText(value);
  if (!text) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = Date.parse(text);
  if (Number.isNaN(parsed)) {
    return "";
  }

  return new Date(parsed).toISOString().slice(0, 10);
};

const getTextOrFallback = (value: string, fallback = "NA"): string =>
  value.trim() !== "" ? value : fallback;

const mapClaimRow = (value: unknown): ClaimRow | null => {
  const record = toRecord(value);
  if (!record) return null;

  return {
    policyNumber: pickValue(record, ["policyNumber", "policyNo", "policy_number"]),
    productCode: pickValue(record, ["productCode", "product_code"]),
    claimKey: pickValue(record, ["claimKey", "claim_key"]),
    canonicalId: pickValue(record, ["canonicalId", "canonical_id"]),
    patientName: pickValue(record, ["patientName", "patient_name"]),
    ailmentForCommunication: pickValue(record, ["ailmentForCommunication", "ailment", "ailmentForComm"]),
    claimType: pickValue(record, ["claimType", "type"]),
    subType: pickValue(record, ["subType", "sub_type"]),
    intimationDate: pickValue(record, ["intimationDate", "intimation_date"]),
    doa: pickValue(record, ["doa", "dateOfAdmission"]),
    dod: pickValue(record, ["dod", "dateOfDischarge"]),
    decisionStatus: pickValue(record, ["decisionStatus", "status"]),
  };
};

const extractClaimRows = (value: unknown): ClaimRow[] => {
  if (!value) return [];

  const rootRecord = toRecord(value);
  const candidateArrays: unknown[] = [
    value,
    rootRecord?.claimSection,
    rootRecord?.claims,
    rootRecord?.claimList,
    rootRecord?.rows,
    rootRecord?.items,
  ];

  for (const candidate of candidateArrays) {
    if (!Array.isArray(candidate)) {
      continue;
    }

    const rows = candidate
      .map((item) => mapClaimRow(item))
      .filter((item): item is ClaimRow => Boolean(item));

    if (rows.length > 0) {
      return rows;
    }
  }

  return [];
};

const buildClaimRowFromForm = (form: AddClaimForm): ClaimRow => ({
  policyNumber: form.policyNumber.trim(),
  productCode: form.productCode.trim(),
  claimKey: form.claimKey.trim(),
  canonicalId: form.canonicalId.trim(),
  patientName: form.patientName.trim(),
  ailmentForCommunication: form.ailmentForCommunication.trim(),
  claimType: form.claimType.trim(),
  subType: form.subType.trim(),
  intimationDate: form.intimationDate.trim(),
  doa: form.doa.trim(),
  dod: form.dod.trim(),
  decisionStatus: form.decisionStatus.trim(),
});

const formFields: Array<{ key: keyof AddClaimForm; label: string; type?: string }> = [
  { key: "policyNumber", label: "Policy Number" },
  { key: "productCode", label: "Product Code" },
  { key: "claimKey", label: "Claim Key" },
  { key: "canonicalId", label: "Canonical ID" },
  { key: "patientName", label: "Patient Name" },
  { key: "ailmentForCommunication", label: "Ailment For Communication" },
  { key: "claimType", label: "Claim Type" },
  { key: "subType", label: "Sub Type" },
  { key: "intimationDate", label: "Intimation Date", type: "date" },
  { key: "doa", label: "DOA", type: "date" },
  { key: "dod", label: "DOD", type: "date" },
  { key: "decisionStatus", label: "Decision Status" },
];

const ClaimSection = () => {
  const dataRecord = useSelector(
    (state: RootState) => state.drs.data as unknown as Record<string, unknown> | null,
  );

  const baseRows = useMemo(() => {
    if (!dataRecord) return SAMPLE_CLAIM_ROWS;

    const fromClaimSection = extractClaimRows(dataRecord.claimSection);
    if (fromClaimSection.length > 0) {
      return fromClaimSection;
    }

    const rowsFromRoot = extractClaimRows(dataRecord);
    return rowsFromRoot.length > 0 ? rowsFromRoot : SAMPLE_CLAIM_ROWS;
  }, [dataRecord]);

  const autoFormDefaults = useMemo<AddClaimForm>(() => {
    if (!dataRecord) {
      return { ...DEFAULT_CLAIM_FORM };
    }

    const firstRow = baseRows[0];
    const applicationInfo = toRecord(dataRecord.applicationInfo);
    const firstProduct = Array.isArray(dataRecord.productDetail)
      ? toRecord(dataRecord.productDetail[0])
      : null;
    const firstCustomer = Array.isArray(dataRecord.customerDetails)
      ? toRecord(dataRecord.customerDetails[0])
      : null;
    const personalDetails = toRecord(firstCustomer?.personalDetails);
    const derivedPatientName = [
      toText(personalDetails?.firstName),
      toText(personalDetails?.middleName),
      toText(personalDetails?.lastName),
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    return {
      policyNumber:
        getTextOrFallback(
          firstRow?.policyNumber ||
            pickValue(applicationInfo ?? {}, ["policyNumber", "policyNo", "policy_number"]) ||
            toText(dataRecord.applicationNumber),
          DEFAULT_CLAIM_FORM.policyNumber,
        ),
      productCode:
        getTextOrFallback(
          firstRow?.productCode ||
            pickValue(firstProduct ?? {}, ["productCode", "code", "product_code"]),
          DEFAULT_CLAIM_FORM.productCode,
        ),
      claimKey: getTextOrFallback(firstRow?.claimKey || "", DEFAULT_CLAIM_FORM.claimKey),
      canonicalId: getTextOrFallback(
        firstRow?.canonicalId || toText(dataRecord.applicationNumber),
        DEFAULT_CLAIM_FORM.canonicalId,
      ),
      patientName: getTextOrFallback(
        firstRow?.patientName || derivedPatientName,
        DEFAULT_CLAIM_FORM.patientName,
      ),
      ailmentForCommunication: getTextOrFallback(
        firstRow?.ailmentForCommunication || "",
        DEFAULT_CLAIM_FORM.ailmentForCommunication,
      ),
      claimType: getTextOrFallback(firstRow?.claimType || "", DEFAULT_CLAIM_FORM.claimType),
      subType: getTextOrFallback(firstRow?.subType || "", DEFAULT_CLAIM_FORM.subType),
      intimationDate:
        toDateInputValue(firstRow?.intimationDate || dataRecord.submitDate) ||
        DEFAULT_CLAIM_FORM.intimationDate,
      doa:
        toDateInputValue(firstRow?.doa || dataRecord.submitDate) ||
        DEFAULT_CLAIM_FORM.doa,
      dod:
        toDateInputValue(firstRow?.dod || dataRecord.submitDate) ||
        DEFAULT_CLAIM_FORM.dod,
      decisionStatus: getTextOrFallback(
        firstRow?.decisionStatus || "",
        DEFAULT_CLAIM_FORM.decisionStatus,
      ),
    };
  }, [baseRows, dataRecord]);

  const [addedRows, setAddedRows] = useState<ClaimRow[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [form, setForm] = useState<AddClaimForm>({ ...DEFAULT_CLAIM_FORM });

  const rows = useMemo(() => [...addedRows, ...baseRows], [addedRows, baseRows]);

  const isSaveDisabled = useMemo(() => {
    return !(form.claimKey.trim() && form.claimType.trim() && form.decisionStatus.trim());
  }, [form.claimKey, form.claimType, form.decisionStatus]);

  const handleOpenAddDialog = () => {
    setForm(autoFormDefaults);
    setIsAddDialogOpen(true);
  };

  const handleCloseAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  const handleFormChange = (key: keyof AddClaimForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveClaim = () => {
    const nextRow = buildClaimRowFromForm(form);
    setAddedRows((prev) => [nextRow, ...prev]);
    setIsAddDialogOpen(false);
  };

  return (
     <>
      <Box sx={{ mt: 1 }}>
        {/* <CustomAccordion title="Claims Section" defaultExpanded> */}
          <Box>
            <CustomTable<ClaimRow>
              title="Claims Section"
              columns={claimsColumns}
              data={rows}
              headerAction={
                <CustomButton
                  variant="contained"
                  onClick={handleOpenAddDialog}
                  sx={{
                    minWidth: "64px",
                    height: "22px",
                    fontSize: "11px",
                    borderRadius: "4px",
                    textTransform: "none",
                    color: "#004A80",
                    backgroundColor: "#ffffff",
                    boxShadow: "none",
                    px: 1,
                    "&:hover": {
                      backgroundColor: "#f2f6fa",
                      boxShadow: "none",
                    },
                  }}
                >
                  + Add
                </CustomButton>
              }
            />

            {rows.length === 0 && (
              <Box
                sx={{
                  mt: 1,
                  border: "1px dashed #d9d9d9",
                  borderRadius: "10px",
                  p: 1.5,
                  textAlign: "center",
                }}
              >
                <Typography sx={{ color: "#6F6F6F", fontSize: "12px" }}>
                  No claims available.
                </Typography>
              </Box>
            )}
          </Box>
        {/* </CustomAccordion> */}
      </Box>

      <CustomDialog
        open={isAddDialogOpen}
        onClose={handleCloseAddDialog}
        title={<Typography sx={{ color: "#0A3E6B", fontSize: "20px", fontWeight: 700 }}>ADD CLAIMS</Typography>}
        maxWidth="md"
        paperSx={{ backgroundColor: "#f5f5f5" }}
        contentSx={{ pt: 1, pb: 1 }}
        actions={
          <CustomButton
            variant="contained"
            onClick={handleSaveClaim}
            disabled={isSaveDisabled}
            sx={{
              minWidth: "120px",
              height: "40px",
              borderRadius: "999px",
              fontWeight: 700,
              textTransform: "none",
            }}
          >
            Save
          </CustomButton>
        }
        actionsSx={{ justifyContent: "center", pb: 3 }}
      >
        <Box
          sx={{
            borderRadius: "10px",
            p: 1.5,
            backgroundColor: "#ececec",
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(180px, 1fr))",
            gap: 1.5,
          }}
        >
          {formFields.map((field) => (
            <Box key={field.key}>
              <Typography sx={{ fontSize: "12px", color: "#5B5B5B", mb: 0.5 }}>
                {field.label}
              </Typography>
              <CustomTextField
                fullWidth
                size="small"
                type={field.type}
                // value={form[field.key]}
                onChange={(event) => handleFormChange(field.key, event.target.value)}
                placeholder="Enter value"
                sx={{
                  backgroundColor: "#f8f8f8",
                  "& .MuiInputBase-input": {
                    fontSize: "12px",
                    py: 0.8,
                  },
                }}
              />
            </Box>
          ))}
        </Box>
      </CustomDialog>
    </>
  );
};

export default ClaimSection;
