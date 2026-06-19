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