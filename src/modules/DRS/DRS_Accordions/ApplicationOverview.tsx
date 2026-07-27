import { Box, Container } from "@mui/material";
import type { Column } from "../../../components/ui/Table/Table";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTable from "../../../components/ui/Table/Table";
import { GridSection } from "../../../components/layout/GridSection";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import type { RiderRow } from "../../../types/drs.types";
import { toDisplayValue } from "../../../utils/helpers";

const riderColumns: Column<RiderRow>[] = [
  { key: "name", header: "Name", width: "30%" },
  { key: "type", header: "Option", width: "20%" },
  { key: "sumAssured", header: "Sum Assured", width: "15%" },
  { key: "paymentAmount", header: "Modal Premium", width: "15%" },
];

const riderTermAndPptColumns: Column<RiderRow>[] = [
  { key: "term", header: "PT", width: "5%" },
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
  | "policyNumber"
  | "productName"
  | "sumAssured"
  | "appliedSumAssured"
  | "appliedSA"
  | "channel"
  | "subChannel"
  | "agentCode"
  | "agentName"
  | "customerType"
  | "modalPremium"
  | "premium"
  | "coverRequested"
  | "coverProvided"
  | "freeCover"
  | "coverAboveFCL"
  | "pt"
  | "ppt"
  | "paymentMode"
  | "productCode"
  | "faceValue"
  | "trsa"
  | "tfsa"
  | "policyType"
  | "mphName"
  |"mphCode" | "proposerType" | "sumAssured" |"deathBenefitOption" | "benefitOption" |"annualPremium"|"fundSource";

const ApplicationOverview = () => {
  const { data } = useSelector((state: RootState) => state.drs);
  const dataRecord = (data as unknown as Record<string, unknown> | null) ?? {};

  const applicationOverview = dataRecord?.applicationOverview as
    | Record<string, unknown>
    | undefined;

  const sourcingDetail = (applicationOverview?.sourcingDetail as Record<string, unknown> | undefined)
    ?? (data?.sourcingDetail as unknown as Record<string, unknown> | undefined);
  const basicDetails = (applicationOverview?.basicDetails as Record<string, unknown> | undefined)
    ?? (dataRecord?.basicDetails as Record<string, unknown> | undefined);
  const groupDetails = (applicationOverview?.groupDetails as Record<string, unknown> | undefined)
    ?? (data?.groupDetails as unknown as Record<string, unknown> | undefined);

  const productDetails = Array.isArray(applicationOverview?.productDetail)
    ? (applicationOverview.productDetail as Array<Record<string, unknown>>)
    : ((data?.productDetail as unknown as Array<Record<string, unknown>> | undefined) ?? []);
  const firstProduct = productDetails[0];
  const applicationInfo = data?.applicationInfo;
  const quickLinks = (dataRecord?.quickLinks as Record<string, unknown> | undefined) ?? {};
  const previousPolicies = Array.isArray(quickLinks.previousPolicies)
    ? (quickLinks.previousPolicies as Array<Record<string, unknown>>)
    : [];
  const firstPreviousPolicy = previousPolicies[0];

  const riderDetails = Array.isArray(applicationOverview?.riderDetails)
    ? (applicationOverview.riderDetails as Array<Record<string, unknown>>)
    : ((data?.riderDetails as unknown as Array<Record<string, unknown>> | undefined) ?? []);

  const businessType = String(localStorage.getItem("businessType") ?? "")
    .trim()
    .toLowerCase();
  const isGroupBusiness = businessType === "group";
  const isRetailBusiness = businessType === "retail";
  const roleType = localStorage.getItem("roleType") ?? "";
  const shouldShowRiderTermAndPpt = roleType !== "DVT_FORMAL_TASK" && roleType !== "GUW_FORMAL_TASK";
  const selectedRiderColumns = shouldShowRiderTermAndPpt
    ? [
        riderColumns[0],
        riderColumns[1],
        riderTermAndPptColumns[0],
        riderColumns[2],
        riderColumns[3],
        riderTermAndPptColumns[1],
      ]
    : riderColumns;

  const applicationDetailsByKey: Record<ApplicationDetailKey, ApplicationDetailItem> = {
    policyNumber: {
      label: "Policy No.",
      value: String(
        data?.applicationInfo?.policyNumber ??
          firstProduct?.policyNumber ??
          firstPreviousPolicy?.policyNumber ??
          "-"
      ),
    },
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
    appliedSumAssured: {
      label: "Applied Sum Assured",
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
    premium: {
      label: "Premium",
      value: formatNumberOrDash(firstProduct?.paymentAmount ?? firstProduct?.premium ?? basicDetails?.totalPremium),
    },
    coverRequested: {
      label: "Cover Requested",
      value: formatNumberOrDash(
        groupDetails?.coverRequested ??
          groupDetails?.requestedCover ??
          firstProduct?.coverRequested ??
          firstProduct?.sumAssured
      ),
    },
    coverProvided: {
      label: "Cover Provided",
      value: formatNumberOrDash(
        groupDetails?.coverProvided ??
          groupDetails?.providedCover ??
          firstProduct?.coverProvided ??
          firstProduct?.sumAssured
      ),
    },
    freeCover: {
      label: "Free Cover",
      value: formatNumberOrDash(
        groupDetails?.freeCover ??
          groupDetails?.fcl ??
          firstProduct?.freeCover ??
          firstProduct?.loanLimit
      ),
    },
    coverAboveFCL: {
      label: "Cover above FCL",
      value: formatNumberOrDash(
        groupDetails?.coverAboveFCL ??
          groupDetails?.coverAboveFcl ??
          groupDetails?.coverAboveFclAmount ??
          firstProduct?.coverAboveFCL
      ),
    },
    pt: {
      label: "Policy Term",
      value: toDisplayValue(firstProduct?.term),
    },
    ppt: {
      label: "Premium Paying Term",
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
    mphName:{
      label: "MPH Name",
      value: String(groupDetails?.masterPolicyHolder ?? "-"),
    },mphCode:{
      label: "MPH Code",
      value: String(groupDetails?.masterPolicyHolderCode ?? "-"),
    },proposerType:{
      label: "Proposer Type",
      value: String(groupDetails?.propserType ?? "-"),
    },deathBenefitOption:{
      label: "Death Benefit Option",
      value: String(firstProduct?.deathBenefitPayoutOption ?? "-"),
    },benefitOption:{
      label: "Benefit Option",
      value:String(firstProduct?.benefitOption ?? "-"),
    },annualPremium:{
      label: "Annual Premium",
      value: String(firstProduct?.annualPremium ?? "-"),
    },fundSource:{
      label: "Fund Source",
      value: String(groupDetails?.fundSource ?? "-"),
    }
  };

  const formalPoolDisplayKeys: ApplicationDetailKey[] = [
    "policyNumber",
    "appliedSumAssured",
    "channel",
    "subChannel",
    "agentCode",
    "agentName",
    "premium",
    "coverRequested",
    "coverProvided",
    "freeCover",
    "coverAboveFCL",
  ];

  const defaultDisplayKeys: ApplicationDetailKey[] = [
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
    ];

  const cvtPoolDisplayKeys: ApplicationDetailKey[] = [
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
    ];

  const dvtPoolDisplayKeys: ApplicationDetailKey[] = [
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
    ];
    const guwPoolDisplayKeys: ApplicationDetailKey[]=["mphName","productName","productCode","pt","ppt","proposerType","sumAssured","deathBenefitOption","benefitOption","annualPremium","fundSource"]

  let selectedApplicationDetailKeys: ApplicationDetailKey[] = defaultDisplayKeys;

  if (isGroupBusiness && (roleType === "DVT_FORMAL_TASK" || roleType === "GUW_FORMAL_TASK")) {
    selectedApplicationDetailKeys = formalPoolDisplayKeys;
  } else if (roleType === "CVT_POOL" || roleType === "CVT Pool") {
    selectedApplicationDetailKeys = cvtPoolDisplayKeys;
  } else if (
    roleType === "DVT_POOL" ||
    roleType === "DVT Pool" 
   
  ) {
    selectedApplicationDetailKeys = dvtPoolDisplayKeys;
  }else if(roleType === "GUW_TASK" || roleType === "GUW Pool"){selectedApplicationDetailKeys = guwPoolDisplayKeys;}

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
      <Box sx={{ mt: 1 }}>
        {/* <CustomAccordion title="Application Overview" defaultExpanded={userRole ==='CPT'?true:false}> */}
        <CustomAccordion title="Application Details" defaultExpanded>
          <Box sx={{ p: 1, backgroundColor: "#f6f6f6", borderRadius: "8px" }}>
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
                columns={selectedRiderColumns}
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
