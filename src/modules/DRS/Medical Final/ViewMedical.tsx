import { Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../../components/layout/BackButton";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomButton from "../../../components/ui/Button/Button";
import CustomTabs from "../../../components/ui/Tabs/Tabs";
import { useAppContext } from "../../../hooks/useAppContext";
import { getDRSPath, getFinancialPath, getMedicalPath } from "../../../routes/routes";
import { apiRequest } from "../../../services/api";
import { url, type ApiKey } from "../../../services/apiConfig";
import { useAppDispatch } from "../../../store/hooks";
import { setBreExternalApiOutputs } from "../../../store/slices/drsSlice";
import type { RootState } from "../../../store/store";
import { breRetriggerThunk } from "../../../store/thunks/breRetriggerThunk";
import { drsThunk } from "../../../store/thunks/drsThunk";
import type { ApplicantTab } from "../../../types/drs.types";
import { applicantTabs } from "../../../utils/constant";
// import BreDecision from "../DRS_Accordions/BreDecision_";
import ApplicantProfile from "../DRS_Accordions/ApplicantProfile/ApplicantProfile";
import FormalMemberProfile from "../DRS_Accordions/ApplicantProfile/FormalMemberProfile";
import { buildFormalMemberProfile, isFormalTaskRole } from "../formalProfileHelpers";
import MerForm, { type MerFormHandle } from "./MER/MerForm";
import { getMerConfig } from "./MER/merConfig";
import OtherMedicalsForm, { type OtherMedicalsFormHandle } from "./Other Medicals/OtherMedicalsForm";
import { CBC_TABLE_ROWS, getOtherMedicalsConfig, LFT_TABLE_ROWS, LIPIDS_TABLE_ROWS, OGTT_TABLE_ROWS, RUA_TABLE_ROWS, S13_TABLE_ROWS, SMA12_TABLE_ROWS, TFT_TABLE_ROWS } from "./Other Medicals/otherMedicalsConfig";
import SpecialMedicalForm, { type SpecialMedicalFormHandle } from "./Special Medical/SpecialMedicalForm";
import { getSpecialMedicalConfig } from "./Special Medical/specialMedicalConfig";
import { saveMerThunk, type MerSaveResponse } from "../../../store/thunks/medicalMerSaveThunk";
import { buildMerRequest } from "./MER/merPayloadMapper";
import { buildOtherMedicalRequest } from "./Other Medicals/otherMedicalsPayloadMapper";
import { saveOtherMedicalThunk } from "../../../store/thunks/medicalOtherSaveThunk";
import { buildSpecialMedicalRequest } from "./Special Medical/specialMedicalPayloadMapper";
import { saveSpecialMedicalThunk } from "../../../store/thunks/medicalSpecialSaveThunk";
import type { OtherMedicalTableData } from "./Other Medicals/otherMedicals.types";
import type { MedicalCalculatedParameter } from "./Special Medical/specialMedical.types";
import BreDecision from "../DRS_Accordions/BreDecision";

const getStoredApplicantTab = () =>
  (localStorage.getItem("drsSelectedApplicantTab") as ApplicantTab | null) ?? "proposer";
const getRoleType = () => localStorage.getItem("roleType") ?? "";
const DRS_NEW_TAB_CONTEXT_KEY = "drsNewTabContext";

type DRSViewTab = "medical" | "financial";
type MedicalSectionTab = "mer" | "specialMedical" | "otherMedicals";

const SPECIAL_MEDICAL_SECTION_MAP: Record<string, string> = {
  "2DECHO": "2decho",
  "BLOOD UREA and NITRO": "blood_urea_and_nitro",
  CXR: "cxr",
  "DOBUTAMINE STRESS ECHOCARDIOGRAM":
    "dobutamine_stress_echocardiogram",
  "EXERCISE STRESS ECHOCARDIOGRAM":
    "exercise_stress_echocardiogram",
  ECG: "ecg",
  MAMMOGRAM: "mammogram",
  "PAP SMEAR": "pap_smear",
  PFT: "pft",
  "STOOL TEST": "stool_test",
  TMT: "tmt",
  USG: "usg",
  "Fundoscopy Test": "fundoscopy_test",
};

const OTHER_MEDICAL_SECTION_MAP: Record<string, string> = {
  "Blood Sugar Random": "blood_sugar_random",
  "CBC Group": "cbc_group",
  COT: "cot",
  GHB: "ghb",
  HBA1C: "hba1c",
  HBSAG: "hbsag",
  "HIV Elisa": "hiv_elisa",
  LFT: "lft",
  LIPIDS: "lipids",
  "OGTT Group": "ogtt_group",
  PPBS: "ppbs",
  "RUA Group": "rua_group",
  "SERUM COTININE": "serum_cotinine",
  "SMA12 Group": "sma12_group",
  "TFT Group": "tft_group",
  FBS: "fbs",
  "S13 Group": "s13_group",
  "HIV Western Blot": "hiv_western_blot",
  HCV: "hcv",
  MICROALBUMINURIA: "microalbuminuria",
  PSA: "psa",
};

const normalizeMedicalParameter = (value?: string | null) =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/haemoglobin/g, "hemoglobin")
    .replace(/esinophil/g, "eosinophil")
    .replace(/[^a-z0-9]/g, "");

const findMedicalParameter = (
  parameters: MedicalFetchParameter[],
  names: string[]
) => {
  const normalizedNames = names.map(normalizeMedicalParameter);

  return parameters.find((parameter) =>
    normalizedNames.includes(
      normalizeMedicalParameter(parameter.paramName)
    )
  );
};

const toMedicalText = (value: unknown) =>
  value == null ? "" : String(value);

const getParameterDisplayValue = (
  parameter?: MedicalFetchParameter
) =>
  toMedicalText(
    parameter?.paramValue ??
    parameter?.findings ??
    parameter?.result ??
    parameter?.findingsCalculated
  );

const buildCommonMedicalValues = (
  section: MedicalTestSection
): Record<string, string> => ({
  medicalType: toMedicalText(section.medicalType),
  date: toMedicalText(section.testDate),
  testDate: toMedicalText(section.testDate),
  diagnosticCentreName: toMedicalText(section.centreName),
  diagnosticCentreAddress: toMedicalText(section.centreAddress),
  diagnosticCentrePincode: toMedicalText(section.pincode),
  doctorName: toMedicalText(section.doctorName),
  doctorRegistrationNo: toMedicalText(section.doctorRegNo),
});

const buildOtherMedicalTableData = (
  parameters: MedicalFetchParameter[],
  configuredRows: Array<{
    id: string;
    parameter: string;
  }>
) =>
  configuredRows.reduce<OtherMedicalTableData>(
    (result, row) => {
      const parameter = findMedicalParameter(parameters, [
        row.parameter,
        row.id,
      ]);

      if (!parameter) {
        return result;
      }

      result[row.id] = {
        value: toMedicalText(parameter.paramValue),
        labStart: toMedicalText(parameter.refRangeFrom),
        labEnd: toMedicalText(parameter.refRangeTo),
        unit: toMedicalText(parameter.paramUnits),
        findings: toMedicalText(
          parameter.findingsCalculated ??
          parameter.findings ??
          parameter.result
        ),
      };

      return result;
    },
    {}
  );

const OTHER_MEDICAL_TABLE_ROWS: Record<
  string,
  Array<{ id: string; parameter: string }>
> = {
  cbc_group: CBC_TABLE_ROWS,
  lft: LFT_TABLE_ROWS,
  lipids: LIPIDS_TABLE_ROWS,
  ogtt_group: OGTT_TABLE_ROWS,
  rua_group: RUA_TABLE_ROWS,
  sma12_group: SMA12_TABLE_ROWS,
  tft_group: TFT_TABLE_ROWS,
  s13_group: S13_TABLE_ROWS,
};

type MedicalSectionGroup = {
  key: MedicalSectionTab;
  label: string;
  subSections: string[];
  fields: { id: string | number; section: string; field: string }[];
};

type MedicalFetchRequest = {
  applicationNumber: string;
  partyId: string;
};

type MedicalFetchParameter = {
  applicationNumber?: string;
  partyId?: string;
  paramName?: string;
  paramValue?: string | number | null;
  paramUnits?: string | null;
  refRangeFrom?: string | null;
  refRangeTo?: string | null;
  findings?: string | null;
  ejectionFraction?: string | number | null;
  ejectionResult?: string | null;
  rejectionAbnormality?: string | null;
  remarks?: string | null;
  axis?: string | null;
  heartRate?: string | number | null;
  heartRateFindings?: string | null;
  result?: string | null;
  inspiration?: string | number | null;
  expiration?: string | number | null;
  fev1?: string | number | null;
  fvc?: string | number | null;
  rv?: string | number | null;
  rc?: string | number | null;
  mets?: string | number | null;
  findingsCalculated?: string | null;
};

type MedicalTestSection = {
  testCode?: string;
  testDtlId?: number;
  headerStatus?: string;
  medicalType?: string;
  testDate?: string;
  doctorName?: string;
  doctorRegNo?: string;
  testName?: string;
  reqFlag?: string;
  centreName?: string;
  centreAddress?: string;
  pincode?: string;
  parameters?: MedicalFetchParameter[];
};

type MedicalFetchResponse = {
  response_code?: number;
  error?: boolean;
  message?: string;
  data?: {
    applicationNumber?: string;
    partyId?: string;
    sections?: {
      mer?: {
        firstName?: string;
        lastName?: string;
        dateOfBirth?: string;
        genderCode?: string;
        educationCode?: string;
        occupationCode?: string;
        incomeCode?: string;
        anyDeclPostPolicy?: string;
        examDate?: string;
        examPlace?: string;
        examinerName?: string;
        meCode?: string;
        centreName?: string;
        centreAddress?: string;
        pincode?: string;
      };

      habit_and_addictions?: {
        habits?: Array<{
          substanceCode?: string;
          indicator?: string;
          quantity?: string | null;
          startYear?: number | null;
        }>;
      };

      measurement?: {
        heightCm?: number | null;
        weightKg?: number | null;
        waistCm?: number | null;
        hipsCm?: number | null;
        bmiCalculated?: number | string | null;
        heightFtsCalculated?: number | string | null;
        heightInchCalculated?: number | string | null;
      };

      family_history?: {
        members?: Array<{
          relationType?: string;
          memberAge?: number | null;
          healthStatusDesc?: string;
          aliveStatus?: string;
        }>;
      };

      blood_pressure_and_pulse?: {
        pulseRate?: number | null;
        readings?: Array<{
          readingSeq?: number;
          bpSystolic?: number | null;
          bpDiastolic?: number | null;
        }>;
        avgSystolicCalculated?: number | string | null;
        avgDiastolicCalculated?: number | string | null;
      };

      question_table?: {
        answers?: Array<{
          questionId?: string;
          questionValue?: string;
        }>;
      };

      [sectionKey: string]:
      | MedicalTestSection
      | Record<string, unknown>
      | undefined;
    };
  };
};

type DrsNewTabContext = {
  partyId?: string;
};

const getStoredDrsNewTabContext = (): DrsNewTabContext => {
  try {
    const rawValue = localStorage.getItem(DRS_NEW_TAB_CONTEXT_KEY);
    if (!rawValue) {
      return {};
    }

    const parsedValue = JSON.parse(rawValue);
    if (!parsedValue || typeof parsedValue !== "object" || Array.isArray(parsedValue)) {
      return {};
    }

    return parsedValue as DrsNewTabContext;
  } catch {
    return {};
  }
};

const toYesNoLabel = (value?: string | null) => {
  const normalized = (value ?? "").trim().toLowerCase();
  if (normalized === "y" || normalized === "yes") {
    return "Yes";
  }

  return "No";
};

const toTitleCase = (value?: string | null) => {
  const text = (value ?? "").trim().toLowerCase();
  if (!text) {
    return "";
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
};

const fromGenderCode = (value?: string | null) => {
  const normalized = (value ?? "").trim().toUpperCase();
  if (normalized === "M") {
    return "Male";
  }
  if (normalized === "F") {
    return "Female";
  }
  if (normalized === "TG") {
    return "Transgender";
  }

  return "";
};

const fromExamPlaceCode = (value?: string | null) => {
  const normalized = (value ?? "").trim().toUpperCase();
  if (normalized === "CLINIC") {
    return "Clinic";
  }
  if (normalized === "RES_OFFICE") {
    return "Res/Office";
  }

  return "";
};

const findSectionIdByTitle = (
  sections: Array<{ id: string; title: string; groupLabel: string }>,
  title: string
) =>
  sections.find((item) => item.groupLabel === "MER" && item.title.trim().toLowerCase() === title.trim().toLowerCase())
    ?.id ?? "";

const mapApplicantTabFromMemberType = (memberType: unknown, index: number): ApplicantTab => {
  const normalizedMemberType = String(memberType ?? "").trim().toUpperCase();

  if (normalizedMemberType.includes("PR") || normalizedMemberType.includes("PROPOSER")) {
    return "proposer";
  }

  if (normalizedMemberType.includes("LIFEASSURED1") || normalizedMemberType.includes("LA1")) {
    return "lifeassured1";
  }

  if (normalizedMemberType.includes("LIFEASSURED2") || normalizedMemberType.includes("LA2")) {
    return "lifeassured2";
  }

  if (normalizedMemberType.includes("LA") || normalizedMemberType.includes("LIFE")) {
    return index === 0 ? "lifeassured1" : "lifeassured2";
  }

  if (index === 0) {
    return "proposer";
  }

  if (index === 1) {
    return "lifeassured1";
  }

  return "lifeassured2";
};

const drsViewTabs: { key: DRSViewTab; label: string }[] = [
  { key: "medical", label: "View Medical" },
];

const uniqSectionTitles = (titles: string[]) => {
  const seen = new Set<string>();

  return titles
    .map((title) => title.trim())
    .filter(Boolean)
    .filter((title) => {
      const key = title.toLowerCase();
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
};

const shouldHideMerSubSection = (title: string) => {
  const normalized = title.trim().toLowerCase();
  return (
    // Temporarily hidden subsections.
    normalized === "question table" ||
    normalized === "tuw details"
  );
};

const ViewMedical = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { businessType, applicationNumber } = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);
  const userId = "user-id";
  const roleType = getRoleType();
  const isFormalRole = isFormalTaskRole(roleType);
  const formalMemberProfile = useMemo(() => buildFormalMemberProfile(drsData), [drsData]);

  const requestedApplicantTab =
    ((location.state as { selectedApplicantTab?: ApplicantTab } | null)?.selectedApplicantTab) ??
    getStoredApplicantTab();

  const [activeApplicantTab, setActiveApplicantTab] = useState<ApplicantTab>(requestedApplicantTab);
  // const [saveMessage, setSaveMessage] = useState<string | null>(null);
  // const [saveError, setSaveError] = useState<string | null>(null);
  const [drsContextLoading, setDrsContextLoading] = useState(false);
  const [drsContextError, setDrsContextError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [medicalFetchData, setMedicalFetchData] = useState<MedicalFetchResponse["data"] | null>(null);
  const [hasHydratedFromFetch, setHasHydratedFromFetch] = useState(false);
  // const [submitLoading, setSubmitLoading] = useState(false);
  const [editingSubSectionId, setEditingSubSectionId] = useState<string | null>(null);
  const merFormRefs = useRef<Record<string, MerFormHandle | null>>({});
  // const merFormRefs = useRef<MerFormHandle>(null);

  const specialMedicalFormRefs = useRef<Record<string, SpecialMedicalFormHandle | null>>({});
  const otherMedicalsFormRefs = useRef<Record<string, OtherMedicalsFormHandle | null>>({});
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  const safeBusinessType = businessType ?? "retail";
  const safeApplicationId = applicationNumber ?? String(medicalFetchData?.applicationNumber ?? "");
  const isApplicationIdMissing = !safeApplicationId;
  const storedNewTabContext = useMemo(() => getStoredDrsNewTabContext(), []);
  const drsDataRecord = drsData as Record<string, unknown> | null;
  const drsApplicationNumber = String(drsDataRecord?.applicationNumber ?? safeApplicationId).trim();
  const drsSummaryMembers = useMemo(
    () => (Array.isArray(drsDataRecord?.summary) ? (drsDataRecord?.summary as Array<Record<string, unknown>>) : []),
    [drsDataRecord]
  );

  const availableMemberTypes = useMemo(() => {
    const fromDrsSummary = drsSummaryMembers.map((item, index) =>
      mapApplicantTabFromMemberType(item.memberType, index)
    );

    return fromDrsSummary;
  }, [drsSummaryMembers]);

  const visibleApplicantTabs = useMemo(
    () => applicantTabs.filter((tab) => availableMemberTypes.includes(tab.key)),
    [availableMemberTypes]
  );

  const currentApplicantTab = useMemo(
    () =>
      visibleApplicantTabs.some((tab) => tab.key === activeApplicantTab)
        ? activeApplicantTab
        : (visibleApplicantTabs[0]?.key ?? "proposer"),
    [activeApplicantTab, visibleApplicantTabs]
  );

  const activeMemberRecord = useMemo(
    () =>
      drsSummaryMembers.find(
        (item, index) => mapApplicantTabFromMemberType(item.memberType, index) === currentApplicantTab
      ),
    [currentApplicantTab, drsSummaryMembers]
  );
  const partyId = useMemo(
    () =>
      String(
        activeMemberRecord?.partyId ?? drsSummaryMembers[0]?.partyId ?? storedNewTabContext.partyId ?? ""
      ).trim(),
    [activeMemberRecord, drsSummaryMembers, storedNewTabContext.partyId]
  );

  const medicalFetchPayloadError =
    !drsContextLoading &&
      !drsContextError &&
      (!safeApplicationId || !partyId)
      ? "Application number or party ID is unavailable for medical fetch."
      : null;

  useEffect(() => {
    if (!safeApplicationId || !roleType || !userId) {
      return;
    }

    const fetchDrsContext = async () => {
      try {
        setDrsContextLoading(true);
        setDrsContextError(null);
        await dispatch(
          drsThunk({
            applicationNo: safeApplicationId,
            userId,
            roleType,
            sections: ["summary"],
          })
        ).unwrap();
      } catch (error) {
        setDrsContextError(error instanceof Error ? error.message : "Failed to fetch DRS details.");
      } finally {
        setDrsContextLoading(false);
      }
    };

    void fetchDrsContext();
  }, [dispatch, roleType, safeApplicationId, userId]);

  const medicalSectionGroups = useMemo<MedicalSectionGroup[]>(
    () => {
      const merConfig = getMerConfig();
      const specialMedicalConfig = getSpecialMedicalConfig();
      const otherMedicalsConfig = getOtherMedicalsConfig();

      return [
        {
          key: "mer",
          label: "MER",
          subSections: [
            ...uniqSectionTitles(merConfig.map((field) => field.section)).filter(
              (sectionTitle) => !shouldHideMerSubSection(sectionTitle)
            ),
            "Question Table",
          ],
          fields: merConfig,
        },
        {
          key: "specialMedical",
          label: "Special Medical",
          subSections: uniqSectionTitles(specialMedicalConfig.map((field) => field.section)),
          fields: specialMedicalConfig,
        },
        {
          key: "otherMedicals",
          label: "Other Medicals",
          subSections: uniqSectionTitles(otherMedicalsConfig.map((field) => field.section)),
          fields: otherMedicalsConfig,
        },
      ];
    },
    []
  );

  const flattenedSubSections = useMemo(
    () =>
      medicalSectionGroups.flatMap((group) =>
        group.subSections.map((subSection, index) => ({
          id: `${group.key}-${index}`,
          title: subSection,
          groupLabel: group.label,
        }))
      ),
    [medicalSectionGroups]
  );

  useEffect(() => {
    if (medicalFetchPayloadError) {
      return;
    }

    const payload: MedicalFetchRequest = {
      applicationNumber: safeApplicationId,
      partyId,
    };

    const fetchMedical = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        setHasHydratedFromFetch(false);

        const response = await apiRequest<MedicalFetchResponse, MedicalFetchRequest>({
          url: url("medicalFetch" as ApiKey),
          method: "POST",
          body: payload,
        });

        setMedicalFetchData(response.data ?? null);
      } catch (error) {
        setFetchError(error instanceof Error ? error.message : "Failed to fetch medical details.");
      } finally {
        setLoading(false);
      }
    };

    void fetchMedical();
  }, [medicalFetchPayloadError, partyId, safeApplicationId]);

  // On page load, call BRE retrigger for ME and store its breOutput as final BRE
  useEffect(() => {
    if (!drsApplicationNumber) return;

    const callMe = async () => {
      try {
        const response = await dispatch(
          breRetriggerThunk({ eventName: "ME", applicationNumber: drsApplicationNumber })
        ).unwrap();

        const payload = response.data ?? {};
        dispatch(
          setBreExternalApiOutputs({
            breOutput: payload.breOutput,
            initialBreOutput: payload.initialBreOutput ?? undefined,
            breRetriggerStatus: "success",
          })
        );
      } catch {
        dispatch(
          setBreExternalApiOutputs({
            breRetriggerStatus: "failure",
          })
        );
      }
    };

    void callMe();
  }, [dispatch, drsApplicationNumber]);

  const [activeSubSectionId, setActiveSubSectionId] = useState<string>("");

  const resolvedActiveSubSectionId = useMemo(
    () =>
      flattenedSubSections.some((subSection) => subSection.id === activeSubSectionId)
        ? activeSubSectionId
        : (flattenedSubSections[0]?.id ?? ""),
    [activeSubSectionId, flattenedSubSections]
  );

  useEffect(() => {
    if (!medicalFetchData?.sections || hasHydratedFromFetch) {
      return;
    }

    const merSectionId = findSectionIdByTitle(flattenedSubSections, "MER");
    const habitsSectionId = findSectionIdByTitle(flattenedSubSections, "Habit and Addictions");
    const measurementSectionId = findSectionIdByTitle(flattenedSubSections, "Measurement");
    const familySectionId = findSectionIdByTitle(flattenedSubSections, "Family history and health status");
    const bloodPressureSectionId = findSectionIdByTitle(flattenedSubSections, "Blood pressure and Pulse details");
    const questionTableSectionId = findSectionIdByTitle(flattenedSubSections, "Question Table");

    const sections = medicalFetchData.sections;
    const merRef = merFormRefs.current[merSectionId];
    const habitsRef = merFormRefs.current[habitsSectionId];
    const measurementRef = merFormRefs.current[measurementSectionId];
    const familyRef = merFormRefs.current[familySectionId];
    const bloodRef = merFormRefs.current[bloodPressureSectionId];
    const questionRef = merFormRefs.current[questionTableSectionId];

    if (!merRef || !habitsRef || !measurementRef || !familyRef || !bloodRef || !questionRef) {
      return;
    }

    const mer = sections.mer;
    if (mer) {
      merRef.setFormValues({
        firstName: mer.firstName ?? "",
        lastName: mer.lastName ?? "",
        examineeDob: mer.dateOfBirth ?? "",
        gender: fromGenderCode(mer.genderCode),
        examineeEducationSd: mer.educationCode ?? "",
        examineeOccupationSd: mer.occupationCode ?? "",
        examineeIncomeSd: mer.incomeCode ?? "",
        anyPreviousLifeInsurancePolicyDeclinePostponeOrIssuedOnRevisedTermSd: toYesNoLabel(mer.anyDeclPostPolicy),
        dateOfExamination: mer.examDate ?? "",
        placeOfExamination: fromExamPlaceCode(mer.examPlace),
        nameOfMe: mer.examinerName ?? "",
        meCode: mer.meCode ?? "",
        diagnosticCentreName: mer.centreName ?? "",
        diagnosticCentreAddress: mer.centreAddress ?? "",
        diagnosticCentrePincode: mer.pincode ?? "",
      });
    }

    const habits = sections.habit_and_addictions?.habits ?? [];
    const findHabit = (codes: string[]) =>
      habits.find((habit) => codes.includes(String(habit.substanceCode ?? "").trim().toUpperCase()));

    const tobacco = findHabit(["TOBACCO", "CIGARETTE"]);
    const gutka = findHabit(["GUTKA"]);
    const narcotics = findHabit(["NARCOTICS"]);
    const alcohol = findHabit(["ALCOHOL", "LIQUOR"]);

    habitsRef.setFormValues({
      cigarettesBeedisCigar: toYesNoLabel(tobacco?.indicator),
      cigarettesBeedisCigarQuant: tobacco?.quantity == null ? "" : String(tobacco.quantity),
      cigarettesBeedisCigarYear: tobacco?.startYear == null ? "" : String(tobacco.startYear),
      gutkaSnuffPaan: toYesNoLabel(gutka?.indicator),
      gutkaSnuffPaanQuant: gutka?.quantity == null ? "" : String(gutka.quantity),
      gutkaSnuffPaanYear: gutka?.startYear == null ? "" : String(gutka.startYear),
      narcoticConsumption: toYesNoLabel(narcotics?.indicator),
      narcoticConsumptionQuant: narcotics?.quantity == null ? "" : String(narcotics.quantity),
      narcoticConsumptionYear: narcotics?.startYear == null ? "" : String(narcotics.startYear),
      beerWineHardLiquor: toYesNoLabel(alcohol?.indicator),
      beerWineHardLiquorQuant: alcohol?.quantity == null ? "" : String(alcohol.quantity),
      beerWineHardLiquorYear: alcohol?.startYear == null ? "" : String(alcohol.startYear),
    });

    const measurement = sections.measurement;
    if (measurement) {
      measurementRef.setFormValues({
        heightCms: measurement.heightCm == null ? "" : String(measurement.heightCm),
        weightKgs: measurement.weightKg == null ? "" : String(measurement.weightKg),
        waistCms: measurement.waistCm == null ? "" : String(measurement.waistCm),
        hipsCms: measurement.hipsCm == null ? "" : String(measurement.hipsCm),
        bmi: measurement.bmiCalculated == null ? "" : String(measurement.bmiCalculated),
        heightFts: measurement.heightFtsCalculated == null ? "" : String(measurement.heightFtsCalculated),
        inches: measurement.heightInchCalculated == null ? "" : String(measurement.heightInchCalculated),
      });
    }

    const members = sections.family_history?.members ?? [];
    const primaryMember = members[0];
    if (primaryMember) {
      familyRef.setFormValues({
        relation: toTitleCase(primaryMember.relationType),
        age: primaryMember.memberAge == null ? "" : String(primaryMember.memberAge),
        healthStatus: primaryMember.healthStatusDesc ?? "",
        deadOrAlive: String(primaryMember.aliveStatus ?? "").trim().toUpperCase() === "A" ? "Alive" : "Dead",
      });
    }

    const readings = sections.blood_pressure_and_pulse?.readings ?? [];
    const reading1 = readings.find((reading) => reading.readingSeq === 1);
    const reading2 = readings.find((reading) => reading.readingSeq === 2);
    const reading3 = readings.find((reading) => reading.readingSeq === 3);

    bloodRef.setFormValues({
      pulseRate:
        sections.blood_pressure_and_pulse?.pulseRate == null
          ? ""
          : String(sections.blood_pressure_and_pulse.pulseRate),
      systolic1: reading1?.bpSystolic == null ? "" : String(reading1.bpSystolic),
      diastolic1: reading1?.bpDiastolic == null ? "" : String(reading1.bpDiastolic),
      systolic2: reading2?.bpSystolic == null ? "" : String(reading2.bpSystolic),
      diastolic2: reading2?.bpDiastolic == null ? "" : String(reading2.bpDiastolic),
      systolic3: reading3?.bpSystolic == null ? "" : String(reading3.bpSystolic),
      diastolic3: reading3?.bpDiastolic == null ? "" : String(reading3.bpDiastolic),
      avgSystolic:
        sections.blood_pressure_and_pulse?.avgSystolicCalculated == null
          ? ""
          : String(sections.blood_pressure_and_pulse.avgSystolicCalculated),
      avgDiastolic:
        sections.blood_pressure_and_pulse?.avgDiastolicCalculated == null
          ? ""
          : String(sections.blood_pressure_and_pulse.avgDiastolicCalculated),
    });

    const answerMap = (sections.question_table?.answers ?? []).reduce<Record<string, string>>((acc, answer) => {
      const questionId = (answer.questionId ?? "").trim();
      if (!questionId) {
        return acc;
      }

      acc[questionId] = toYesNoLabel(answer.questionValue);
      return acc;
    }, {});

    if (Object.keys(answerMap).length > 0) {
      questionRef.setFormValues(answerMap);
    }

    flattenedSubSections
      .filter(
        (subSection) =>
          subSection.groupLabel === "Special Medical"
      )
      .forEach((subSection) => {
        const apiSectionKey =
          SPECIAL_MEDICAL_SECTION_MAP[subSection.title];

        if (!apiSectionKey) {
          return;
        }

        const formRef =
          specialMedicalFormRefs.current[subSection.id];

        const apiSection = sections[
          apiSectionKey
        ] as MedicalTestSection | undefined;

        if (!formRef || !apiSection) {
          return;
        }

        const parameters = apiSection.parameters ?? [];

        const findingsParameter = findMedicalParameter(
          parameters,
          ["Findings", "Main", "Value"]
        );

        const bloodUreaParameter = findMedicalParameter(
          parameters,
          ["Blood Urea", "Urea"]
        );

        const bunParameter = findMedicalParameter(
          parameters,
          ["BUN", "Blood Urea Nitrogen"]
        );

        const axisParameter = findMedicalParameter(
          parameters,
          ["Axis"]
        );

        const heartRateParameter = findMedicalParameter(
          parameters,
          ["Heart Rate", "HeartRate"]
        );

        const values: Record<string, string> = {
          ...buildCommonMedicalValues(apiSection),

          findings: toMedicalText(
            findingsParameter?.findingsCalculated ??
            findingsParameter?.findings ??
            findingsParameter?.paramValue
          ),

          result: toMedicalText(
            findingsParameter?.result ??
            findingsParameter?.findingsCalculated
          ),

          bloodUrea: getParameterDisplayValue(
            bloodUreaParameter
          ),

          bun: getParameterDisplayValue(bunParameter),

          ejectionFraction: toMedicalText(
            findingsParameter?.ejectionFraction ??
            findMedicalParameter(parameters, [
              "Ejection Fraction",
            ])?.paramValue
          ),

          ejectionResult: toMedicalText(
            findingsParameter?.ejectionResult ??
            findMedicalParameter(parameters, [
              "Ejection Result",
            ])?.paramValue
          ),

          rejectionAbnormality: toMedicalText(
            findingsParameter?.rejectionAbnormality
          ),

          remarks: toMedicalText(
            findingsParameter?.remarks
          ),

          remark: toMedicalText(
            findingsParameter?.remarks
          ),

          axis: toMedicalText(
            axisParameter?.paramValue ??
            axisParameter?.axis
          ),

          heartRate: toMedicalText(
            heartRateParameter?.paramValue ??
            heartRateParameter?.heartRate
          ),

          heartRateFindings: toMedicalText(
            heartRateParameter?.heartRateFindings
          ),

          inspiration: toMedicalText(
            findMedicalParameter(parameters, [
              "Inspiration",
            ])?.paramValue ??
            findingsParameter?.inspiration
          ),

          expiration: toMedicalText(
            findMedicalParameter(parameters, [
              "Expiration",
            ])?.paramValue ??
            findingsParameter?.expiration
          ),

          fev1: toMedicalText(
            findMedicalParameter(parameters, [
              "FEV1",
            ])?.paramValue ??
            findingsParameter?.fev1
          ),

          fvc: toMedicalText(
            findMedicalParameter(parameters, [
              "FVC",
            ])?.paramValue ??
            findingsParameter?.fvc
          ),

          rv: toMedicalText(
            findMedicalParameter(parameters, [
              "RV",
            ])?.paramValue ??
            findingsParameter?.rv
          ),

          rc: toMedicalText(
            findMedicalParameter(parameters, [
              "RC",
            ])?.paramValue ??
            findingsParameter?.rc
          ),

          mets: toMedicalText(
            findMedicalParameter(parameters, [
              "METS",
            ])?.paramValue ??
            findingsParameter?.mets
          ),
        };

        formRef.setFormValues(values);
        const calculatedParameters: MedicalCalculatedParameter[] =
          parameters.map((parameter) => ({
            ...parameter,
            paramName: parameter.paramName ?? undefined,
            paramValue:
              parameter.paramValue == null
                ? undefined
                : String(parameter.paramValue),
            paramUnits: parameter.paramUnits ?? undefined,
            refRangeFrom: parameter.refRangeFrom ?? undefined,
            refRangeTo: parameter.refRangeTo ?? undefined,
            findings: parameter.findings ?? undefined,
            ejectionResult:
              parameter.ejectionResult ?? undefined,
            rejectionAbnormality:
              parameter.rejectionAbnormality ?? undefined,
            remarks: parameter.remarks ?? undefined,
            axis: parameter.axis ?? undefined,
            heartRateFindings:
              parameter.heartRateFindings ?? undefined,
            result: parameter.result ?? undefined,
            findingsCalculated:
              parameter.findingsCalculated ?? undefined,
          }));

        formRef.setCalculatedFindings(calculatedParameters);
        // formRef.setCalculatedFindings(parameters);
      });


    flattenedSubSections
      .filter(
        (subSection) =>
          subSection.groupLabel === "Other Medicals"
      )
      .forEach((subSection) => {
        const apiSectionKey =
          OTHER_MEDICAL_SECTION_MAP[subSection.title];

        if (!apiSectionKey) {
          return;
        }

        const formRef =
          otherMedicalsFormRefs.current[subSection.id];

        const apiSection = sections[
          apiSectionKey
        ] as MedicalTestSection | undefined;

        if (!formRef || !apiSection) {
          return;
        }

        const parameters = apiSection.parameters ?? [];

        const valueParameter = findMedicalParameter(
          parameters,
          ["Value", "Main", "Findings"]
        );

        formRef.setFormValues({
          ...buildCommonMedicalValues(apiSection),

          value: getParameterDisplayValue(valueParameter),

          findings: toMedicalText(
            valueParameter?.findingsCalculated ??
            valueParameter?.findings ??
            valueParameter?.result
          ),

          result: toMedicalText(
            valueParameter?.result ??
            valueParameter?.findingsCalculated
          ),

          labRangeValueStart: toMedicalText(
            valueParameter?.refRangeFrom
          ),

          labRangeValueEnd: toMedicalText(
            valueParameter?.refRangeTo
          ),

          unitsValue: toMedicalText(
            valueParameter?.paramUnits
          ),
        });

        const tableRows =
          OTHER_MEDICAL_TABLE_ROWS[apiSectionKey];

        if (tableRows) {
          formRef.setTableData(
            buildOtherMedicalTableData(
              parameters,
              tableRows
            )
          );
        }
      });

    setHasHydratedFromFetch(true);
  }, [flattenedSubSections, hasHydratedFromFetch, medicalFetchData]);

  useEffect(() => {
    if (!resolvedActiveSubSectionId) {
      return;
    }

    const menuContainer = menuContainerRef.current;
    if (!menuContainer) {
      return;
    }

    const activeMenuNode = menuContainer.querySelector<HTMLElement>(
      `[data-medical-menu-id="${resolvedActiveSubSectionId}"]`
    );

    if (!activeMenuNode) {
      return;
    }

    const containerRect = menuContainer.getBoundingClientRect();
    const itemRect = activeMenuNode.getBoundingClientRect();
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
  }, [resolvedActiveSubSectionId]);

  const handleSubSectionMenuClick = (subSectionId: string) => {
    setActiveSubSectionId(subSectionId);
    sectionRefs.current[subSectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (flattenedSubSections.length === 0) {
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

        const visibleId = visibleEntries[0].target.getAttribute("data-medical-section-id");
        if (visibleId) {
          setActiveSubSectionId(visibleId);
        }
      },
      {
        root: null,
        rootMargin: "-160px 0px -55% 0px",
        threshold: [0.1, 0.35, 0.6],
      }
    );

    flattenedSubSections.forEach((subSection) => {
      const node = sectionRefs.current[subSection.id];
      if (node) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [flattenedSubSections, currentApplicantTab]);

  const getSubSectionEditHandle = (subSectionId: string) => {
    if (subSectionId.startsWith("mer-")) {
      return merFormRefs.current[subSectionId];
    }

    if (subSectionId.startsWith("specialMedical-")) {
      return specialMedicalFormRefs.current[subSectionId];
    }

    return otherMedicalsFormRefs.current[subSectionId];
  };

  const handleSubSectionEdit = (subSectionId: string) => {
    getSubSectionEditHandle(subSectionId)?.beginEdit();
    setEditingSubSectionId(subSectionId);
  };

  const handleSubSectionSave = async () => {
    if (!editingSubSectionId) {
      return;
    }

    const subSection = flattenedSubSections.find(
      (item) => item.id === editingSubSectionId
    );

    if (!subSection) {
      return;
    }

    const formRef = getSubSectionEditHandle(editingSubSectionId);

    if (!formRef) {
      return;
    }

    // MER save API
    // if (subSection.groupLabel === "MER") {
    //   const merFormRef = merFormRefs.current[editingSubSectionId];

    //   if (!merFormRef) {
    //     return;
    //   }

    //   const isValid = merFormRef.validateForm();

    //   if (!isValid) {
    //     return;
    //   }

    //   const values = merFormRef.getFormValues();

    //   const request = buildMerRequest({
    //     applicationNumber: safeApplicationId,
    //     partyId,
    //     createdBy: "user-id",
    //     selectedSubSection: subSection.title,
    //     values,
    //   });

    //   console.log("MER Request", request);

    //   try {
    //     const response = await dispatch(saveMerThunk(request)).unwrap();

    //     merFormRef.commitEdit();
    //     setEditingSubSectionId(null);
    //   } catch (error) {
    //     console.error("MER save failed:", error);
    //   }

    //   return;
    // }

    if (subSection.groupLabel === "MER") {
      const merFormRef = merFormRefs.current[editingSubSectionId];

      if (!merFormRef) {
        return;
      }

      const isValid = merFormRef.validateForm();

      if (!isValid) {
        return;
      }

      const values = merFormRef.getFormValues();

      const request = buildMerRequest({
        applicationNumber: safeApplicationId,
        partyId,
        createdBy: userId,
        selectedSubSection: subSection.title,
        values,
      });

      // try {
      //   const response = await dispatch(
      //     saveMerThunk(request)
      //   ).unwrap();

      //   const savedSection =
      //     response.data?.sections;

      //   // Update calculated values returned by API
      //   if (savedSection?.measurement) {
      //     merFormRef.setFormValues({
      //       bmi:
      //         savedSection.measurement.bmiCalculated == null
      //           ? ""
      //           : String(savedSection.measurement.bmiCalculated),

      //       heightFts:
      //         savedSection.measurement.heightFtsCalculated == null
      //           ? ""
      //           : String(savedSection.measurement.heightFtsCalculated),

      //       heightInch:
      //         savedSection.measurement.heightInchCalculated == null
      //           ? ""
      //           : String(savedSection.measurement.heightInchCalculated),
      //     });
      //   }

      //   if (savedSection?.blood_pressure_and_pulse) {
      //     merFormRef.setFormValues({
      //       avgSystolic:
      //         savedSection.blood_pressure_and_pulse
      //           .avgSystolicCalculated == null
      //           ? ""
      //           : String(
      //             savedSection.blood_pressure_and_pulse
      //               .avgSystolicCalculated
      //           ),

      //       avgDiastolic:
      //         savedSection.blood_pressure_and_pulse
      //           .avgDiastolicCalculated == null
      //           ? ""
      //           : String(
      //             savedSection.blood_pressure_and_pulse
      //               .avgDiastolicCalculated
      //           ),
      //     });
      //   }

      //   merFormRef.commitEdit();
      //   setEditingSubSectionId(null);
      // } catch (error) {
      //   console.error("MER save failed:", error);
      // }

      try {
        const response = await dispatch(
          saveMerThunk(request)
        ).unwrap();

        if (response.data?.sections) {
          applyMerCalculatedValues(
            response.data.sections
          );
        }

        merFormRef.commitEdit();
        setEditingSubSectionId(null);
      } catch (error) {
        console.error("MER save failed:", error);
      }
      return;
    }

    if (subSection.groupLabel === "Other Medicals") {
      const otherMedicalFormRef =
        otherMedicalsFormRefs.current[editingSubSectionId];

      if (!otherMedicalFormRef) {
        return;
      }

      const isValid = otherMedicalFormRef.validateForm();

      if (!isValid) {
        return;
      }

      try {
        const request = buildOtherMedicalRequest({
          applicationNumber: safeApplicationId,
          partyId,
          createdBy: userId,
          selectedSubSection: subSection.title,
          values: otherMedicalFormRef.getFormValues(),
          tableData: otherMedicalFormRef.getTableData(),
        });

        // console.log("Request", request);

        await dispatch(saveOtherMedicalThunk(request)).unwrap();

        otherMedicalFormRef.commitEdit();
        setEditingSubSectionId(null);
      } catch (error) {
        console.error("Other Medical save failed:", error);
      }

      return;
    }

    if (subSection.groupLabel === "Special Medical") {
      const specialMedicalFormRef =
        specialMedicalFormRefs.current[editingSubSectionId];

      if (!specialMedicalFormRef) {
        return;
      }

      const isValid = specialMedicalFormRef.validateForm();

      if (!isValid) {
        return;
      }

      try {
        const request = buildSpecialMedicalRequest({
          applicationNumber: safeApplicationId,
          partyId,
          createdBy: userId,
          selectedSubSection: subSection.title,
          values: specialMedicalFormRef.getFormValues(),
        });

        await dispatch(saveSpecialMedicalThunk(request)).unwrap();

        specialMedicalFormRef.commitEdit();
        setEditingSubSectionId(null);
      } catch (error) {
        console.error("Special Medical save failed:", error);
      }

      return;
    }

    // Existing behavior for Special Medical / Other Medicals
    formRef.commitEdit();
    setEditingSubSectionId(null);
  };

  const handleSubSectionReset = () => {
    if (editingSubSectionId) {
      getSubSectionEditHandle(editingSubSectionId)?.resetEdit();
    }
    setEditingSubSectionId(null);
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

  const applyMerCalculatedValues = (
    sections: NonNullable<
      NonNullable<MerSaveResponse["data"]>["sections"]
    >
  ) => {
    const measurementSectionId = findSectionIdByTitle(
      flattenedSubSections,
      "Measurement"
    );

    const bloodPressureSectionId = findSectionIdByTitle(
      flattenedSubSections,
      "Blood pressure and Pulse details"
    );

    const measurementRef =
      merFormRefs.current[measurementSectionId];

    const bloodPressureRef =
      merFormRefs.current[bloodPressureSectionId];

    if (measurementRef && sections.measurement) {
      measurementRef.setFormValues({
        bmi:
          sections.measurement.bmiCalculated == null
            ? ""
            : String(sections.measurement.bmiCalculated),

        heightFts:
          sections.measurement.heightFtsCalculated == null
            ? ""
            : String(sections.measurement.heightFtsCalculated),

        inches:
          sections.measurement.heightInchCalculated == null
            ? ""
            : String(sections.measurement.heightInchCalculated),
      });
    }

    if (
      bloodPressureRef &&
      sections.blood_pressure_and_pulse
    ) {
      bloodPressureRef.setFormValues({
        avgSystolic:
          sections.blood_pressure_and_pulse
            .avgSystolicCalculated == null
            ? ""
            : String(
              sections.blood_pressure_and_pulse
                .avgSystolicCalculated
            ),

        avgDiastolic:
          sections.blood_pressure_and_pulse
            .avgDiastolicCalculated == null
            ? ""
            : String(
              sections.blood_pressure_and_pulse
                .avgDiastolicCalculated
            ),
      });
    }
  };

  const isPageLoading =
    drsContextLoading ||
    loading ||
    (!medicalFetchData &&
      !fetchError &&
      !medicalFetchPayloadError);

/*
* Keep the full-page loader visible until the DRS summary
* and Medical Fetch APIs have completed.
*/
  if (isPageLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "91vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          backgroundColor: "#f5f7fa",
        }}
      >
        <CircularProgress
          size={42}
          thickness={4}
          sx={{
            color: "#f58220",
          }}
        />

        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          Loading Medical details...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <BackButton
        label="Back to DRS"
        onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationId))}
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

      <BreDecision />


      {!isFormalRole && (
        <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
          <CustomTabs
            tabs={visibleApplicantTabs}
            value={currentApplicantTab}
            onChange={(value: ApplicantTab) => {
              setActiveApplicantTab(value);
              localStorage.setItem("drsSelectedApplicantTab", value);
            }}
          />
        </Box>
      )}

<Box sx={{px: 1}}>
      <Box sx={{ position: "sticky", top: 12, zIndex: 10, mb: 1, mt: 2 }}>
        <CustomAccordion
          title={isFormalRole ? "Member Profile" : "Applicant Profile"}
          defaultExpanded={false}
          detailPadding={0}
        >
          {isFormalRole ? (
            <Box sx={{ px: { xs: 2, md: 3 }, py: 2, backgroundColor: "#FFFFFF" }}>
              <FormalMemberProfile profile={formalMemberProfile} />
            </Box>
          ) : (
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
          {medicalSectionGroups.map((group) => (
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

              {group.subSections.map((subSection, index) => {
                const subSectionId = `${group.key}-${index}`;
                const isActive = subSectionId === resolvedActiveSubSectionId;

                return (
                  <Box
                    key={subSectionId}
                    data-medical-menu-id={subSectionId}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSubSectionMenuClick(subSectionId)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        handleSubSectionMenuClick(subSectionId);
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
                      {subSection}
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

        <Box sx={{ flex: 1, width: "100%", minHeight: 240 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {flattenedSubSections.map((subSection) => {
              const group = medicalSectionGroups.find((medicalGroup) => medicalGroup.label === subSection.groupLabel);

              return (
                <Box
                  key={subSection.id}
                  data-medical-section-id={subSection.id}
                  ref={(node) => {
                    sectionRefs.current[subSection.id] = node as HTMLDivElement | null;
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
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1F2937" }}>
                      {subSection.title}
                    </Typography>
                    {roleType === "CPT_DATA_ENTRY_MR_TASK" && (
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          {editingSubSectionId !== subSection.id ? (
                            <CustomButton
                              sx={{ minWidth: 80, py: 0.5, fontSize: 13 }}
                              onClick={() => handleSubSectionEdit(subSection.id)}
                            >
                              Edit
                            </CustomButton>
                          ) : (
                            <>
                              <CustomButton
                                sx={{ minWidth: 80, py: 0.5, fontSize: 13 }}
                                disabled={
                                  // submitLoading ||
                                  !safeApplicationId}
                                onClick={handleSubSectionSave}
                              >
                                {/* {submitLoading ? "Saving..." : "Save"} */}
                                Save
                              </CustomButton>
                              <CustomButton
                                sx={{ minWidth: 80, py: 0.5, fontSize: 13 }}
                                // disabled={submitLoading}
                                onClick={() => handleSubSectionReset()}
                              >
                                Reset
                              </CustomButton>
                            </>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ p: { xs: 1.25, md: 1.5 } }}>
                    {group?.key === "mer" && (
                      // <MerForm
                      //   ref={(node) => {
                      //     merFormRefs.current[subSection.id] = node;
                      //   }}
                      //   selectedSubSection={subSection.title}
                      //   fields={group.fields}
                      //   applicationNo={safeApplicationId}
                      //   isEditing={editingSubSectionId === subSection.id}
                      // />
                      <MerForm
                        ref={(node) => {
                          merFormRefs.current[subSection.id] =
                            node;
                        }}
                        selectedSubSection={
                          subSection.title
                        }
                        fields={group.fields}
                        applicationNo={
                          safeApplicationId
                        }
                        isEditing={
                          editingSubSectionId ===
                          subSection.id
                        }
                      />
                    )}
                    {group?.key === "specialMedical" && (
                      <SpecialMedicalForm
                        ref={(node) => {
                          specialMedicalFormRefs.current[subSection.id] = node;
                        }}
                        selectedSubSection={subSection.title}
                        fields={group.fields}
                        isEditing={editingSubSectionId === subSection.id}
                      />
                    )}
                    {group?.key === "otherMedicals" && (
                      <OtherMedicalsForm
                        ref={(node) => {
                          otherMedicalsFormRefs.current[subSection.id] = node;
                        }}
                        selectedSubSection={subSection.title}
                        fields={group.fields}
                        isEditing={editingSubSectionId === subSection.id}
                      />
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
    </>
  );
};

export default ViewMedical;