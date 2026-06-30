import { GridSection } from "../../../../components/layout/GridSection";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store/store";
import { buildFields, formatCurrencyINR, withDashFallback } from "../../../../utils/helpers";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";

const FinanceAndProfession = ({ profile }: ApplicantProfileProps) => {
    const { data } = useSelector((state: RootState) => state.drs);

    const fallbackCustomer = data?.customerDetails?.[0];
    const fallbackPersonal = fallbackCustomer?.personalDetails;
    const fallbackFinancial = (fallbackCustomer?.financialDetail ?? {}) as Record<string, unknown>;
    const fallbackProducer = data?.producerDetails;

    const financial = profile?.applicantFinancialDetails ?? {
        occupation: String(fallbackPersonal?.occupationType ?? ""),
        annualIncome: Number(fallbackFinancial["annualIncome"] || fallbackPersonal?.netIncomeAmt || 0),
        gstin: String(fallbackProducer?.gstInNumber ?? ""),
        organisationType: String(fallbackPersonal?.orgType ?? ""),
        organisationName: String(fallbackPersonal?.orgName ?? ""),
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