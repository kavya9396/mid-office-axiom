import { Box, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../store/store";
import { buildFields, formatPhone, withDashFallback } from "../../../../utils/helpers";
import { SectionCard, type ApplicantProfileProps } from "./ApplicantProfile";
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

const ContactAndAddress = ({ profile }: ApplicantProfileProps) => {
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

    const summaryAddresses = Array.isArray(selectedSummaryEntry?.address)
        ? selectedSummaryEntry.address
        : [];

    const fallbackAddresses = summaryAddresses.length > 0
        ? summaryAddresses
        : (Array.isArray(fallbackCustomer?.address)
            ? fallbackCustomer.address
            : []);

    const fallbackPermanentAddress =
        fallbackAddresses.find((item) => String(item.type).toLowerCase() === "permanent") ??
        fallbackAddresses[0] ??
        {};

    const fallbackCommunicationAddress =
        fallbackAddresses.find((item) => String(item.type).toLowerCase() === "communication") ??
        fallbackAddresses.find((item) => String(item.type).toLowerCase() === "correspondence") ??
        fallbackPermanentAddress;

    const summaryContact = selectedSummaryEntry?.contactDetails as Record<string, unknown> | undefined;
    const fallbackContact = summaryContact && Object.keys(summaryContact).length > 0
        ? summaryContact
        : fallbackCustomer?.communicationDetails;

    const mobileNo = String(fallbackContact?.mobileNo ?? "");

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

    const contact = profile?.contactDetails ?? {
        mobileNumber: mobileNo,
        emailId: String(fallbackContact?.emailId ?? ""),
        alternateMobile: String(fallbackContact?.alternateMobileNo ?? mobileNo),
        std: String(fallbackContact?.std ?? ""),
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
        { label: "STD/ISD Code", key: "std" },
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