import { Box, Typography } from "@mui/material";
import { buildFields, formatPhone } from "../../../../utils/helpers";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";
import { GridSection } from "../../../../components/layout/GridSection";

const ContactAndAddress = ({ profile }: ApplicantProfileProps) => {
    const communication = profile?.communicationAddressDetails;
    const permanent = profile?.permanentAddressDetails;
    const contact = profile?.contactDetails;

    const communicationAddressDetails = buildFields(communication, [
        { label: "Address Line 1", key: "addressLine1" },
        { label: "Address Line 2", key: "addressLine2" },
        { label: "Address Line 3", key: "addressLine3" },
        { label: "Landmark", key: "landmark" },
        { label: "City", key: "city" },
        { label: "State", key: "state" },
        { label: "Country", key: "country" },
        { label: "Pincode", key: "pincode" },
    ]);

    const permanentAddressDetails = buildFields(permanent, [
        { label: "Address Line 1", key: "addressLine1" },
        { label: "Address Line 2", key: "addressLine2" },
        { label: "Address Line 3", key: "addressLine3" },
        { label: "Landmark", key: "landmark" },
        { label: "City", key: "city" },
        { label: "State", key: "state" },
        { label: "Country", key: "country" },
        { label: "Pincode", key: "pincode" },
    ]);

    const contactDetails = buildFields(contact, [
        { label: "Mobile No.", key: "mobileNumber", format: formatPhone },
        { label: "Email ID", key: "emailId" },
        { label: "Alternate Mobile", key: "alternateMobile" },
        { label: "Landline Number", key: "landlineNumber" },
        { label: "Email Pref", key: "emailPref" },
        { label: "SMS Pref", key: "smsPref" },
    ]);

    return (
        <Box sx={{ mt: 2 }}>
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 2,
                }}
            >
                {/* Communication Address */}
                <SectionCard>
                    <Typography sx={{ fontWeight: 700, mb: 2 }}>Communication Address</Typography>
                    <GridSection columns={3} items={communicationAddressDetails} />
                </SectionCard>

                {/* Permanent Address */}
                <SectionCard>
                    <Typography sx={{ fontWeight: 700, mb: 2 }}>Permanent Address</Typography>
                    <GridSection columns={3} items={permanentAddressDetails} />
                </SectionCard>
            </Box>
            <Box sx={{ mt: 2 }}>
                <SectionCard>
                    <Typography sx={{ fontWeight: 700, mb: 2 }}>Contact Details</Typography>
                    <GridSection columns={4} items={contactDetails} />
                </SectionCard>
            </Box>
        </Box>
    )
};

export default ContactAndAddress