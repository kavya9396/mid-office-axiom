import type { ApplicantTab } from "../types/drs.types";
import { getErrorMessage } from "../config/errorMessages";

export const DRS_REQUIRED_APPLICANT_TABS_KEY = "drsRequiredApplicantTabs";
export const DRS_VISITED_APPLICANT_TABS_KEY = "drsVisitedApplicantTabs";
export const DRS_TAB_VISIT_EVENT = "drsApplicantTabsVisitedChanged";

const APPLICANT_TAB_LABELS: Record<ApplicantTab, string> = {
  proposer: "Proposer",
  lifeassured: "Life Assured",
  lifeassured1: "Life Assured 1",
  lifeassured2: "Life Assured 2",
};

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const mapMemberType = (memberTypeValue: unknown, index: number): ApplicantTab => {
  const normalized = String(memberTypeValue ?? "").trim().toUpperCase();

  if (normalized === "PROPOSER" || normalized.includes("PR")) return "proposer";
  if (normalized === "LIFEASSURED1" || normalized === "LIFE ASSURED 1") return "lifeassured1";
  if (normalized === "LIFEASSURED2" || normalized === "LIFE ASSURED 2") return "lifeassured2";
  if (normalized.includes("LA") || normalized.includes("LIFE")) return index === 1 ? "lifeassured1" : "lifeassured2";
  if (index === 0) return "proposer";
  if (index === 1) return "lifeassured1";
  return "lifeassured2";
};

export const getRequiredApplicantTabs = (drsData: unknown): ApplicantTab[] => {
  const root = toRecord(drsData);
  const summaryRows = Array.isArray(root.summary) ? root.summary : [];

  if (summaryRows.length <= 1) {
    return [];
  }

  return Array.from(
    new Set(
      summaryRows.map((row, index) => mapMemberType(toRecord(row).memberType, index)),
    ),
  );
};

export const getStoredApplicantTabs = (key: string): ApplicantTab[] => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((value): value is ApplicantTab =>
          value === "proposer" || value === "lifeassured1" || value === "lifeassured2",
        )
      : [];
  } catch {
    return [];
  }
};

export const formatApplicantTabLabels = (tabs: ApplicantTab[]): string => {
  const labels = tabs.map((tab) => APPLICANT_TAB_LABELS[tab] ?? tab);

  if (labels.length <= 1) return labels[0] ?? "applicant section";
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;

  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
};

export const syncRequiredApplicantTabs = (drsData: unknown): ApplicantTab[] => {
  const requiredTabs = getRequiredApplicantTabs(drsData);
  localStorage.setItem(DRS_REQUIRED_APPLICANT_TABS_KEY, JSON.stringify(requiredTabs));

  const requiredSet = new Set(requiredTabs);
  const visitedTabs = getStoredApplicantTabs(DRS_VISITED_APPLICANT_TABS_KEY)
    .filter((tab) => requiredSet.has(tab));
  localStorage.setItem(DRS_VISITED_APPLICANT_TABS_KEY, JSON.stringify(visitedTabs));

  window.dispatchEvent(new Event(DRS_TAB_VISIT_EVENT));
  return requiredTabs;
};

export const markApplicantTabVisited = (tab: ApplicantTab): void => {
  const requiredTabs = getStoredApplicantTabs(DRS_REQUIRED_APPLICANT_TABS_KEY);
  if (!requiredTabs.includes(tab)) {
    return;
  }

  const visitedTabs = getStoredApplicantTabs(DRS_VISITED_APPLICANT_TABS_KEY);
  if (visitedTabs.includes(tab)) {
    return;
  }

  localStorage.setItem(DRS_VISITED_APPLICANT_TABS_KEY, JSON.stringify([...visitedTabs, tab]));
  window.dispatchEvent(new Event(DRS_TAB_VISIT_EVENT));
};

export const validateApplicantTabsVisited = (drsData: unknown): { isValid: boolean; message: string } => {
  const requiredTabs = getRequiredApplicantTabs(drsData);
  if (requiredTabs.length <= 1) {
    return { isValid: true, message: "" };
  }

  const visitedTabs = getStoredApplicantTabs(DRS_VISITED_APPLICANT_TABS_KEY);
  const pendingTabs = requiredTabs.filter((tab) => !visitedTabs.includes(tab));

  if (pendingTabs.length === 0) {
    return { isValid: true, message: "" };
  }

  return {
    isValid: false,
    message: getErrorMessage("drsApplicantTabsPending", {
      tabs: formatApplicantTabLabels(pendingTabs),
    }),
  };
};