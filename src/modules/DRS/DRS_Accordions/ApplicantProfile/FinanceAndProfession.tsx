import { GridSection } from "../../../../components/layout/GridSection";
import { buildFields, formatCurrencyINR } from "../../../../utils/helpers";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";

const FinanceAndProfession = ({ profile }: ApplicantProfileProps) => {
    const financial = profile?.applicantFinancialDetails;

    const financialDetails = buildFields(financial, [
        { label: "Occupation", key: "occupation" },
        { label: "Annual Income", key: "annualIncome", format: formatCurrencyINR },
        { label: "GSTIN", key: "gstin" },
        { label: "Organisation Type", key: "organisationType" },
        { label: "Organisation Name", key: "organisationName" },
    ] as const);

    return (
        <SectionCard>
            <GridSection columns={5} items={financialDetails} />
        </SectionCard>
    )
};

export default FinanceAndProfession