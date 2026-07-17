import { Box, Container, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../../components/layout/BackButton";
// import Badge from "../../../components/ui/Badge/Badge";
import CustomButton from "../../../components/ui/Button/Button";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTabs from "../../../components/ui/Tabs/Tabs";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { useAppContext } from "../../../hooks/useAppContext";
// import { BriefcaseIcon, PhoneIcon, SmsIcon, WalletIcon } from "../../../icons/Icons";
import { getDRSPath, getFinancialPath, getMedicalPath } from "../../../routes/routes";
import { apiRequest } from "../../../services/api";
import { url } from "../../../services/apiConfig";
import type { ApiKey } from "../../../services/apiConfig";
import { useAppDispatch } from "../../../store/hooks";
import type { RootState } from "../../../store/store";
import { financialThunk } from "../../../store/thunks/financialThunk";
import type { ApplicantTab, DRSRequest, FinancialResponse } from "../../../types/drs.types";
import { applicantTabs } from "../../../utils/constant";
// import { formatCurrencyINR } from "../../../utils/helpers";
import BreDecision from "../DRS_Accordions/BreDecision";
// import ApplicantProfile from "../DRS_Accordions/ApplicantProfile/ApplicantProfile";
import FormalMemberProfile from "../DRS_Accordions/ApplicantProfile/FormalMemberProfile";
import { buildFormalMemberProfile, isFormalTaskRole } from "../formalProfileHelpers";
import {
  financialSections,
  type FinancialField,
  type FinancialSectionConfig,
  type FinancialSectionKey,
} from "./financialAccordionConfig";
import ApplicantProfile from "../DRS_Accordions/ApplicantProfile/ApplicantProfile";

const getRoleType = () => localStorage.getItem("roleType") ?? "";
const getStoredApplicantTab = () =>
  (localStorage.getItem("drsSelectedApplicantTab") as ApplicantTab | null) ?? "proposer";

type DRSViewTab = "medical" | "financial";

const drsViewTabs: { key: DRSViewTab; label: string }[] = [
  { key: "medical", label: "View Medical" },
  { key: "financial", label: "View Financial" },
];

const buildInitialFieldValues = () => {
  return financialSections.reduce<Record<FinancialSectionKey, Record<string, string>>>(
    (accumulator, section) => {
      accumulator[section.key] = section.items.reduce<Record<string, string>>((itemAccumulator, item) => {
        itemAccumulator[item.label] = item.value == null ? "" : String(item.value);
        return itemAccumulator;
      }, {});

      return accumulator;
    },
    {} as Record<FinancialSectionKey, Record<string, string>>
  );
};

// const getMemberSummary = (member?: MedicalSummaryMember) => {
//   if (!member) {
//     return undefined;
//   }

//   if (member.memberType === "proposer") {
//     return member.proposerSummary;
//   }

//   if (member.memberType === "lifeassured1") {
//     return member.lifeassured1Summary;
//   }

//   if (member.memberType === "lifeassured2") {
//     return member.lifeassured2Summary;
//   }

//   return undefined;
// };

// const getApplicantHeaderData = (summary?: MedicalSummaryMember) => {
//   const memberSummary = getMemberSummary(summary);

//   return {
//     name:
//       [memberSummary?.firstName, memberSummary?.middleName, memberSummary?.lastName]
//         .filter(Boolean)
//         .join(" ") || "-",
//     dob: memberSummary?.dob ?? "-",
//     age: memberSummary?.age ?? "-",
//     gender: memberSummary?.gender ?? "-",
//     profileImage: memberSummary?.profileImage ?? "",
//     occupation: memberSummary?.occupation ?? "-",
//     annualIncome: memberSummary?.annualIncome,
//     email: memberSummary?.email ?? "-",
//     mobile: memberSummary?.mobile ?? "-",
//   };
// };

const readOnlyBoxSx = {
  minHeight: 38,
  px: 1.25,
  py: 0.95,
  borderRadius: "8px",
  backgroundColor: "#EFF1F3",
  border: "1px solid #E4E7EC",
  color: "#344054",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
};

const getFieldValue = (
  values: Record<FinancialSectionKey, Record<string, string>>,
  section: FinancialSectionKey,
  label: string,
  fallback?: string | number | boolean
) => {
  const value = values[section]?.[label];
  if (value != null && value !== "") {
    return value;
  }

  if (fallback == null || fallback === "") {
    return "NA";
  }

  return String(fallback);
};

const FORM_16_TABLE_LABELS = [
  "ASSESSMENT",
  "Gross Salary PA",
  "Average Annual Income",
  "Life Assured Pan No",
  "Life Assured Name",
];

const FORM_16_BOTTOM_LABELS = [
  "Is Life Assured Name Same With Doc Name?",
  "Company Name",
];

type SubmitResponse = {
  success?: boolean;
  message?: string;
};

const renderFieldValue = (
  value: string,
  isEditable: boolean,
  onChange: (value: string) => void,
) => {
  if (isEditable) {
    return <CustomTextField fullWidth size="small" value={value} onChange={(event) => onChange(event.target.value)} />;
  }

  return <Box sx={readOnlyBoxSx}>{value}</Box>;
};

const renderForm16Section = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ borderRadius: 1.5, border: "1px solid #D0D5DD", overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1, backgroundColor: "#0B4D80", color: "#FFFFFF", fontSize: 16, fontWeight: 700 }}>
          Form 16
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1.5fr 1fr 1fr 1fr", md: "1.2fr 1fr 1fr 1fr" },
            borderTop: "1px solid #D0D5DD",
            backgroundColor: "#F3F4F6",
          }}
        >
          <Typography sx={{ px: 1.5, py: 0.8, fontSize: 12, color: "#475467" }} />
          <Typography sx={{ px: 1.5, py: 0.8, fontSize: 12, color: "#475467" }}>Year 1</Typography>
          <Typography sx={{ px: 1.5, py: 0.8, fontSize: 12, color: "#475467" }}>Year 2</Typography>
          <Typography sx={{ px: 1.5, py: 0.8, fontSize: 12, color: "#475467" }}>Year 3</Typography>
        </Box>

        {FORM_16_TABLE_LABELS.map((label, index) => {
          const item = byLabel[label.toLowerCase()];
          const value = getFieldValue(values, section.key, item?.label ?? label, item?.value);
          const year2Label = `${label} Year 2`;
          const year3Label = `${label} Year 3`;
          const year2Value = getFieldValue(values, section.key, year2Label, "NA");
          const year3Value = getFieldValue(values, section.key, year3Label, "NA");

          return (
            <Box
              key={label}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1.5fr 1fr 1fr 1fr", md: "1.2fr 1fr 1fr 1fr" },
                borderTop: index === 0 ? "1px solid #D0D5DD" : "1px solid #E4E7EC",
                backgroundColor: "#FFFFFF",
              }}
            >
              <Typography sx={{ px: 1.5, py: 0.8, fontSize: 13, color: "#475467" }}>{label}</Typography>
              <Box sx={{ px: 1.5, py: 0.8 }}>
                {renderFieldValue(value, isEditable, (nextValue) => onFieldValueChange(section.key, item?.label ?? label, nextValue))}
              </Box>
              <Box sx={{ px: 1.5, py: 0.8 }}>
                {renderFieldValue(year2Value, isEditable, (nextValue) => onFieldValueChange(section.key, year2Label, nextValue))}
              </Box>
              <Box sx={{ px: 1.5, py: 0.8 }}>
                {renderFieldValue(year3Value, isEditable, (nextValue) => onFieldValueChange(section.key, year3Label, nextValue))}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ p: 1.5, borderRadius: 1.25, backgroundColor: "#F3F4F6", border: "1px solid #EAECF0" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 1.25 }}>
          {FORM_16_BOTTOM_LABELS.map((label) => {
            const item = byLabel[label.toLowerCase()];
            const value = getFieldValue(values, section.key, item?.label ?? label, item?.value);

            return (
              <Box key={label}>
                <Typography sx={{ fontSize: 12, color: "#475467", mb: 0.5 }}>{label}</Typography>
                {renderFieldValue(value, isEditable, (nextValue) => onFieldValueChange(section.key, item?.label ?? label, nextValue))}
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

const renderStandardSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: `repeat(${section.columns ?? 3}, minmax(0, 1fr))`,
        },
        gap: 1.25,
      }}
    >
      {section.items.map((item) => {
        const value = getFieldValue(values, section.key, item.label, item.value);

        return (
          <Box key={`${section.key}-${item.label}`}>
            <Typography sx={{ fontSize: 12, color: "#475467", mb: 0.5 }}>{item.label}</Typography>
            {renderFieldValue(value, isEditable, (nextValue) => onFieldValueChange(section.key, item.label, nextValue))}
          </Box>
        );
      })}
    </Box>
  );
};

const ViewFinancial = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { businessType, applicationNumber } = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);

  const requestedApplicantTab =
    ((location.state as { selectedApplicantTab?: ApplicantTab } | null)?.selectedApplicantTab) ??
    getStoredApplicantTab();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<FinancialResponse | null>(null);
  const [activeApplicantTab, setActiveApplicantTab] = useState<ApplicantTab>(requestedApplicantTab);
  const [financialFieldValues, setFinancialFieldValues] = useState<Record<FinancialSectionKey, Record<string, string>>>(
    buildInitialFieldValues
  );
  const [activeSectionId, setActiveSectionId] = useState<string>(financialSections[0]?.key ?? "");
  const [isEditable, setIsEditable] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const safeBusinessType = businessType ?? "retail";
  const safeApplicationId = applicationNumber ?? "";
  const roleType = getRoleType();
  const isCptPool = roleType === "CPT Pool";
  const isFormalRole = isFormalTaskRole(roleType);
  const formalMemberProfile = useMemo(() => buildFormalMemberProfile(drsData), [drsData]);

  useEffect(() => {
    if (isCptPool) {
      return;
    }

    const payload: DRSRequest = {
      applicationId: safeApplicationId,
      roleType,
    };

    const fetchFinancial = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dispatch(financialThunk(payload)).unwrap();
        setFinancialData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch financial details.");
      } finally {
        setLoading(false);
      }
    };

    void fetchFinancial();
  }, [dispatch, isCptPool, roleType, safeApplicationId]);

  const availableMemberTypes = useMemo(
    () => financialData?.summary?.map((item) => item.memberType) ?? [],
    [financialData]
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

  // const selectedApplicantSummary = useMemo(() => {
  //   const preferred = financialData?.summary?.find((item) => item.memberType === currentApplicantTab);
  //   if (preferred) {
  //     return preferred;
  //   }

  //   if (visibleTabs[0]) {
  //     return financialData?.summary?.find((item) => item.memberType === visibleTabs[0].key);
  //   }

  //   return financialData?.summary?.[0];
  // }, [currentApplicantTab, financialData, visibleTabs]);

  // const applicantData = isFormalRole
  //   ? getFormalHeaderData(formalMemberProfile)
  //   : getApplicantHeaderData(selectedApplicantSummary);

  // const applicantInfoItems = useMemo(
  //   () => [
  //     { label: "Occupation", value: applicantData.occupation, icon: <BriefcaseIcon width={16} height={16} /> },
  //     {
  //       label: "Annual Income",
  //       value: formatCurrencyINR(applicantData.annualIncome),
  //       icon: <WalletIcon width={16} height={16} />,
  //     },
  //     { label: "Email", value: applicantData.email, icon: <SmsIcon width={16} height={16} /> },
  //     { label: "Mobile", value: applicantData.mobile, icon: <PhoneIcon width={16} height={16} /> },
  //   ],
  //   [applicantData.annualIncome, applicantData.email, applicantData.mobile, applicantData.occupation]
  // );

  const resolvedActiveSectionId = useMemo(
    () =>
      financialSections.some((section) => section.key === activeSectionId)
        ? activeSectionId
        : (financialSections[0]?.key ?? ""),
    [activeSectionId]
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
      `[data-financial-menu-id="${resolvedActiveSectionId}"]`
    ) as HTMLElement | null;

    if (!activeMenuItem) {
      return;
    }

    const containerRect = menuContainer.getBoundingClientRect();
    const itemRect = activeMenuItem.getBoundingClientRect();
    const padding = 8;

    if (itemRect.top < containerRect.top + padding) {
      const delta = itemRect.top - containerRect.top - padding;
      menuContainer.scrollTo({
        top: menuContainer.scrollTop + delta,
        behavior: "smooth",
      });
      return;
    }

    if (itemRect.bottom > containerRect.bottom - padding) {
      const delta = itemRect.bottom - containerRect.bottom + padding;
      menuContainer.scrollTo({
        top: menuContainer.scrollTop + delta,
        behavior: "smooth",
      });
    }
  }, [resolvedActiveSectionId]);

  useEffect(() => {
    if (loading || financialSections.length === 0) {
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

        const nextActiveSection = visibleEntries[0].target.getAttribute("data-financial-section");
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

    financialSections.forEach((section) => {
      const sectionNode = sectionRefs.current[section.key];
      if (sectionNode) {
        observer.observe(sectionNode);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [loading, currentApplicantTab]);

  const handleSectionMenuClick = (sectionId: string) => {
    setActiveSectionId(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDRSViewTabChange = (value: DRSViewTab) => {
    if (!safeApplicationId) {
      return;
    }

    if (value === "medical") {
      navigate(getMedicalPath(safeBusinessType, safeApplicationId), {
        state: { selectedApplicantTab: currentApplicantTab },
      });
      return;
    }

    navigate(getFinancialPath(safeBusinessType, safeApplicationId), {
      state: { selectedApplicantTab: currentApplicantTab },
    });
  };

  const handleFieldValueChange = (sectionKey: FinancialSectionKey, label: string, value: string) => {
    setFinancialFieldValues((currentValues) => ({
      ...currentValues,
      [sectionKey]: {
        ...currentValues[sectionKey],
        [label]: value,
      },
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
        url: url("financialSubmit" as ApiKey),
        method: "POST",
        body: {
          applicationId: safeApplicationId,
          roleType,
          applicantTab: currentApplicantTab,
          agreed: true,
          fields: financialFieldValues,
        },
      });

      setSubmitMessage(response.message ?? "Financial details submitted successfully.");
      setIsEditable(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to submit financial details.");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (isCptPool) {
    return (
      <Container disableGutters>
        <BackButton label="Back to DRS" onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationId))} />
        <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
          View Financial Details is not available for CPT Pool.
        </Typography>
      </Container>
    );
  }

  return (
    <Container disableGutters sx={{ pb: 4 }}>
      <BackButton label="Back to DRS" onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationId))} />

      <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
        <CustomTabs
          tabs={drsViewTabs}
          value="financial"
          onChange={(value: DRSViewTab) => handleDRSViewTabChange(value)}
        />
      </Box>

      {/*
      <BreDecision
        extraFields={financialData?.breAdditionalFields ?? []}
        breDecisionOverride={financialData?.breDecision ?? null}
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
            //       <Box
            //         sx={{
            //           display: "flex",
            //           justifyContent: "space-between",
            //           alignItems: "flex-start",
            //           gap: 2,
            //           flexWrap: "wrap",
            //         }}
            //       >
            //         <Box>
            //           <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#1E293B", lineHeight: 1.15 }}>
            //             {applicantData.name}
            //           </Typography>
            //           <Typography sx={{ fontSize: 14, color: "#4B5563", mt: 0.5 }}>DOB: {applicantData.dob}</Typography>
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
            //               <Typography
            //                 sx={{
            //                   fontSize: 18,
            //                   fontWeight: 600,
            //                   color: "#111827",
            //                   lineHeight: 1.3,
            //                   wordBreak: "break-word",
            //                 }}
            //               >
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

      {loading && <Typography sx={{ color: "#6B7280", mb: 2 }}>Loading financial details...</Typography>}
      {error && <Typography sx={{ color: "#DE2C3B", mb: 2 }}>{error}</Typography>}

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
          {financialSections.map((section) => {
            const isActive = section.key === resolvedActiveSectionId;

            return (
              <Box
                key={section.key}
                data-financial-menu-id={section.key}
                role="button"
                tabIndex={0}
                onClick={() => handleSectionMenuClick(section.key)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    handleSectionMenuClick(section.key);
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
                  {section.title}
                </Typography>
                <Typography sx={{ fontSize: 14, color: "inherit", lineHeight: 1 }}>
                  {"\u203A"}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <Box sx={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", gap: 2 }}>
          {financialSections.map((section) => (
            <Box
              key={section.key}
              data-financial-section={section.key}
              ref={(node) => {
                sectionRefs.current[section.key] = node as HTMLDivElement | null;
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
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1F2937" }}>{section.title}</Typography>
              </Box>

              <Box sx={{ p: { xs: 1.25, md: 1.5 } }}>
                {section.key === "form16"
                  ? renderForm16Section(section, financialFieldValues, isEditable, handleFieldValueChange)
                  : renderStandardSection(section, financialFieldValues, isEditable, handleFieldValueChange)}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 2, p: 2, border: "1px solid #E4E7EC", borderRadius: 1.5, backgroundColor: "#FFFFFF" }}>
        {(submitMessage || submitError) && (
          <Typography sx={{ mb: 1.5, color: submitError ? "#DE2C3B" : "#067647", fontSize: 13 }}>
            {submitError ?? submitMessage}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
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

export default ViewFinancial;
