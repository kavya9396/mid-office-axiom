import { useState } from "react";
import { useNavigate } from "react-router-dom";

import BackButton from "../../components/layout/BackButton";
import { useAppContext } from "../../hooks/useAppContext";
import { getDRSPath, getSearchApplicationPath } from "../../routes/routes";
import AuditTrailTable from "./AuditTrailTable";
import { Box } from "@mui/material";

interface SelectedCaseContext {
  applicationNo?: string;
  businessType?: string;
  source?: string;
  readOnly?: boolean;
}

interface AuditTrailPageProps {
  readOnly?: boolean;
}

const readSelectedCaseContext = (): SelectedCaseContext => {
  try {
    return JSON.parse(
      localStorage.getItem("selectedCaseContext") ?? "{}",
    ) as SelectedCaseContext;
  } catch {
    return {};
  }
};

const AuditTrailPage = ({ readOnly = false }: AuditTrailPageProps) => {
  const navigate = useNavigate();
  const { businessType, applicationNumber } = useAppContext();
  const [selectedCaseContext] = useState(readSelectedCaseContext);

  const safeBusinessType =
    String(
      businessType ??
      selectedCaseContext.businessType ??
      localStorage.getItem("businessType") ??
      "retail",
    )
      .trim()
      .toLowerCase() || "retail";

  const safeApplicationNumber =
    applicationNumber?.trim() ||
    selectedCaseContext.applicationNo?.trim() ||
    "";

  const isFromSearchApplication =
    selectedCaseContext.source === "searchApplication" &&
    selectedCaseContext.readOnly === true;
  const isReadOnlyMode = readOnly || isFromSearchApplication;

  const handleBack = () => {
    if (isReadOnlyMode) {
      navigate(getSearchApplicationPath(), {
        state: {
          restoreSearchResult: true,
          applicationNo: safeApplicationNumber,
        },
      });
      return;
    }

    navigate(getDRSPath(safeBusinessType, safeApplicationNumber));
  };

  return (
    <>
      <BackButton
        label={
          isReadOnlyMode
            ? "Back to Search Application"
            : "Back to DRS"
        }
        onClick={handleBack}
      />

      <Box sx={{ px: 1 }}>
        <AuditTrailTable
          readOnly={isReadOnlyMode}
          applicationNumber={safeApplicationNumber}
          businessType={safeBusinessType}
        />
      </Box>
    </>
  );
};

export default AuditTrailPage;
