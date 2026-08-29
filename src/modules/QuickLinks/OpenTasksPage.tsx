import { Box, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import BackButton from "../../components/layout/BackButton";
import type { Column } from "../../components/ui/Table/Table";
import CustomTable from "../../components/ui/Table/Table";
import { useAppContext } from "../../hooks/useAppContext";
import { getDRSPath, getSearchApplicationPath } from "../../routes/routes";
import { useAppDispatch } from "../../store/hooks";
import { drsThunk } from "../../store/thunks/drsThunk";
import type { RootState } from "../../store/store";
import type { OpenOtherTaskRow, OpenOtherTasks } from "../../types/drs.types";

const SEARCH_RESULT_STORAGE_KEY = "searchApplicationDrsData";

const openTaskColumns: Column<OpenOtherTaskRow>[] = [
  {
    key: "serviceID",
    header: "Service ID",
    width: "13%",
    render: (value) => (
      <Typography
        component="span"
        sx={{
          color: "#0B4F8C",
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        {String(value ?? "-")}
      </Typography>
    ),
  },
  { key: "ct", header: "CT", width: "8%" },
  { key: "st", header: "ST", width: "8%" },
  { key: "breDate", header: "BRE Date", width: "14%" },
  { key: "breDecision", header: "BRE Decision", width: "14%" },
  { key: "breDiscrepancy", header: "BRE Discrepancy", width: "16%" },
  { key: "breRemarks", header: "BRE Remarks", width: "16%" },
  { key: "userPool", header: "User Pool", width: "11%" },
];

interface SelectedCaseContext {
  applicationNo?: string;
  businessType?: string;
  source?: string;
  readOnly?: boolean;
}

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const readSelectedCaseContext = (): SelectedCaseContext => {
  try {
    return JSON.parse(
      localStorage.getItem("selectedCaseContext") ?? "{}",
    ) as SelectedCaseContext;
  } catch {
    return {};
  }
};

const readCachedSearchQuickLinks = (): Record<string, unknown> => {
  try {
    const rawValue = localStorage.getItem(SEARCH_RESULT_STORAGE_KEY);
    if (!rawValue) return {};

    const storedResult = toRecord(JSON.parse(rawValue));
    return toRecord(toRecord(storedResult.data).quickLinks);
  } catch {
    return {};
  }
};

const toDisplay = (value: unknown) => String(value ?? "").trim() || "-";

const normalizeOpenTaskRows = (rows: unknown): OpenOtherTasks => {
  if (!Array.isArray(rows)) return [];

  return rows.map((row) => {
    const item = toRecord(row);

    return {
      serviceID: toDisplay(item.serviceID),
      ct: toDisplay(item.ct),
      st: toDisplay(item.st),
      breDate: toDisplay(item.breDate),
      breDecision: toDisplay(item.breDecision ?? item.status),
      breDiscrepancy: toDisplay(item.breDiscrepancy),
      breRemarks: toDisplay(item.breRemarks),
      userPool: toDisplay(item.userPool ?? item.userName),
    };
  });
};

const OpenTasksPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { businessType, applicationNumber } = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);

  const [selectedCaseContext] = useState(readSelectedCaseContext);
  const [cachedSearchQuickLinks] = useState(readCachedSearchQuickLinks);
  const [quickLinksData, setQuickLinksData] =
    useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);

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

  const reduxQuickLinks = useMemo(
    () =>
      toRecord(
        (drsData as unknown as Record<string, unknown> | null)?.quickLinks,
      ),
    [drsData],
  );

  const hasReduxOpenTasks = Array.isArray(reduxQuickLinks.openOtherTasks);
  const hasCachedSearchOpenTasks =
    isFromSearchApplication &&
    Array.isArray(cachedSearchQuickLinks.openOtherTasks);

  const effectiveQuickLinksData = !safeApplicationNumber
    ? null
    : hasReduxOpenTasks
      ? reduxQuickLinks
      : hasCachedSearchOpenTasks
        ? cachedSearchQuickLinks
        : quickLinksData;

  const rows = useMemo<OpenOtherTasks>(
    () => normalizeOpenTaskRows(effectiveQuickLinksData?.openOtherTasks),
    [effectiveQuickLinksData],
  );

  useEffect(() => {
    if (
      !safeApplicationNumber ||
      hasReduxOpenTasks ||
      hasCachedSearchOpenTasks
    ) {
      return;
    }

    const loadOpenTasks = async () => {
      try {
        setLoading(true);

        const roleType = localStorage.getItem("roleType") ?? "";
        const userId =
          (
            localStorage.getItem("userId") ??
            localStorage.getItem("username") ??
            "System"
          ).trim() || "System";

        const response = await dispatch(
          drsThunk({
            applicationNo: safeApplicationNumber,
            userId,
            roleType,
            businessType: safeBusinessType,
            sections: ["quickLinks"],
          }),
        ).unwrap();

        setQuickLinksData(
          toRecord(
            (response.data as unknown as Record<string, unknown>)?.quickLinks,
          ),
        );
      } catch (error) {
        console.error("Failed to load open tasks:", error);
        setQuickLinksData(null);
      } finally {
        setLoading(false);
      }
    };

    void loadOpenTasks();
  }, [
    dispatch,
    hasCachedSearchOpenTasks,
    hasReduxOpenTasks,
    safeApplicationNumber,
    safeBusinessType,
  ]);

  const handleBack = () => {
    if (isFromSearchApplication) {
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

  const tableTitle = `Pre Issuance Servicing${loading ? " (Loading...)" : ""}`;

  return (
    <Container maxWidth={false} disableGutters>
      <BackButton
        label={
          isFromSearchApplication
            ? "Back to Search Application"
            : "Back to DRS"
        }
        onClick={handleBack}
      />

      <Box sx={{ mt: 1 }}>
        {rows.length > 0 ? (
          <CustomTable<OpenOtherTaskRow>
            title={tableTitle}
            columns={openTaskColumns}
            data={rows}
          />
        ) : (
          <Typography sx={{ fontSize: "14px", fontWeight: 600 }}>
            {loading ? "Loading open tasks..." : "No open tasks found"}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default OpenTasksPage;
