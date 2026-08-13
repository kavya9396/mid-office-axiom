import { Box, Container } from "@mui/material";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import type { RootState } from "../../../store/store";
import { GridSection } from "../../../components/layout/GridSection";
import { useAppSelector } from "../../../store/hooks";
import CustomTable, { type Column } from "../../../components/ui/Table/Table";
import { getRoleFields } from "../../../config/roleWiseApplicationDetailsConfig";

export type RiderRow = {
  name: string;
  type: string;
  term: string;
  sumAssured: string;
  paymentAmount: string;
  ppt: string;
};

const ApplicationOverview = () => {
  const roleType = localStorage.getItem("roleType");
  const drsData = useAppSelector((state: RootState) => state.drs);
  const applicationOverview = ((drsData.data as unknown) as Record<string, unknown> | undefined)?.applicationOverview;
  //   const roleWiseConfig: Record<string, { label: string; path: string }[]> = {
  //   CVT_TASK: [
  //     {
  //       label: "Product Name",
  //       path: "productDetail.0.name",
  //     },
  //      {
  //       label: "Plan Name",
  //       path: "productDetail.0.planName",
  //     },

  //     {
  //       label: "Agent Code",
  //       path: "sourcingDetail.agentCode",
  //     },
  //     {
  //       label: "Agent Name",
  //       path: "sourcingDetail.agentName",
  //     },
  //      {
  //       label: "Sum Assured",
  //       path: "productDetail.0.sumAssured",
  //     },
  //      {
  //       label: "Customer Type",
  //       path: "productDetail.0.customerType",
  //     },
  //     {
  //       label: "Channel",
  //       path: "sourcingDetail.channelCode",
  //     },
  //      {
  //       label: "Sub Channel",
  //       path: "sourcingDetail.subChannelCode",
  //     },
  //     {
  //       label: "Policy Type",
  //       path: "productDetail.0.policyType",
  //     }, {
  //       label: "Face Value",
  //       path: "productDetail.0.faceValue",
  //     }
  //   ],
  //   CPT_TASK: [
  //     {
  //       label: "Product Name",
  //       path: "productDetail.0.name",
  //     },


  //     {
  //       label: "Agent Code",
  //       path: "sourcingDetail.agentCode",
  //     },
  //     {
  //       label: "Agent Name",
  //       path: "sourcingDetail.agentName",
  //     },
  //      {
  //       label: "Sum Assured",
  //       path: "productDetail.0.sumAssured",
  //     },
  //      {
  //       label: "Customer Type",
  //       path: "productDetail.0.customerType",
  //     },
  //     {
  //       label: "Channel",
  //       path: "sourcingDetail.channelCode",
  //     },
  //      {
  //       label: "Sub Channel",
  //       path: "sourcingDetail.subChannelCode",
  //     },
  //     {
  //       label: "Policy Type",
  //       path: "productDetail.0.policyType",
  //     }, {
  //       label: "Modal Premium",
  //       path: "productDetail.0.faceValue",
  //     },{
  //       label: "Policy Term",
  //       path: "productDetail.0.policyTerm",
  //     },{
  //       label: "Premium Payment Term",
  //       path: "productDetail.0.premiumPaymentTerm",
  //     },{
  //       label: "Payment Mode",
  //       path: "policyDetails.paymentMode",
  //     }
  //   ],CPT_DATA_ENTRY_NMR_TASK: [
  //     {
  //       label: "Product Name",
  //       path: "productDetail.0.name",
  //     },


  //     {
  //       label: "Agent Code",
  //       path: "sourcingDetail.agentCode",
  //     },
  //     {
  //       label: "Agent Name",
  //       path: "sourcingDetail.agentName",
  //     },
  //      {
  //       label: "Sum Assured",
  //       path: "productDetail.0.sumAssured",
  //     },
  //      {
  //       label: "Customer Type",
  //       path: "productDetail.0.customerType",
  //     },
  //     {
  //       label: "Channel",
  //       path: "sourcingDetail.channelCode",
  //     },
  //      {
  //       label: "Sub Channel",
  //       path: "sourcingDetail.subChannelCode",
  //     },
  //     {
  //       label: "Policy Type",
  //       path: "productDetail.0.policyType",
  //     }, {
  //       label: "Modal Premium",
  //       path: "productDetail.0.faceValue",
  //     },{
  //       label: "Policy Term",
  //       path: "productDetail.0.policyTerm",
  //     },{
  //       label: "Premium Payment Term",
  //       path: "productDetail.0.premiumPaymentTerm",
  //     },{
  //       label: "Payment Mode",
  //       path: "policyDetails.paymentMode",
  //     }
  //   ],CPT_DATA_ENTRY_MR_TASK: [
  //     {
  //       label: "Product Name",
  //       path: "productDetail.0.name",
  //     },


  //     {
  //       label: "Agent Code",
  //       path: "sourcingDetail.agentCode",
  //     },
  //     {
  //       label: "Agent Name",
  //       path: "sourcingDetail.agentName",
  //     },
  //      {
  //       label: "Sum Assured",
  //       path: "productDetail.0.sumAssured",
  //     },
  //      {
  //       label: "Customer Type",
  //       path: "productDetail.0.customerType",
  //     },
  //     {
  //       label: "Channel",
  //       path: "sourcingDetail.channelCode",
  //     },
  //      {
  //       label: "Sub Channel",
  //       path: "sourcingDetail.subChannelCode",
  //     },
  //     {
  //       label: "Policy Type",
  //       path: "productDetail.0.policyType",
  //     }, {
  //       label: "Modal Premium",
  //       path: "productDetail.0.faceValue",
  //     },{
  //       label: "Policy Term",
  //       path: "productDetail.0.policyTerm",
  //     },{
  //       label: "Premium Payment Term",
  //       path: "productDetail.0.premiumPaymentTerm",
  //     },{
  //       label: "Payment Mode",
  //       path: "policyDetails.paymentMode",
  //     }
  //   ],PRE_ISSUANCE_SERVICING_TASK: [
  //     {
  //       label: "Product Name",
  //       path: "productDetail.0.name",
  //     },


  //     {
  //       label: "Agent Code",
  //       path: "sourcingDetail.agentCode",
  //     },
  //     {
  //       label: "Agent Name",
  //       path: "sourcingDetail.agentName",
  //     },
  //      {
  //       label: "Sum Assured",
  //       path: "productDetail.0.sumAssured",
  //     },
  //      {
  //       label: "Customer Type",
  //       path: "productDetail.0.customerType",
  //     },
  //     {
  //       label: "Channel",
  //       path: "sourcingDetail.channelCode",
  //     },
  //      {
  //       label: "Sub Channel",
  //       path: "sourcingDetail.subChannelCode",
  //     },
  //     {
  //       label: "Policy Type",
  //       path: "productDetail.0.policyType",
  //     }, {
  //       label: "Modal Premium",
  //       path: "productDetail.0.faceValue",
  //     },{
  //       label: "Policy Term",
  //       path: "productDetail.0.policyTerm",
  //     },{
  //       label: "Premium Payment Term",
  //       path: "productDetail.0.premiumPaymentTerm",
  //     },{
  //       label: "Payment Mode",
  //       path: "policyDetails.paymentMode",
  //     },{
  //       label: "Proposer Name",
  //       path: "policyDetails.paymentMode",
  //     },{
  //       label: "Life Assured Name",
  //       path: "policyDetails.paymentMode",
  //     }
  //   ],POST_ISSUANCE_SERVICING_TASK: [
  //     {
  //       label: "Product Name",
  //       path: "productDetail.0.name",
  //     },
  //      {
  //       label: "Plan Name",
  //       path: "productDetail.0.planName",
  //     },

  //     {
  //       label: "Agent Code",
  //       path: "sourcingDetail.agentCode",
  //     },
  //     {
  //       label: "Agent Name",
  //       path: "sourcingDetail.agentName",
  //     },
  //      {
  //       label: "Sum Assured",
  //       path: "productDetail.0.sumAssured",
  //     },
  //      {
  //       label: "Customer Type",
  //       path: "productDetail.0.customerType",
  //     },
  //     {
  //       label: "Channel",
  //       path: "sourcingDetail.channelCode",
  //     },
  //      {
  //       label: "Sub Channel",
  //       path: "sourcingDetail.subChannelCode",
  //     },
  //     {
  //       label: "Policy Type",
  //       path: "productDetail.0.policyType",
  //     }, {
  //       label: "Application Issued Date",
  //       path: "productDetail.0.faceValue",
  //     },{
  //       label: "UW Decision Date",
  //       path: "productDetail.0.policyTerm",
  //     }
  //   ],REINSTATEMENT_TASK: [
  //     {
  //       label: "Product Name",
  //       path: "productDetail.0.name",
  //     },
  //      {
  //       label: "Plan Name",
  //       path: "productDetail.0.planName",
  //     },

  //     {
  //       label: "Agent Code",
  //       path: "sourcingDetail.agentCode",
  //     },
  //     {
  //       label: "Agent Name",
  //       path: "sourcingDetail.agentName",
  //     },
  //      {
  //       label: "Sum Assured",
  //       path: "productDetail.0.sumAssured",
  //     },
  //      {
  //       label: "Customer Type",
  //       path: "productDetail.0.customerType",
  //     },
  //     {
  //       label: "Channel",
  //       path: "sourcingDetail.channelCode",
  //     },
  //      {
  //       label: "Sub Channel",
  //       path: "sourcingDetail.subChannelCode",
  //     },
  //     {
  //       label: "Policy Type",
  //       path: "productDetail.0.policyType",
  //     }, {
  //       label: "Application Issued Date",
  //       path: "productDetail.0.faceValue",
  //     },{
  //       label: "UW Decision Date",
  //       path: "productDetail.0.policyTerm",
  //     },{
  //       label: "Policy Status",
  //       path: "productDetail.0.policyTerm",
  //     }
  //   ], DVT_TASK: [
  //     {
  //       label: "Product Name",
  //       path: "productDetail.0.name",
  //     },

  //     {
  //       label: "Agent Code",
  //       path: "sourcingDetail.agentCode",
  //     },
  //     {
  //       label: "Agent Name",
  //       path: "sourcingDetail.agentName",
  //     },
  //     {
  //       label: "Applied Sum Assured",
  //       path: "productDetail.0.sumAssured",
  //     },
  //      {
  //       label: "Customer Type",
  //       path: "productDetail.0.customerType",
  //     },
  //     {
  //       label: "Channel",
  //       path: "sourcingDetail.channelCode",
  //     },
  //      {
  //       label: "Sub Channel",
  //       path: "sourcingDetail.subChannelCode",
  //     },
  //     {
  //       label: "Policy Type",
  //       path: "productDetail.0.policyType",
  //     }, {
  //       label: "Premium",
  //       path: "productDetail.0.faceValue",
  //     },{
  //       label: "Policy Term",
  //       path: "productDetail.0.policyTerm",
  //     },{
  //       label: "Premium Payment Term",
  //       path: "productDetail.0.premiumPaymentTerm",
  //     },{
  //       label: "Payment Mode",
  //       path: "policyDetails.paymentMode",
  //     },{
  //       label: "Master Policy No.",
  //       path: "policyDetails.paymentMode",
  //     },{
  //       label: "LAN No.",
  //       path: "policyDetails.paymentMode",
  //     },{
  //       label: "Login Date",
  //       path: "policyDetails.paymentMode",
  //     }
  //   ],DVT_FORMAL_TASK: [
  //     {
  //       label: "Policy No.",
  //       path: "productDetail.0.name",
  //     },

  //     {
  //       label: "Agent Code",
  //       path: "sourcingDetail.agentCode",
  //     },
  //     {
  //       label: "Agent Name",
  //       path: "sourcingDetail.agentName",
  //     },
  //     {
  //       label: "Applied Sum Assured",
  //       path: "productDetail.0.sumAssured",
  //     },
  //     {
  //       label: "Channel",
  //       path: "sourcingDetail.channelCode",
  //     },
  //      {
  //       label: "Sub Channel",
  //       path: "sourcingDetail.subChannelCode",
  //     }, {
  //       label: "Premium",
  //       path: "productDetail.0.faceValue",
  //     },{
  //       label: "Cover Requested",
  //       path: "productDetail.0.policyTerm",
  //     },{
  //       label: "Cover Provided",
  //       path: "productDetail.0.premiumPaymentTerm",
  //     },{
  //       label: "Free Cover",
  //       path: "policyDetails.paymentMode",
  //     },{
  //       label: "Cover Above FCL",
  //       path: "policyDetails.paymentMode",
  //     }
  //   ]
  // };
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

  const items = getRoleFields(roleType ?? "").map((item) => ({
    label: item.label,
    value: getValue(
      applicationOverview as Record<string, unknown>,
      item.path
    ) ?? "-",
  }));
  const riderDetails = Array.isArray((applicationOverview as Record<string, unknown> | undefined)?.['riderDetails'])
    ? ((applicationOverview as Record<string, unknown>)['riderDetails'] as unknown[])
    : [];
  const riderColumns: Column<RiderRow>[] = [
    { key: "name", header: "Name", width: "5%" },
    { key: "type", header: "Option", width: "5%" },
    { key: "sumAssured", header: "Sum Assured", width: "5%" },
    { key: "paymentAmount", header: "Modal Premium", width: "50%" }]
  const riderRows: RiderRow[] =
    ((riderDetails as unknown) as Array<Record<string, unknown>>)
      .map((rider) => ({
        name: String(rider.name ?? rider.riderName ?? ""),
        type: String(rider.type ?? rider.option ?? ""),
        term: String(rider.term ?? rider.policyTerm ?? ""),
        sumAssured: String((rider as Record<string, unknown>).sumAssured ?? ""),
        paymentAmount: String((rider as Record<string, unknown>).paymentAmount ?? (rider as Record<string, unknown>).modalPremium ?? ""),
        ppt: String((rider as Record<string, unknown>).ppt ?? (rider as Record<string, unknown>).premiumPaymentTerm ?? ""),
      })) ?? [];
  return (
    <Container disableGutters>
      <CustomAccordion title={"Application Overview"} defaultExpanded>
        <Box sx={{ pl: 1 }}>
          <GridSection columns={6} items={items} />
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
    </Container>
  )
}
export default ApplicationOverview;