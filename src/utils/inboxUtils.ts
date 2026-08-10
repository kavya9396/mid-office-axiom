import type { RoleSection } from "../types/inboxTypes";


export const ROLE_SECTIONS: Record<
  string,
  RoleSection[]
> = {
  CVT_TASK: [
    {
      key: "drsSummary",
      label: "DRS Summary",
    },
    {
      key: "breDecision1",
      label: "BRE Decision",
    },
    {
      key: "summary",
      label: "Summary",
    },
    {
      key: "applicationOverview1",
      label: "Application Overview",
    },
    {
      key: "pivvSection",
      label: "PIVV Section",
    },
    {
      key: "requirementManagement",
      label: "Requirement Management",
    },
    {
      key: "decision",
      label: "Decision",
    },
    {
      key: "quickLinks",
      label: "Quick Links",
    },
  ],
};

const UPPERCASE_LABEL_PARTS =
  new Set([
    "ACCUITY",
    "AMR",
    "CMO",
    "COPS",
    "CPT",
    "CUW",
    "CVT",
    "DVT",
    "ECG",
    "GOPS",
    "GUW",
    "HOD",
    "IT",
    "MMT",
    "MR",
    "NMR",
    "PIVV",
    "RI",
    "SR",
    "SUW",
    "TMT",
    "UW",
  ]);

export const toDisplayLabel = (
  value: string,
): string => {
  return value
    .replace(/_/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => {
      const upperPart =
        part.toUpperCase();

      if (
        UPPERCASE_LABEL_PARTS.has(
          upperPart,
        )
      ) {
        return upperPart;
      }

      return (
        part.charAt(0).toUpperCase() +
        part.slice(1).toLowerCase()
      );
    })
    .join(" ");
};

export const normalizeRoleKey = (
  value: string,
): string => {
  return value
    .replace(/[\s_-]/g, "")
    .toUpperCase();
};