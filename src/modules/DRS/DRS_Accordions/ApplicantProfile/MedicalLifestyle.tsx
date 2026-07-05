import { Box, Typography } from "@mui/material";
import KeyValueTable from "../../../../components/ui/KeyValueTable/KeyValueTable";
import { buildTripleFields } from "../../../../utils/helpers";
import { useSelector } from "react-redux";
import type { HealthInformation, LifestyleHabits } from "../../../../types/drs.types";
import type { ApplicantProfileProps } from "./ApplicantProfile";
import type { RootState } from "../../../../store/store";
import { centerFlex } from "../../../../utils/styles";
import type { ApplicantTab } from "../../../../types/drs.types";

type TripleFieldConfig<T> = {
    label: string;
    key: keyof T;
    format?: (value: T[keyof T]) => string;
};

type HealthFieldConfig = TripleFieldConfig<HealthInformation>;
type LifestyleFieldConfig = TripleFieldConfig<LifestyleHabits>;

const conditionHealthFields: HealthFieldConfig[] = [
    { label: "Diabetes", key: "diabetes" },
    { label: "Hypertension", key: "hypertension" },
    { label: "Heart Disease", key: "heartDisease" },
    { label: "Cancer", key: "cancer" },
    { label: "Kidney Disease", key: "kidneyDisease" },
    { label: "Liver Disease", key: "liverDisease" },
    { label: "Lung Disease", key: "lungDisease" },
    { label: "Neurological Disorder", key: "neurologicalDisorder" },
    { label: "Mental Disorder", key: "mentalDisorder" },
    { label: "HIV/AIDS", key: "hivAids" },
    { label: "Any Surgery", key: "anySurgery" },
    { label: "Hospitalization", key: "hospitalization" },
    { label: "Other Illness", key: "otherIllness" },
    { label: "Family Heart Disease", key: "familyHeartDisease" },
    { label: "Family Cancer", key: "familyCancer" },
    { label: "Family Diabetes", key: "familyDiabetes" },
    { label: "Gynecological History", key: "gynecologicalHistory" },
    { label: "Pregnancy History", key: "pregnancyHistory" },
    { label: "Miscarriage History", key: "miscarriageHistory" },
];

const normalizeText = (value: unknown) => String(value ?? "").trim();
const isYesValue = (value: unknown) => {
    const normalized = normalizeText(value).toLowerCase();
    return normalized === "y" || normalized === "yes" || normalized === "true";
};
const formatYesValue = (value: unknown) => (isYesValue(value) ? "Yes" : "-");
const formatHeight = (value: unknown) => {
    const normalized = normalizeText(value);
    return normalized ? `${normalized} Cms` : "-";
};
const formatWeight = (value: unknown) => {
    const normalized = normalizeText(value);
    return normalized ? `${normalized} Kgs` : "-";
};
const formatTextOrDash = (value: unknown) => normalizeText(value) || "-";

const withFormat = <T,>(
    fields: TripleFieldConfig<T>[],
    format: (value: unknown) => string
): TripleFieldConfig<T>[] => fields.map((field) => ({ ...field, format }));

const toTripleRows = <T,>(fields: TripleFieldConfig<T>[], placeholderKey: keyof T) => {
    const placeholderField: TripleFieldConfig<T> = {
        label: "-",
        key: placeholderKey,
        format: () => "-",
    };

    const rows: Array<{
        first: TripleFieldConfig<T>;
        second: TripleFieldConfig<T>;
        third: TripleFieldConfig<T>;
    }> = [];

    for (let index = 0; index < fields.length; index += 3) {
        rows.push({
            first: fields[index] ?? placeholderField,
            second: fields[index + 1] ?? placeholderField,
            third: fields[index + 2] ?? placeholderField,
        });
    }

    return rows;
};

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

const MedicalLifestyle = ({ profile }: ApplicantProfileProps) => {
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

    const customerDetails = data?.customerDetails ?? [];
    const customerWithTabs = customerDetails.map((customer, index) => ({
        customer,
        memberType: mapMemberType(String(customer.lifeType ?? ""), index),
    }));

    const fallbackCustomer =
        customerWithTabs.find((item) => item.memberType === selectedMemberType)?.customer ??
        customerDetails[0];

    const summaryHealthDetail = (selectedSummaryEntry?.healthDetail ?? {}) as Record<string, unknown>;
    const fallbackHealthDetail = Object.keys(summaryHealthDetail).length > 0
        ? summaryHealthDetail
        : ((fallbackCustomer?.healthDetail ?? {}) as Record<string, unknown>);
    const fallbackSubstanceConsumption = Array.isArray(fallbackHealthDetail["substanceConsumption"])
        ? (fallbackHealthDetail["substanceConsumption"] as Array<Record<string, unknown>>)
        : [];
    const firstSubstance = fallbackSubstanceConsumption[0] ?? {};
    const fallbackIllness = Array.isArray(fallbackHealthDetail["illnessOrImpairment"])
        ? (fallbackHealthDetail["illnessOrImpairment"] as unknown[])
            .map((item) => normalizeText(item))
            .filter(Boolean)
            .join(", ")
        : "";

    const health: HealthInformation = profile?.healthInformation ?? {
        height: normalizeText(fallbackHealthDetail["height"]),
        weight: normalizeText(fallbackHealthDetail["weight"]),
        diabetes: "",
        hypertension: "",
        heartDisease: "",
        cancer: "",
        kidneyDisease: "",
        liverDisease: "",
        lungDisease: "",
        neurologicalDisorder: "",
        mentalDisorder: "",
        hivAids: "",
        anySurgery: "",
        hospitalization: "",
        otherIllness: fallbackIllness,
        familyHeartDisease: "",
        familyCancer: "",
        familyDiabetes: "",
        gynecologicalHistory: "",
        pregnancyHistory: "",
        miscarriageHistory: "",
    };

    const lifestyle: LifestyleHabits = profile?.lifestyleHabits ?? {
        alcoholConsumption: "",
        alcoholQuantity: "",
        smoking: normalizeText(firstSubstance.substance) ? "Yes" : "",
        smokingQuantity: normalizeText(
            (firstSubstance.quantity as Record<string, unknown> | undefined)?.amount
        ),
        tobaccoGutka: "",
        narcotics: "",
        hazardousOccupation: normalizeText(fallbackHealthDetail["hazardousOccupation"]),
        aviationActivities: "",
        diving: "",
        mountaineering: "",
        otherHazardousActivities: "",
        racing: "",
    };

    const formattedBaseHealthFields: HealthFieldConfig[] = [
        { label: "Height", key: "height", format: formatHeight as (value: HealthInformation[keyof HealthInformation]) => string },
        { label: "Weight", key: "weight", format: formatWeight as (value: HealthInformation[keyof HealthInformation]) => string },
    ];

    const formattedConditionHealthFields = withFormat<HealthInformation>(
        conditionHealthFields,
        formatYesValue
    );

    const positiveConditionFields = formattedConditionHealthFields.filter((field) =>
        isYesValue(health?.[field.key])
    );

    const noMedicalHistoryField: HealthFieldConfig = {
        label: "Other Medical History",
        key: "diabetes",
        format: () => "No",
    };

    const healthFieldsToDisplay = [
        ...formattedBaseHealthFields,
        ...(positiveConditionFields.length > 0 ? positiveConditionFields : [noMedicalHistoryField]),
    ];

    const healthInformationRows = buildTripleFields(
        health,
        toTripleRows(healthFieldsToDisplay, "height")
    );

    const lifestyleConditionFields: LifestyleFieldConfig[] = withFormat<LifestyleHabits>([
        { label: "Alcohol Consumption", key: "alcoholConsumption" },
        { label: "Smoking", key: "smoking" },
        { label: "Tobacco/Gutka", key: "tobaccoGutka" },
        { label: "Narcotics", key: "narcotics" },
        { label: "Hazardous Occupation", key: "hazardousOccupation" },
        { label: "Aviation Activities", key: "aviationActivities" },
        { label: "Diving", key: "diving" },
        { label: "Mountaineering", key: "mountaineering" },
        { label: "Other Hazardous Activities", key: "otherHazardousActivities" },
        { label: "Racing", key: "racing" },
    ], formatYesValue);

    const lifestyleFieldsToDisplay: LifestyleFieldConfig[] = [];

    if (isYesValue(lifestyle?.alcoholConsumption)) {
        lifestyleFieldsToDisplay.push(
            {
                label: "Alcohol Consumption",
                key: "alcoholConsumption",
                format: formatYesValue as (value: LifestyleHabits[keyof LifestyleHabits]) => string,
            },
            {
                label: "Alcohol Quantity",
                key: "alcoholQuantity",
                format: formatTextOrDash as (value: LifestyleHabits[keyof LifestyleHabits]) => string,
            }
        );
    }

    if (isYesValue(lifestyle?.smoking)) {
        lifestyleFieldsToDisplay.push(
            {
                label: "Smoking",
                key: "smoking",
                format: formatYesValue as (value: LifestyleHabits[keyof LifestyleHabits]) => string,
            },
            {
                label: "Smoking Quantity",
                key: "smokingQuantity",
                format: formatTextOrDash as (value: LifestyleHabits[keyof LifestyleHabits]) => string,
            }
        );
    }

    lifestyleConditionFields
        .filter((field) => field.key !== "alcoholConsumption" && field.key !== "smoking")
        .forEach((field) => {
            if (isYesValue(lifestyle?.[field.key])) {
                lifestyleFieldsToDisplay.push(field);
            }
        });

    const hasLifestyleHabits = lifestyleFieldsToDisplay.length > 0;

    const lifestyleHabitsRows = buildTripleFields(
        lifestyle,
        toTripleRows(lifestyleFieldsToDisplay, "alcoholConsumption")
    );

    return (
        <>
            <KeyValueTable title="Health Information" rows={healthInformationRows} />
            <Box sx={{ mt: 2 }}>
                {hasLifestyleHabits ? (
                    <KeyValueTable title="Lifestyle Habits" rows={lifestyleHabitsRows} />
                ) : (
                    <Box
                        sx={{
                            backgroundColor: "#F1F1F1",
                            borderRadius: 5,
                            overflow: "hidden",
                            border: "1px solid #E3E3E3",
                        }}
                    >
                        <Box
                            sx={{
                                px: 2.5,
                                py: 1.25,
                                backgroundColor: "#0D4F81",
                            }}
                        >
                            <Typography
                                sx={{
                                    color: "#FFFFFF",
                                    fontSize: 14,
                                    fontWeight: 700,
                                    lineHeight: 1.2,
                                }}
                            >
                                Lifestyle Habits
                            </Typography>
                        </Box>
                        <Box sx={{ ...centerFlex, bgcolor: "#D2D7DE" }}>
                            <Typography sx={{ color: "#4B5563", fontSize: 14, fontWeight: 400, my: 1 }}>
                                No Lifestyle Habits
                            </Typography>
                        </Box>
                    </Box>
                )}
            </Box>
        </>
    );
};

export default MedicalLifestyle;