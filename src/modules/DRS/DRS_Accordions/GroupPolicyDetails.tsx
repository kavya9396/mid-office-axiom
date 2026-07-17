import { Box, Container } from "@mui/material";
import { useSelector } from "react-redux";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import { GridSection, type GridItem } from "../../../components/layout/GridSection";
import type { RootState } from "../../../store/store";
import { formatDateWithOrdinalTime, formatCurrencyINR, toDisplayValue } from "../../../utils/helpers";

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const GroupPolicyDetails = () => {
  const { data } = useSelector((state: RootState) => state.drs);

  const drsRecord = toRecord(data as unknown);
  const applicationOverview = toRecord(drsRecord.applicationOverview);
  const sourcingDetail = {
    ...toRecord(drsRecord.sourcingDetail),
    ...toRecord(applicationOverview.sourcingDetail),
  };
  const basicDetails = {
    ...toRecord(drsRecord.basicDetails),
    ...toRecord(applicationOverview.basicDetails),
  };
  const productDetails = Array.isArray(applicationOverview.productDetail)
    ? (applicationOverview.productDetail as Array<Record<string, unknown>>)
    : Array.isArray(drsRecord.productDetail)
      ? (drsRecord.productDetail as Array<Record<string, unknown>>)
      : [];
  const firstProduct = productDetails[0] ?? {};
  const groupDetails = {
    ...toRecord(drsRecord.groupDetails),
    ...toRecord(applicationOverview.groupDetails),
  };
  const loanAmount = groupDetails.loanAmount as string | number | null | undefined;

  const details: GridItem[] = [
    {
      label: "Master Policy Holder Name",
      value: toDisplayValue(groupDetails.masterPolicyHolder ?? groupDetails.masterPolicyHolderName),
    },
    {
      label: "Master Policy Holder Code",
      value: toDisplayValue(groupDetails.masterPolicyHolderCode ?? groupDetails.masterPolicyHolderCd),
    },
    {
      label: "LAN Number",
      value: toDisplayValue(sourcingDetail.lanNumber ?? firstProduct.lanNumber),
    },
    {
      label: "Login Date",
      value: toDisplayValue(
        formatDateWithOrdinalTime(basicDetails.lastLoginDate ?? firstProduct.lastLoginDate) ||
          basicDetails.lastLoginDate ||
          firstProduct.lastLoginDate
      ),
    },
        {
      label: "Loan Amount",
      value: formatCurrencyINR(loanAmount),
    },
    {
      label: "Loan Term",
      value: toDisplayValue(groupDetails.loanTerm),
    },
    {
      label: "Loan Type",
      value: toDisplayValue(groupDetails.loanType),
    },
    {
      label: "Type Of Loan",
      value: toDisplayValue(groupDetails.typeOfLoan),
    },
    {
      label: "Coverage Option",
      value: toDisplayValue(groupDetails.coverageOption),
    },
    {
      label: "Moratorium Period",
      value: toDisplayValue(groupDetails.moratoriumPeriod ?? groupDetails.moratorium),
    },
    
    {
      label: "Share Of Loan Main Life(00)",
      value: toDisplayValue(groupDetails.shareOfLoan ?? groupDetails.shareOfLoanMainLife),
    },

    {
      label: "Coverage Status",
      value: toDisplayValue(groupDetails.coverageStatus),
    },
    
    {
      label: "Application Status Main Life(00)",
      value: toDisplayValue(groupDetails.applicantStatus ?? groupDetails.applicationStatusMainLife),
    },
    {
      label: "Moratorium",
      value: toDisplayValue(groupDetails.moratorium),
    },
    {
      label: "Bank Type",
      value: toDisplayValue(groupDetails.bankType),
    },
    {
      label: "Date Of Loan Disbursement",
      value: toDisplayValue(formatDateWithOrdinalTime(groupDetails.dateOfLoanDisbursement) || groupDetails.dateOfLoanDisbursement),
    },
  ];

  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        <CustomAccordion title="Group Policy Details" defaultExpanded>
          <Box sx={{ p: 2, backgroundColor: "#f6f6f6", borderRadius: "8px" }}>
            <GridSection columns={3} items={details} />
          </Box>
        </CustomAccordion>
      </Box>
    </Container>
  );
};

export default GroupPolicyDetails;