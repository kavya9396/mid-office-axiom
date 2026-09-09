// import { Avatar, Box, MenuItem, TextField, Typography } from "@mui/material";

// import { UserProfileIcon } from "../../icons/Icons";
// import { useAppSelector } from "../../store/hooks";
// import type { RootState } from "../../store/store";
// import RequirementManagement from "./DRS_Accordions/RequirementManagement";
// import CustomButton from "../../components/ui/Button/Button";

// type UnknownRecord = Record<string, unknown>;

// interface PIVVDrsProps {
//     /** Header offset used by the sticky banner. */
//     stickyTop?: number | string;
//     /** Optional data override, useful when the component is rendered outside DRS. */
//     data?: unknown;
// }

// interface RiderSummary {
//     id: string;
//     name: string;
//     sumAssured: string;
// }

// interface ApplicationSummaryBannerProps {
//     image?: string;
//     name: string;
//     appNo: string;
//     personalSummary: string;
//     productName: string;
//     policyTerm: string;
//     premiumTerm: string;
//     sumAssured: string;
//     tsa: string;
//     tfsa: string;
//     tssa: string;
//     tpsa: string;
//     riderSummaries: RiderSummary[];
// }

// const toRecord = (value: unknown): UnknownRecord =>
//     value && typeof value === "object" && !Array.isArray(value)
//         ? (value as UnknownRecord)
//         : {};

// const firstValue = (...values: unknown[]): unknown =>
//     values.find(
//         (value) => value !== null && value !== undefined && value !== "",
//     );

// const displayText = (value: unknown): string => {
//     if (value === null || value === undefined || value === "") {
//         return "-";
//     }

//     if (typeof value === "boolean") {
//         return value ? "Yes" : "No";
//     }

//     return String(value);
// };

// const formatCurrency = (value: unknown): string => {
//     if (value === null || value === undefined || value === "") {
//         return "-";
//     }

//     const numericValue = Number(value);

//     return Number.isFinite(numericValue)
//         ? `₹${new Intl.NumberFormat("en-IN").format(numericValue)}`
//         : displayText(value);
// };

// const getFullName = (person: UnknownRecord): string =>
//     [person.firstName, person.middleName, person.lastName]
//         .filter(Boolean)
//         .map(String)
//         .join(" ") || "-";

// const getAddress = (member: UnknownRecord): string => {
//     const addressValue = member.address;
//     const addresses = Array.isArray(addressValue)
//         ? addressValue
//         : Object.keys(toRecord(addressValue)).length > 0
//             ? [addressValue]
//             : [];
//     const address = toRecord(addresses[0]);

//     return (
//         [address.city, address.state, address.residingCountry, address.pinCode]
//             .filter(Boolean)
//             .map(String)
//             .join(" - ") || "-"
//     );
// };

// const ApplicationSummaryBanner = ({
//     image,
//     name,
//     personalSummary,
//     productName,
//     policyTerm,
//     premiumTerm,
//     sumAssured,
//     tsa,
//     tfsa,
//     tssa,
//     tpsa,
//     riderSummaries,
// }: ApplicationSummaryBannerProps) => {
//     const coverageItems = [
//         sumAssured !== "-" ? `SA - ${sumAssured}` : null,
//         tsa !== "-" ? `TSA - ${tsa}` : null,
//         tfsa !== "-" ? `TFSA - ${tfsa}` : null,
//         tssa !== "-" ? `TSSA - ${tssa}` : null,
//         tpsa !== "-" ? `TPSA - ${tpsa}` : null,
//     ].filter(Boolean) as string[];

//     return (
//         <Box
//             sx={{
//                 width: "100%",
//                 display: "grid",
//                 gridTemplateColumns: {
//                     xs: "84px minmax(0, 1fr)",
//                     sm: "150px minmax(0, 1fr)",
//                 },
//                 bgcolor: "#FFEAD7",
//                 color: "#000000",
//                 borderRadius: "12px",
//                 overflow: "hidden",
//                 boxShadow: "0 3px 10px rgba(169, 33, 41, 0.16)",
//             }}
//         >
//             <Box
//                 sx={{
//                     minHeight: { xs: 112, sm: 138 },
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     background: "linear-gradient(145deg, #E45F14 0%, #C83C2F 100%)",
//                 }}
//             >
//                 <Avatar
//                     src={image || undefined}
//                     alt={name === "-" ? "Applicant" : name}
//                     sx={{
//                         width: { xs: 54, sm: 76 },
//                         height: { xs: 54, sm: 76 },
//                         bgcolor: "rgba(255,255,255,.18)",
//                         color: "#000000",
//                         border: "2px solid rgba(255,255,255,.45)",
//                     }}
//                 >
//                     <UserProfileIcon sx={{ fontSize: { xs: 30, sm: 44 } }} />
//                 </Avatar>
//             </Box>

//             <Box
//                 sx={{
//                     minWidth: 0,
//                     px: { xs: 1.2, sm: 2.2 },
//                     py: { xs: 1, sm: 1.45 },
//                 }}
//             >
//                 <Box
//                     sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "space-between",
//                         gap: 2,
//                         mb: 0.4,
//                     }}
//                 >
//                     <Typography
//                         title={name}
//                         sx={{
//                             minWidth: 0,
//                             fontSize: { xs: 14, sm: 16 },
//                             fontWeight: 900,
//                             lineHeight: 1.25,
//                             overflow: "hidden",
//                             textOverflow: "ellipsis",
//                             whiteSpace: "nowrap",
//                         }}
//                     >
//                         {name}
//                     </Typography>

//                     <Typography
//                         sx={{
//                             flexShrink: 0,
//                             px: 1.1,
//                             py: 0.45,
//                             borderRadius: "16px",
//                             bgcolor: "#FFFFFF",
//                             border: "1px solid rgba(169,33,41,.18)",
//                             color: "#A92129",
//                             fontSize: { xs: 11, sm: 13 },
//                             fontWeight: 900,
//                             whiteSpace: "nowrap",
//                         }}
//                     >
//                         App No. - OB90377122
//                     </Typography>
//                 </Box>

//                 <Typography
//                     sx={{
//                         fontSize: { xs: 10, sm: 11.5 },
//                         lineHeight: 1.6,
//                         fontWeight: 500,
//                         overflowWrap: "anywhere",
//                     }}
//                 >
//                     {personalSummary || "-"}
//                 </Typography>

//                 <Typography
//                     component="div"
//                     sx={{
//                         mt: 0.5,
//                         fontSize: { xs: 10, sm: 11.5 },
//                         lineHeight: 1.65,
//                         fontWeight: 800,
//                         overflowWrap: "anywhere",
//                     }}
//                 >
//                     Product: <Box component="span">{productName}</Box>
//                     {" / "}Policy Term: <Box component="span">{policyTerm}</Box>
//                     {" / "}Premium Term: <Box component="span">{premiumTerm}</Box>
//                     {coverageItems.map((item) => (
//                         <Box component="span" key={item} sx={{ fontWeight: 700 }}>
//                             {" / "}
//                             {item}
//                         </Box>
//                     ))}
//                 </Typography>

//                 <Box
//                     sx={{
//                         mt: 0.45,
//                         display: "flex",
//                         alignItems: "flex-start",
//                         gap: 0.35,
//                     }}
//                 >
//                     <Typography
//                         sx={{
//                             flexShrink: 0,
//                             fontSize: { xs: 10, sm: 11.5 },
//                             lineHeight: 1.65,
//                             fontWeight: 800,
//                         }}
//                     >
//                         Riders:
//                     </Typography>

//                     <Typography
//                         sx={{
//                             minWidth: 0,
//                             fontSize: { xs: 10, sm: 11.5 },
//                             lineHeight: 1.65,
//                             fontWeight: 600,
//                             overflowWrap: "anywhere",
//                         }}
//                     >
//                         {riderSummaries.length > 0
//                             ? riderSummaries
//                                 .map((rider) => `${rider.name} - SA ${rider.sumAssured}`)
//                                 .join(" / ")
//                             : "No riders"}
//                     </Typography>
//                 </Box>
//             </Box>
//         </Box>
//     );
// };

// const PIVVDrs = ({ stickyTop = 72, data }: PIVVDrsProps) => {
//     const drsData = useAppSelector((state: RootState) => state.drs.data);
//     const source = toRecord(data ?? drsData);
//     const applicationOverview = toRecord(source.applicationOverview);

//     const members = Array.isArray(source.summary)
//         ? source.summary.map(toRecord)
//         : [];
//     const applicant = members[0] ?? {};
//     const applicantDetails = toRecord(applicant.applicantDetails);
//     const personalDetails = toRecord(applicant.personalDetails);
//     const personal = {
//         ...applicantDetails,
//         ...personalDetails,
//         ...toRecord(applicant.personalSummary),
//         ...toRecord(applicant.proposerSummary),
//     };
//     const financialDetails = {
//         ...toRecord(applicant.applicantFinancialDetails),
//         ...toRecord(applicant.financialDetails),
//     };

//     const products = Array.isArray(applicationOverview.productDetail)
//         ? applicationOverview.productDetail.map(toRecord)
//         : [];
//     const baseProduct =
//         products.find(
//             (product) => String(product.type ?? "").toLowerCase() === "base",
//         ) ??
//         products[0] ??
//         applicationOverview;

//     const riders = Array.isArray(applicationOverview.riderDetails)
//         ? applicationOverview.riderDetails.map(toRecord)
//         : products.filter(
//             (product) => String(product.type ?? "").toLowerCase() === "rider",
//         );

//     const name = getFullName({ ...applicant, ...personal });
//     const rawAge = personal.age;
//     const ageValue = firstValue(
//         toRecord(rawAge).years,
//         typeof rawAge !== "object" ? rawAge : undefined,
//         applicantDetails.age,
//     );
//     const address = getAddress({
//         ...applicant,
//         address: firstValue(
//             applicant.address,
//             personal.address,
//             applicantDetails.address,
//         ),
//     });
//     const annualIncome = formatCurrency(
//         firstValue(
//             financialDetails.annualIncome,
//             personalDetails.netIncomeAmt,
//         ),
//     );

//     const personalSummary = [
//         displayText(personal.maritalStatus ?? applicantDetails.maritalStatus),
//         ageValue ? `${displayText(ageValue)} years` : "-",
//         displayText(personal.gender ?? applicantDetails.gender),
//         displayText(personal.education ?? applicantDetails.education),
//         annualIncome !== "-" ? `${annualIncome} p.a.` : "-",
//         address,
//         displayText(personal.nationality ?? applicantDetails.nationality),
//         displayText(personal.residentStatus ?? personal.countryOfResidence),
//     ]
//         .filter((value) => value !== "-")
//         .join(" / ");

//     const riderSummaries: RiderSummary[] = riders
//         .map((rider, index) => ({
//             id: String(firstValue(rider.id, rider.productCode, index)),
//             name: displayText(
//                 firstValue(rider.name, rider.riderName, rider.productName),
//             ),
//             sumAssured: formatCurrency(
//                 firstValue(rider.sumAssured, rider.tsa, rider.appliedSA),
//             ),
//         }))
//         .filter((rider) => rider.name !== "-");

//     return (
//         <Box
//             sx={{
//                 position: "sticky",
//                 top: stickyTop,
//                 zIndex: 20,
//                 width: "100%",
//                 minWidth: 0,
//                 px: 0.5,
//                 pt: 0.75,
//                 pb: 0.75,
//                 bgcolor: "#FFFFFF",
//             }}
//         >
//             <ApplicationSummaryBanner
//                 image={String(
//                     firstValue(applicant.profileImage, personal.profileImage) ?? "",
//                 )}
//                 name={name}
//                 appNo={displayText(
//                     firstValue(
//                         source.applicationNumber,
//                         source.applicationNo,
//                         applicationOverview.applicationNumber,
//                         applicationOverview.applicationNo,
//                     ),
//                 )}
//                 personalSummary={personalSummary}
//                 productName={displayText(
//                     firstValue(
//                         baseProduct.productName,
//                         baseProduct.name,
//                         applicationOverview.productName,
//                         applicationOverview.product,
//                     ),
//                 )}
//                 policyTerm={displayText(
//                     firstValue(
//                         baseProduct.policyTerm,
//                         baseProduct.term,
//                         applicationOverview.policyTerm,
//                     ),
//                 )}
//                 premiumTerm={displayText(
//                     firstValue(
//                         baseProduct.premiumPaymentTerm,
//                         baseProduct.ppt,
//                         applicationOverview.premiumPaymentTerm,
//                     ),
//                 )}
//                 sumAssured={formatCurrency(
//                     firstValue(
//                         baseProduct.sumAssured,
//                         baseProduct.appliedSA,
//                         applicationOverview.sumAssured,
//                         applicationOverview.appliedSa,
//                     ),
//                 )}
//                 tsa={formatCurrency(
//                     firstValue(
//                         baseProduct.tsa,
//                         baseProduct.totalSumAssured,
//                         applicationOverview.tsa,
//                         applicationOverview.totalSumAssured,
//                     ),
//                 )}
//                 tfsa={formatCurrency(
//                     firstValue(
//                         baseProduct.tfsa,
//                         baseProduct.totalFaceSumAssured,
//                         applicationOverview.tfsa,
//                         applicationOverview.totalFaceSumAssured,
//                     ),
//                 )}
//                 tssa={formatCurrency(
//                     firstValue(
//                         baseProduct.tssa,
//                         baseProduct.totalSumAssuredAdditional,
//                         applicationOverview.tssa,
//                         applicationOverview.totalSumAssuredAdditional,
//                     ),
//                 )}
//                 tpsa={formatCurrency(
//                     firstValue(
//                         baseProduct.tpsa,
//                         baseProduct.totalPremiumSumAssured,
//                         applicationOverview.tpsa,
//                         applicationOverview.totalPremiumSumAssured,
//                     ),
//                 )}
//                 riderSummaries={riderSummaries}
//             />

//             <RequirementManagement />

//             <Box
//                 sx={{
//                     mt: 0.75,
//                     p: { xs: 1, sm: 1.25 },
//                     display: "grid",
//                     gridTemplateColumns: {
//                         xs: "minmax(0, 1fr)",
//                         md: "minmax(0, 1fr) 250px auto",
//                     },
//                     gap: 1.25,
//                     alignItems: "center",
//                     border: "1px solid #D8D8D8",
//                     borderLeft: "4px solid #E45F14",
//                     borderRadius: "10px",
//                     bgcolor: "#FFFFFF",
//                     boxShadow: "0 2px 7px rgba(60, 42, 35, 0.05)",
//                 }}
//             >
//                 <TextField
//                     label="PIVV Remarks"
//                     value={""}
//                     // onChange={(event) => setSrUwRemarks(event.target.value)}
//                     multiline
//                     minRows={1}
//                     size="small"
//                     fullWidth
//                     // disabled={readOnly}
//                 />

//                 <TextField
//                     select
//                     label="PIVV Decision"
//                     value={""}
//                     // onChange={(event) => setSrUwDecision(event.target.value)}
//                     size="small"
//                     fullWidth
//                     // disabled={readOnly}
//                 >

//                 </TextField>

//                 <Box
//                     sx={{
//                         display: "flex",
//                         justifyContent: "center",
//                         alignItems: "center",
//                     }}
//                 >
//                     <CustomButton
//                         type="button"
//                         // onClick={() => setSubmitConfirmationOpen(true)}
//                         // disabled={readOnly}
//                         sx={{ minWidth: 80, borderRadius: "50px" }}
//                     >
//                         Submit
//                     </CustomButton>
//                 </Box>
//             </Box>
//         </Box>
//     );
// };

// export default PIVVDrs;


import { Avatar, Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { useState } from "react";

import CustomButton from "../../components/ui/Button/Button";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import { UserProfileIcon } from "../../icons/Icons";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import RequirementManagement from "./DRS_Accordions/RequirementManagement";

type UnknownRecord = Record<string, unknown>;

interface PIVVDrsProps {
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

const PIVV_DECISION_OPTIONS = [
    "Customer not speaking",
    "Another person spoken",
    "Pre-recorded video",
    "Customer didn’t complete the full script",
    "a. Application",
    "b. Premium",
    "c. Policy term",
    "d. premium paying term",
    "e. Sum assured",
    "Customer weight different with application form",
    "Customer profile is not ok",
    "Customer face not clear in video",
    "Voice does not audible",
    "PDF not generated to check script",
    "New PDF not generated as per latest PIVV",
    "PIVV Done",
    "Refer to IT",
] as const;

interface RiderSummary {
    id: string;
    name: string;
    sumAssured: string;
}

interface ApplicationSummaryBannerProps {
    image?: string;
    name: string;
    appNo: string;
    personalSummary: string;
    productName: string;
    policyTerm: string;
    premiumTerm: string;
    sumAssured: string;
    tsa: string;
    tfsa: string;
    tssa: string;
    tpsa: string;
    riderSummaries: RiderSummary[];
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
    productName,
    policyTerm,
    premiumTerm,
    sumAssured,
    tsa,
    tfsa,
    tssa,
    tpsa,
    riderSummaries,
}: ApplicationSummaryBannerProps) => {
    const coverageItems = [
        sumAssured !== "-" ? `SA - ${sumAssured}` : null,
        tsa !== "-" ? `TSA - ${tsa}` : null,
        tfsa !== "-" ? `TFSA - ${tfsa}` : null,
        tssa !== "-" ? `TSSA - ${tssa}` : null,
        tpsa !== "-" ? `TPSA - ${tpsa}` : null,
    ].filter(Boolean) as string[];

    return (
        <Box
            sx={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: {
                    xs: "84px minmax(0, 1fr)",
                    sm: "150px minmax(0, 1fr)",
                },
                bgcolor: "#FFEAD7",
                color: "#000000",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 3px 10px rgba(169, 33, 41, 0.16)",
            }}
        >
            <Box
                sx={{
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
                        color: "#000000",
                        border: "2px solid rgba(255,255,255,.45)",
                    }}
                >
                    <UserProfileIcon sx={{ fontSize: { xs: 30, sm: 44 } }} />
                </Avatar>
            </Box>

            <Box
                sx={{
                    minWidth: 0,
                    px: { xs: 1.2, sm: 2.2 },
                    py: { xs: 1, sm: 1.45 },
                }}
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
                            fontSize: { xs: 14, sm: 16 },
                            fontWeight: 900,
                            lineHeight: 1.25,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {name}
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
                        fontSize: { xs: 10, sm: 11.5 },
                        lineHeight: 1.6,
                        fontWeight: 500,
                        overflowWrap: "anywhere",
                    }}
                >
                    {personalSummary || "-"}
                </Typography>

                <Typography
                    component="div"
                    sx={{
                        mt: 0.5,
                        fontSize: { xs: 10, sm: 11.5 },
                        lineHeight: 1.65,
                        fontWeight: 800,
                        overflowWrap: "anywhere",
                    }}
                >
                    Product: <Box component="span">{productName}</Box>
                    {" / "}Policy Term: <Box component="span">{policyTerm}</Box>
                    {" / "}Premium Term: <Box component="span">{premiumTerm}</Box>
                    {coverageItems.map((item) => (
                        <Box component="span" key={item} sx={{ fontWeight: 700 }}>
                            {" / "}
                            {item}
                        </Box>
                    ))}
                </Typography>

                <Box
                    sx={{
                        mt: 0.45,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 0.35,
                    }}
                >
                    <Typography
                        sx={{
                            flexShrink: 0,
                            fontSize: { xs: 10, sm: 11.5 },
                            lineHeight: 1.65,
                            fontWeight: 800,
                        }}
                    >
                        Riders:
                    </Typography>

                    <Typography
                        sx={{
                            minWidth: 0,
                            fontSize: { xs: 10, sm: 11.5 },
                            lineHeight: 1.65,
                            fontWeight: 600,
                            overflowWrap: "anywhere",
                        }}
                    >
                        {riderSummaries.length > 0
                            ? riderSummaries
                                .map((rider) => `${rider.name} - SA ${rider.sumAssured}`)
                                .join(" / ")
                            : "No riders"}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

const summaryActionSx = {
    minWidth: "auto",
    px: 1.4,
    py: 0.55,
    border: "1px solid #E45F14",
    borderRadius: "18px",
    bgcolor: "#FFF4EC",
    color: "#A92129",
    fontSize: { xs: 10, sm: 11 },
    fontWeight: 900,
    lineHeight: 1.2,
    textTransform: "none",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 7px rgba(169,33,41,.12)",
    "& .MuiButton-startIcon": {
        mr: 0.55,
        ml: 0,
    },
    "&:hover": {
        borderColor: "#C83C2F",
        bgcolor: "#FFEAD7",
        boxShadow: "0 3px 9px rgba(169,33,41,.18)",
        transform: "translateY(-1px)",
    },
} as const;

const PIVVDrs = ({
    stickyTop = 72,
    data,
    readOnly = false,
    isSubmitting = false,
}: PIVVDrsProps) => {
    const drsData = useAppSelector((state: RootState) => state.drs.data);
    const [pivvRemarks, setPivvRemarks] = useState("");
    const [pivvDecision, setPivvDecision] = useState("");
    const [submitConfirmationOpen, setSubmitConfirmationOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const submitInProgress = isSubmitting || submitting;

    const source = toRecord(data ?? drsData);
    const applicationOverview = toRecord(source.applicationOverview);

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

    const riderSummaries: RiderSummary[] = riders
        .map((rider, index) => ({
            id: String(firstValue(rider.id, rider.productCode, index)),
            name: displayText(
                firstValue(rider.name, rider.riderName, rider.productName),
            ),
            sumAssured: formatCurrency(
                firstValue(rider.sumAssured, rider.tsa, rider.appliedSA),
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
            />


  { (
                <Box
                    sx={{
                        width: "100%",
                        px: 0.5,
                        py: 0.75,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        overflowX: "auto",
                        "& .MuiButton-root": { flexShrink: 0 },
                    }}
                >
                    {members.length > 1 && (
                        <Button
                            type="button"
                            variant="outlined"
                            aria-label="Back to member summary"
                            // onClick={handleBackToSummary}
                            startIcon={
                                <Box
                                    component="span"
                                    aria-hidden="true"
                                    sx={{ fontSize: 16, fontWeight: 900, lineHeight: 1 }}
                                >
                                    &#8592;
                                </Box>
                            }
                            sx={{
                                minWidth: "auto",
                                px: 1.4,
                                py: 0.55,
                                border: "1px solid #E45F14",
                                borderRadius: "18px",
                                bgcolor: "#FFF4EC",
                                color: "#A92129",
                                fontSize: { xs: 10, sm: 11 },
                                fontWeight: 900,
                                lineHeight: 1.2,
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                boxShadow: "0 2px 7px rgba(169,33,41,.12)",
                                "& .MuiButton-startIcon": {
                                    mr: 0.55,
                                    ml: 0,
                                },
                                "&:hover": {
                                    borderColor: "#C83C2F",
                                    bgcolor: "#FFEAD7",
                                    boxShadow: "0 3px 9px rgba(169,33,41,.18)",
                                    transform: "translateY(-1px)",
                                },
                            }}
                        >
                            Summary
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="outlined"
                        // onClick={() => setGrievanceHistoryDialogOpen(true)}
                        sx={{ ...summaryActionSx, ml: "auto" }}
                    >
                        Proposal Form & Documents
                    </Button>
                </Box>
            )}


            <RequirementManagement />

            <Box
                sx={{
                    mt: 0.75,
                    p: { xs: 1, sm: 1.25 },
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "minmax(0, 1fr)",
                        md: "minmax(0, 1fr) 250px auto",
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
                <TextField
                    label="PIVV Remarks"
                    value={pivvRemarks}
                    onChange={(event) => setPivvRemarks(event.target.value)}
                    multiline
                    minRows={1}
                    size="small"
                    fullWidth
                    disabled={readOnly || submitInProgress}
                    sx={{fontSize: "8px"}}
                />

                <TextField
                    select
                    label="PIVV Decision"
                    value={pivvDecision}
                    onChange={(event) => setPivvDecision(event.target.value)}
                    size="small"
                    fullWidth
                    disabled={readOnly || submitInProgress}
                >
                    {PIVV_DECISION_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </TextField>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
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

export default PIVVDrs;
