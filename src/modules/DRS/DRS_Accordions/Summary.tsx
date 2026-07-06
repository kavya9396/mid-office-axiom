import { Box, Container, Divider, Typography } from "@mui/material"
import CustomAccordion from "../../../components/ui/Accordion/Accordion"
import CustomTabs from "../../../components/ui/Tabs/Tabs"
import { applicantTabs } from "../../../utils/constant"
import { useEffect, useState } from "react"
import type { ApplicantTab } from "../../../types/drs.types"
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
import defaultUserProfileImage from "../../../assets/user-profile.svg"

type RiskStatus = "success" | "warning";

type RiskDetailItem = {
    label: string;
    value: string;
};

type RiskCardItem = {
    title: string;
    desc: string;
    detailedDescTitle: string;
    detailedDesc: RiskDetailItem[];
    type: "medical" | "financial" | "other";
    status: RiskStatus;
};

const toRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

const asDisplayValue = (value: unknown) => {
    if (value === null || value === undefined) return "-";
    const normalized = String(value).trim();
    return normalized === "" ? "-" : normalized;
};

const riskValueConfigs = {
    medical: [
        { key: "brePhysicalMedicalDecision", label: "BRE Physical Medical Decision" },
        { key: "brePhysicalMedicalRemark", label: "BRE Physical Medical Remark" },
        { key: "breTeleVideoMerDecision", label: "BRE Tele/Video MER Decision" },
        { key: "breTeleVideoMerRemark", label: "BRE Tele/Video MER Remark" },
        { key: "munichReMedicalDecision", label: "MunichRe Medical decision" },
        { key: "munichReRating", label: "MunichRe Rating" },
        { key: "biuMedicalStatus", label: "BIU Medical status (Match/Mismatch)" },
    ],
    financial: [
        { key: "breFinancialDecision", label: "BRE Financial decision" },
        { key: "breRemark", label: "BRE Remark" },
        { key: "financialEligibility", label: "Financial Eligibility" },
        { key: "derivedIncome", label: "Derived Income" },
        { key: "counterOfferValue", label: "CounterOffer Value" },
        { key: "additionalSA", label: "Additional SA" },
        { key: "biuFinancialStatus", label: "BIU Financial status (Match/Mismatch)" },
    ],
    other: [
        { key: "ptlrResponse", label: "PTLR Response" },
        { key: "drcResponse", label: "DRC Response" },
        { key: "adverseIIB", label: "Adverse IIB" },
        { key: "criminalQuestionResponseLA", label: "Criminal Question Response (LA)" },
        { key: "pepQuestionResponseLA", label: "PEP Question Response (LA)" },
        { key: "criminalQuestionResponsePR", label: "Criminal Question Response (PR)" },
        { key: "pepQuestionResponsePR", label: "PEP Question Response (PR)" },
        { key: "previousPolicySubstandard", label: "Previous Policy Substandard" },
        { key: "avocationRelatedDisclosure", label: "Avocation Related Disclosure" },
        { key: "healthQuestionPositive", label: "Health Question Positive" },
        { key: "employmentInRiskyIndustry", label: "Employment in Risky Industry" },
        { key: "fatfOfacCountryLogin", label: "FATF/OFAC Country Login" },
        { key: "hazardousOccupation", label: "Hazardous Occupation" },
        { key: "eddFlag", label: "EDD Flag" },
        { key: "claimRiskIndicator", label: "Claim Risk Indicator" },
        { key: "faceMatchScore", label: "Face Match Score" },
        { key: "tobacco", label: "Tobacco" },
        { key: "narcotics", label: "Narcotics" },
    ],
} as const;

const successBaseline = {
    medical: {
        brePhysicalMedicalDecision: "STP",
        brePhysicalMedicalRemark: "",
        breTeleVideoMerDecision: "Standard_1",
        breTeleVideoMerRemark: "",
        munichReMedicalDecision: "",
        munichReRating: "",
        biuMedicalStatus: "N",
    },
    financial: {
        breFinancialDecision: "FSTP",
        breRemark: "",
        financialEligibility: "",
        derivedIncome: "",
        counterOfferValue: "",
        additionalSA: "",
        biuFinancialStatus: "N",
    },
    other: {
        ptlrResponse: "Standard",
        drcResponse: "No",
        adverseIIB: "No",
        criminalQuestionResponseLA: "No",
        pepQuestionResponseLA: "No",
        criminalQuestionResponsePR: "No",
        pepQuestionResponsePR: "No",
        previousPolicySubstandard: "No",
        avocationRelatedDisclosure: "No",
        healthQuestionPositive: "No",
        employmentInRiskyIndustry: "No",
        fatfOfacCountryLogin: "No",
        hazardousOccupation: "No",
        eddFlag: "No",
        claimRiskIndicator: "No",
        faceMatchScore: ">75%",
        tobacco: "No",
        narcotics: "No",
    },
} as const;

const normalizeCompare = (value: unknown) => String(value ?? "").trim().toLowerCase();

const getRiskStatus = (
    section: "medical" | "financial" | "other",
    sectionData: Record<string, unknown>,
): RiskStatus => {
    const baseline = successBaseline[section] as Record<string, string>;
    const hasWarning = Object.entries(baseline).some(([key, expectedValue]) => {
        const actualValue = normalizeCompare(sectionData[key]);
        const baselineValue = normalizeCompare(expectedValue);
        return actualValue !== baselineValue;
    });

    return hasWarning ? "warning" : "success";
};

const Summary = () => {
    const navigate = useNavigate();
    const { data } = useSelector((state: RootState) => state.drs);
    const customerDetails = data?.customerDetails ?? [];
    const summaryRoot = data as unknown as Record<string, unknown> | null;
    const summaryEntries = Array.isArray(summaryRoot?.summary)
        ? (summaryRoot.summary as Array<Record<string, unknown>>)
        : [];
    const topLevelBreDecision = toRecord(summaryRoot?.breDecision);
    const firstProduct = data?.productDetail?.[0];
    const breOutput = data?.externalAPIs?.breOutput;
    const isLAPropSame = Boolean(data?.applicationInfo?.isLAPropSame);

    const mapMemberType = (memberTypeValue: string | undefined, index: number): ApplicantTab => {
        const normalized = memberTypeValue?.trim().toUpperCase() ?? "";
        if (normalized === "PROPOSER" || normalized.includes("PR")) return "proposer";
        if (normalized === "LIFEASSURED1" || normalized === "LIFE ASSURED 1") return "lifeassured1";
        if (normalized === "LIFEASSURED2" || normalized === "LIFE ASSURED 2") return "lifeassured2";
        if (normalized.includes("LA") || normalized.includes("LIFE")) return index === 1 ? "lifeassured1" : "lifeassured2";
        if (index === 0) return "proposer";
        if (index === 1) return "lifeassured1";
        return "lifeassured2";
    };

    const customerWithTabs = customerDetails.map((customer, index) => ({
        customer,
        memberType: mapMemberType(String(customer.lifeType ?? ""), index),
    }));

    const summaryWithTabs = summaryEntries.map((item, index) => ({
        customer: item,
        memberType: mapMemberType(String(item.memberType ?? ""), index),
    }));

    const availableMemberTypes = Array.from(
        new Set([
            ...customerWithTabs.map((item) => item.memberType),
            ...summaryWithTabs.map((item) => item.memberType),
        ]),
    );

    const [applicantTab, setApplicantTab] = useState<ApplicantTab>("proposer");
    const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
    const [open, setOpen] = useState(false);
    const [openRemarksDialog, setOpenRemarksDialog] = useState(false);
    const [fullRemarksText, setFullRemarksText] = useState("");
    const [selectedCard, setSelectedCard] = useState<RiskCardItem | null>(null);
    const [selectedPhotoSrc, setSelectedPhotoSrc] = useState("");

    const visibleTabs = isLAPropSame
        ? [{ key: "lifeassured1" as const, label: "Life Assured" }]
        : applicantTabs.filter((tab) => availableMemberTypes.includes(tab.key));

    const activeApplicantTab: ApplicantTab = isLAPropSame
        ? "lifeassured1"
        : (visibleTabs.find((tab) => tab.key === applicantTab)?.key ?? visibleTabs[0]?.key ?? "proposer");

    const activeSummaryEntry = summaryEntries.find((item) =>
        String(item.memberType ?? "").toLowerCase() === activeApplicantTab.toLowerCase(),
    ) ?? summaryEntries[0];

    useEffect(() => {
        localStorage.setItem("drsSelectedApplicantTab", activeApplicantTab);
    }, [activeApplicantTab]);

    const currentCustomer = customerWithTabs.find(
        (item) => item.memberType === activeApplicantTab
    )?.customer ?? customerDetails[0];

    const activeSummaryRecord = toRecord(activeSummaryEntry);
    const customerRecord = toRecord(currentCustomer);
    const profileSource = Object.keys(activeSummaryRecord).length > 0 ? activeSummaryRecord : customerRecord;

    const personalDetails = toRecord(profileSource.personalDetails);
    const financialDetails = toRecord(profileSource.financialDetails);
    const policyDetails = toRecord(profileSource.policyDetails);
    const underwriting = toRecord(profileSource.underwriting);
    const underwritingBreDecision = toRecord(underwriting.breDecision);
    const faceMatchDetails = toRecord(profileSource.faceMatchDetails);
    const kycDetails = toRecord(profileSource.kycDetails);

    const addresses = Array.isArray(profileSource.address) ? profileSource.address : [];
    const permanentAddress =
        addresses.find((item) => String(item.type).toLowerCase() === "permanent") ??
        addresses[0];
    const firstDoc = Array.isArray(profileSource.documentDetails)
        ? profileSource.documentDetails?.[0]
        : undefined;

    const title = String(personalDetails?.title ?? "");
    const firstName = String(personalDetails?.firstName ?? "");
    const middleName = String(personalDetails?.middleName ?? "");
    const lastName = String(personalDetails?.lastName ?? "");
    const name = [title, firstName, middleName, lastName].filter(Boolean).join(" ");
    const udsLink = String(personalDetails?.UDSLink ?? "").trim();
    const profileImage = String(personalDetails?.profileImage ?? "").trim();
    const imageURL = udsLink || profileImage || defaultUserProfileImage;
    const genderCode = String(personalDetails?.gender ?? "").toUpperCase();
    const gender = genderCode === "M" ? "Male" : genderCode === "F" ? "Female" : "Other";
    const rawDob = typeof personalDetails?.dob === "string" ? personalDetails.dob : undefined;
    const dob = String(formatDOB(rawDob) ?? "");
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
    const annualIncome = Number(financialDetails?.annualIncome ?? personalDetails?.netIncomeAmt ?? 0);
    const appliedSumAssured = Number(financialDetails?.appliedSumAssured ?? firstProduct?.sumAssured ?? 0);
    const trsa = Number(financialDetails?.trsa ?? data?.applicationInfo?.simultaneousLifeSA ?? 0);
    const tfesa = Number(financialDetails?.tfesa ?? data?.applicationInfo?.otherPolicySA ?? 0);
    const maritalCode = String(personalDetails?.maritalStatus ?? "").toUpperCase();
    const maritalStatus =
        maritalCode === "M" ? "Married" : maritalCode === "D" ? "Divorced" : maritalCode === "W" ? "Widowed" : "Single";

    const roleType = localStorage.getItem("roleType") ?? "";
     const visibleButtons = [
    'CPT Pool',
    'DVT Pool'
  ];

  const isPoolRole = visibleButtons.includes(roleType);

    const systemDecision = String(
        underwritingBreDecision.status ?? breOutput?.systemDecision ?? topLevelBreDecision.decision ?? "-",
    );
    const decisionCategory = String(
        underwritingBreDecision.category ?? breOutput?.decisionTypes?.breDecision ?? topLevelBreDecision.initialDecision ?? "-",
    );
    const decisionAction = String(
        underwritingBreDecision.coverage ?? breOutput?.decisionTypes?.breAction ?? topLevelBreDecision.action ?? "-",
    );
    const summaryRemarks = String(
        underwriting.remarks ?? breOutput?.breRemarks ?? topLevelBreDecision.remarks ?? "-",
    );

    const fallbackSummaryEntryWithRisk = summaryEntries.find((item) =>
        Array.isArray(item.riskAnalytics) && item.riskAnalytics.length > 0,
    );

    const customerRiskAnalytics = Array.isArray((currentCustomer as Record<string, unknown> | undefined)?.riskAnalytics)
        ? ((currentCustomer as Record<string, unknown>).riskAnalytics as Array<Record<string, unknown>>)
        : [];

    const summaryRiskAnalytics = Array.isArray(activeSummaryEntry?.riskAnalytics)
        ? (activeSummaryEntry.riskAnalytics as Array<Record<string, unknown>>)
        : [];

    const fallbackSummaryRiskAnalytics = Array.isArray(fallbackSummaryEntryWithRisk?.riskAnalytics)
        ? (fallbackSummaryEntryWithRisk.riskAnalytics as Array<Record<string, unknown>>)
        : [];

    const riskSource =
        customerRiskAnalytics[0] ??
        summaryRiskAnalytics[0] ??
        fallbackSummaryRiskAnalytics[0] ??
        {};
    const medicalRisk = toRecord(riskSource.medicalRisk);
    const financialRisk = toRecord(riskSource.financialRisk);
    const otherRisk = toRecord(riskSource.otherRisk);

    const riskDetails: RiskCardItem[] = [
        {
            title: "Medical",
            desc: `BRE Medical Decision - ${asDisplayValue(medicalRisk.brePhysicalMedicalDecision)}`,
            detailedDescTitle: "medical risk analytics",
            detailedDesc: riskValueConfigs.medical.map((item) => ({
                label: item.label,
                value: asDisplayValue(medicalRisk[item.key]),
            })),
            type: "medical" as const,
            status: getRiskStatus("medical", medicalRisk),
        },
        {
            title: "Financial",
            desc: `BRE Financial Decision - ${asDisplayValue(financialRisk.breFinancialDecision)}`,
            detailedDescTitle: "financial risk analytics",
            detailedDesc: riskValueConfigs.financial.map((item) => ({
                label: item.label,
                value: asDisplayValue(financialRisk[item.key]),
            })),
            type: "financial" as const,
            status: getRiskStatus("financial", financialRisk),
        },
        {
            title: "Other Risks",
            desc: `BRE Decision - ${asDisplayValue(otherRisk.ptlrResponse)}`,
            detailedDescTitle: "other risk analytics",
            detailedDesc: riskValueConfigs.other.map((item) => ({
                label: item.label,
                value: asDisplayValue(otherRisk[item.key]),
            })),
            type: "other" as const,
            status: getRiskStatus("other", otherRisk),
        },
    ].filter((card) => {
        if (card.type === "medical") return Boolean(medicalRisk.isMedical);
        if (card.type === "financial") return Boolean(financialRisk.isFinancial);
        return Boolean(otherRisk.isOthers);
    });

    const handleOpen = (item: RiskCardItem) => {
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
            value: `${personalDetails?.occupationType ?? "-"} - ${personalDetails?.orgName ?? "-"}`
        },
        {
            label: "Applied SA",
            value: `₹ ${appliedSumAssured?.toLocaleString("en-IN") ?? "-"}`
        },
        {
            label: "Modal Premium/Channel",
            value: `${policyDetails?.modalPremium ?? firstProduct?.paymentAmount ?? "-"}/${policyDetails?.channel ?? data?.sourcingDetail?.channelCode ?? "-"}`
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
            value: `${policyDetails?.productName ?? firstProduct?.name ?? "-"} (${policyDetails?.productType ?? firstProduct?.type ?? "-"})`
        },
    ];

    const formatFaceMatch = (value: string | number | null | undefined) => {
        if (value === null || value === undefined || value === "") return "-";
        if (typeof value === "number") return `${value}%`;
        return value;
    };

    const rawFaceMatchScore = faceMatchDetails?.faceMatchScore ?? personalDetails?.faceMatchScore;
    const faceMatchScore =
        typeof rawFaceMatchScore === "string" || typeof rawFaceMatchScore === "number"
            ? rawFaceMatchScore
            : undefined;

    const profileHighlights = [
        {
            icon: NoteIcon,
            label: "Document",
            value: faceMatchDetails?.document ?? kycDetails?.identityProofType ?? firstDoc?.documentType ?? "-",
        },
        {
            icon: ScannerIcon,
            label: "Face Match %",
            value: formatFaceMatch(faceMatchScore),
        },
        {
            icon: GalleryIcon,
            label: "Image Quality",
            value: asDisplayValue(faceMatchDetails?.imageQuality ?? personalDetails?.imageQuality),
        },
        {
            icon: TextAlignLeftIcon,
            label: "Remarks",
            value: asDisplayValue(faceMatchDetails?.remarks ?? personalDetails?.remarks ?? summaryRemarks),
        },
    ];

    const getTruncatedRemarks = (value: string, maxLength: number) => {
        if (value.length <= maxLength) {
            return {
                text: value,
                truncated: false,
            };
        }

        return {
            text: `${value.slice(0, maxLength)}...`,
            truncated: true,
        };
    };

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

                    {riskDetails.length > 0 && (
                        <>
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
                        </>
                    )}

                    <Divider sx={{ my: 2, px: 2 }} />

                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Typography
                            component="span"
                            sx={{
                                fontSize: "14px",
                                fontWeight: 700,
                            }}
                        >
                            Summary for {currentApplicant?.label}
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
                                        label={systemDecision}
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

                                    {!isPoolRole && (
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
                                                    const itemValue = asDisplayValue(item.value);
                                                    const shouldTruncateRemarks = item.label === "Remarks";
                                                    const remarksDisplay = shouldTruncateRemarks
                                                        ? getTruncatedRemarks(itemValue, 30)
                                                        : { text: itemValue, truncated: false };
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
                                                                    {remarksDisplay.text}
                                                                    {shouldTruncateRemarks && remarksDisplay.truncated && (
                                                                        <Box
                                                                            component="span"
                                                                            sx={{
                                                                                color: "#063E6F",
                                                                                cursor: "pointer",
                                                                                fontWeight: 500,
                                                                                textDecoration: "underline",
                                                                                ml: 0.5,
                                                                            }}
                                                                            onClick={() => {
                                                                                setFullRemarksText(itemValue);
                                                                                setOpenRemarksDialog(true);
                                                                            }}
                                                                        >
                                                                            show more
                                                                        </Box>
                                                                    )}
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
                                            {summaryRemarks}
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
                                                {systemDecision}
                                            </Typography>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    color: "#161616",
                                                    fontWeight: 600,
                                                    fontSize: "16px",
                                                }}
                                            >
                                                - {decisionCategory} ({decisionAction})
                                            </Typography>
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <ApplicantProfile profile={undefined} selectedApplicantTab={activeApplicantTab} />

                    {isPoolRole && (
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
                    )}

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
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "minmax(220px, 1fr) minmax(180px, 1fr)",
                            columnGap: 3,
                            rowGap: 1.5,
                            alignItems: "start",
                        }}
                    >
                        {selectedCard?.detailedDesc.map((detail, index) => (
                            <>
                                <Typography
                                    key={`${detail.label}-${index}-label`}
                                    sx={{
                                        fontSize: "14px",
                                        color: "#5f5f5f",
                                        fontWeight: 400,
                                    }}
                                >
                                    {detail.label}
                                </Typography>
                                <Typography
                                    key={`${detail.label}-${index}-value`}
                                    sx={{
                                        fontSize: "14px",
                                        color: "#20242c",
                                        fontWeight: 700,
                                    }}
                                >
                                    {detail.value}
                                </Typography>
                            </>
                        ))}
                    </Box>
                </Box>
            </CustomDialog>

            <CustomDialog
                open={openRemarksDialog}
                onClose={() => setOpenRemarksDialog(false)}
                title={
                    <Typography sx={{ ...modalTitleStyles }}>
                        Remarks
                    </Typography>
                }
                maxWidth="sm"
                fullWidth
            >
                <Typography
                    sx={{
                        fontSize: "14px",
                        color: "#20242c",
                        fontWeight: 500,
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                    }}
                >
                    {fullRemarksText}
                </Typography>
            </CustomDialog>
        </Container>
    )
}

export default Summary