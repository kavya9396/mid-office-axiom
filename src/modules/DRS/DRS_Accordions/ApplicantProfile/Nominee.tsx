import { Typography } from "@mui/material";
import { useSelector } from "react-redux";
import type { Column } from "../../../../components/ui/Table/Table";
import type { NomineeRow } from "../../../../types/drs.types";
import type { RootState } from "../../../../store/store";
import { formatDOB, toDisplayValue } from "../../../../utils/helpers";
import type { ApplicantProfileProps } from "./ApplicantProfile";
import CustomTable from "../../../../components/ui/Table/Table";
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

const nomineeColumns: Column<NomineeRow>[] = [
    { key: "nomineeName", header: "Nominee Name", width: "14%" },
    { key: "nomineeDOB", header: "Nominee DOB", width: "12%" },
    { key: "gender", header: "Gender", width: "10%" },
    { key: "relationship", header: "Relationship", width: "12%" },
    { key: "accountNumber", header: "Account Number", width: "14%" },
    { key: "ifsc", header: "IFSC", width: "12%" },
    { key: "sharePercentage", header: "Share %", width: "10%" },
    { key: "appointeeName", header: "Appointee Name", width: "14%" },
    { key: "appointeeGender", header: "Appointee Gender", width: "12%" },
    { key: "appointeeDOB", header: "Appointee DOB", width: "12%" },
];

const Nominee = ({ profile }: ApplicantProfileProps) => {
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

    const fallbackNominees = Array.isArray(selectedSummaryEntry?.nominee)
        ? selectedSummaryEntry.nominee
        : (Array.isArray(data?.nominee) ? data.nominee : []);
    const fallbackAppointees = Array.isArray(selectedSummaryEntry?.appointee)
        ? selectedSummaryEntry.appointee
        : (Array.isArray(data?.appointee) ? data.appointee : []);

    const mappedFallbackNominees: NomineeRow[] = fallbackNominees.map((item, index) => {
        const appointee = fallbackAppointees[index] ?? fallbackAppointees[0];

        return {
            nomineeName: toDisplayValue([item.firstName, item.lastName].filter(Boolean).join(" ")),
            nomineeDOB: toDisplayValue(formatDOB(item.dob)),
            gender: toDisplayValue(item.gender),
            relationship: toDisplayValue(item.proposerNomineeRelation || item.relationWithLA),
            accountNumber: "-",
            ifsc: "-",
            sharePercentage: Number(item.percentage ?? 0),
            appointeeName: appointee
                ? toDisplayValue([appointee.firstName, appointee.lastName].filter(Boolean).join(" "))
                : "-",
            appointeeGender: appointee ? toDisplayValue(appointee.gender) : "-",
            appointeeDOB: appointee ? toDisplayValue(formatDOB(appointee.dob)) : "-",
        };
    });

    const nominees: NomineeRow[] =
        profile?.nominees && profile.nominees.length > 0
            ? profile.nominees
            : mappedFallbackNominees;

    if (nominees.length === 0) {
        return (
            <Typography
                component="span"
                sx={{
                    fontSize: "14px",
                    fontWeight: 700,
                }}
            >
                No nominees have been selected
            </Typography>
        );
    }

    return (
        <CustomTable<NomineeRow>
            title="Nominee Details"
            columns={nomineeColumns}
            data={nominees}
        />
    );
};

export default Nominee