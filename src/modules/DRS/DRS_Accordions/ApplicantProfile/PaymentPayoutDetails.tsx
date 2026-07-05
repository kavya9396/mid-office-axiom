import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import { GridSection, type GridItem } from "../../../../components/layout/GridSection";
import type { RootState } from "../../../../store/store";
import { toDisplayValue } from "../../../../utils/helpers";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";

const toRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

const PaymentPayoutDetails = ({ profile }: ApplicantProfileProps) => {
    const { data } = useSelector((state: RootState) => state.drs);

    const profileRecord = toRecord(profile as unknown);
    const payoutFromProfile = toRecord(profileRecord.payoutDetails);

    const drsRecord = toRecord(data as unknown);
    const payoutFromDrs = toRecord(drsRecord.payoutDetails);
    const producerDetails = toRecord(drsRecord.producerDetails);
    const groupDetails = toRecord(drsRecord.groupDetails);
    const sourcingDetail = toRecord(drsRecord.sourcingDetail);

    const payoutDetails = Object.keys(payoutFromProfile).length > 0
        ? payoutFromProfile
        : payoutFromDrs;

    const paymentDetails: GridItem[] = [
        {
            label: "Is it a Third Party payment",
            value: toDisplayValue(
                payoutDetails.isThirdPartyPayment ??
                payoutDetails.thirdPartyPayment ??
                payoutDetails.thirdPartyIndicator,
            ),
        },
        {
            label: "Payment Options",
            value: toDisplayValue(
                payoutDetails.paymentOptions ??
                payoutDetails.paymentOption ??
                producerDetails.premiumPaymentOption,
            ),
        },
    ];

    const payoutGridDetails: GridItem[] = [
        {
            label: "Account Type",
            value: toDisplayValue(payoutDetails.accountType),
        },
        {
            label: "Bank Type",
            value: toDisplayValue(payoutDetails.bankType ?? groupDetails.bankType),
        },
        {
            label: "Branch",
            value: toDisplayValue(payoutDetails.branchName ?? sourcingDetail.branch),
        },
        {
            label: "MICR Code",
            value: toDisplayValue(payoutDetails.micr ?? payoutDetails.micrCode),
        },
        {
            label: "IFSC code",
            value: toDisplayValue(payoutDetails.ifsc ?? payoutDetails.ifscCode),
        },
        {
            label: "Account Number",
            value: toDisplayValue(payoutDetails.accountNo ?? payoutDetails.accountNumber),
        }
    ];

    return (
        <>
            <SectionCard>
                <GridSection title="Payment details" columns={3} items={paymentDetails} />
            </SectionCard>

            <Box sx={{ mt: 2 }}>
                <SectionCard>
                    <GridSection title="Payout Details" columns={3} items={payoutGridDetails} />
                </SectionCard>
            </Box>
        </>
    );
};

export default PaymentPayoutDetails;