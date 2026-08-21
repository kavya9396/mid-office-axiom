import {
    Box,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import CustomTextField from "../../components/ui/TextField/TextField";
import CustomAccordion from "../../components/ui/Accordion/Accordion";
import CustomButton from "../../components/ui/Button/Button";
import {
    CloseIcon,
    PlusIcon,
} from "../../icons/Icons";
import { useAppContext } from "../../hooks/useAppContext";
import { useNavigate } from "react-router-dom";
import { getInboxPath } from "../../routes/routes";
import { useAppDispatch } from "../../store/hooks";
import { grievanceApplicationThunk } from "../../store/thunks/grievanceApplicationThunk";
import { grievanceApplicationSubmitThunk } from "../../store/thunks/grievanceApplicationSubmitThunk";
import type {
    GrievanceApplicationReport,
    GrievanceApplicationResponse,
} from "../../types/drs.types";
import { columnFlex } from "../../utils/styles";

type UploadedDocument = {
    fileName: string;
    mimeType: string;
    size: number;
    contentBase64: string;
};

const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== "string") {
                reject(new Error("Failed to read file."));
                return;
            }

            const [, base64 = ""] = reader.result.split(",");
            resolve(base64);
        };
        reader.onerror = () => reject(new Error("Failed to read file."));
        reader.readAsDataURL(file);
    });

const uploadBoxStyles = {
    width: "100%",
    height: 150,
    backgroundColor: "#F0F0F0",
    border: "2px dashed #DDD",
    borderRadius: "8px",
    ...columnFlex,
    justifyContent: "center",
    alignItems: "center",
    gap: 1,
};

const GrievanceApplication = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { businessType, applicationNumber } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const roleType = localStorage.getItem("roleType") ?? "";

    const safeBusinessType = businessType ?? "retail";
    const safeApplicationId =
        applicationNumber ?? localStorage.getItem("applicationNumber") ?? "";

    const [applicationData, setApplicationData] =
        useState<GrievanceApplicationResponse | null>(null);
    const [reports, setReports] = useState<GrievanceApplicationReport[]>([]);
    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>(
        [],
    );
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                setLoading(true);
                setFetchError(null);

                const response = await dispatch(
                    grievanceApplicationThunk({
                        applicationId: safeApplicationId,
                        roleType,
                    }),
                ).unwrap();

                setApplicationData(response);
                setReports(response.reports ?? []);
            } catch (error) {
                setFetchError(
                    error instanceof Error
                        ? error.message
                        : "Failed to load grievance application.",
                );
            } finally {
                setLoading(false);
            }
        };

        void fetchApplication();
    }, [dispatch, roleType, safeApplicationId]);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFilesSelected = async (files: FileList | null) => {
        if (!files || files.length === 0) {
            return;
        }

        try {
            setUploadError(null);

            const preparedFiles = await Promise.all(
                Array.from(files).map(async (file) => ({
                    fileName: file.name,
                    mimeType: file.type || "application/octet-stream",
                    size: file.size,
                    contentBase64: await fileToBase64(file),
                })),
            );

            setUploadedDocuments((prev) => {
                const merged = [...prev, ...preparedFiles];
                const deduped = new Map<string, UploadedDocument>();

                merged.forEach((item) => {
                    deduped.set(`${item.fileName}-${item.size}-${item.mimeType}`, item);
                });

                return Array.from(deduped.values());
            });
        } catch (error) {
            setUploadError(
                error instanceof Error
                    ? error.message
                    : "Failed to process selected files.",
            );
        }
    };

    const removeUploadedDocument = (fileName: string, size: number) => {
        setUploadedDocuments((prev) =>
            prev.filter((item) => !(item.fileName === fileName && item.size === size)),
        );
    };

    const handleSubmit = async () => {
        try {
            setSubmitLoading(true);
            setSubmitMessage(null);

            const response = await dispatch(
                grievanceApplicationSubmitThunk({
                    applicationId: safeApplicationId,
                    roleType,
                    selectedReportIds: reports.map((report) => report.id),
                    attachments: uploadedDocuments,
                }),
            ).unwrap();

            navigate(getInboxPath(safeBusinessType), {
                state: {
                    snackbarMessage:
                        response.message || "Grievance application submitted successfully",
                },
            });
        } catch (error) {
            setSubmitMessage(
                error instanceof Error
                    ? error.message
                    : "Failed to submit grievance application.",
            );
        } finally {
            setSubmitLoading(false);
        }
    };

    return (
        <Box sx={{ backgroundColor: "#F0F3F8", minHeight: "90vh", pb: 4 }}>
         

            <Container disableGutters>
                <Typography sx={{ fontSize: 16, fontWeight: 700, mb:2 }}>
                    Grievance Application
                </Typography>

                {fetchError && (
                    <Typography sx={{ color: "#DE2C3B", mb: 1.5, fontSize: 13 }}>
                        {fetchError}
                    </Typography>
                )}

                <CustomAccordion title="Application Details" defaultExpanded>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "repeat(1, 1fr)", md: "repeat(4, 1fr)" },
                            gap: 2,
                            backgroundColor: "#F6F6F6",
                            border: "1px solid #E6E6E6",
                            borderRadius: "8px",
                            p: 2,
                        }}
                    >
                        <Box>
                            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Application Number</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                                {applicationData?.applicationId ?? "-"}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Product</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                                {applicationData?.productOpted ?? "-"}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Premium</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                                {applicationData?.premium ?? "-"}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Sum Assured</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                                {applicationData?.sumAssured ?? "-"}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Medical Raised Date</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                                {applicationData?.medicalRaisedDate ?? "-"}
                            </Typography>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: 12, color: "#6B7280" }}>Medicals Received Date</Typography>
                            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                                {applicationData?.medicalsReceivedDate ?? "-"}
                            </Typography>
                        </Box>
                    </Box>
                </CustomAccordion>

                <Box sx={{ mt: 2 }}>
                    <Paper sx={{ borderRadius: "10px", overflow: "hidden" }}>
                        <Box
                            sx={{
                                backgroundColor: "#004A80",
                                color: "#fff",
                                px: 3,
                                py: 1.2,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>All Reports</Typography>
                        </Box>

                        <Box sx={{ p: 1.5, backgroundColor: "#fff" }}>
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>User</TableCell>
                                            <TableCell>Reports</TableCell>
                                            <TableCell>Life Assured/Proposer</TableCell>
                                            <TableCell>Remarks By User</TableCell>
                                            <TableCell>Grievance Raised Date</TableCell>
                                            <TableCell>Grievance Raised Remarks</TableCell>
                                            <TableCell>Grievance Received Date</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                                                    Loading reports...
                                                </TableCell>
                                            </TableRow>
                                        ) : reports.length > 0 ? (
                                            reports.map((row) => (
                                                <TableRow key={row.id} hover>
                                                    <TableCell>{row.user}</TableCell>
                                                    <TableCell>{row.reports}</TableCell>
                                                    <TableCell>{row.lifeAssuredProposer}</TableCell>
                                                    <TableCell>{row.remarksByUser}</TableCell>
                                                    <TableCell>{row.grievanceRaisedDate}</TableCell>
                                                    <TableCell>{row.grievanceRaisedRemarks}</TableCell>
                                                    <TableCell>{row.grievanceReceivedDate}</TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} sx={{ textAlign: "center", py: 4 }}>
                                                    No Data Found!
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    </Paper>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <CustomAccordion title="Remarks" defaultExpanded>
                        <Box sx={{ backgroundColor: "#F6F6F6", borderRadius: "8px", p: 2 }}>
                            <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#444", mb: 1 }}>
                                Remarks
                            </Typography>
                            <CustomTextField
                                fullWidth
                                multiline
                                minRows={3}
                                placeholder="Enter remarks..."
                                value={remarks}
                                onChange={(e) => {
                                    if (e.target.value.length <= 10000) {
                                        setRemarks(e.target.value);
                                    }
                                }}
                                variant="outlined"
                                size="small"
                                sx={{ backgroundColor: "#fff", borderRadius: "10px" }}
                            />
                            <Typography sx={{ display: "flex", justifyContent: "flex-end", fontSize: "12px", color: "#888", mt: 0.5 }}>
                                {remarks.length}/10000
                            </Typography>
                        </Box>
                    </CustomAccordion>
                </Box>

                <Box sx={{ mt: 2 }}>
                    <CustomAccordion title="Supporting Documents" defaultExpanded>
                        <Box sx={{ backgroundColor: "#F7F7F8", borderRadius: "8px", p: 2 }}>
                            <Box
                                sx={{ ...uploadBoxStyles, cursor: "pointer" }}
                                onClick={handleUploadClick}
                                onDrop={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    void handleFilesSelected(event.dataTransfer.files);
                                }}
                                onDragOver={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }}
                            >
                                <PlusIcon />
                                <Typography sx={{ textAlign: "center", fontSize: 13 }}>
                                    Upload or Drag document
                                </Typography>
                            </Box>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                multiple
                                style={{ display: "none" }}
                                onChange={(event) => {
                                    void handleFilesSelected(event.target.files);
                                    event.target.value = "";
                                }}
                            />

                            {uploadedDocuments.length > 0 && (
                                <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                                    {uploadedDocuments.map((file) => (
                                        <Box
                                            key={`${file.fileName}-${file.size}`}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 0.5,
                                                border: "1px solid #C8DFEE",
                                                backgroundColor: "#EBF1F5",
                                                px: 1,
                                                py: 0.5,
                                                borderRadius: "8px",
                                            }}
                                        >
                                            <Typography sx={{ color: "#444", fontSize: "12px", maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                {file.fileName}
                                            </Typography>
                                            <Box
                                                component="span"
                                                sx={{ color: "#444", display: "flex", cursor: "pointer" }}
                                                onClick={() => removeUploadedDocument(file.fileName, file.size)}
                                            >
                                                <CloseIcon width={14} height={14} />
                                            </Box>
                                        </Box>
                                    ))}
                                </Box>
                            )}

                            {uploadError && (
                                <Typography sx={{ fontSize: 12, mt: 1, color: "#DE2C3B" }}>
                                    {uploadError}
                                </Typography>
                            )}

                            <Box sx={{ ...columnFlex, alignItems: "flex-start", mt: 2 }}>
                                {submitMessage && (
                                    <Typography
                                        sx={{
                                            fontSize: 12,
                                            mb: 1,
                                            color: submitMessage.toLowerCase().includes("fail")
                                                ? "#DE2C3B"
                                                : "#0F8A3D",
                                        }}
                                    >
                                        {submitMessage}
                                    </Typography>
                                )}
                                <CustomButton
                                    sx={{ borderRadius: "50px", minWidth: 220 }}
                                    onClick={handleSubmit}
                                    disabled={submitLoading}
                                >
                                    {submitLoading ? "Submitting..." : "Submit Grievance Application"}
                                </CustomButton>
                            </Box>
                        </Box>
                    </CustomAccordion>
                </Box>
            </Container>
        </Box>
    );
};

export default GrievanceApplication;