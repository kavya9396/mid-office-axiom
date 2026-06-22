export const toFilterComparableValue = (value: unknown): string => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (value == null) return "";
  return String(value);
};
