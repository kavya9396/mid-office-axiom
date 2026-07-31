import type { MasterOption } from "../types/drs.types";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
  description?: string;
  code?: string;
};

const toText = (value: unknown): string => String(value ?? "").trim();

const normalizeForMatch = (s: unknown) =>
  toText(s)
    .toLowerCase()
    // remove common suffixes/words that don't affect identity
    .replace(/\b(card|proof|certificate|number|no|id|type)\b/g, "")
    // remove non-alphanumeric
    .replace(/[^a-z0-9]+/g, "")
    .trim();

const toMasterOptionList = (options?: unknown): MasterOption[] => {
  if (Array.isArray(options)) {
    return options as MasterOption[];
  }

  if (!options || typeof options !== "object") {
    return [];
  }

  const optionRecord = options as Record<string, unknown>;

  if (Array.isArray(optionRecord.data)) {
    return optionRecord.data as MasterOption[];
  }

  if (Array.isArray(optionRecord.options)) {
    return optionRecord.options as MasterOption[];
  }

  if (Array.isArray(optionRecord.values)) {
    return optionRecord.values as MasterOption[];
  }

  return Object.values(optionRecord).flatMap((value) => (Array.isArray(value) ? value as MasterOption[] : []));
};

export const normalizeMasterOptions = (options?: unknown): SelectOption[] =>
  toMasterOptionList(options)
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

  if (selectedOption) return selectedOption.value;

  // Fallback: case-insensitive exact match
  const lower = textValue.toLowerCase();
  const ci = options.find((option) => option.value.toLowerCase() === lower || option.label.toLowerCase() === lower);
  if (ci) return ci.value;

  // Fallback: normalized fuzzy match (ignore punctuation, common words, minor spelling differences)
  const targetNorm = normalizeForMatch(textValue);
  if (targetNorm) {
    const normMatch = options.find((option) => {
      const vNorm = normalizeForMatch(option.value);
      const lNorm = normalizeForMatch(option.label);
      return vNorm === targetNorm || lNorm === targetNorm || vNorm.includes(targetNorm) || lNorm.includes(targetNorm) || targetNorm.includes(vNorm) || targetNorm.includes(lNorm);
    });

    if (normMatch) return normMatch.value;
  }

  return textValue;
};

export const normalizeDecisionOptions = (
  masters: unknown,
  masterKey: string,
  allowFallback = true,
  matchByCode = false,
): SelectOption[] => {
  try {
    const masterRecord = masters as Record<string, unknown> | undefined;
    const misc = masterRecord?.misc;

    const list = toMasterOptionList(misc);

    const keyBase = String(masterKey ?? "")
      .replace(/Decision$/i, "")
      .replace(/_/g, "")
      .toUpperCase();

    const candidates = list.filter((item) => {
      const record = item as Record<string, unknown>;
      if (matchByCode) {
        const code = toText(record.code ?? record.key ?? record.value ?? "").toUpperCase();
        return code === keyBase;
      }

      const t = toText(record.type ?? record.miscMastId ?? "");
      if (!t) return false;
      return t.toUpperCase() === keyBase || t.toUpperCase().includes(keyBase) || keyBase.includes(t.toUpperCase());
    });

    const mapped = candidates
      .map((option) => {
        const code = toText((option as Record<string, unknown>).code ?? (option as Record<string, unknown>).key ?? (option as Record<string, unknown>).value);
        const rawValue = toText((option as Record<string, unknown>).value ?? "");
        const description = toText((option as Record<string, unknown>).description ?? (option as Record<string, unknown>).label ?? option.code ?? "");
        const optionType = toText((option as Record<string, unknown>).type ?? (option as Record<string, unknown>).miscMastId ?? "");
        const isCuw = optionType.toUpperCase() === "CUW";
        const disabled = Boolean((option as Record<string, unknown>).disabled ?? toText((option as Record<string, unknown>).isActive).toUpperCase() === "N");

        if (!code && !description && !rawValue) return null;

        // For CUW type prefer showing the description; otherwise prefer `value` then description then code.
        return {
          label: isCuw ? (description || rawValue || code) : (rawValue || description || code),
          value: code || rawValue || description,
          disabled,
          description,
          code,
        } as SelectOption;
      })
      .filter(Boolean) as SelectOption[];

    if (mapped.length > 0) return mapped;

    if (!allowFallback) {
      return [];
    }

    // Fallback to legacy master collection if misc yields nothing
    const legacy = normalizeMasterOptions(masterRecord?.[masterKey]);
    return legacy;
  } catch {
    return [];
  }
};

export const toMasterLabel = (value: string, options: SelectOption[]): string => {
  const textValue = toText(value);
  const selectedOption = options.find(
    (option) => option.value === textValue || option.label === textValue,
  );

  if (selectedOption) return selectedOption.label;

  // Fallback: case-insensitive exact match
  const lower = textValue.toLowerCase();
  const ci = options.find((option) => option.value.toLowerCase() === lower || option.label.toLowerCase() === lower);
  if (ci) return ci.label;

  // Fallback: normalized fuzzy match
  const targetNorm = normalizeForMatch(textValue);
  if (targetNorm) {
    const normMatch = options.find((option) => {
      const vNorm = normalizeForMatch(option.value);
      const lNorm = normalizeForMatch(option.label);
      return vNorm === targetNorm || lNorm === targetNorm || vNorm.includes(targetNorm) || lNorm.includes(targetNorm) || targetNorm.includes(vNorm) || targetNorm.includes(lNorm);
    });

    if (normMatch) return normMatch.label;
  }

  return textValue;
};
