import { Box, Typography, Snackbar, Alert, CircularProgress } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../../components/layout/BackButton";
import CustomButton from "../../../components/ui/Button/Button";
import CustomTabs from "../../../components/ui/Tabs/Tabs";
import CustomTextField from "../../../components/ui/TextField/TextField";
import CustomSelect from "../../../components/ui/Select/Select";
import { Dialog, DialogTitle, Button, IconButton } from "@mui/material";
import CustomTable, { type Column } from "../../../components/ui/Table/Table";
import { useAppContext } from "../../../hooks/useAppContext";
import { getDRSPath, getFinancialPath, getMedicalPath } from "../../../routes/routes";
import { apiRequest } from "../../../services/api";
import { url } from "../../../services/apiConfig";
import type { ApiKey } from "../../../services/apiConfig";
import { useAppDispatch } from "../../../store/hooks";
import type { RootState } from "../../../store/store";
import { drsThunk } from "../../../store/thunks/drsThunk";
import { financialThunk } from "../../../store/thunks/financialThunk";
import { breThunk } from "../../../store/thunks/breThunk";
import { setBreExternalApiOutputs } from "../../../store/slices/drsSlice";
import type { ApplicantTab, FinancialResponse, FinancialResponseSection, FinancialViewRequest, MasterOption } from "../../../types/drs.types";
import { applicantTabs, title } from "../../../utils/constant";
import { getSessionMasters } from "../../../utils/masterDataSession";
import { getFinancialFieldRule, validateFinancialFieldValue, validateFinancialSectionValues } from "../../../validations/financialValidation";
import { getErrorMessage } from "../../../config/errorMessages";
import BreDecision from "../DRS_Accordions/BreDecision";
import {
  financialSections,
  type FinancialField,
  type FinancialSectionConfig,
  type FinancialSectionKey,
} from "./financialAccordionConfig";
import ApplicantProfile from "../DRS_Accordions/ApplicantProfile";

const getRoleType = () => localStorage.getItem("roleType") ?? "";

type DRSViewTab = "medical" | "financial";

const drsViewTabs: { key: DRSViewTab; label: string }[] = [
  { key: "financial", label: "View Financial" },
];

const buildInitialFieldValues = (sections: FinancialSectionConfig[] = financialSections) => {
  return sections.reduce<Record<FinancialSectionKey, Record<string, string>>>(
    (accumulator, section) => {
      accumulator[section.key] = section.items.reduce<Record<string, string>>((itemAccumulator, item) => {
        itemAccumulator[item.label] = item.value == null ? "" : String(item.value);
        return itemAccumulator;
      }, {});

      return accumulator;
    },
    {} as Record<FinancialSectionKey, Record<string, string>>
  );
};

const buildFinancialSectionsFromResponse = (responseSections: FinancialResponse["sections"] = []) => {
  const responseSectionsByKey = new Map(responseSections.map((section) => [section.key, section]));

  return financialSections.map((section) => {
    const responseSection = responseSectionsByKey.get(section.key);

    if (!responseSection) {
      return section;
    }

    const responseItemsByLabel = new Map(responseSection.items.map((item) => [item.label, item]));

    return {
      ...section,
      columns: responseSection.columns ?? section.columns,
      items: section.items.map((item) => {
        const responseItem = responseItemsByLabel.get(item.label);

        return {
          ...item,
          value: responseItem?.value ?? "",
          isMandatory: responseItem?.isMandatory ?? item.isMandatory,
          mandatoryCondition: responseItem?.mandatoryCondition ?? item.mandatoryCondition,
        };
      }),
    };
  });
};

type FinancialDocument = Record<string, unknown>;

type FinancialDocumentsPayload = {
  salary_slips?: FinancialDocument;
  bank_statement?: FinancialDocument;
  bank_statement_salary_credit?: FinancialDocument;
  commission_statement?: FinancialDocument;
  form_j?: FinancialDocument;
  sip_statement?: FinancialDocument;
  epf_advanced?: FinancialDocument;
  epf_basic?: FinancialDocument;
  form16?: FinancialDocument;
  form16a?: FinancialDocument;
  gst_income?: FinancialDocument;
  itr_individual?: FinancialDocument;
  itr_non_individual?: FinancialDocument;
  computation_of_income?: FinancialDocument;
  profit_and_loss?: FinancialDocument;
  credit_card?: FinancialDocument;
  fixed_deposit_receipt?: FinancialDocument;
  govt_bonds?: FinancialDocument;
  loan_statement?: FinancialDocument;
  mutual_fund?: FinancialDocument;
  pension_statement?: FinancialDocument;
  property_purchase?: FinancialDocument;
  property_valuation?: FinancialDocument;
  salary_certificate?: FinancialDocument;
  salary_revision_letter?: FinancialDocument;
  stock_holding?: FinancialDocument;
  vehicle_ownership?: FinancialDocument;
  vahan?: FinancialDocument;
  appointment_letter?: FinancialDocument;
  advance_tax?: FinancialDocument;
  ca_networth?: FinancialDocument;
  ca_balance_sheet?: FinancialDocument;
  employee_id_card?: FinancialDocument;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const asArray = (value: unknown): Record<string, unknown>[] =>
  Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    : [];

const firstDefined = (...values: unknown[]) => values.find((value) => value !== undefined && value !== null);

// Get masters data from session
const getMastersData = () => {
  const masters = getSessionMasters();
  return masters || {};
};

// Get display value from code using masters
const getDisplayValueFromCode = (code: string, masterKey: string): string => {
  const masters = getMastersData();
  const masterList = masters[masterKey as keyof typeof masters];

  if (!Array.isArray(masterList)) {
    return code;
  }

  // Filter to ensure we're working with MasterOption items
  const option = (masterList as MasterOption[]).find((item) =>
    String(item.code).toUpperCase() === String(code).toUpperCase()
  );

  return option?.value || option?.description || code;
};

// Get code from display value using masters
const getCodeFromDisplayValue = (displayValue: string, masterKey: string): string => {
  const masters = getMastersData();
  const masterList = masters[masterKey as keyof typeof masters];

  if (!Array.isArray(masterList)) {
    return displayValue;
  }

  // Filter to ensure we're working with MasterOption items
  const option = (masterList as MasterOption[]).find((item) =>
    String(item.value).toUpperCase() === String(displayValue).toUpperCase() ||
    String(item.description).toUpperCase() === String(displayValue).toUpperCase()
  );

  return option?.code || displayValue;
};

const toDisplay = (value: unknown) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value === "boolean") {
    return value ? "Y" : "N";
  }

  const stringValue = String(value).trim();

  // Map Y/N codes to display values from masters
  if (stringValue === "Y" || stringValue === "N") {
    return getDisplayValueFromCode(stringValue, "yes_no");
  }

  return String(value);
};

const getMonthRows = (document: Record<string, unknown>) => asArray(document.months);

const getYearRows = (document: Record<string, unknown>) => asArray(document.years);

const createItems = (entries: Array<[string, unknown]>) =>
  entries.map(([label, value]) => ({
    label,
    value: toDisplay(value),
  }));

const buildSectionFromItems = (
  key: FinancialSectionKey,
  items: Array<{ label: string; value?: string | number | boolean | null }>,
) => ({
  key,
  items,
}) as FinancialResponseSection;

const mapDocumentsToFinancialSections = (
  documents: FinancialDocumentsPayload,
): FinancialResponseSection[] => {
  const sections: FinancialResponseSection[] = [];

  const appointmentLetter = asRecord(documents.appointment_letter);
  if (appointmentLetter) {
    sections.push(
      buildSectionFromItems("appointment_letter", createItems([
        ["Name of the company", appointmentLetter.companyName],
        ["Name of the employee", appointmentLetter.partyName],
        ["Joining Date", appointmentLetter.joiningDt],
        ["CTC", appointmentLetter.grossSalaryPa],
      ]))
    );
  }

  const commissionStatement = asRecord(documents.commission_statement);
  if (commissionStatement) {
    const months = getMonthRows(commissionStatement);
    sections.push(
      buildSectionFromItems("commission_statement", createItems([
        ["Month 1", months[0]?.commissionAmount],
        ["Month 2", months[1]?.commissionAmount],
        ["Month 3", months[2]?.commissionAmount],
        ["Month 4", months[3]?.commissionAmount],
        ["Month 5", months[4]?.commissionAmount],
        ["Month 6", months[5]?.commissionAmount],
        ["Average commission pm", commissionStatement.avgCommissionPmCalculated],
        ["Average Annual Income", commissionStatement.avgAnnualIncomeCalculated],
      ]))
    );
  }

  const computationOfIncome = asRecord(documents.computation_of_income);
  if (computationOfIncome) {
    const years = getYearRows(computationOfIncome);
    sections.push(
      buildSectionFromItems("computation_of_income", createItems([
        ["Assessment Year", years[0]?.assessmentYear],
        ["Assessment Year Year 2", years[1]?.assessmentYear],
        ["Assessment Year Year 3", years[2]?.assessmentYear],
        ["Income from Salary(A)", years[0]?.incomeFromSalary],
        ["Income from Salary(A) Year 2", years[1]?.incomeFromSalary],
        ["Income from Salary(A) Year 3", years[2]?.incomeFromSalary],
        ["Income from House Property", years[0]?.incomeFromHouseProperty],
        ["Income from House Property Year 2", years[1]?.incomeFromHouseProperty],
        ["Income from House Property Year 3", years[2]?.incomeFromHouseProperty],
        ["Income from Business or Profession (B)", years[0]?.incomeFromBusiness],
        ["Income from Business or Profession (B) Year 2", years[1]?.incomeFromBusiness],
        ["Income from Business or Profession (B) Year 3", years[2]?.incomeFromBusiness],
        ["Short term & Capital Gains", years[0]?.shortTermCapitalGains],
        ["Short term & Capital Gains Year 2", years[1]?.shortTermCapitalGains],
        ["Short term & Capital Gains Year 3", years[2]?.shortTermCapitalGains],
        ["Income from Other Sources", years[0]?.incomeFromOtherSources],
        ["Income from Other Sources Year 2", years[1]?.incomeFromOtherSources],
        ["Income from Other Sources Year 3", years[2]?.incomeFromOtherSources],
        ["Agricultural Income", years[0]?.agriculturalIncome],
        ["Agricultural Income Year 2", years[1]?.agriculturalIncome],
        ["Agricultural Income Year 3", years[2]?.agriculturalIncome],
        ["Exempt Income(C)", years[0]?.exemptIncome],
        ["Exempt Income(C) Year 2", years[1]?.exemptIncome],
        ["Exempt Income(C) Year 3", years[2]?.exemptIncome],
        ["Gross Total Income", years[0]?.grossTotalIncomeCalculated],
        ["Gross Total Income Year 2", years[1]?.grossTotalIncomeCalculated],
        ["Gross Total Income Year 3", years[2]?.grossTotalIncomeCalculated],
        ["Total Gross Total Income", computationOfIncome.totalGrossTotalIncomeCalculated],
        ["Average Gross Total Income", computationOfIncome.avgGrossTotalIncomeCalculated],
      ]))
    );
  }

  const creditCard = asRecord(documents.credit_card);
  if (creditCard) {
    sections.push(
      buildSectionFromItems("credit_card", createItems([
        ["Is Credit card statement in the name of LA", creditCard.nameMatchInd],
        ["Is LA Defaulter in the Payment", creditCard.isDefaulter],
        ["Type of Card", creditCard.cardType],
        ["Credit Limit", creditCard.creditLimit],
        ["Points Earned", creditCard.pointsEarned],
        ["Income Earned", creditCard.incomeEarned],
        ["Derived Income", firstDefined(creditCard.derivedIncomeCalculated, creditCard.derivedIncome)],
        ["Average Income", firstDefined(creditCard.avgIncomeCalculated, creditCard.derivedIncomeCalculated)],
      ]))
    );
  }

  const fixedDeposit = asRecord(documents.fixed_deposit_receipt);
  if (fixedDeposit) {
    sections.push(
      buildSectionFromItems("fixed_deposit_receipt", createItems([
        ["Is Fixed Deposit Receipt in the name of LA", fixedDeposit.nameMatchInd],
        ["Is Fixed Deposit Receipts matured", fixedDeposit.isMatured],
        ["Amount Invested", fixedDeposit.amountInvested],
        ["Income Earned", fixedDeposit.incomeEarned],
        ["Derived Income", fixedDeposit.derivedIncomeCalculated],
        ["Average Income", firstDefined(fixedDeposit.avgIncomeCalculated, fixedDeposit.derivedIncomeCalculated)],
      ]))
    );
  }

  const form16 = asRecord(documents.form16);
  if (form16) {
    const years = getYearRows(form16);
    sections.push(
      buildSectionFromItems("form16", createItems([
        ["ASSESSMENT", years[0]?.assessmentYear],
        ["ASSESSMENT Year 2", years[1]?.assessmentYear],
        ["ASSESSMENT Year 3", years[2]?.assessmentYear],
        ["Gross Salary PA", years[0]?.grossSalaryPa],
        ["Gross Salary PA Year 2", years[1]?.grossSalaryPa],
        ["Gross Salary PA Year 3", years[2]?.grossSalaryPa],
        ["Average Annual Income", form16.avgAnnualIncomeCalculated],
        ["Life Assured Pan No", form16.panNumber],
        ["Life Assured Name", form16.partyName],
      ]))
    );
  }

  const form16A = asRecord(documents.form16a);
  if (form16A) {
    const years = getYearRows(form16A);
    sections.push(
      buildSectionFromItems("form16a", createItems([
        ["Assessment Year", years[0]?.assessmentYear],
        ["Assessment Year Year 2", years[1]?.assessmentYear],
        ["Assessment Year Year 3", years[2]?.assessmentYear],
        ["Net Receipt pa", years[0]?.netReceiptPa],
        ["Net Receipt pa Year 2", years[1]?.netReceiptPa],
        ["Net Receipt pa Year 3", years[2]?.netReceiptPa],
        ["Average Annual Income", form16A.avgAnnualIncomeCalculated],
      ]))
    );
  }

  const formJ = asRecord(documents.form_j);
  if (formJ) {
    const months = getMonthRows(formJ);
    sections.push(
      buildSectionFromItems("form_j", createItems([
        ["Is Form J in the name of LA", formJ.nameMatchInd],
        ["Month1 Receipt1", months[0]?.receiptAmount],
        ["Month2 Receipt1", months[1]?.receiptAmount],
        ["Month3 Receipt1", months[2]?.receiptAmount],
        ["Total Receipts Receipt1", formJ.totalReceiptsCalculated],
        ["Average Monthly Receipts Receipt1", formJ.avgMonthlyReceiptsCalculated],
        ["Annual Receipts Receipt1", formJ.annualReceiptsCalculated],
        ["Derived Income Receipt1", formJ.derivedIncomeCalculated],
      ]))
    );
  }

  const govtBonds = asRecord(documents.govt_bonds);
  if (govtBonds) {
    sections.push(
      buildSectionFromItems("govt_bonds", createItems([
        ["Is Bond Certification in the name of LA", govtBonds.nameMatchInd],
        ["Is Bond Certificate matured", govtBonds.isMatured],
        ["Amount Invested or Maturity Value, whichever higher", govtBonds.amountInvested],
        ["Income Earned", govtBonds.incomeEarned],
        ["Derived Income", govtBonds.derivedIncomeCalculated],
        ["Average Income", firstDefined(govtBonds.avgIncomeCalculated, govtBonds.derivedIncomeCalculated)],
      ]))
    );
  }

  const itrNonIndividual = asRecord(documents.itr_non_individual);
  if (itrNonIndividual) {
    const years = getYearRows(itrNonIndividual);
    sections.push(
      buildSectionFromItems("itr_non_individual", createItems([
        ["Name of Organisation/Firm", itrNonIndividual.orgName],
        ["Permanent Account Number", itrNonIndividual.panNumber],
        ["Assessment Year", years[0]?.assessmentYear],
        ["Assessment Year Year 2", years[1]?.assessmentYear],
        ["Assessment Year Year 3", years[2]?.assessmentYear],
        ["ITR Acknowledgement Number", itrNonIndividual.ackNumber],
        ["Income from Salary", years[0]?.incomeFromSalary],
        ["Income from Salary Year 2", years[1]?.incomeFromSalary],
        ["Income from Salary Year 3", years[2]?.incomeFromSalary],
        ["Income from House Property", years[0]?.incomeFromHouseProperty],
        ["Income from House Property Year 2", years[1]?.incomeFromHouseProperty],
        ["Income from House Property Year 3", years[2]?.incomeFromHouseProperty],
        ["Income from Business or Profession", years[0]?.incomeFromBusiness],
        ["Income from Business or Profession Year 2", years[1]?.incomeFromBusiness],
        ["Income from Business or Profession Year 3", years[2]?.incomeFromBusiness],
        ["Short term & Capital Gains", years[0]?.shortTermCapitalGains],
        ["Short term & Capital Gains Year 2", years[1]?.shortTermCapitalGains],
        ["Short term & Capital Gains Year 3", years[2]?.shortTermCapitalGains],
        ["Income from Other Sources", years[0]?.incomeFromOtherSources],
        ["Income from Other Sources Year 2", years[1]?.incomeFromOtherSources],
        ["Income from Other Sources Year 3", years[2]?.incomeFromOtherSources],
        ["Agricultural Income", years[0]?.agriculturalIncome],
        ["Agricultural Income Year 2", years[1]?.agriculturalIncome],
        ["Agricultural Income Year 3", years[2]?.agriculturalIncome],
        ["Exempt Income", years[0]?.exemptIncome],
        ["Exempt Income Year 2", years[1]?.exemptIncome],
        ["Exempt Income Year 3", years[2]?.exemptIncome],
        ["Gross Total Income", years[0]?.grossTotalIncomeCalculated],
        ["Gross Total Income Year 2", years[1]?.grossTotalIncomeCalculated],
        ["Gross Total Income Year 3", years[2]?.grossTotalIncomeCalculated],
        ["Total Gross Total Income", itrNonIndividual.totalGrossTotalIncomeCalculated],
        ["Average Gross Total Income", itrNonIndividual.avgGrossTotalIncomeCalculated],
        ["Pan Number Matched with Barcode Number", years[0]?.panNumberMatchedWithBarcodeNumber],
        ["Pan Number Matched with Barcode Number Year 2", years[1]?.panNumberMatchedWithBarcodeNumber],
        ["Pan Number Matched with Barcode Number Year 3", years[2]?.panNumberMatchedWithBarcodeNumber],
      ]))
    );
  }

  const itrIndividual = asRecord(documents.itr_individual);
  if (itrIndividual) {
    const years = getYearRows(itrIndividual);
    sections.push(
      buildSectionFromItems("itr_individual", createItems([
        ["Name of Organisation/Firm", itrIndividual.orgName],
        ["Permanent Account Number", itrIndividual.panNumber],
        ["Assessment Year", years[0]?.assessmentYear],
        ["Assessment Year Year 2", years[1]?.assessmentYear],
        ["Assessment Year Year 3", years[2]?.assessmentYear],
        ["ITR Acknowledgement Number", itrIndividual.ackNumber],
        ["Date of Filling ITR", itrIndividual.itrFilingDt],
        ["Date of Filling ITR Year 2", years[1]?.itrFilingDt],
        ["Date of Filling ITR Year 3", years[2]?.itrFilingDt],
        ["Income from Salary(A)", years[0]?.incomeFromSalary],
        ["Income from Salary(A) Year 2", years[1]?.incomeFromSalary],
        ["Income from Salary(A) Year 3", years[2]?.incomeFromSalary],
        ["Income from House Property", years[0]?.incomeFromHouseProperty],
        ["Income from House Property Year 2", years[1]?.incomeFromHouseProperty],
        ["Income from House Property Year 3", years[2]?.incomeFromHouseProperty],
        ["Income from Business or Profession(B)", years[0]?.incomeFromBusiness],
        ["Income from Business or Profession(B) Year 2", years[1]?.incomeFromBusiness],
        ["Income from Business or Profession(B) Year 3", years[2]?.incomeFromBusiness],
        ["Short term & Capital Gains", years[0]?.shortTermCapitalGains],
        ["Short term & Capital Gains Year 2", years[1]?.shortTermCapitalGains],
        ["Short term & Capital Gains Year 3", years[2]?.shortTermCapitalGains],
        ["Income from Other Sources", years[0]?.incomeFromOtherSources],
        ["Income from Other Sources Year 2", years[1]?.incomeFromOtherSources],
        ["Income from Other Sources Year 3", years[2]?.incomeFromOtherSources],
        ["Agricultural Income", years[0]?.agriculturalIncome],
        ["Agricultural Income Year 2", years[1]?.agriculturalIncome],
        ["Agricultural Income Year 3", years[2]?.agriculturalIncome],
        ["Exempt Income(C)", years[0]?.exemptIncome],
        ["Exempt Income(C) Year 2", years[1]?.exemptIncome],
        ["Exempt Income(C) Year 3", years[2]?.exemptIncome],
        ["Gross Total Income(A+B+C)", years[0]?.grossTotalIncomeCalculated],
        ["Gross Total Income(A+B+C) Year 2", years[1]?.grossTotalIncomeCalculated],
        ["Gross Total Income(A+B+C) Year 3", years[2]?.grossTotalIncomeCalculated],
        ["Total Gross Total Income", itrIndividual.totalGrossTotalIncomeCalculated],
        ["Average Gross Total Income", itrIndividual.avgGrossTotalIncomeCalculated],
        ["PF deduction - Salaried customers", itrIndividual.pfDeduction],
        ["Life Assured Name", itrIndividual.partyName],
        ["Is Life Assured Name Same?", itrIndividual.nameMatchInd],
        ["Pan Number Matched with Barcode Number", years[0]?.panNumberMatchedWithBarcodeNumber],
        ["Pan Number Matched with Barcode Number Year 2", years[1]?.panNumberMatchedWithBarcodeNumber],
        ["Pan Number Matched with Barcode Number Year 3", years[2]?.panNumberMatchedWithBarcodeNumber],
      ]))
    );
  }

  const loanStatement = asRecord(documents.loan_statement);
  if (loanStatement) {
    sections.push(
      buildSectionFromItems("loan_statement", createItems([
        ["Is Loan Statements in the name of LA", loanStatement.nameMatchInd],
        ["Is LA Defaulter in the Payment", loanStatement.isDefaulter],
        ["Monthly EMI as per Schedule", loanStatement.monthlyEmi],
        ["Income Earned", loanStatement.incomeEarned],
        ["Derived Income", loanStatement.derivedIncomeCalculated],
        ["Average Income", firstDefined(loanStatement.avgIncomeCalculated, loanStatement.derivedIncomeCalculated)],
      ]))
    );
  }

  const mutualFund = asRecord(documents.mutual_fund);
  if (mutualFund) {
    sections.push(
      buildSectionFromItems("mutual_fund", createItems([
        ["Is Mutual Fund Statement in the name of LA", mutualFund.nameMatchInd],
        ["Latest Market Value (as per NAV) in Statement", mutualFund.latestMarketValue],
        ["Income Earned", mutualFund.incomeEarned],
        ["Derived Income", mutualFund.derivedIncomeCalculated],
        ["Average Income", firstDefined(mutualFund.avgIncomeCalculated, mutualFund.derivedIncomeCalculated)],
      ]))
    );
  }

  const pensionStatement = asRecord(documents.pension_statement);
  if (pensionStatement) {
    sections.push(
      buildSectionFromItems("pension_statement", createItems([
        ["Total Monthly Pension", pensionStatement.totalMonthlyPension],
        ["Pension Received pa", pensionStatement.pensionReceivedPaCalculated],
      ]))
    );
  }

  const profitAndLoss = asRecord(documents.profit_and_loss);
  if (profitAndLoss) {
    const years = getYearRows(profitAndLoss);
    sections.push(
      buildSectionFromItems("profit_and_loss", createItems([
        ["Name of Organization/Firm", profitAndLoss.orgName],
        ["Assessment Year", years[0]?.assessmentYear],
        ["Assessment Year Year 2", years[1]?.assessmentYear],
        ["Assessment Year Year 3", years[2]?.assessmentYear],
        ["Share Capital or Fixed/Fluctuating Capital", years[0]?.shareCapital],
        ["Share Capital or Fixed/Fluctuating Capital Year 2", years[1]?.shareCapital],
        ["Share Capital or Fixed/Fluctuating Capital Year 3", years[2]?.shareCapital],
        ["Reserves & Surplus", years[0]?.reservesSurplus],
        ["Reserves & Surplus Year 2", years[1]?.reservesSurplus],
        ["Reserves & Surplus Year 3", years[2]?.reservesSurplus],
        ["Profit Before Depreciation & Tax (PBDT)", years[0]?.pbdt],
        ["Profit Before Depreciation & Tax (PBDT) Year 2", years[1]?.pbdt],
        ["Profit Before Depreciation & Tax (PBDT) Year 3", years[2]?.pbdt],
        ["Less : Depreciation", years[0]?.depreciation],
        ["Less : Depreciation Year 2", years[1]?.depreciation],
        ["Less : Depreciation Year 3", years[2]?.depreciation],
        ["Profit Before Tax (PBT)", years[0]?.pbt],
        ["Profit Before Tax (PBT) Year 2", years[1]?.pbt],
        ["Profit Before Tax (PBT) Year 3", years[2]?.pbt],
        ["Tax", years[0]?.tax],
        ["Tax Year 2", years[1]?.tax],
        ["Tax Year 3", years[2]?.tax],
        ["Profit After Tax (PAT)", years[0]?.profitAfterTax],
        ["Profit After Tax (PAT) Year 2", years[1]?.profitAfterTax],
        ["Profit After Tax (PAT) Year 3", years[2]?.profitAfterTax],
        ["Sales", years[0]?.sales],
        ["Sales Year 2", years[1]?.sales],
        ["Sales Year 3", years[2]?.sales],
        ["Average Gross Income", profitAndLoss.avgGrossIncomeCalculated],
      ]))
    );
  }

  const propertyPurchase = asRecord(documents.property_purchase);
  if (propertyPurchase) {
    sections.push(
      buildSectionFromItems("property_purchase", createItems([
        ["Is Property purchased by LA", propertyPurchase.isPurchasedByLa],
        ["Purchase Price", propertyPurchase.purchasePrice],
        ["Financial Year of Purchase", propertyPurchase.financialYearOfPurchase],
        ["Estimated Market Value of Property", propertyPurchase.estimatedMarketValue],
        ["Derived Income", propertyPurchase.derivedIncomeCalculated],
      ]))
    );
  }

  const propertyValuation = asRecord(documents.property_valuation);
  if (propertyValuation) {
    sections.push(
      buildSectionFromItems("property_valuation", createItems([
        ["Is Property Valuation Report in the name of LA", propertyValuation.nameMatchInd],
        ["Estimated Market Value of Property(as per report)", propertyValuation.estimatedMarketValue],
        ["Derived Income", propertyValuation.derivedIncomeCalculated],
      ]))
    );
  }

  const salaryCertificate = asRecord(documents.salary_certificate);
  if (salaryCertificate) {
    sections.push(
      buildSectionFromItems("salary_certificate", createItems([
        ["Gross Salary PA", firstDefined(salaryCertificate.derivedIncomeCalculated, salaryCertificate.grossSalaryPa)],
      ]))
    );
  }

  const salaryRevisionLetter = asRecord(documents.salary_revision_letter);
  if (salaryRevisionLetter) {
    sections.push(
      buildSectionFromItems("salary_revision_letter", createItems([
        ["Gross Salary PA", firstDefined(salaryRevisionLetter.derivedIncomeCalculated, salaryRevisionLetter.grossSalaryPa)],
      ]))
    );
  }

  const salarySlips = asRecord(documents.salary_slips);
  if (salarySlips) {
    const months = getMonthRows(salarySlips);
    sections.push(
      buildSectionFromItems("salary_slips", createItems([
        ["Gross Salary Pm1", months[0]?.monthlyGrossSalary],
        ["Gross Salary Pm2", months[1]?.monthlyGrossSalary],
        ["Gross Salary Pm3", months[2]?.monthlyGrossSalary],
        ["Gross Salary Pm4", months[3]?.monthlyGrossSalary],
        ["Gross Salary Pm5", months[4]?.monthlyGrossSalary],
        ["Gross Salary Pm6", months[5]?.monthlyGrossSalary],
        ["Average Salary pm", salarySlips.avgSalaryPmCalculated],
        ["Gross Salary pa", salarySlips.grossSalaryPaCalculated],
        ["Annual Bonus/Incentive/Reimbursement", salarySlips.annualBonus],
        ["Average Annual Income", salarySlips.avgAnnualIncomeCalculated],
        ["Company Name", salarySlips.companyName],
        ["Life Assured Name", salarySlips.partyName],
        ["Is Life Assured Name Same?", salarySlips.nameMatchInd],
        ["PF / UAN No", salarySlips.pfUan],
      ]))
    );
  }

  const savingsBankStatement = asRecord(documents.bank_statement);
  if (savingsBankStatement) {
    const months = getMonthRows(savingsBankStatement);
    sections.push(
      buildSectionFromItems("bank_statement", createItems([
        ["Is Bank Statement in the name of LA/his Business", savingsBankStatement.nameMatchInd],
        ["Latest 6 months statements given", savingsBankStatement.latest6MonthsInd],
        ["Any Overdraft(Negative/Debit) Balances", savingsBankStatement.overdraftInd],
        ["Monthly Closing Bal 1", months[0]?.closingBalance],
        ["Monthly Closing Bal 2", months[1]?.closingBalance],
        ["Monthly Closing Bal 3", months[2]?.closingBalance],
        ["Monthly Closing Bal 4", months[3]?.closingBalance],
        ["Monthly Closing Bal 5", months[4]?.closingBalance],
        ["Monthly Closing Bal 6", months[5]?.closingBalance],
        ["Average Bank Balance", savingsBankStatement.avgBankBalanceCalculated],
        ["Average Annual income", savingsBankStatement.avgAnnualIncomeCalculated],
        ["Opening Balance", savingsBankStatement.openingBalance],
        ["Statement Period", savingsBankStatement.statementPeriod],
        ["Life Assured Name", savingsBankStatement.fullName],
        ["Is LA Name Match with Doc Name?", savingsBankStatement.nameMatchInd],
        ["Life Insurance Premium Deduction Entry", savingsBankStatement.liPremiumDeductionInd],
        ["Wine Beer_Entries", savingsBankStatement.wineBeerEntriesInd],
        ["Med Entry", savingsBankStatement.medEntryInd],
      ]))
    );
  }

  const stockHolding = asRecord(documents.stock_holding);
  if (stockHolding) {
    sections.push(
      buildSectionFromItems("stock_holding", createItems([
        ["Is Stock Holding Statement in name of LA/his Business", stockHolding.nameMatchInd],
        ["Gross Total Market Value as per the Stmt", stockHolding.estimatedMarketValue],
        ["Income Earned", stockHolding.incomeEarned],
        ["Derived Income", stockHolding.derivedIncomeCalculated],
        ["Average Income", firstDefined(stockHolding.avgIncomeCalculated, stockHolding.derivedIncomeCalculated)],
      ]))
    );
  }

  const vehicleOwnership = asRecord(documents.vehicle_ownership);
  if (vehicleOwnership) {
    sections.push(
      buildSectionFromItems("vehicle_ownership", createItems([
        ["Is Registration Papers in the name of LA", vehicleOwnership.isRegNameLa],
        ["Is Purchase invoices in the name of LA", vehicleOwnership.isInvoiceNameLa],
        ["Purchase Price", vehicleOwnership.purchasePrice],
        ["Vehicle RC Number", vehicleOwnership.vehicleRcNumber],
        ["Derived Income", vehicleOwnership.derivedIncomeCalculated],
      ]))
    );
  }

  const vahan = asRecord(documents.vahan);
  if (vahan) {
    sections.push(
      buildSectionFromItems("vahan", createItems([
        ["Is Registration Papers in the Name of LA", vahan.isRegNameLa],
        ["Is Purchase Invoices in the Name of LA", vahan.isInvoiceNameLa],
        ["Car RC Number", vahan.carRcNumber],
        ["IDV", vahan.idv],
        ["Average Annual Income", vahan.avgAnnualIncomeCalculated],
      ]))
    );
  }

  const sipStatement = asRecord(documents.sip_statement);
  if (sipStatement) {
    const months = getMonthRows(sipStatement);
    sections.push(
      buildSectionFromItems("sip_statement", createItems([
        ["Latest 6 Months SIP Statements Given", sipStatement.latest6MonthsInd],
        ["Is SIP Statements in the Name of LA", sipStatement.isLaNameSame],
        ["SIP of Month1", months[0]?.periodMonth],
        ["SIP Per Month 1", months[0]?.sipAmount],
        ["SIP of Month2", months[1]?.periodMonth],
        ["SIP Per Month2", months[1]?.sipAmount],
        ["SIP of Month 3", months[2]?.periodMonth],
        ["SIP Per Month 3", months[2]?.sipAmount],
        ["SIP of Month 4", months[3]?.periodMonth],
        ["SIP Per Month4", months[3]?.sipAmount],
        ["SIP of Month5", months[4]?.periodMonth],
        ["SIP Per Month 5", months[4]?.sipAmount],
        ["SIP of Month 6", months[5]?.periodMonth],
        ["SIP Per Month 6", months[5]?.sipAmount],
        ["Average Monthly SIP", sipStatement.avgMonthlySipCalculated],
        ["Average Annual Income", sipStatement.avgAnnualIncomeCalculated],
      ]))
    );
  }

  const gstIncome = asRecord(documents.gst_income);
  if (gstIncome) {
    const years = getYearRows(gstIncome);
    sections.push(
      buildSectionFromItems("gst_income", createItems([
        ["Assessment Year", years[0]?.assessmentYear],
        ["Assessment Year Year 2", years[1]?.assessmentYear],
        ["Assessment Year Year 3", years[2]?.assessmentYear],
        ["Assessment Year Year 4", years[3]?.assessmentYear],
        ["Gross Sales", years[0]?.grossSales],
        ["Gross Sales Year 2", years[1]?.grossSales],
        ["Gross Sales Year 3", years[2]?.grossSales],
        ["Gross Sales Year 4", years[3]?.grossSales],
        ["Gross Purchases", years[0]?.grossPurchases],
        ["Gross Purchases Year 2", years[1]?.grossPurchases],
        ["Gross Purchases Year 3", years[2]?.grossPurchases],
        ["Gross Purchases Year 4", years[3]?.grossPurchases],
        ["Profit After GST", years[0]?.profitAfterGst],
        ["Profit After GST Year 2", years[1]?.profitAfterGst],
        ["Profit After GST Year 3", years[2]?.profitAfterGst],
        ["Profit After GST Year 4", years[3]?.profitAfterGst],
        ["Total of Gross Sales", gstIncome.totalGrossSalesCalculated],
        ["Average Gross Sales", gstIncome.avgGrossSalesCalculated],
        ["Average Annual Income", gstIncome.avgAnnualIncomeCalculated],
      ]))
    );
  }

  const salaryCreditBankStatement = asRecord(documents.bank_statement_salary_credit);
  if (salaryCreditBankStatement) {
    const months = getMonthRows(salaryCreditBankStatement);
    sections.push(
      buildSectionFromItems("bank_statement_salary_credit", createItems([
        ["Is Bank Statement in the Name of LA", salaryCreditBankStatement.nameMatchInd],
        ["Net Salary Month1", months[0]?.periodMonth],
        ["Net Salary Credited PM1", months[0]?.netSalaryCredited],
        ["Net Salary Month 2", months[1]?.periodMonth],
        ["Net Salary Credited PM2", months[1]?.netSalaryCredited],
        ["Net Salary Month 3", months[2]?.periodMonth],
        ["Net Salary Credited PM3", months[2]?.netSalaryCredited],
        ["Net Salary Month 4", months[3]?.periodMonth],
        ["Net Salary Credited PM4", months[3]?.netSalaryCredited],
        ["Net Salary Month 5", months[4]?.periodMonth],
        ["Net Salary Credited PM 5", months[4]?.netSalaryCredited],
        ["Net Salary Month 6", months[5]?.periodMonth],
        ["Net Salary Credited PM 6", months[5]?.netSalaryCredited],
        ["Average Net Salary Credited PM", salaryCreditBankStatement.avgNetSalaryCreditedPmCalculated],
        ["Net Salary Credited PA", salaryCreditBankStatement.netSalaryCreditedPaCalculated],
        ["Annual Bonus /Incentive /Reimbursement", salaryCreditBankStatement.annualBonus],
        ["Average Annual Income", salaryCreditBankStatement.avgAnnualIncomeCalculated],
        ["Salary Credited", salaryCreditBankStatement.salaryCreditedInd],
        ["Opening Balance", salaryCreditBankStatement.openingBalance],
        ["Closing Balance", salaryCreditBankStatement.closingBalance],
        ["Statement Period", salaryCreditBankStatement.statementPeriod],
        ["Life Assured Name", salaryCreditBankStatement.fullName],
        ["Is LA Name Match with Doc Name?", salaryCreditBankStatement.nameMatchInd],
      ]))
    );
  }

  const epfBasic = asRecord(documents.epf_basic);
  if (epfBasic) {
    sections.push(
      buildSectionFromItems("epf_basic", createItems([
        ["Latest Organization Name", epfBasic.orgName],
        ["Is Organization Name Same?", epfBasic.isOrgNameSame],
        ["Income", epfBasic.income],
      ]))
    );
  }

  const epfAdvanced = asRecord(documents.epf_advanced);
  if (epfAdvanced) {
    const months = getMonthRows(epfAdvanced);
    sections.push(
      buildSectionFromItems("epf_advanced", createItems([
        ["Latest Organization Name", epfAdvanced.orgName],
        ["Is Organization Name Same?", epfAdvanced.isOrgNameSame],
        ["PF Contribution M1", months[0]?.pfContribution],
        ["PF Contribution M2", months[1]?.pfContribution],
        ["PF Contribution M3", months[2]?.pfContribution],
        ["PF Contribution M4", months[3]?.pfContribution],
        ["PF Contribution M5", months[4]?.pfContribution],
        ["PF Contribution M6", months[5]?.pfContribution],
        ["Annual Income", epfAdvanced.annualIncomeCalculated],
      ]))
    );
  }

  return sections;
};

const normalizeFinancialResponse = (response: FinancialResponse): FinancialResponse => {
  if (Array.isArray(response.sections) && response.sections.length > 0) {
    return response;
  }

  const responseRecord = response as unknown as Record<string, unknown>;
  const dataRecord = asRecord(responseRecord.data);
  const documents = asRecord(dataRecord?.documents) as FinancialDocumentsPayload | undefined;

  if (!documents) {
    return response;
  }

  return {
    ...response,
    applicationId: toDisplay(firstDefined(response.applicationId, dataRecord?.applicationNumber)),
    sections: mapDocumentsToFinancialSections(documents),
  };
};

const mapApplicantTabFromMemberType = (memberType: unknown, index: number): ApplicantTab => {
  const normalizedMemberType = String(memberType ?? "").trim().toUpperCase();

  if (normalizedMemberType.includes("PR") || normalizedMemberType.includes("PROPOSER")) {
    return "proposer";
  }

  if (normalizedMemberType.includes("LIFEASSURED1") || normalizedMemberType.includes("LA1")) {
    return "lifeassured1";
  }

  if (normalizedMemberType.includes("LIFEASSURED2") || normalizedMemberType.includes("LA2")) {
    return "lifeassured2";
  }

  if (normalizedMemberType.includes("LA") || normalizedMemberType.includes("LIFE")) {
    return index === 0 ? "lifeassured1" : "lifeassured2";
  }

  if (index === 0) {
    return "proposer";
  }

  if (index === 1) {
    return "lifeassured1";
  }

  return "lifeassured2";
};

const readOnlyBoxSx = {
  minHeight: 38,
  px: 1.25,
  py: 0.95,
  borderRadius: "8px",
  backgroundColor: "#EFF1F3",
  border: "1px solid #E4E7EC",
  color: "#344054",
  fontSize: 13,
  display: "flex",
  alignItems: "center",
};

const getFieldValue = (
  values: Record<FinancialSectionKey, Record<string, string>>,
  section: FinancialSectionKey,
  label: string,
  fallback?: string | number | boolean
) => {
  const value = values[section]?.[label];
  if (value != null && value !== "") {
    return value;
  }

  if (fallback == null || fallback === "") {
    return "";
  }

  return String(fallback);
};

const FORM_16_TABLE_LABELS = [
  "ASSESSMENT",
  "Gross Salary PA",
  "Average Annual Income",
  "Life Assured Pan No",
  "Life Assured Name",
  "Is Life Assured Name Same With Doc Name?",
  "Company Name",
];

const FORM_16A_TABLE_LABELS = [
  "Assessment Year",
  "Net Receipt pa",
  "Average Annual Income",
];

const COMPUTATION_OF_INCOME_TABLE_LABELS = [
  "Assessment Year",
  "Income from Salary(A)",
  "Income from House Property",
  "Income from Business or Profession (B)",
  "Short term & Capital Gains",
  "Income from Other Sources",
  "Agricultural Income",
  "Exempt Income(C)",
  "Gross Total Income",
  "Total Gross Total Income",
  "Average Gross Total Income",
];

const ITR_NON_INDIVIDUAL_TABLE_LABELS = [
  "Assessment Year",
  "ITR Acknowledgement Number",
  "Income from Salary",
  "Income from House Property",
  "Income from Business or Profession",
  "Short term & Capital Gains",
  "Income from Other Sources",
  "Agricultural Income",
  "Exempt Income",
  "Gross Total Income",
  "Total Gross Total Income",
  "Average Gross Total Income",
  "Pan Number Matched with Barcode Number",
];

const ITR_INDIVIDUAL_TABLE_LABELS = [
  "Assessment Year",
  "ITR Acknowledgement Number",
  "Date of Filling ITR",
  "Income from Salary(A)",
  "Income from House Property",
  "Income from Business or Profession(B)",
  "Short term & Capital Gains",
  "Income from Other Sources",
  "Agricultural Income",
  "Exempt Income(C)",
  "Gross Total Income(A+B+C)",
  "Total Gross Total Income",
  "Average Gross Total Income",
  "PF deduction - Salaried customers",
  "Life Assured Name",
  "Is Life Assured Name Same?",
  "Pan Number Matched with Barcode Number",
];

const PROFIT_AND_LOSS_TABLE_LABELS = [
  "As Per Accounts of Proposer Co.",
  "Assessment Year",
  "Shareholders Funds / Partners Capital",
  "Share Capital or Fixed/Fluctuating Capital",
  "Reserves & Surplus",
  "Total Shareholders Funds or Partner's Fund",
  "Profit Calculation",
  "Profit Before Depreciation & Tax (PBDT)",
  "Less : Depreciation",
  "Profit Before Tax (PBT)",
  "Tax",
  "Profit After Tax (PAT)",
  "Profit After Tax of Last Year",
  "Rise In Profit as compared to Last Year",
  "% Rise In Profit as compared to Last Year",
  "Income Calculation",
  "Sales",
  "Sales of Last Year",
  "Rise In Sales as compared to Last Year",
  "% Rise In Sales as compared to Last Year",
  "Average Gross Income",
  "Average Profit Before Tax",
  "Average Profit After Tax",
];

const GST_INCOME_TABLE_LABELS = [
  "Assessment Year",
  "Gross Sales",
  "Gross Purchases",
  "Profit After GST",
  "Total of Gross Sales",
  "Average Gross Sales",
  "Average Annual Income",
];

const ITR_NON_INDIVIDUAL_TOP_FIELDS = ["Name of Organisation/Firm", "Permanent Account Number"];
const ITR_INDIVIDUAL_TOP_FIELDS = ["Name of Organisation/Firm", "Permanent Account Number"];
const PROFIT_AND_LOSS_TOP_FIELDS = ["Name of Organization/Firm"];

const FORM_J_ROW_LABELS = [
  "Month1",
  "Month2",
  "Month3",
  "Total Receipts",
  "Average Monthly Receipts",
  "Annual Receipts",
  "Derived Income",
];

const COMMISSION_MONTH_LABELS = ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"] as const;
const COMMISSION_AVERAGE_PM_LABEL = "Average commission pm";
const COMMISSION_AVERAGE_ANNUAL_LABEL = "Average Annual Income";

type SubmitResponse = {
  success?: boolean;
  message?: string;
  data?: {
    documents?: {
      salary_slips?: {
        avgSalaryPmCalculated?: number | string;
        grossSalaryPaCalculated?: number | string;
        avgAnnualIncomeCalculated?: number | string;
      };
      bank_statement?: {
        avgBankBalanceCalculated?: number | string;
        avgAnnualIncomeCalculated?: number | string;
      };
      bank_statement_salary_credit?: {
        avgNetSalaryCreditedPmCalculated?: number | string;
        netSalaryCreditedPaCalculated?: number | string;
        avgAnnualIncomeCalculated?: number | string;
      };
      commission_statement?: {
        avgCommissionPmCalculated?: number | string;
        avgAnnualIncomeCalculated?: number | string;
      };
      form_j?: {
        totalReceiptsCalculated?: number | string;
        avgMonthlyReceiptsCalculated?: number | string;
        annualReceiptsCalculated?: number | string;
        derivedIncomeCalculated?: number | string;
      };
      sip_statement?: {
        avgMonthlySipCalculated?: number | string;
        avgAnnualIncomeCalculated?: number | string;
      };
      epf_advanced?: {
        annualIncomeCalculated?: number | string;
      };
      form16?: {
        avgAnnualIncomeCalculated?: number | string;
      };
      form16a?: {
        avgAnnualIncomeCalculated?: number | string;
      };
      gst_income?: {
        totalGrossSalesCalculated?: number | string;
        avgGrossSalesCalculated?: number | string;
        avgAnnualIncomeCalculated?: number | string;
      };
      itr_individual?: {
        totalGrossTotalIncomeCalculated?: number | string;
        avgGrossTotalIncomeCalculated?: number | string;
      };
      itr_non_individual?: {
        totalGrossTotalIncomeCalculated?: number | string;
        avgGrossTotalIncomeCalculated?: number | string;
      };
      computation_of_income?: {
        totalGrossTotalIncomeCalculated?: number | string;
        avgGrossTotalIncomeCalculated?: number | string;
      };
      profit_and_loss?: {
        avgGrossIncomeCalculated?: number | string;
      };
      credit_card?: {
        derivedIncomeCalculated?: number | string;
        avgIncomeCalculated?: number | string;
      };
      fixed_deposit_receipt?: {
        derivedIncomeCalculated?: number | string;
        avgIncomeCalculated?: number | string;
      };
      govt_bonds?: {
        derivedIncomeCalculated?: number | string;
        avgIncomeCalculated?: number | string;
      };
      loan_statement?: {
        derivedIncomeCalculated?: number | string;
        avgIncomeCalculated?: number | string;
      };
      mutual_fund?: {
        derivedIncomeCalculated?: number | string;
        avgIncomeCalculated?: number | string;
      };
      pension_statement?: {
        pensionReceivedPaCalculated?: number | string;
      };
      property_purchase?: {
        derivedIncomeCalculated?: number | string;
      };
      property_valuation?: {
        derivedIncomeCalculated?: number | string;
      };
      salary_certificate?: {
        derivedIncomeCalculated?: number | string;
      };
      salary_revision_letter?: {
        derivedIncomeCalculated?: number | string;
      };
      stock_holding?: {
        derivedIncomeCalculated?: number | string;
        avgIncomeCalculated?: number | string;
      };
      vehicle_ownership?: {
        derivedIncomeCalculated?: number | string;
      };
      vahan?: {
        avgAnnualIncomeCalculated?: number | string;
      };
    };
  };
};

const isFieldMandatory = (field?: FinancialField) => {
  if (!field) {
    return false;
  }

  if (typeof field.isMandatory === "boolean") {
    return field.isMandatory;
  }

  if (typeof field.value === "string") {
    return /\bmandatory\b/i.test(field.value);
  }

  return false;
};

const isCommissionCalculatedField = (sectionKey: FinancialSectionKey, label: string) =>
  sectionKey === "commission_statement" &&
  (label === COMMISSION_AVERAGE_PM_LABEL || label === COMMISSION_AVERAGE_ANNUAL_LABEL);

const ALWAYS_READ_ONLY_FINANCIAL_FIELDS = new Set([
  "commission_statement:Average commission pm",
  "commission_statement:Average Annual Income",
  "computation_of_income:Gross Total Income",
  "computation_of_income:Gross Total Income Year 2",
  "computation_of_income:Gross Total Income Year 3",
  "computation_of_income:Total Gross Total Income",
  "computation_of_income:Total Gross Total Income Year 2",
  "computation_of_income:Total Gross Total Income Year 3",
  "computation_of_income:Average Gross Total Income",
  "computation_of_income:Average Gross Total Income Year 2",
  "computation_of_income:Average Gross Total Income Year 3",
  "credit_card:Derived Income",
  "credit_card:Average Income",
  "fixed_deposit_receipt:Derived Income",
  "fixed_deposit_receipt:Average Income",
  "form16:Average Annual Income",
  "form16:Average Annual Income Year 2",
  "form16:Average Annual Income Year 3",
  "form16a:Average Annual Income",
  "form16a:Average Annual Income Year 2",
  "form16a:Average Annual Income Year 3",
  "form_j:Average Monthly Receipts Receipt1",
  "form_j:Average Monthly Receipts Receipt2",
  "form_j:Average Monthly Receipts Receipt3",
  "form_j:Average Monthly Receipts Receipt4",
  "form_j:Average Monthly Receipts Receipt5",
  "form_j:Average Monthly Receipts Receipt6",
  "form_j:Annual Receipts Receipt1",
  "form_j:Annual Receipts Receipt2",
  "form_j:Annual Receipts Receipt3",
  "form_j:Annual Receipts Receipt4",
  "form_j:Annual Receipts Receipt5",
  "form_j:Annual Receipts Receipt6",
  "form_j:Derived Income Receipt1",
  "form_j:Derived Income Receipt2",
  "form_j:Derived Income Receipt3",
  "form_j:Derived Income Receipt4",
  "form_j:Derived Income Receipt5",
  "form_j:Derived Income Receipt6",
  "govt_bonds:Derived Income",
  "govt_bonds:Average Income",
  "itr_non_individual:Gross Total Income",
  "itr_non_individual:Gross Total Income Year 2",
  "itr_non_individual:Gross Total Income Year 3",
  "itr_non_individual:Total Gross Total Income",
  "itr_non_individual:Total Gross Total Income Year 2",
  "itr_non_individual:Total Gross Total Income Year 3",
  "itr_non_individual:Average Gross Total Income",
  "itr_non_individual:Average Gross Total Income Year 2",
  "itr_non_individual:Average Gross Total Income Year 3",
  "itr_individual:Gross Total Income(A+B+C)",
  "itr_individual:Gross Total Income(A+B+C) Year 2",
  "itr_individual:Gross Total Income(A+B+C) Year 3",
  "itr_individual:Total Gross Total Income",
  "itr_individual:Total Gross Total Income Year 2",
  "itr_individual:Total Gross Total Income Year 3",
  "itr_individual:Average Gross Total Income",
  "itr_individual:Average Gross Total Income Year 2",
  "itr_individual:Average Gross Total Income Year 3",
  "loan_statement:Derived Income",
  "loan_statement:Average Income",
  "mutual_fund:Derived Income",
  "mutual_fund:Average Income",
  "pension_statement:Pension Received pa",
  "profit_and_loss:Average Gross Income",
  "profit_and_loss:Average Gross Income Year 2",
  "profit_and_loss:Average Gross Income Year 3",
  "property_purchase:Derived Income",
  "property_valuation:Derived Income",
  "salary_slips:Average Salary pm",
  "salary_slips:Gross Salary pa",
  "salary_slips:Average Annual Income",
  "bank_statement:Average Bank Balance",
  "bank_statement:Average Annual income",
  "stock_holding:Derived Income",
  "stock_holding:Average Income",
  "vehicle_ownership:Derived Income",
  "vahan:Average Annual Income",
  "sip_statement:Average Monthly SIP",
  "sip_statement:Average Annual Income",
  "gst_income:Total of Gross Sales",
  "gst_income:Total of Gross Sales Year 2",
  "gst_income:Total of Gross Sales Year 3",
  "gst_income:Total of Gross Sales Year 4",
  "gst_income:Average Gross Sales",
  "gst_income:Average Gross Sales Year 2",
  "gst_income:Average Gross Sales Year 3",
  "gst_income:Average Gross Sales Year 4",
  "gst_income:Average Annual Income",
  "gst_income:Average Annual Income Year 2",
  "gst_income:Average Annual Income Year 3",
  "gst_income:Average Annual Income Year 4",
  "bank_statement_salary_credit:Average Net Salary Credited PM",
  "bank_statement_salary_credit:Net Salary Credited PA",
  "bank_statement_salary_credit:Average Annual Income",
  "epf_advanced:Annual Income",
]);

const isAlwaysReadOnlyFinancialField = (sectionKey: FinancialSectionKey, label: string) =>
  ALWAYS_READ_ONLY_FINANCIAL_FIELDS.has(`${sectionKey}:${label}`) || isCommissionCalculatedField(sectionKey, label);

const toStringField = (value: string | number | undefined) =>
  value == null ? undefined : String(value);

const getString = (value: string | undefined) => {
  return value && value.trim() !== "" ? value.trim() : undefined;
};

const getNumeric = (value: string | undefined) => {
  if (!value || value.trim() === "") {
    return undefined;
  }

  const numericValue = Number.parseFloat(value);
  return Number.isNaN(numericValue) ? undefined : numericValue;
};

const formatDdMmYyyyToIsoDate = (value: string | undefined) => {
  const normalizedValue = getString(value);

  if (!normalizedValue) {
    return undefined;
  }

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalizedValue);
  if (isoMatch) {
    return normalizedValue;
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(normalizedValue);
  if (!match) {
    return normalizedValue;
  }

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
};

const hasDocumentFields = (document: Record<string, unknown>) => Object.keys(document).length > 0;

const assignTextField = (
  document: Record<string, unknown>,
  targetKey: string,
  value: string | undefined,
) => {
  const normalizedValue = getString(value);

  if (normalizedValue) {
    document[targetKey] = normalizedValue;
  }
};

const assignNumberField = (
  document: Record<string, unknown>,
  targetKey: string,
  value: string | undefined,
) => {
  const normalizedValue = getNumeric(value);

  if (normalizedValue != null) {
    document[targetKey] = normalizedValue;
  }
};

const assignYesNoField = (
  document: Record<string, unknown>,
  targetKey: string,
  value: string | undefined,
) => {
  const normalizedValue = getString(value);

  if (normalizedValue) {
    // Convert display value (Yes/No) back to code (Y/N) using masters
    const code = getCodeFromDisplayValue(normalizedValue, "yes_no");
    document[targetKey] = code;
  }
};

const buildMonthlyEntries = (
  values: Record<string, string>,
  labels: readonly string[],
  valueKey: string,
) => {
  const currentYear = new Date().getFullYear();

  return labels.reduce<Array<Record<string, unknown>>>((months, label, index) => {
    const amount = getNumeric(values[label]);

    if (amount != null) {
      months.push({
        periodYear: currentYear,
        periodMonth: index + 1,
        [valueKey]: amount,
      });
    }

    return months;
  }, []);
};

const isSecondaryRepeatedField = (label: string) => {
  const trimmedLabel = label.trim();

  if (/\bYear\s+[2-9]\d*$/i.test(trimmedLabel)) {
    return true;
  }

  if (/\bReceipt\s*[2-9]\d*$/i.test(trimmedLabel)) {
    return true;
  }

  return false;
};

const getFinancialFieldValidationError = (sectionKey: FinancialSectionKey, field: FinancialField, value: string) => {
  const rule = getFinancialFieldRule(sectionKey, field.label);
  const trimmedValue = value.trim();

  if (trimmedValue) {
    const validationError = validateFinancialFieldValue(value, rule);
    if (validationError) {
      return validationError;
    }

    return "";
  }

  if (isSecondaryRepeatedField(field.label)) {
    return "";
  }

  if (isFieldMandatory(field)) {
    return getErrorMessage("financialFieldMandatory");
  }

  if (rule) {
    return "";
  }

  return "";
};

const toDateInputValue = (value: string) => {
  const trimmed = value.trim();

  // If already ISO format yyyy-mm-dd, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);

  if (!match) {
    return "";
  }

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
};

const fromDateInputValue = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;
  return `${day}/${month}/${year}`;
};

const getTodayDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const YearPickerField = ({
  value,
  onChange,
  required,
  errorText,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  errorText?: string;
}) => {
  const [open, setOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  // Generate years from (current year - 5) to (current year - 1) for last financial year
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i);

  const displayValue = value || "";

  return (
    <>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <CustomTextField
          fullWidth
          size="small"
          required={required}
          error={Boolean(errorText)}
          helperText={errorText}
          value={displayValue}
          onClick={() => setOpen(true)}
          slotProps={{ htmlInput: { readOnly: true } }}
        />
        <IconButton size="small" onClick={() => setOpen(true)} aria-label="select year">
          <span role="img" aria-label="calendar">📅</span>
        </IconButton>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ fontSize: 14, py: 1 }}>Select Assessment Year</DialogTitle>
        <Box sx={{ p: 1, width: 300 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
            {years.map((y) => {
              const yy1 = String(y).slice(-2);
              const yy2 = String(y + 1).slice(-2);
              const ayFormat = `AY ${yy1}-${yy2}`;
              const isSelected = value === ayFormat;
              return (
                <Button
                  key={y}
                  size="small"
                  fullWidth
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() => {
                    onChange(ayFormat);
                    setOpen(false);
                  }}
                  sx={{ py: 0.5, fontSize: 11 }}
                >
                  {ayFormat}
                </Button>
              );
            })}
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

const FinancialYearPickerField = ({
  value,
  onChange,
  required,
  errorText,
}: {
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  errorText?: string;
}) => {
  const [open, setOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  // Generate years from (current year - 5) to (current year - 1) for last financial year
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i);

  const displayValue = value || "";

  return (
    <>
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <CustomTextField
          fullWidth
          size="small"
          required={required}
          error={Boolean(errorText)}
          helperText={errorText}
          value={displayValue}
          onClick={() => setOpen(true)}
          slotProps={{ htmlInput: { readOnly: true } }}
        />
        <IconButton size="small" onClick={() => setOpen(true)} aria-label="select financial year">
          <span role="img" aria-label="calendar">📅</span>
        </IconButton>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle sx={{ fontSize: 14, py: 1 }}>Select Assessment Year</DialogTitle>
        <Box sx={{ p: 1, width: 300 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
            {years.map((y) => {
              const yy1 = String(y).slice(-2);
              const yy2 = String(y + 1).slice(-2);
              const ayFormat = `AY ${yy1}-${yy2}`;
              const isSelected = value === ayFormat;
              return (
                <Button
                  key={y}
                  size="small"
                  fullWidth
                  variant={isSelected ? "contained" : "outlined"}
                  onClick={() => {
                    onChange(ayFormat);
                    setOpen(false);
                  }}
                  sx={{ py: 0.5, fontSize: 11 }}
                >
                  {ayFormat}
                </Button>
              );
            })}
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

const renderFieldValue = (
  value: string,
  isEditable: boolean,
  onChange: (value: string) => void,
  isRequired = false,
  errorText?: string,
  fieldRule?: ReturnType<typeof getFinancialFieldRule>,
  label?: string,
) => {
  if (isEditable) {
    const isDateField = fieldRule?.inputType === "dateDDMMYYYY";
    const isYesNoField = fieldRule?.inputType === "yesNo";
    const isFinancialYearField = fieldRule?.inputType === "financialYear";

    // Special handling for Assessment Year fields (e.g. "Assessment Year", values like "AY 24-25").
    const isAssessmentYear = Boolean(label && /assessment\s*year/i.test(label));

    if (isYesNoField) {
      return (
        <CustomSelect
          fullWidth
          options={[
            { label: "Yes", value: "YES" },
            { label: "No", value: "NO" },
          ]}
          value={value ? value.toUpperCase() : ""}
          onChange={(newValue) => onChange(newValue)}
          error={Boolean(errorText)}
          helperText={errorText}
          placeholder="Select Yes or No"
        />
      );
    }

    if (isFinancialYearField) {
      return (
        <FinancialYearPickerField
          value={value}
          onChange={onChange}
          required={isRequired}
          errorText={errorText}
        />
      );
    }

    if (isAssessmentYear) {
      return <YearPickerField value={value} onChange={onChange} required={isRequired} errorText={errorText} />;
    }

    if (isDateField) {
      return (
        <CustomTextField
          fullWidth
          size="small"
          required={isRequired}
          error={Boolean(errorText)}
          helperText={errorText}
          type={"date"}
          value={toDateInputValue(value)}
          onChange={(event) => onChange(fromDateInputValue(event.target.value))}
          slotProps={{ htmlInput: { max: fieldRule?.allowFutureDate === false ? getTodayDateInputValue() : undefined } }}
        />
      );
    }

    return (
      <CustomTextField
        fullWidth
        size="small"
        required={isRequired}
        error={Boolean(errorText)}
        helperText={errorText}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  // Read-only display
  let displayValue = value;

  // Format Yes/No values for better display
  if (fieldRule?.inputType === "yesNo" && value) {
    const upperValue = value.toUpperCase();
    if (upperValue === "YES") displayValue = "Yes";
    if (upperValue === "NO") displayValue = "No";
  }

  return <Box sx={readOnlyBoxSx}>{displayValue}</Box>;
};

type MultiYearTableRow = {
  label: string;
  year1: string;
  year2: string;
  year3: string;
  year1FieldLabel: string;
  year2FieldLabel: string;
  year3FieldLabel: string;
  required: boolean;
};

type FourYearTableRow = {
  label: string;
  year1: string;
  year2: string;
  year3: string;
  year4: string;
  year1FieldLabel: string;
  year2FieldLabel: string;
  year3FieldLabel: string;
  year4FieldLabel: string;
  required: boolean;
};

type FormJTableRow = {
  label: string;
  receipt1: string;
  receipt2: string;
  receipt3: string;
  receipt4: string;
  receipt5: string;
  receipt6: string;
  receipt1FieldLabel: string;
  receipt2FieldLabel: string;
  receipt3FieldLabel: string;
  receipt4FieldLabel: string;
  receipt5FieldLabel: string;
  receipt6FieldLabel: string;
  required: boolean;
};

const renderMultiYearTableSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  tableLabels: string[],
  title: string,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  const tableRows: MultiYearTableRow[] = tableLabels.map((label) => {
    const item = byLabel[label.toLowerCase()];
    const year1FieldLabel = item?.label ?? label;
    const year2FieldLabel = `${label} Year 2`;
    const year3FieldLabel = `${label} Year 3`;

    return {
      label,
      year1: getFieldValue(values, section.key, year1FieldLabel, item?.value),
      year2: getFieldValue(values, section.key, year2FieldLabel, " "),
      year3: getFieldValue(values, section.key, year3FieldLabel, " "),
      year1FieldLabel,
      year2FieldLabel,
      year3FieldLabel,
      required: isFieldMandatory(item),
    };
  });

  const tableColumns: Column<MultiYearTableRow>[] = [
    {
      key: "label",
      header: "",
      width: "28%",
      render: (_, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Typography sx={{ fontSize: 13, color: "#475467" }}>{row.label}</Typography>
          {row.required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
        </Box>
      ),
    },
    {
      key: "year1",
      header: "Year 1",
      width: "24%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.year1FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.year1FieldLabel, nextValue),
          row.required,
          sectionErrors[row.year1FieldLabel],
          getFinancialFieldRule(section.key, row.year1FieldLabel),
          row.year1FieldLabel
        ),
    },
    {
      key: "year2",
      header: "Year 2",
      width: "24%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.year2FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.year2FieldLabel, nextValue),
          false,
          undefined,
          getFinancialFieldRule(section.key, row.year2FieldLabel),
          row.year2FieldLabel
        ),
    },
    {
      key: "year3",
      header: "Year 3",
      width: "24%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.year3FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.year3FieldLabel, nextValue),
          false,
          undefined,
          getFinancialFieldRule(section.key, row.year3FieldLabel),
          row.year3FieldLabel
        ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <CustomTable title={title} columns={tableColumns} data={tableRows} />
    </Box>
  );
};

const renderForm16Section = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {renderMultiYearTableSection(
        section,
        values,
        isEditable,
        sectionErrors,
        FORM_16_TABLE_LABELS,
        "Form 16",
        onFieldValueChange
      )}
    </Box>
  );
};

const renderFourYearTableSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  tableLabels: string[],
  title: string,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  const tableRows: FourYearTableRow[] = tableLabels.map((label) => {
    const item = byLabel[label.toLowerCase()];
    const year1FieldLabel = item?.label ?? label;
    const year2FieldLabel = `${label} Year 2`;
    const year3FieldLabel = `${label} Year 3`;
    const year4FieldLabel = `${label} Year 4`;

    return {
      label,
      year1: getFieldValue(values, section.key, year1FieldLabel, item?.value),
      year2: getFieldValue(values, section.key, year2FieldLabel, " "),
      year3: getFieldValue(values, section.key, year3FieldLabel, " "),
      year4: getFieldValue(values, section.key, year4FieldLabel, " "),
      year1FieldLabel,
      year2FieldLabel,
      year3FieldLabel,
      year4FieldLabel,
      required: isFieldMandatory(item),
    };
  });

  const tableColumns: Column<FourYearTableRow>[] = [
    {
      key: "label",
      header: "",
      width: "20%",
      render: (_, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Typography sx={{ fontSize: 13, color: "#475467" }}>{row.label}</Typography>
          {row.required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
        </Box>
      ),
    },
    {
      key: "year1",
      header: "Year 1",
      width: "20%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.year1FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.year1FieldLabel, nextValue),
          row.required,
          sectionErrors[row.year1FieldLabel],
          getFinancialFieldRule(section.key, row.year1FieldLabel),
          row.year1FieldLabel
        ),
    },
    {
      key: "year2",
      header: "Year 2",
      width: "20%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.year2FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.year2FieldLabel, nextValue),
          false,
          undefined,
          getFinancialFieldRule(section.key, row.year2FieldLabel),
          row.year2FieldLabel
        ),
    },
    {
      key: "year3",
      header: "Year 3",
      width: "20%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.year3FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.year3FieldLabel, nextValue),
          false,
          undefined,
          getFinancialFieldRule(section.key, row.year3FieldLabel),
          row.year3FieldLabel
        ),
    },
    {
      key: "year4",
      header: "Year 4",
      width: "20%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.year4FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.year4FieldLabel, nextValue),
          false,
          undefined,
          getFinancialFieldRule(section.key, row.year4FieldLabel),
          row.year4FieldLabel
        ),
    },
  ];

  return <CustomTable title={title} columns={tableColumns} data={tableRows} />;
};

const renderForm16ASection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) =>
  renderMultiYearTableSection(
    section,
    values,
    isEditable,
    sectionErrors,
    FORM_16A_TABLE_LABELS,
    section.title,
    onFieldValueChange
  );

const renderComputationOfIncomeSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) =>
  renderMultiYearTableSection(
    section,
    values,
    isEditable,
    sectionErrors,
    COMPUTATION_OF_INCOME_TABLE_LABELS,
    section.title,
    onFieldValueChange
  );

const renderITRNonIndividualSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 1.25,
        }}
      >
        {ITR_NON_INDIVIDUAL_TOP_FIELDS.map((label) => {
          const item = byLabel[label.toLowerCase()];
          const required = isFieldMandatory(item);
          const value = getFieldValue(values, section.key, item?.label ?? label, item?.value);

          return (
            <Box key={label}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: "#475467" }}>{label}</Typography>
                {required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
              </Box>
              {renderFieldValue(
                value,
                isEditable && !isAlwaysReadOnlyFinancialField(section.key, item?.label ?? label),
                (nextValue) => onFieldValueChange(section.key, item?.label ?? label, nextValue),
                required,
                sectionErrors[item?.label ?? label],
                getFinancialFieldRule(section.key, item?.label ?? label),
                item?.label ?? label
              )}
            </Box>
          );
        })}
      </Box>

      {renderMultiYearTableSection(
        section,
        values,
        isEditable,
        sectionErrors,
        ITR_NON_INDIVIDUAL_TABLE_LABELS,
        section.title,
        onFieldValueChange
      )}
    </Box>
  );
};

const renderITRIndividualSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 1.25,
        }}
      >
        {ITR_INDIVIDUAL_TOP_FIELDS.map((label) => {
          const item = byLabel[label.toLowerCase()];
          const required = isFieldMandatory(item);
          const value = getFieldValue(values, section.key, item?.label ?? label, item?.value);

          return (
            <Box key={label}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: "#475467" }}>{label}</Typography>
                {required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
              </Box>
              {renderFieldValue(
                value,
                isEditable && !isAlwaysReadOnlyFinancialField(section.key, item?.label ?? label),
                (nextValue) => onFieldValueChange(section.key, item?.label ?? label, nextValue),
                required,
                sectionErrors[item?.label ?? label],
                getFinancialFieldRule(section.key, item?.label ?? label),
                item?.label ?? label
              )}
            </Box>
          );
        })}
      </Box>

      {renderMultiYearTableSection(
        section,
        values,
        isEditable,
        sectionErrors,
        ITR_INDIVIDUAL_TABLE_LABELS,
        section.title,
        onFieldValueChange
      )}
    </Box>
  );
};

const renderProfitAndLossSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 1.25,
        }}
      >
        {PROFIT_AND_LOSS_TOP_FIELDS.map((label) => {
          const item = byLabel[label.toLowerCase()];
          const required = isFieldMandatory(item);
          const value = getFieldValue(values, section.key, item?.label ?? label, item?.value);

          return (
            <Box key={label}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 0.5 }}>
                <Typography sx={{ fontSize: 12, color: "#475467" }}>{label}</Typography>
                {required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
              </Box>
              {renderFieldValue(
                value,
                isEditable && !isAlwaysReadOnlyFinancialField(section.key, item?.label ?? label),
                (nextValue) => onFieldValueChange(section.key, item?.label ?? label, nextValue),
                required,
                sectionErrors[item?.label ?? label],
                getFinancialFieldRule(section.key, item?.label ?? label),
                item?.label ?? label
              )}
            </Box>
          );
        })}
      </Box>

      {renderMultiYearTableSection(
        section,
        values,
        isEditable,
        sectionErrors,
        PROFIT_AND_LOSS_TABLE_LABELS,
        section.title,
        onFieldValueChange
      )}
    </Box>
  );
};

const renderGstIncomeSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) =>
  renderFourYearTableSection(
    section,
    values,
    isEditable,
    sectionErrors,
    GST_INCOME_TABLE_LABELS,
    section.title,
    onFieldValueChange
  );

const renderFormJSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  const byLabel = section.items.reduce<Record<string, FinancialField>>((accumulator, item) => {
    accumulator[item.label.toLowerCase()] = item;
    return accumulator;
  }, {});

  const formJNameMatchItem = byLabel["is form j in the name of la"];

  const tableRows: FormJTableRow[] = FORM_J_ROW_LABELS.map((rowLabel) => {
    const rowName = rowLabel === "Is Form J in the name of LA" ? rowLabel : rowLabel;
    const receipt1FieldLabel = rowLabel === "Is Form J in the name of LA" ? rowName : `${rowLabel} Receipt1`;
    const receipt2FieldLabel = rowLabel === "Is Form J in the name of LA" ? `${rowName} Receipt2` : `${rowLabel} Receipt2`;
    const receipt3FieldLabel = rowLabel === "Is Form J in the name of LA" ? `${rowName} Receipt3` : `${rowLabel} Receipt3`;
    const receipt4FieldLabel = rowLabel === "Is Form J in the name of LA" ? `${rowName} Receipt4` : `${rowLabel} Receipt4`;
    const receipt5FieldLabel = rowLabel === "Is Form J in the name of LA" ? `${rowName} Receipt5` : `${rowLabel} Receipt5`;
    const receipt6FieldLabel = rowLabel === "Is Form J in the name of LA" ? `${rowName} Receipt6` : `${rowLabel} Receipt6`;

    const rowItem = byLabel[rowLabel.toLowerCase()] ?? byLabel[receipt1FieldLabel.toLowerCase()];

    return {
      label: rowLabel,
      receipt1: getFieldValue(values, section.key, receipt1FieldLabel, rowItem?.value),
      receipt2: getFieldValue(values, section.key, receipt2FieldLabel, " "),
      receipt3: getFieldValue(values, section.key, receipt3FieldLabel, " "),
      receipt4: getFieldValue(values, section.key, receipt4FieldLabel, " "),
      receipt5: getFieldValue(values, section.key, receipt5FieldLabel, " "),
      receipt6: getFieldValue(values, section.key, receipt6FieldLabel, " "),
      receipt1FieldLabel,
      receipt2FieldLabel,
      receipt3FieldLabel,
      receipt4FieldLabel,
      receipt5FieldLabel,
      receipt6FieldLabel,
      required: isFieldMandatory(rowItem),
    };
  });

  const tableColumns: Column<FormJTableRow>[] = [
    {
      key: "label",
      header: "",
      width: "22%",
      render: (_, row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Typography sx={{ fontSize: 13, color: "#475467" }}>{row.label}</Typography>
          {row.required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
        </Box>
      ),
    },
    {
      key: "receipt1",
      header: "Receipt 1",
      width: "13%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.receipt1FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.receipt1FieldLabel, nextValue),
          row.required,
          sectionErrors[row.receipt1FieldLabel],
          undefined,
          row.receipt1FieldLabel
        ),
    },
    {
      key: "receipt2",
      header: "Receipt 2",
      width: "13%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.receipt2FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.receipt2FieldLabel, nextValue),
          false,
          undefined,
          undefined,
          row.receipt2FieldLabel
        ),
    },
    {
      key: "receipt3",
      header: "Receipt 3",
      width: "13%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.receipt3FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.receipt3FieldLabel, nextValue),
          false,
          undefined,
          undefined,
          row.receipt3FieldLabel
        ),
    },
    {
      key: "receipt4",
      header: "Receipt 4",
      width: "13%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.receipt4FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.receipt4FieldLabel, nextValue),
          false,
          undefined,
          undefined,
          row.receipt4FieldLabel
        ),
    },
    {
      key: "receipt5",
      header: "Receipt 5",
      width: "13%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.receipt5FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.receipt5FieldLabel, nextValue),
          false,
          undefined,
          undefined,
          row.receipt5FieldLabel
        ),
    },
    {
      key: "receipt6",
      header: "Receipt 6",
      width: "13%",
      render: (value, row) =>
        renderFieldValue(
          String(value ?? ""),
          isEditable && !isAlwaysReadOnlyFinancialField(section.key, row.receipt6FieldLabel),
          (nextValue) => onFieldValueChange(section.key, row.receipt6FieldLabel, nextValue),
          false,
          undefined,
          undefined,
          row.receipt6FieldLabel
        ),
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {formJNameMatchItem && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
            gap: 1.25,
          }}
        >
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 0.5 }}>
              <Typography sx={{ fontSize: 12, color: "#475467" }}>{formJNameMatchItem.label}</Typography>
              {isFieldMandatory(formJNameMatchItem) && (
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>
              )}
            </Box>
            {renderFieldValue(
              getFieldValue(values, section.key, formJNameMatchItem.label, formJNameMatchItem.value),
              isEditable && !isAlwaysReadOnlyFinancialField(section.key, formJNameMatchItem.label),
              (nextValue) => onFieldValueChange(section.key, formJNameMatchItem.label, nextValue),
              isFieldMandatory(formJNameMatchItem),
              sectionErrors[formJNameMatchItem.label],
              getFinancialFieldRule(section.key, formJNameMatchItem.label),
              formJNameMatchItem.label
            )}
          </Box>
        </Box>
      )}

      <CustomTable title="FORM J" columns={tableColumns} data={tableRows} />
    </Box>
  );
};

const renderStandardSection = (
  section: FinancialSectionConfig,
  values: Record<FinancialSectionKey, Record<string, string>>,
  isEditable: boolean,
  sectionErrors: Record<string, string>,
  onFieldValueChange: (sectionKey: FinancialSectionKey, label: string, value: string) => void,
) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: `repeat(${section.columns ?? 3}, minmax(0, 1fr))`,
        },
        gap: 1.25,
      }}
    >
      {section.items.map((item) => {
        const required = isFieldMandatory(item);
        const value = getFieldValue(values, section.key, item.label, item.value);
        const isFieldEditable = isEditable && !isAlwaysReadOnlyFinancialField(section.key, item.label);
        const fieldRule = getFinancialFieldRule(section.key, item.label);

        return (
          <Box key={`${section.key}-${item.label}`}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, mb: 0.5 }}>
              <Typography sx={{ fontSize: 12, color: "#475467" }}>{item.label}</Typography>
              {required && <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#B42318" }}>*</Typography>}
            </Box>
            {renderFieldValue(
              value,
              isFieldEditable,
              (nextValue) => onFieldValueChange(section.key, item.label, nextValue),
              required,
              sectionErrors[item.label],
              fieldRule,
              item.label
            )}
          </Box>
        );
      })}
    </Box>
  );
};

const ViewFinancial = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { businessType, applicationNumber } = useAppContext();
  const drsData = useSelector((state: RootState) => state.drs.data);
  const userId = (localStorage.getItem("userId") ?? localStorage.getItem("username") ?? "").trim();

  const requestedApplicantTab =
    ((location.state as { selectedApplicantTab?: ApplicantTab } | null)?.selectedApplicantTab) ??
    "proposer";

  const [loading, setLoading] = useState(false);
  const [drsContextLoading, setDrsContextLoading] = useState(false);
  const [drsContextError, setDrsContextError] = useState<string | null>(null);
  const [breRetriggerLoading, setBreRetriggerLoading] = useState(false);
  const [drsContextLoaded, setDrsContextLoaded] = useState(false);
  const [financialDataLoaded, setFinancialDataLoaded] = useState(false);
  const [breRetriggerLoaded, setBreRetriggerLoaded] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialResponse | null>(null);
  const [activeApplicantTab] = useState<ApplicantTab>(requestedApplicantTab);
  const [financialFieldValues, setFinancialFieldValues] = useState<Record<FinancialSectionKey, Record<string, string>>>(
    buildInitialFieldValues
  );
  const [originalFinancialFieldValues, setOriginalFinancialFieldValues] = useState<Record<
    FinancialSectionKey,
    Record<string, string>
  >>(buildInitialFieldValues);
  const [activeSectionId, setActiveSectionId] = useState<string>(financialSections[0]?.key ?? "");
  const safeBusinessType =
    String(
      businessType ??
        localStorage.getItem("businessType") ??
        "retail",
    )
      .trim()
      .toLowerCase() || "retail";
  const safeApplicationId = applicationNumber ?? "";
  const roleType = getRoleType();
  const [editingSectionKey, setEditingSectionKey] = useState<FinancialSectionKey | null>(null);
  const [messageSectionKey, setMessageSectionKey] = useState<FinancialSectionKey | null>(null);
  const [sectionErrors, setSectionErrors] = useState<Partial<Record<FinancialSectionKey, Record<string, string>>>>({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "warning" | "error" | "info">("success");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!messageSectionKey) return;

    const msg = submitError ?? submitMessage;
    if (!msg) return;

    // Use microtask to avoid synchronous setState in effect
    setTimeout(() => {
      setSnackbarMessage(msg);
      setSnackbarSeverity(submitError ? "error" : "success");
      setSnackbarOpen(true);
    }, 0);
  }, [messageSectionKey, submitMessage, submitError]);

  useEffect(() => {
    const handlePageScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handlePageScroll, { passive: true });
    return () => window.removeEventListener("scroll", handlePageScroll);
  }, []);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const menuContainerRef = useRef<HTMLDivElement | null>(null);
  const drsDataRecord = drsData as unknown as Record<string, unknown> | null;
  const quickLinks = asRecord(drsDataRecord?.quickLinks);
  const udsLink = toDisplay(quickLinks?.proposerForm).trim();
  const drsSummaryMembers = asArray(drsDataRecord?.summary);
  const drsApplicationNumber = toDisplay(
    firstDefined(
      drsDataRecord?.applicationNumber,
      safeApplicationId,
    )
  );
  const availableMemberTypes = useMemo(
    () => drsSummaryMembers.map((item, index) => mapApplicantTabFromMemberType(item.memberType, index)),
    [drsSummaryMembers]
  );
  const visibleTabs = useMemo(
    () => applicantTabs.filter((tab) => availableMemberTypes.includes(tab.key)),
    [availableMemberTypes]
  );
  const currentApplicantTab = useMemo(
    () =>
      visibleTabs.some((tab) => tab.key === activeApplicantTab)
        ? activeApplicantTab
        : (visibleTabs[0]?.key ?? "proposer"),
    [activeApplicantTab, visibleTabs]
  );
  const drsPartyId = useMemo(() => {
    const selectedMember = drsSummaryMembers.find((member, index) =>
      mapApplicantTabFromMemberType(member.memberType, index) === currentApplicantTab
    );

    return toDisplay(
      firstDefined(
        selectedMember?.partyId,
        drsSummaryMembers[0]?.partyId,
      )
    );
  }, [currentApplicantTab, drsSummaryMembers]);
  const financialFetchPayloadError =
    !drsContextLoading &&
      !drsContextError &&
      (!drsApplicationNumber || !drsPartyId)
      ? "Application number or party ID is unavailable for financial fetch."
      : null;
  const displayFinancialSections = useMemo(
    () => buildFinancialSectionsFromResponse(financialData?.sections),
    [financialData?.sections]
  );

  useEffect(() => {
    if (!safeApplicationId || !roleType || !userId) {
      return;
    }

    const fetchDrsContext = async () => {
      try {
        setDrsContextLoading(true);
        setDrsContextError(null);
        setSnackbarMessage("Loading financial details...");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
        await dispatch(
          drsThunk({
            applicationNo: safeApplicationId,
            userId,
            roleType,
            businessType: safeBusinessType,
            sections: ["breDecision","latestBreDecision","summary"],
          })
        ).unwrap();
        // Clear error on success
        setDrsContextError(null);
        setDrsContextLoaded(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch DRS details.";
        setDrsContextError(message);
        setSnackbarMessage(message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setDrsContextLoading(false);
      }
    };

    void fetchDrsContext();
  }, [dispatch, roleType, safeApplicationId, safeBusinessType, userId]);

  useEffect(() => {
    const payload: FinancialViewRequest = {
      applicationNumber: drsApplicationNumber,
      partyId: drsPartyId,
    };

    if (financialFetchPayloadError) {
      return;
    }

    const fetchFinancial = async () => {
      try {
        setLoading(true);
        setSnackbarMessage("Loading financial details...");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
        const response = normalizeFinancialResponse(await dispatch(financialThunk(payload)).unwrap());
        setFinancialData(response);
        const built = buildInitialFieldValues(buildFinancialSectionsFromResponse(response.sections));
        setFinancialFieldValues(built);
        setOriginalFinancialFieldValues(built);
        // Clear error on success
        setFinancialDataLoaded(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch financial details.";
        setSnackbarMessage(message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setLoading(false);
      }
    };

    void fetchFinancial();
  }, [dispatch, drsApplicationNumber, drsPartyId, financialFetchPayloadError, roleType]);

  // On page load, call BRE retrigger for FE and store its breOutput as final BRE
  useEffect(() => {
    if (!drsApplicationNumber) return;

    const callFe = async () => {
      try {
        setBreRetriggerLoading(true);
        setSnackbarMessage("Loading financial details...");
        setSnackbarSeverity("info");
        setSnackbarOpen(true);
        const response = await dispatch(
          breThunk({
            eventName: "FE",
            applicationNumber: drsApplicationNumber,
            businessType: safeBusinessType,
          })
        ).unwrap();

        const payload = response.data ?? {};
        dispatch(
          setBreExternalApiOutputs({
            breOutput: payload.breOutput,
            initialBreOutput: payload.initialBreOutput ?? undefined,
            breRetriggerStatus: "success",
          })
        );
        setBreRetriggerLoaded(true);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to fetch financial details.";
        dispatch(
          setBreExternalApiOutputs({
            breRetriggerStatus: "failure",
          })
        );
        setSnackbarMessage(message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      } finally {
        setBreRetriggerLoading(false);
      }
    };

    void callFe();
  }, [dispatch, drsApplicationNumber, safeBusinessType]);

  // Compute showLoader based on loading states and whether all APIs have loaded at least once
  const showLoader = useMemo(() => {
    const isLoading = drsContextLoading || loading || breRetriggerLoading;
    const allLoaded = drsContextLoaded && financialDataLoaded && breRetriggerLoaded;
    return isLoading && !allLoaded;
  }, [drsContextLoading, loading, breRetriggerLoading, drsContextLoaded, financialDataLoaded, breRetriggerLoaded]);

  const resolvedActiveSectionId = useMemo(
    () =>
      displayFinancialSections.some((section) => section.key === activeSectionId)
        ? activeSectionId
        : (displayFinancialSections[0]?.key ?? ""),
    [activeSectionId, displayFinancialSections]
  );

  useEffect(() => {
    if (!resolvedActiveSectionId) {
      return;
    }

    const menuContainer = menuContainerRef.current;
    if (!menuContainer) {
      return;
    }

    const activeMenuItem = menuContainer.querySelector(
      `[data-financial-menu-id="${resolvedActiveSectionId}"]`
    ) as HTMLElement | null;

    if (!activeMenuItem) {
      return;
    }

    const containerRect = menuContainer.getBoundingClientRect();
    const itemRect = activeMenuItem.getBoundingClientRect();
    const padding = 8;

    if (itemRect.top < containerRect.top + padding) {
      const delta = itemRect.top - containerRect.top - padding;
      menuContainer.scrollTo({
        top: menuContainer.scrollTop + delta,
        behavior: "smooth",
      });
      return;
    }

    if (itemRect.bottom > containerRect.bottom - padding) {
      const delta = itemRect.bottom - containerRect.bottom + padding;
      menuContainer.scrollTo({
        top: menuContainer.scrollTop + delta,
        behavior: "smooth",
      });
    }
  }, [resolvedActiveSectionId]);

  useEffect(() => {
    if (loading || displayFinancialSections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visibleEntries.length === 0) {
          return;
        }

        const nextActiveSection = visibleEntries[0].target.getAttribute("data-financial-section");
        if (nextActiveSection) {
          setActiveSectionId(nextActiveSection);
        }
      },
      {
        root: null,
        rootMargin: "-160px 0px -55% 0px",
        threshold: [0.1, 0.35, 0.6],
      }
    );

    displayFinancialSections.forEach((section) => {
      const sectionNode = sectionRefs.current[section.key];
      if (sectionNode) {
        observer.observe(sectionNode);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [loading, currentApplicantTab, displayFinancialSections]);

  const handleSectionMenuClick = (sectionId: string) => {
    setActiveSectionId(sectionId);
    sectionRefs.current[sectionId]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDRSViewTabChange = (value: DRSViewTab) => {
    if (!safeApplicationId) {
      return;
    }

    if (value === "medical") {
      navigate(getMedicalPath(safeBusinessType, safeApplicationId), {
        state: { selectedApplicantTab: currentApplicantTab },
      });
      return;
    }

    navigate(getFinancialPath(safeBusinessType, safeApplicationId), {
      state: { selectedApplicantTab: currentApplicantTab },
    });
  };

  const handleFieldValueChange = (sectionKey: FinancialSectionKey, label: string, value: string) => {
    setFinancialFieldValues((currentValues) => {
      const nextSectionValues = {
        ...currentValues[sectionKey],
        [label]: value,
      };

      if (sectionKey === "commission_statement" && COMMISSION_MONTH_LABELS.includes(label as typeof COMMISSION_MONTH_LABELS[number])) {
        const hasEnteredMonth = COMMISSION_MONTH_LABELS.some((monthLabel) => nextSectionValues[monthLabel]?.trim());

        if (!hasEnteredMonth) {
          nextSectionValues[COMMISSION_AVERAGE_PM_LABEL] = "";
          nextSectionValues[COMMISSION_AVERAGE_ANNUAL_LABEL] = "";
        }
      }

      return {
        ...currentValues,
        [sectionKey]: nextSectionValues,
      };
    });

    setSectionErrors((current) => {
      const currentSectionErrors = current[sectionKey];
      if (!currentSectionErrors || !currentSectionErrors[label]) {
        return current;
      }

      const nextSectionErrors = { ...currentSectionErrors };
      delete nextSectionErrors[label];

      return {
        ...current,
        [sectionKey]: nextSectionErrors,
      };
    });
  };

  const transformFinancialFieldValuesToApiFormat = (
    fieldValues: Record<FinancialSectionKey, Record<string, string>>
  ): FinancialDocumentsPayload => {
    const documents: FinancialDocumentsPayload = {};

    // appointment_letter
    const appointmentLetter = fieldValues.appointment_letter;
    if (appointmentLetter && Object.keys(appointmentLetter).length > 0) {
      const doc: Record<string, unknown> = {};
      assignTextField(doc, "companyName", appointmentLetter["Name of the company"]);
      assignTextField(doc, "partyName", appointmentLetter["Name of the employee"]);
      assignTextField(doc, "joiningDt", formatDdMmYyyyToIsoDate(appointmentLetter["Joining Date"]));
      assignNumberField(doc, "grossSalaryPa", appointmentLetter["CTC"]);
      if (hasDocumentFields(doc)) documents.appointment_letter = doc;
    }

    // salary_slips
    const salarySlips = fieldValues.salary_slips;
    if (salarySlips && Object.keys(salarySlips).length > 0) {
      const doc: Record<string, unknown> = {};
      assignTextField(doc, "companyName", salarySlips["Company Name"]);
      assignTextField(doc, "partyName", salarySlips["Life Assured Name"]);
      assignYesNoField(doc, "nameMatchInd", salarySlips["Is Life Assured Name Same?"]);
      assignTextField(doc, "pfUan", salarySlips["PF / UAN No"]);
      assignNumberField(doc, "annualBonus", salarySlips["Annual Bonus/Incentive/Reimbursement"]);

      const months = buildMonthlyEntries(salarySlips, [
        "Gross Salary Pm1",
        "Gross Salary Pm2",
        "Gross Salary Pm3",
        "Gross Salary Pm4",
        "Gross Salary Pm5",
        "Gross Salary Pm6",
      ], "monthlyGrossSalary");

      if (months.length > 0) doc.months = months;
      if (hasDocumentFields(doc)) documents.salary_slips = doc;
    }

    // bank_statement
    const bankStatement = fieldValues.bank_statement;
    if (bankStatement && Object.keys(bankStatement).length > 0) {
      const doc: Record<string, unknown> = {};
      assignTextField(doc, "fullName", bankStatement["Life Assured Name"]);
      assignYesNoField(doc, "nameMatchInd", bankStatement["Is LA Name Match with Doc Name?"]);
      assignTextField(doc, "statementPeriod", bankStatement["Statement Period"]);
      assignNumberField(doc, "openingBalance", bankStatement["Opening Balance"]);
      assignYesNoField(doc, "liPremiumDeductionInd", bankStatement["Life Insurance Premium Deduction Entry"]);
      assignYesNoField(doc, "wineBeerEntriesInd", bankStatement["Wine Beer_Entries"]);
      assignYesNoField(doc, "medEntryInd", bankStatement["Med Entry"]);
      assignYesNoField(doc, "latest6MonthsInd", bankStatement["Latest 6 months statements given"]);
      assignYesNoField(doc, "overdraftInd", bankStatement["Any Overdraft(Negative/Debit) Balances"]);

      const months = buildMonthlyEntries(bankStatement, [
        "Monthly Closing Bal 1",
        "Monthly Closing Bal 2",
        "Monthly Closing Bal 3",
        "Monthly Closing Bal 4",
        "Monthly Closing Bal 5",
        "Monthly Closing Bal 6",
      ], "closingBalance");

      if (months.length > 0) doc.months = months;
      if (hasDocumentFields(doc)) documents.bank_statement = doc;
    }

    // bank_statement_salary_credit
    const bankStatementSalaryCredit = fieldValues.bank_statement_salary_credit;
    if (bankStatementSalaryCredit && Object.keys(bankStatementSalaryCredit).length > 0) {
      const doc: Record<string, unknown> = {};
      assignTextField(doc, "fullName", bankStatementSalaryCredit["Life Assured Name"]);
      assignYesNoField(doc, "nameMatchInd", bankStatementSalaryCredit["Is LA Name Match with Doc Name?"]);
      assignYesNoField(doc, "salaryCreditedInd", bankStatementSalaryCredit["Salary Credited"]);
      assignNumberField(doc, "annualBonus", bankStatementSalaryCredit["Annual Bonus /Incentive /Reimbursement"]);
      assignNumberField(doc, "openingBalance", bankStatementSalaryCredit["Opening Balance"]);
      assignNumberField(doc, "closingBalance", bankStatementSalaryCredit["Closing Balance"]);
      assignTextField(doc, "statementPeriod", bankStatementSalaryCredit["Statement Period"]);

      const months = buildMonthlyEntries(bankStatementSalaryCredit, [
        "Net Salary Credited PM1",
        "Net Salary Credited PM2",
        "Net Salary Credited PM3",
        "Net Salary Credited PM4",
        "Net Salary Credited PM 5",
        "Net Salary Credited PM 6",
      ], "netSalaryCredited");

      if (months.length > 0) doc.months = months;
      if (hasDocumentFields(doc)) documents.bank_statement_salary_credit = doc;
    }

    // commission_statement
    const commissionStatement = fieldValues.commission_statement;
    if (commissionStatement && Object.keys(commissionStatement).length > 0) {
      const doc: Record<string, unknown> = {};
      const months = buildMonthlyEntries(commissionStatement, [
        "Month 1",
        "Month 2",
        "Month 3",
        "Month 4",
        "Month 5",
        "Month 6",
      ], "commissionAmount");

      if (months.length > 0) doc.months = months;
      if (hasDocumentFields(doc)) documents.commission_statement = doc;
    }

    // form_j
    const formJ = fieldValues.form_j;
    if (formJ && Object.keys(formJ).length > 0) {
      const doc: Record<string, unknown> = {};
      assignYesNoField(doc, "nameMatchInd", formJ["Is Form J in the name of LA"]);
      const months = buildMonthlyEntries(formJ, [
        "Month1 Receipt1",
        "Month2 Receipt1",
        "Month3 Receipt1",
        "Month4 Receipt1",
        "Month5 Receipt1",
        "Month6 Receipt1",
      ], "receiptAmount");

      if (months.length > 0) doc.months = months;
      if (hasDocumentFields(doc)) documents.form_j = doc;
    }

    // sip_statement
    const sipStatement = fieldValues.sip_statement;
    if (sipStatement && Object.keys(sipStatement).length > 0) {
      const doc: Record<string, unknown> = {};
      assignYesNoField(doc, "isLaNameSame", sipStatement["Is SIP Statements in the Name of LA"]);
      assignYesNoField(doc, "latest6MonthsInd", sipStatement["Latest 6 Months SIP Statements Given"]);
      const months = buildMonthlyEntries(sipStatement, [
        "SIP Per Month 1",
        "SIP Per Month2",
        "SIP Per Month 3",
        "SIP Per Month4",
        "SIP Per Month 5",
        "SIP Per Month 6",
      ], "sipAmount");

      if (months.length > 0) doc.months = months;
      if (hasDocumentFields(doc)) documents.sip_statement = doc;
    }

    // epf_basic
    const epfBasic = fieldValues.epf_basic;
    if (epfBasic && Object.keys(epfBasic).length > 0) {
      const doc: Record<string, unknown> = {};
      assignTextField(doc, "orgName", epfBasic["Latest Organization Name"]);
      assignYesNoField(doc, "isOrgNameSame", epfBasic["Is Organization Name Same?"]);
      assignNumberField(doc, "income", epfBasic["Income"]);
      if (hasDocumentFields(doc)) documents.epf_basic = doc;
    }

    // epf_advanced
    const epfAdvanced = fieldValues.epf_advanced;
    if (epfAdvanced && Object.keys(epfAdvanced).length > 0) {
      const doc: Record<string, unknown> = {};
      assignTextField(doc, "orgName", epfAdvanced["Latest Organization Name"]);
      assignYesNoField(doc, "isOrgNameSame", epfAdvanced["Is Organization Name Same?"]);
      const months = buildMonthlyEntries(epfAdvanced, [
        "PF Contribution M1",
        "PF Contribution M2",
        "PF Contribution M3",
        "PF Contribution M4",
        "PF Contribution M5",
        "PF Contribution M6",
      ], "pfContribution");

      if (months.length > 0) doc.months = months;
      if (hasDocumentFields(doc)) documents.epf_advanced = doc;
    }

    // form16
    const form16 = fieldValues.form16;
    if (form16 && Object.keys(form16).length > 0) {
      const doc: Record<string, unknown> = {};
      if (getString(form16["Company Name"])) doc.companyName = getString(form16["Company Name"]);
      if (getString(form16["Life Assured Name"])) doc.partyName = getString(form16["Life Assured Name"]);
      const nameMatch = form16["Is Life Assured Name Same With Doc Name?"];
      if (nameMatch) doc.nameMatchInd = getCodeFromDisplayValue(nameMatch, "yes_no");

      const years: Array<Record<string, unknown>> = [];
      for (let i = 1; i <= 3; i++) {
        const suffix = i === 1 ? "" : ` Year ${i}`;
        const assessment = getString(form16[`ASSESSMENT${suffix}`]);
        const salary = getNumeric(form16[`Gross Salary PA${suffix}`]);
        const pan = getString(form16[`Life Assured Pan No${suffix}`]);
        if (assessment || salary || pan) {
          const yearObj: Record<string, unknown> = {};
          if (assessment) yearObj.assessmentYear = assessment;
          if (salary) yearObj.grossSalaryPa = salary;
          if (pan) yearObj.panNumber = pan;
          years.push(yearObj);
        }
      }
      if (years.length > 0) doc.years = years;
      if (Object.keys(doc).length > 0) documents.form16 = doc;
    }

    // form16a
    const form16a = fieldValues.form16a;
    if (form16a && Object.keys(form16a).length > 0) {
      const doc: Record<string, unknown> = {};
      const years: Array<Record<string, unknown>> = [];
      for (let i = 1; i <= 3; i++) {
        const suffix = i === 1 ? "" : ` Year ${i}`;
        const assessment = getString(form16a[`Assessment Year${suffix}`]);
        const receipt = getNumeric(form16a[`Net Receipt pa${suffix}`]);
        if (assessment || receipt) {
          const yearObj: Record<string, unknown> = {};
          if (assessment) yearObj.assessmentYear = assessment;
          if (receipt) yearObj.netReceiptPa = receipt;
          years.push(yearObj);
        }
      }
      if (years.length > 0) doc.years = years;
      if (Object.keys(doc).length > 0) documents.form16a = doc;
    }

    // property_purchase
    const propertyPurchase = fieldValues.property_purchase;
    if (propertyPurchase && Object.keys(propertyPurchase).length > 0) {
      const doc: Record<string, unknown> = {};
      const isPurchased = propertyPurchase["Is Property purchased by LA"];
      if (isPurchased) doc.isPurchasedByLa = getCodeFromDisplayValue(isPurchased, "yes_no");
      if (getNumeric(propertyPurchase["Purchase Price"])) doc.purchasePrice = getNumeric(propertyPurchase["Purchase Price"]);
      if (getString(propertyPurchase["Financial Year of Purchase"])) doc.financialYearOfPurchase = getString(propertyPurchase["Financial Year of Purchase"]);
      if (getNumeric(propertyPurchase["Estimated Market Value of Property"])) doc.estimatedMarketValue = getNumeric(propertyPurchase["Estimated Market Value of Property"]);
      if (Object.keys(doc).length > 0) documents.property_purchase = doc;
    }

    // property_valuation
    const propertyValuation = fieldValues.property_valuation;
    if (propertyValuation && Object.keys(propertyValuation).length > 0) {
      const doc: Record<string, unknown> = {};
      const nameMatch = propertyValuation["Is Property Valuation Report in the name of LA"];
      if (nameMatch) doc.nameMatchInd = getCodeFromDisplayValue(nameMatch, "yes_no");
      if (getNumeric(propertyValuation["Estimated Market Value of Property(as per report)"])) doc.estimatedMarketValue = getNumeric(propertyValuation["Estimated Market Value of Property(as per report)"]);
      if (Object.keys(doc).length > 0) documents.property_valuation = doc;
    }

    // Add remaining sections following the same pattern...
    // For brevity, I'll add the key ones that are commonly used

    // credit_card
    const creditCard = fieldValues.credit_card;
    if (creditCard && Object.keys(creditCard).length > 0) {
      const doc: Record<string, unknown> = {};
      const nameMatch = creditCard["Is Credit card statement in the name of LA"];
      if (nameMatch) doc.nameMatchInd = getCodeFromDisplayValue(nameMatch, "yes_no");
      const isDefaulter = creditCard["Is LA Defaulter in the Payment"];
      if (isDefaulter) doc.isDefaulter = getCodeFromDisplayValue(isDefaulter, "yes_no");
      if (getString(creditCard["Type of Card"])) doc.cardType = getString(creditCard["Type of Card"]);
      if (getNumeric(creditCard["Credit Limit"])) doc.creditLimit = getNumeric(creditCard["Credit Limit"]);
      if (getNumeric(creditCard["Points Earned"])) doc.pointsEarned = getNumeric(creditCard["Points Earned"]);
      if (getNumeric(creditCard["Income Earned"])) doc.incomeEarned = getNumeric(creditCard["Income Earned"]);
      if (Object.keys(doc).length > 0) documents.credit_card = doc;
    }

    // Continue with other sections as needed...

    // gst_income
    const gstIncome = fieldValues.gst_income;
    if (gstIncome && Object.keys(gstIncome).length > 0) {
      const doc: Record<string, unknown> = {};
      const years: Array<Record<string, unknown>> = [];
      for (let i = 1; i <= 4; i++) {
        const suffix = i === 1 ? "" : ` Year ${i}`;
        const assessment = getString(gstIncome[`Assessment Year${suffix}`]);
        const sales = getNumeric(gstIncome[`Gross Sales${suffix}`]);
        const purchases = getNumeric(gstIncome[`Gross Purchases${suffix}`]);
        const profit = getNumeric(gstIncome[`Profit After GST${suffix}`]);
        if (assessment || sales || purchases || profit) {
          const yearObj: Record<string, unknown> = {};
          if (assessment) yearObj.assessmentYear = assessment;
          if (sales) yearObj.grossSales = sales;
          if (purchases) yearObj.grossPurchases = purchases;
          if (profit) yearObj.profitAfterGst = profit;
          years.push(yearObj);
        }
      }
      if (years.length > 0) doc.years = years;
      if (Object.keys(doc).length > 0) documents.gst_income = doc;
    }

    // itr_individual
    const itrIndividual = fieldValues.itr_individual;
    if (itrIndividual && Object.keys(itrIndividual).length > 0) {
      const doc: Record<string, unknown> = {};
      if (getString(itrIndividual["Permanent Account Number"])) doc.panNumber = getString(itrIndividual["Permanent Account Number"]);
      if (getString(itrIndividual["Life Assured Name"])) doc.partyName = getString(itrIndividual["Life Assured Name"]);
      const nameMatch = itrIndividual["Is Life Assured Name Same?"];
      if (nameMatch) doc.nameMatchInd = getCodeFromDisplayValue(nameMatch, "yes_no");
      if (getNumeric(itrIndividual["PF deduction - Salaried customers"])) doc.pfDeduction = getNumeric(itrIndividual["PF deduction - Salaried customers"]);

      const years: Array<Record<string, unknown>> = [];
      for (let i = 1; i <= 3; i++) {
        const suffix = i === 1 ? "" : ` Year ${i}`;
        const assessment = getString(itrIndividual[`Assessment Year${suffix}`]);
        const ackNumber = getString(itrIndividual[`ITR Acknowledgement Number${suffix}`]);
        const panMatchedWithBarcodeValue = itrIndividual[`Pan Number Matched with Barcode Number${suffix}`];
        const panMatchedWithBarcode = panMatchedWithBarcodeValue ? getCodeFromDisplayValue(panMatchedWithBarcodeValue, "yes_no") : undefined;
        const filingDate = getString(itrIndividual[`Date of Filling ITR${suffix}`]);
        const salary = getNumeric(itrIndividual[`Income from Salary(A)${suffix}`]);
        const house = getNumeric(itrIndividual[`Income from House Property${suffix}`]);
        const business = getNumeric(itrIndividual[`Income from Business or Profession(B)${suffix}`]);
        const capital = getNumeric(itrIndividual[`Short term & Capital Gains${suffix}`]);
        const other = getNumeric(itrIndividual[`Income from Other Sources${suffix}`]);
        const agri = getNumeric(itrIndividual[`Agricultural Income${suffix}`]);
        const exempt = getNumeric(itrIndividual[`Exempt Income(C)${suffix}`]);

        if (assessment || salary || business || panMatchedWithBarcode) {
          const yearObj: Record<string, unknown> = {};
          if (assessment) yearObj.assessmentYear = assessment;
          if (ackNumber) yearObj.ackNumber = ackNumber;
          if (panMatchedWithBarcode) yearObj.panNumberMatchedWithBarcodeNumber = panMatchedWithBarcode;
          if (filingDate) yearObj.itrFilingDt = filingDate;
          if (salary) yearObj.incomeFromSalary = salary;
          if (house) yearObj.incomeFromHouseProperty = house;
          if (business) yearObj.incomeFromBusiness = business;
          if (capital) yearObj.shortTermCapitalGains = capital;
          if (other) yearObj.incomeFromOtherSources = other;
          if (agri) yearObj.agriculturalIncome = agri;
          if (exempt) yearObj.exemptIncome = exempt;
          years.push(yearObj);
        }
      }
      if (years.length > 0) doc.years = years;
      if (Object.keys(doc).length > 0) documents.itr_individual = doc;
    }

    // itr_non_individual
    const itrNonIndividual = fieldValues.itr_non_individual;
    if (itrNonIndividual && Object.keys(itrNonIndividual).length > 0) {
      const doc: Record<string, unknown> = {};
      if (getString(itrNonIndividual["Name of Organisation/Firm"])) doc.orgName = getString(itrNonIndividual["Name of Organisation/Firm"]);
      if (getString(itrNonIndividual["Permanent Account Number"])) doc.panNumber = getString(itrNonIndividual["Permanent Account Number"]);

      const years: Array<Record<string, unknown>> = [];
      for (let i = 1; i <= 3; i++) {
        const suffix = i === 1 ? "" : ` Year ${i}`;
        const assessment = getString(itrNonIndividual[`Assessment Year${suffix}`]);
        const business = getNumeric(itrNonIndividual[`Income from Business or Profession${suffix}`]);
        const other = getNumeric(itrNonIndividual[`Income from Other Sources${suffix}`]);

        if (assessment || business) {
          const yearObj: Record<string, unknown> = {};
          if (assessment) yearObj.assessmentYear = assessment;
          if (business) yearObj.incomeFromBusiness = business;
          if (other) yearObj.exemptIncome = other;
          years.push(yearObj);
        }
      }
      if (years.length > 0) doc.years = years;
      if (Object.keys(doc).length > 0) documents.itr_non_individual = doc;
    }

    // computation_of_income
    const computationOfIncome = fieldValues.computation_of_income;
    if (computationOfIncome && Object.keys(computationOfIncome).length > 0) {
      const doc: Record<string, unknown> = {};
      const years: Array<Record<string, unknown>> = [];
      for (let i = 1; i <= 3; i++) {
        const suffix = i === 1 ? "" : ` Year ${i}`;
        const assessment = getString(computationOfIncome[`Assessment Year${suffix}`]);
        const salary = getNumeric(computationOfIncome[`Income from Salary(A)${suffix}`]);
        const exempt = getNumeric(computationOfIncome[`Exempt Income(C)${suffix}`]);

        if (assessment || salary) {
          const yearObj: Record<string, unknown> = {};
          if (assessment) yearObj.assessmentYear = assessment;
          if (salary) yearObj.incomeFromSalary = salary;
          if (exempt) yearObj.exemptIncome = exempt;
          years.push(yearObj);
        }
      }
      if (years.length > 0) doc.years = years;
      if (Object.keys(doc).length > 0) documents.computation_of_income = doc;
    }

    // profit_and_loss
    const profitAndLoss = fieldValues.profit_and_loss;
    if (profitAndLoss && Object.keys(profitAndLoss).length > 0) {
      const doc: Record<string, unknown> = {};
      if (getString(profitAndLoss["Name of Organization/Firm"])) doc.orgName = getString(profitAndLoss["Name of Organization/Firm"]);

      const years: Array<Record<string, unknown>> = [];
      for (let i = 1; i <= 3; i++) {
        const suffix = i === 1 ? "" : ` Year ${i}`;
        const assessment = getString(profitAndLoss[`Assessment Year${suffix}`]);
        const shareCapital = getNumeric(profitAndLoss[`Share Capital or Fixed/Fluctuating Capital${suffix}`]);
        const reserves = getNumeric(profitAndLoss[`Reserves & Surplus${suffix}`]);
        const pbdt = getNumeric(profitAndLoss[`Profit Before Depreciation & Tax (PBDT)${suffix}`]);
        const depreciation = getNumeric(profitAndLoss[`Less : Depreciation${suffix}`]);
        const pbt = getNumeric(profitAndLoss[`Profit Before Tax (PBT)${suffix}`]);
        const tax = getNumeric(profitAndLoss[`Tax${suffix}`]);
        const pat = getNumeric(profitAndLoss[`Profit After Tax (PAT)${suffix}`]);
        const sales = getNumeric(profitAndLoss[`Sales${suffix}`]);

        if (assessment || pat || sales) {
          const yearObj: Record<string, unknown> = {};
          if (assessment) yearObj.assessmentYear = assessment;
          if (shareCapital) yearObj.shareCapital = shareCapital;
          if (reserves) yearObj.reservesSurplus = reserves;
          if (pbdt) yearObj.pbdt = pbdt;
          if (depreciation) yearObj.depreciation = depreciation;
          if (pbt) yearObj.pbt = pbt;
          if (tax) yearObj.tax = tax;
          if (pat) yearObj.profitAfterTax = pat;
          if (sales) yearObj.sales = sales;
          years.push(yearObj);
        }
      }
      if (years.length > 0) doc.years = years;
      if (Object.keys(doc).length > 0) documents.profit_and_loss = doc;
    }

    // fixed_deposit_receipt
    const fixedDeposit = fieldValues.fixed_deposit_receipt;
    if (fixedDeposit && Object.keys(fixedDeposit).length > 0) {
      const doc: Record<string, unknown> = {};
      const nameMatch = fixedDeposit["Is Fixed Deposit Receipt in the name of LA"];
      if (nameMatch) doc.nameMatchInd = getCodeFromDisplayValue(nameMatch, "yes_no");
      const isMatured = fixedDeposit["Is Fixed Deposit Receipts matured"];
      if (isMatured) doc.isMatured = getCodeFromDisplayValue(isMatured, "yes_no");
      if (getNumeric(fixedDeposit["Amount Invested"])) doc.amountInvested = getNumeric(fixedDeposit["Amount Invested"]);
      if (getNumeric(fixedDeposit["Income Earned"])) doc.incomeEarned = getNumeric(fixedDeposit["Income Earned"]);
      if (Object.keys(doc).length > 0) documents.fixed_deposit_receipt = doc;
    }

    // govt_bonds
    const govtBonds = fieldValues.govt_bonds;
    if (govtBonds && Object.keys(govtBonds).length > 0) {
      const doc: Record<string, unknown> = {};
      const nameMatch = govtBonds["Is Bond Certification in the name of LA"];
      if (nameMatch) doc.nameMatchInd = getCodeFromDisplayValue(nameMatch, "yes_no");
      const isMatured = govtBonds["Is Bond Certificate matured"];
      if (isMatured) doc.isMatured = getCodeFromDisplayValue(isMatured, "yes_no");
      if (getNumeric(govtBonds["Amount Invested or Maturity Value, whichever higher"])) doc.amountInvested = getNumeric(govtBonds["Amount Invested or Maturity Value, whichever higher"]);
      if (getNumeric(govtBonds["Income Earned"])) doc.incomeEarned = getNumeric(govtBonds["Income Earned"]);
      if (Object.keys(doc).length > 0) documents.govt_bonds = doc;
    }

    // loan_statement
    const loanStatement = fieldValues.loan_statement;
    if (loanStatement && Object.keys(loanStatement).length > 0) {
      const doc: Record<string, unknown> = {};
      const nameMatch = loanStatement["Is Loan Statements in the name of LA"];
      if (nameMatch) doc.nameMatchInd = getCodeFromDisplayValue(nameMatch, "yes_no");
      const isDefaulter = loanStatement["Is LA Defaulter in the Payment"];
      if (isDefaulter) doc.isDefaulter = getCodeFromDisplayValue(isDefaulter, "yes_no");
      if (getNumeric(loanStatement["Monthly EMI as per Schedule"])) doc.monthlyEmi = getNumeric(loanStatement["Monthly EMI as per Schedule"]);
      if (getNumeric(loanStatement["Income Earned"])) doc.incomeEarned = getNumeric(loanStatement["Income Earned"]);
      if (Object.keys(doc).length > 0) documents.loan_statement = doc;
    }

    // mutual_fund
    const mutualFund = fieldValues.mutual_fund;
    if (mutualFund && Object.keys(mutualFund).length > 0) {
      const doc: Record<string, unknown> = {};
      const nameMatch = mutualFund["Is Mutual Fund Statement in the name of LA"];
      if (nameMatch) doc.nameMatchInd = getCodeFromDisplayValue(nameMatch, "yes_no");
      if (getNumeric(mutualFund["Latest Market Value (as per NAV) in Statement"])) doc.latestMarketValue = getNumeric(mutualFund["Latest Market Value (as per NAV) in Statement"]);
      if (getNumeric(mutualFund["Income Earned"])) doc.incomeEarned = getNumeric(mutualFund["Income Earned"]);
      if (Object.keys(doc).length > 0) documents.mutual_fund = doc;
    }

    // pension_statement
    const pensionStatement = fieldValues.pension_statement;
    if (pensionStatement && Object.keys(pensionStatement).length > 0) {
      const doc: Record<string, unknown> = {};
      if (getNumeric(pensionStatement["Total Monthly Pension"])) doc.totalMonthlyPension = getNumeric(pensionStatement["Total Monthly Pension"]);
      if (Object.keys(doc).length > 0) documents.pension_statement = doc;
    }

    // salary_certificate
    const salaryCertificate = fieldValues.salary_certificate;
    if (salaryCertificate && Object.keys(salaryCertificate).length > 0) {
      const doc: Record<string, unknown> = {};
      if (getNumeric(salaryCertificate["Gross Salary PA"])) doc.grossSalaryPa = getNumeric(salaryCertificate["Gross Salary PA"]);
      if (Object.keys(doc).length > 0) documents.salary_certificate = doc;
    }

    // salary_revision_letter
    const salaryRevisionLetter = fieldValues.salary_revision_letter;
    if (salaryRevisionLetter && Object.keys(salaryRevisionLetter).length > 0) {
      const doc: Record<string, unknown> = {};
      if (getNumeric(salaryRevisionLetter["Gross Salary PA"])) doc.grossSalaryPa = getNumeric(salaryRevisionLetter["Gross Salary PA"]);
      if (Object.keys(doc).length > 0) documents.salary_revision_letter = doc;
    }

    // stock_holding
    const stockHolding = fieldValues.stock_holding;
    if (stockHolding && Object.keys(stockHolding).length > 0) {
      const doc: Record<string, unknown> = {};
      const nameMatch = stockHolding["Is Stock Holding Statement in name of LA/his Business"];
      if (nameMatch) doc.nameMatchInd = getCodeFromDisplayValue(nameMatch, "yes_no");
      if (getNumeric(stockHolding["Gross Total Market Value as per the Stmt"])) doc.estimatedMarketValue = getNumeric(stockHolding["Gross Total Market Value as per the Stmt"]);
      if (getNumeric(stockHolding["Income Earned"])) doc.incomeEarned = getNumeric(stockHolding["Income Earned"]);
      if (Object.keys(doc).length > 0) documents.stock_holding = doc;
    }

    // vehicle_ownership
    const vehicleOwnership = fieldValues.vehicle_ownership;
    if (vehicleOwnership && Object.keys(vehicleOwnership).length > 0) {
      const doc: Record<string, unknown> = {};
      const isRegName = vehicleOwnership["Is Registration Papers in the name of LA"];
      if (isRegName) doc.isRegNameLa = getCodeFromDisplayValue(isRegName, "yes_no");
      const isInvoiceName = vehicleOwnership["Is Purchase invoices in the name of LA"];
      if (isInvoiceName) doc.isInvoiceNameLa = getCodeFromDisplayValue(isInvoiceName, "yes_no");
      if (getNumeric(vehicleOwnership["Purchase Price"])) doc.purchasePrice = getNumeric(vehicleOwnership["Purchase Price"]);
      if (getString(vehicleOwnership["Vehicle RC Number"])) doc.vehicleRcNumber = getString(vehicleOwnership["Vehicle RC Number"]);
      if (Object.keys(doc).length > 0) documents.vehicle_ownership = doc;
    }

    // vahan
    const vahan = fieldValues.vahan;
    if (vahan && Object.keys(vahan).length > 0) {
      const doc: Record<string, unknown> = {};
      const isRegName = vahan["Is Registration Papers in the Name of LA"];
      if (isRegName) doc.isRegNameLa = getCodeFromDisplayValue(isRegName, "yes_no");
      const isInvoiceName = vahan["Is Purchase Invoices in the Name of LA"];
      if (isInvoiceName) doc.isInvoiceNameLa = getCodeFromDisplayValue(isInvoiceName, "yes_no");
      if (getString(vahan["Car RC Number"])) doc.carRcNumber = getString(vahan["Car RC Number"]);
      if (getNumeric(vahan["IDV"])) doc.idv = getNumeric(vahan["IDV"]);
      if (Object.keys(doc).length > 0) documents.vahan = doc;
    }

    // advance_tax
    const advanceTax = fieldValues.advance_tax;
    if (advanceTax && Object.keys(advanceTax).length > 0) {
      const doc: Record<string, unknown> = {};
      // Add fields as per the API structure if this section exists in config
      if (Object.keys(doc).length > 0) documents.advance_tax = doc;
    }

    // ca_networth
    const caNetworth = fieldValues.ca_networth;
    if (caNetworth && Object.keys(caNetworth).length > 0) {
      const doc: Record<string, unknown> = {};
      // Add fields as per the API structure if this section exists in config
      if (Object.keys(doc).length > 0) documents.ca_networth = doc;
    }

    // ca_balance_sheet
    const caBalanceSheet = fieldValues.ca_balance_sheet;
    if (caBalanceSheet && Object.keys(caBalanceSheet).length > 0) {
      const doc: Record<string, unknown> = {};
      // Add fields as per the API structure if this section exists in config
      if (Object.keys(doc).length > 0) documents.ca_balance_sheet = doc;
    }

    // employee_id_card
    const employeeIdCard = fieldValues.employee_id_card;
    if (employeeIdCard && Object.keys(employeeIdCard).length > 0) {
      const doc: Record<string, unknown> = {};
      if (getString(employeeIdCard["Company Name"])) doc.companyName = getString(employeeIdCard["Company Name"]);
      if (getString(employeeIdCard["Employee ID"])) doc.employeeId = getString(employeeIdCard["Employee ID"]);
      if (getString(employeeIdCard["Designation"])) doc.designation = getString(employeeIdCard["Designation"]);
      if (Object.keys(doc).length > 0) documents.employee_id_card = doc;
    }

    return documents;
  };

  const handleSave = async () => {
    const savingSectionKey = editingSectionKey ?? (resolvedActiveSectionId as FinancialSectionKey);
    const activeSection = displayFinancialSections.find((s) => s.key === savingSectionKey);

    const sectionsToValidate = activeSection ? [activeSection] : displayFinancialSections;

    const fieldErrors = sectionsToValidate.reduce<Partial<Record<FinancialSectionKey, Record<string, string>>>>(
      (accumulator, section) => {
        const sectionErrorsMap = section.items.reduce<Record<string, string>>((errorAccumulator, item) => {
          const value = financialFieldValues[section.key]?.[item.label] ?? "";
          const validationError = getFinancialFieldValidationError(section.key, item, String(value));

          if (validationError) {
            errorAccumulator[item.label] = validationError;
          }

          return errorAccumulator;
        }, {});

        const mergedErrors: Record<string, string> = {
          ...sectionErrorsMap,
          ...validateFinancialSectionValues(section.key, financialFieldValues[section.key] ?? {}) as Record<string, string>,
        };

        if (Object.keys(mergedErrors).length > 0) {
          accumulator[section.key] = mergedErrors;
        }

        return accumulator;
      },
      {}
    );

    setSectionErrors(fieldErrors);
    setSubmitMessage(null);

    if (Object.keys(fieldErrors).length > 0) {
      const missingFields = displayFinancialSections.flatMap((section) => {
        const errorsForSection = fieldErrors[section.key] ?? {};

        return Object.entries(errorsForSection)
          .filter(([, message]) => message === getErrorMessage("financialFieldMandatory"))
          .map(([label]) => `${section.title}: ${label}`);
      });

      const preview = missingFields.slice(0, 4).join(", ");
      const suffix = missingFields.length > 4 ? ` and ${missingFields.length - 4} more.` : "";

      setSubmitError(
        missingFields.length > 0
          ? `Please correct highlighted fields before saving. Missing mandatory fields: ${preview}${suffix}`
          : "Please correct highlighted fields before saving."
      );
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError(null);

      const activeSectionValues = {
        [savingSectionKey]: financialFieldValues[savingSectionKey] ?? {},
      } as Record<FinancialSectionKey, Record<string, string>>;

      const requestPayload = {
        applicationNumber: safeApplicationId,
        createdBy: "ui-user",
        partyId: drsPartyId,
        documents: transformFinancialFieldValuesToApiFormat(activeSectionValues),
      };


      const response = await apiRequest<SubmitResponse, unknown>({
        url: url("financialSaveAndCalculate" as ApiKey),
        method: "POST",
        body: requestPayload,
      });

      const calculatedDocuments = response.data?.documents;

      setFinancialFieldValues((currentValues) => ({
        ...currentValues,
        salary_slips: {
          ...currentValues.salary_slips,
          ...(toStringField(calculatedDocuments?.salary_slips?.avgSalaryPmCalculated) != null
            ? { "Average Salary pm": toStringField(calculatedDocuments?.salary_slips?.avgSalaryPmCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.salary_slips?.grossSalaryPaCalculated) != null
            ? { "Gross Salary pa": toStringField(calculatedDocuments?.salary_slips?.grossSalaryPaCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.salary_slips?.avgAnnualIncomeCalculated) != null
            ? { "Average Annual Income": toStringField(calculatedDocuments?.salary_slips?.avgAnnualIncomeCalculated) as string }
            : {}),
        },
        form16: {
          ...currentValues.form16,
          ...(toStringField(calculatedDocuments?.form16?.avgAnnualIncomeCalculated) != null
            ? { "Average Annual Income": toStringField(calculatedDocuments?.form16?.avgAnnualIncomeCalculated) as string }
            : {}),
        },
        form16a: {
          ...currentValues.form16a,
          ...(toStringField(calculatedDocuments?.form16a?.avgAnnualIncomeCalculated) != null
            ? { "Average Annual Income": toStringField(calculatedDocuments?.form16a?.avgAnnualIncomeCalculated) as string }
            : {}),
        },
        commission_statement: {
          ...currentValues.commission_statement,
          ...(toStringField(calculatedDocuments?.commission_statement?.avgCommissionPmCalculated) != null
            ? { "Average commission pm": toStringField(calculatedDocuments?.commission_statement?.avgCommissionPmCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.commission_statement?.avgAnnualIncomeCalculated) != null
            ? { "Average Annual Income": toStringField(calculatedDocuments?.commission_statement?.avgAnnualIncomeCalculated) as string }
            : {}),
        },
        form_j: {
          ...currentValues.form_j,
          ...(toStringField(calculatedDocuments?.form_j?.totalReceiptsCalculated) != null
            ? { "Total Receipts Receipt1": toStringField(calculatedDocuments?.form_j?.totalReceiptsCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.form_j?.avgMonthlyReceiptsCalculated) != null
            ? { "Average Monthly Receipts Receipt1": toStringField(calculatedDocuments?.form_j?.avgMonthlyReceiptsCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.form_j?.annualReceiptsCalculated) != null
            ? { "Annual Receipts Receipt1": toStringField(calculatedDocuments?.form_j?.annualReceiptsCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.form_j?.derivedIncomeCalculated) != null
            ? { "Derived Income Receipt1": toStringField(calculatedDocuments?.form_j?.derivedIncomeCalculated) as string }
            : {}),
        },
        bank_statement: {
          ...currentValues.bank_statement,
          ...(toStringField(calculatedDocuments?.bank_statement?.avgBankBalanceCalculated) != null
            ? { "Average Bank Balance": toStringField(calculatedDocuments?.bank_statement?.avgBankBalanceCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.bank_statement?.avgAnnualIncomeCalculated) != null
            ? { "Average Annual income": toStringField(calculatedDocuments?.bank_statement?.avgAnnualIncomeCalculated) as string }
            : {}),
        },
        bank_statement_salary_credit: {
          ...currentValues.bank_statement_salary_credit,
          ...(toStringField(calculatedDocuments?.bank_statement_salary_credit?.avgNetSalaryCreditedPmCalculated) != null
            ? {
              "Average Net Salary Credited PM": toStringField(
                calculatedDocuments?.bank_statement_salary_credit?.avgNetSalaryCreditedPmCalculated
              ) as string,
            }
            : {}),
          ...(toStringField(calculatedDocuments?.bank_statement_salary_credit?.netSalaryCreditedPaCalculated) != null
            ? { "Net Salary Credited PA": toStringField(calculatedDocuments?.bank_statement_salary_credit?.netSalaryCreditedPaCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.bank_statement_salary_credit?.avgAnnualIncomeCalculated) != null
            ? { "Average Annual Income": toStringField(calculatedDocuments?.bank_statement_salary_credit?.avgAnnualIncomeCalculated) as string }
            : {}),
        },
        sip_statement: {
          ...currentValues.sip_statement,
          ...(toStringField(calculatedDocuments?.sip_statement?.avgMonthlySipCalculated) != null
            ? { "Average Monthly SIP": toStringField(calculatedDocuments?.sip_statement?.avgMonthlySipCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.sip_statement?.avgAnnualIncomeCalculated) != null
            ? { "Average Annual Income": toStringField(calculatedDocuments?.sip_statement?.avgAnnualIncomeCalculated) as string }
            : {}),
        },
        epf_advanced: {
          ...currentValues.epf_advanced,
          ...(toStringField(calculatedDocuments?.epf_advanced?.annualIncomeCalculated) != null
            ? { "Annual Income": toStringField(calculatedDocuments?.epf_advanced?.annualIncomeCalculated) as string }
            : {}),
        },
        gst_income: {
          ...currentValues.gst_income,
          ...(toStringField(calculatedDocuments?.gst_income?.totalGrossSalesCalculated) != null
            ? { "Total of Gross Sales": toStringField(calculatedDocuments?.gst_income?.totalGrossSalesCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.gst_income?.avgGrossSalesCalculated) != null
            ? { "Average Gross Sales": toStringField(calculatedDocuments?.gst_income?.avgGrossSalesCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.gst_income?.avgAnnualIncomeCalculated) != null
            ? { "Average Annual Income": toStringField(calculatedDocuments?.gst_income?.avgAnnualIncomeCalculated) as string }
            : {}),
        },
        computation_of_income: {
          ...currentValues.computation_of_income,
          ...(toStringField(calculatedDocuments?.computation_of_income?.totalGrossTotalIncomeCalculated) != null
            ? { "Total Gross Total Income": toStringField(calculatedDocuments?.computation_of_income?.totalGrossTotalIncomeCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.computation_of_income?.avgGrossTotalIncomeCalculated) != null
            ? { "Average Gross Total Income": toStringField(calculatedDocuments?.computation_of_income?.avgGrossTotalIncomeCalculated) as string }
            : {}),
        },
        itr_individual: {
          ...currentValues.itr_individual,
          ...(toStringField(calculatedDocuments?.itr_individual?.totalGrossTotalIncomeCalculated) != null
            ? { "Total Gross Total Income": toStringField(calculatedDocuments?.itr_individual?.totalGrossTotalIncomeCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.itr_individual?.avgGrossTotalIncomeCalculated) != null
            ? { "Average Gross Total Income": toStringField(calculatedDocuments?.itr_individual?.avgGrossTotalIncomeCalculated) as string }
            : {}),
        },
        itr_non_individual: {
          ...currentValues.itr_non_individual,
          ...(toStringField(calculatedDocuments?.itr_non_individual?.totalGrossTotalIncomeCalculated) != null
            ? { "Total Gross Total Income": toStringField(calculatedDocuments?.itr_non_individual?.totalGrossTotalIncomeCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.itr_non_individual?.avgGrossTotalIncomeCalculated) != null
            ? { "Average Gross Total Income": toStringField(calculatedDocuments?.itr_non_individual?.avgGrossTotalIncomeCalculated) as string }
            : {}),
        },
        profit_and_loss: {
          ...currentValues.profit_and_loss,
          ...(toStringField(calculatedDocuments?.profit_and_loss?.avgGrossIncomeCalculated) != null
            ? { "Average Gross Income": toStringField(calculatedDocuments?.profit_and_loss?.avgGrossIncomeCalculated) as string }
            : {}),
        },
        credit_card: {
          ...currentValues.credit_card,
          ...(toStringField(calculatedDocuments?.credit_card?.derivedIncomeCalculated) != null
            ? { "Derived Income": toStringField(calculatedDocuments?.credit_card?.derivedIncomeCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.credit_card?.avgIncomeCalculated) != null
            ? { "Average Income": toStringField(calculatedDocuments?.credit_card?.avgIncomeCalculated) as string }
            : {}),
        },
        fixed_deposit_receipt: {
          ...currentValues.fixed_deposit_receipt,
          ...(toStringField(calculatedDocuments?.fixed_deposit_receipt?.derivedIncomeCalculated) != null
            ? { "Derived Income": toStringField(calculatedDocuments?.fixed_deposit_receipt?.derivedIncomeCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.fixed_deposit_receipt?.avgIncomeCalculated) != null
            ? { "Average Income": toStringField(calculatedDocuments?.fixed_deposit_receipt?.avgIncomeCalculated) as string }
            : {}),
        },
        govt_bonds: {
          ...currentValues.govt_bonds,
          ...(toStringField(calculatedDocuments?.govt_bonds?.derivedIncomeCalculated) != null
            ? { "Derived Income": toStringField(calculatedDocuments?.govt_bonds?.derivedIncomeCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.govt_bonds?.avgIncomeCalculated) != null
            ? { "Average Income": toStringField(calculatedDocuments?.govt_bonds?.avgIncomeCalculated) as string }
            : {}),
        },
        loan_statement: {
          ...currentValues.loan_statement,
          ...(toStringField(calculatedDocuments?.loan_statement?.derivedIncomeCalculated) != null
            ? { "Derived Income": toStringField(calculatedDocuments?.loan_statement?.derivedIncomeCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.loan_statement?.avgIncomeCalculated) != null
            ? { "Average Income": toStringField(calculatedDocuments?.loan_statement?.avgIncomeCalculated) as string }
            : {}),
        },
        mutual_fund: {
          ...currentValues.mutual_fund,
          ...(toStringField(calculatedDocuments?.mutual_fund?.derivedIncomeCalculated) != null
            ? { "Derived Income": toStringField(calculatedDocuments?.mutual_fund?.derivedIncomeCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.mutual_fund?.avgIncomeCalculated) != null
            ? { "Average Income": toStringField(calculatedDocuments?.mutual_fund?.avgIncomeCalculated) as string }
            : {}),
        },
        pension_statement: {
          ...currentValues.pension_statement,
          ...(toStringField(calculatedDocuments?.pension_statement?.pensionReceivedPaCalculated) != null
            ? { "Pension Received pa": toStringField(calculatedDocuments?.pension_statement?.pensionReceivedPaCalculated) as string }
            : {}),
        },
        property_purchase: {
          ...currentValues.property_purchase,
          ...(toStringField(calculatedDocuments?.property_purchase?.derivedIncomeCalculated) != null
            ? { "Derived Income": toStringField(calculatedDocuments?.property_purchase?.derivedIncomeCalculated) as string }
            : {}),
        },
        property_valuation: {
          ...currentValues.property_valuation,
          ...(toStringField(calculatedDocuments?.property_valuation?.derivedIncomeCalculated) != null
            ? { "Derived Income": toStringField(calculatedDocuments?.property_valuation?.derivedIncomeCalculated) as string }
            : {}),
        },
        salary_certificate: {
          ...currentValues.salary_certificate,
          ...(toStringField(calculatedDocuments?.salary_certificate?.derivedIncomeCalculated) != null
            ? { "Gross Salary PA": toStringField(calculatedDocuments?.salary_certificate?.derivedIncomeCalculated) as string }
            : {}),
        },
        salary_revision_letter: {
          ...currentValues.salary_revision_letter,
          ...(toStringField(calculatedDocuments?.salary_revision_letter?.derivedIncomeCalculated) != null
            ? { "Gross Salary PA": toStringField(calculatedDocuments?.salary_revision_letter?.derivedIncomeCalculated) as string }
            : {}),
        },
        stock_holding: {
          ...currentValues.stock_holding,
          ...(toStringField(calculatedDocuments?.stock_holding?.derivedIncomeCalculated) != null
            ? { "Derived Income": toStringField(calculatedDocuments?.stock_holding?.derivedIncomeCalculated) as string }
            : {}),
          ...(toStringField(calculatedDocuments?.stock_holding?.avgIncomeCalculated) != null
            ? { "Average Income": toStringField(calculatedDocuments?.stock_holding?.avgIncomeCalculated) as string }
            : {}),
        },
        vehicle_ownership: {
          ...currentValues.vehicle_ownership,
          ...(toStringField(calculatedDocuments?.vehicle_ownership?.derivedIncomeCalculated) != null
            ? { "Derived Income": toStringField(calculatedDocuments?.vehicle_ownership?.derivedIncomeCalculated) as string }
            : {}),
        },
        vahan: {
          ...currentValues.vahan,
          ...(toStringField(calculatedDocuments?.vahan?.avgAnnualIncomeCalculated) != null
            ? { "Average Annual Income": toStringField(calculatedDocuments?.vahan?.avgAnnualIncomeCalculated) as string }
            : {}),
        },
      }));

      setSubmitMessage(response.message ?? "Financial details calculated and submitted successfully.");
      setMessageSectionKey(savingSectionKey);
      setEditingSectionKey(null);
      setSnackbarMessage("Details saved");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to calculate and submit financial details.");
      setMessageSectionKey(savingSectionKey);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleReset = (sectionKey: FinancialSectionKey) => {
    const originalSection = originalFinancialFieldValues[sectionKey] ?? {};
    setFinancialFieldValues((prev) => ({
      ...prev,
      [sectionKey]: JSON.parse(JSON.stringify(originalSection)),
    }));

    setEditingSectionKey(null);
    setSectionErrors((prev) => ({ ...prev, [sectionKey]: {} }));
    setSubmitMessage(null);
    setSubmitError(null);
    setMessageSectionKey(null);
  };

  const handleUdsLinkClick = () => {
    if (!udsLink) {
      setSnackbarMessage("UDS link is not available.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    window.open(udsLink, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      {showLoader && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
        >
          <CircularProgress size={64} sx={{ color: "#fff" }} />
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          px: { xs: 1, sm: 1.5 },
          py: 0.75,
          mb: 1,
          border: "1px solid #D7E3EC",
          borderRadius: 1.5,
          background: "linear-gradient(90deg, #F7FBFE 0%, #FFFFFF 100%)",
          boxShadow: "0 2px 8px rgba(15, 91, 146, 0.07)",
        }}
      >
        <BackButton
          label={roleType === "CPT_DATA_ENTRY_NMR_TASK" ? title.backToCPT : title.backToDRS}
          onClick={() => navigate(getDRSPath(safeBusinessType, safeApplicationId))}
        />

        <Button
          onClick={handleUdsLinkClick}
          variant="text"
          size="small"
          sx={{
            minWidth: "auto",
            px: 0.5,
            color: "#344054",
            fontSize: 12,
            fontWeight: 600,
            textTransform: "none",
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            "&:hover": {
              color: "#1D2939",
              backgroundColor: "transparent",
              textDecoration: "underline",
            },
          }}
        >
          View UDS Link
        </Button>
      </Box>

      {roleType !== "CPT_DATA_ENTRY_NMR_TASK" && (
        <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "center" }}>
          <CustomTabs
            tabs={drsViewTabs}
            value="financial"
            onChange={(value: DRSViewTab) => handleDRSViewTabChange(value)}
          />
        </Box>
      )}

      <Box sx={{ mb: 1 }}>
        <BreDecision />
      </Box>

      <Box sx={{ mb: 1 }}>
        <ApplicantProfile />
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: "100%",
            ...(snackbarSeverity === "info" && {
              backgroundColor: "#0f5b92",
              color: "#ffffff",
            }),
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {showScrollTop && (
        <IconButton
          aria-label="Scroll to top"
          title="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          sx={{
            position: "fixed",
            right: { xs: 16, sm: 24 },
            bottom: { xs: 16, sm: 24 },
            zIndex: 1200,
            width: 40,
            height: 40,
            color: "#FFFFFF",
            backgroundColor: "#344054",
            border: "1px solid #475467",
            boxShadow: "0 4px 12px rgba(16, 24, 40, 0.22)",
            transition: "transform 0.2s ease, background-color 0.2s ease",
            "&:hover": {
              backgroundColor: "#1D2939",
              transform: "translateY(-2px)",
            },
          }}
        >
          <Box component="span" sx={{ fontSize: 22, lineHeight: 1 }}>
            ↑
          </Box>
        </IconButton>
      )}

      <Box sx={{ px: 1 }}>


        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 1.5,
            alignItems: "flex-start",
            mt: 1,
            width: "100%",
            minWidth: 0,
          }}
        >
          <Box
            ref={menuContainerRef}
            sx={{
              width: { xs: "100%", md: 280 },
              minWidth: { md: 280 },
              flex: { md: "0 0 280px" },
              position: { xs: "static", md: "sticky" },
              top: { md: 16 },
              alignSelf: "flex-start",
              borderRadius: 1,
              overflow: "hidden",
              border: "1px solid #D6D8DC",
              backgroundColor: "#F8F9FB",
              height: { md: "calc(100vh - 32px)" },
              maxHeight: { md: "calc(100vh - 32px)" },
              overflowY: { md: "auto" },
            }}
          >
            {displayFinancialSections.map((section) => {
              const isActive = section.key === resolvedActiveSectionId;

              return (
                <Box
                  key={section.key}
                  data-financial-menu-id={section.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSectionMenuClick(section.key)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleSectionMenuClick(section.key);
                    }
                  }}
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    borderLeft: isActive ? "3px solid #DE2C3B" : "3px solid transparent",
                    borderBottom: "1px solid #EAECEF",
                    backgroundColor: isActive ? "#FFFFFF" : "transparent",
                    color: isActive ? "#B42318" : "#667085",
                    fontSize: 13,
                    fontWeight: isActive ? 600 : 500,
                    lineHeight: 1.3,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "inherit",
                      fontWeight: "inherit",
                      color: "inherit",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {section.title}
                  </Typography>
                  <Typography sx={{ fontSize: 14, color: "inherit", lineHeight: 1 }}>
                    {"\u203A"}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              flex: "1 1 0",
              minWidth: 0,
              maxWidth: { md: "calc(100% - 292px)" },
              display: "flex",
              flexDirection: "column",
              gap: 2,
              overflowX: "auto",
            }}
          >
            {displayFinancialSections.map((section) => (
              <Box
                key={section.key}
                data-financial-section={section.key}
                ref={(node) => {
                  sectionRefs.current[section.key] = node as HTMLDivElement | null;
                }}
                sx={{
                  scrollMarginTop: "160px",
                  border: "1px solid #E4E7EC",
                  borderRadius: 1.5,
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 1px 2px rgba(16,24,40,0.08)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    px: { xs: 1.5, md: 2 },
                    py: 1.25,
                    borderBottom: "1px solid #E4E7EC",
                    backgroundColor: "#F8FAFC",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1F2937" }}>{section.title}</Typography>
                  {roleType === "CPT_DATA_ENTRY_NMR_TASK" && (
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        {editingSectionKey !== section.key ? (
                          <CustomButton
                            sx={{ minWidth: 80, py: 0.5, fontSize: 13 }}
                            onClick={() => {
                              setSubmitMessage(null);
                              setSubmitError(null);
                              setMessageSectionKey(null);
                              setSectionErrors((prev) => ({ ...prev, [section.key]: {} }));
                              setEditingSectionKey(section.key as FinancialSectionKey);
                            }}
                          >
                            Edit
                          </CustomButton>
                        ) : (
                          <>
                            <CustomButton
                              sx={{ minWidth: 80, py: 0.5, fontSize: 13 }}
                              disabled={submitLoading || !safeApplicationId}
                              onClick={handleSave}
                            >
                              {submitLoading ? "Saving..." : "Save"}
                            </CustomButton>
                            <CustomButton
                              sx={{ minWidth: 80, py: 0.5, fontSize: 13 }}
                              disabled={submitLoading}
                              onClick={() => handleReset(section.key as FinancialSectionKey)}
                            >
                              Reset
                            </CustomButton>
                          </>
                        )}
                      </Box>
                      {/* submitMessage/submitError shown via snackbar */}
                    </Box>
                  )}
                </Box>

                <Box sx={{ p: { xs: 1.25, md: 1.5 } }}>
                  {section.key === "form16"
                    ? renderForm16Section(
                      section,
                      financialFieldValues,
                      editingSectionKey === section.key,
                      sectionErrors[section.key] ?? {},
                      handleFieldValueChange
                    )
                    : section.key === "form16a"
                      ? renderForm16ASection(
                        section,
                        financialFieldValues,
                        editingSectionKey === section.key,
                        sectionErrors[section.key] ?? {},
                        handleFieldValueChange
                      )
                      : section.key === "computation_of_income"
                        ? renderComputationOfIncomeSection(
                          section,
                          financialFieldValues,
                          editingSectionKey === section.key,
                          sectionErrors[section.key] ?? {},
                          handleFieldValueChange
                        )
                        : section.key === "itr_non_individual"
                          ? renderITRNonIndividualSection(
                            section,
                            financialFieldValues,
                            editingSectionKey === section.key,
                            sectionErrors[section.key] ?? {},
                            handleFieldValueChange
                          )
                          : section.key === "itr_individual"
                            ? renderITRIndividualSection(
                              section,
                              financialFieldValues,
                              editingSectionKey === section.key,
                              sectionErrors[section.key] ?? {},
                              handleFieldValueChange
                            )
                            : section.key === "profit_and_loss"
                              ? renderProfitAndLossSection(
                                section,
                                financialFieldValues,
                                editingSectionKey === section.key,
                                sectionErrors[section.key] ?? {},
                                handleFieldValueChange
                              )
                              : section.key === "gst_income"
                                ? renderGstIncomeSection(
                                  section,
                                  financialFieldValues,
                                  editingSectionKey === section.key,
                                  sectionErrors[section.key] ?? {},
                                  handleFieldValueChange
                                )
                                : section.key === "form_j"
                                  ? renderFormJSection(
                                    section,
                                    financialFieldValues,
                                    editingSectionKey === section.key,
                                    sectionErrors[section.key] ?? {},
                                    handleFieldValueChange
                                  )
                                  : renderStandardSection(
                                    section,
                                    financialFieldValues,
                                    editingSectionKey === section.key,
                                    sectionErrors[section.key] ?? {},
                                    handleFieldValueChange
                                  )}

                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2, bgcolor: "#fff", mt: 1, borderRadius: 2 }}>
          <CustomButton sx={{ width: 100, py: 0.5, fontSize: 13, borderRadius: "50px" }}>
            Submit
          </CustomButton>
        </Box>
      </Box>


    </>
  );
};

export default ViewFinancial;
