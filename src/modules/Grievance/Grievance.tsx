import { Box, Checkbox, Container, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from '../../components/layout/BackButton';
import ConfirmationDialog from '../../components/layout/ConfirmationDialog';
import CustomButton from '../../components/ui/Button/Button';
import CustomTable, { type Column } from '../../components/ui/Table/Table';
import {
    CloseIcon,
    HeadphoneIcon,
    HouseIcon,
    NoteIcon,
    PlusIcon,
    UserProfileIcon,
} from '../../icons/Icons';
import { useAppDispatch } from '../../store/hooks';
import { grievanceThunk } from '../../store/thunks/grievanceThunk';
import { grievanceSubmitThunk } from '../../store/thunks/grievanceSubmitThunk';
import { referToItThunk } from '../../store/thunks/referToItThunk';
import type { GrievanceReport, GrievanceResponse } from '../../types/drs.types';
import { getDRSPath, getInboxPath } from '../../routes/routes';
import { columnFlex } from '../../utils/styles';

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

const cardStyles = {
    backgroundColor: "#fff",
    borderRadius: "8px",
};

const sectionTitleStyles = {
    fontSize: "16px",
    fontWeight: 700,
    color: "#1e1e1e",
    px: 2,
    py: 1.5,
    borderBottom: "1px solid #E6E6E6",
};

type GrievanceNavState = { applicationNumber?: string; businessType?: string } | null;

type UploadedDocument = {
    fileName: string;
    mimeType: string;
    size: number;
    contentBase64: string;
};

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
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

const Grievance = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const navState = (location.state as GrievanceNavState);
    const roleType = localStorage.getItem("roleType") ?? "";
    const safeApplicationId = navState?.applicationNumber ?? localStorage.getItem("applicationNumber") ?? "";
    const safeBusinessType = navState?.businessType ?? localStorage.getItem("businessType") ?? "retail";
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [grievanceData, setGrievanceData] = useState<GrievanceResponse | null>(null);
    const [fupCodes, setFupCodes] = useState<GrievanceReport[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [referToItLoading, setReferToItLoading] = useState(false);
    const [referToItError, setReferToItError] = useState<string | null>(null);
    const [referToItConfirmOpen, setReferToItConfirmOpen] = useState(false);

    const referToItConfirmationMessage = 'Kindly reconfirm if you want to proceed with the case as "Refer to IT"';

    useEffect(() => {
        const fetchGrievance = async () => {
            try {
                setLoading(true);
                setFetchError(null);
                const response = await dispatch(grievanceThunk({ applicationId: safeApplicationId })).unwrap();
                setGrievanceData(response);
                setFupCodes(response.fupCodes.map(r => ({ ...r })));
            } catch (err) {
                setFetchError(err instanceof Error ? err.message : "Failed to load grievance data.");
            } finally {
                setLoading(false);
            }
        };
        void fetchGrievance();
    }, [dispatch, safeApplicationId]);

    const handleRemarksUserChange = (rowId: number, value: string) => {
        setFupCodes(prev => prev.map(r => r.id === rowId ? { ...r, remarksUser: value } : r));
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
            setUploadError(error instanceof Error ? error.message : "Failed to process selected files.");
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const removeUploadedDocument = (fileName: string, size: number) => {
        setUploadedDocuments((prev) => prev.filter((item) => !(item.fileName === fileName && item.size === size)));
    };

    const handleSubmit = async () => {
        try {
            setSubmitLoading(true);
            setSubmitMessage(null);
            const response = await dispatch(grievanceSubmitThunk({
                applicationId: safeApplicationId,
                roleType,
                remarks,
                fupCodes,
                attachments: uploadedDocuments,
            })).unwrap();
            navigate(getInboxPath(safeBusinessType), {
                state: {
                    snackbarMessage: response.message || "Grievance submitted successfully",
                },
            });
        } catch (err) {
            setSubmitMessage(err instanceof Error ? err.message : "Failed to submit grievance.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleReferToIt = async () => {
        if (!safeApplicationId || !roleType) {
            setReferToItError("Missing application or role information.");
            return;
        }

        try {
            setReferToItLoading(true);
            setReferToItError(null);

            const response = await dispatch(referToItThunk({
                applicationId: safeApplicationId,
                roleType,
                decision: "Refer to IT",
            })).unwrap();

            navigate(getInboxPath(safeBusinessType), {
                state: {
                    snackbarMessage: response.message || "Case has been referred to IT successfully",
                },
            });
        } catch (error) {
            setReferToItError(error instanceof Error ? error.message : "Failed to refer to IT.");
        } finally {
            setReferToItLoading(false);
        }
    };

    const infoItems = [
        { icon: <NoteIcon />, label: "Policy Number", value: grievanceData?.policyNumber ?? "-" },
        { icon: <UserProfileIcon />, label: "Life Assured Name", value: grievanceData?.lifeAssuredName ?? "-" },
        { icon: <HouseIcon />, label: "Proposer Details", value: grievanceData?.proposerName ?? "-" },
    ];

    const allSelected = fupCodes.length > 0 && selectedIds.size === fupCodes.length;
    const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(fupCodes.map(r => r.id)));
    const toggleOne = (id: number) => setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) { next.delete(id); } else { next.add(id); } return next; });

    const columns: Column<GrievanceReport>[] = [
        {
            key: "id",
            width: "4%",
            headerRender: () => <Checkbox size="small" checked={allSelected} indeterminate={selectedIds.size > 0 && !allSelected} onChange={toggleAll} sx={{ p: 0 }} />,
            render: (_value, row) => <Checkbox size="small" checked={selectedIds.has((row as GrievanceReport).id)} onChange={() => toggleOne((row as GrievanceReport).id)} sx={{ p: 0 }} />,
        },
        {
            key: "fupCode",
            header: "FUP Code",
            width: "22%",
            render: (value) => <Typography sx={{ fontSize: 12 }}>{value as string}</Typography>,
        },
        {
            key: "lifeAssured",
            header: "Life Assured / Proposed",
            width: "22%",
            render: (value) => <Typography sx={{ fontSize: 12 }}>{value as string}</Typography>,
        },
        {
            key: "remarksUser",
            header: "Remarks By User",
            width: "28%",
            render: (_value, row) => (
                <TextField
                    value={(row as GrievanceReport).remarksUser}
                    onChange={(e) => handleRemarksUserChange((row as GrievanceReport).id, e.target.value)}
                    size="small"
                    fullWidth
                    placeholder="Enter remarks..."
                    sx={{
                        "& .MuiInputBase-root": { fontSize: 12, backgroundColor: "#fff", borderRadius: "6px" },
                        "& .MuiInputBase-input": { py: 0.75, px: 1 },
                    }}
                />
            ),
        },
        {
            key: "remarksTpa",
            header: "Remarks By TPA",
            width: "28%",
            render: (value) => <Typography sx={{ fontSize: 12 }}>{value as string}</Typography>,
        },
    ];

    return (
        <>
            <Box
                sx={{
                    width: "100%",
                    ...columnFlex,
                    backgroundColor: "#F0F3F8",
                    minHeight: "90vh",
                    pb:2
                }}
            >
                <Container disableGutters>
                    <BackButton
                        label="Back to DRS"
                        onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationId))}
                    />
                </Container>

                <Container disableGutters>
                    <Typography sx={{ fontSize: 16, fontWeight: 700, ml: 1 }}>
                        Raise Grievance
                    </Typography>

                    {fetchError && (
                        <Typography sx={{ color: "#DE2C3B", mt: 1, ml: 1, fontSize: 13 }}>{fetchError}</Typography>
                    )}

                    <Box
                        sx={{
                            display: "flex",
                            width: "100%",
                            backgroundColor: "#fff",
                            borderRadius: "8px",
                            mt: 1,
                        }}
                    >
                        {infoItems.map((item, index) => (
                            <Box
                                key={index}
                                sx={{
                                    flex: 1,
                                    display: "flex",
                                    gap: 1.5,
                                    p: 4,
                                    borderRight: index !== infoItems.length - 1 ? "1px solid #E6E6E6" : "none",
                                }}
                            >
                                {item.icon}
                                <Box>
                                    <Typography sx={{ fontSize: 12 }}>{item.label}</Typography>
                                    <Typography sx={{ fontWeight: 600 }}>{item.value}</Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Container>

                <Container disableGutters>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Box sx={{ flex: 1, mt: 4 }}>
                            {loading ? (
                                <Typography sx={{ color: "#6B7280", mt: 2 }}>Loading reports...</Typography>
                            ) : (
                                <CustomTable<GrievanceReport>
                                    title="All Reports"
                                    columns={columns}
                                    data={fupCodes}
                                />
                            )}
                        </Box>

                        <Box sx={{ width: 276, ...columnFlex, gap: 2, mt: 4 }}>
                            <Box sx={cardStyles}>
                                <Typography sx={sectionTitleStyles}>
                                    Supporting Documents
                                </Typography>

                                <Box sx={{ p: 2 }}>
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
                                        <Typography sx={{ textAlign: "center", fontSize: 12 }}>
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
                                                        maxWidth: "100%",
                                                    }}
                                                >
                                                    <Typography
                                                        sx={{
                                                            color: "#444",
                                                            fontSize: "14px",
                                                            fontWeight: 400,
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                            maxWidth: "160px",
                                                        }}
                                                    >
                                                        {file.fileName}
                                                    </Typography>
                                                    <Box
                                                        component="span"
                                                        sx={{ color: "#444", display: "flex", cursor: "pointer" }}
                                                        onClick={() => removeUploadedDocument(file.fileName, file.size)}
                                                    >
                                                        <CloseIcon width={16} height={16} />
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

                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        placeholder="Add remarks..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        sx={{ mt: 2 }}
                                    />

                                    {submitMessage && (
                                        <Typography sx={{ fontSize: 12, mt: 1, color: submitMessage.toLowerCase().includes("fail") ? "#DE2C3B" : "#0F8A3D" }}>
                                            {submitMessage}
                                        </Typography>
                                    )}

                                    <CustomButton
                                        fullWidth
                                        sx={{ mt: 2, borderRadius: "50px" }}
                                        onClick={handleSubmit}
                                        disabled={submitLoading}
                                    >
                                        {submitLoading ? "Submitting..." : "Raise Grievance"}
                                    </CustomButton>
                                </Box>
                            </Box>

                            <Box
                                sx={{
                                    ...cardStyles,
                                    p: 2,
                                    display: "flex",
                                    gap: 1,
                                    alignItems: "center",
                                    cursor: referToItLoading ? "not-allowed" : "pointer",
                                    opacity: referToItLoading ? 0.7 : 1,
                                }}
                                onClick={() => {
                                    if (referToItLoading) return;
                                    setReferToItConfirmOpen(true);
                                }}
                            >
                                <HeadphoneIcon />
                                <Typography sx={{ fontWeight: "600" }}>
                                    {referToItLoading ? "Submitting..." : "Refer to IT"}
                                </Typography>
                            </Box>
                            {referToItError && (
                                <Typography sx={{ color: "#DE2C3B", fontSize: 12, px: 1 }}>
                                    {referToItError}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Container>
            </Box>

            <ConfirmationDialog
                open={referToItConfirmOpen}
                message={referToItConfirmationMessage}
                onClose={() => setReferToItConfirmOpen(false)}
                onConfirm={() => {
                    void handleReferToIt();
                }}
            />
        </>
    );
};

export default Grievance;