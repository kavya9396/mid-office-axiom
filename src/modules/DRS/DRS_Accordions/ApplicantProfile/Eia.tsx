import { GridSection } from "../../../../components/layout/GridSection";
import { buildFields } from "../../../../utils/helpers";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";

const Eia = ({ profile }: ApplicantProfileProps) => {
    const eia = profile?.eiaDetails;

    const eiaDetails = buildFields(eia, [
        { label: "Open eIA", key: "openEIA" },
        { label: "Existing eIA Number", key: "existingEIANumber" },
        { label: "Preferred Repository", key: "preferredRepository" },
        { label: "Convert Policies", key: "convertPolicies" },
    ]);

    return (
        <SectionCard>
            <GridSection columns={4} items={eiaDetails} />
        </SectionCard>
    );
};

export default Eia