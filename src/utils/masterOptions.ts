import type { MasterOption } from "../types/drs.types";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

const toText = (value: unknown): string => String(value ?? "").trim();

export const normalizeMasterOptions = (options?: MasterOption[]): SelectOption[] =>
  (options ?? [])
    .map((option) => {
      const code = toText(option.code);
      const key = toText(option.key);
      const value = toText(option.value);
      const description = toText(option.description);
      const label = description || toText(option.label) || value || code || key;

      return {
        label,
        value: code || key || value || label,
        disabled: option.disabled ?? toText(option.isActive).toUpperCase() === "N",
      };
    })
    .filter((option) => option.label && option.value);

export const toMasterKey = (value: string, options: SelectOption[]): string => {
  const textValue = toText(value);
  const selectedOption = options.find(
    (option) => option.value === textValue || option.label === textValue,
  );

  return selectedOption?.value ?? textValue;
};

export const toMasterLabel = (value: string, options: SelectOption[]): string => {
  const textValue = toText(value);
  const selectedOption = options.find(
    (option) => option.value === textValue || option.label === textValue,
  );

  return selectedOption?.label ?? textValue;
};
