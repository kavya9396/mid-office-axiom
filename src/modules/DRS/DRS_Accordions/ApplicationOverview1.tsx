import { Box } from "@mui/material";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import { title } from "../../../utils/constant";
import { GridSection } from "../../../components/layout/GridSection";
import { useAppSelector } from "../../../store/hooks";
import CustomTable, { type Column } from "../../../components/ui/Table/Table";

export type RiderRow = {
  name: string;
  type: string;
  term: string;
  sumAssured: string;
  paymentAmount: string;
  ppt: string;
};

const ApplicationOverview1 = () => {
    const roleType = localStorage.getItem("roleType");
    const drsData = useAppSelector((state) => state.drs);
    const applicationOverview = drsData?.data?.applicationOverview;
  const roleWiseConfig: Record<string, { label: string; path: string }[]> = {
  CVT_TASK: [
    {
      label: "Product Name",
      path: "productDetail.0.name",
    },
     {
      label: "Plan Name",
      path: "productDetail.0.planName",
    },
    
    {
      label: "Agent Code",
      path: "sourcingDetail.agentCode",
    },
    {
      label: "Agent Name",
      path: "sourcingDetail.agentName",
    },
     {
      label: "Sum Assured",
      path: "productDetail.0.sumAssured",
    },
     {
      label: "Customer Type",
      path: "productDetail.0.customerType",
    },
    {
      label: "Channel",
      path: "sourcingDetail.channelCode",
    },
     {
      label: "Sub Channel",
      path: "sourcingDetail.subChannelCode",
    },
    {
      label: "Policy Type",
      path: "productDetail.0.policyType",
    }, {
      label: "Face Value",
      path: "productDetail.0.faceValue",
    }
  ],
};
    console.log('application details',applicationOverview,roleWiseConfig)
    type GridValue = string | number | boolean | undefined;

const getValue = (
  obj: Record<string, unknown>,
  path: string
): GridValue => {
  const value = path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return undefined;
};

  const items = (roleWiseConfig[roleType ?? ""] || []).map((item) => ({
  label: item.label,
  value: getValue(
    applicationOverview as Record<string, unknown>,
    item.path
  ) ?? "-",
}));
const riderDetails = Array.isArray(applicationOverview?.riderDetails)
  ? applicationOverview.riderDetails
  : [];
const riderColumns: Column<RiderRow>[] = [
  { key: "name", header: "Name", width: "30%" },
  { key: "type", header: "Option", width: "20%" },
  { key: "sumAssured", header: "Sum Assured", width: "15%" },
  { key: "paymentAmount", header: "Modal Premium", width: "15%" }]
 const riderRows: RiderRow[] =
    riderDetails.map((rider) => ({
      name: rider.name ?? rider.riderName,
      type: rider.type ?? rider.option,
      term: rider.term ?? rider.policyTerm,
      sumAssured: rider.sumAssured,
      paymentAmount: rider.paymentAmount ?? rider.modalPremium,
      ppt: rider.ppt ?? rider.premiumPaymentTerm,
    })) ?? [];
return(
    <Box sx={{p:1}}>
  <CustomAccordion title={title.applicationOverview} defaultExpanded>
    <Box sx={{pl:1}}>
    <GridSection columns={6} items={items}/>
    {riderRows.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <CustomTable<RiderRow>
                    title="Rider Details"
                    columns={riderColumns}
                    data={riderRows}
                  />
                </Box>
              )}
    </Box>
         </CustomAccordion> 

    </Box>
)
}
export default ApplicationOverview1;