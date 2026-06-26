export type FinancialField = {
  label: string;
  value?: string | number | boolean;
};

export type FinancialSectionKey =
  | "advanceTaxChallan"
  | "appointmentLetter"
  | "caCertifiedBalanceSheet"
  | "caCertifiedNetWorthStatement"
  | "commissionStatement"
  | "computationOfIncome"
  | "creditCards"
  | "fixedDepositReceipt"
  | "form16"
  | "form16a"
  | "formJ"
  | "governmentOfIndiaBonds"
  | "incomeTaxReturnNonIndividual"
  | "incomeTaxReturnIndividual"
  | "loanStatements"
  | "mutualFundAccountStatement"
  | "pensionStatement"
  | "profitAndLossAccount"
  | "propertyPurchaseDocuments"
  | "propertyValuationReport"
  | "salaryCertificate"
  | "salaryRevisionLetter"
  | "salarySlips"
  | "savingsAccountStatements"
  | "stockHoldingStatement"
  | "vehicleOwnershipPapers"
  | "vahan"
  | "sipStatement"
  | "gstIncome"
  | "bankStatementSalaryCredit"
  | "epfBasic"
  | "epfAdvanced";

export type FinancialSectionConfig = {
  key: FinancialSectionKey;
  title: string;
  columns?: number;
  items: FinancialField[];
};

const section = (
  key: FinancialSectionKey,
  title: string,
  items: FinancialField[],
  columns = 3,
): FinancialSectionConfig => ({
  key,
  title,
  columns,
  items,
});

export const financialSections: FinancialSectionConfig[] = [
  section("advanceTaxChallan", "ADVANCE TAX CHALLAN", [
    { label: "Assesse", value: "No" },
    { label: "Period", value: "No" },
    { label: "Advance Tax", value: "No" },
    { label: "Total Tax Liability", value: "No" },
    { label: "Derived Income", value: "Yes" },
  ]),
  section("appointmentLetter", "Appointment Letter / Contract of Employer", [
    { label: "Gross Salary PA", value: "Yes" },
  ]),
  section("caCertifiedBalanceSheet", "CA Certified Balance Sheet", [
    { label: "Is Balance Sheet in the name of LA", value: "No" },
    { label: "Fixed Assets", value: "No" },
    { label: "Other Investments", value: "No" },
    { label: "Cash", value: "No" },
    { label: "Banks", value: "No" },
    { label: "Secured Loans", value: "No" },
    { label: "Net Worth", value: "No" },
    { label: "Derived Income", value: "Yes" },
    { label: "Average Income", value: "Auto calculate" },
  ]),
  section("caCertifiedNetWorthStatement", "CA Certified Net Worth Statement", [
    { label: "Is Net Worth Statement in the name of LA", value: "No" },
    { label: "Is Certified by CA", value: "No" },
    { label: "Net Worth as per Statement", value: "No" },
    { label: "Income Earned", value: "No" },
    { label: "Derived Income", value: "Yes" },
    { label: "Average Income", value: "Auto calculate" },
  ]),
  section("commissionStatement", "Commission Statement", [
    { label: "Month 1", value: "at least One month data Mandatory" },
    { label: "Month 2", value: "" },
    { label: "Month 3", value: "" },
    { label: "Month 4", value: "" },
    { label: "Month 5", value: "" },
    { label: "Month 6", value: "" },
    { label: "Average commission pm", value: "Auto calculate" },
    { label: "Average Annual Income", value: "Auto calculate" },
  ], 4),
  section("computationOfIncome", "Computation Of Income", [
    { label: "Assessment Year", value: "at least One Year data Mandatory" },
    { label: "Income from Salary(A)", value: "atleast Income from salary or Income from Business or Exempt Income mandatory" },
    { label: "Income from House Property", value: "No" },
    { label: "Income from Business or Profession (B)", value: "atleast Income from salary or Income from Business or Exempt Income mandatory" },
    { label: "Short term & Capital Gains", value: "No" },
    { label: "Income from Other Sources", value: "No" },
    { label: "Agricultural Income", value: "No" },
    { label: "Exempt Income(C)", value: "atleast Income from salary or Income from Business or Exempt Income mandatory" },
    { label: "Gross Total Income", value: "Auto calculate" },
    { label: "Total Gross Total Income", value: "Auto calculate" },
    { label: "Average Gross Total Income", value: "Auto calculate" },
  ], 2),
  section("creditCards", "Credit Cards", [
    { label: "Is Credit card statement in the name of LA", value: "No" },
    { label: "Is LA Defaulter in the Payment", value: "No" },
    { label: "Type of Card", value: "No" },
    { label: "Credit Limit", value: "Yes" },
    { label: "Points Earned", value: "No" },
    { label: "Income Earned", value: "No" },
    { label: "Derived Income", value: "Auto calculate" },
    { label: "Average Income", value: "Auto calculate" },
  ]),
  section("fixedDepositReceipt", "Fixed Deposit Receipt", [
    { label: "Is Fixed Deposit Receipt in the name of LA", value: "No" },
    { label: "Is Fixed Deposit Receipts matured", value: "No" },
    { label: "Amount Invested", value: "Yes" },
    { label: "Income Earned", value: "No" },
    { label: "Derived Income", value: "Auto calculate" },
    { label: "Average Income", value: "Auto calculate" },
  ]),
  section("form16", "FORM 16", [
    { label: "Entity", value: "Year 1 | Year 2 | Year 3" },
    { label: "ASSESSMENT", value: "at least One Year data Mandatory" },
    { label: "Gross Salary PA", value: "Yes" },
    { label: "Average Annual Income", value: "Auto calculate" },
    { label: "Life Assured Pan No", value: "Yes" },
    { label: "Life Assured Name", value: "Yes" },
    { label: "Is Life Assured Name Same With Doc Name?", value: "No" },
    { label: "Company Name", value: "Yes" },
  ], 3),
  section("form16a", "FORM 16 A", [
    { label: "Assessment Year", value: "at least One Year data Mandatory" },
    { label: "Net Receipt pa", value: "Yes" },
    { label: "Average Annual Income", value: "Auto calculate" },
  ]),
  section("formJ", "FORM J", [
    { label: "Is Form J in the name of LA", value: "" },
    { label: "Month 1", value: "at least One month and one receipt data Mandatory" },
    { label: "Month 2", value: "" },
    { label: "Month 3", value: "" },
    { label: "Total Receipts", value: "Auto calculate" },
    { label: "Average Monthly Receipts", value: "Auto calculate" },
    { label: "Annual Receipts", value: "Auto calculate" },
    { label: "Derived Income", value: "Auto calculate" },
  ]),
  section("governmentOfIndiaBonds", "Govt. Of India Bonds", [
    { label: "Is Bond Certification in the name of LA", value: "No" },
    { label: "Is Bond Certificate matured", value: "No" },
    { label: "Amount Invested or Maturity Value, whichever higher", value: "Yes" },
    { label: "Income Earned", value: "No" },
    { label: "Derived Income", value: "Auto calculate" },
    { label: "Average Income", value: "Auto calculate" },
  ]),
  section("incomeTaxReturnNonIndividual", "Income Tax Return (Non-Individual)", [
    { label: "Name of Organisation/Firm", value: "No" },
    { label: "Permanent Account Number", value: "No" },
    { label: "ITR Acknowledgement Number", value: "No" },
    { label: "Assessment Year", value: "at least One Year data Mandatory" },
    { label: "Income from Salary", value: "atleast one field data Mandatory" },
    { label: "Income from House Property", value: "" },
    { label: "Income from Business or Profession", value: "" },
    { label: "Short term & Capital Gains", value: "" },
    { label: "Income from Other Sources", value: "" },
    { label: "Agricultural Income", value: "" },
    { label: "Exempt Income", value: "" },
    { label: "Gross Total Income", value: "Auto calculate" },
    { label: "Total Gross Total Income", value: "Auto calculate" },
    { label: "Average Gross Total Income", value: "Auto calculate" },
  ], 2),
  section("incomeTaxReturnIndividual", "Income Tax Return (Individual)", [
    { label: "Name of Organisation/Firm", value: "No" },
    { label: "Permanent Account Number", value: "No" },
    { label: "ITR Acknowledgement Number", value: "No" },
    { label: "Assessment Year", value: "at least One Year data Mandatory" },
    { label: "Date of Filling ITR", value: "No" },
    { label: "Income from Salary(A)", value: "atleast Income from salary or Income from Business or Exempt Income" },
    { label: "Income from House Property", value: "No" },
    { label: "Income from Business or Profession(B)", value: "atleast Income from salary or Income from Business or Exempt Income" },
    { label: "Short term & Capital Gains", value: "No" },
    { label: "Income from Other Sources", value: "No" },
    { label: "Agricultural Income", value: "No" },
    { label: "Exempt Income(C)", value: "atleast Income from salary or Income from Business or Exempt Income" },
    { label: "Gross Total Income(A+B+C)", value: "Auto calculate" },
    { label: "Total Gross Total Income", value: "Auto calculate" },
    { label: "Average Gross Total Income", value: "Auto calculate" },
    { label: "PF deduction - Salaried customers", value: "No" },
    { label: "Life Assured Name", value: "Yes" },
    { label: "Is Life Assured Name Same?", value: "Yes" },
  ], 2),
  section("loanStatements", "Loan Statements", [
    { label: "Is Loan Statements in the name of LA", value: "No" },
    { label: "Is LA Defaulter in the Payment", value: "No" },
    { label: "Monthly EMI as per Schedule", value: "Yes" },
    { label: "Income Earned", value: "No" },
    { label: "Derived Income", value: "Auto calculate" },
    { label: "Average Income", value: "Auto calculate" },
  ]),
  section("mutualFundAccountStatement", "Mutual Fund A/C Statement", [
    { label: "Is Mutual Fund Statement in the name of LA", value: "No" },
    { label: "Latest Market Value (as per NAV) in Statement", value: "Yes" },
    { label: "Income Earned", value: "No" },
    { label: "Derived Income", value: "Auto calculate" },
    { label: "Average Income", value: "Auto calculate" },
  ]),
  section("pensionStatement", "PENSION STATEMENT", [
    { label: "Total Monthly Pension", value: "Yes" },
    { label: "Pension Received pa", value: "Auto calculate" },
  ]),
  section("profitAndLossAccount", "Profit & Loss A/C", [
    { label: "Name of Organization/Firm", value: "Yes" },
    { label: "As Per Accounts of Proposer Co.", value: "Year 1 | Year 2 | Year 3" },
    { label: "Assessment Year", value: "at least One Year data Mandatory" },
    { label: "Shareholders Funds / Partners Capital", value: "" },
    { label: "Share Capital or Fixed/Fluctuating Capital", value: "No" },
    { label: "Reserves & Surplus", value: "No" },
    { label: "Total Shareholders Funds or Partner's Fund", value: "No" },
    { label: "Profit Before Depreciation & Tax (PBDT)", value: "No" },
    { label: "Less : Depreciation", value: "No" },
    { label: "Profit Before Tax (PBT)", value: "No" },
    { label: "Tax", value: "No" },
    { label: "Profit After Tax (PAT)", value: "Yes" },
    { label: "Profit After Tax of Last Year", value: "No" },
    { label: "Rise In Profit as compared to Last Year", value: "No" },
    { label: "% Rise In Profit as compared to Last Year", value: "No" },
    { label: "Sales", value: "No" },
    { label: "Sales of Last Year", value: "No" },
    { label: "Rise In Sales as compared to Last Year", value: "No" },
    { label: "% Rise In Sales as compared to Last Year", value: "No" },
    { label: "Average Gross Income", value: "Auto calculate" },
    { label: "Average Profit Before Tax", value: "No" },
    { label: "Average Profit After Tax", value: "No" },
  ], 2),
  section("propertyPurchaseDocuments", "Property Purchase Documents", [
    { label: "Is Property purchased by LA", value: "No" },
    { label: "Purchase Price", value: "Yes" },
    { label: "Financial Year of Purchase", value: "No" },
    { label: "Estimated Market Value of Property", value: "No" },
    { label: "Derived Income", value: "Auto calculate" },
  ]),
  section("propertyValuationReport", "Property Valuation Report", [
    { label: "Is Property Valuation Report in the name of LA", value: "No" },
    { label: "Estimated Market Value of Property(as per report)", value: "Yes" },
    { label: "Derived Income", value: "Auto calculate" },
  ]),
  section("salaryCertificate", "Salary Certificate", [
    { label: "Gross Salary PA", value: "Yes" },
  ]),
  section("salaryRevisionLetter", "Salary Revision Letter", [
    { label: "Gross Salary PA", value: "Yes" },
  ]),
  section("salarySlips", "SALARY SLIPS", [
    { label: "Gross Salary Pm1", value: "at least One month data Mandatory" },
    { label: "Gross Salary Pm2", value: "" },
    { label: "Gross Salary Pm3", value: "" },
    { label: "Gross Salary Pm4", value: "" },
    { label: "Gross Salary Pm5", value: "" },
    { label: "Gross Salary Pm6", value: "" },
    { label: "Average Salary pm", value: "Auto calculate" },
    { label: "Gross Salary pa", value: "Auto calculate" },
    { label: "Annual Bonus/Incentive/Reimbursement", value: "No" },
    { label: "Average Annual Income", value: "Auto calculate" },
    { label: "Company Name", value: "Yes" },
    { label: "Life Assured Name", value: "Yes" },
    { label: "Is Life Assured Name Same?", value: "Yes" },
    { label: "PF / UAN No", value: "No" },
  ], 2),
  section("savingsAccountStatements", "Savings A/C & Current A/C Bank Statements", [
    { label: "Is Bank Statement in the name of LA/his Business", value: "Yes" },
    { label: "Latest 6 months statements given", value: "Yes" },
    { label: "Any Overdraft(Negative/Debit) Balances", value: "Yes" },
    { label: "Monthly Closing Bal 1", value: "at least One month data Mandatory" },
    { label: "Monthly Closing Bal 2", value: "" },
    { label: "Monthly Closing Bal 3", value: "" },
    { label: "Monthly Closing Bal 4", value: "" },
    { label: "Monthly Closing Bal 5", value: "" },
    { label: "Monthly Closing Bal 6", value: "" },
    { label: "Average Bank Balance", value: "Auto calculate" },
    { label: "Average Annual income", value: "Auto calculate" },
    { label: "Opening Balance", value: "Yes" },
    { label: "Statement Period", value: "Yes" },
    { label: "Life Assured Name", value: "Yes" },
    { label: "Is LA Name Match with Doc Name?", value: "Yes" },
    { label: "Life Insurance Premium Deduction Entry", value: "No" },
    { label: "Wine Beer_Entries", value: "No" },
    { label: "Med Entry", value: "No" },
  ], 2),
  section("stockHoldingStatement", "Stock Holding Statement", [
    { label: "Is Stock Holding Statement in name of LA/his Business", value: "No" },
    { label: "Gross Total Market Value as per the Stmt", value: "Yes" },
    { label: "Income Earned", value: "No" },
    { label: "Derived Income", value: "Auto calculate" },
    { label: "Average Income", value: "Auto calculate" },
  ]),
  section("vehicleOwnershipPapers", "Vehicle Ownership Papers", [
    { label: "Is Registration Papers in the name of LA", value: "No" },
    { label: "Is Purchase invoices in the name of LA", value: "No" },
    { label: "Purchase Price", value: "Yes" },
    { label: "Vehicle RC Number", value: "No" },
    { label: "Derived Income", value: "Auto calculate" },
  ]),
  section("vahan", "Vahan", [
    { label: "Is Registration Papers in the Name of LA", value: "Yes" },
    { label: "Is Purchase Invoices in the Name of LA", value: "Yes" },
    { label: "Car RC Number", value: "No" },
    { label: "IDV", value: "Yes" },
    { label: "Average Annual Income", value: "Auto calculate" },
  ]),
  section("sipStatement", "SIP Statement", [
    { label: "Latest 6 Months SIP Statements Given", value: "Yes" },
    { label: "Is SIP Statements in the Name of LA", value: "Yes" },
    { label: "SIP of Month1", value: "Yes" },
    { label: "SIP Per Month 1", value: "Yes" },
    { label: "SIP of Month2", value: "Yes" },
    { label: "SIP Per Month2", value: "Yes" },
    { label: "SIP of Month 3", value: "Yes" },
    { label: "SIP Per Month 3", value: "Yes" },
    { label: "SIP of Month 4", value: "Yes" },
    { label: "SIP Per Month4", value: "Yes" },
    { label: "SIP of Month5", value: "Yes" },
    { label: "SIP Per Month 5", value: "Yes" },
    { label: "SIP of Month 6", value: "Yes" },
    { label: "SIP Per Month 6", value: "Yes" },
    { label: "Average Monthly SIP", value: "Auto calculate" },
    { label: "Average Annual Income", value: "Auto calculate" },
  ], 2),
  section("gstIncome", "GST Income", [
    { label: "Assessment Year", value: "at least one year details in GST Income!" },
    { label: "Gross Sales", value: "Yes" },
    { label: "Gross Purchases", value: "No" },
    { label: "Profit After GST", value: "No" },
    { label: "Total of Gross Sales", value: "Auto calculate" },
    { label: "Average Gross Sales", value: "Auto calculate" },
    { label: "Average Annual Income", value: "Auto calculate" },
  ]),
  section("bankStatementSalaryCredit", "Bank Statement with Salary Credit Details", [
    { label: "Is Bank Statement in the Name of LA", value: "Yes" },
    { label: "Net Salary Month1", value: "at least One month data Mandatory" },
    { label: "Net Salary Credited PM1", value: "at least One month data Mandatory" },
    { label: "Net Salary Month 2", value: "" },
    { label: "Net Salary Credited PM2", value: "" },
    { label: "Net Salary Month 3", value: "" },
    { label: "Net Salary Credited PM3", value: "" },
    { label: "Net Salary Month 4", value: "" },
    { label: "Net Salary Credited PM4", value: "" },
    { label: "Net Salary Month 5", value: "" },
    { label: "Net Salary Credited PM 5", value: "" },
    { label: "Net Salary Month 6", value: "" },
    { label: "Net Salary Credited PM 6", value: "" },
    { label: "Average Net Salary Credited PM", value: "Auto calculate" },
    { label: "Net Salary Credited PA", value: "Auto calculate" },
    { label: "Annual Bonus /Incentive /Reimbursement", value: "No" },
    { label: "Average Annual Income", value: "Auto calculate" },
    { label: "Salary Credited", value: "No" },
    { label: "Opening Balance", value: "Yes" },
    { label: "Closing Balance", value: "No" },
    { label: "Statement Period", value: "Yes" },
    { label: "Life Assured Name", value: "Yes" },
    { label: "Is LA Name Match with Doc Name?", value: "Yes" },
  ], 2),
  section("epfBasic", "EMPLOYEE PROVIDENT FUND - BASIC", [
    { label: "Latest Organization Name", value: "Yes" },
    { label: "Is Organization Name Same?", value: "Yes" },
    { label: "Income", value: "Yes" },
  ]),
  section("epfAdvanced", "EMPLOYEE PROVIDENT FUND - ADVANCED", [
    { label: "Latest Organization Name", value: "Yes" },
    { label: "Is Organization Name Same?", value: "Yes" },
    { label: "PF Contribution M1", value: "Yes" },
    { label: "PF Contribution M2", value: "Yes" },
    { label: "PF Contribution M3", value: "Yes" },
    { label: "PF Contribution M4", value: "Yes" },
    { label: "PF Contribution M5", value: "Yes" },
    { label: "PF Contribution M6", value: "Yes" },
    { label: "Annual Income", value: "Auto calculate" },
  ], 2),
];

export const financialSectionOptions = financialSections.map((section) => ({
  key: section.key,
  label: section.title,
}));
