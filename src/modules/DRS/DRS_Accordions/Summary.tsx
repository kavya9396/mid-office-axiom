import { Box, Container } from "@mui/material";
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

const DRS_REQUIRED_APPLICANT_TABS_KEY = "drsRequiredApplicantTabs";
const DRS_VISITED_APPLICANT_TABS_KEY = "drsVisitedApplicantTabs";
const DRS_TAB_VISIT_EVENT = "drsApplicantTabsVisitedChanged";

const getStoredTabs = (key: string): ApplicantTab[] => {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed)
            ? parsed.map((value) => String(value) as ApplicantTab)
            : [];
    } catch {
        return [];
    }
};

const setStoredTabs = (key: string, tabs: ApplicantTab[]) => {
    localStorage.setItem(key, JSON.stringify(Array.from(new Set(tabs))));
    window.dispatchEvent(new Event(DRS_TAB_VISIT_EVENT));
};

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

const Summary = () => {
    const navigate = useNavigate();
    const { data } = useSelector((state: RootState) => state.drs);
  

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
    const [isApplicantDetailsExpanded, setIsApplicantDetailsExpanded] = useState(false);

    const visibleTabs = useMemo(
        () => (isLAPropSame
            ? [{ key: "lifeassured1" as const, label: "Life Assured" }]
            : applicantTabs.filter((tab) => availableMemberTypes.includes(tab.key))),
        [availableMemberTypes, isLAPropSame],
    );
    const visibleTabKeys = useMemo(() => visibleTabs.map((tab) => tab.key), [visibleTabs]);

    const activeApplicantTab: ApplicantTab = isLAPropSame
        ? "lifeassured1"
        : (visibleTabs.find((tab) => tab.key === applicantTab)?.key ?? visibleTabs[0]?.key ?? "proposer");

    useEffect(() => {
        localStorage.setItem("drsSelectedApplicantTab", activeApplicantTab);
    }, [activeApplicantTab]);

    useEffect(() => {
        setStoredTabs(DRS_REQUIRED_APPLICANT_TABS_KEY, visibleTabKeys);

        const storedVisitedTabs = getStoredTabs(DRS_VISITED_APPLICANT_TABS_KEY);
        const filteredVisitedTabs = storedVisitedTabs.filter((tab) => visibleTabKeys.includes(tab));
        const nextVisitedTabs = Array.from(new Set([...filteredVisitedTabs, activeApplicantTab]));

        setStoredTabs(DRS_VISITED_APPLICANT_TABS_KEY, nextVisitedTabs);
    }, [activeApplicantTab, visibleTabKeys]);

    const roleType = localStorage.getItem("roleType") ?? "";
    const visibleButtons = ["CPT Pool"];
    const isPoolRole = visibleButtons.includes(roleType);

    return (
        <Container disableGutters>
            <Box sx={{ mt: 2 }}>
                <CustomAccordion
                    title="Applicant Details"
                    defaultExpanded={false}
                    onChange={setIsApplicantDetailsExpanded}
                >
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

                    <ApplicantProfile
                        profile={undefined}
                        selectedApplicantTab={activeApplicantTab}
                        isApplicantDetailsExpanded={isApplicantDetailsExpanded}
                    />

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
        </Container>
    );
};

export default Summary;
