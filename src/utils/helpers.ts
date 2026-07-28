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

export const formatCurrencyINR = (value: number | string | null | undefined) => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
        return String(value);
    }

    return `₹ ${numericValue.toLocaleString("en-IN")}`;
};
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

export const formatDOB = (dob?: string): string => {
    if (!dob) return "";

    const value = dob.trim();

    // Handle API values like 1999-07-07T00:00:00.0 by taking the date portion.
    const isoDatePart = value.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(isoDatePart)) {
        return isoDatePart;
    }

    // Fallback for legacy dd-mm-yyyy values.
    const [dd, mm, yyyy] = value.split("-");
    if (dd && mm && yyyy) {
        return `${yyyy}-${mm}-${dd}`;
    }

    return "";
};

export const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return "th";

    const remainder = day % 10;
    if (remainder === 1) return "st";
    if (remainder === 2) return "nd";
    if (remainder === 3) return "rd";
    return "th";
};

export const formatDateWithOrdinalTime = (value: unknown) => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "";
    const dtf = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
    const parts = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]));
    const day = Number(parts.day || date.getDate());
    const month = parts.month || date.toLocaleString("en-GB", { month: "long", timeZone: "Asia/Kolkata" });
    const year = parts.year || date.getFullYear();
    const hour = parts.hour || "";
    const minute = parts.minute || "";
    const dayPeriod = (parts.dayPeriod || "").toUpperCase();

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}, ${hour}:${minute} ${dayPeriod}`;
};

/**
 * Format date for UI as: "28 Jul 2026, 8:40:35 am"
 */
export const formatDateForUI = (value: unknown): string => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return "";
    const dtf = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
    });
    const parts = Object.fromEntries(dtf.formatToParts(date).map((p) => [p.type, p.value]));

    const day = parts.day || String(date.getDate()).padStart(2, "0");
    const monthShort = parts.month || date.toLocaleString("en-GB", { month: "short", timeZone: "Asia/Kolkata" });
    const year = parts.year || date.getFullYear();
    const hour = parts.hour || "";
    const minute = parts.minute || "00";
    const second = parts.second || "00";
    const dayPeriod = (parts.dayPeriod || "").toLowerCase();

    return `${Number(day)} ${monthShort} ${year}, ${hour}:${minute}:${second} ${dayPeriod}`;
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

export const toDisplayValue = (value: unknown): string => {
  const text = String(value ?? "").trim();
  return text || "-";
};

export const withDashFallback = (items: Array<{ label: string; value: unknown }>) =>
    items.map((item) => ({
        ...item,
        value: toDisplayValue(item.value),
    }));