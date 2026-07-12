import { Box, Divider, Typography } from "@mui/material";
import { KeyRightArrowIcon, LinkIcon, PlusIcon } from "../../icons/Icons";
import { centerFlex, columnFlex } from "../../utils/styles";
import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import {
    getAuditTrailPath,
    getFinancialPath,
    getInboxPath,
    getMedicalPath,
    getOpenTasksPath,
    getPreviousPoliciesPath,
    getRiskDetailsPath,
    getSearchApplicationPath,
    normalizeBusinessType,
} from "../../routes/routes";
import { useAppContext } from "../../hooks/useAppContext";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { referToItThunk } from "../../store/thunks/referToItThunk";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import CustomButton from "../../components/ui/Button/Button";
import { modalTitleStyles } from "../../utils/styles";

const QuickLinks = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [isOpen, setIsOpen] = useState(false);
    const [openReferToItDialog, setOpenReferToItDialog] = useState(false);
    const [referToItLoading, setReferToItLoading] = useState(false);
    const [referToItError, setReferToItError] = useState<string | null>(null);
    const { businessType, applicationNumber } = useAppContext();
    const drsData = useAppSelector((state) => state.drs.data);

    const safeBusinessType =
        normalizeBusinessType(businessType) ??
        normalizeBusinessType(localStorage.getItem("businessType")) ??
        "retail";
    const safeApplicationNumber = applicationNumber ?? "";
    const roleType = localStorage.getItem("roleType") ?? "";
    const visibleButtons = [
        'CPT Pool',
        'GUW_FORMAL_TASK',
        'DVT_FORMAL_TASK'
    ];

    const isPoolRole = visibleButtons.includes(roleType);
    const selectedApplicantTab = localStorage.getItem("drsSelectedApplicantTab") ?? "proposer";

    const summaryEntries = (drsData as unknown as { summary?: Array<Record<string, unknown>> } | null)?.summary ?? [];

    const selectedSummary = summaryEntries.find((entry, index) => {
        const memberType = String(entry.memberType ?? "").trim().toUpperCase();

        if (memberType === "PROPOSER" || memberType.includes("PR")) {
            return selectedApplicantTab === "proposer";
        }

        if (memberType === "LIFEASSURED1" || memberType === "LIFE ASSURED 1") {
            return selectedApplicantTab === "lifeassured1";
        }

        if (memberType === "LIFEASSURED2" || memberType === "LIFE ASSURED 2") {
            return selectedApplicantTab === "lifeassured2";
        }

        if (memberType.includes("LA") || memberType.includes("LIFE")) {
            return (index === 1 && selectedApplicantTab === "lifeassured1") || (index > 1 && selectedApplicantTab === "lifeassured2");
        }

        return index === 0 && selectedApplicantTab === "proposer";
    }) ?? summaryEntries[0];

    const summaryPersonal = (selectedSummary?.personalDetails as Record<string, unknown> | undefined) ?? {};
    const proposerFormLink = String(
        (drsData as unknown as { quickLinks?: { proposerForm?: string } } | null)?.quickLinks?.proposerForm ??
        summaryPersonal.UDSLink ??
        "",
    ).trim();

    const quickLinks = [
        { label: "Proposal Form & Documents", path: proposerFormLink },
        { label: "Previous Policies", path: safeApplicationNumber ? getPreviousPoliciesPath(safeBusinessType, safeApplicationNumber) : "" },
        { label: "Open Tasks", path: safeApplicationNumber ? getOpenTasksPath(safeBusinessType, safeApplicationNumber) : "" },
        ...(roleType !== 'DVT Pool' ? [
            { label: "Risk Details", path: safeApplicationNumber ? getRiskDetailsPath(safeBusinessType, safeApplicationNumber) : "" },
        ] : []),
        { label: "Audit Trail", path: safeApplicationNumber ? getAuditTrailPath(safeBusinessType, safeApplicationNumber) : "" },
        { label: "Refer to IT", path: "" },
        ...(isPoolRole
            ? [
                { label: "View Medical", path: safeApplicationNumber ? getMedicalPath(safeBusinessType, safeApplicationNumber) : "" },
                { label: "View Financial", path: safeApplicationNumber ? getFinancialPath(safeBusinessType, safeApplicationNumber) : "" },
            ]
            : []),
        { label: "Search Application", path: getSearchApplicationPath() },
    ];

    const toggleQuickLinks = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const handleReferToIt = useCallback(async () => {
        if (!safeApplicationNumber || !roleType) {
            setReferToItError("Missing application or role information.");
            return;
        }

        try {
            setReferToItLoading(true);
            setReferToItError(null);

            await dispatch(
                referToItThunk({
                    applicationId: safeApplicationNumber,
                    roleType,
                    decision: "Refer to IT",
                }),
            ).unwrap();

            setOpenReferToItDialog(false);
            navigate(getInboxPath(safeBusinessType), {
                state: {
                    snackbarMessage: "Case has been referred to IT successfully",
                },
            });
        } catch (error) {
            setReferToItError(error instanceof Error ? error.message : "Failed to refer to IT.");
        } finally {
            setReferToItLoading(false);
        }
    }, [dispatch, navigate, roleType, safeApplicationNumber, safeBusinessType]);

    const handleNavigate = useCallback(
        (label: string, path: string) => {
            if (label === "Proposal Form & Documents") {
                if (!path) return;
                window.open(path, "_blank", "noopener,noreferrer");
                return;
            }

            if (label === "Refer to IT") {
                setReferToItError(null);
                setOpenReferToItDialog(true);
                return;
            }

            if (!path) return;

            window.open(path, "_blank", "noopener,noreferrer");
        },
        []
    );

    return (
        <Box
            sx={{
                position: "fixed",
                bottom: "10%",
                right: "3%",
                zIndex: 1000,
            }}
        >
            {isOpen && (
                <Box
                    sx={{
                        ...columnFlex,
                        gap: 2,
                        width: 276,
                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: "#fff",
                            borderRadius: 2,
                            boxShadow: "0px 4px 12px rgba(0,0,0,0.12)",
                        }}
                    >
                        <Typography
                            sx={{
                                fontSize: 14,
                                fontWeight: 700,
                                color: "#1e1e1e",
                                px: 2,
                                py: 1.5,
                                bgcolor: "#F5F5F5",
                                borderRadius: "8px 8px 0 0",
                            }}
                        >
                            Quick Links
                        </Typography>

                        <Divider />

                        {quickLinks.map(({ label, path }, index) => (
                            <Box key={label}>
                                <Box
                                    onClick={() => handleNavigate(label, path)}
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        cursor: path || label === "Refer to IT" ? "pointer" : "default",
                                    }}
                                >
                                    <Typography sx={{ fontSize: 14, color: "#444" }}>
                                        {label}
                                    </Typography>

                                    <KeyRightArrowIcon />
                                </Box>

                                {index !== quickLinks.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box
                    onClick={toggleQuickLinks}
                    sx={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        bgcolor: "#9A2529",
                        cursor: "pointer",
                        ...centerFlex,
                    }}
                >
                    <Box
                        sx={{
                            position: "relative",
                            width: 24,
                            height: 24,
                        }}
                    >
                        {[{
                            visible: !isOpen,
                            icon: <LinkIcon />,
                        }, {
                            visible: isOpen,
                            icon: <PlusIcon width={24} height={24} />,
                            rotate: "45deg",
                        }].map(({ visible, icon, rotate = "0deg" }, idx) => (
                            <Box
                                key={idx}
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    ...centerFlex,
                                    color: "#fff",
                                    transition: "all 300ms ease",
                                    opacity: visible ? 1 : 0,
                                    transform: visible
                                        ? `${rotate} scale(1)`
                                        : "rotate(-90deg) scale(0.5)",
                                }}
                            >
                                {icon}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>

            <CustomDialog
                open={openReferToItDialog}
                showCloseIcon={false}
                onClose={() => setOpenReferToItDialog(true)}
                title={
                    <Typography
                        sx={{
                            ...modalTitleStyles,
                        }}
                    >
                        Refer to IT
                    </Typography>
                }
                actionsSx={{
                    justifyContent: "center",
                    pb: 2,
                }}
                actions={
                    <CustomButton
                        onClick={() => {
                            void handleReferToIt();
                        }}
                        disabled={referToItLoading}
                        sx={{ borderRadius: "50px", paddingX: "40px" }}
                    >
                        {referToItLoading ? "Submitting..." : "Refer to IT"}
                    </CustomButton>
                }
            >
                <Typography
                    sx={{
                        fontSize: "14px",
                        color: "#161616",
                    }}
                >
                    Kindly refer this ticket to IT Team.
                </Typography>
                {referToItError && (
                    <Typography
                        sx={{
                            mt: 1,
                            fontSize: "13px",
                            color: "#DE2C3B",
                        }}
                    >
                        {referToItError}
                    </Typography>
                )}
            </CustomDialog>
        </Box>
    );
};

export default QuickLinks;