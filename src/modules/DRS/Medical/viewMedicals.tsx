import { Box, Container, Divider, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../../components/layout/BackButton";
import Badge from "../../../components/ui/Badge/Badge";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTabs from "../../../components/ui/Tabs/Tabs";
import { useAppContext } from "../../../hooks/useAppContext";
import { BriefcaseIcon, PhoneIcon, SmsIcon, WalletIcon } from "../../../icons/Icons";
import { getDRSPath } from "../../../routes/routes";
import { useAppDispatch } from "../../../store/hooks";
import { medicalThunk } from "../../../store/thunks/medicalThunk";
import type { ApplicantTab, DRSRequest, MedicalResponse, MedicalSummaryMember } from "../../../types/drs.types";
import { applicantTabs } from "../../../utils/constant";
import { getRoleAccess } from "../../../utils/roleAccess";
import BreDecision from "../DRS_Accordions/BreDecision";
import MerForm from "./MerForm";
import OtherMedicalsForm from "./OtherMedicalsForm";
import SpecialMedicalForm from "./SpecialMedicalForm.tsx";

const getRoleType = () => localStorage.getItem("roleType") ?? "";
const getStoredApplicantTab = () => (localStorage.getItem("drsSelectedApplicantTab") as ApplicantTab | null) ?? "proposer";

type MedicalSectionTab = "mer" | "specialMedical" | "otherMedicals";

const medicalSectionTabs: { key: MedicalSectionTab; label: string }[] = [
  { key: "mer", label: "MER" },
  { key: "specialMedical", label: "Special Medical" },
  { key: "otherMedicals", label: "Other Medicals" },
];

const formatCurrencyINR = (value?: number | string) => {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return String(value);
  }

  return numericValue.toLocaleString("en-IN");
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

const ViewMedicals = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { businessType, applicationNumber } = useAppContext();
  const requestedApplicantTab =
    ((location.state as { selectedApplicantTab?: ApplicantTab } | null)?.selectedApplicantTab) ??
    getStoredApplicantTab();

  const [medicalData, setMedicalData] = useState<MedicalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeApplicantTab, setActiveApplicantTab] = useState<ApplicantTab>(requestedApplicantTab);
  const [activeMedicalSectionTab, setActiveMedicalSectionTab] = useState<MedicalSectionTab>("specialMedical");

  const roleType = getRoleType();
  const { canEditMedical } = getRoleAccess(roleType);
  const safeBusinessType = businessType ?? "retail";
  const safeApplicationId = applicationNumber ?? "";
  const isApplicationIdMissing = !safeApplicationId;

  useEffect(() => {
    if (isApplicationIdMissing) {
      return;
    }

    const payload: DRSRequest = {
      applicationId: safeApplicationId,
      roleType,
    };

    const fetchMedicals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await dispatch(medicalThunk(payload)).unwrap();
        setMedicalData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch medical details.");
      } finally {
        setLoading(false);
      }
    };

    void fetchMedicals();
  }, [dispatch, isApplicationIdMissing, roleType, safeApplicationId]);

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

  const applicantData = getApplicantHeaderData(selectedApplicantSummary);

  const applicantInfoItems = useMemo(
    () => [
      { label: "Occupation", value: applicantData.occupation, icon: <BriefcaseIcon width={16} height={16} /> },
      { label: "Annual Income", value: `₹ ${formatCurrencyINR(applicantData.annualIncome)}`, icon: <WalletIcon width={16} height={16} /> },
      { label: "Email", value: applicantData.email, icon: <SmsIcon width={16} height={16} /> },
      { label: "Mobile", value: applicantData.mobile, icon: <PhoneIcon width={16} height={16} /> },
    ],
    [applicantData.annualIncome, applicantData.email, applicantData.mobile, applicantData.occupation]
  );

  return (
    <Container disableGutters sx={{ pb: 4 }}>
      <BackButton
        label="Back to DRS"
        onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationId))}
      />

      {isApplicationIdMissing && (
        <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
          Application ID is missing.
        </Typography>
      )}

      {error && (
        <Typography sx={{ color: "#DE2C3B", mb: 2 }}>{error}</Typography>
      )}

      <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
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

      <BreDecision
        extraFields={medicalData?.breAdditionalFields ?? []}
        breDecisionOverride={medicalData?.breDecision ?? null}
      />

      <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
        <CustomTabs
          tabs={medicalSectionTabs}
          value={activeMedicalSectionTab}
          onChange={setActiveMedicalSectionTab}
        />
      </Box>

      {loading ? (
        <Typography sx={{ color: "#6B7280" }}>Loading medical details...</Typography>
      ) : activeMedicalSectionTab === "mer" ? (
        <MerForm applicationId={safeApplicationId} roleType={roleType} memberType={currentApplicantTab} isEditable={canEditMedical} />
      ) : activeMedicalSectionTab === "specialMedical" ? (
        <SpecialMedicalForm
          applicationId={safeApplicationId}
          roleType={roleType}
          memberType={currentApplicantTab}
          isEditable={canEditMedical}
          medicalSections={medicalData?.sections ?? []}
        />
      ) : activeMedicalSectionTab === "otherMedicals" ? (
        <OtherMedicalsForm
          applicationId={safeApplicationId}
          roleType={roleType}
          memberType={currentApplicantTab}
          medicalSections={medicalData?.sections ?? []}
          isEditable={canEditMedical}
        />
      ) : (
        <Typography sx={{ color: "#6B7280", mt: 1 }}>
          No test details configured for {medicalSectionTabs.find((tab) => tab.key === activeMedicalSectionTab)?.label}.
        </Typography>
      )}
    </Container>
  );
};

export default ViewMedicals;
