import { Box } from "@mui/material";
import { useMemo, useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTabs, { type TabItem } from "../../../components/ui/Tabs/Tabs";
import { useAppSelector } from "../../../store/hooks";
import CustomerProfile from "./CustomerProfile";
import DocumentRequired from "./DocumentRequired";
import MedicalInsuranceDetails from "./MedicalInsuranceDetails";

type PreLoginTab = "individualCase" | "keymanInsurance" | "partnershipInsurance" | "employeeEmployerInsurance";

const preLoginTabs: TabItem<PreLoginTab>[] = [
  { key: "individualCase", label: "Individual Case" },
  { key: "keymanInsurance", label: "Keyman Insurance" },
  { key: "partnershipInsurance", label: "Partnership Insurance" },
  { key: "employeeEmployerInsurance", label: "Employee - Employer Insurance" },
];

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const PreLogin = () => {
  const data = useAppSelector((state) => state.drs.data);
  const [activeTab, setActiveTab] = useState<PreLoginTab>("individualCase");
  const activeTabData = useMemo(() => {
    const dataRecord = toRecord(data);
    const preLoginData = toRecord(dataRecord.preLogin);
    const selectedCaseData = toRecord(preLoginData[activeTab]);

    return Object.keys(selectedCaseData).length > 0
      ? { ...dataRecord, ...selectedCaseData }
      : data;
  }, [activeTab, data]);

  return (
    // <Container disableGutters>
      <Box sx={{ p:1 }}>
        <CustomAccordion title="Pre Login" defaultExpanded>
          <Box sx={{ display: "flex", justifyContent: "center", my: 1, width: "100%" }}>
            <CustomTabs tabs={preLoginTabs} value={activeTab} onChange={setActiveTab} />
          </Box>
          <Box key={activeTab} sx={{ mt: 2 }}>
            <CustomerProfile data={activeTabData} />
            <MedicalInsuranceDetails data={activeTabData} />
            <DocumentRequired data={activeTabData} />
          </Box>
        </CustomAccordion>
      </Box>
    // </Container>
  );
};

export default PreLogin;
