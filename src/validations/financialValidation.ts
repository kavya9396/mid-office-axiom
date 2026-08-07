import { getErrorMessage } from "../config/errorMessages";

export type FinancialFieldInputType = "freeText" | "numeric" | "dateDDMMYYYY" | "financialYear" | "panNumber" | "yesNo" | "alphabetic" | "alphanumeric";

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
    "Month 1": { inputType: "numeric", isMandatory: true },
    "Month 2": { inputType: "numeric" },
    "Month 3": { inputType: "numeric" },
    "Month 4": { inputType: "numeric" },
    "Month 5": { inputType: "numeric" },
    "Month 6": { inputType: "numeric" },
  },
  computation_of_income: {
    "Assessment Year": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 2": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 3": { inputType: "financialYear", isMandatory: true },
    "Income from Salary(A)": { inputType: "numeric", isMandatory: true },
    "Income from Salary(A) Year 2": { inputType: "numeric" },
    "Income from Salary(A) Year 3": { inputType: "numeric" },
    "Income from House Property": { inputType: "numeric" },
    "Income from House Property Year 2": { inputType: "numeric" },
    "Income from House Property Year 3": { inputType: "numeric" },
    "Income from Business or Profession (B)": { inputType: "numeric", isMandatory: true },
    "Income from Business or Profession (B) Year 2": { inputType: "numeric" },
    "Income from Business or Profession (B) Year 3": { inputType: "numeric" },
    "Short term & Capital Gains": { inputType: "numeric" },
    "Short term & Capital Gains Year 2": { inputType: "numeric" },
    "Short term & Capital Gains Year 3": { inputType: "numeric" },
    "Income from Other Sources": { inputType: "numeric" },
    "Income from Other Sources Year 2": { inputType: "numeric" },
    "Income from Other Sources Year 3": { inputType: "numeric" },
    "Agricultural Income": { inputType: "numeric" },
    "Agricultural Income Year 2": { inputType: "numeric" },
    "Agricultural Income Year 3": { inputType: "numeric" },
    "Exempt Income(C)": { inputType: "numeric", isMandatory: true },
    "Exempt Income(C) Year 2": { inputType: "numeric" },
    "Exempt Income(C) Year 3": { inputType: "numeric" },
  },
  credit_card: {
    "Is Credit card statement in the name of LA": { inputType: "yesNo" },
    "Is LA Defaulter in the Payment": { inputType: "yesNo" },
    "Type of Card": { inputType: "alphabetic" },
    "Credit Limit": { inputType: "numeric", isMandatory: true },
    "Points Earned": { inputType: "numeric" },
    "Income Earned": { inputType: "numeric" },
  },
  fixed_deposit_receipt: {
    "Is Fixed Deposit Receipt in the name of LA": { inputType: "yesNo" },
    "Is Fixed Deposit Receipts matured": { inputType: "yesNo" },
    "Amount Invested": { inputType: "numeric", isMandatory: true },
    "Income Earned": { inputType: "numeric" },
  },
  form16: {
    "ASSESSMENT": { inputType: "financialYear", isMandatory: true },
    "ASSESSMENT Year 2": { inputType: "financialYear" },
    "ASSESSMENT Year 3": { inputType: "financialYear" },
    "Gross Salary PA": { inputType: "numeric", isMandatory: true },
    "Gross Salary PA Year 2": { inputType: "numeric" },
    "Gross Salary PA Year 3": { inputType: "numeric" },
    "Life Assured Pan No": { inputType: "panNumber", isMandatory: true },
    "Life Assured Pan No Year 2": { inputType: "panNumber" },
    "Life Assured Pan No Year 3": { inputType: "panNumber" },
    "Life Assured Name": { inputType: "alphabetic", isMandatory: true },
    "Life Assured Name Year 2": { inputType: "alphabetic" },
    "Life Assured Name Year 3": { inputType: "alphabetic" },
    "Company Name": { inputType: "alphabetic", isMandatory: true },
    "Company Name Year 2": { inputType: "alphabetic" },
    "Company Name Year 3": { inputType: "alphabetic" },
    "Is Life Assured Name Same With Doc Name?": { inputType: "yesNo" },
    "Is Life Assured Name Same With Doc Name? Year 2": { inputType: "yesNo" },
    "Is Life Assured Name Same With Doc Name? Year 3": { inputType: "yesNo" },
  },
  form16a: {
    "Assessment Year": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 2": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 3": { inputType: "financialYear", isMandatory: true },
    "Net Receipt pa": { inputType: "numeric", isMandatory: true },
    "Net Receipt pa Year 2": { inputType: "numeric" },
    "Net Receipt pa Year 3": { inputType: "numeric" },
  },
  form_j: {
    "Is Form J in the name of LA": { inputType: "yesNo", isMandatory: true },
    "Month1 Receipt1": { inputType: "numeric", isMandatory: true },
    "Month1 Receipt2": { inputType: "numeric" },
    "Month1 Receipt3": { inputType: "numeric" },
    "Month1 Receipt4": { inputType: "numeric" },
    "Month1 Receipt5": { inputType: "numeric" },
    "Month1 Receipt6": { inputType: "numeric" },
    "Month2 Receipt1": { inputType: "numeric" },
    "Month2 Receipt2": { inputType: "numeric" },
    "Month2 Receipt3": { inputType: "numeric" },
    "Month2 Receipt4": { inputType: "numeric" },
    "Month2 Receipt5": { inputType: "numeric" },
    "Month2 Receipt6": { inputType: "numeric" },
    "Month3 Receipt1": { inputType: "numeric" },
    "Month3 Receipt2": { inputType: "numeric" },
    "Month3 Receipt3": { inputType: "numeric" },
    "Month3 Receipt4": { inputType: "numeric" },
    "Month3 Receipt5": { inputType: "numeric" },
    "Month3 Receipt6": { inputType: "numeric" },
  },
  govt_bonds: {
    "Is Bond Certification in the name of LA": { inputType: "yesNo" },
    "Is Bond Certificate matured": { inputType: "yesNo" },
    "Amount Invested or Maturity Value, whichever higher": { inputType: "numeric", isMandatory: true },
    "Income Earned": { inputType: "numeric" },
  },
  itr_non_individual: {
    "Name of Organisation/Firm": { inputType: "alphabetic" },
    "Permanent Account Number": { inputType: "panNumber" },
    "Assessment Year": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 2": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 3": { inputType: "financialYear", isMandatory: true },
    "ITR Acknowledgement Number": { inputType: "numeric" },
    "ITR Acknowledgement Number Year 2": { inputType: "numeric" },
    "ITR Acknowledgement Number Year 3": { inputType: "numeric" },
    "Income from Salary": { inputType: "numeric", isMandatory: true },
    "Income from Salary Year 2": { inputType: "numeric", isMandatory: true },
    "Income from Salary Year 3": { inputType: "numeric" },
    "Pan Number Matched with Barcode Number": { inputType: "yesNo" },
    "Pan Number Matched with Barcode Number Year 2": { inputType: "yesNo" },
    "Pan Number Matched with Barcode Number Year 3": { inputType: "yesNo" },
    "Income from House Property": { inputType: "numeric" },
    "Income from House Property Year 2": { inputType: "numeric" },
    "Income from House Property Year 3": { inputType: "numeric" },
    "Income from Business or Profession": { inputType: "numeric", isMandatory: true },
    "Income from Business or Profession Year 2": { inputType: "numeric", isMandatory: true },
    "Income from Business or Profession Year 3": { inputType: "numeric" },
    "Short term & Capital Gains": { inputType: "numeric" },
    "Short term & Capital Gains Year 2": { inputType: "numeric" },
    "Short term & Capital Gains Year 3": { inputType: "numeric" },
    "Income from Other Sources": { inputType: "numeric" },
    "Income from Other Sources Year 2": { inputType: "numeric" },
    "Income from Other Sources Year 3": { inputType: "numeric" },
    "Agricultural Income": { inputType: "numeric" },
    "Agricultural Income Year 2": { inputType: "numeric" },
    "Agricultural Income Year 3": { inputType: "numeric" },
    "Exempt Income": { inputType: "numeric", isMandatory: true },
    "Exempt Income Year 2": { inputType: "numeric", isMandatory: true },
    "Exempt Income Year 3": { inputType: "numeric" },
  },
  itr_individual: {
    "Name of Organisation/Firm": { inputType: "alphabetic" },
    "Permanent Account Number": { inputType: "panNumber" },
    "Assessment Year": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 2": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 3": { inputType: "financialYear", isMandatory: true },
    "ITR Acknowledgement Number": { inputType: "numeric" },
    "ITR Acknowledgement Number Year 2": { inputType: "numeric" },
    "ITR Acknowledgement Number Year 3": { inputType: "numeric" },
    "Pan Number Matched with Barcode Number": { inputType: "yesNo" },
    "Pan Number Matched with Barcode Number Year 2": { inputType: "yesNo" },
    "Pan Number Matched with Barcode Number Year 3": { inputType: "yesNo" },
    "Date of Filling ITR": { inputType: "dateDDMMYYYY", isMandatory: true, allowFutureDate: false },
    "Date of Filling ITR Year 2": { inputType: "dateDDMMYYYY", allowFutureDate: false },
    "Date of Filling ITR Year 3": { inputType: "dateDDMMYYYY", allowFutureDate: false },
    "Income from Salary(A)": { inputType: "numeric", isMandatory: true },
    "Income from Salary(A) Year 2": { inputType: "numeric" },
    "Income from Salary(A) Year 3": { inputType: "numeric" },
    "Income from House Property": { inputType: "numeric" },
    "Income from House Property Year 2": { inputType: "numeric" },
    "Income from House Property Year 3": { inputType: "numeric" },
    "Income from Business or Profession(B)": { inputType: "numeric", isMandatory: true },
    "Income from Business or Profession(B) Year 2": { inputType: "numeric" },
    "Income from Business or Profession(B) Year 3": { inputType: "numeric" },
    "Short term & Capital Gains": { inputType: "numeric" },
    "Short term & Capital Gains Year 2": { inputType: "numeric" },
    "Short term & Capital Gains Year 3": { inputType: "numeric" },
    "Income from Other Sources": { inputType: "numeric" },
    "Income from Other Sources Year 2": { inputType: "numeric" },
    "Income from Other Sources Year 3": { inputType: "numeric" },
    "Agricultural Income": { inputType: "numeric" },
    "Agricultural Income Year 2": { inputType: "numeric" },
    "Agricultural Income Year 3": { inputType: "numeric" },
    "Exempt Income(C)": { inputType: "numeric", isMandatory: true },
    "Exempt Income(C) Year 2": { inputType: "numeric" },
    "Exempt Income(C) Year 3": { inputType: "numeric" },
    "PF deduction - Salaried customers": { inputType: "numeric" },
    "PF deduction - Salaried customers Year 2": { inputType: "numeric" },
    "PF deduction - Salaried customers Year 3": { inputType: "numeric" },
    "Life Assured Name": { inputType: "alphabetic", isMandatory: true },
    "Life Assured Name Year 2": { inputType: "alphabetic" },
    "Life Assured Name Year 3": { inputType: "alphabetic" },
    "Is Life Assured Name Same?": { inputType: "yesNo", isMandatory: true },
    "Is Life Assured Name Same? Year 2": { inputType: "yesNo" },
    "Is Life Assured Name Same? Year 3": { inputType: "yesNo" },
  },
  loan_statement: {
    "Is Loan Statements in the name of LA": { inputType: "yesNo" },
    "Is LA Defaulter in the Payment": { inputType: "yesNo" },
    "Monthly EMI as per Schedule": { inputType: "numeric", isMandatory: true },
    "Income Earned": { inputType: "numeric" },
  },
  mutual_fund: {
    "Is Mutual Fund Statement in the name of LA": { inputType: "yesNo" },
    "Latest Market Value (as per NAV) in Statement": { inputType: "numeric", isMandatory: true },
    "Income Earned": { inputType: "numeric" },
  },
  pension_statement: {
    "Total Monthly Pension": { inputType: "numeric", isMandatory: true },
  },
  profit_and_loss: {
    "Name of Organization/Firm": { inputType: "alphabetic", isMandatory: true },
    "As Per Accounts of Proposer Co.": { inputType: "yesNo", isMandatory: true },
    "As Per Accounts of Proposer Co. Year 2": { inputType: "yesNo", isMandatory: true },
    "As Per Accounts of Proposer Co. Year 3": { inputType: "yesNo", isMandatory: true },
    "Assessment Year": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 2": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 3": { inputType: "financialYear", isMandatory: true },
    "Shareholders Funds / Partners Capital": { inputType: "alphabetic" },
    "Shareholders Funds / Partners Capital Year 2": { inputType: "alphabetic" },
    "Shareholders Funds / Partners Capital Year 3": { inputType: "alphabetic" },
    "Share Capital or Fixed/Fluctuating Capital": { inputType: "numeric" },
    "Share Capital or Fixed/Fluctuating Capital Year 2": { inputType: "numeric" },
    "Share Capital or Fixed/Fluctuating Capital Year 3": { inputType: "numeric" },
    "Reserves & Surplus": { inputType: "numeric" },
    "Reserves & Surplus Year 2": { inputType: "numeric" },
    "Reserves & Surplus Year 3": { inputType: "numeric" },
    "Total Shareholders Funds or Partner's Fund": { inputType: "numeric" },
    "Total Shareholders Funds or Partner's Fund Year 2": { inputType: "numeric" },
    "Total Shareholders Funds or Partner's Fund Year 3": { inputType: "numeric" },
    "Profit Calculation": { inputType: "numeric" },
    "Profit Calculation Year 2": { inputType: "numeric" },
    "Profit Calculation Year 3": { inputType: "numeric" },
    "Profit Before Depreciation & Tax (PBDT)": { inputType: "numeric" },
    "Profit Before Depreciation & Tax (PBDT) Year 2": { inputType: "numeric" },
    "Profit Before Depreciation & Tax (PBDT) Year 3": { inputType: "numeric" },
    "Less : Depreciation": { inputType: "numeric" },
    "Less : Depreciation Year 2": { inputType: "numeric" },
    "Less : Depreciation Year 3": { inputType: "numeric" },
    "Profit Before Tax (PBT)": { inputType: "numeric" },
    "Profit Before Tax (PBT) Year 2": { inputType: "numeric" },
    "Profit Before Tax (PBT) Year 3": { inputType: "numeric" },
    "Tax": { inputType: "numeric" },
    "Tax Year 2": { inputType: "numeric" },
    "Tax Year 3": { inputType: "numeric" },
    "Profit After Tax (PAT)": { inputType: "numeric", isMandatory: true },
    "Profit After Tax (PAT) Year 2": { inputType: "numeric", isMandatory: true },
    "Profit After Tax (PAT) Year 3": { inputType: "numeric", isMandatory: true },
    "Profit After Tax of Last Year": { inputType: "numeric" },
    "Profit After Tax of Last Year Year 2": { inputType: "numeric" },
    "Profit After Tax of Last Year Year 3": { inputType: "numeric" },
    "Rise In Profit as compared to Last Year": { inputType: "numeric" },
    "Rise In Profit as compared to Last Year Year 2": { inputType: "numeric" },
    "Rise In Profit as compared to Last Year Year 3": { inputType: "numeric" },
    "% Rise In Profit as compared to Last Year": { inputType: "numeric" },
    "% Rise In Profit as compared to Last Year Year 2": { inputType: "numeric" },
    "% Rise In Profit as compared to Last Year Year 3": { inputType: "numeric" },
    "Income Calculation": { inputType: "numeric" },
    "Income Calculation Year 2": { inputType: "numeric" },
    "Income Calculation Year 3": { inputType: "numeric" },
    "Sales": { inputType: "numeric" },
    "Sales Year 2": { inputType: "numeric" },
    "Sales Year 3": { inputType: "numeric" },
    "Sales of Last Year": { inputType: "numeric" },
    "Sales of Last Year Year 2": { inputType: "numeric" },
    "Sales of Last Year Year 3": { inputType: "numeric" },
    "Rise In Sales as compared to Last Year": { inputType: "numeric" },
    "Rise In Sales as compared to Last Year Year 2": { inputType: "numeric" },
    "Rise In Sales as compared to Last Year Year 3": { inputType: "numeric" },
    "% Rise In Sales as compared to Last Year": { inputType: "numeric" },
    "% Rise In Sales as compared to Last Year Year 2": { inputType: "numeric" },
    "% Rise In Sales as compared to Last Year Year 3": { inputType: "numeric" },
    "Average Profit Before Tax": { inputType: "numeric" },
    "Average Profit Before Tax Year 2": { inputType: "numeric" },
    "Average Profit Before Tax Year 3": { inputType: "numeric" },
    "Average Profit After Tax": { inputType: "numeric" },
    "Average Profit After Tax Year 2": { inputType: "numeric" },
    "Average Profit After Tax Year 3": { inputType: "numeric" },
  },
  property_purchase: {
    "Is Property purchased by LA": { inputType: "yesNo" },
    "Purchase Price": { inputType: "numeric", isMandatory: true },
    "Financial Year of Purchase": { inputType: "financialYear" },
    "Estimated Market Value of Property": { inputType: "numeric" },
  },
  property_valuation: {
    "Is Property Valuation Report in the name of LA": { inputType: "yesNo" },
    "Estimated Market Value of Property(as per report)": { inputType: "numeric", isMandatory: true },
  },
  salary_certificate: {
    "Gross Salary PA": { inputType: "numeric", isMandatory: true },
  },
  salary_revision_letter: {
    "Gross Salary PA": { inputType: "numeric", isMandatory: true },
  },
  salary_slips: {
    "Gross Salary Pm1": { inputType: "numeric", isMandatory: true },
    "Gross Salary Pm2": { inputType: "numeric", isMandatory: true },
    "Gross Salary Pm3": { inputType: "numeric", isMandatory: true },
    "Gross Salary Pm4": { inputType: "numeric" },
    "Gross Salary Pm5": { inputType: "numeric" },
    "Gross Salary Pm6": { inputType: "numeric" },
    "Annual Bonus/Incentive/Reimbursement": { inputType: "numeric" },
    "Company Name": { inputType: "alphabetic", isMandatory: true },
    "Life Assured Name": { inputType: "alphabetic", isMandatory: true },
    "Is Life Assured Name Same?": { inputType: "yesNo", isMandatory: true },
    "PF / UAN No": { inputType: "panNumber" },
  },
  bank_statement: {
    "Is Bank Statement in the name of LA/his Business": { inputType: "yesNo", isMandatory: true },
    "Latest 6 months statements given": { inputType: "yesNo", isMandatory: true },
    "Any Overdraft(Negative/Debit) Balances": { inputType: "yesNo", isMandatory: true },
    "Monthly Closing Bal 1": { inputType: "numeric", isMandatory: true },
    "Monthly Closing Bal 2": { inputType: "numeric", isMandatory: true },
    "Monthly Closing Bal 3": { inputType: "numeric", isMandatory: true },
    "Monthly Closing Bal 4": { inputType: "numeric", isMandatory: true },
    "Monthly Closing Bal 5": { inputType: "numeric", isMandatory: true },
    "Monthly Closing Bal 6": { inputType: "numeric", isMandatory: true },
    "Opening Balance": { inputType: "numeric", isMandatory: true },
    "Statement Period": { inputType: "numeric", isMandatory: true },
    "Life Assured Name": { inputType: "alphabetic", isMandatory: true },
    "Is LA Name Match with Doc Name?": { inputType: "yesNo", isMandatory: true },
    "Life Insurance Premium Deduction Entry": { inputType: "yesNo" },
    "Wine Beer_Entries": { inputType: "yesNo" },
    "Med Entry": { inputType: "yesNo" },
  },
  stock_holding: {
    "Is Stock Holding Statement in name of LA/his Business": { inputType: "yesNo" },
    "Gross Total Market Value as per the Stmt": { inputType: "numeric", isMandatory: true },
    "Income Earned": { inputType: "numeric" },
  },
  vehicle_ownership: {
    "Is Registration Papers in the name of LA": { inputType: "yesNo" },
    "Is Purchase invoices in the name of LA": { inputType: "yesNo" },
    "Purchase Price": { inputType: "numeric", isMandatory: true },
    "Vehicle RC Number": { inputType: "alphanumeric" },
  },
  vahan: {
    "Is Registration Papers in the Name of LA": { inputType: "yesNo", isMandatory: true },
    "Is Purchase Invoices in the Name of LA": { inputType: "yesNo", isMandatory: true },
    "Car RC Number": { inputType: "alphanumeric" },
    "IDV": { inputType: "numeric", isMandatory: true },
  },
  sip_statement: {
    "Latest 6 Months SIP Statements Given": { inputType: "yesNo", isMandatory: true },
    "Is SIP Statements in the Name of LA": { inputType: "yesNo", isMandatory: true },
    "SIP of Month1": { inputType: "numeric", isMandatory: true },
    "SIP Per Month 1": { inputType: "numeric", isMandatory: true },
    "SIP of Month2": { inputType: "numeric", isMandatory: true },
    "SIP Per Month2": { inputType: "numeric", isMandatory: true },
    "SIP of Month 3": { inputType: "numeric", isMandatory: true },
    "SIP Per Month 3": { inputType: "numeric", isMandatory: true },
    "SIP of Month 4": { inputType: "numeric", isMandatory: true },
    "SIP Per Month4": { inputType: "numeric", isMandatory: true },
    "SIP of Month5": { inputType: "numeric", isMandatory: true },
    "SIP Per Month 5": { inputType: "numeric", isMandatory: true },
    "SIP of Month 6": { inputType: "numeric", isMandatory: true },
    "SIP Per Month 6": { inputType: "numeric", isMandatory: true },
  },
  gst_income: {
    "Assessment Year": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 2": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 3": { inputType: "financialYear", isMandatory: true },
    "Assessment Year Year 4": { inputType: "financialYear", isMandatory: true },
    "Gross Sales": { inputType: "numeric", isMandatory: true },
    "Gross Sales Year 2": { inputType: "numeric" },
    "Gross Sales Year 3": { inputType: "numeric" },
    "Gross Sales Year 4": { inputType: "numeric" },
    "Gross Purchases": { inputType: "numeric" },
    "Gross Purchases Year 2": { inputType: "numeric" },
    "Gross Purchases Year 3": { inputType: "numeric" },
    "Gross Purchases Year 4": { inputType: "numeric" },
    "Profit After GST": { inputType: "numeric" },
    "Profit After GST Year 2": { inputType: "numeric" },
    "Profit After GST Year 3": { inputType: "numeric" },
    "Profit After GST Year 4": { inputType: "numeric" },
  },
  bank_statement_salary_credit: {
    "Is Bank Statement in the Name of LA": { inputType: "yesNo", isMandatory: true },
    "Net Salary Month1": { inputType: "numeric", isMandatory: true },
    "Net Salary Credited PM1": { inputType: "numeric", isMandatory: true },
    "Net Salary Month 2": { inputType: "numeric", isMandatory: true },
    "Net Salary Credited PM2": { inputType: "numeric", isMandatory: true },
    "Net Salary Month 3": { inputType: "numeric", isMandatory: true },
    "Net Salary Credited PM3": { inputType: "numeric", isMandatory: true },
    "Net Salary Month 4": { inputType: "numeric" },
    "Net Salary Credited PM4": { inputType: "numeric" },
    "Net Salary Month 5": { inputType: "numeric" },
    "Net Salary Credited PM 5": { inputType: "numeric" },
    "Net Salary Month 6": { inputType: "numeric" },
    "Net Salary Credited PM 6": { inputType: "numeric" },
    "Annual Bonus /Incentive /Reimbursement": { inputType: "numeric" },
    "Salary Credited": { inputType: "numeric" },
    "Opening Balance": { inputType: "numeric", isMandatory: true },
    "Closing Balance": { inputType: "numeric" },
    "Statement Period": { inputType: "financialYear", isMandatory: true },
    "Life Assured Name": { inputType: "alphabetic", isMandatory: true },
    "Is LA Name Match with Doc Name?": { inputType: "yesNo", isMandatory: true },
  },
  epf_basic: {
    "Latest Organization Name": { inputType: "alphabetic", isMandatory: true },
    "Is Organization Name Same?": { inputType: "yesNo", isMandatory: true },
    "Income": { inputType: "numeric", isMandatory: true },
  },
  epf_advanced: {
    "Latest Organization Name": { inputType: "alphabetic", isMandatory: true },
    "Is Organization Name Same?": { inputType: "yesNo", isMandatory: true },
    "PF Contribution M1": { inputType: "numeric", isMandatory: true },
    "PF Contribution M2": { inputType: "numeric", isMandatory: true },
    "PF Contribution M3": { inputType: "numeric", isMandatory: true },
    "PF Contribution M4": { inputType: "numeric", isMandatory: true },
    "PF Contribution M5": { inputType: "numeric", isMandatory: true },
    "PF Contribution M6": { inputType: "numeric", isMandatory: true },
  },
  employee_id_card: {
    "Name of the company": { inputType: "alphabetic", isMandatory: true },
    "Name of the employee": { inputType: "alphabetic", isMandatory: true },
    "Employee number": { inputType: "alphanumeric", isMandatory: true },
    "Photo available": { inputType: "yesNo", isMandatory: true },
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

  if (rule?.inputType === "alphabetic" && !/^[a-zA-Z\s]+$/.test(trimmedValue)) {
    return getErrorMessage("financialAlphabeticValue");
  }

  if (rule?.inputType === "alphanumeric" && !/^[a-zA-Z0-9\s]+$/.test(trimmedValue)) {
    return getErrorMessage("financialAlphanumericValue");
  }

  if (rule?.inputType === "panNumber") {
    // PAN format: 5 letters, 4 digits, 1 letter (e.g., ABCDE1234F)
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(trimmedValue.toUpperCase())) {
      return getErrorMessage("financialInvalidPan");
    }
  }

  if (rule?.inputType === "financialYear") {
    // Financial year format: AY XX-XX (e.g., AY 25-26)
    const match = /^AY\s+(\d{2})-(\d{2})$/.exec(trimmedValue);
    if (!match) {
      return getErrorMessage("financialYearFormat");
    }
    
    const [, startYearShort, endYearShort] = match;
    const startYearNum = Number(startYearShort);
    const endYearNum = Number(endYearShort);
    
    // Check if years are consecutive (handling century rollover)
    const isConsecutive = 
      (endYearNum === startYearNum + 1) || 
      (startYearNum === 99 && endYearNum === 0);
    
    if (!isConsecutive) {
      return getErrorMessage("financialYearInvalid");
    }

    // Convert 2-digit year to 4-digit year for validation
    const currentYear = new Date().getFullYear();
    const currentCentury = Math.floor(currentYear / 100) * 100;
    const currentYearShort = currentYear % 100;
    
    // Determine full year based on current year
    let fullStartYear = currentCentury + startYearNum;
    if (startYearNum > currentYearShort + 10) {
      fullStartYear -= 100; // Previous century
    }
    
    // Validate financial year is within last 5 years till last financial year (current year - 1)
    const earliestYear = currentYear - 5;
    const latestYear = currentYear - 1;
    
    if (fullStartYear < earliestYear || fullStartYear > latestYear) {
      return getErrorMessage("financialYearOutOfRange");
    }
  }

  if (rule?.inputType === "yesNo") {
    const upperValue = trimmedValue.toUpperCase();
    if (upperValue !== "YES" && upperValue !== "NO" && upperValue !== "Y" && upperValue !== "N") {
      return getErrorMessage("financialYesNoValue");
    }
  }

  if (rule?.inputType === "dateDDMMYYYY") {
    const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedValue);
    const ddMmYyyyMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmedValue);

    const dateMatch = isoMatch ?? ddMmYyyyMatch;

    if (!dateMatch) {
      return getErrorMessage("financialDateFormat");
    }

    const [, first, second, third] = dateMatch;
    const dayText = isoMatch ? third : first;
    const monthText = isoMatch ? second : second;
    const yearText = isoMatch ? first : third;
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