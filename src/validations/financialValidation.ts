import { getErrorMessage } from "../config/errorMessages";

export type FinancialFieldInputType = "freeText" | "numeric" | "dateDDMMYYYY";

export type FinancialFieldRule = {
  inputType?: FinancialFieldInputType;
  isMandatory?: boolean;
  allowFutureDate?: boolean;
};

const financialFieldRules: Record<string, Record<string, FinancialFieldRule>> = {
  appointment_letter: {
    "Name of the company": { inputType: "freeText", isMandatory: false },
    "Name of the employee": { inputType: "freeText", isMandatory: false },
    "Joining Date": { inputType: "dateDDMMYYYY", isMandatory: true, allowFutureDate: false },
    CTC: { inputType: "numeric", isMandatory: true },
  },
  commission_statement: {
    "Month 1": { inputType: "numeric" },
    "Month 2": { inputType: "numeric" },
    "Month 3": { inputType: "numeric" },
    "Month 4": { inputType: "numeric" },
    "Month 5": { inputType: "numeric" },
    "Month 6": { inputType: "numeric" },
  },
};

export const getFinancialFieldRule = (sectionKey: string, label: string) =>
  financialFieldRules[sectionKey]?.[label];

export const validateFinancialSectionValues = (
  sectionKey: string,
  values: Record<string, string>,
) => {
  if (sectionKey !== "commission_statement") {
    return {};
  }

  const hasMonthValue = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"].some(
    (label) => values[label]?.trim()
  );

  return hasMonthValue ? {} : { "Month 1": getErrorMessage("financialAtLeastOneMonthMandatory") };
};

export const validateFinancialFieldValue = (
  value: string,
  rule?: FinancialFieldRule,
) => {
  const trimmedValue = value.trim();

  if (rule?.isMandatory && !trimmedValue) {
    return getErrorMessage("financialFieldMandatory");
  }

  if (!trimmedValue) {
    return "";
  }

  if (rule?.inputType === "numeric" && !/^-?\d+(\.\d+)?$/.test(trimmedValue)) {
    return getErrorMessage("financialNumericValue");
  }

  if (rule?.inputType === "dateDDMMYYYY") {
    const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmedValue);

    if (!match) {
      return getErrorMessage("financialDateFormat");
    }

    const [, dayText, monthText, yearText] = match;
    const day = Number(dayText);
    const month = Number(monthText);
    const year = Number(yearText);
    const parsedDate = new Date(year, month - 1, day);

    if (
      parsedDate.getFullYear() !== year ||
      parsedDate.getMonth() !== month - 1 ||
      parsedDate.getDate() !== day
    ) {
      return getErrorMessage("financialValidDate");
    }

    if (rule.allowFutureDate === false) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (parsedDate.getTime() > today.getTime()) {
        return getErrorMessage("financialFutureDateNotAllowed");
      }
    }
  }

  return "";
};