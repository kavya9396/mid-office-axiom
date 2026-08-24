import { Box, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { Column } from "../../../components/ui/Table/Table";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
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
];

const emptyClaimForm: AddClaimForm = {
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

const DUMMY_READONLY_FIELDS = {
  policyNumber: "POL12345678",
  productCode: "AG",
  canonicalId: "CANON001",
  patientName: "John Doe",
  ailmentForCommunication: "Non HNI",
  subType: "General",
  intimationDate: "2026-07-01",
  doa: "2026-07-02",
  dod: "2026-07-05",
} as const;

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

const formFields: Array<{ key: keyof AddClaimForm; label: string; type?: string; editable: boolean }> = [
  { key: "policyNumber", label: "Policy Number", editable: false },
  { key: "productCode", label: "Product Code", editable: false },
  { key: "claimKey", label: "Claim Key", editable: true },
  { key: "canonicalId", label: "Canonical ID", editable: false },
  { key: "patientName", label: "Patient Name", editable: false },
  { key: "ailmentForCommunication", label: "Ailment For Communication", editable: false },
  { key: "claimType", label: "Claim Type", editable: true },
  { key: "subType", label: "Sub Type", editable: false },
  { key: "intimationDate", label: "Intimation Date", type: "date", editable: false },
  { key: "doa", label: "DOA", type: "date", editable: false },
  { key: "dod", label: "DOD", type: "date", editable: false },
  { key: "decisionStatus", label: "Decision Status", editable: true },
];

const ClaimSection = () => {
  const dataRecord = useSelector(
    (state: RootState) => state.drs.data as unknown as Record<string, unknown> | null,
  );

  const baseRows = useMemo(() => {
    if (!dataRecord) return [] as ClaimRow[];

    const fromClaimSection = extractClaimRows(dataRecord.claimSection);
    if (fromClaimSection.length > 0) {
      return fromClaimSection;
    }

    return extractClaimRows(dataRecord);
  }, [dataRecord]);

  const autoFormDefaults = useMemo<AddClaimForm>(() => {
    if (!dataRecord) {
      return emptyClaimForm;
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
          DUMMY_READONLY_FIELDS.policyNumber,
        ),
      productCode:
        getTextOrFallback(
          firstRow?.productCode ||
          pickValue(firstProduct ?? {}, ["productCode", "code", "product_code"]),
          DUMMY_READONLY_FIELDS.productCode,
        ),
      claimKey: "",
      canonicalId: getTextOrFallback(
        firstRow?.canonicalId || toText(dataRecord.applicationNumber),
        DUMMY_READONLY_FIELDS.canonicalId,
      ),
      patientName: getTextOrFallback(
        firstRow?.patientName || derivedPatientName,
        DUMMY_READONLY_FIELDS.patientName,
      ),
      ailmentForCommunication: getTextOrFallback(
        firstRow?.ailmentForCommunication || "",
        DUMMY_READONLY_FIELDS.ailmentForCommunication,
      ),
      claimType: "",
      subType: getTextOrFallback(firstRow?.subType || "", DUMMY_READONLY_FIELDS.subType),
      intimationDate:
        toDateInputValue(firstRow?.intimationDate || dataRecord.submitDate) ||
        DUMMY_READONLY_FIELDS.intimationDate,
      doa:
        toDateInputValue(firstRow?.doa || dataRecord.submitDate) ||
        DUMMY_READONLY_FIELDS.doa,
      dod:
        toDateInputValue(firstRow?.dod || dataRecord.submitDate) ||
        DUMMY_READONLY_FIELDS.dod,
      decisionStatus: "",
    };
  }, [baseRows, dataRecord]);

  const [addedRows, setAddedRows] = useState<ClaimRow[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [form, setForm] = useState<AddClaimForm>(emptyClaimForm);

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
      <Box sx={{ px: 1 }}>
        <CustomAccordion title="Claims Section" defaultExpanded>
          <Box sx={{ p: 1 }}>
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
        </CustomAccordion>
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
                value={form[field.key]}
                onChange={(event) => handleFormChange(field.key, event.target.value)}
                disabled={!field.editable}
                placeholder={field.editable ? "Enter value" : ""}
                sx={{
                  backgroundColor: field.editable ? "#f8f8f8" : "#f0f0f0",
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
