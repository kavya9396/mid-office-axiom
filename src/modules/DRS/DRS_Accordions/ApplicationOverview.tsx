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

  const applicationDetails = [
    {
      label: "Product Name",
      value: String(firstProduct?.name ?? "-"),
    },
     {
      label: "Sum Assured",
      value: formatNumberOrDash(firstProduct?.sumAssured),
    },
    {
      label: "Applied SA",
      value: formatNumberOrDash(firstProduct?.sumAssured ?? applicationInfo?.sumAssured),
    },
    {
      label: "Channel",
      value: String(sourcingDetail?.channelCode ?? "-"),
    },
    {
      label: "Sub Channel",
      value: String(sourcingDetail?.drcChannelCode ?? sourcingDetail?.subChannelCode ?? "-"),
    },
      {
      label: "Agent Code",
      value: String(sourcingDetail?.agentCode ?? "-"),
    },
    {
      label: "Agent Name",
      value: String(sourcingDetail?.agentName ?? "-"),
    },
    {
      label: "Customer Type",
      value: String(data?.applicationInfo?.proposerType ?? "-"),
    },
    {
      label: "Modal Premium",
      value: formatNumberOrDash(firstProduct?.paymentAmount),
    },
    {
      label: "PT",
      value: toDisplayValue(firstProduct?.term),
    },
    {
      label: "PPT",
      value: toDisplayValue(firstProduct?.premiumCessationTerm ?? firstProduct?.premiumPaymentTerm),
    },
    {
      label: "Payment Mode",
      value: String(firstProduct?.premiumModeFpd ?? "-"),
    },
     ...(isRetailBusiness ? [
    {
      label: "Product Code",
      value: String(firstProduct?.code ?? "-")
    },
    {
      label: "Face Value",
      value: String(firstProduct?.faceValue ?? "-")
    },
   
    {
      label: "TRSA",
      value: formatNumberOrDash(applicationInfo?.simultaneousLifeSA),
    },
    {
      label: "TFSA",
      value: formatNumberOrDash(applicationInfo?.otherPolicySA),
    }] : []),
    
  
    ...(isGroupBusiness
      ? [{
        label: "Policy Type",
        value: String(groupDetails?.coverageStatus ?? "-"),
    }]
      : [])
  ];

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
