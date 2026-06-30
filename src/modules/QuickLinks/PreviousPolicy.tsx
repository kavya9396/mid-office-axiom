import { useEffect, useMemo, useState } from "react";
import { Box, Container, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import BackButton from "../../components/layout/BackButton";
import { KeyLeftArrowIcon, KeyRightArrowIcon } from "../../icons/Icons";
import { useAppContext } from "../../hooks/useAppContext";
import { getDRSPath } from "../../routes/routes";
import { useAppDispatch } from "../../store/hooks";
import { previousPoliciesThunk } from "../../store/thunks/previousPoliciesThunk";
import type { DRSRequest, PreviousPoliciesResponse, PreviousPolicyItem } from "../../types/drs.types";
import CustomButton from "../../components/ui/Button/Button";
import { useNavigate } from "react-router-dom";

const defaultRowsPerPage = 25;

const formatCurrency = (value?: string | number) => {
    if (value === undefined || value === null || value === "") {
        return "-";
    }

    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) {
        return String(value);
    }

    return `₹ ${numericValue.toLocaleString("en-IN")}`;
};

const normalizePolicies = (response: PreviousPoliciesResponse): PreviousPolicyItem[] => {
    if (Array.isArray(response.previousPolicies)) {
        return response.previousPolicies;
    }

    if (Array.isArray(response.policies)) {
        return response.policies;
    }

    return [];
};

const getIssueDate = (policy: PreviousPolicyItem) => policy.dateOfIssuance ?? policy.dateOfIssue ?? policy.issueDate ?? "-";

const getMedicalReceivedDate = (policy: PreviousPolicyItem) => policy.medicalsReceivedDate ?? policy.medicalReceivedDate ?? "-";

const PreviousPolicy = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { businessType, applicationNumber } = useAppContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [policies, setPolicies] = useState<PreviousPolicyItem[]>([]);
    const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
    const [page, setPage] = useState(0);

    const safeBusinessType = businessType ?? "retail";
    const safeApplicationId = applicationNumber ?? "";
    const roleType = localStorage.getItem("roleType") ?? "";
    const isApplicationIdMissing = !safeApplicationId;

    useEffect(() => {
        if (isApplicationIdMissing) {
            return;
        }

        const payload: DRSRequest = {
            applicationId: safeApplicationId,
            roleType,
        };

        const fetchPreviousPolicies = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await dispatch(previousPoliciesThunk(payload)).unwrap();
                setPolicies(normalizePolicies(response));
            } catch (fetchError) {
                setError(fetchError instanceof Error ? fetchError.message : "Failed to fetch previous policies.");
                setPolicies([]);
            } finally {
                setLoading(false);
            }
        };

        void fetchPreviousPolicies();
    }, [dispatch, isApplicationIdMissing, roleType, safeApplicationId]);

    const totalCount = policies.length;
    const totalPages = rowsPerPage === -1 ? 1 : Math.max(1, Math.ceil(totalCount / rowsPerPage));
    const paginatedRows = useMemo(
        () =>
            rowsPerPage === -1
                ? policies
                : policies.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [page, policies, rowsPerPage]
    );

    const startRecord = totalCount === 0 ? 0 : rowsPerPage === -1 ? 1 : page * rowsPerPage + 1;
    const endRecord =
        totalCount === 0
            ? 0
            : rowsPerPage === -1
                ? totalCount
                : Math.min((page + 1) * rowsPerPage, totalCount);

    return (
        <Container disableGutters sx={{ pb: 4 }}>
            <BackButton
                label="Back to DRS"
                onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationId))}
            />

            {isApplicationIdMissing && (
                <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
                    Application ID is missing.
                </Typography>
            )}

            {error && (
                <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
                    {error}
                </Typography>
            )}

            <Paper
                sx={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    border: "1px solid #D8D8D8",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 1,
                        pl: 2,
                        backgroundColor: "#004A80",
                        color: "#FFFFFF",
                    }}
                >
                    <Typography sx={{ fontSize: "18px", fontWeight: 700 }}>
                        Previous Policies
                    </Typography>
                </Box>

                <TableContainer>
                    <Table size="small" sx={{ minWidth: 940 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ backgroundColor: "#E9EEF3", fontWeight: 600 }}>Policy Number</TableCell>
                                <TableCell sx={{ backgroundColor: "#E9EEF3", fontWeight: 600 }}>Product Name</TableCell>
                                <TableCell sx={{ backgroundColor: "#E9EEF3", fontWeight: 600 }}>Product Type</TableCell>
                                <TableCell sx={{ backgroundColor: "#E9EEF3", fontWeight: 600 }}>Date Of Issuance</TableCell>
                                <TableCell sx={{ backgroundColor: "#E9EEF3", fontWeight: 600 }}>UW Decision</TableCell>
                                <TableCell sx={{ backgroundColor: "#E9EEF3", fontWeight: 600 }}>Sum Assured</TableCell>
                                <TableCell sx={{ backgroundColor: "#E9EEF3", fontWeight: 600 }}>Medicals Received Date</TableCell>
                                <TableCell sx={{ backgroundColor: "#E9EEF3", fontWeight: 600 }}>Validity</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} sx={{ py: 3 }}>
                                        <Typography sx={{ color: "#6B7280" }}>Loading previous policies...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : paginatedRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} sx={{ py: 3 }}>
                                        <Typography sx={{ color: "#6B7280" }}>No previous policy data found.</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedRows.map((policy, index) => (
                                    <TableRow key={`${policy.policyNumber ?? "policy"}-${index}`}>
                                        <TableCell sx={{ color: "#0E3762", textDecoration: "underline", fontWeight: 600 }}>
                                            {policy.policyNumber ?? "-"}
                                        </TableCell>
                                        <TableCell>{policy.productName ?? "-"}</TableCell>
                                        <TableCell>{policy.productType ?? "-"}</TableCell>
                                        <TableCell>{getIssueDate(policy)}</TableCell>
                                        <TableCell>{policy.uwDecision ?? "-"}</TableCell>
                                        <TableCell>{formatCurrency(policy.sumAssured)}</TableCell>
                                        <TableCell>{getMedicalReceivedDate(policy)}</TableCell>
                                        <TableCell>{policy.validity ?? "-"}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ borderTop: "1px solid #E0E0E0", px: 2, py: 1.5 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 2,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontSize: 14, color: "#444444" }}>Show</Typography>
                            <Select
                                value={rowsPerPage}
                                size="small"
                                onChange={(event) => {
                                    setRowsPerPage(Number(event.target.value));
                                    setPage(0);
                                }}
                                sx={{ minWidth: 80, height: 34, fontSize: 14 }}
                            >
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={25}>25</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                                <MenuItem value={100}>100</MenuItem>
                                <MenuItem value={-1}>All</MenuItem>
                            </Select>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <CustomButton onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                                <KeyLeftArrowIcon />
                                Previous
                            </CustomButton>

                            <Typography sx={{ px: 1, color: "#444444" }}>{page + 1}</Typography>

                            <CustomButton
                                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                                disabled={page >= totalPages - 1}
                            >
                                Next
                                <KeyRightArrowIcon />
                            </CustomButton>
                        </Box>

                        <Typography sx={{ fontSize: 14, color: "#444444" }}>
                            Showing {startRecord}-{endRecord} of {totalCount}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default PreviousPolicy;