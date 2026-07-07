import { Box, Typography } from "@mui/material";
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

type NomineeTableRow = Pick<
    NomineeRow,
    "nomineeName" | "nomineeDOB" | "gender" | "relationship" | "accountNumber" | "ifsc" | "sharePercentage"
>;

type AppointeeTableRow = Pick<
    NomineeRow,
    "appointeeName" | "appointeeGender" | "appointeeDOB" | "appointeeRelationship"
>;

const nomineeColumns: Column<NomineeTableRow>[] = [
    { key: "nomineeName", header: "Nominee Name", width: "14%" },
    { key: "nomineeDOB", header: "Nominee DOB", width: "12%" },
    { key: "gender", header: "Gender", width: "10%" },
    { key: "relationship", header: "Relationship", width: "12%" },
    { key: "accountNumber", header: "Account Number", width: "14%" },
    { key: "ifsc", header: "IFSC", width: "12%" },
    { key: "sharePercentage", header: "Share %", width: "10%" },
];

const appointeeColumns: Column<AppointeeTableRow>[] = [
    { key: "appointeeName", header: "Appointee Name", width: "14%" },
    { key: "appointeeGender", header: "Appointee Gender", width: "12%" },
    { key: "appointeeDOB", header: "Appointee DOB", width: "12%" },
    { key: "appointeeRelationship", header: "Appointee Relationship", width: "12%" },
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

    const mappedFallbackNominees: NomineeTableRow[] = fallbackNominees.map((item) => ({
        nomineeName: toDisplayValue([item.firstName, item.lastName].filter(Boolean).join(" ")),
        nomineeDOB: toDisplayValue(formatDOB(item.dob)),
        gender: toDisplayValue(item.gender),
        relationship: toDisplayValue(item.proposerNomineeRelation),
        accountNumber: "-",
        ifsc: "-",
        sharePercentage: Number(item.percentage ?? 0),
    }));

    const mappedFallbackAppointees: AppointeeTableRow[] = fallbackAppointees.map((item) => ({
        appointeeName: toDisplayValue([item.firstName, item.lastName].filter(Boolean).join(" ")),
        appointeeGender: toDisplayValue(item.gender),
        appointeeDOB: toDisplayValue(formatDOB(item.dob)),
        appointeeRelationship: toDisplayValue(item.relationWithNominee),
    }));

    const nominees: NomineeTableRow[] =
        profile?.nominees && profile.nominees.length > 0
            ? profile.nominees.map((item) => ({
                nomineeName: toDisplayValue(item.nomineeName),
                nomineeDOB: toDisplayValue(item.nomineeDOB),
                gender: toDisplayValue(item.gender),
                relationship: toDisplayValue(item.relationship),
                accountNumber: toDisplayValue(item.accountNumber),
                ifsc: toDisplayValue(item.ifsc),
                sharePercentage: Number(item.sharePercentage ?? 0),
            }))
            : mappedFallbackNominees;

    const profileAppointees: AppointeeTableRow[] = (profile?.nominees ?? []).map((item) => ({
        appointeeName: toDisplayValue(item.appointeeName),
        appointeeGender: toDisplayValue(item.appointeeGender),
        appointeeDOB: toDisplayValue(item.appointeeDOB),
        appointeeRelationship: toDisplayValue(item.appointeeRelationship),
    }));

    const hasProfileAppointeeData = profileAppointees.some((item) => item.appointeeName !== "-");
    const appointees: AppointeeTableRow[] =
        profile?.nominees && profile.nominees.length > 0 && hasProfileAppointeeData
            ? profileAppointees
            : mappedFallbackAppointees;

    if (nominees.length === 0 && appointees.length === 0) {
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
        <>
            {nominees.length > 0 ? (
                <CustomTable<NomineeTableRow>
                    title="Nominee Details"
                    columns={nomineeColumns}
                    data={nominees}
                />
            ) : (
                <Typography
                    component="span"
                    sx={{
                        fontSize: "14px",
                        fontWeight: 700,
                    }}
                >
                    No nominees have been selected
                </Typography>
            )}

            <Box sx={{ mt: 2 }}>
                {appointees.length > 0 ? (
                    <CustomTable<AppointeeTableRow>
                        title="Appointee Details"
                        columns={appointeeColumns}
                        data={appointees}
                    />
                ) : (
                    <Typography
                        component="span"
                        sx={{
                            fontSize: "14px",
                            fontWeight: 700,
                        }}
                    >
                        No appointees have been selected
                    </Typography>
                )}
            </Box>
        </>
    );
};

export default Nominee