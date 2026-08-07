import { validateFinancialFieldValue } from "./financialValidation";

describe("financial date validation", () => {
  it("accepts ISO dates sent by the backend for financial date fields", () => {
    const result = validateFinancialFieldValue("2024-04-01", {
      inputType: "dateDDMMYYYY",
      allowFutureDate: false,
    });

    expect(result).toBe("");
  });

  it("accepts dd/mm/yyyy dates for financial date fields", () => {
    const result = validateFinancialFieldValue("01/04/2024", {
      inputType: "dateDDMMYYYY",
      allowFutureDate: false,
    });

    expect(result).toBe("");
  });
});
