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
      const key = toText(option.key);
      const value = toText(option.value);
      const label = toText(option.label) || value || key;

      return {
        label,
        value: key || value || label,
        disabled: option.disabled,
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
