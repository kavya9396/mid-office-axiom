import { Box, Container } from "@mui/material";
import type { Column } from "../../../components/ui/Table/Table";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTable from "../../../components/ui/Table/Table";
import { GridSection } from "../../../components/layout/GridSection";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import type { RiderRow } from "../../../types/drs.types";
import { toDisplayValue } from "../../../utils/helpers";
import { useAppContext } from "../../../hooks/useAppContext";
import { normalizeBusinessType } from "../../../routes/routes";

const riderColumns: Column<RiderRow>[] = [
  { key: "name", header: "Name", width: "30%" },
  { key: "type", header: "Option", width: "20%" },
  { key: "term", header: "PT", width: "5%" },
  { key: "sumAssured", header: "Sum Assured", width: "15%" },
  { key: "paymentAmount", header: "Modal Premium", width: "15%" },
  { key: "ppt", header: "PPT", width: "10%" },
];

const formatNumberOrDash = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric.toLocaleString("en-IN") : "-";
};

type ApplicationDetailItem = {
  label: string;
  value: string | number;
};

type ApplicationDetailKey =
  | "productName"
  | "sumAssured"
  | "appliedSA"
  | "channel"
  | "subChannel"
  | "agentCode"
  | "agentName"
  | "customerType"
  | "modalPremium"
  | "pt"
  | "ppt"
  | "paymentMode"
  | "productCode"
  | "faceValue"
  | "trsa"
  | "tfsa"
  | "policyType";

const normalizeRoleType = (value: string | null | undefined) =>
  String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

const getRoleTypeDisplayKey = (value: string | null | undefined) => {
  const normalized = normalizeRoleType(value);
  if (normalized.includes("CVT")) return "CVT_POOL";
  if (normalized.includes("DVT")) return "DVT_POOL";
  return "DEFAULT";
};

const ApplicationOverview = () => {
  const { data } = useSelector((state: RootState) => state.drs);
  const { businessType } = useAppContext();
  const dataRecord = (data as unknown as Record<string, unknown> | null) ?? {};

  const applicationOverview = dataRecord?.applicationOverview as
    | Record<string, unknown>
    | undefined;

  const sourcingDetail = (applicationOverview?.sourcingDetail as Record<string, unknown> | undefined)
    ?? (data?.sourcingDetail as unknown as Record<string, unknown> | undefined);
  const groupDetails = (applicationOverview?.groupDetails as Record<string, unknown> | undefined)
    ?? (data?.groupDetails as unknown as Record<string, unknown> | undefined);

  const productDetails = Array.isArray(applicationOverview?.productDetail)
    ? (applicationOverview.productDetail as Array<Record<string, unknown>>)
    : ((data?.productDetail as unknown as Array<Record<string, unknown>> | undefined) ?? []);
  const firstProduct = productDetails[0];
  const applicationInfo = data?.applicationInfo;

  const riderDetails = Array.isArray(applicationOverview?.riderDetails)
    ? (applicationOverview.riderDetails as Array<Record<string, unknown>>)
    : ((data?.riderDetails as unknown as Array<Record<string, unknown>> | undefined) ?? []);

  const normalizedBusinessType =
    normalizeBusinessType(businessType) ??
    normalizeBusinessType(localStorage.getItem("businessType"));
  const isGroupBusiness = normalizedBusinessType === "group";
  const isRetailBusiness = normalizedBusinessType === "retail";
  const roleType = localStorage.getItem("roleType");

  const applicationDetailsByKey: Record<ApplicationDetailKey, ApplicationDetailItem> = {
    productName: {
      label: "Product Name",
      value: String(firstProduct?.name ?? "-"),
    },
    sumAssured: {
      label: "Sum Assured",
      value: formatNumberOrDash(firstProduct?.sumAssured),
    },
    appliedSA: {
      label: "Applied SA",
      value: formatNumberOrDash(firstProduct?.sumAssured ?? applicationInfo?.sumAssured),
    },
    channel: {
      label: "Channel",
      value: String(sourcingDetail?.channelCode ?? "-"),
    },
    subChannel: {
      label: "Sub Channel",
      value: String(sourcingDetail?.drcChannelCode ?? sourcingDetail?.subChannelCode ?? "-"),
    },
    agentCode: {
      label: "Agent Code",
      value: String(sourcingDetail?.agentCode ?? "-"),
    },
    agentName: {
      label: "Agent Name",
      value: String(sourcingDetail?.agentName ?? "-"),
    },
    customerType: {
      label: "Customer Type",
      value: String(data?.applicationInfo?.proposerType ?? "-"),
    },
    modalPremium: {
      label: "Modal Premium",
      value: formatNumberOrDash(firstProduct?.paymentAmount),
    },
    pt: {
      label: "PT",
      value: toDisplayValue(firstProduct?.term),
    },
    ppt: {
      label: "PPT",
      value: toDisplayValue(firstProduct?.premiumCessationTerm ?? firstProduct?.premiumPaymentTerm),
    },
    paymentMode: {
      label: "Payment Mode",
      value: String(firstProduct?.premiumModeFpd ?? "-"),
    },
    productCode: {
      label: "Product Code",
      value: String(firstProduct?.code ?? "-"),
    },
    faceValue: {
      label: "Face Value",
      value: String(firstProduct?.faceValue ?? "-"),
    },
    trsa: {
      label: "TRSA",
      value: formatNumberOrDash(applicationInfo?.simultaneousLifeSA),
    },
    tfsa: {
      label: "TFSA",
      value: formatNumberOrDash(applicationInfo?.otherPolicySA),
    },
    policyType: {
      label: "Policy Type",
      value: String(groupDetails?.coverageStatus ?? "-"),
    },
  };

  const roleTypeWiseDisplayKeys: Record<string, ApplicationDetailKey[]> = {
    // Update these arrays as per business requirement.
    DEFAULT: [
      "productName",
      "sumAssured",
      "appliedSA",
      "channel",
      "subChannel",
      "agentCode",
      "agentName",
      "customerType",
      "modalPremium",
      "pt",
      "ppt",
      "paymentMode",
      ...(isRetailBusiness ? (["productCode", "faceValue", "trsa", "tfsa"] as ApplicationDetailKey[]) : []),
      ...(isGroupBusiness ? (["policyType"] as ApplicationDetailKey[]) : []),
    ],
    CVT_POOL: [
      "productName",
      "appliedSA",
      "channel",
      "subChannel",
      "agentCode",
      "customerType",
      "modalPremium",
      "paymentMode",
      ...(isRetailBusiness ? (["productCode", "faceValue"] as ApplicationDetailKey[]) : []),
      ...(isGroupBusiness ? (["policyType"] as ApplicationDetailKey[]) : []),
    ],
    DVT_POOL: [
      "productName",
      "sumAssured",
      "appliedSA",
      "channel",
      "subChannel",
      "agentCode",
      "agentName",
      "customerType",
      "modalPremium",
      "pt",
      "ppt",
      "paymentMode",
      ...(isRetailBusiness ? (["productCode", "faceValue", "trsa", "tfsa"] as ApplicationDetailKey[]) : []),
      ...(isGroupBusiness ? (["policyType"] as ApplicationDetailKey[]) : []),
    ],
  };

  const selectedDisplayKey = getRoleTypeDisplayKey(roleType);
  const selectedApplicationDetailKeys =
    roleTypeWiseDisplayKeys[selectedDisplayKey] ?? roleTypeWiseDisplayKeys.DEFAULT;

  const applicationDetails = selectedApplicationDetailKeys
    .map((key) => applicationDetailsByKey[key])
    .filter(Boolean);

  const riderRows: RiderRow[] =
    riderDetails.map((rider) => ({
      name: toDisplayValue(rider.name ?? rider.riderName),
      type: toDisplayValue(rider.type ?? rider.option),
      term: formatNumberOrDash(rider.term ?? rider.policyTerm),
      sumAssured: formatNumberOrDash(rider.sumAssured),
      paymentAmount: formatNumberOrDash(rider.paymentAmount ?? rider.modalPremium),
      ppt: formatNumberOrDash(rider.ppt ?? rider.premiumPaymentTerm),
    })) ?? [];

  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        {/* <CustomAccordion title="Application Overview" defaultExpanded={userRole ==='CPT'?true:false}> */}
        <CustomAccordion title="Application Details" defaultExpanded>
          <Box sx={{ p: 2, backgroundColor: "#f6f6f6", borderRadius: "8px" }}>
            {/* <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: 2,
                backgroundColor: "#f6f6f6",
                borderRadius: 2,
                mb: 2,
              }}
            >
              <Box>
                <Typography sx={{ color: "#444", fontSize: 14, fontWeight: 400 }}>Product Name</Typography>
                <Typography sx={{ color: "#161616", fontWeight: 600, fontSize: 12 }}>
                  {String(firstProduct?.name ?? "-")}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ color: "#444", fontSize: 14, fontWeight: 400 }}>Product Code</Typography>
                <Typography sx={{ color: "#161616", fontWeight: 600, fontSize: 12 }}>
                  {String(firstProduct?.code ?? "-")}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ color: "#444", fontSize: 14, fontWeight: 400 }}>Face Value</Typography>
                <Typography sx={{ color: "#161616", fontWeight: 600, fontSize: 12 }}>
                  {faceValue || "-"}
                </Typography>
              </Box>
            </Box> */}
            <GridSection columns={6} items={applicationDetails} />
          </Box>
          {riderRows.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <CustomTable<RiderRow>
                title="Rider Details"
                columns={riderColumns}
                data={riderRows}
              />
            </Box>
          )}
        </CustomAccordion>
      </Box>
    </Container>
  );
};

export default ApplicationOverview;
