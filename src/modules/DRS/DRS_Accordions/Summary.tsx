import { Box, Container, Divider, Typography } from "@mui/material"
import CustomAccordion from "../../../components/ui/Accordion/Accordion"
import CustomTabs from "../../../components/ui/Tabs/Tabs"
import { applicantTabs } from "../../../utils/constant"
import { useState } from "react"
import type { ApplicantTab, RiskCard } from "../../../types/drs.types"
import { HeartIcon, InfoIcon, TickIcon, WalletIcon } from "../../../icons/Icons"
import { centerFlex, columnFlex } from "../../../utils/styles"
import { useSelector } from "react-redux"
import type { RootState } from "../../../store/store"
import Badge from "../../../components/ui/Badge/Badge"
import { GridSection } from "../../../components/layout/GridSection"
import CustomButton from "../../../components/ui/Button/Button"
import ApplicantProfile from "./ApplicantProfile"

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
    const { summary } = useSelector((state: RootState) => state.drs);

    const availableMemberTypes = summary?.map(item => item.memberType);

    const [applicantTab, setApplicantTab] = useState<ApplicantTab>("proposer");
    const [open, setOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState<RiskCard | null>(null);

    const visibleTabs = applicantTabs.filter(tab =>
        availableMemberTypes?.includes(tab.key)
    );

    const currentSummary = summary?.find(
        (item) => item.memberType === applicantTab
    );

    const proposer = currentSummary?.proposerSummary;
    const personal = currentSummary?.personalDetails;
    const financial = currentSummary?.financialDetails;
    const policy = currentSummary?.policyDetails;
    const underwriting = currentSummary?.underwriting;

    const imageURL = proposer?.profileImage;
    const handleOpen = (item: RiskCard) => {
        setSelectedCard(item);
        setOpen(true);
    };

    const currentApplicant = applicantTabs.find(
        (tab) => tab.key === applicantTab
    );

    const proposerDetails = [
        {
            label: "Marital Status",
            value: personal?.maritalStatus ?? "-"
        },
        {
            label: "Location",
            value: `${personal?.location?.city ?? "-"}, ${personal?.location?.country ?? "-"}`
        },
        {
            label: "Annual Income",
            value: `₹ ${financial?.annualIncome?.toLocaleString("en-IN") ?? "-"}`
        },
        {
            label: "Occupation",
            value: `${personal?.occupation?.type ?? "-"} - ${personal?.occupation?.designation ?? "-"} ${personal?.occupation?.organization ?? "-"}`
        },
        {
            label: "Applied SA",
            value: `₹ ${financial?.appliedSumAssured?.toLocaleString("en-IN") ?? "-"}`
        },
        {
            label: "Modal Premium/Channel",
            value: `${policy?.modalPremium ?? "-"}/${policy?.channel ?? "-"}`
        },
        {
            label: "TRSA",
            value: `₹ ${financial?.trsa?.toLocaleString("en-IN") ?? "-"}`
        },
        {
            label: "TFESA",
            value: `₹ ${financial?.tfesa?.toLocaleString("en-IN") ?? "-"}`
        },
        {
            label: "Product",
            value: `${policy?.productName ?? "-"} (${policy?.productType ?? "-"})`
        },
    ];

    return (
        <Container disableGutters>
            <Box sx={{ mt: 2 }}>
                <CustomAccordion title="Overall Summary" defaultExpanded>
                    <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <CustomTabs
                            tabs={visibleTabs}
                            value={applicantTab}
                            onChange={setApplicantTab}
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
                                    borderLeft: `6px solid ${item.status === "success" ? "#39b54a" : "#f4a71d"
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
                                                fontSize: "15px",
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
                                                color: "#F58220",
                                            }}
                                        >
                                            <TickIcon />
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
                                    // onClick={() => {
                                    //   if (imageURL) {
                                    //     setSelectedPhotoSrc(imageURL);
                                    //     setOpenPhotoDialog(true);
                                    //   }
                                    // }}
                                    >
                                        <Box
                                            component="img"
                                            src={imageURL}
                                            alt={`${proposer?.name}'s photo`}
                                            sx={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                borderRadius: "50%",
                                            }}
                                        />
                                    </Box>
                                    <Badge
                                        label={proposer?.caseStatus ?? ""}
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
                                                    fontSize: "20px",
                                                    fontWeight: 600,
                                                    color: "#161616",
                                                }}
                                            >
                                                {proposer?.name}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    fontSize: "14px",
                                                    fontWeight: 500,
                                                    color: "#444444",
                                                }}
                                            >
                                                DOB {proposer?.dob}
                                            </Typography>
                                        </Box>

                                        <Badge
                                            label={`${proposer?.gender}, ${proposer?.age} Years`}
                                            variant="Neutral"
                                            size="medium"
                                        />
                                    </Box>

                                    <Divider sx={{ my: 1 }} />

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
                                            {underwriting?.remarks}
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
                                                    fontSize: "18px",
                                                    pr: 0.5,
                                                }}
                                            >
                                                {underwriting?.breDecision.status}
                                            </Typography>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: "#161616",
                                                    fontWeight: 600,
                                                    fontSize: "18px",
                                                }}
                                            >
                                                - {underwriting?.breDecision.category} ({underwriting?.breDecision.coverage})
                                            </Typography>
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <ApplicantProfile profile={currentSummary} />

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
                        //   onClick={() => navigate("/drs/medical")}
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
                        //   onClick={() => navigate("/drs/financial")}
                        >
                            View Financial Details
                        </CustomButton>
                    </Box>

                </CustomAccordion>
            </Box>
        </Container>
    )
}

export default Summary