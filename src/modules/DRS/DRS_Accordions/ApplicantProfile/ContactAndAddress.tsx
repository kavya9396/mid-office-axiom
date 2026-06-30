import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store/store";
import { buildFields, formatPhone, withDashFallback } from "../../../../utils/helpers";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";
import { GridSection } from "../../../../components/layout/GridSection";

const ContactAndAddress = ({ profile }: ApplicantProfileProps) => {
    const { data } = useSelector((state: RootState) => state.drs);

    const fallbackCustomer = data?.customerDetails?.[0];
    const fallbackAddresses = Array.isArray(fallbackCustomer?.address)
        ? fallbackCustomer.address
        : [];

    const fallbackPermanentAddress =
        fallbackAddresses.find((item) => String(item.type).toLowerCase() === "permanent") ??
        fallbackAddresses[0] ??
        {};

    const fallbackCommunicationAddress =
        fallbackAddresses.find((item) => String(item.type).toLowerCase() === "communication") ??
        fallbackAddresses.find((item) => String(item.type).toLowerCase() === "correspondence") ??
        fallbackPermanentAddress;

    const communication = profile?.communicationAddressDetails ?? {
        addressLine1: String(fallbackCommunicationAddress.addressLine1 ?? ""),
        addressLine2: String(fallbackCommunicationAddress.addressLine2 ?? ""),
        addressLine3: String(fallbackCommunicationAddress.addressLine3 ?? ""),
        landmark: String(fallbackCommunicationAddress.landmark ?? ""),
        city: String(fallbackCommunicationAddress.city ?? ""),
        state: String(fallbackCommunicationAddress.state ?? ""),
        country: String(fallbackCommunicationAddress.residingCountry ?? ""),
        pincode: String(fallbackCommunicationAddress.pinCode ?? ""),
    };

    const permanent = profile?.permanentAddressDetails ?? {
        addressLine1: String(fallbackPermanentAddress.addressLine1 ?? ""),
        addressLine2: String(fallbackPermanentAddress.addressLine2 ?? ""),
        addressLine3: String(fallbackPermanentAddress.addressLine3 ?? ""),
        landmark: String(fallbackPermanentAddress.landmark ?? ""),
        city: String(fallbackPermanentAddress.city ?? ""),
        state: String(fallbackPermanentAddress.state ?? ""),
        country: String(fallbackPermanentAddress.residingCountry ?? ""),
        pincode: String(fallbackPermanentAddress.pinCode ?? ""),
    };

    const fallbackContact = fallbackCustomer?.communicationDetails;

    const contact = profile?.contactDetails ?? {
        mobileNumber: String(fallbackContact?.mobileNo ?? ""),
        emailId: String(fallbackContact?.emailId ?? ""),
        alternateMobile: String(fallbackContact?.mobileNo ?? ""),
        landlineNumber: String(fallbackContact?.landlineNo ?? ""),
        emailPref: String(fallbackContact?.emailPref ?? ""),
        smsPref: String(fallbackContact?.smsPref ?? ""),
    };

    const communicationAddressDetails = withDashFallback(buildFields(communication, [
        { label: "Address Line 1", key: "addressLine1" },
        { label: "Address Line 2", key: "addressLine2" },
        { label: "Address Line 3", key: "addressLine3" },
        { label: "Landmark", key: "landmark" },
        { label: "City", key: "city" },
        { label: "State", key: "state" },
        { label: "Country", key: "country" },
        { label: "Pincode", key: "pincode" },
    ]));

    const permanentAddressDetails = withDashFallback(buildFields(permanent, [
        { label: "Address Line 1", key: "addressLine1" },
        { label: "Address Line 2", key: "addressLine2" },
        { label: "Address Line 3", key: "addressLine3" },
        { label: "Landmark", key: "landmark" },
        { label: "City", key: "city" },
        { label: "State", key: "state" },
        { label: "Country", key: "country" },
        { label: "Pincode", key: "pincode" },
    ]));

    const contactDetails = withDashFallback(buildFields(contact, [
        { label: "Mobile No.", key: "mobileNumber", format: formatPhone },
        { label: "Email ID", key: "emailId" },
        { label: "Alternate Mobile", key: "alternateMobile" },
        { label: "Landline Number", key: "landlineNumber" },
        { label: "Email Pref", key: "emailPref" },
        { label: "SMS Pref", key: "smsPref" },
    ]));

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