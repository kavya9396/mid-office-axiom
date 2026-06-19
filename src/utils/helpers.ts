import type { FieldProps } from "../types/drs.types";

export const toMap = (arr: FieldProps[]): Record<string, string> =>
  Object.fromEntries(arr.map((item) => [item.label, item.value]));

type FieldConfig<T, K extends keyof T = keyof T> = {
    label: string;
    key: K;
    format?: (value: T[K]) => string;
};

type AnyFieldConfig<T> = {
    [K in keyof T]: FieldConfig<T, K>
}[keyof T];

export const buildFields = <T,>(
    data: T | undefined,
    fields: readonly AnyFieldConfig<T>[]
) => {
    return fields.map((field) => {
        const rawValue = data?.[field.key];

        return {
            label: field.label,
            value: field.format
                ? field.format(rawValue as T[typeof field.key])
                : (rawValue ?? "-"),
        };
    });
};

export const formatCurrencyINR = (value: number | null | undefined) => value != null ? `₹ ${value.toLocaleString("en-IN")}` : "-";
export const formatPhone = (value?: string) => value ? `+91 ${value}` : "-";

type PairFieldConfig<T> = {
    left: {
        label: string;
        key: keyof T;
        format?: (value: T[keyof T]) => string;
    };
    right: {
        label: string;
        key: keyof T;
        format?: (value: T[keyof T]) => string;
    };
};

export const buildPairFields = <T,>(
    data: T | undefined,
    rows: PairFieldConfig<T>[]
) => {
    return rows.map((row) => {
        const leftRaw = data?.[row.left.key];
        const rightRaw = data?.[row.right.key];

        return {
            leftLabel: row.left.label,
            leftValue: row.left.format
                ? row.left.format(leftRaw as T[keyof T])
                : (leftRaw ?? "-"),

            rightLabel: row.right.label,
            rightValue: row.right.format
                ? row.right.format(rightRaw as T[keyof T])
                : (rightRaw ?? "-"),
        };
    });
};

type MaskOptions = {
  visibleStart?: number;
  visibleEnd?: number;
  maskChar?: string;
};

/**
 * Generic mask function for sensitive strings (PAN, Aadhaar, etc.)
 */
export const maskString = (
  value?: string,
  options: MaskOptions = {}
): string => {
  if (!value) return "";

  const {
    visibleStart = 0,
    visibleEnd = 0,
    maskChar = "X",
  } = options;

  const str = value.trim();
  const len = str.length;

  if (len <= visibleStart + visibleEnd) {
    return maskChar.repeat(len);
  }

  const start = str.slice(0, visibleStart);
  const end = str.slice(len - visibleEnd);
  const maskedPart = maskChar.repeat(len - visibleStart - visibleEnd);

  return `${start}${maskedPart}${end}`;
};

export const maskPAN = (pan?: string) => maskString(pan, { visibleStart: 2, visibleEnd: 2 });
export const maskAadhaar = (aadhaar?: string) => maskString(aadhaar, { visibleStart: 0, visibleEnd: 4 });

export const maskSensitive = (
  value: string,
  start = 0,
  end = 4
) => {
  if (!value) return "-";
  if (value.length <= start + end) return value;

  return (
    value.slice(0, start) +
    "*".repeat(value.length - start - end) +
    value.slice(-end)
  );
};

export const formatDOB = (dob: string): string => {
  if (!dob) return "";
  const [dd, mm, yyyy] = dob.split("-");
  return `${yyyy}-${mm}-${dd}`;
};

type TripleFieldConfig<T> = {
    first: {
        label: string;
        key: keyof T;
        format?: (value: T[keyof T]) => string;
    };
    second: {
        label: string;
        key: keyof T;
        format?: (value: T[keyof T]) => string;
    };
    third: {
        label: string;
        key: keyof T;
        format?: (value: T[keyof T]) => string;
    };
};


export const buildTripleFields = <T,>(
    data: T | undefined,
    rows: TripleFieldConfig<T>[]
) => {
    return rows.map((row) => {
        const firstRaw = data?.[row.first.key];
        const secondRaw = data?.[row.second.key];
        const thirdRaw = data?.[row.third.key];

        return {
            firstLabel: row.first.label,
            firstValue: row.first.format
                ? row.first.format(firstRaw as T[keyof T])
                : (firstRaw ?? "-"),

            secondLabel: row.second.label,
            secondValue: row.second.format
                ? row.second.format(secondRaw as T[keyof T])
                : (secondRaw ?? "-"),

            thirdLabel: row.third.label,
            thirdValue: row.third.format
                ? row.third.format(thirdRaw as T[keyof T])
                : (thirdRaw ?? "-"),
        };
    });
};