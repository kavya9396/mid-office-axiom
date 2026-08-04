export const defaultErrorMessages = {
  drsFinalBreFailure:
    "Final BRE is failed. Please retrigger BRE before performing any action on this case.",
  drsApplicantTabsPending: "Please visit {tabs} before taking decision.",
  drsApplicantTabsNotVisited: "Please visit all applicant tabs at least once before submitting.",
  drsPendingRequirements:
    "Pending requirements are available. Please select Raise Requirement before taking another decision.",
  drsUnsavedRequirementChanges:
    "Please save Requirement Management changes before taking decision.",
  financialAtLeastOneMonthMandatory: "At least one month data is mandatory.",
  financialFieldMandatory: "This field is mandatory.",
  financialNumericValue: "Enter a numeric value.",
  financialDateFormat: "Enter date in DD/MM/YYYY format.",
  financialValidDate: "Enter a valid date.",
  financialFutureDateNotAllowed: "Future date is not allowed.",
  applicantValidPan: "Enter a valid PAN number (e.g. ABCDE1234F)",
  applicantValidVoterId: "Enter a valid Voter ID (e.g. ABC1234567)",
  applicantValidAadhaar: "Enter a valid Aadhaar number (12 digits)",
  applicantValidPassport: "Enter a valid Passport number (e.g. A1234567)",
  applicantValidDrivingLicense: "Enter a valid Driving License number",
} as const;

export type ErrorMessageKey = keyof typeof defaultErrorMessages;
export type ErrorMessageConfig = Partial<Record<ErrorMessageKey, string>>;

let configuredErrorMessages: ErrorMessageConfig = {};

const isErrorMessageKey = (key: string): key is ErrorMessageKey =>
  Object.prototype.hasOwnProperty.call(defaultErrorMessages, key);

const normalizeErrorMessages = (value: unknown): ErrorMessageConfig => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<ErrorMessageConfig>(
    (messages, [key, message]) => {
      if (isErrorMessageKey(key) && typeof message === "string" && message.trim()) {
        messages[key] = message;
      }

      return messages;
    },
    {},
  );
};

export const initializeErrorMessages = async (): Promise<void> => {
  try {
    const response = await fetch(`/config/errorMessages.json?t=${Date.now()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    configuredErrorMessages = normalizeErrorMessages(await response.json());
  } catch {
    configuredErrorMessages = {};
  }
};

export const getErrorMessage = (
  key: ErrorMessageKey,
  params: Record<string, string> = {},
): string => {
  const template = configuredErrorMessages[key] ?? defaultErrorMessages[key];

  return Object.entries(params).reduce(
    (message, [paramKey, value]) => message.replaceAll(`{${paramKey}}`, value),
    template,
  );
};