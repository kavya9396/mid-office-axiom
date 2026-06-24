import { Box } from "@mui/material";
import { buildFields } from "../../../../utils/helpers";
import type { ApplicantProfileProps } from "./ApplicantProfile";
import { GridSection } from "../../../../components/layout/GridSection";

const Generic = ({ profile }: ApplicantProfileProps) => {
    const generic = profile?.genericDetails;

    const genericDetails = buildFields(generic, [
        { label: "Existing Policy Number", key: "existingPolicyNumber" },
        { label: "Client ID", key: "clientId" },
        { label: "Self Proposed", key: "selfProposed" },
        { label: "Type of Proposer", key: "typeOfProposer" },
        {
            label: "Relationship with Life Assured",
            key: "relationshipWithLifeAssured",
        },
        { label: "Type of Proposal", key: "typeOfProposal" },
    ]);

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