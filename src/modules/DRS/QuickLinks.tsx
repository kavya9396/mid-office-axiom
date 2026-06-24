import { Box, Divider, Typography } from "@mui/material";
import { KeyRightArrowIcon, LinkIcon, PlusIcon } from "../../icons/Icons";
import { centerFlex, columnFlex } from "../../utils/styles";
import { useNavigate } from "react-router-dom";
import { useCallback, useState } from "react";
import { getFinancialPath, getMedicalPath, getPreviousPoliciesPath } from "../../routes/routes";

const businessType = "retail";
const appNo = "OB25175129"

const quickLinks = [
    { label: "Proposal Form", path: "" },
    { label: "Previous Policies", path: getPreviousPoliciesPath(businessType, appNo) },
    { label: "Open Tasks", path: "" },
    { label: "Risk Details", path: "" },
    { label: "Audit Trail", path: "" },
    { label: "Refer to IT", path: "" },
    { label: "View Medical", path: getMedicalPath(businessType, appNo) },
    { label: "View Financial", path: getFinancialPath(businessType, appNo) },
];

const QuickLinks = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const toggleQuickLinks = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const handleNavigate = useCallback(
        (path: string) => {
            if (path) navigate(path);
        },
        [navigate]
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
                                fontSize: 20,
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
                                    onClick={() => handleNavigate(path)}
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        cursor: path ? "pointer" : "default",
                                    }}
                                >
                                    <Typography sx={{ fontSize: 16, color: "#444" }}>
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
        </Box>
    );
};

export default QuickLinks;