import { Box, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import { useAppContext } from "../../../hooks/useAppContext";
import { useAppDispatch } from "../../../store/hooks";
import { openOtherTasksThunk } from "../../../store/thunks/openOtherTasksThunk";
import type { OpenOtherTaskRow, OpenOtherTasks, OpenOtherTasksResponse } from "../../../types/drs.types";

const toDisplay = (value: unknown) => {
  const text = String(value ?? "").trim();
  return text || "-";
};

const normalizeOpenTaskRows = (rows: unknown): OpenOtherTasks => {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row) => {
    const item = row as Record<string, unknown>;

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

const extractOpenTaskRows = (response: OpenOtherTasksResponse): OpenOtherTasks => {
  return normalizeOpenTaskRows(
    response.openOtherTasks ??
      response.quickLinks?.openOtherTasks ??
      response.data?.openOtherTasks ??
      response.data?.quickLinks?.openOtherTasks,
  );
};

const headers: Array<{ key: keyof OpenOtherTaskRow; label: string }> = [
  { key: "serviceID", label: "Service ID" },
  { key: "ct", label: "CT" },
  { key: "st", label: "ST" },
  { key: "breDate", label: "BRE Date" },
  { key: "breDecision", label: "BRE Decision" },
  { key: "breDiscrepancy", label: "BRE Discrepancy" },
  { key: "breRemarks", label: "BRE Remarks" },
  { key: "userPool", label: "User Pool" },
];

const OpenOtherTasksAccordion = () => {
  const dispatch = useAppDispatch();
  const { applicationNumber } = useAppContext();
  const [rows, setRows] = useState<OpenOtherTasks>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOpenTasks = async () => {
      if (!applicationNumber) {
        setRows([]);
        return;
      }

      try {
        setLoading(true);
        const roleType = localStorage.getItem("roleType") ?? "";

        const response = await dispatch(
          openOtherTasksThunk({
            applicationId: applicationNumber,
            roleType,
          }),
        ).unwrap();

        setRows(extractOpenTaskRows(response));
      } catch (error) {
        console.error("Failed to load open tasks:", error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    void loadOpenTasks();
  }, [applicationNumber, dispatch]);

  return (
    <Container disableGutters>
      <Box sx={{ mt: 2 }}>
        <CustomAccordion title="Open/Other Tasks" defaultExpanded>
          <Box sx={{ mt: 1, p: 1.5, borderRadius: "8px", backgroundColor: "#F6F6F6" }}>
            <Box sx={{ backgroundColor: "#0B4F8C", px: 2, py: 1, borderRadius: "8px 8px 0 0" }}>
              <Typography sx={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>
                Pre Issuance Servicing
              </Typography>
            </Box>

            <TableContainer sx={{ border: "1px solid #E5E7EB", borderTop: 0, borderRadius: "0 0 8px 8px", backgroundColor: "#fff" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableCell key={header.key} sx={{ fontSize: 11, color: "#4B5563", fontWeight: 600, py: 1 }}>
                        {header.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={`${row.serviceID}-${index}`}>
                      {headers.map((header) => {
                        const value = row[header.key];
                        const isLink = header.key === "serviceID";
                        return (
                          <TableCell key={header.key} sx={{ fontSize: 11, color: isLink ? "#0B4F8C" : "#374151", py: 1.25 }}>
                            {isLink ? (
                              <Typography component="span" sx={{ fontSize: 11, color: "#0B4F8C", textDecoration: "underline", cursor: "pointer" }}>
                                {value}
                              </Typography>
                            ) : (
                              value
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}

                  {!loading && rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={headers.length} sx={{ textAlign: "center", py: 2, fontSize: 12, color: "#6B7280" }}>
                        No open/other tasks found.
                      </TableCell>
                    </TableRow>
                  )}

                  {loading && (
                    <TableRow>
                      <TableCell colSpan={headers.length} sx={{ textAlign: "center", py: 2, fontSize: 12, color: "#6B7280" }}>
                        Loading open/other tasks...
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CustomAccordion>
      </Box>
    </Container>
  );
};

export default OpenOtherTasksAccordion;
