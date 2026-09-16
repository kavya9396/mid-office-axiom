import { Avatar, Box, MenuItem, TextField, Typography } from "@mui/material";
import { useState } from "react";

import CustomButton from "../../components/ui/Button/Button";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import { UserProfileIcon } from "../../icons/Icons";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
// import RequirementManagement from "./DRS_Accordions/RequirementManagement";

type UnknownRecord = Record<string, unknown>;

interface MASProps {
    /** Header offset used by the sticky banner. */
    stickyTop?: number | string;
    /** Optional data override, useful when the component is rendered outside DRS. */
    data?: unknown;
    readOnly?: boolean;
    isSubmitting?: boolean;
    onSubmit?: (payload: {
        decision: string;
        remarks: string;
    }) => void | Promise<void>;
}

const MAS_DECISION_OPTIONS = [
    "Accept",
    "Reject",
    "Raise Requirement",
    "Refer to IT",
] as const;

interface RiderSummary {
    id: string;
    name: string;
    sumAssured: string;
    policyTerm: string;
    premiumTerm: string;
    premium: string;
}

interface ApplicationSummaryBannerProps {
    onBackToInbox?: () => void;
    image?: string;
    name: string;
    appNo: string;
    personalSummary: string;
    parameters: string;
    productName: string;
    policyTerm: string;
    premiumTerm: string;
    sumAssured: string;
    tsa: string;
    tfsa: string;
    tssa: string;
    tpsa: string;
    riderSummaries: RiderSummary[];
    onViewRiders: () => void;
}

const toRecord = (value: unknown): UnknownRecord =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as UnknownRecord)
        : {};

const firstValue = (...values: unknown[]): unknown =>
    values.find(
        (value) => value !== null && value !== undefined && value !== "",
    );

const displayText = (value: unknown): string => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    return String(value);
};

const formatCurrency = (value: unknown): string => {
    if (value === null || value === undefined || value === "") {
        return "-";
    }

    const numericValue = Number(value);

    return Number.isFinite(numericValue)
        ? `₹${new Intl.NumberFormat("en-IN").format(numericValue)}`
        : displayText(value);
};

const toDateInputValue = (value: unknown): string => {
    const rawValue = displayText(value);

    if (rawValue === "-") {
        return "";
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
        return rawValue;
    }

    const parsedDate = new Date(rawValue);

    return Number.isNaN(parsedDate.getTime())
        ? ""
        : parsedDate.toISOString().slice(0, 10);
};

const getFullName = (person: UnknownRecord): string =>
    [person.firstName, person.middleName, person.lastName]
        .filter(Boolean)
        .map(String)
        .join(" ") || "-";

const getAddress = (member: UnknownRecord): string => {
    const addressValue = member.address;
    const addresses = Array.isArray(addressValue)
        ? addressValue
        : Object.keys(toRecord(addressValue)).length > 0
            ? [addressValue]
            : [];
    const address = toRecord(addresses[0]);

    return (
        [address.city, address.state, address.residingCountry, address.pinCode]
            .filter(Boolean)
            .map(String)
            .join(" - ") || "-"
    );
};

const ApplicationSummaryBanner = ({
    image,
    name,
    personalSummary,
    parameters,
    productName,
    // policyTerm,
    // premiumTerm,
    sumAssured,
    tsa,
    tfsa,
    tssa,
    tpsa,
    riderSummaries,
    // onViewRiders,
}: ApplicationSummaryBannerProps) => {
    const coverageItems = [
        `SA - ${sumAssured}`,
        tsa !== "-" ? `TSA - ${tsa}` : null,
        tfsa !== "-" ? `TFSA - ${tfsa}` : null,
        tssa !== "-" ? `TSSA - ${tssa}` : null,
        tpsa !== "-" ? `TPSA - ${tpsa}` : null,
    ].filter(Boolean) as string[];

    return (
        <Box
            sx={{
                width: "100%",
                mb: 0.75,
                display: "grid",
                gridTemplateColumns: {
                    xs: "84px minmax(0,1fr)",
                    sm: "150px minmax(0,1fr)",
                },
                bgcolor: "#FFEAD7",
                color: "#000",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 3px 10px rgba(169, 33, 41, 0.16)",
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    minHeight: { xs: 112, sm: 138 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "linear-gradient(145deg, #E45F14 0%, #C83C2F 100%)",
                }}
            >
                <Avatar
                    src={image || undefined}
                    alt={name === "-" ? "Applicant" : name}
                    sx={{
                        width: { xs: 54, sm: 76 },
                        height: { xs: 54, sm: 76 },
                        bgcolor: "rgba(255,255,255,.18)",
                        color: "#000",
                        border: "2px solid rgba(255,255,255,.45)",
                    }}
                >
                    <UserProfileIcon sx={{ fontSize: { xs: 30, sm: 44 } }} />
                </Avatar>
            </Box>

            <Box
                sx={{ minWidth: 0, px: { xs: 1.2, sm: 2.2 }, py: { xs: 1, sm: 1.45 } }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                        mb: 0.4,
                    }}
                >
                    <Typography
                        title={name}
                        sx={{
                            minWidth: 0,
                            color: "#000",
                            fontSize: {
                                xs: 14,
                                sm: 16,
                            },
                            fontWeight: 900,
                            lineHeight: 1.25,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Rudra Prakash Sangha
                    </Typography>

                    <Typography
                        sx={{
                            flexShrink: 0,
                            px: 1.1,
                            py: 0.45,
                            borderRadius: "16px",
                            bgcolor: "#FFFFFF",
                            border: "1px solid rgba(169,33,41,.18)",
                            color: "#A92129",
                            fontSize: { xs: 11, sm: 13 },
                            fontWeight: 900,
                            whiteSpace: "nowrap",
                        }}
                    >
                        App No. - OB90377122
                    </Typography>
                </Box>

                <Typography
                    sx={{
                        color: "#000",
                        fontSize: {
                            xs: 10,
                            sm: 11.5,
                        },
                        lineHeight: 1.6,
                        fontWeight: 500,
                        overflowWrap: "anywhere",
                    }}
                >
                    {personalSummary || "-"}
                </Typography>

                <Typography
                    sx={{
                        mt: 0.5,
                        color: "#000",
                        fontSize: {
                            xs: 10,
                            sm: 11.5,
                        },
                        lineHeight: 1.65,
                        fontWeight: 800,
                        overflowWrap: "anywhere",
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            color: "#000",
                            fontWeight: 700,
                        }}
                    >
                        {productName}
                    </Box>
                    {" / "}
                    Channel:{" "}
                    <Box
                        component="span"
                        sx={{
                            color: "#000",
                            fontWeight: 700,
                        }}
                    >
                        Agency
                    </Box>
                    {coverageItems.map((item) => (
                        <Box
                            component="span"
                            key={item}
                            sx={{
                                color: "#000",
                                fontWeight: 700,
                            }}
                        >
                            {" / "}
                            {item}
                        </Box>
                    ))}
                    {" / "}
                    {riderSummaries.map((rider, index) => (
                        <Box component="span" key={`${rider.name}-${index}`}>
                            {rider.name} - SA ₹{rider.sumAssured}
                            {index < riderSummaries.length - 1 ? " / " : ""}
                        </Box>
                    ))}
                </Typography>

                <Box
                    sx={{
                        mt: 0.45,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 0.35,
                        flexWrap: "wrap",
                    }}
                >
                    <Typography
                        component="span"
                        sx={{
                            color: "#000",
                            fontSize: {
                                xs: 10,
                                sm: 11.5,
                            },
                            lineHeight: 1.6,
                            fontWeight: 500,
                            overflowWrap: "anywhere",
                        }}
                    >
                        {parameters || "-"}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

// const summaryActionSx = {
//     minWidth: "auto",
//     px: 1.4,
//     py: 0.55,
//     border: "1px solid #E45F14",
//     borderRadius: "18px",
//     bgcolor: "#FFF4EC",
//     color: "#A92129",
//     fontSize: { xs: 10, sm: 11 },
//     fontWeight: 900,
//     lineHeight: 1.2,
//     textTransform: "none",
//     whiteSpace: "nowrap",
//     boxShadow: "0 2px 7px rgba(169,33,41,.12)",
//     "& .MuiButton-startIcon": {
//         mr: 0.55,
//         ml: 0,
//     },
//     "&:hover": {
//         borderColor: "#C83C2F",
//         bgcolor: "#FFEAD7",
//         boxShadow: "0 3px 9px rgba(169,33,41,.18)",
//         transform: "translateY(-1px)",
//     },
// } as const;

const MAS = ({
    stickyTop = 72,
    data,
    readOnly = false,
    isSubmitting = false,
}: MASProps) => {
    const drsData = useAppSelector((state: RootState) => state.drs.data);
    const [masDecision, setMasDecision] = useState("");
    const [submitConfirmationOpen, setSubmitConfirmationOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const submitInProgress = isSubmitting || submitting;

    const source = toRecord(data ?? drsData);
    const applicationOverview = toRecord(source.applicationOverview);
    const masDetails = toRecord(source.masDetails);

    const premiumDebitDate = toDateInputValue(
        firstValue(
            masDetails.dateOfPremiumDebit,
            source.dateOfPremiumDebit,
            applicationOverview.dateOfPremiumDebit,
        ),
    );
    const frontlineEmailDate = toDateInputValue(
        firstValue(
            masDetails.dateOfEmailReceivedFromFrontline,
            source.dateOfEmailReceivedFromFrontline,
            applicationOverview.dateOfEmailReceivedFromFrontline,
        ),
    );
    const eopsReferenceNumber = displayText(
        firstValue(
            masDetails.eopsReferenceNumber,
            source.eopsReferenceNumber,
            applicationOverview.eopsReferenceNumber,
        ),
    );

    const [dateOfPremiumDebit, setDateOfPremiumDebit] = useState(
        premiumDebitDate,
    );
    const [dateOfEmailReceived, setDateOfEmailReceived] = useState(
        frontlineEmailDate,
    );
    const [eopsReference, setEopsReference] = useState(
        eopsReferenceNumber === "-" ? "" : eopsReferenceNumber,
    );

    const members = Array.isArray(source.summary)
        ? source.summary.map(toRecord)
        : [];
    const applicant = members[0] ?? {};
    const applicantDetails = toRecord(applicant.applicantDetails);
    const personalDetails = toRecord(applicant.personalDetails);
    const personal = {
        ...applicantDetails,
        ...personalDetails,
        ...toRecord(applicant.personalSummary),
        ...toRecord(applicant.proposerSummary),
    };
    const financialDetails = {
        ...toRecord(applicant.applicantFinancialDetails),
        ...toRecord(applicant.financialDetails),
    };

    const products = Array.isArray(applicationOverview.productDetail)
        ? applicationOverview.productDetail.map(toRecord)
        : [];
    const baseProduct =
        products.find(
            (product) => String(product.type ?? "").toLowerCase() === "base",
        ) ??
        products[0] ??
        applicationOverview;

    const riders = Array.isArray(applicationOverview.riderDetails)
        ? applicationOverview.riderDetails.map(toRecord)
        : products.filter(
            (product) => String(product.type ?? "").toLowerCase() === "rider",
        );

    const name = getFullName({ ...applicant, ...personal });
    const rawAge = personal.age;
    const ageValue = firstValue(
        toRecord(rawAge).years,
        typeof rawAge !== "object" ? rawAge : undefined,
        applicantDetails.age,
    );
    const address = getAddress({
        ...applicant,
        address: firstValue(
            applicant.address,
            personal.address,
            applicantDetails.address,
        ),
    });
    const annualIncome = formatCurrency(
        firstValue(
            financialDetails.annualIncome,
            personalDetails.netIncomeAmt,
        ),
    );

    const personalSummary = [
        displayText(personal.maritalStatus ?? applicantDetails.maritalStatus),
        ageValue ? `${displayText(ageValue)} years` : "-",
        displayText(personal.gender ?? applicantDetails.gender),
        displayText(personal.education ?? applicantDetails.education),
        annualIncome !== "-" ? `${annualIncome} p.a.` : "-",
        address,
        displayText(personal.nationality ?? applicantDetails.nationality),
        displayText(personal.residentStatus ?? personal.countryOfResidence),
    ]
        .filter((value) => value !== "-")
        .join(" / ");

    const parameters = [
        "TSA - ₹10,00,000",
        "TRSA - ₹5,00,000",
        "TPSA - ₹10,00,000",
        "TFSA - ₹10,00,000",
        "TSSA - ₹10,00,000",
        "ADBR TSA - ₹5,00,000",
        "ATPD TSA - ₹5,00,000",
        "CI Rider TSA - ₹3,00,000",
        "CI Rider TRSA - ₹3,00,000",
        "WOP TSA - ₹10,00,000",
        "BTBB TSA - ₹5,00,000",
        "Total Premium - ₹10,000",
    ]
        .filter((value) => value !== "-")
        .join(" / ");

    const riderSummaries: RiderSummary[] = riders
        .map((rider, index) => ({
            id: String(firstValue(rider.id, rider.productCode, index)),
            name: displayText(
                firstValue(rider.name, rider.riderName, rider.productName),
            ),
            sumAssured: formatCurrency(
                firstValue(rider.sumAssured, rider.tsa, rider.appliedSA),
            ),
            policyTerm: displayText(
                firstValue(rider.policyTerm, rider.term),
            ),
            premiumTerm: displayText(
                firstValue(rider.premiumPaymentTerm, rider.ppt),
            ),
            premium: formatCurrency(
                firstValue(rider.premium, rider.modalPremium, rider.annualPremium),
            ),
        }))
        .filter((rider) => rider.name !== "-");

    return (
        <Box
            sx={{
                position: "sticky",
                top: stickyTop,
                zIndex: 20,
                width: "100%",
                minWidth: 0,
                px: 0.5,
                pt: 0.75,
                pb: 0.75,
                bgcolor: "#FFFFFF",
            }}
        >
            <ApplicationSummaryBanner
                image={String(
                    firstValue(applicant.profileImage, personal.profileImage) ?? "",
                )}
                name={name}
                appNo={displayText(
                    firstValue(
                        source.applicationNumber,
                        source.applicationNo,
                        applicationOverview.applicationNumber,
                        applicationOverview.applicationNo,
                    ),
                )}
                personalSummary={personalSummary}
                parameters={parameters}
                productName={displayText(
                    firstValue(
                        baseProduct.productName,
                        baseProduct.name,
                        applicationOverview.productName,
                        applicationOverview.product,
                    ),
                )}
                policyTerm={displayText(
                    firstValue(
                        baseProduct.policyTerm,
                        baseProduct.term,
                        applicationOverview.policyTerm,
                    ),
                )}
                premiumTerm={displayText(
                    firstValue(
                        baseProduct.premiumPaymentTerm,
                        baseProduct.ppt,
                        applicationOverview.premiumPaymentTerm,
                    ),
                )}
                sumAssured={formatCurrency(
                    firstValue(
                        baseProduct.sumAssured,
                        baseProduct.appliedSA,
                        applicationOverview.sumAssured,
                        applicationOverview.appliedSa,
                    ),
                )}
                tsa={formatCurrency(
                    firstValue(
                        baseProduct.tsa,
                        baseProduct.totalSumAssured,
                        applicationOverview.tsa,
                        applicationOverview.totalSumAssured,
                    ),
                )}
                tfsa={formatCurrency(
                    firstValue(
                        baseProduct.tfsa,
                        baseProduct.totalFaceSumAssured,
                        applicationOverview.tfsa,
                        applicationOverview.totalFaceSumAssured,
                    ),
                )}
                tssa={formatCurrency(
                    firstValue(
                        baseProduct.tssa,
                        baseProduct.totalSumAssuredAdditional,
                        applicationOverview.tssa,
                        applicationOverview.totalSumAssuredAdditional,
                    ),
                )}
                tpsa={formatCurrency(
                    firstValue(
                        baseProduct.tpsa,
                        baseProduct.totalPremiumSumAssured,
                        applicationOverview.tpsa,
                        applicationOverview.totalPremiumSumAssured,
                    ),
                )}
                riderSummaries={riderSummaries}
                onViewRiders={() => undefined}
            />
            {/* 
            <Box sx={{ my: 1 }}>
                <RequirementManagement />
            </Box> */}

            <Box
                sx={{
                    mt: 0.75,
                    p: { xs: 1, sm: 1.25 },
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "minmax(0, 1fr)",
                        sm: "repeat(2, minmax(0, 1fr))",
                        lg: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 1.25,
                    alignItems: "center",
                    border: "1px solid #D8D8D8",
                    borderLeft: "4px solid #E45F14",
                    borderRadius: "10px",
                    bgcolor: "#FFFFFF",
                    boxShadow: "0 2px 7px rgba(60, 42, 35, 0.05)",
                }}
            >
                <Box>

                    <Typography>
                        Date of Premium Debit
                    </Typography>
                    <TextField
                        type="date"
                        // label="Date of Premium Debit"
                        value={dateOfPremiumDebit}
                        onChange={(event) => setDateOfPremiumDebit(event.target.value)}
                        size="small"
                        fullWidth
                        disabled={readOnly || submitInProgress}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>

                <Box>

                    <Typography>
                        Date of Email received from Frontline
                    </Typography>
                    <TextField
                        type="date"
                        // label="Date of Email received from Frontline"
                        value={dateOfEmailReceived}
                        onChange={(event) => setDateOfEmailReceived(event.target.value)}
                        size="small"
                        fullWidth
                        disabled={readOnly || submitInProgress}
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>

                {/* <TextField
                    type="date"
                    label="Date of Email received from Frontline"
                    value={dateOfEmailReceived}
                    onChange={(event) => setDateOfEmailReceived(event.target.value)}
                    size="small"
                    fullWidth
                    disabled={readOnly || submitInProgress}
                    InputLabelProps={{ shrink: true }}
                /> */}


                <Box>

                    <Typography>
                        Eops Reference number
                    </Typography>

                    <TextField
                        // label="Eops Reference number"
                        value={eopsReference}
                        onChange={(event) => setEopsReference(event.target.value)}
                        size="small"
                        fullWidth
                        disabled={readOnly || submitInProgress}
                    />
                </Box>

                <Box>

                    <Typography>
                        MAS Decision
                    </Typography>
                    <TextField
                        select
                        // label="Select"
                        placeholder="Select"
                        value={masDecision}
                        onChange={(event) => setMasDecision(event.target.value)}
                        size="small"
                        fullWidth
                        disabled={readOnly || submitInProgress}
                    >
                        {MAS_DECISION_OPTIONS.map((option) => (
                            <MenuItem key={option} value={option}>
                                {option}
                            </MenuItem>
                        ))}
                    </TextField>

                </Box>
                  <Box>

                    <Typography>
                        Remarks
                    </Typography>

                    <TextField
                        // label="Eops Reference number"
                        value={eopsReference}
                        onChange={(event) => setEopsReference(event.target.value)}
                        size="small"
                        fullWidth
                        disabled={readOnly || submitInProgress}
                    />
                </Box>
            </Box>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mt:1
                    }}
                >
                    <CustomButton
                        type="button"
                        onClick={() => setSubmitConfirmationOpen(true)}
                        disabled={readOnly || submitInProgress}
                        sx={{ minWidth: 80, borderRadius: "50px" }}
                    >
                        {submitInProgress ? "Submitting..." : "Submit"}
                    </CustomButton>
                </Box>


            {/* </CustomAccordion> */}
            <CustomDialog
                open={submitConfirmationOpen}
                showCloseIcon
                onClose={() => {
                    if (!submitInProgress) {
                        setSubmitConfirmationOpen(false);
                    }
                }}
                title="Confirm Submit"
                maxWidth="xs"
                fullWidth
            >
                <Box sx={{ p: 1 }}>
                    <Typography
                        sx={{
                            fontSize: "14px",
                            color: "#333",
                        }}
                    >
                        Do you want to submit the case?
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                            mt: 3,
                        }}
                    >
                        <CustomButton
                            variant="outlined"
                            onClick={() => setSubmitConfirmationOpen(false)}
                        >
                            Cancel
                        </CustomButton>

                        <CustomButton
                            onClick={() => setSubmitConfirmationOpen(false)}
                        >
                            Submit
                        </CustomButton>
                    </Box>
                </Box>
            </CustomDialog>
        </Box>
    );
};

export default MAS;
