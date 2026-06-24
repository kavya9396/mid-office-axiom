import { Box } from "@mui/material";
import KeyValueTable from "../../../../components/ui/KeyValueTable/KeyValueTable";
import { buildTripleFields } from "../../../../utils/helpers";
import type { ApplicantProfileProps } from "./ApplicantProfile";

const MedicalLifestyle = ({ profile }: ApplicantProfileProps) => {
    const health = profile?.healthInformation;
    const lifestyle = profile?.lifestyleHabits;

    const healthInformationRows = buildTripleFields(health, [
        {
            first: { label: "Height", key: "height" },
            second: { label: "Weight", key: "weight" },
            third: { label: "Diabetes", key: "diabetes" },
        },
        {
            first: { label: "Hypertension", key: "hypertension" },
            second: { label: "Heart Disease", key: "heartDisease" },
            third: { label: "Cancer", key: "cancer" },
        },
        {
            first: { label: "Kidney Disease", key: "kidneyDisease" },
            second: { label: "Liver Disease", key: "liverDisease" },
            third: { label: "Lung Disease", key: "lungDisease" },
        },
        {
            first: { label: "Neurological Disorder", key: "neurologicalDisorder" },
            second: { label: "Mental Disorder", key: "mentalDisorder" },
            third: { label: "HIV/AIDS", key: "hivAids" },
        },
        {
            first: { label: "Any Surgery", key: "anySurgery" },
            second: { label: "Hospitalization", key: "hospitalization" },
            third: { label: "Other Illness", key: "otherIllness" },
        },
        {
            first: { label: "Family Heart Disease", key: "familyHeartDisease" },
            second: { label: "Family Cancer", key: "familyCancer" },
            third: { label: "Family Diabetes", key: "familyDiabetes" },
        },
    ]);

    const lifestyleHabitsRows = buildTripleFields(lifestyle, [
        {
            first: { label: "Alcohol Consumption", key: "alcoholConsumption" },
            second: { label: "Alcohol Quantity", key: "alcoholQuantity" },
            third: { label: "Smoking", key: "smoking" },
        },
        {
            first: { label: "Smoking Quantity", key: "smokingQuantity" },
            second: { label: "Tobacco/Gutka", key: "tobaccoGutka" },
            third: { label: "Narcotics", key: "narcotics" },
        },
        {
            first: { label: "Hazardous Occupation", key: "hazardousOccupation" },
            second: { label: "Aviation Activities", key: "aviationActivities" },
            third: { label: "Diving", key: "diving" },
        },
        {
            first: { label: "Mountaineering", key: "mountaineering" },
            second: { label: "Other Hazardous Activities", key: "otherHazardousActivities" },
            third: { label: "Racing", key: "racing" },
        },
    ]);

    return (
        <>
            <KeyValueTable title="Health Information" rows={healthInformationRows} />
            <Box sx={{ mt: 2 }}>
                <KeyValueTable title="Lifestyle Habits" rows={lifestyleHabitsRows} />
            </Box>
        </>
    );
};

export default MedicalLifestyle