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
  const groupDetails = {
    ...toRecord(drsRecord.groupDetails),
    ...toRecord(applicationOverview.groupDetails),
  };
  const loanAmount = groupDetails.loanAmount as string | number | null | undefined;

  const details: GridItem[] = [
    {
      label: "Coverage Option",
      value: toDisplayValue(groupDetails.coverageOption),
    },
    {
      label: "Moratorium Period",
      value: toDisplayValue(groupDetails.moratoriumPeriod ?? groupDetails.moratorium),
    },
    {
      label: "Loan Term",
      value: toDisplayValue(groupDetails.loanTerm),
    },
    {
      label: "Share Of Loan Main Life(00)",
      value: toDisplayValue(groupDetails.shareOfLoan ?? groupDetails.shareOfLoanMainLife),
    },
    {
      label: "Loan Amount",
      value: formatCurrencyINR(loanAmount),
    },
    {
      label: "Coverage Status",
      value: toDisplayValue(groupDetails.coverageStatus),
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
    {
      label: "Master Policy Holder Code",
      value: toDisplayValue(groupDetails.masterPolicyHolderCode ?? groupDetails.masterPolicyHolder),
    },
  ];

  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        <CustomAccordion title="Group Policy Details" defaultExpanded={false}>
          <Box sx={{ p: 2, backgroundColor: "#f6f6f6", borderRadius: "8px" }}>
            <GridSection columns={3} items={details} />
          </Box>
        </CustomAccordion>
      </Box>
    </Container>
  );
};

export default GroupPolicyDetails;