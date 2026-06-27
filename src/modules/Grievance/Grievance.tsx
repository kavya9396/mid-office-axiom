import { Box, Checkbox, Container, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BackButton from '../../components/layout/BackButton';
import CustomButton from '../../components/ui/Button/Button';
import CustomDialog from '../../components/ui/Dialog/Dialog';
import CustomTable, { type Column } from '../../components/ui/Table/Table';
import {
    HeadphoneIcon,
    HouseIcon,
    NoteIcon,
    PlusIcon,
    UserProfileIcon,
} from '../../icons/Icons';
import { useAppDispatch } from '../../store/hooks';
import { grievanceThunk } from '../../store/thunks/grievanceThunk';
import { grievanceSubmitThunk } from '../../store/thunks/grievanceSubmitThunk';
import type { GrieavanceReport, GrievanceResponse } from '../../types/drs.types';
import { getDRSPath } from '../../routes/routes';
import { columnFlex, modalTitleStyles } from '../../utils/styles';

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

const Grievance = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const navState = (location.state as GrievanceNavState);
    const safeApplicationId = navState?.applicationNumber ?? localStorage.getItem("applicationNumber") ?? "";
    const safeBusinessType = navState?.businessType ?? localStorage.getItem("businessType") ?? "retail";

    const [grievanceData, setGrievanceData] = useState<GrievanceResponse | null>(null);
    const [reports, setReports] = useState<GrieavanceReport[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [openFileDialog, setOpenFileDialog] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchGrievance = async () => {
            try {
                setLoading(true);
                setFetchError(null);
                const response = await dispatch(grievanceThunk({ applicationId: safeApplicationId })).unwrap();
                setGrievanceData(response);
                setReports(response.reports.map(r => ({ ...r })));
            } catch (err) {
                setFetchError(err instanceof Error ? err.message : "Failed to load grievance data.");
            } finally {
                setLoading(false);
            }
        };
        void fetchGrievance();
    }, [dispatch, safeApplicationId]);

    const handleRemarksUserChange = (rowId: number, value: string) => {
        setReports(prev => prev.map(r => r.id === rowId ? { ...r, remarksUser: value } : r));
    };

    const handleSubmit = async () => {
        try {
            setSubmitLoading(true);
            setSubmitMessage(null);
            const response = await dispatch(grievanceSubmitThunk({
                applicationId: safeApplicationId,
                remarks,
                reports,
            })).unwrap();
            setSubmitMessage(response.message || "Grievance submitted successfully.");
            setOpenFileDialog(true);
            setTimeout(() => {
                navigate(getDRSPath(safeBusinessType, safeApplicationId));
            }, 1500);
        } catch (err) {
            setSubmitMessage(err instanceof Error ? err.message : "Failed to submit grievance.");
        } finally {
            setSubmitLoading(false);
        }
    };

    const infoItems = [
        { icon: <NoteIcon />, label: "Policy Number", value: grievanceData?.policyNumber ?? "-" },
        { icon: <UserProfileIcon />, label: "Life Assured Name", value: grievanceData?.lifeAssuredName ?? "-" },
        { icon: <HouseIcon />, label: "Proposer Details", value: grievanceData?.proposerName ?? "-" },
    ];

    const allSelected = reports.length > 0 && selectedIds.size === reports.length;
    const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(reports.map(r => r.id)));
    const toggleOne = (id: number) => setSelectedIds(prev => { const next = new Set(prev); if (next.has(id)) { next.delete(id); } else { next.add(id); } return next; });

    const columns: Column<GrieavanceReport>[] = [
        {
            key: "id",
            width: "4%",
            headerRender: () => <Checkbox size="small" checked={allSelected} indeterminate={selectedIds.size > 0 && !allSelected} onChange={toggleAll} sx={{ p: 0 }} />,
            render: (_value, row) => <Checkbox size="small" checked={selectedIds.has((row as GrieavanceReport).id)} onChange={() => toggleOne((row as GrieavanceReport).id)} sx={{ p: 0 }} />,
        },
        {
            key: "report",
            header: "Reports",
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
                    value={(row as GrieavanceReport).remarksUser}
                    onChange={(e) => handleRemarksUserChange((row as GrieavanceReport).id, e.target.value)}
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
        <Box>
            <Box
                sx={{
                    width: "100%",
                    ...columnFlex,
                    backgroundColor: "#F0F3F8",
                    minHeight: "90vh",
                }}
            >
                <Container disableGutters>
                    <BackButton to="/drs" label="Back to DRS" justify="space-between" />
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
                                <CustomTable<GrieavanceReport>
                                    title="All Reports"
                                    columns={columns}
                                    data={reports}
                                />
                            )}
                        </Box>

                        <Box sx={{ width: 276, ...columnFlex, gap: 2, mt: 4 }}>
                            <Box sx={cardStyles}>
                                <Typography sx={sectionTitleStyles}>
                                    Supporting Documents
                                </Typography>

                                <Box sx={{ p: 2 }}>
                                    <Box sx={uploadBoxStyles}>
                                        <PlusIcon />
                                        <Typography sx={{ textAlign: "center", fontSize: 12 }}>
                                            Upload or Drag document
                                        </Typography>
                                    </Box>

                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        placeholder="Add remarks..."
                                        value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)}
                                        sx={{ mt: 2 }}
                                    />

                                    {submitMessage && !openFileDialog && (
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

                            <Box sx={{ ...cardStyles, p: 2, display: "flex", gap: 1 }}>
                                <HeadphoneIcon />
                                <Typography sx={{ fontWeight: "600" }}>
                                    Refer to IT
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Container>
            </Box>

            <CustomDialog
                open={openFileDialog}
                onClose={() => setOpenFileDialog(false)}
                title={<Typography sx={modalTitleStyles}>Grievance Raised</Typography>}
                actions={
                    <CustomButton
                        onClick={() => { setOpenFileDialog(false); navigate(getDRSPath(safeBusinessType, safeApplicationId)); }}
                        sx={{ borderRadius: "50px", px: 5 }}
                    >
                        Ok
                    </CustomButton>
                }
                actionsSx={{ justifyContent: "center" }}
            >
                <Typography sx={{ fontSize: "12px" }}>
                    {submitMessage ?? "The file has been shared with the TPA."}
                </Typography>
            </CustomDialog>
        </Box>
    );
};

export default Grievance;