import { GridSection } from "../../../../components/layout/GridSection";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store/store";
import { buildFields, formatCurrencyINR, withDashFallback } from "../../../../utils/helpers";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";
import type { ApplicantTab } from "../../../../types/drs.types";

const mapMemberType = (memberTypeValue: string | undefined, index: number): ApplicantTab => {
    const normalized = memberTypeValue?.trim().toUpperCase() ?? "";

    if (normalized === "PROPOSER" || normalized.includes("PR")) return "proposer";
    if (normalized === "LIFEASSURED1" || normalized === "LIFE ASSURED 1") return "lifeassured1";
    if (normalized === "LIFEASSURED2" || normalized === "LIFE ASSURED 2") return "lifeassured2";
    if (normalized.includes("LA") || normalized.includes("LIFE")) return index === 1 ? "lifeassured1" : "lifeassured2";
    if (index === 0) return "proposer";
    if (index === 1) return "lifeassured1";
    return "lifeassured2";
};

const toRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

const FinanceAndProfession = ({ profile }: ApplicantProfileProps) => {
    const { data } = useSelector((state: RootState) => state.drs);

    const selectedMemberType =
        profile?.memberType ??
        ((localStorage.getItem("drsSelectedApplicantTab") as ApplicantTab | null) ?? "proposer");

    const dataRecord = data as unknown as Record<string, unknown>;
    const summaryEntries = Array.isArray(dataRecord?.summary)
        ? (dataRecord.summary as Array<Record<string, unknown>>)
        : [];

    const summaryWithTabs = summaryEntries.map((entry, index) => ({
        entry,
        memberType: mapMemberType(String(entry.memberType ?? ""), index),
    }));

    const selectedSummaryEntry =
        summaryWithTabs.find((item) => item.memberType === selectedMemberType)?.entry ??
        summaryEntries[0];

    const summaryRecord = toRecord(selectedSummaryEntry);
    // Prefer `personalDetails` when present; fall back to `proposerSummary` used by some mocks
    const summaryPersonal = Object.keys(toRecord(summaryRecord.personalDetails)).length > 0
        ? toRecord(summaryRecord.personalDetails)
        : toRecord(summaryRecord.proposerSummary);
    const summaryApplicantFinancial = toRecord(summaryRecord.applicantFinancialDetails);
    const summaryFinancial = toRecord(summaryRecord.financialDetails);

    const customerDetails = data?.customerDetails ?? [];
    const customerWithTabs = customerDetails.map((customer, index) => ({
        customer,
        memberType: mapMemberType(String(customer.lifeType ?? ""), index),
    }));

    const fallbackCustomer =
        customerWithTabs.find((item) => item.memberType === selectedMemberType)?.customer ??
        customerDetails[0];
    const fallbackPersonal = fallbackCustomer?.personalDetails;
    const fallbackFinancial = (fallbackCustomer?.financialDetail ?? {}) as Record<string, unknown>;
    const fallbackProducer = data?.producerDetails;

    const financial = profile?.applicantFinancialDetails ?? {
        occupation: String(summaryApplicantFinancial?.occupation ?? summaryPersonal?.occupationType ?? fallbackPersonal?.occupationType ?? ""),
        annualIncome: Number(
            summaryApplicantFinancial?.annualIncome ??
            summaryFinancial?.annualIncome ??
            fallbackFinancial["annualIncome"] ??
            summaryPersonal?.netIncomeAmt ??
            fallbackPersonal?.netIncomeAmt ??
            0,
        ),
        gstin: String(summaryApplicantFinancial?.gstin ?? fallbackProducer?.gstInNumber ?? ""),
         industryType: String(summaryPersonal?.industryType ?? ""),
        organisationType: String(summaryApplicantFinancial?.organisationType ?? summaryPersonal?.orgType ?? fallbackPersonal?.orgType ?? ""),
        organisationName: String(summaryApplicantFinancial?.organisationName ?? summaryPersonal?.orgName ?? fallbackPersonal?.orgName ?? ""),
    };

    const financialDetails = withDashFallback(buildFields(financial, [
        { label: "Occupation", key: "occupation" },
        { label: "Annual Income", key: "annualIncome", format: formatCurrencyINR },
        { label: "GSTIN", key: "gstin" },
        { label: "Organisation Type", key: "organisationType" },
        { label: "Organisation Name", key: "organisationName" },
    ] as const));

    return (
        <SectionCard>
            <GridSection columns={5} items={financialDetails} />
        </SectionCard>
    )
};

export default FinanceAndProfession