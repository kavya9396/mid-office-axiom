import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store/store";
import { buildFields, withDashFallback } from "../../../../utils/helpers";
import type { ApplicantProfileProps } from "./ApplicantProfile";
import { GridSection } from "../../../../components/layout/GridSection";
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

const Generic = ({ profile }: ApplicantProfileProps) => {
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

    const summaryGeneric = toRecord(selectedSummaryEntry?.genericDetails);

    const customerDetails = data?.customerDetails ?? [];
    const customerWithTabs = customerDetails.map((customer, index) => ({
        customer,
        memberType: mapMemberType(String(customer.lifeType ?? ""), index),
    }));

    const fallbackCustomer =
        customerWithTabs.find((item) => item.memberType === selectedMemberType)?.customer ??
        customerDetails[0];
    const fallbackApplicationInfo = data?.applicationInfo;
    const resolvedClientId = String(selectedSummaryEntry?.clientId ?? fallbackCustomer?.clientId ?? "").trim()
        || String(profile?.genericDetails?.clientId ?? "").trim();

    const selfProposedFromApplicationInfo =
        typeof fallbackApplicationInfo?.isLAPropSame === "boolean"
            ? fallbackApplicationInfo.isLAPropSame
                ? "Yes"
                : "No"
            : String(fallbackApplicationInfo?.isLAPropSame ?? "");

    const generic = {
        ...(profile?.genericDetails ?? {}),
        existingPolicyNumber: String(summaryGeneric?.existingPolicyNumber ?? fallbackApplicationInfo?.spousePolicyNo ?? ""),
        clientId: resolvedClientId,
        selfProposed: String(summaryGeneric?.selfProposed ?? selfProposedFromApplicationInfo),
        typeOfProposer: String(summaryGeneric?.typeOfProposer ?? fallbackApplicationInfo?.proposerType ?? ""),
        relationshipWithLifeAssured: String(summaryGeneric?.relationshipWithLifeAssured ?? selectedSummaryEntry?.proposerLaRelation ?? fallbackCustomer?.proposerLaRelation ?? ""),
        typeOfProposal: String(summaryGeneric?.typeOfProposal ?? fallbackApplicationInfo?.comboFlag ?? ""),
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