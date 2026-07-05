import { Box, Typography } from "@mui/material";
import { GridSection, type GridItem } from "../../../../components/layout/GridSection";
import { useSelector } from "react-redux";
import type { Column } from "../../../../components/ui/Table/Table";
import CustomTable from "../../../../components/ui/Table/Table";
import type { RootState } from "../../../../store/store";
import type { FundDetail } from "../../../../types/drs.types";
import { toDisplayValue } from "../../../../utils/helpers";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";

const fundDetailColumns: Column<FundDetail>[] = [
    { key: "name", header: "Fund Name", width: "18%" },
    { key: "amount", header: "Fund Amount", width: "14%" },
    { key: "sourceFund", header: "Source Fund", width: "18%" },
    { key: "targetFund", header: "Target Fund", width: "18%" },
    { key: "switchDate", header: "Switch Date", width: "16%" },
    { key: "transferPercentage", header: "Transfer Percentage", width: "16%" },
];

const FundDetails = ({ profile }: ApplicantProfileProps) => {
    const { data } = useSelector((state: RootState) => state.drs);

    const fund = profile?.fundDetails ?? data?.fundDetails;
    const rawFundDetail = fund?.fundDetail;
    const fundDetailItems = Array.isArray(rawFundDetail)
        ? rawFundDetail
        : (rawFundDetail && typeof rawFundDetail === "object" ? [rawFundDetail] : []);

    const fundDetailRows: FundDetail[] = fundDetailItems.map((item) => ({
            name: toDisplayValue(item.name),
            amount: toDisplayValue(item.amount),
            sourceFund: toDisplayValue(item.sourceFund),
            targetFund: toDisplayValue(item.targetFund),
            switchDate: toDisplayValue(item.switchDate),
            transferPercentage: toDisplayValue(item.transferPercentage),
        }));

    const fundDetails: GridItem[] = [
        { label: "Allocation Strategy", value: fund?.allocationStrategy ?? "-" },
        { label: "Total Allocation", value: fund?.totalAllocation ?? "-" },
        { label: "ATP Opted", value: fund?.atpOpted ?? "-" },
    ];

    return (
        <>
            <SectionCard>
                <GridSection columns={3} items={fundDetails} />
            </SectionCard>

            <Box sx={{ mt: 2 }}>
                {fundDetailRows.length > 0 ? (
                    <CustomTable<FundDetail>
                        title="Fund Detail"
                        columns={fundDetailColumns}
                        data={fundDetailRows}
                    />
                ) : (
                    <Typography
                        component="span"
                        sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                        }}
                    >
                        No fund detail available
                    </Typography>
                )}
            </Box>
        </>

    );
};

export default FundDetails;