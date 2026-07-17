import { Box, Checkbox, Container, FormControlLabel, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../../components/layout/BackButton";
import CustomButton from "../../../components/ui/Button/Button";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTabs from "../../../components/ui/Tabs/Tabs";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useAppContext } from "../../../hooks/useAppContext";
import { getDRSPath, getFinancialPath, getMedicalPath } from "../../../routes/routes";
import { apiRequest } from "../../../services/api";
import { url } from "../../../services/apiConfig";
import type { RootState } from "../../../store/store";
import type { ApplicantTab, MedicalResponse, MedicalSection, MedicalSummaryMember, MedicalTestRow } from "../../../types/drs.types";
import { applicantTabs } from "../../../utils/constant";
import BreDecision from "../DRS_Accordions/BreDecision";
import ApplicantProfile from "../DRS_Accordions/ApplicantProfile/ApplicantProfile";
import FormalMemberProfile from "../DRS_Accordions/ApplicantProfile/FormalMemberProfile";
import { buildFormalMemberProfile, getFormalHeaderData, isFormalTaskRole } from "../formalProfileHelpers";
import { merFieldConfig } from "./merFieldConfig";
import type { MedicalFieldConfig } from "./medicalFieldConfig";
import { otherMedicalViewFieldConfig } from "./otherMedicalViewFieldConfig";
import { specialMedicalViewFieldConfig } from "./specialMedicalViewFieldConfig";
import medicalMockData from "../../../../mock/drs/medical.mock.json";

const getStoredApplicantTab = () => (localStorage.getItem("drsSelectedApplicantTab") as ApplicantTab | null) ?? "proposer";
const getRoleType = () => localStorage.getItem("roleType") ?? "";

type MedicalSectionTab = "mer" | "specialMedical" | "otherMedicals";
type DRSViewTab = "medical" | "financial";

const drsViewTabs: { key: DRSViewTab; label: string }[] = [
  { key: "medical", label: "View Medical" },
  { key: "financial", label: "View Financial" },
];

const medicalSectionTabs: { key: MedicalSectionTab; label: string }[] = [
  { key: "mer", label: "MER" },
  { key: "specialMedical", label: "Special Medical" },
  { key: "otherMedicals", label: "Other Medicals" },
];

type MedicalMenuItem = {
  id: string;
  title: string;
  category: MedicalSectionTab;
  section: MedicalSection;
  fallbackFields: MedicalFieldConfig[];
};

type SubmitResponse = {
  success?: boolean;
  message?: string;
};

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const buildConfigSectionMap = (config: MedicalFieldConfig[]) => {
  const mapping = new Map<string, MedicalFieldConfig[]>();

  for (const field of config) {
    const key = normalizeKey(field.section);
    if (!key) {
      continue;
    }

    if (!mapping.has(key)) {
      mapping.set(key, []);
    }

    mapping.get(key)?.push(field);
  }

  for (const values of mapping.values()) {
    values.sort((a, b) => a.row - b.row);
  }

  return mapping;
};

const merViewConfigBySection = buildConfigSectionMap(merFieldConfig);
const specialViewConfigBySection = buildConfigSectionMap(specialMedicalViewFieldConfig);
const otherViewConfigBySection = buildConfigSectionMap(otherMedicalViewFieldConfig);

const SPECIAL_SECTION_KEYS = new Set(
  specialMedicalViewFieldConfig
    .map((field) => normalizeKey(field.section))
    .filter(Boolean)
);

const OTHER_SECTION_KEYS = new Set(
  otherMedicalViewFieldConfig
    .map((field) => normalizeKey(field.section))
    .filter(Boolean)
);

const SPECIAL_SECTION_ALIAS_KEYS = new Set([
  "completebloodcountcbc",
  "lipidprofile",
  "liverfunctiontestlft",
  "kidneyfunctiontestkft",
  "diabetespanel",
  "thyroidfunction",
  "cardiacmarkers",
  "vitaminminerals",
  "bloodsugarrandom",
  "fastingbloodsugarfbs",
  "postprandialbloodsugarppbs",
  "hba1c",
  "hbsag",
  "antihcvantibody",
  "hivelisa",
  "hivwesternblot",
  "erythrocytesedimentationrate",
]);

const SPECIAL_CONFIG_TO_DATA_KEY_MAP: Record<string, string[]> = {
  cbcgroup: ["completebloodcountcbc"],
  lipids: ["lipidprofile"],
  sma12group: ["liverfunctiontestlft", "kidneyfunctiontestkft", "diabetespanel", "thyroidfunction"],
};

const resolveMedicalCategory = (title: string): MedicalSectionTab => {
  const key = normalizeKey(title);

  if (key.includes("mer")) {
    return "mer";
  }

  if (OTHER_SECTION_KEYS.has(key)) {
    return "otherMedicals";
  }

  if (SPECIAL_SECTION_KEYS.has(key) || SPECIAL_SECTION_ALIAS_KEYS.has(key)) {
    return "specialMedical";
  }

  return "mer";
};

const getStatusColors = (status: string) => {
  const normalized = status.toLowerCase();
  if (normalized === "abnormal" || normalized === "positive" || normalized === "positive/reactive") {
    return { text: "#B42318", bg: "#FEF3F2" };
  }

  if (normalized === "normal" || normalized === "negative" || normalized === "negative/non reactive") {
    return { text: "#067647", bg: "#ECFDF3" };
  }

  return { text: "#475467", bg: "#F2F4F7" };
};

const getStatusDotColor = (status: string) => {
  const normalized = status.toLowerCase().trim();
  if (normalized === "normal" || normalized === "green" || normalized === "negative" || normalized === "negative/non reactive") {
    return "#2FA641";
  }
  if (normalized === "abnormal" || normalized === "red" || normalized === "positive" || normalized === "positive/reactive") {
    return "#DE2C3B";
  }
  return "#98A2B3";
};

const uniqSectionTitles = (titles: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const title of titles) {
    const trimmed = title.trim();
    if (!trimmed) {
      continue;
    }

    const key = normalizeKey(trimmed);
    if (!key || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(trimmed);
  }

  return result;
};

const getConfigFieldsBySection = (sectionMap: Map<string, MedicalFieldConfig[]>, sectionTitle: string) => {
  const normalizedSection = normalizeKey(sectionTitle);
  return normalizedSection ? (sectionMap.get(normalizedSection) ?? []) : [];
};

const normalizeFieldText = (value?: string) => (value ?? "").trim();

const parseConfigDropdownOptions = (field: MedicalFieldConfig) => {
  const raw = normalizeFieldText(field.options);
  if (!raw) {
    return [] as { label: string; value: string }[];
  }

  const parts = raw
    .replace(/\r?\n/g, ",")
    .replace(/\s*\/\s*/g, ",")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item) => item.toLowerCase() !== "dropdown")
    .filter((item) => item.toLowerCase() !== "--select--")
    .filter((item) => item.toLowerCase() !== "---select---");

  return parts.map((item) => ({ label: item, value: item }));
};

const isDropdownConfigField = (field: MedicalFieldConfig) => {
  const type = normalizeFieldText(field.dataType).toLowerCase();
  return type.includes("dropdown") || type.includes("yes/no") || parseConfigDropdownOptions(field).length > 0;
};

const isDateConfigField = (field: MedicalFieldConfig) => {
  const type = normalizeFieldText(field.dataType).toLowerCase();
  return type.includes("calendar") || type.includes("yyyy-mm-dd") || type.includes("dd/mm/yyyy");
};

const isNumericConfigField = (field: MedicalFieldConfig) => {
  const type = normalizeFieldText(field.dataType).toLowerCase();
  return type.includes("numeric") || type.includes("numerical");
};

const isMandatoryConfigField = (field: MedicalFieldConfig) => {
  const mandatory = normalizeFieldText(field.mandatory).toLowerCase();
  if (!mandatory || mandatory.includes("non-mandatory") || mandatory.includes("non mandatory")) {
    return false;
  }

  return mandatory.includes("mandatory") || mandatory === "yes" || mandatory.startsWith("yes (") || mandatory.includes("- mandatory");
};

const getRangeBounds = (normalRange: string) => {
  const value = normalizeFieldText(normalRange);
  if (!value.includes("-")) {
    return { from: "", to: "" };
  }

  const [from, to] = value.split("-").map((part) => part.trim());
  return { from: from ?? "", to: to ?? "" };
};

const getSectionRowByField = (rows: MedicalTestRow[], field: MedicalFieldConfig) => {
  const fieldKey = normalizeKey(field.field);
  const typeKey = normalizeKey(field.type);

  return rows.find((row) => {
    const parameterKey = normalizeKey(row.parameter);
    return parameterKey === fieldKey || parameterKey === typeKey || parameterKey.includes(typeKey) || typeKey.includes(parameterKey);
  });
};

const getFallbackFieldValue = (
  field: MedicalFieldConfig,
  rows: MedicalTestRow[],
  applicationId: string,
  applicant: ReturnType<typeof getApplicantHeaderData>
) => {
  const row = getSectionRowByField(rows, field);
  const fieldLabel = normalizeKey(field.field);

  if (row) {
    if (fieldLabel.includes("findings") || fieldLabel.includes("status") || fieldLabel.includes("result")) {
      return normalizeFieldText(row.status).toUpperCase();
    }
    if (fieldLabel.includes("unit")) {
      return row.unit;
    }
    if (fieldLabel === "from") {
      return getRangeBounds(row.normalRange).from;
    }
    if (fieldLabel === "to") {
      return getRangeBounds(row.normalRange).to;
    }
    if (fieldLabel.includes("value") || fieldLabel.includes("fraction") || fieldLabel.includes("rate")) {
      return row.value;
    }

    return row.value;
  }

  if (fieldLabel.includes("applicationno")) {
    return applicationId;
  }
  if (fieldLabel.includes("firstname")) {
    return normalizeFieldText(applicant.name).split(" ")[0] ?? "";
  }
  if (fieldLabel.includes("lastname")) {
    const nameParts = normalizeFieldText(applicant.name).split(" ").filter(Boolean);
    return nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";
  }
  if (fieldLabel.includes("examineename") || fieldLabel.includes("nameofme")) {
    return applicant.name;
  }
  if (fieldLabel.includes("dob") || fieldLabel.includes("dateofbirth")) {
    return String(applicant.dob ?? "");
  }
  if (fieldLabel.includes("gender")) {
    return String(applicant.gender ?? "").toUpperCase();
  }
  if (fieldLabel.includes("age")) {
    return String(applicant.age ?? "");
  }
  if (fieldLabel.includes("contactno") || fieldLabel.includes("mobile")) {
    return applicant.mobile;
  }

  return "";
};

// const formatCurrencyINR = (value?: number | string) => {
//   if (value === undefined || value === null || value === "") {
//     return "-";
//   }

//   const numericValue = Number(value);
//   if (Number.isNaN(numericValue)) {
//     return String(value);
//   }

//   return numericValue.toLocaleString("en-IN");
// };

const getMemberSummary = (member?: MedicalSummaryMember) => {
  if (!member) {
    return undefined;
  }

  if (member.memberType === "proposer") {
    return member.proposerSummary;
  }

  if (member.memberType === "lifeassured1") {
    return member.lifeassured1Summary;
  }

  if (member.memberType === "lifeassured2") {
    return member.lifeassured2Summary;
  }

  return undefined;
};

const getApplicantHeaderData = (summary?: MedicalSummaryMember) => {
  const memberSummary = getMemberSummary(summary);

  return {
    name: [memberSummary?.firstName, memberSummary?.middleName, memberSummary?.lastName].filter(Boolean).join(" ") || "-",
    dob: memberSummary?.dob ?? "-",
    age: memberSummary?.age ?? "-",
    gender: memberSummary?.gender ?? "-",
    profileImage: memberSummary?.profileImage ?? "",
    caseStatus: memberSummary?.caseStatus ?? "",
    occupation: memberSummary?.occupation ?? "-",
    annualIncome: memberSummary?.annualIncome,
    email: memberSummary?.email ?? "-",
    mobile: memberSummary?.mobile ?? "-",
  };
};

const ViewMedicals = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicationNumber } = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);
  const requestedApplicantTab =
    ((location.state as { selectedApplicantTab?: ApplicantTab } | null)?.selectedApplicantTab) ??
    getStoredApplicantTab();

  const medicalData = medicalMockData as MedicalResponse;
  const [activeApplicantTab, setActiveApplicantTab] = useState<ApplicantTab>(requestedApplicantTab);
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [isEditable, setIsEditable] = useState(false);
  const [doNotPayForTpa, setDoNotPayForTpa] = useState(false);
  const [medicalFieldValues, setMedicalFieldValues] = useState<Record<string, string>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const safeApplicationId = applicationNumber ?? medicalData.applicationId ?? "";
  const isApplicationIdMissing = !safeApplicationId;
  const roleType = getRoleType();
  const isFormalRole = isFormalTaskRole(roleType);
  const formalMemberProfile = useMemo(() => buildFormalMemberProfile(drsData), [drsData]);

  const availableMemberTypes = useMemo(
    () => medicalData?.summary?.map((item) => item.memberType) ?? [],
    [medicalData]
  );

  const visibleTabs = useMemo(
    () => applicantTabs.filter((tab) => availableMemberTypes.includes(tab.key)),
    [availableMemberTypes]
  );

  const currentApplicantTab = useMemo(
    () =>
      visibleTabs.some((tab) => tab.key === activeApplicantTab)
        ? activeApplicantTab
        : (visibleTabs[0]?.key ?? "proposer"),
    [activeApplicantTab, visibleTabs]
  );

  const selectedApplicantSummary = useMemo(() => {
    const preferred = medicalData?.summary?.find((item) => item.memberType === currentApplicantTab);
    if (preferred) {
      return preferred;
    }

    if (visibleTabs[0]) {
      return medicalData?.summary?.find((item) => item.memberType === visibleTabs[0].key);
    }

    return medicalData?.summary?.[0];
  }, [currentApplicantTab, medicalData, visibleTabs]);

  const applicantData = isFormalRole
    ? getFormalHeaderData(formalMemberProfile)
    : getApplicantHeaderData(selectedApplicantSummary);

  const medicalMenuItems = useMemo<MedicalMenuItem[]>(
    () => {
      const dataSections = medicalData?.sections ?? [];
      const dataSectionMap = new Map<string, MedicalSection>();

      dataSections.forEach((section) => {
        const key = normalizeKey(section.title);
        if (key && !dataSectionMap.has(key)) {
          dataSectionMap.set(key, section);
        }
      });

      const buildItems = (titles: string[], category: MedicalSectionTab) =>
        titles.map((title, index) => {
          const normalizedTitle = normalizeKey(title);
          let matchedSection = dataSectionMap.get(normalizedTitle);
          const sectionConfigMap = category === "mer"
            ? merViewConfigBySection
            : category === "specialMedical"
              ? specialViewConfigBySection
              : otherViewConfigBySection;

          if (!matchedSection && category === "specialMedical") {
            const fallbackKeys = SPECIAL_CONFIG_TO_DATA_KEY_MAP[normalizedTitle] ?? [];
            matchedSection = fallbackKeys.map((key) => dataSectionMap.get(key)).find(Boolean);
          }

          return {
            id: `${category}-${index}-${normalizedTitle || "test"}`,
            title,
            category,
            section: matchedSection ?? { title, rows: [] },
            fallbackFields: getConfigFieldsBySection(sectionConfigMap, title),
          } as MedicalMenuItem;
        });

      const merCatalog = uniqSectionTitles(merFieldConfig.map((field) => field.section));
      const specialCatalog = uniqSectionTitles(specialMedicalViewFieldConfig.map((field) => field.section));
      const otherCatalog = uniqSectionTitles(otherMedicalViewFieldConfig.map((field) => field.section));

      const catalogItems = [
        ...buildItems(merCatalog, "mer"),
        ...buildItems(specialCatalog, "specialMedical"),
        ...buildItems(otherCatalog, "otherMedicals"),
      ];

      const existingCatalogKeys = new Set(catalogItems.map((item) => `${item.category}-${normalizeKey(item.title)}`));

      const fallbackDataItems = dataSections
        .map((section, index) => {
          const category = resolveMedicalCategory(section.title);
          return {
            id: `${category}-data-${index}-${normalizeKey(section.title) || "test"}`,
            title: section.title,
            category,
            section,
            fallbackFields: [],
          } as MedicalMenuItem;
        })
        .filter((item) => !existingCatalogKeys.has(`${item.category}-${normalizeKey(item.title)}`));

      return [...catalogItems, ...fallbackDataItems];
    },
    [medicalData?.sections]
  );

  const groupedMedicalMenuItems = useMemo(
    () =>
      medicalSectionTabs
        .map((group) => ({ ...group, items: medicalMenuItems.filter((item) => item.category === group.key) }))
        .filter((group) => group.items.length > 0),
    [medicalMenuItems]
  );

  const resolvedActiveSectionId = useMemo(
    () => (medicalMenuItems.some((item) => item.id === activeSectionId) ? activeSectionId : (medicalMenuItems[0]?.id ?? "")),
    [activeSectionId, medicalMenuItems]
  );

  useEffect(() => {
    if (!resolvedActiveSectionId) {
      return;
    }

    const menuContainer = menuContainerRef.current;
    if (!menuContainer) {
      return;
    }

    const activeMenuItem = menuContainer.querySelector(
      `[data-medical-menu-id="${resolvedActiveSectionId}"]`
    ) as HTMLElement | null;

    if (!activeMenuItem) {
      return;
    }

    const containerRect = menuContainer.getBoundingClientRect();
    const itemRect = activeMenuItem.getBoundingClientRect();

    if (itemRect.top < containerRect.top || itemRect.bottom > containerRect.bottom) {
      activeMenuItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [resolvedActiveSectionId]);

  useEffect(() => {
    if (!medicalMenuItems.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length === 0) {
          return;
        }

        const nextActiveSection = visibleEntries[0].target.getAttribute("data-medical-section");
        if (nextActiveSection) {
          setActiveSectionId(nextActiveSection);
        }
      },
      {
        root: null,
        rootMargin: "-160px 0px -55% 0px",
        threshold: [0.1, 0.35, 0.6],
      }
    );

    medicalMenuItems.forEach((section) => {
      const sectionNode = sectionRefs.current[section.id];
      if (sectionNode) {
        observer.observe(sectionNode);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [medicalMenuItems, currentApplicantTab]);

  const handleMedicalSectionMenuClick = (sectionId: string) => {
    setActiveSectionId(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDRSViewTabChange = (value: DRSViewTab) => {
    if (!safeApplicationId) {
      return;
    }

    if (value === "medical") {
      navigate(getMedicalPath(safeApplicationId), {
        state: { selectedApplicantTab: currentApplicantTab },
      });
      return;
    }

    navigate(getFinancialPath(safeApplicationId), {
      state: { selectedApplicantTab: currentApplicantTab },
    });
  };

  const getMedicalFieldValue = (key: string, fallback: string) => medicalFieldValues[key] ?? fallback;

  const handleMedicalFieldChange = (key: string, value: string) => {
    setMedicalFieldValues((currentValues) => ({
      ...currentValues,
      [key]: value,
    }));
  };

  const handleDisagree = () => {
    setSubmitMessage(null);
    setSubmitError(null);
    setIsEditable(true);
  };

  const handleAgree = async () => {
    try {
      setSubmitLoading(true);
      setSubmitMessage(null);
      setSubmitError(null);

      const response = await apiRequest<SubmitResponse, unknown>({
        url: url("medicalSubmit"),
        method: "POST",
        body: {
          applicationId: safeApplicationId,
          roleType: getRoleType(),
          applicantTab: currentApplicantTab,
          agreed: true,
          doNotPayForTpa,
          fields: medicalFieldValues,
        },
      });

      setSubmitMessage(response.message ?? "Medical details submitted successfully.");
      setIsEditable(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit medical details.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Container disableGutters sx={{ pb: 4 }}>
      <BackButton
        label="Back to DRS"
        onClick={() => navigate(getDRSPath(safeApplicationId))}
      />

      {isApplicationIdMissing && (
        <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
          Application ID is missing.
        </Typography>
      )}

      <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
        <CustomTabs
          tabs={drsViewTabs}
          value="medical"
          onChange={(value: DRSViewTab) => handleDRSViewTabChange(value)}
        />
      </Box>

      {/*
      <BreDecision
        extraFields={medicalData?.breAdditionalFields ?? []}
        breDecisionOverride={medicalData?.breDecision ?? null}
      />
      */}
      <BreDecision />

      {!isFormalRole && (
        <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
          <CustomTabs
            tabs={visibleTabs}
            value={currentApplicantTab}
            onChange={(value: ApplicantTab) => {
              setActiveApplicantTab(value);
              localStorage.setItem("drsSelectedApplicantTab", value);
            }}
          />
        </Box>
      )}

      <Box sx={{ position: "sticky", top: 12, zIndex: 10, mb: 1, mt: 2 }}>
        <CustomAccordion title={isFormalRole ? "Member Profile" : "Applicant Profile"} defaultExpanded={false} detailPadding={0}>
          {isFormalRole ? (
            <Box sx={{ px: { xs: 2, md: 3 }, py: 2, backgroundColor: "#FFFFFF" }}>
              <FormalMemberProfile profile={formalMemberProfile} />
            </Box>
          ) : (
            //   <Box sx={{ px: { xs: 2, md: 3 }, py: 2.25, backgroundColor: "#EBF1F5" }}>
            //   <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
            //     <Box
            //       sx={{
            //         width: 76,
            //         height: 76,
            //         borderRadius: "50%",
            //         backgroundColor: "#EBF1F5",
            //         display: "flex",
            //         alignItems: "center",
            //         justifyContent: "center",
            //         overflow: "hidden",
            //         flexShrink: 0,
            //       }}
            //     >
            //       {applicantData.profileImage && (
            //         <Box
            //           component="img"
            //           src={applicantData.profileImage}
            //           alt={`${applicantData.name}'s photo`}
            //           sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
            //         />
            //       )}
            //     </Box>

            //     <Box sx={{ flex: 1, minWidth: 0 }}>
            //       <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
            //         <Box>
            //           <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#1E293B", lineHeight: 1.15 }}>
            //             {applicantData.name}
            //           </Typography>
            //           <Typography sx={{ fontSize: 14, color: "#4B5563", mt: 0.5 }}>
            //             DOB: {applicantData.dob}
            //           </Typography>
            //         </Box>

            //         <Badge label={`${applicantData.gender}, ${applicantData.age} Years`} variant="Neutral" size="medium" />
            //       </Box>

            //       <Divider sx={{ my: 1.25, borderColor: "#B7C1CB" }} />

            //       <Box
            //         sx={{
            //           display: "grid",
            //           gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
            //           gap: { xs: 1.25, md: 2 },
            //         }}
            //       >
            //         {applicantInfoItems.map((item) => (
            //           <Box key={item.label} sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, minWidth: 0 }}>
            //             <Box sx={{ color: "#1E5A8B", mt: 0.2, display: "inline-flex" }}>{item.icon}</Box>
            //             <Box sx={{ minWidth: 0 }}>
            //               <Typography sx={{ fontSize: 12, color: "#475569", lineHeight: 1.2 }}>{item.label}</Typography>
            //               <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#111827", lineHeight: 1.3, wordBreak: "break-word" }}>
            //                 {item.value || "-"}
            //               </Typography>
            //             </Box>
            //           </Box>
            //         ))}
            //       </Box>
            //     </Box>
            //   </Box>
            // </Box>

            <Box sx={{ px: { xs: 2, md: 3 }, py: 2, backgroundColor: "#FFFFFF" }}>
              <ApplicantProfile selectedApplicantTab={currentApplicantTab} isApplicantDetailsExpanded />
            </Box>
          )}
        </CustomAccordion>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 1.5,
          alignItems: "flex-start",
          mt: 1,
        }}
      >
        <Box
          ref={menuContainerRef}
          sx={{
            width: { xs: "100%", md: 208 },
            position: { xs: "static", md: "sticky" },
            top: { md: 124 },
            alignSelf: "flex-start",
            borderRadius: 1,
            overflow: "hidden",
            border: "1px solid #D6D8DC",
            backgroundColor: "#F8F9FB",
            maxHeight: { md: "calc(100vh - 180px)" },
            overflowY: { md: "auto" },
          }}
        >
          {groupedMedicalMenuItems.map((group) => (
            <Box key={group.key}>
              <Typography
                sx={{
                  px: 1.5,
                  py: 1,
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#344054",
                  backgroundColor: "#EEF2F6",
                  borderBottom: "1px solid #E4E7EC",
                  textTransform: "uppercase",
                  letterSpacing: 0.35,
                }}
              >
                {group.label}
              </Typography>

              {group.items.map((item) => {
                const isActive = item.id === resolvedActiveSectionId;

                return (
                  <Box
                    key={item.id}
                    data-medical-menu-id={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleMedicalSectionMenuClick(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleMedicalSectionMenuClick(item.id);
                      }
                    }}
                    sx={{
                      px: 1.5,
                      py: 1.25,
                      borderLeft: isActive ? "3px solid #DE2C3B" : "3px solid transparent",
                      borderBottom: "1px solid #EAECEF",
                      backgroundColor: isActive ? "#FFFFFF" : "transparent",
                      color: isActive ? "#B42318" : "#667085",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      lineHeight: 1.3,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography sx={{ fontSize: "inherit", fontWeight: "inherit", color: "inherit" }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "inherit", lineHeight: 1 }}>
                      {"\u203A"}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>

        <Box sx={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          {medicalMenuItems.length === 0 ? (
            <Typography sx={{ color: "#6B7280" }}>
              No medical sections found.
            </Typography>
          ) : (
            medicalMenuItems.map((item) => (
              <Box
                key={item.id}
                data-medical-section={item.id}
                ref={(node) => {
                  sectionRefs.current[item.id] = node as HTMLDivElement | null;
                }}
                sx={{
                  scrollMarginTop: "160px",
                  border: "1px solid #E4E7EC",
                  borderRadius: 1.5,
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 1px 2px rgba(16,24,40,0.08)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    px: { xs: 1.5, md: 2 },
                    py: 1.25,
                    borderBottom: "1px solid #E4E7EC",
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1F2937" }}>
                    {item.title}
                  </Typography>
                </Box>

                <Box sx={{ px: { xs: 1, md: 1.5 }, py: 1.25 }}>
                  {item.section.rows.length === 0 ? (
                    item.fallbackFields.length > 0 ? (
                      item.id !== resolvedActiveSectionId && !isEditable ? (
                        <Typography sx={{ color: "#667085", fontSize: 13 }}>
                          Select this section to load details.
                        </Typography>
                      ) : (
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                            gap: 1.25,
                            px: 1,
                          }}
                        >
                          {item.fallbackFields.map((field) => {
                            const isDropdown = isDropdownConfigField(field);
                            const isDate = isDateConfigField(field);
                            const isNumeric = isNumericConfigField(field);
                            const required = isMandatoryConfigField(field);
                            const label = `${field.field}${required ? " *" : ""}`;
                            const fieldValue = getFallbackFieldValue(field, item.section.rows, safeApplicationId, applicantData);
                            const fieldKey = `${item.id}-field-${field.id}`;
                            const editableValue = getMedicalFieldValue(fieldKey, fieldValue);
                            const baseOptions = parseConfigDropdownOptions(field);
                            const options = isDropdown && editableValue && !baseOptions.some((option) => option.value === editableValue)
                              ? [...baseOptions, { label: editableValue, value: editableValue }]
                              : baseOptions;

                            return (
                              <Box key={`${item.id}-${field.id}`}>
                                {isDropdown ? (
                                  <CustomSelect
                                    label={label}
                                    value={editableValue}
                                    onChange={(value) => handleMedicalFieldChange(fieldKey, value)}
                                    options={options}
                                    placeholder="Select"
                                    disabled={!isEditable}
                                  />
                                ) : (
                                  <Box>
                                    <Typography sx={{ fontSize: "14px", fontWeight: 400, color: "#444", mb: 1 }}>{label}</Typography>
                                    <CustomTextField
                                      fullWidth
                                      size="small"
                                      type={isDate ? "date" : (isNumeric ? "number" : "text")}
                                      value={editableValue}
                                      onChange={(event) => handleMedicalFieldChange(fieldKey, event.target.value)}
                                      disabled={!isEditable}
                                      placeholder={isDate ? "YYYY-MM-DD" : ""}
                                    />
                                  </Box>
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      )
                    ) : (
                      <Typography sx={{ color: "#667085", fontSize: 13 }}>
                        No details available for this test.
                      </Typography>
                    )
                  ) : (
                    <Box>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: { xs: "2fr 1fr 1fr", md: "2fr 1fr 1fr 1.25fr 1fr" },
                          gap: 1,
                          px: 1,
                          pb: 0.75,
                        }}
                      >
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#475467" }}>Parameter</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#475467" }}>Value</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#475467" }}>Unit</Typography>
                        <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: 12, fontWeight: 700, color: "#475467" }}>
                          Normal Range
                        </Typography>
                        <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: 12, fontWeight: 700, color: "#475467" }}>
                          Status
                        </Typography>
                      </Box>

                      {item.section.rows.map((row, index) => {
                        const parameterKey = `${item.id}-row-${index}-parameter`;
                        const valueKey = `${item.id}-row-${index}-value`;
                        const unitKey = `${item.id}-row-${index}-unit`;
                        const normalRangeKey = `${item.id}-row-${index}-normalRange`;
                        const statusKey = `${item.id}-row-${index}-status`;
                        const parameterValue = getMedicalFieldValue(parameterKey, row.parameter);
                        const valueValue = getMedicalFieldValue(valueKey, row.value);
                        const unitValue = getMedicalFieldValue(unitKey, row.unit);
                        const normalRangeValue = getMedicalFieldValue(normalRangeKey, row.normalRange);
                        const statusValue = getMedicalFieldValue(statusKey, row.status);
                        const statusColor = getStatusColors(statusValue);
                        const statusDotColor = getStatusDotColor(statusValue);

                        return (
                          <Box
                            key={`${item.id}-${row.parameter}-${index}`}
                            sx={{
                              display: "grid",
                              gridTemplateColumns: { xs: "2fr 1fr 1fr", md: "2fr 1fr 1fr 1.25fr 1fr" },
                              gap: 1,
                              alignItems: "center",
                              px: 1,
                              py: 1,
                              borderTop: "1px solid #F2F4F7",
                              backgroundColor: index % 2 === 0 ? "#FCFCFD" : "#FFFFFF",
                            }}
                          >
                            {isEditable ? (
                              <CustomTextField fullWidth size="small" value={parameterValue} onChange={(event) => handleMedicalFieldChange(parameterKey, event.target.value)} />
                            ) : (
                              <Typography sx={{ fontSize: 13, color: "#344054" }}>{parameterValue || "-"}</Typography>
                            )}
                            {isEditable ? (
                              <CustomTextField fullWidth size="small" value={valueValue} onChange={(event) => handleMedicalFieldChange(valueKey, event.target.value)} />
                            ) : (
                              <Typography sx={{ fontSize: 13, color: "#101828", fontWeight: 600 }}>{valueValue || "-"}</Typography>
                            )}
                            {isEditable ? (
                              <CustomTextField fullWidth size="small" value={unitValue} onChange={(event) => handleMedicalFieldChange(unitKey, event.target.value)} />
                            ) : (
                              <Typography sx={{ fontSize: 13, color: "#344054" }}>{unitValue || "-"}</Typography>
                            )}
                            {isEditable ? (
                              <CustomTextField
                                fullWidth
                                size="small"
                                value={normalRangeValue}
                                onChange={(event) => handleMedicalFieldChange(normalRangeKey, event.target.value)}
                                sx={{ display: { xs: "none", md: "block" } }}
                              />
                            ) : (
                              <Typography sx={{ display: { xs: "none", md: "block" }, fontSize: 13, color: "#344054" }}>
                                {normalRangeValue || "-"}
                              </Typography>
                            )}
                            <Box sx={{ display: { xs: "none", md: "flex" } }}>
                              {isEditable ? (
                                <CustomTextField fullWidth size="small" value={statusValue} onChange={(event) => handleMedicalFieldChange(statusKey, event.target.value)} />
                              ) : (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                  <Box
                                    component="span"
                                    sx={{
                                      width: 8,
                                      height: 8,
                                      borderRadius: "50%",
                                      bgcolor: statusDotColor,
                                      flexShrink: 0,
                                    }}
                                  />
                                  <Box
                                    component="span"
                                    sx={{
                                      px: 1,
                                      py: 0.25,
                                      borderRadius: "999px",
                                      fontSize: 12,
                                      fontWeight: 600,
                                      color: statusColor.text,
                                      backgroundColor: statusColor.bg,
                                      textTransform: "capitalize",
                                    }}
                                  >
                                    {statusValue || "-"}
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 2, p: 2, border: "1px solid #E4E7EC", borderRadius: 1.5, backgroundColor: "#FFFFFF" }}>
        <FormControlLabel
          control={(
            <Checkbox
              checked={doNotPayForTpa}
              onChange={(event) => setDoNotPayForTpa(event.target.checked)}
              sx={{ color: "#9A2529", "&.Mui-checked": { color: "#9A2529" } }}
            />
          )}
          label="Do not pay for TPA"
        />

        {(submitMessage || submitError) && (
          <Typography sx={{ mt: 1, color: submitError ? "#DE2C3B" : "#067647", fontSize: 13 }}>
            {submitError ?? submitMessage}
          </Typography>
        )}

        <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
          <CustomButton variant="outlined" onClick={handleDisagree} disabled={submitLoading} sx={{ minWidth: 120 }}>
            Disagree
          </CustomButton>
          <CustomButton onClick={handleAgree} disabled={submitLoading || !safeApplicationId} sx={{ minWidth: 120 }}>
            Agree
          </CustomButton>
        </Box>
      </Box>
    </Container>
  );
};

export default ViewMedicals;
