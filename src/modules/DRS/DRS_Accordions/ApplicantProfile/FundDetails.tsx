import { GridSection, type GridItem } from "../../../../components/layout/GridSection";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";

const FundDetails = ({ profile }: ApplicantProfileProps) => {
    const fund = profile?.fundDetails;

    const fundDetails: GridItem[] = [
        { label: "Allocation Strategy", value: fund?.allocationStrategy ?? "-" },
        { label: "Total Allocation", value: fund?.totalAllocation ?? "-" },
        { label: "ATP Opted", value: fund?.atpOpted ?? "-" },
        { label: "Fund Name", value: fund?.fundDetail?.name ?? "-" },
        { label: "Fund Amount", value: fund?.fundDetail?.amount ?? "-" },
        { label: "Source Fund", value: fund?.fundDetail?.sourceFund ?? "-" },
        { label: "Target Fund", value: fund?.fundDetail?.targetFund ?? "-" },
        { label: "Switch Date", value: fund?.fundDetail?.switchDate ?? "-" },
        { label: "Transfer Percentage", value: fund?.fundDetail?.transferPercentage ?? "-" },
    ];

    return (
        <SectionCard>
            <GridSection columns={5} items={fundDetails} />
        </SectionCard>
    );
};

export default FundDetails;