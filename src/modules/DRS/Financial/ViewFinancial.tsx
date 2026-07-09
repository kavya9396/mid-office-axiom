import { Box, Container, Divider, Stack, Typography } from "@mui/material"
import BackButton from "../../../components/layout/BackButton"
import { getDRSPath } from "../../../routes/routes"
import { useAppContext } from "../../../hooks/useAppContext"
import { useLocation, useNavigate } from "react-router-dom"
import { BriefcaseIcon, PhoneIcon, SmsIcon, WalletIcon } from "../../../icons/Icons"
import { useEffect, useMemo, useState } from "react"
import type { ApplicantTab, DRSRequest, FinancialResponse, MedicalSummaryMember } from "../../../types/drs.types"
import { useAppDispatch } from "../../../store/hooks"
import { financialThunk } from "../../../store/thunks/financialThunk"
import BreDecision from "../DRS_Accordions/BreDecision"
import CustomTabs from "../../../components/ui/Tabs/Tabs"
import { applicantTabs } from "../../../utils/constant"
import CustomAccordion from "../../../components/ui/Accordion/Accordion"
import CustomButton from "../../../components/ui/Button/Button"
import Badge from "../../../components/ui/Badge/Badge"
import { formatCurrencyINR } from "../../../utils/helpers"
import CustomSelect from "../../../components/ui/Select/Select"
import CustomTextField from "../../../components/ui/TextField/TextField"
import { financialSectionOptions, financialSections, type FinancialSectionKey } from "./financialAccordionConfig"
import { fieldStylesEdit } from "../../../utils/styles"
import { getRoleAccess } from "../../../utils/roleAccess"

const getRoleType = () => localStorage.getItem("roleType") ?? "";
const getStoredApplicantTab = () => (localStorage.getItem("drsSelectedApplicantTab") as ApplicantTab | null) ?? "proposer";

const buildInitialFieldValues = () => {
  return financialSections.reduce<Record<FinancialSectionKey, Record<string, string>>>((accumulator, section) => {
    accumulator[section.key] = section.items.reduce<Record<string, string>>((itemAccumulator, item) => {
      itemAccumulator[item.label] = item.value == null ? "" : String(item.value);
      return itemAccumulator;
    }, {});

    return accumulator;
  }, {} as Record<FinancialSectionKey, Record<string, string>>);
};

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

const ViewFinancial = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const requestedApplicantTab = ((location.state as { selectedApplicantTab?: ApplicantTab } | null)?.selectedApplicantTab) ??
    getStoredApplicantTab();

  const [activeSection, setActiveSection] = useState<FinancialSectionKey>(financialSections[0]?.key ?? "advanceTaxChallan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<FinancialResponse | null>(null);
  const [activeApplicantTab, setActiveApplicantTab] = useState<ApplicantTab>(requestedApplicantTab);
  const [financialFieldValues, setFinancialFieldValues] = useState<Record<FinancialSectionKey, Record<string, string>>>(buildInitialFieldValues);
  const [formErrors, setFormErrors] = useState<Record<FinancialSectionKey, Record<string, string>>>(() => ({} as Record<FinancialSectionKey, Record<string, string>>));
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const { businessType, applicationNumber } = useAppContext();

  const safeBusinessType = businessType ?? "retail";
  const safeApplicationId = applicationNumber ?? "";
  const roleType = getRoleType();
  const isCptPool = roleType === "CPT Pool";
  const { canEditFinancial } = getRoleAccess(roleType);

  
  
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
  
  const selectedApplicantSummary = useMemo(() => {
    const preferred = financialData?.summary?.find((item) => item.memberType === currentApplicantTab);
    if (preferred) {
      return preferred;
    }
    
    if (visibleTabs[0]) {
      return financialData?.summary?.find((item) => item.memberType === visibleTabs[0].key);
    }
    
    return financialData?.summary?.[0];
  }, [currentApplicantTab, financialData, visibleTabs]);
  
  const applicantData = getApplicantHeaderData(selectedApplicantSummary);
  const selectedFinancialSection = financialSections.find((section) => section.key === activeSection) ?? financialSections[0];

  const handleFieldChange = (sectionKey: FinancialSectionKey, label: string, value: string) => {
    if (!canEditFinancial) {
      return;
    }

    setSubmitMessage(null);
    setFinancialFieldValues((current) => ({
      ...current,
      [sectionKey]: {
        ...current[sectionKey],
        [label]: value,
      },
    }));

    setFormErrors((current) => {
      const sectionErrors = current[sectionKey];
      if (!sectionErrors?.[label]) {
        return current;
      }

      const nextSectionErrors = { ...sectionErrors };
      delete nextSectionErrors[label];

      return {
        ...current,
        [sectionKey]: nextSectionErrors,
      };
    });
  };

  const validateActiveSection = () => {
    const activeValues = financialFieldValues[selectedFinancialSection.key] ?? {};
    const nextErrors = selectedFinancialSection.items.reduce<Record<string, string>>((accumulator, item) => {
      if (!(activeValues[item.label] ?? "").trim()) {
        accumulator[item.label] = "This field is required.";
      }
      return accumulator;
    }, {});

    setFormErrors((current) => ({
      ...current,
      [selectedFinancialSection.key]: nextErrors,
    }));

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!safeApplicationId) {
      setSubmitMessage("Application ID is missing.");
      return;
    }

    if (!validateActiveSection()) {
      // setSubmitMessage("Please resolve the highlighted financial fields.");
      return;
    }

    setSubmitMessage("Financial details validated successfully.");
  };
  

    const applicantInfoItems = useMemo(
      () => [
        { label: "Occupation", value: applicantData.occupation, icon: <BriefcaseIcon width={16} height={16} /> },
        {
          label: "Annual Income",
          value: formatCurrencyINR(applicantData.annualIncome),
          icon: <WalletIcon width={16} height={16} />,
        },
        { label: "Email", value: applicantData.email, icon: <SmsIcon width={16} height={16} /> },
        { label: "Mobile", value: applicantData.mobile, icon: <PhoneIcon width={16} height={16} /> },
      ],
      [applicantData.annualIncome, applicantData.email, applicantData.mobile, applicantData.occupation]
    );
  

  useEffect(() => {
    if (isCptPool) {
      return;
    }

    // if (isApplicationIdMissing) {
    //   return;
    // }

    const payload: DRSRequest = {
      applicationId: safeApplicationId,
      roleType,
    };

    const fetchMedicals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dispatch(financialThunk(payload)).unwrap();
        setFinancialData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch medical details.");
      } finally {
        setLoading(false);
      }
    };

    void fetchMedicals();
  }, [dispatch, isCptPool, roleType, safeApplicationId]);

  if (isCptPool) {
    return (
      <Container disableGutters>
        <BackButton
          label="Back to DRS"
          onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationId))}
        />
        <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
          View Financial Details is not available for CPT Pool.
        </Typography>
      </Container>
    );
  }

  return (
    <Container disableGutters>
      <BackButton
        label="Back to DRS"
        onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationId))}
      />
      <Container disableGutters>


        <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center", width: "100%" }}>
          <CustomTabs
            tabs={visibleTabs}
            value={currentApplicantTab}
            onChange={(value) => {
              setActiveApplicantTab(value);
              localStorage.setItem("drsSelectedApplicantTab", value);
            }}
          />
        </Box>


   <Box sx={{ position: "sticky", top: 12, zIndex: 10, mb: 1 }}>
        <CustomAccordion title="Applicant Profile" defaultExpanded detailPadding={0}>
          <Box sx={{ px: { xs: 2, md: 3 }, py: 2.25, backgroundColor: "#EBF1F5" }}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: "50%",
                  backgroundColor: "#EBF1F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0,
                }}
              >
                {applicantData.profileImage && (
                  <Box
                    component="img"
                    src={applicantData.profileImage}
                    alt={`${applicantData.name}'s photo`}
                    sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                )}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                  <Box>
                    <Typography sx={{ fontSize: 28, fontWeight: 700, color: "#1E293B", lineHeight: 1.15 }}>
                      {applicantData.name}
                    </Typography>
                    <Typography sx={{ fontSize: 14, color: "#4B5563", mt: 0.5 }}>
                      DOB: {applicantData.dob}
                    </Typography>
                  </Box>

                  <Badge label={`${applicantData.gender}, ${applicantData.age} Years`} variant="Neutral" size="medium" />
                </Box>

                <Divider sx={{ my: 1.25, borderColor: "#B7C1CB" }} />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
                    gap: { xs: 1.25, md: 2 },
                  }}
                >
                  {applicantInfoItems.map((item) => (
                    <Box key={item.label} sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, minWidth: 0 }}>
                      <Box sx={{ color: "#1E5A8B", mt: 0.2, display: "inline-flex" }}>{item.icon}</Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: 12, color: "#475569", lineHeight: 1.2 }}>{item.label}</Typography>
                        <Typography sx={{ fontSize: 18, fontWeight: 600, color: "#111827", lineHeight: 1.3, wordBreak: "break-word" }}>
                          {item.value || "-"}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>
        </CustomAccordion>
      </Box>

      {loading && (
        <Typography sx={{ color: "#6B7280", mb: 2 }}>
          Loading financial details...
        </Typography>
      )}

      {error && (
        <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
          {error}
        </Typography>
      )}


        <BreDecision
          extraFields={financialData?.breAdditionalFields ?? []}
          breDecisionOverride={financialData?.breDecision ?? null}
        />

        <Box sx={{ mt: 2, width: "100%" }}>
          <Box sx={{ display: "flex", width: "100%" }}>
            <Box sx={{ width: "100%", maxWidth: 400 }}>
              <CustomSelect
                label="Select financial section"
                value={activeSection}
                options={financialSectionOptions.map((item) => ({ label: item.label, value: item.key }))}
                onChange={(value) => setActiveSection(value as FinancialSectionKey)}
              />
            </Box>
          </Box>

          <Stack spacing={2} sx={{ my: 2 }}>
            {selectedFinancialSection && (
              <CustomAccordion
                title={selectedFinancialSection.title}
                // expanded
                defaultExpanded
                onChange={(expanded) => {
                  if (!expanded) {
                    return;
                  }
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: "#f6f6f6",
                    borderRadius: "12px",
                  }}
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        md: `repeat(${selectedFinancialSection.columns ?? 3}, minmax(0, 1fr))`,
                      },
                      gap: 2,
                    }}
                  >
                    {selectedFinancialSection.items.map((item) => (
                      <Box key={`${selectedFinancialSection.key}-${item.label}`}>
                        <Typography sx={{ color: "#444", fontSize: 14, fontWeight: 400, mb: 0.75 }}>
                          {item.label}
                        </Typography>
                        <CustomTextField
                          fullWidth
                          value={financialFieldValues[selectedFinancialSection.key]?.[item.label] ?? ""}
                          onChange={(event) => handleFieldChange(selectedFinancialSection.key, item.label, event.target.value)}
                          disabled={!canEditFinancial}
                          error={Boolean(formErrors[selectedFinancialSection.key]?.[item.label])}
                          helperText={formErrors[selectedFinancialSection.key]?.[item.label] || " "}
                          sx={{...fieldStylesEdit}}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CustomAccordion>
            )}

            {submitMessage && (
              <Typography sx={{ color: submitMessage.toLowerCase().includes("highlighted") ? "#DE2C3B" : "#0F8A3D" }}>
                {submitMessage}
              </Typography>
            )}

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <CustomButton onClick={handleSubmit} sx={{ minWidth: 180, borderRadius: "999px" }}>
                Submit Financial
              </CustomButton>
            </Box>
          </Stack>
        </Box>
      </Container>

    </Container>
  )
}

export default ViewFinancial