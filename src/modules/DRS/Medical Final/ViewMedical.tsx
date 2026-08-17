import { Box, Container, Typography } from "@mui/material";
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
import { getOtherMedicalsConfig } from "./Other Medicals/otherMedicalsConfig";
import SpecialMedicalForm, { type SpecialMedicalFormHandle } from "./Special Medical/SpecialMedicalForm";
import { getSpecialMedicalConfig } from "./Special Medical/specialMedicalConfig";

const getStoredApplicantTab = () =>
  (localStorage.getItem("drsSelectedApplicantTab") as ApplicantTab | null) ?? "proposer";
const getRoleType = () => localStorage.getItem("roleType") ?? "";
const DRS_NEW_TAB_CONTEXT_KEY = "drsNewTabContext";

type DRSViewTab = "medical" | "financial";
type MedicalSectionTab = "mer" | "specialMedical" | "otherMedicals";
type MedicalSectionGroup = {
  key: MedicalSectionTab;
  label: string;
  subSections: string[];
  fields: { id: string | number; section: string; field: string }[];
};

type SaveMedicalPayload = {
  applicationNumber: string;
  partyId: string;
  createdBy: string;
  sections: {
    mer: Record<string, unknown>;
    habit_and_addictions: { habits: Array<Record<string, unknown>> };
    measurement: Record<string, unknown>;
    family_history: { members: Array<Record<string, unknown>> };
    blood_pressure_and_pulse: Record<string, unknown>;
    question_table: { answers: Array<Record<string, unknown>> };
  };
};

type MedicalFetchRequest = {
  applicationNumber: string;
  partyId: string;
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
    };
  };
};

type SaveMedicalResponse = {
  response_code?: number;
  error?: boolean;
  message?: string;
  data?: {
    sections?: {
      measurement?: {
        bmiCalculated?: string | number | null;
      };
      blood_pressure_and_pulse?: {
        avgSystolicCalculated?: string | number | null;
        avgDiastolicCalculated?: string | number | null;
      };
      question_table?: {
        answers?: Array<{
          questionId?: string;
          questionValue?: string;
        }>;
      };
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

const toYesNoCode = (value: string) => {
  const normalized = value.trim().toLowerCase();
  if (normalized === "yes" || normalized === "y") {
    return "Y";
  }

  return "N";
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

const getValue = (values: Record<string, string>, key: string) => (values[key] ?? "").trim();

const parseNumber = (value: string) => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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
  const userId = (localStorage.getItem("userId") ?? localStorage.getItem("username") ?? "").trim();
  const roleType = getRoleType();
  const isFormalRole = isFormalTaskRole(roleType);
  const formalMemberProfile = useMemo(() => buildFormalMemberProfile(drsData), [drsData]);

  const requestedApplicantTab =
    ((location.state as { selectedApplicantTab?: ApplicantTab } | null)?.selectedApplicantTab) ??
    getStoredApplicantTab();

  const [activeApplicantTab, setActiveApplicantTab] = useState<ApplicantTab>(requestedApplicantTab);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [drsContextLoading, setDrsContextLoading] = useState(false);
  const [drsContextError, setDrsContextError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [medicalFetchData, setMedicalFetchData] = useState<MedicalFetchResponse["data"] | null>(null);
  const [hasHydratedFromFetch, setHasHydratedFromFetch] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [editingSubSectionId, setEditingSubSectionId] = useState<string | null>(null);
  const merFormRefs = useRef<Record<string, MerFormHandle | null>>({});
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

  const selectedSubSection = useMemo(
    () => flattenedSubSections.find((subSection) => subSection.id === resolvedActiveSubSectionId),
    [flattenedSubSections, resolvedActiveSubSectionId]
  );

  const selectedGroup = useMemo(
    () => medicalSectionGroups.find((group) => group.label === selectedSubSection?.groupLabel),
    [medicalSectionGroups, selectedSubSection]
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
    setSaveMessage(null);
    setSaveError(null);
  };

  const handleSubSectionSave = async () => {
    // TODO: Implement save logic for individual subsection
    if (editingSubSectionId) {
      getSubSectionEditHandle(editingSubSectionId)?.commitEdit();
    }
    setSaveMessage("Subsection saved successfully.");
    setEditingSubSectionId(null);
  };

  const handleSubSectionReset = () => {
    if (editingSubSectionId) {
      getSubSectionEditHandle(editingSubSectionId)?.resetEdit();
    }
    setEditingSubSectionId(null);
    setSaveMessage(null);
    setSaveError(null);
  };

  const handleMedicalSave = async () => {
    setSaveMessage(null);
    setSaveError(null);

    if (selectedGroup?.key === "mer") {
      const merSubSectionIds = flattenedSubSections
        .filter((subSection) => subSection.groupLabel === "MER")
        .map((subSection) => subSection.id);

      const validationResults: boolean[] = merSubSectionIds.map((subSectionId) => {
        const merFormRef = merFormRefs.current[subSectionId];

        if (!merFormRef) {
          return true;
        }

        return merFormRef.validateForm();
      });

      const hasAnyInvalidMerForm = validationResults.some((isValid) => !isValid);

      if (hasAnyInvalidMerForm) {
        setSaveError("Please correct highlighted fields before saving.");
        return;
      }

      if (!partyId) {
        setSaveError("Party ID is unavailable for medical save.");
        return;
      }

      const merSectionId = findSectionIdByTitle(flattenedSubSections, "MER");
      const habitsSectionId = findSectionIdByTitle(flattenedSubSections, "Habit and Addictions");
      const measurementSectionId = findSectionIdByTitle(flattenedSubSections, "Measurement");
      const familySectionId = findSectionIdByTitle(flattenedSubSections, "Family history and health status");
      const bloodPressureSectionId = findSectionIdByTitle(flattenedSubSections, "Blood pressure and Pulse details");
      const questionTableSectionId = findSectionIdByTitle(flattenedSubSections, "Question Table");

      const merValues = merFormRefs.current[merSectionId]?.getFormValues() ?? {};
      const habitsValues = merFormRefs.current[habitsSectionId]?.getFormValues() ?? {};
      const measurementValues = merFormRefs.current[measurementSectionId]?.getFormValues() ?? {};
      const familyValues = merFormRefs.current[familySectionId]?.getFormValues() ?? {};
      const bloodPressureValues = merFormRefs.current[bloodPressureSectionId]?.getFormValues() ?? {};
      const questionValues = merFormRefs.current[questionTableSectionId]?.getFormValues() ?? {};

      const requestPayload: SaveMedicalPayload = {
        applicationNumber: safeApplicationId,
        partyId,
        createdBy: "ui-user",
        sections: {
          mer: {
            firstName: getValue(merValues, "firstName"),
            lastName: getValue(merValues, "lastName"),
            genderCode: getValue(merValues, "gender").slice(0, 1).toUpperCase(),
            educationCode: getValue(merValues, "examineeEducationSd"),
            occupationCode: getValue(merValues, "examineeOccupationSd"),
            incomeCode: getValue(merValues, "examineeIncomeSd"),
            dateOfBirth: getValue(merValues, "examineeDob"),
            anyDeclPostPolicy: toYesNoCode(getValue(merValues, "anyPreviousLifeInsurancePolicyDeclinePostponeOrIssuedOnRevisedTermSd")),
            examinerName: getValue(merValues, "nameOfMe"),
            meCode: getValue(merValues, "meCode"),
            examDate: getValue(merValues, "dateOfExamination"),
            examTime: "",
            examPlace: getValue(merValues, "placeOfExamination"),
            centreName: getValue(merValues, "diagnosticCentreName"),
            centreAddress: getValue(merValues, "diagnosticCentreAddress"),
            pincode: getValue(merValues, "diagnosticCentrePincode"),
          },
          habit_and_addictions: {
            habits: [
              {
                substanceCode: "TOBACCO",
                indicator: toYesNoCode(getValue(habitsValues, "cigarettesBeedisCigar")),
                quantity: getValue(habitsValues, "cigarettesBeedisCigarQuant"),
                startYear: parseNumber(getValue(habitsValues, "cigarettesBeedisCigarYear")),
              },
              {
                substanceCode: "GUTKA",
                indicator: toYesNoCode(getValue(habitsValues, "gutkaSnuffPaan")),
                quantity: getValue(habitsValues, "gutkaSnuffPaanQuant"),
                startYear: parseNumber(getValue(habitsValues, "gutkaSnuffPaanYear")),
              },
              {
                substanceCode: "NARCOTICS",
                indicator: toYesNoCode(getValue(habitsValues, "narcoticConsumption")),
                quantity: getValue(habitsValues, "narcoticConsumptionQuant"),
                startYear: parseNumber(getValue(habitsValues, "narcoticConsumptionYear")),
              },
              {
                substanceCode: "ALCOHOL",
                indicator: toYesNoCode(getValue(habitsValues, "beerWineHardLiquor")),
                quantity: getValue(habitsValues, "beerWineHardLiquorQuant"),
                startYear: parseNumber(getValue(habitsValues, "beerWineHardLiquorYear")),
              },
            ],
          },
          measurement: {
            heightCm: parseNumber(getValue(measurementValues, "heightCms")),
            weightKg: parseNumber(getValue(measurementValues, "weightKgs")),
            waistCm: parseNumber(getValue(measurementValues, "waistCms")),
            hipsCm: parseNumber(getValue(measurementValues, "hipsCms")),
          },
          family_history: {
            members: [
              {
                relationType: "FATHER",
                memberAge: parseNumber(getValue(familyValues, "age")),
                healthStatusDesc: getValue(familyValues, "healthStatus"),
                aliveStatus: getValue(familyValues, "deadOrAlive").toUpperCase().includes("DEAD") ? "DEAD" : "ALIVE",
              },
            ],
          },
          blood_pressure_and_pulse: {
            pulseRate: parseNumber(getValue(bloodPressureValues, "pulseRate")),
            pulseRemark: getValue(bloodPressureValues, "pulseRemarks"),
            readings: [
              {
                readingSeq: 1,
                bpSystolic: parseNumber(getValue(bloodPressureValues, "systolic1")),
                bpDiastolic: parseNumber(getValue(bloodPressureValues, "diastolic1")),
                readingTime: "",
              },
              {
                readingSeq: 2,
                bpSystolic: parseNumber(getValue(bloodPressureValues, "systolic2")),
                bpDiastolic: parseNumber(getValue(bloodPressureValues, "diastolic2")),
                readingTime: "",
              },
              {
                readingSeq: 3,
                bpSystolic: parseNumber(getValue(bloodPressureValues, "systolic3")),
                bpDiastolic: parseNumber(getValue(bloodPressureValues, "diastolic3")),
                readingTime: "",
              },
            ],
          },
          question_table: {
            answers: Object.entries(questionValues)
              .filter(([key]) => key.includes("."))
              .map(([questionId, questionValue]) => ({
                questionId,
                questionValue: toYesNoCode(String(questionValue)),
                remark: "",
              })),
          },
        },
      };

      console.log("Payload", requestPayload);

      try {
        setSubmitLoading(true);
        setSaveError(null);

        const response = await apiRequest<SaveMedicalResponse, SaveMedicalPayload>({
          url: url("medicalSaveAndCalculate" as ApiKey),
          method: "POST",
          body: requestPayload,
        });

        const responseSections = response.data?.sections;

        if (measurementSectionId && responseSections?.measurement?.bmiCalculated != null) {
          merFormRefs.current[measurementSectionId]?.setFormValues({
            bmi: String(responseSections.measurement.bmiCalculated),
          });
        }

        if (bloodPressureSectionId) {
          const nextValues: Record<string, string> = {};
          if (responseSections?.blood_pressure_and_pulse?.avgSystolicCalculated != null) {
            nextValues.avgSystolic = String(responseSections.blood_pressure_and_pulse.avgSystolicCalculated);
          }
          if (responseSections?.blood_pressure_and_pulse?.avgDiastolicCalculated != null) {
            nextValues.avgDiastolic = String(responseSections.blood_pressure_and_pulse.avgDiastolicCalculated);
          }
          if (Object.keys(nextValues).length > 0) {
            merFormRefs.current[bloodPressureSectionId]?.setFormValues(nextValues);
          }
        }

        if (questionTableSectionId && responseSections?.question_table?.answers) {
          const answerMap = responseSections.question_table.answers.reduce<Record<string, string>>((acc, answer) => {
            const questionId = (answer.questionId ?? "").trim();
            if (!questionId) {
              return acc;
            }

            acc[questionId] = toYesNoLabel(answer.questionValue);
            return acc;
          }, {});

          if (Object.keys(answerMap).length > 0) {
            merFormRefs.current[questionTableSectionId]?.setFormValues(answerMap);
          }
        }

        setSaveMessage(response.message ?? "Medical details calculated and saved successfully.");
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : "Failed to calculate and submit medical details.");
      } finally {
        setSubmitLoading(false);
      }
      return;
    }

    if (selectedGroup?.key === "specialMedical" || selectedGroup?.key === "otherMedicals") {
      setSaveError("Save validation is currently implemented for MER section only.");
      return;
    }

    if (!selectedGroup) {
      setSaveError("Please correct highlighted fields before saving.");
      return;
    }

    setSaveMessage("Validation passed. Ready to save.");
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

      <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
        <CustomTabs
          tabs={drsViewTabs}
          value="medical"
          onChange={(value: DRSViewTab) => handleDRSViewTabChange(value)}
        />
      </Box>

      {/* <BreDecision /> */}

      {(drsContextLoading || loading) && (
        <Typography sx={{ color: "#6B7280", mb: 2 }}>
          {drsContextLoading ? "Loading DRS details..." : "Loading medical details..."}
        </Typography>
      )}
      {(drsContextError || medicalFetchPayloadError || fetchError) && (
        <Typography sx={{ color: "#DE2C3B", mb: 2 }}>
          {drsContextError ?? medicalFetchPayloadError ?? fetchError}
        </Typography>
      )}

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
                                disabled={submitLoading || !safeApplicationId}
                                onClick={handleSubSectionSave}
                              >
                                {submitLoading ? "Saving..." : "Save"}
                              </CustomButton>
                              <CustomButton
                                sx={{ minWidth: 80, py: 0.5, fontSize: 13 }}
                                disabled={submitLoading}
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
                      <MerForm
                        ref={(node) => {
                          merFormRefs.current[subSection.id] = node;
                        }}
                        selectedSubSection={subSection.title}
                        fields={group.fields}
                        applicationNo={safeApplicationId}
                        isEditing={editingSubSectionId === subSection.id}
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

      <Box sx={{ mt: 2, p: 2, border: "1px solid #E4E7EC", borderRadius: 1.5, backgroundColor: "#FFFFFF" }}>
        {(saveMessage || saveError) && (
          <Typography sx={{ mb: 1.5, color: saveError ? "#DE2C3B" : "#067647", fontSize: 13 }}>
            {saveError ?? saveMessage}
          </Typography>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
          <CustomButton onClick={() => void handleMedicalSave()} disabled={!safeApplicationId || submitLoading} sx={{ minWidth: 120 }}>
            Save
          </CustomButton>
        </Box>
      </Box>
    </Container>
  );
};

export default ViewMedical;