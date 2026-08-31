import {
    Alert,
    Box,
    Button,
    FormControl,
    FormHelperText,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
} from "react";
import BackButton from "../../components/layout/BackButton";
import { getInboxPath } from "../../routes/routes";
import { useNavigate } from "react-router-dom";

const ACTIVITIES = ["Comments", "PTLR", "Reassignment"] as const;

const COMMENT_TYPES = [
    "Dedupe Exception",
    "ADBR/IC",
    "IIB Negative Hit",
    "Experian Fraud",
    "LitMAss",
    "DRS High Risk",
    "Overinsured",
    "K-Claim Flag Indicator",
] as const;

type Activity = (typeof ACTIVITIES)[number];
type CommentType = (typeof COMMENT_TYPES)[number];

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_FILE_EXTENSIONS = [".xls", ".xlsx"];

const isExcelFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    return ALLOWED_FILE_EXTENSIONS.some((extension) =>
        fileName.endsWith(extension),
    );
};

const escapeXml = (value: string) =>
    value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");

const BulkUpload = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [activity, setActivity] = useState<Activity | "">("");
    const [commentType, setCommentType] = useState<CommentType | "">("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileError, setFileError] = useState("");
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const isCommentsSelected = activity === "Comments";
    const isSelectionComplete =
        Boolean(activity) && (!isCommentsSelected || Boolean(commentType));

    const handleActivityChange = (value: Activity) => {
        setActivity(value);
        setSelectedFile(null);
        setFileError("");

        if (value !== "Comments") {
            setCommentType("");
        }
    };

    const validateAndSetFile = (file?: File) => {
        if (!file) return;

        if (!isExcelFile(file)) {
            setSelectedFile(null);
            setFileError("Please upload a valid .xls or .xlsx file.");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            setSelectedFile(null);
            setFileError("The Excel file must be 10 MB or smaller.");
            return;
        }

        setSelectedFile(file);
        setFileError("");
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        validateAndSetFile(event.target.files?.[0]);
        event.target.value = "";
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        validateAndSetFile(event.dataTransfer.files?.[0]);
    };

    const handleDownloadTemplate = () => {
        if (!activity) return;

        const headers =
            activity === "Comments"
                ? ["Application Number", "Activity", "Type of Comment", "Comments"]
                : activity === "PTLR"
                    ? ["Application Number", "Activity", "PTLR"]
                    : ["Application Number", "Activity", "Assign To"];

        const selectedValues =
            activity === "Comments"
                ? ["", activity, commentType, ""]
                : ["", activity, ""];

        const createRow = (values: readonly string[]) =>
            `<Row>${values
                .map(
                    (value) =>
                        `<Cell><Data ss:Type="String">${escapeXml(value)}</Data></Cell>`,
                )
                .join("")}</Row>`;

        const excelXml = `<?xml version="1.0"?>
            <?mso-application progid="Excel.Sheet"?>
            <Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
            xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:x="urn:schemas-microsoft-com:office:excel"
            xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
            <Worksheet ss:Name="Bulk Upload">
            <Table>
            ${createRow(headers)}
            ${createRow(selectedValues)}
            </Table>
            </Worksheet>
            </Workbook>`;

        const blob = new Blob([excelXml], {
            type: "application/vnd.ms-excel;charset=utf-8",
        });
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = downloadUrl;
        link.download = `${activity.toLowerCase().replaceAll(" ", "-")}-bulk-upload-template.xls`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(downloadUrl);
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setFileError("");
    };

    const handleSubmit = () => {
        if (!selectedFile) return;

        setSnackbarOpen(true);
        setActivity("");
        setCommentType("");
        setSelectedFile(null);
        setIsDragging(false);
        setFileError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <>
         <Box sx={{ px: 1 }}>
                  <BackButton
                    label="Back to Inbox"
                    onClick={() => navigate(getInboxPath())}
                  />
                </Box>

        <Box
            sx={{
                minHeight: "100%",
                px: { xs: 2, md: 4 },
                py: 4,
            }}
        >
            <Box sx={{ width: "100%", mx: "auto" }}>
                <Typography variant="h4" color="text.primary" sx={{ fontWeight: 700 }}>
                    Bulk Upload
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    Select an activity, download its template, and upload the completed
                    Excel file.
                </Typography>

                <Paper
                    elevation={0}
                    sx={{
                        mt: 3,
                        p: { xs: 2, sm: 3 },
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                    }}
                >
                    <Stack spacing={3}>
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    md: isCommentsSelected ? "1fr 1fr" : "1fr",
                                },
                                gap: 2.5,
                            }}
                        >
                            <FormControl fullWidth required>
                                <InputLabel id="activity-label">Select Activity</InputLabel>
                                <Select
                                    labelId="activity-label"
                                    value={activity}
                                    label="Select Activity"
                                    onChange={(event) =>
                                        handleActivityChange(event.target.value as Activity)
                                    }
                                >
                                    {ACTIVITIES.map((item) => (
                                        <MenuItem key={item} value={item}>
                                            {item}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {isCommentsSelected && (
                                <FormControl fullWidth required>
                                    <InputLabel id="comment-type-label">
                                        Type of Comment
                                    </InputLabel>
                                    <Select
                                        labelId="comment-type-label"
                                        value={commentType}
                                        label="Type of Comment"
                                        onChange={(event) => {
                                            setCommentType(event.target.value as CommentType);
                                            setSelectedFile(null);
                                            setFileError("");
                                        }}
                                    >
                                        {COMMENT_TYPES.map((item) => (
                                            <MenuItem key={item} value={item}>
                                                {item}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    <FormHelperText>
                                        Select the comment category for this upload.
                                    </FormHelperText>
                                </FormControl>
                            )}
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: { xs: "stretch", sm: "flex-end" },
                            }}
                        >
                            <Button
                                variant="contained"
                                onClick={handleDownloadTemplate}
                                disabled={!isSelectionComplete}
                                sx={{
                                    minWidth: 190,
                                    width: { xs: "100%", sm: "auto" },
                                    textTransform: "none",
                                }}
                            >
                                Download Excel Template
                            </Button>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                                Upload Excel File
                            </Typography>

                            <Box
                                role="button"
                                tabIndex={isSelectionComplete ? 0 : -1}
                                aria-label="Upload Excel file"
                                onClick={() =>
                                    isSelectionComplete && fileInputRef.current?.click()
                                }
                                onKeyDown={(event) => {
                                    if (
                                        isSelectionComplete &&
                                        (event.key === "Enter" || event.key === " ")
                                    ) {
                                        event.preventDefault();
                                        fileInputRef.current?.click();
                                    }
                                }}
                                onDragOver={isSelectionComplete ? handleDragOver : undefined}
                                onDragLeave={
                                    isSelectionComplete ? handleDragLeave : undefined
                                }
                                onDrop={isSelectionComplete ? handleDrop : undefined}
                                sx={{
                                    p: { xs: 3, sm: 5 },
                                    textAlign: "center",
                                    border: "2px dashed",
                                    borderColor: isDragging
                                        ? "primary.main"
                                        : selectedFile
                                            ? "success.main"
                                            : "divider",
                                    borderRadius: 2.5,
                                    bgcolor: (theme) =>
                                        isDragging
                                            ? alpha(theme.palette.primary.main, 0.06)
                                            : selectedFile
                                                ? alpha(theme.palette.success.main, 0.06)
                                                : theme.palette.background.default,
                                    cursor: isSelectionComplete ? "pointer" : "not-allowed",
                                    opacity: isSelectionComplete ? 1 : 0.55,
                                    transition: "border-color 160ms ease, background 160ms ease",
                                    outline: "none",
                                    "&:focus-visible": {
                                        borderColor: "primary.main",
                                        boxShadow: (theme) =>
                                            `0 0 0 3px ${theme.palette.primary.main}24`,
                                    },
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    hidden
                                    onChange={handleFileChange}
                                />

                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                    {selectedFile
                                        ? selectedFile.name
                                        : "Drag and drop your Excel file here"}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    {selectedFile
                                        ? `${(selectedFile.size / 1024).toFixed(1)} KB selected`
                                        : "or click to browse — .xls and .xlsx files up to 10 MB"}
                                </Typography>

                                {selectedFile && (
                                    <Button
                                        variant="text"
                                        color="error"
                                        size="small"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            handleRemoveFile();
                                        }}
                                        sx={{ mt: 1.5, textTransform: "none" }}
                                    >
                                        Remove file
                                    </Button>
                                )}
                            </Box>

                            {!isSelectionComplete && (
                                <FormHelperText sx={{ mt: 1 }}>
                                    Complete the activity selection before uploading a file.
                                </FormHelperText>
                            )}

                            {fileError && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {fileError}
                                </Alert>
                            )}
                        </Box>

                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button
                                variant="contained"
                                disabled={!selectedFile}
                                onClick={handleSubmit}
                                sx={{
                                    minWidth: 140,
                                    width: { xs: "100%", sm: "auto" },
                                    textTransform: "none",
                                }}
                            >
                                Submit
                            </Button>
                        </Box>
                    </Stack>
                </Paper>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={4000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbarOpen(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    Bulk upload - file uploaded successfully.
                </Alert>
            </Snackbar>
        </Box>
        </>
    );
};

export default BulkUpload;
