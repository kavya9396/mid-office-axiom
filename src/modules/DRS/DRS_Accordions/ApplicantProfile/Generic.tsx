import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store/store";
import { buildFields, withDashFallback } from "../../../../utils/helpers";
import type { ApplicantProfileProps } from "./ApplicantProfile";
import { GridSection } from "../../../../components/layout/GridSection";

const Generic = ({ profile }: ApplicantProfileProps) => {
    const { data } = useSelector((state: RootState) => state.drs);

    const fallbackCustomer = data?.customerDetails?.[0];
    const fallbackApplicationInfo = data?.applicationInfo;
    const resolvedClientId = String(fallbackCustomer?.clientId ?? "").trim()
        || String(profile?.genericDetails?.clientId ?? "").trim();

    const generic = {
        ...(profile?.genericDetails ?? {}),
        existingPolicyNumber: String(fallbackApplicationInfo?.spousePolicyNo ?? ""),
        clientId: resolvedClientId,
        selfProposed:
            typeof fallbackApplicationInfo?.isLAPropSame === "boolean"
                ? fallbackApplicationInfo.isLAPropSame
                    ? "Yes"
                    : "No"
                : String(fallbackApplicationInfo?.isLAPropSame ?? ""),
        typeOfProposer: String(fallbackApplicationInfo?.proposerType ?? ""),
        relationshipWithLifeAssured: String(fallbackCustomer?.proposerLaRelation ?? ""),
        typeOfProposal: String(fallbackApplicationInfo?.comboFlag ?? ""),
    };

    const genericDetails = withDashFallback(buildFields(generic, [
        { label: "Existing Policy Number", key: "existingPolicyNumber" },
        { label: "Client ID", key: "clientId" },
        { label: "Self Proposed", key: "selfProposed" },
        { label: "Type of Proposer", key: "typeOfProposer" },
        {
            label: "Relationship with Life Assured",
            key: "relationshipWithLifeAssured",
        },
        { label: "Type of Proposal", key: "typeOfProposal" },
    ]));

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#F6F6F6",
            }}
        >
            <GridSection columns={6} items={genericDetails} />
        </Box>
    );
};


export default Generic