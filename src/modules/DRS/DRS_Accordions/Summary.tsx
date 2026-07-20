import { Box, Container, MenuItem, Select, Typography } from "@mui/material";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTabs from "../../../components/ui/Tabs/Tabs";
import { applicantTabs } from "../../../utils/constant";
import { useEffect, useMemo, useState } from "react";
import type { ApplicantTab } from "../../../types/drs.types";
import { useSelector } from "react-redux";
import type { RootState } from "../../../store/store";
import CustomButton from "../../../components/ui/Button/Button";
import ApplicantProfile from "./ApplicantProfile/ApplicantProfile";
import { getFinancialPath, getMedicalPath } from "../../../routes/routes";
import { useNavigate } from "react-router-dom";
import CustomDialog from "../../../components/ui/Dialog/Dialog";
import { markApplicantTabVisited, syncRequiredApplicantTabs } from "../../../validations/drsApplicantTabValidation";

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

type DvtLifeOption = "main" | "joint";
type RiskSectionKey = "medical" | "financial" | "other";

type RiskCardItem = {
    key: RiskSectionKey;
    label: string;
    subLabel: string;
    data: Record<string, unknown>;
    isHealthy: boolean;
    mismatches: string[];
};

const EXPECTED_RISK_PARAMETERS: Record<RiskSectionKey, Record<string, string[]>> = {
    medical: {
        brePhysicalMedicalDecision: ["STP", "STD", "STANDARD", "STANDARD 1"],
        breTeleVideoMerDecision: ["STANDARD", "STANDARD 1", "STP", "STD"],
        biuMedicalStatus: ["Y"],
    },
    financial: {
        breFinancialDecision: ["FSTP", "STD", "STANDARD"],
        biuFinancialStatus: ["N"],
    },
    other: {
        ptlrResponse: ["STANDARD"],
        drcResponse: ["NO"],
        adverseIIB: ["NO"],
        criminalQuestionResponseLA: ["NO"],
        pepQuestionResponseLA: ["NO"],
        criminalQuestionResponsePR: ["NO"],
        pepQuestionResponsePR: ["NO"],
        previousPolicySubstandard: ["NO"],
        avocationRelatedDisclosure: ["NO"],
        healthQuestionPositive: ["NO"],
        employmentInRiskyIndustry: ["NO"],
        fatfOfacCountryLogin: ["NO"],
        hazardousOccupation: ["NO"],
        eddFlag: ["NO"],
        claimRiskIndicator: ["NO"],
        tobacco: ["NO"],
        narcotics: ["NO"],
    },
};

const toRecord = (value: unknown): Record<string, unknown> | null => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    return value as Record<string, unknown>;
};

const toBoolean = (value: unknown): boolean => {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") return value.trim().toLowerCase() === "true";
    return false;
};

const hasObjectValues = (value: Record<string, unknown> | null): boolean => {
    if (!value) return false;

    return Object.values(value).some((item) => {
        if (typeof item === "string") return item.trim() !== "";
        return item !== null && item !== undefined;
    });
};

const normalizeParamValue = (value: unknown): string =>
    String(value ?? "")
        .trim()
        .toUpperCase()
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ");

const toTitle = (value: string): string =>
    value
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (char) => char.toUpperCase())
        .trim();

const getFirstNonEmpty = (
    source: Record<string, unknown>,
    keys: string[],
    fallback = "STD",
): string => {
    for (const key of keys) {
        const value = source[key];
        if (typeof value === "string" && value.trim() !== "") {
            return value.trim();
        }
    }

    return fallback;
};

const getDisplayValue = (data: Record<string, unknown>, keys: string[]): unknown => {
    for (const key of keys) {
        const value = data[key];
        if (typeof value === "string") {
            if (value.trim() !== "") return value;
            continue;
        }
        if (value !== null && value !== undefined) return value;
    }

    return "-";
};

const getFinancialFieldsForDisplay = (data: Record<string, unknown>): Array<{ label: string; value: unknown }> => {
    return [
        { label: "Financial Decision", value: data.financialDecision || data.breFinancialDecision || "-" },
        { label: "BRE Financial Decision", value: data.breFinancialDecision || "-" },
        { label: "BRE Remark", value: data.breRemark || data.remarks || "-" },
        { label: "Financial Eligibility", value: data.financialEligibility || "-" },
        { label: "Derived Income", value: data.derivedIncome || "-" },
        { label: "Counter Offer Value", value: data.counterOfferValue || "-" },
        { label: "Additional SA", value: data.additionalSA || "-" },
        {
            label: "BIU Financial Status (Match/Mismatch)",
            value: data.biuFinancialStatus === "N" ? "Match" : data.biuFinancialStatus === "Y" ? "Mismatch" : data.biuFinancialStatus || "-",
        },
    ];
};

const getMedicalFieldsForDisplay = (data: Record<string, unknown>): Array<{ label: string; value: unknown }> => {
    return [
        { label: "BRE Physical Medical Decision", value: data.brePhysicalMedicalDecision || "-" },
        { label: "BRE Physical Medical Remark", value: data.brePhysicalMedicalRemark || "-" },
        { label: "BRE Tele/Video MER Decision", value: data.breTeleVideoMerDecision || "-" },
        { label: "BRE Tele/Video MER Remark", value: data.breTeleVideoMerRemark || "-" },
        { label: "MunichRe Medical decision", value: data.munichReMedicalDecision || "-" },
        { label: "MunichRe Rating", value: data.munichReRating || "-" },
        {
            label: "BIU Medical status (Match/Mismatch)",
            value: data.biuMedicalStatus === "N" ? "Match" : data.biuMedicalStatus === "Y" ? "Mismatch" : data.biuMedicalStatus || "-",
        },
    ];
};

const getOtherRiskFieldsForDisplay = (data: Record<string, unknown>): Array<{ label: string; value: unknown }> => {
    return [
        { label: "PTLR Response", value: getDisplayValue(data, ["ptlrResponse"]) },
        { label: "DRC Response", value: getDisplayValue(data, ["drcResponse"]) },
        { label: "Adverse IIB", value: getDisplayValue(data, ["adverseIIB", "adverseIib"]) },
        { label: "Criminal Question Response (LA)", value: getDisplayValue(data, ["criminalQuestionResponseLA", "criminalQuestionResponseLa"]) },
        { label: "PEP Question Response (LA)", value: getDisplayValue(data, ["pepQuestionResponseLA", "pepQuestionResponseLa"]) },
        { label: "Criminal Question Response (PR)", value: getDisplayValue(data, ["criminalQuestionResponsePR", "criminalQuestionResponsePr"]) },
        { label: "PEP Question Response (PR)", value: getDisplayValue(data, ["pepQuestionResponsePR", "pepQuestionResponsePr"]) },
        { label: "Previous Policy Substandard", value: getDisplayValue(data, ["previousPolicySubstandard"]) },
        { label: "Avocation Related Disclosure", value: getDisplayValue(data, ["avocationRelatedDisclosure"]) },
        { label: "Health Question Positive", value: getDisplayValue(data, ["healthQuestionPositive"]) },
        { label: "Employment in Risky Industry", value: getDisplayValue(data, ["employmentInRiskyIndustry"]) },
        { label: "FATF/OFAC Country Login", value: getDisplayValue(data, ["fatfOfacCountryLogin"]) },
        { label: "Hazardous Occupation", value: getDisplayValue(data, ["hazardousOccupation"]) },
        { label: "EDD Flag", value: getDisplayValue(data, ["eddFlag"]) },
        { label: "Claim Risk Indicator", value: getDisplayValue(data, ["claimRiskIndicator"]) },
        { label: "Face Match Score", value: getDisplayValue(data, ["faceMatchScore", "faceMatchingScore", "facematchScore"]) },
        { label: "Tobacco", value: getDisplayValue(data, ["tobacco"]) },
        { label: "Narcotics", value: getDisplayValue(data, ["narcotics"]) },
    ];
};

const evaluateRiskStatus = (
    section: RiskSectionKey,
    payload: Record<string, unknown>,
): { isHealthy: boolean; mismatches: string[] } => {
    const expectedRules = EXPECTED_RISK_PARAMETERS[section];
    const mismatches = Object.entries(expectedRules).reduce<string[]>((acc, [key, expectedValues]) => {
        const currentValue = payload[key];
        const normalizedCurrent = normalizeParamValue(currentValue);

        if (normalizedCurrent === "") {
            acc.push(`${toTitle(key)} missing`);
            return acc;
        }

        const isExpected = expectedValues
            .map((item) => normalizeParamValue(item))
            .includes(normalizedCurrent);

        if (!isExpected) {
            acc.push(`${toTitle(key)}: ${String(currentValue)} (expected ${expectedValues.join(" / ")})`);
        }

        return acc;
    }, []);

    return {
        isHealthy: mismatches.length === 0,
        mismatches,
    };
};

const riskDetailGridSx = {
    display: "grid",
    gap: 1,
    gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(2, minmax(0, 1fr))",
        md: "repeat(4, minmax(0, 1fr))",
    },
};

const riskDetailItemSx = {
    display: "flex",
    flexDirection: "column" as const,
    gap: 0.15,
    minWidth: 0,
    borderBottom: "1px solid #efefef",
    pb: 0.6,
};

const Summary = () => {
    const navigate = useNavigate();
    const { data } = useSelector((state: RootState) => state.drs);
    const [isApplicantDetailsExpanded, setIsApplicantDetailsExpanded] = useState(true);
    const [selectedRiskCard, setSelectedRiskCard] = useState<RiskCardItem | null>(null);

    const customerDetails = data?.customerDetails ?? [];
    const summaryRoot = data as unknown as Record<string, unknown> | null;
    const summaryEntries = Array.isArray(summaryRoot?.summary)
        ? (summaryRoot.summary as Array<Record<string, unknown>>)
        : [];
    const isLAPropSame = Boolean(data?.applicationInfo?.isLAPropSame);

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
    const roleType = localStorage.getItem("roleType") ?? "";
    const isDvtRole = roleType === "DVT Pool";
    const isFormalRole = roleType === "DVT_FORMAL_TASK" || roleType === "GUW_FORMAL_TASK";
    const canShowRiskAnalytics = roleType !== "DVT Pool" && roleType !== "CVT Pool" && roleType !== "DVT_FORMAL_TASK" && roleType !== "GUW Formal Pool";
    const hasJointLifeFlag = summaryEntries.some((item) => toBoolean(item.jointFlag ?? item.jontFlag));
    const lockedDvtLifeOption: DvtLifeOption | null = hasJointLifeFlag && summaryEntries.length > 1
        ? "joint"
        : !hasJointLifeFlag && summaryEntries.length === 1
        ? "main"
        : null;
    const inferredDvtLifeOption: DvtLifeOption = availableMemberTypes.includes("lifeassured2") || hasJointLifeFlag ? "joint" : "main";
    const [selectedDvtLifeOption, setSelectedDvtLifeOption] = useState<DvtLifeOption | null>(null);
    const dvtLifeOption = lockedDvtLifeOption ?? selectedDvtLifeOption ?? inferredDvtLifeOption;

    const visibleTabs = isFormalRole
        ? []
        : isDvtRole
        ? (dvtLifeOption === "main"
            ? [{ key: "lifeassured1" as const, label: "Life Assured" }]
            : [
                { key: "lifeassured1" as const, label: "Life Assured 1" },
                { key: "lifeassured2" as const, label: "Life Assured 2" },
            ])
        : (isLAPropSame
            ? [{ key: "lifeassured1" as const, label: "Life Assured" }]
            : applicantTabs.filter((tab) => availableMemberTypes.includes(tab.key)));

    const activeApplicantTab: ApplicantTab = isLAPropSame
        ? "lifeassured1"
        : isFormalRole
        ? (availableMemberTypes[0] ?? "proposer")
        : (visibleTabs.find((tab) => tab.key === applicantTab)?.key ?? visibleTabs[0]?.key ?? "proposer");

    useEffect(() => {
        localStorage.setItem("drsSelectedApplicantTab", activeApplicantTab);
        markApplicantTabVisited(activeApplicantTab);
    }, [activeApplicantTab]);

    useEffect(() => {
        syncRequiredApplicantTabs(data);
        markApplicantTabVisited(activeApplicantTab);
    }, [activeApplicantTab, data]);

    const canOpenMedicalFinancialViews = roleType !== "CVT Pool" && roleType !== "DVT Pool" && roleType !== "CPT_TASK" && roleType !== "DVT_FORMAL_TASK" && roleType !== "GUW_FORMAL_TASK";

    const activeSummaryEntry = summaryWithTabs.find((item) => item.memberType === activeApplicantTab)?.customer;
    const activeRiskAnalytics = useMemo(() => {
        const riskAnalytics = activeSummaryEntry?.riskAnalytics;
        if (!Array.isArray(riskAnalytics)) {
            return null;
        }

        return toRecord(riskAnalytics[0]);
    }, [activeSummaryEntry]);

    const externalAPIs = toRecord(data?.externalAPIs);
    const medicalBreOutput = hasObjectValues(toRecord(externalAPIs?.medicalBreOutput))
        ? toRecord(externalAPIs?.medicalBreOutput)
        : toRecord(activeRiskAnalytics?.medicalRisk);

    const financialBreOutput = hasObjectValues(toRecord(externalAPIs?.financialBreOutput))
        ? toRecord(externalAPIs?.financialBreOutput)
        : toRecord(activeRiskAnalytics?.financialRisk);

    const otherRiskOutput = toRecord(activeRiskAnalytics?.otherRisk);

    const riskCards: RiskCardItem[] = useMemo(() => {
        const cards: RiskCardItem[] = [];

        if (hasObjectValues(medicalBreOutput)) {
            const { isHealthy, mismatches } = evaluateRiskStatus("medical", medicalBreOutput!);
            cards.push({
                key: "medical",
                label: "Medical",
                subLabel: `BRE Medical Decision - ${getFirstNonEmpty(medicalBreOutput!, ["breMedicalDecision", "medicalDecision", "brePhysicalMedicalDecision"])}`,
                data: medicalBreOutput!,
                isHealthy,
                mismatches,
            });
        }

        if (hasObjectValues(financialBreOutput)) {
            const { isHealthy, mismatches } = evaluateRiskStatus("financial", financialBreOutput!);
            cards.push({
                key: "financial",
                label: "Financial",
                subLabel: `BRE Financial Decision - ${getFirstNonEmpty(financialBreOutput!, ["breFinancialDecision", "financialDecision"])}`,
                data: financialBreOutput!,
                isHealthy,
                mismatches,
            });
        }

        if (hasObjectValues(otherRiskOutput)) {
            const { isHealthy, mismatches } = evaluateRiskStatus("other", otherRiskOutput!);
            cards.push({
                key: "other",
                label: "Other Risks",
                subLabel: `BRE Decision - ${getFirstNonEmpty(otherRiskOutput!, ["ptlrResponse", "decision"])}`,
                data: otherRiskOutput!,
                isHealthy,
                mismatches,
            });
        }

        return cards;
    }, [financialBreOutput, medicalBreOutput, otherRiskOutput]);

    return (
        <Container disableGutters>
            <Box sx={{ mt: 0.5 }}>
                <CustomAccordion
                    title={isFormalRole ? "Member Details":"Applicant Details"}
                    defaultExpanded
                    expanded={isApplicantDetailsExpanded}
                    onChange={setIsApplicantDetailsExpanded}
                >
                    {isDvtRole && !isFormalRole && (
                        <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 0.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                <Select
                                    size="small"
                                    value={dvtLifeOption}
                                    disabled={Boolean(lockedDvtLifeOption)}
                                    onChange={(event) => {
                                        if (lockedDvtLifeOption) return;
                                        const selected = event.target.value as DvtLifeOption;
                                        setSelectedDvtLifeOption(selected);
                                        setApplicantTab(selected === "main" ? "lifeassured1" : "lifeassured1");
                                    }}
                                    sx={{
                                        minWidth: 118,
                                        height: 28,
                                        fontSize: 12,
                                        backgroundColor: "#fff",
                                        "&.Mui-disabled": {
                                            color: "#161616",
                                            WebkitTextFillColor: "#161616",
                                        },
                                    }}
                                >
                                    <MenuItem value="main">Main Life</MenuItem>
                                    <MenuItem value="joint">Joint Life</MenuItem>
                                </Select>
                            </Box>
                        </Box>
                    )}

                    {!isFormalRole && (
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
                            <CustomTabs
                                tabs={visibleTabs}
                                value={activeApplicantTab}
                                onChange={(tab) => {
                                    if (!isLAPropSame || isDvtRole) {
                                        setApplicantTab(tab);
                                    }
                                }}
                            />
                        </Box>
                    )}

                    {canShowRiskAnalytics && riskCards.length > 0 && (
                        <Box sx={{ mt: 1, mb: 1.25 }}>
                            <Typography sx={{ fontSize: "12px", fontWeight: 800, color: "#2b2b2b", mb: 0.75, lineHeight: 1.2, textTransform: "uppercase" }}>
                                Risk Analytics
                            </Typography>

                            <Box
                                sx={{
                                    display: "grid",
                                    gap: 1,
                                    width: "100%",
                                    gridTemplateColumns: {
                                        xs: "1fr",
                                        sm: "repeat(2, minmax(0, 1fr))",
                                        lg: "repeat(3, minmax(0, 1fr))",
                                    },
                                }}
                            >
                                {riskCards.map((item) => {
                                    const statusColor = item.isHealthy ? "#3AAE42" : "#D32F2F";

                                    return (
                                        <Box
                                            key={item.key}
                                            onClick={() => setSelectedRiskCard(item)}
                                            sx={{
                                                width: "100%",
                                                border: "1px solid #dfdfdf",
                                                borderLeft: `3px solid ${statusColor}`,
                                                borderRadius: "6px",
                                                backgroundColor: "#fff",
                                                px: 1.25,
                                                py: 0.9,
                                                cursor: "pointer",
                                            }}
                                        >
                                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.6 }}>
                                                <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#1f1f1f", lineHeight: 1.2 }}>
                                                    {item.label}
                                                </Typography>

                                                <Box
                                                    sx={{
                                                        width: 16,
                                                        height: 16,
                                                        borderRadius: "50%",
                                                        border: `1.5px solid ${statusColor}`,
                                                        color: statusColor,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "11px",
                                                        fontWeight: 700,
                                                        lineHeight: 1,
                                                    }}
                                                >
                                                    {item.isHealthy ? "✓" : "!"}
                                                </Box>
                                            </Box>

                                            <Typography
                                                sx={{
                                                    display: "inline-flex",
                                                    borderRadius: "999px",
                                                    border: "1px solid #dddddd",
                                                    backgroundColor: "#f2f2f2",
                                                    px: 1,
                                                    py: 0.25,
                                                    fontSize: "11.5px",
                                                    lineHeight: "16px",
                                                    color: "#4a4a4a",
                                                }}
                                            >
                                                {item.subLabel}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    )}

                    <ApplicantProfile
                        profile={undefined}
                        selectedApplicantTab={activeApplicantTab}
                        isApplicantDetailsExpanded={isApplicantDetailsExpanded}
                    />

                    {canOpenMedicalFinancialViews && (
                        <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                            <CustomButton
                                variant="outlined"
                                sx={{
                                    borderRadius: "50px",
                                    px: 3,
                                    py: 0.5,
                                    minWidth: "170px",
                                    fontSize: "12px",
                                    lineHeight: "16px",
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
                                    px: 3,
                                    py: 0.5,
                                    minWidth: "190px",
                                    fontSize: "12px",
                                    lineHeight: "16px",
                                    fontWeight: 700,
                                }}
                                onClick={() => navigate(getFinancialPath("retail", "OB25175127"))}
                            >
                                View Financial Details
                            </CustomButton>
                        </Box>
                    )}

                    <CustomDialog
                        open={Boolean(selectedRiskCard)}
                        onClose={() => setSelectedRiskCard(null)}
                        title={selectedRiskCard?.label ?? "Risk Details"}
                        maxWidth="md"
                    >
                        {selectedRiskCard && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8, minWidth: { xs: 320, md: 760 }, py: 0.25 }}>
                              

                                {!selectedRiskCard.isHealthy && (
                                    <Box sx={{ p: 0.75, borderRadius: "6px", backgroundColor: "#fff1f0", border: "1px solid #ffcdd2" }}>
                                        <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "#b71c1c", mb: 0.25 }}>
                                            Mismatch Details
                                        </Typography>
                                        {selectedRiskCard.mismatches.map((entry, index) => (
                                            <Typography key={`${selectedRiskCard.key}-mismatch-${index}`} sx={{ fontSize: "11.5px", color: "#b71c1c", lineHeight: "16px" }}>
                                                {entry}
                                            </Typography>
                                        ))}
                                    </Box>
                                )}

                                {selectedRiskCard.key === "financial" ? (
                                    <>
                                        <Box sx={riskDetailGridSx}>
                                        {getFinancialFieldsForDisplay(selectedRiskCard.data).map(({ label, value }) => (
                                            <Box
                                                key={`${selectedRiskCard.key}-${label}`}
                                                sx={{
                                                    ...riskDetailItemSx,
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "12px", lineHeight: "16px", color: "#616161", fontWeight: 600 }}>
                                                    {label}
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", lineHeight: "16px", color: "#1f1f1f", fontWeight: 700 }}>
                                                    {value === "" || value === null || value === undefined ? "-" : String(value)}
                                                </Typography>
                                            </Box>
                                        ))}
                                        </Box>
                                    </>
                                ) : selectedRiskCard.key === "medical" ? (
                                    <>
                                        <Box sx={riskDetailGridSx}>
                                        {getMedicalFieldsForDisplay(selectedRiskCard.data).map(({ label, value }) => (
                                            <Box
                                                key={`${selectedRiskCard.key}-${label}`}
                                                sx={{
                                                    ...riskDetailItemSx,
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "12px", lineHeight: "16px", color: "#616161", fontWeight: 600 }}>
                                                    {label}
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", lineHeight: "16px", color: "#1f1f1f", fontWeight: 700 }}>
                                                    {value === "" || value === null || value === undefined ? "-" : String(value)}
                                                </Typography>
                                            </Box>
                                        ))}
                                        </Box>
                                    </>
                                ) : selectedRiskCard.key === "other" ? (
                                    <>
                                        <Box sx={riskDetailGridSx}>
                                        {getOtherRiskFieldsForDisplay(selectedRiskCard.data).map(({ label, value }) => (
                                            <Box
                                                key={`${selectedRiskCard.key}-${label}`}
                                                sx={{
                                                    ...riskDetailItemSx,
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "12px", lineHeight: "16px", color: "#616161", fontWeight: 600 }}>
                                                    {label}
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", lineHeight: "16px", color: "#1f1f1f", fontWeight: 700 }}>
                                                    {value === "" || value === null || value === undefined ? "-" : String(value)}
                                                </Typography>
                                            </Box>
                                        ))}
                                        </Box>
                                    </>
                                ) : (
                                    <>
                                        <Box sx={riskDetailGridSx}>
                                        {Object.entries(selectedRiskCard.data).map(([key, value]) => (
                                            <Box
                                                key={`${selectedRiskCard.key}-${key}`}
                                                sx={{
                                                    ...riskDetailItemSx,
                                                }}
                                            >
                                                <Typography sx={{ fontSize: "12px", lineHeight: "16px", color: "#616161", fontWeight: 600 }}>
                                                    {toTitle(key)}
                                                </Typography>
                                                <Typography sx={{ fontSize: "12px", lineHeight: "16px", color: "#1f1f1f", fontWeight: 700 }}>
                                                    {value === "" || value === null || value === undefined ? "-" : String(value)}
                                                </Typography>
                                            </Box>
                                        ))}
                                        </Box>
                                    </>
                                )}
                            </Box>
                        )}
                    </CustomDialog>
                </CustomAccordion>
            </Box>
        </Container>
    );
};

export default Summary;
