import { Box, Container, Divider, Typography } from "@mui/material"
import CustomAccordion from "../../../components/ui/Accordion/Accordion"
import CustomTabs from "../../../components/ui/Tabs/Tabs"
import { applicantTabs } from "../../../utils/constant"
import { useEffect, useState } from "react"
import type { ApplicantTab, RiskCard } from "../../../types/drs.types"
import { GalleryIcon, HeartIcon, InfoIcon, NoteIcon, ScannerIcon, TextAlignLeftIcon, TickIcon, WalletIcon } from "../../../icons/Icons"
import { centerFlex, columnFlex, modalTitleStyles } from "../../../utils/styles"
import { useSelector } from "react-redux"
import type { RootState } from "../../../store/store"
import Badge from "../../../components/ui/Badge/Badge"
import { GridSection } from "../../../components/layout/GridSection"
import CustomButton from "../../../components/ui/Button/Button"
import ApplicantProfile from "./ApplicantProfile/ApplicantProfile"
import CustomDialog from "../../../components/ui/Dialog/Dialog"
import { getFinancialPath, getMedicalPath } from "../../../routes/routes"
import { useNavigate } from "react-router-dom"
import { formatDOB } from "../../../utils/helpers"

const riskDetails: RiskCard[] = [
    {
        title: "Medical",
        desc: "BRE Medical Decision - STD",
        detailedDescTitle: "medical risk analytics",
        detailedDesc: [
            "Adverse medical report",
            "Adverse medical value",
            "BRE Medical decision",
            "BRE Medical date",
            "BRE Medical Reasons",
            "BRE Medical discrepancy",
            "Extra Premium rating",
            "Reference for Rating",
            "Extra Premium rating reasons",
        ],
        type: "medical",
        status: "success",
    },
    {
        title: "Financial",
        desc: "BRE Financial Decision - STD",
        detailedDescTitle: "financial risk analytics",
        detailedDesc: [
            "Financial Findings",
            "BRE Financial Decision",
            "BRE Financial Date",
            "BRE Financial Reasons",
            "BRE Financial Discrepancy"
        ],
        type: "financial",
        status: "success",
    },
    {
        title: "Other Risks",
        desc: "BRE Decision - STD",
        detailedDescTitle: "other risk analytics",
        detailedDesc: [
            "Avocation",
            "Lifestyle",
            "Personal Habits",
            "PEP",
            "Criminal Proceedings",
            "Adverse API findings",
            "Family History",
            "Residential Risk",
            "Occupation Risk",
        ],
        type: "other",
        status: "success",
    },
];

const Summary = () => {
    const navigate = useNavigate();
    const { data } = useSelector((state: RootState) => state.drs);
    const customerDetails = data?.customerDetails ?? [];
    const firstProduct = data?.productDetail?.[0];
    const breOutput = data?.externalAPIs?.breOutput;
    const isLAPropSame = Boolean(data?.applicationInfo?.isLAPropSame);

    const mapMemberType = (lifeType: string | undefined, index: number): ApplicantTab => {
        const normalized = lifeType?.trim().toUpperCase() ?? "";
        if (normalized.includes("PR") || normalized.includes("PROPOSER")) return "proposer";
        if (normalized.includes("LA") || normalized.includes("LIFE")) return index === 1 ? "lifeassured1" : "lifeassured2";
        if (index === 0) return "proposer";
        if (index === 1) return "lifeassured1";
        return "lifeassured2";
    };

    const customerWithTabs = customerDetails.map((customer, index) => ({
        customer,
        memberType: mapMemberType(String(customer.lifeType ?? ""), index),
    }));

    const availableMemberTypes = customerWithTabs.map((item) => item.memberType);

    const [applicantTab, setApplicantTab] = useState<ApplicantTab>("proposer");
    const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<RiskCard | null>(null);
    const [selectedPhotoSrc, setSelectedPhotoSrc] = useState("");

    const visibleTabs = isLAPropSame
        ? [{ key: "lifeassured1" as const, label: "Life Assured" }]
        : applicantTabs.filter((tab) => availableMemberTypes.includes(tab.key));

    const activeApplicantTab: ApplicantTab = isLAPropSame
        ? "lifeassured1"
        : (visibleTabs.find((tab) => tab.key === applicantTab)?.key ?? visibleTabs[0]?.key ?? "proposer");

    useEffect(() => {
        localStorage.setItem("drsSelectedApplicantTab", activeApplicantTab);
    }, [activeApplicantTab]);

    const currentCustomer = customerWithTabs.find(
        (item) => item.memberType === activeApplicantTab
    )?.customer ?? customerDetails[0];
    const personalDetails = currentCustomer?.personalDetails;
    const addresses = Array.isArray(currentCustomer?.address) ? currentCustomer.address : [];
    const permanentAddress =
        addresses.find((item) => String(item.type).toLowerCase() === "permanent") ??
        addresses[0];
    const firstDoc = Array.isArray(currentCustomer?.documentDetails)
        ? currentCustomer?.documentDetails?.[0]
        : undefined;

    const firstName = String(personalDetails?.firstName ?? "");
    const middleName = String(personalDetails?.middleName ?? "");
    const lastName = String(personalDetails?.lastName ?? "");
    const name = [firstName, middleName, lastName].filter(Boolean).join(" ");
    const imageURL = "";
    const genderCode = String(personalDetails?.gender ?? "").toUpperCase();
    const gender = genderCode === "M" ? "Male" : genderCode === "F" ? "Female" : "Other";
    const dob = String(formatDOB(personalDetails?.dob) ?? "");
    const getAge = (value: string) => {
        if (!value) return 0;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return 0;
        const today = new Date();
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            age -= 1;
        }
        return age < 0 ? 0 : age;
    };
    const age = getAge(dob);
    const annualIncome = Number(personalDetails?.netIncomeAmt ?? 0);
    const appliedSumAssured = Number(firstProduct?.sumAssured ?? 0);
    const trsa = Number(data?.applicationInfo?.simultaneousLifeSA ?? 0);
    const tfesa = Number(data?.applicationInfo?.otherPolicySA ?? 0);
    const maritalCode = String(personalDetails?.maritalStatus ?? "").toUpperCase();
    const maritalStatus =
        maritalCode === "M" ? "Married" : maritalCode === "D" ? "Divorced" : maritalCode === "W" ? "Widowed" : "Single";

    const roleType = localStorage.getItem("roleType") ?? "";
    const isCvtPoolRole = roleType === "CVT Pool";

    const handleOpen = (item: RiskCard) => {
        setSelectedCard(item);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedCard(null);
    };

    const currentApplicant = visibleTabs.find(
        (tab) => tab.key === activeApplicantTab
    );

    const proposerDetails = [
        {
            label: "Marital Status",
            value: maritalStatus ?? "-"
        },
        {
            label: "Location",
            value: `${permanentAddress?.city ?? "-"}, ${permanentAddress?.residingCountry ?? "-"}`
        },
        {
            label: "Annual Income",
            value: `₹ ${annualIncome?.toLocaleString("en-IN") ?? "-"}`
        },
        {
            label: "Occupation",
            value: `${personalDetails?.occupationType ?? "-"} - ${personalDetails?.occupationType ?? "-"} ${personalDetails?.orgName ?? "-"}`
        },
        {
            label: "Applied SA",
            value: `₹ ${appliedSumAssured?.toLocaleString("en-IN") ?? "-"}`
        },
        {
            label: "Modal Premium/Channel",
            value: `${firstProduct?.paymentAmount ?? "-"}/${data?.sourcingDetail?.channelCode ?? "-"}`
        },
        {
            label: "TRSA",
            value: `₹ ${trsa?.toLocaleString("en-IN") ?? "-"}`
        },
        {
            label: "TFESA",
            value: `₹ ${tfesa?.toLocaleString("en-IN") ?? "-"}`
        },
        {
            label: "Product",
            value: `${firstProduct?.name ?? "-"} (${firstProduct?.type ?? "-"})`
        },
    ];

    const formatFaceMatch = (value: string | number | null | undefined) => {
        if (value === null || value === undefined || value === "") return "-";
        if (typeof value === "number") return `${value}%`;
        return value;
    };

    const profileHighlights = [
        {
            icon: NoteIcon,
            label: "Document",
            value: firstDoc?.documentType ?? "-",
        },
        {
            icon: ScannerIcon,
            label: "Face Match %",
            value: formatFaceMatch(""),
        },
        {
            icon: GalleryIcon,
            label: "Image Quality",
            value: "-",
        },
        {
            icon: TextAlignLeftIcon,
            label: "Remarks",
            value: breOutput?.breRemarks ?? "-",
        },
    ];

    return (
        <Container disableGutters>
            <Box sx={{ mt: 2 }}>
                <CustomAccordion title="Overall Summary" defaultExpanded>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <CustomTabs
                            tabs={visibleTabs}
                            value={activeApplicantTab}
                            onChange={(tab) => {
                                if (!isLAPropSame) {
                                    setApplicantTab(tab);
                                }
                            }}
                        />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Typography
                            component="span"
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                            }}
                        >
                            Risk Analytics
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, 1fr)",
                            gap: 2,
                            padding: 1,
                            borderRadius: "8px",
                        }}
                    >
                        {riskDetails.map((item, index) => (
                            <Box
                                key={index}
                                onClick={() => handleOpen(item)}
                                sx={{
                                    border: "1px solid #d7d7d7",
                                    borderRadius: "10px",
                                    borderLeft: `6px solid ${item.status === "success" ? "#39b54a" : "#9A2529"
                                        }`,
                                    px: 2,
                                    py: 1.5,
                                    backgroundColor: "#ffffff",
                                    cursor: "pointer",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: "8px",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "8px",
                                        }}
                                    >
                                        {item.type === "medical" && <HeartIcon />}
                                        {item.type === "financial" && <WalletIcon />}
                                        {item.type === "other" && <InfoIcon />}
                                        <Typography
                                            component="span"
                                            sx={{
                                                fontSize: "14px",
                                                fontWeight: 700,
                                                color: "#20242c",
                                                fontFamily: "Mulish, sans-serif",
                                            }}
                                        >
                                            {item.title}
                                        </Typography>
                                    </Box>

                                    {item.status === "success" ? (
                                        <Box
                                            component="span"
                                            sx={{
                                                color: "#35A224",
                                            }}
                                        >
                                            <TickIcon />
                                        </Box>
                                    ) : (
                                        <Box
                                            component="span"
                                            sx={{
                                                color: "#9A2529",
                                            }}
                                        >
                                            <InfoIcon />
                                        </Box>
                                    )}
                                </Box>

                                <Box
                                    sx={{
                                        display: "inline-flex",
                                        mt: 1,
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: "999px",
                                        border: "1px solid #d7d7d7",
                                        backgroundColor: "#f7f7f7",
                                    }}
                                >
                                    <Typography
                                        component="span"
                                        sx={{
                                            fontSize: "12px",
                                            color: "#5f5f5f",
                                            lineHeight: 1.2,
                                            fontFamily: "Mulish, sans-serif",
                                        }}
                                    >
                                        {item.desc}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>

                    <Divider sx={{ my: 2, px: 2 }} />

                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Typography
                            component="span"
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                            }}
                        >
                            UW Summary for {currentApplicant?.label}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            padding: "20px",
                            backgroundColor: "#EBF1F5",
                            borderRadius: "8px",
                            marginTop: 1,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 2,
                                flexWrap: "wrap",
                            }}
                        >
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <Box sx={{ ...columnFlex, gap: 1 }}>
                                    <Box
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            borderRadius: "50%",
                                            backgroundColor: "#B2C9D9",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            cursor: "pointer",
                                            "&:hover": { opacity: 0.8 },
                                        }}
                                        onClick={() => {
                                            if (imageURL) {
                                                setSelectedPhotoSrc(imageURL);
                                                setOpenPhotoDialog(true);
                                            }
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={imageURL}
                                            alt={`${name}'s photo`}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                borderRadius: "50%",
                                            }}
                                        />
                                    </Box>
                                    <Badge
                                        label={breOutput?.systemDecision ?? ""}
                                        icon={<TickIcon width={16} height={16} />}
                                        sx={{
                                            backgroundColor: "#35A224",
                                            color: "#fff",
                                        }}
                                    />
                                </Box>

                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            width: "100%",
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <Box sx={{ ...columnFlex }}>
                                            <Typography
                                                sx={{
                                                    fontSize: "16px",
                                                    fontWeight: 600,
                                                    color: "#161616",
                                                }}
                                            >
                                                {name}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: "14px",
                                                    fontWeight: 500,
                                                    color: "#444444",
                                                }}
                                            >
                                                DOB {dob}
                                            </Typography>
                                        </Box>

                                        <Badge
                                            label={`${gender}, ${age} Years`}
                                            variant="Neutral"
                                            size="medium"
                                        />
                                    </Box>

                                    <Divider sx={{ my: 1 }} />

                                    {isCvtPoolRole && (
                                        <>
                                            <Box
                                                sx={{
                                                    display: "grid",
                                                    gridTemplateColumns: "repeat(4, 1fr)",
                                                    gap: 2,
                                                    borderRadius: "8px",
                                                }}
                                            >
                                                {profileHighlights.map((item) => {
                                                    const Icon = item.icon;
                                                    return (
                                                        <Box
                                                            key={item.label}
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "flex-start",
                                                                gap: 1.5,
                                                            }}
                                                        >
                                                            <Box sx={{ color: "#063E6F" }}>
                                                                <Icon />
                                                            </Box>

                                                            <Box>
                                                                <Typography sx={{ fontSize: "12px", color: "#444" }}>
                                                                    {item.label}
                                                                </Typography>
                                                                <Typography
                                                                    sx={{
                                                                        fontSize: "14px",
                                                                        color: "#161616",
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {item.value}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>

                                            <Divider sx={{ my: 1 }} />
                                        </>
                                    )}

                                    <GridSection
                                        columns={5}
                                        items={proposerDetails}
                                        backgroundColor="#EBF1F5"
                                    />

                                    <Divider sx={{ my: 1 }} />

                                    <Box
                                        sx={{
                                            ...columnFlex,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                color: "#1e1e1e",
                                                fontSize: "14px",
                                                fontWeight: 700,
                                            }}
                                        >
                                            Remarks
                                        </Typography>

                                        <Typography
                                            sx={{
                                                color: "#1e1e1e",
                                                fontWeight: 400,
                                                fontSize: "14px",
                                            }}
                                        >
                                            {breOutput?.breRemarks}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            backgroundColor: "#fff",
                                            ...centerFlex,
                                            height: "40px",
                                            borderRadius: "8px",
                                            border: "1px solid #DDD",
                                        }}
                                    >
                                        <Typography>BRE Decision:</Typography>
                                        <Typography sx={{ pl: 1 }}>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: "#35A224",
                                                    fontWeight: 600,
                                                    fontSize: "16px",
                                                    pr: 0.5,
                                                }}
                                            >
                                                {breOutput?.systemDecision ?? "-"}
                                            </Typography>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: "#161616",
                                                    fontWeight: 600,
                                                    fontSize: "16px",
                                                }}
                                            >
                                                - {breOutput?.decisionTypes?.breDecision ?? "-"} ({breOutput?.decisionTypes?.breAction ?? "-"})
                                            </Typography>
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <ApplicantProfile profile={undefined} />

                    <Box sx={{ mt: 2, display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <CustomButton
                            variant="outlined"
                            sx={{
                                borderRadius: "50px",
                                px: 8,
                                py: 1,
                                width: "240px",
                                fontSize: "16px",
                                fontWeight: 700,
                            }}
                            onClick={() => navigate(getMedicalPath("retail", "OB25175127"))}
                        >
                            View Medicals
                        </CustomButton>
                        <CustomButton
                            variant="outlined"
                            sx={{
                                borderRadius: "50px",
                                px: 4,
                                py: 1,
                                width: "240px",
                                fontSize: "16px",
                                fontWeight: 700,
                            }}
                            onClick={() => navigate(getFinancialPath("retail", "OB25175127"))}
                        >
                            View Financial Details
                        </CustomButton>
                    </Box>

                </CustomAccordion>
            </Box>
            <CustomDialog
                open={openPhotoDialog}
                onClose={() => setOpenPhotoDialog(false)}
                showCloseIcon={false}
                maxWidth="sm"
                fullWidth
                paperSx={{
                    backgroundColor: "transparent",
                    boxShadow: "none",
                }}
                backdropSx={{
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                }}
                contentSx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 0,
                    backgroundColor: "transparent",
                }}
            >
                <Box
                    component="img"
                    src={selectedPhotoSrc}
                    alt="Expanded Photo"
                    sx={{
                        width: "300px",
                        height: "300px",
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
            </CustomDialog>

            <CustomDialog
                open={open}
                onClose={handleClose}
                title={
                    <Typography
                        sx={{
                            ...modalTitleStyles
                        }}
                    >
                        {selectedCard?.detailedDescTitle}
                    </Typography>
                }
                maxWidth="sm"
                fullWidth
            >
                <Box sx={{ py: 1 }}>
                    <Box component="ul" sx={{ pl: 2, m: 0 }}>
                        {selectedCard?.detailedDesc.map((detail, index) => (
                            <Box
                                component="li"
                                key={index}
                                sx={{
                                    fontSize: "14px",
                                    color: "#20242c",
                                    mb: 1,
                                }}
                            >
                                {detail}
                            </Box>
                        ))}
                    </Box>
                </Box>
            </CustomDialog>
        </Container>
    )
}

export default Summary