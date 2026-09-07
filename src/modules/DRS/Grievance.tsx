// import { Avatar, Box, Typography } from "@mui/material";
// import { useState } from "react";

// import CustomDialog from "../../components/ui/Dialog/Dialog";
// import { KeyRightArrowIcon, UserProfileIcon } from "../../icons/Icons";
// import { useAppSelector } from "../../store/hooks";
// import type { RootState } from "../../store/store";

// type UnknownRecord = Record<string, unknown>;

// interface RiderSummary {
//   id: string;
//   name: string;
//   sumAssured: string;
//   policyTerm: string;
//   premiumTerm: string;
//   premium: string;
// }

// interface ApplicationSummaryBannerProps {
//   image?: string;
//   name: string;
//   appNo: string;
//   personalSummary: string;
//   productName: string;
//   policyTerm: string;
//   premiumTerm: string;
//   sumAssured: string;
//   tsa: string;
//   tfsa: string;
//   tssa: string;
//   tpsa: string;
//   riderSummaries: RiderSummary[];
//   onViewRiders: () => void;
// }

// const toRecord = (value: unknown): UnknownRecord =>
//   value && typeof value === "object" && !Array.isArray(value)
//     ? (value as UnknownRecord)
//     : {};

// const firstValue = (...values: unknown[]): unknown =>
//   values.find(
//     (value) => value !== null && value !== undefined && value !== "",
//   );

// const text = (value: unknown): string => {
//   if (value === null || value === undefined || value === "") {
//     return "-";
//   }

//   if (typeof value === "boolean") {
//     return value ? "Yes" : "No";
//   }

//   return String(value);
// };

// const currency = (value: unknown): string => {
//   if (value === null || value === undefined || value === "") {
//     return "-";
//   }

//   const numericValue = Number(value);

//   return Number.isFinite(numericValue)
//     ? `₹${new Intl.NumberFormat("en-IN").format(numericValue)}`
//     : text(value);
// };

// const getFullName = (person: UnknownRecord): string =>
//   [person.firstName, person.middleName, person.lastName]
//     .filter(Boolean)
//     .map(String)
//     .join(" ") || "-";

// const getAddress = (member: UnknownRecord): string => {
//   const addresses = Array.isArray(member.address)
//     ? member.address
//     : Object.keys(toRecord(member.address)).length > 0
//       ? [member.address]
//       : [];

//   const address = toRecord(addresses[0]);

//   return (
//     [address.city, address.state, address.residingCountry, address.pinCode]
//       .filter(Boolean)
//       .map(String)
//       .join(" - ") || "-"
//   );
// };

// const CompactField = ({ label, value }: { label: string; value: string }) => (
//   <Box sx={{ minWidth: 0 }}>
//     <Typography sx={{ color: "#8B807B", fontSize: 8.5, lineHeight: 1.15 }}>
//       {label}
//     </Typography>

//     <Typography
//       title={value}
//       sx={{
//         mt: 0.2,
//         color: "#302A27",
//         fontSize: 10.5,
//         fontWeight: 800,
//         lineHeight: 1.25,
//         overflow: "hidden",
//         textOverflow: "ellipsis",
//         whiteSpace: "nowrap",
//       }}
//     >
//       {value}
//     </Typography>
//   </Box>
// );

// const ApplicationSummaryBanner = ({
//   image,
//   name,
//   personalSummary,
//   productName,
//   policyTerm,
//   premiumTerm,
//   sumAssured,
//   tsa,
//   tfsa,
//   tssa,
//   tpsa,
//   riderSummaries,
//   onViewRiders,
// }: ApplicationSummaryBannerProps) => {
//   const coverageItems = [
//     sumAssured !== "-" ? `SA - ${sumAssured}` : null,
//     tsa !== "-" ? `TSA - ${tsa}` : null,
//     tfsa !== "-" ? `TFSA - ${tfsa}` : null,
//     tssa !== "-" ? `TSSA - ${tssa}` : null,
//     tpsa !== "-" ? `TPSA - ${tpsa}` : null,
//   ].filter(Boolean) as string[];

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         display: "grid",
//         gridTemplateColumns: {
//           xs: "84px minmax(0, 1fr)",
//           sm: "150px minmax(0, 1fr)",
//         },
//         bgcolor: "#FFEAD7",
//         color: "#000000",
//         borderRadius: "12px",
//         overflow: "hidden",
//         boxShadow: "0 3px 10px rgba(169, 33, 41, 0.16)",
//       }}
//     >
//       <Box
//         sx={{
//           minHeight: { xs: 112, sm: 138 },
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           background: "linear-gradient(145deg, #E45F14 0%, #C83C2F 100%)",
//         }}
//       >
//         <Avatar
//           src={image || undefined}
//           alt={name === "-" ? "Applicant" : name}
//           sx={{
//             width: { xs: 54, sm: 76 },
//             height: { xs: 54, sm: 76 },
//             bgcolor: "rgba(255, 255, 255, 0.18)",
//             color: "#000000",
//             border: "2px solid rgba(255, 255, 255, 0.45)",
//           }}
//         >
//           <UserProfileIcon sx={{ fontSize: { xs: 30, sm: 44 } }} />
//         </Avatar>
//       </Box>

//       <Box
//         sx={{
//           minWidth: 0,
//           px: { xs: 1.2, sm: 2.2 },
//           py: { xs: 1, sm: 1.45 },
//         }}
//       >
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "space-between",
//             gap: 2,
//             mb: 0.4,
//           }}
//         >
//           <Typography
//             title={name}
//             sx={{
//               minWidth: 0,
//               color: "#000000",
//               fontSize: { xs: 14, sm: 16 },
//               fontWeight: 900,
//               lineHeight: 1.25,
//               overflow: "hidden",
//               textOverflow: "ellipsis",
//               whiteSpace: "nowrap",
//             }}
//           >
//             {name}
//           </Typography>

//           <Typography
//             sx={{
//               flexShrink: 0,
//               px: 1.1,
//               py: 0.45,
//               borderRadius: "16px",
//               bgcolor: "#FFFFFF",
//               border: "1px solid rgba(169, 33, 41, 0.18)",
//               color: "#A92129",
//               fontSize: { xs: 11, sm: 13 },
//               fontWeight: 900,
//               whiteSpace: "nowrap",
//             }}
//           >
//             App No. - OB90377122
//           </Typography>
//         </Box>

//         <Typography
//           sx={{
//             color: "#000000",
//             fontSize: { xs: 10, sm: 11.5 },
//             lineHeight: 1.6,
//             fontWeight: 500,
//             overflowWrap: "anywhere",
//           }}
//         >
//           {personalSummary || "-"}
//         </Typography>

//         <Typography
//           sx={{
//             mt: 0.5,
//             color: "#000000",
//             fontSize: { xs: 10, sm: 11.5 },
//             lineHeight: 1.65,
//             fontWeight: 800,
//             overflowWrap: "anywhere",
//           }}
//         >
//           Product: <Box component="span">{productName}</Box>
//           {" / "}Policy Term: <Box component="span">{policyTerm}</Box>
//           {" / "}Premium Term: <Box component="span">{premiumTerm}</Box>
//           {coverageItems.map((item) => (
//             <Box component="span" key={item} sx={{ fontWeight: 700 }}>
//               {" / "}
//               {item}
//             </Box>
//           ))}
//         </Typography>

//         <Box
//           sx={{
//             mt: 0.45,
//             display: "flex",
//             alignItems: "flex-start",
//             gap: 0.35,
//             flexWrap: "wrap",
//           }}
//         >
//           <Typography
//             sx={{
//               color: "#000000",
//               fontSize: { xs: 10, sm: 11.5 },
//               lineHeight: 1.65,
//               fontWeight: 800,
//             }}
//           >
//             Riders:
//           </Typography>

//           {riderSummaries.length > 0 ? (
//             <Typography
//               sx={{
//                 flex: 1,
//                 minWidth: 0,
//                 color: "#000000",
//                 fontSize: { xs: 10, sm: 11.5 },
//                 lineHeight: 1.65,
//                 fontWeight: 600,
//                 overflowWrap: "anywhere",
//               }}
//             >
//               {riderSummaries.map((rider, index) => (
//                 <Box component="span" key={rider.id}>
//                   {rider.name} - SA {rider.sumAssured}
//                   {index < riderSummaries.length - 1 ? " / " : ""}
//                 </Box>
//               ))}
//             </Typography>
//           ) : (
//             <Typography
//               sx={{
//                 color: "#000000",
//                 fontSize: { xs: 10, sm: 11.5 },
//                 lineHeight: 1.65,
//                 fontWeight: 600,
//               }}
//             >
//               No riders
//             </Typography>
//           )}

//           {riderSummaries.length > 0 && (
//             <Box
//               component="button"
//               type="button"
//               onClick={onViewRiders}
//               sx={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: 0.25,
//                 border: 0,
//                 p: 0,
//                 ml: 0.5,
//                 mt: 0.15,
//                 bgcolor: "transparent",
//                 color: "#A92129",
//                 fontSize: 9,
//                 fontWeight: 900,
//                 cursor: "pointer",
//                 fontFamily: "inherit",
//                 whiteSpace: "nowrap",
//                 "&:hover": { textDecoration: "underline" },
//               }}
//             >
//               View details <KeyRightArrowIcon />
//             </Box>
//           )}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// const Grievance = () => {
//   const drsData = useAppSelector((state: RootState) => state.drs.data);
//   const [riderDialogOpen, setRiderDialogOpen] = useState(false);

//   const source = toRecord(drsData);
//   const applicationOverview = toRecord(source.applicationOverview);
//   const members = Array.isArray(source.summary)
//     ? source.summary.map(toRecord)
//     : [];
//   const applicant = members[0] ?? {};
//   const applicantDetails = toRecord(applicant.applicantDetails);
//   const personalDetails = toRecord(applicant.personalDetails);
//   const personal = {
//     ...applicantDetails,
//     ...personalDetails,
//     ...toRecord(applicant.personalSummary),
//     ...toRecord(applicant.proposerSummary),
//   };
//   const financialDetails = {
//     ...toRecord(applicant.applicantFinancialDetails),
//     ...toRecord(applicant.financialDetails),
//   };

//   const products = Array.isArray(applicationOverview.productDetail)
//     ? applicationOverview.productDetail.map(toRecord)
//     : [];
//   const baseProduct =
//     products.find(
//       (product) => String(product.type ?? "").toLowerCase() === "base",
//     ) ??
//     products[0] ??
//     applicationOverview;
//   const riderDetails = Array.isArray(applicationOverview.riderDetails)
//     ? applicationOverview.riderDetails.map(toRecord)
//     : products.filter(
//         (product) => String(product.type ?? "").toLowerCase() === "rider",
//       );

//   const riderSummaries: RiderSummary[] = riderDetails
//     .map((rider, index) => ({
//       id: String(firstValue(rider.id, rider.productCode, index)),
//       name: text(firstValue(rider.name, rider.riderName, rider.productName)),
//       sumAssured: currency(
//         firstValue(rider.sumAssured, rider.tsa, rider.appliedSA),
//       ),
//       policyTerm: text(firstValue(rider.policyTerm, rider.term)),
//       premiumTerm: text(
//         firstValue(rider.premiumPaymentTerm, rider.ppt),
//       ),
//       premium: currency(firstValue(rider.premium, rider.annualPremium)),
//     }))
//     .filter((rider) => rider.name !== "-");

//   const age = firstValue(
//     toRecord(personal.age).years,
//     personal.age,
//     applicantDetails.age,
//   );
//   const address = getAddress({
//     ...applicant,
//     address: firstValue(
//       applicant.address,
//       personal.address,
//       applicantDetails.address,
//     ),
//   });
//   const annualIncome = currency(
//     firstValue(
//       financialDetails.annualIncome,
//       personalDetails.netIncomeAmt,
//     ),
//   );
//   const personalSummary = [
//     text(firstValue(personal.maritalStatus, applicantDetails.maritalStatus)),
//     age ? `${text(age)} years` : "-",
//     text(firstValue(personal.gender, applicantDetails.gender)),
//     text(firstValue(personal.education, applicantDetails.education)),
//     annualIncome !== "-" ? `${annualIncome} p.a.` : "-",
//     address,
//     text(firstValue(personal.nationality, applicantDetails.nationality)),
//     text(firstValue(personal.residentStatus, personal.countryOfResidence)),
//   ]
//     .filter((value) => value !== "-")
//     .join(" / ");

//   return (
//     <Box sx={{ width: "100%", minWidth: 0, px: 0.5, py: 0.75 }}>
//       <ApplicationSummaryBanner
//         image={String(firstValue(applicant.profileImage, personal.profileImage) ?? "")}
//         name={getFullName({ ...applicant, ...personal })}
//         appNo={text(
//           firstValue(
//             source.applicationNumber,
//             source.applicationNo,
//             applicationOverview.applicationNumber,
//             applicationOverview.applicationNo,
//           ),
//         )}
//         personalSummary={personalSummary}
//         productName={text(
//           firstValue(
//             baseProduct.productName,
//             baseProduct.name,
//             applicationOverview.productName,
//             applicationOverview.product,
//           ),
//         )}
//         policyTerm={text(
//           firstValue(
//             baseProduct.policyTerm,
//             baseProduct.term,
//             applicationOverview.policyTerm,
//           ),
//         )}
//         premiumTerm={text(
//           firstValue(
//             baseProduct.premiumPaymentTerm,
//             baseProduct.ppt,
//             applicationOverview.premiumPaymentTerm,
//           ),
//         )}
//         sumAssured={currency(
//           firstValue(
//             baseProduct.sumAssured,
//             baseProduct.appliedSA,
//             applicationOverview.sumAssured,
//             applicationOverview.appliedSa,
//           ),
//         )}
//         tsa={currency(
//           firstValue(
//             baseProduct.tsa,
//             baseProduct.totalSumAssured,
//             applicationOverview.tsa,
//             applicationOverview.totalSumAssured,
//           ),
//         )}
//         tfsa={currency(
//           firstValue(
//             baseProduct.tfsa,
//             baseProduct.totalFaceSumAssured,
//             applicationOverview.tfsa,
//             applicationOverview.totalFaceSumAssured,
//           ),
//         )}
//         tssa={currency(
//           firstValue(
//             baseProduct.tssa,
//             baseProduct.totalSumAssuredAdditional,
//             applicationOverview.tssa,
//             applicationOverview.totalSumAssuredAdditional,
//           ),
//         )}
//         tpsa={currency(
//           firstValue(
//             baseProduct.tpsa,
//             baseProduct.totalPremiumSumAssured,
//             applicationOverview.tpsa,
//             applicationOverview.totalPremiumSumAssured,
//           ),
//         )}
//         riderSummaries={riderSummaries}
//         onViewRiders={() => setRiderDialogOpen(true)}
//       />

//       <CustomDialog
//         open={riderDialogOpen}
//         onClose={() => setRiderDialogOpen(false)}
//         title="Rider Details"
//         maxWidth="lg"
//       >
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
//             gap: 0.8,
//             minWidth: { xs: "auto", md: 720 },
//           }}
//         >
//           {riderSummaries.map((rider) => (
//             <Box
//               key={rider.id}
//               sx={{
//                 p: 0.9,
//                 border: "1px solid #E4DEDB",
//                 borderLeft: "4px solid #A92129",
//                 borderRadius: 1.1,
//                 bgcolor: "#FAF8F7",
//               }}
//             >
//               <Typography
//                 sx={{ color: "#332D2A", fontSize: 12, fontWeight: 900 }}
//               >
//                 {rider.name}
//               </Typography>

//               <Box
//                 sx={{
//                   display: "grid",
//                   gridTemplateColumns: "1fr 1fr",
//                   gap: 0.7,
//                   mt: 0.75,
//                 }}
//               >
//                 <CompactField label="Sum assured" value={rider.sumAssured} />
//                 <CompactField label="Premium" value={rider.premium} />
//                 <CompactField label="Policy term" value={rider.policyTerm} />
//                 <CompactField label="Premium term" value={rider.premiumTerm} />
//               </Box>
//             </Box>
//           ))}
//         </Box>
//       </CustomDialog>
//     </Box>
//   );
// };

// export default Grievance;


import { Avatar, Box, Pagination, TextField, Typography } from "@mui/material";
import { useState } from "react";

import CustomButton from "../../components/ui/Button/Button";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import CustomTable, {
  type Column,
} from "../../components/ui/Table/Table";
import { KeyRightArrowIcon, UserProfileIcon } from "../../icons/Icons";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import CustomAccordion from "../../components/ui/Accordion/Accordion";

type UnknownRecord = Record<string, unknown>;

interface RiderSummary {
  id: string;
  name: string;
  sumAssured: string;
  policyTerm: string;
  premiumTerm: string;
  premium: string;
}

interface GrievanceRow {
  userName: string;
  userRole: string;
  fupCode: string;
  grievanceRaisedRemark: string;
  grievanceRaisedDate: string;
  tpaRemarks: string;
}

interface GrievanceProps {
  paginationDisabled?: boolean;
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
  onViewRiders: () => void;
}

const STATIC_GRIEVANCE_ROWS: GrievanceRow[] = [
  {
    userName: "Premanand Sawant",
    userRole: "UW",
    fupCode: "ECG",
    grievanceRaisedRemark: "ECG graph is blurry",
    grievanceRaisedDate: "7 Sep 2026",
    tpaRemarks: "",
  },
];

const STATIC_GRIEVANCE_HISTORY_ROWS: GrievanceRow[] = [];
const ROWS_PER_PAGE = 5;

const GRIEVANCE_HISTORY_COLUMNS: Column<GrievanceRow>[] = [
  { key: "userName", header: "User Name", width: "8%" },
  { key: "userRole", header: "User Role", width: "8%" },
  { key: "fupCode", header: "FUP Code", width: "8%" },
  {
    key: "grievanceRaisedRemark",
    header: "Grievance Raised Remark",
    width: "12%",
  },
  {
    key: "grievanceRaisedDate",
    header: "Grievance Raised Date",
    width: "8%",
  },
  { key: "tpaRemarks", header: "TPA Remarks", width: "14%" },
];

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const firstValue = (...values: unknown[]): unknown =>
  values.find(
    (value) => value !== null && value !== undefined && value !== "",
  );

const text = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

const currency = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? `₹${new Intl.NumberFormat("en-IN").format(numericValue)}`
    : text(value);
};

const getFullName = (person: UnknownRecord): string =>
  [person.firstName, person.middleName, person.lastName]
    .filter(Boolean)
    .map(String)
    .join(" ") || "-";

const getAddress = (member: UnknownRecord): string => {
  const addresses = Array.isArray(member.address)
    ? member.address
    : Object.keys(toRecord(member.address)).length > 0
      ? [member.address]
      : [];

  const address = toRecord(addresses[0]);

  return (
    [address.city, address.state, address.residingCountry, address.pinCode]
      .filter(Boolean)
      .map(String)
      .join(" - ") || "-"
  );
};

const CompactField = ({ label, value }: { label: string; value: string }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography sx={{ color: "#8B807B", fontSize: 8.5, lineHeight: 1.15 }}>
      {label}
    </Typography>

    <Typography
      title={value}
      sx={{
        mt: 0.2,
        color: "#302A27",
        fontSize: 10.5,
        fontWeight: 800,
        lineHeight: 1.25,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </Typography>
  </Box>
);

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
  onViewRiders,
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
            bgcolor: "rgba(255, 255, 255, 0.18)",
            color: "#000000",
            border: "2px solid rgba(255, 255, 255, 0.45)",
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
              color: "#000000",
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
              border: "1px solid rgba(169, 33, 41, 0.18)",
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
            color: "#000000",
            fontSize: { xs: 10, sm: 11.5 },
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
            color: "#000000",
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
            flexWrap: "wrap",
          }}
        >
          <Typography
            sx={{
              color: "#000000",
              fontSize: { xs: 10, sm: 11.5 },
              lineHeight: 1.65,
              fontWeight: 800,
            }}
          >
            Riders:
          </Typography>

          {riderSummaries.length > 0 ? (
            <Typography
              sx={{
                flex: 1,
                minWidth: 0,
                color: "#000000",
                fontSize: { xs: 10, sm: 11.5 },
                lineHeight: 1.65,
                fontWeight: 600,
                overflowWrap: "anywhere",
              }}
            >
              {riderSummaries.map((rider, index) => (
                <Box component="span" key={rider.id}>
                  {rider.name} - SA {rider.sumAssured}
                  {index < riderSummaries.length - 1 ? " / " : ""}
                </Box>
              ))}
            </Typography>
          ) : (
            <Typography
              sx={{
                color: "#000000",
                fontSize: { xs: 10, sm: 11.5 },
                lineHeight: 1.65,
                fontWeight: 600,
              }}
            >
              No riders
            </Typography>
          )}

          {riderSummaries.length > 0 && (
            <Box
              component="button"
              type="button"
              onClick={onViewRiders}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.25,
                border: 0,
                p: 0,
                ml: 0.5,
                mt: 0.15,
                bgcolor: "transparent",
                color: "#A92129",
                fontSize: 9,
                fontWeight: 900,
                cursor: "pointer",
                fontFamily: "inherit",
                whiteSpace: "nowrap",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              View details <KeyRightArrowIcon />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const Grievance = ({ paginationDisabled = true }: GrievanceProps) => {
  const drsData = useAppSelector((state: RootState) => state.drs.data);
  const [riderDialogOpen, setRiderDialogOpen] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [tpaPage, setTpaPage] = useState(1);
  const [tpaRemarks, setTpaRemarks] = useState<string[]>(
    STATIC_GRIEVANCE_ROWS.map(() => ""),
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const updateTpaRemark = (rowIndex: number, value: string) => {
    setTpaRemarks((currentRemarks) =>
      currentRemarks.map((remark, index) =>
        index === rowIndex ? value : remark,
      ),
    );
  };

  const tpaGrievanceColumns: Column<GrievanceRow>[] = [
    ...GRIEVANCE_HISTORY_COLUMNS.slice(0, -1),
    {
      key: "tpaRemarks",
      header: "TPA Remarks",
      width: "14%",
      render: (_value, _row, rowIndex) => {
        const absoluteRowIndex = (tpaPage - 1) * ROWS_PER_PAGE + rowIndex;

        return (
          <TextField
            fullWidth
            size="small"
            required
            placeholder="Enter TPA remarks *"
            value={tpaRemarks[absoluteRowIndex] ?? ""}
            error={submitAttempted && !tpaRemarks[absoluteRowIndex]?.trim()}
            onChange={(event) =>
              updateTpaRemark(absoluteRowIndex, event.target.value)
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 32,
                borderRadius: "10px",
                bgcolor: "#FFFFFF",
                fontSize: "10px",
              },
              "& .MuiOutlinedInput-input": {
                px: 1.2,
                py: 0.7,
              },
            }}
          />
        );
      },
    },
  ];

  const historyPageCount = Math.max(
    1,
    Math.ceil(STATIC_GRIEVANCE_HISTORY_ROWS.length / ROWS_PER_PAGE),
  );
  const tpaPageCount = Math.max(
    1,
    Math.ceil(STATIC_GRIEVANCE_ROWS.length / ROWS_PER_PAGE),
  );
  const visibleHistoryRows = STATIC_GRIEVANCE_HISTORY_ROWS.slice(
    (historyPage - 1) * ROWS_PER_PAGE,
    historyPage * ROWS_PER_PAGE,
  );
  const visibleTpaRows = STATIC_GRIEVANCE_ROWS.slice(
    (tpaPage - 1) * ROWS_PER_PAGE,
    tpaPage * ROWS_PER_PAGE,
  );

  const handleSubmit = () => {
    setSubmitAttempted(true);

    if (tpaRemarks.some((remark) => !remark.trim())) {
      return;
    }

    // Static UI prototype: connect the submission API here when required.
  };

  const source = toRecord(drsData);
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
  const riderDetails = Array.isArray(applicationOverview.riderDetails)
    ? applicationOverview.riderDetails.map(toRecord)
    : products.filter(
        (product) => String(product.type ?? "").toLowerCase() === "rider",
      );

  const riderSummaries: RiderSummary[] = riderDetails
    .map((rider, index) => ({
      id: String(firstValue(rider.id, rider.productCode, index)),
      name: text(firstValue(rider.name, rider.riderName, rider.productName)),
      sumAssured: currency(
        firstValue(rider.sumAssured, rider.tsa, rider.appliedSA),
      ),
      policyTerm: text(firstValue(rider.policyTerm, rider.term)),
      premiumTerm: text(
        firstValue(rider.premiumPaymentTerm, rider.ppt),
      ),
      premium: currency(firstValue(rider.premium, rider.annualPremium)),
    }))
    .filter((rider) => rider.name !== "-");

  const age = firstValue(
    toRecord(personal.age).years,
    personal.age,
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
  const annualIncome = currency(
    firstValue(
      financialDetails.annualIncome,
      personalDetails.netIncomeAmt,
    ),
  );
  const personalSummary = [
    text(firstValue(personal.maritalStatus, applicantDetails.maritalStatus)),
    age ? `${text(age)} years` : "-",
    text(firstValue(personal.gender, applicantDetails.gender)),
    text(firstValue(personal.education, applicantDetails.education)),
    annualIncome !== "-" ? `${annualIncome} p.a.` : "-",
    address,
    text(firstValue(personal.nationality, applicantDetails.nationality)),
    text(firstValue(personal.residentStatus, personal.countryOfResidence)),
  ]
    .filter((value) => value !== "-")
    .join(" / ");

  return (
    <Box sx={{ width: "100%", minWidth: 0, px: 0.5, py: 0.75 }}>
      <ApplicationSummaryBanner
        image={String(firstValue(applicant.profileImage, personal.profileImage) ?? "")}
        name={getFullName({ ...applicant, ...personal })}
        appNo={text(
          firstValue(
            source.applicationNumber,
            source.applicationNo,
            applicationOverview.applicationNumber,
            applicationOverview.applicationNo,
          ),
        )}
        personalSummary={personalSummary}
        productName={text(
          firstValue(
            baseProduct.productName,
            baseProduct.name,
            applicationOverview.productName,
            applicationOverview.product,
          ),
        )}
        policyTerm={text(
          firstValue(
            baseProduct.policyTerm,
            baseProduct.term,
            applicationOverview.policyTerm,
          ),
        )}
        premiumTerm={text(
          firstValue(
            baseProduct.premiumPaymentTerm,
            baseProduct.ppt,
            applicationOverview.premiumPaymentTerm,
          ),
        )}
        sumAssured={currency(
          firstValue(
            baseProduct.sumAssured,
            baseProduct.appliedSA,
            applicationOverview.sumAssured,
            applicationOverview.appliedSa,
          ),
        )}
        tsa={currency(
          firstValue(
            baseProduct.tsa,
            baseProduct.totalSumAssured,
            applicationOverview.tsa,
            applicationOverview.totalSumAssured,
          ),
        )}
        tfsa={currency(
          firstValue(
            baseProduct.tfsa,
            baseProduct.totalFaceSumAssured,
            applicationOverview.tfsa,
            applicationOverview.totalFaceSumAssured,
          ),
        )}
        tssa={currency(
          firstValue(
            baseProduct.tssa,
            baseProduct.totalSumAssuredAdditional,
            applicationOverview.tssa,
            applicationOverview.totalSumAssuredAdditional,
          ),
        )}
        tpsa={currency(
          firstValue(
            baseProduct.tpsa,
            baseProduct.totalPremiumSumAssured,
            applicationOverview.tpsa,
            applicationOverview.totalPremiumSumAssured,
          ),
        )}
        riderSummaries={riderSummaries}
        onViewRiders={() => setRiderDialogOpen(true)}
      />

      <Box
        sx={{
          mt: 1.25,
          display: "grid",
          gap: 1.25,
        }}
      >
        <CustomAccordion title="Decision History" defaultExpanded>
            <CustomTable
            title="Grievance History"
            columns={GRIEVANCE_HISTORY_COLUMNS}
            data={visibleHistoryRows}
            />

            <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
              <Pagination
                count={historyPageCount}
                page={historyPage}
                onChange={(_, nextPage) => setHistoryPage(nextPage)}
                disabled={paginationDisabled}
                shape="rounded"
                size="small"
                sx={{
                  "& .MuiPaginationItem-root": { color: "#555555" },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    color: "#ffffff",
                    bgcolor: "#E45F14",
                    "&:hover": { bgcolor: "#E45F14" },
                  },
                }}
              />
            </Box>
          </CustomAccordion>

        <CustomTable
          title="TPA Grievance Details"
          columns={tpaGrievanceColumns}
          data={visibleTpaRows}
        />

        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
          <Pagination
            count={tpaPageCount}
            page={tpaPage}
            onChange={(_, nextPage) => setTpaPage(nextPage)}
            disabled={paginationDisabled}
            shape="rounded"
            size="small"
            sx={{
              "& .MuiPaginationItem-root": { color: "#555555" },
              "& .MuiPaginationItem-root.Mui-selected": {
                color: "#ffffff",
                bgcolor: "#E45F14",
                "&:hover": { bgcolor: "#E45F14" },
              },
            }}
          />
        </Box>

        <Box sx={{ display: "flex", justifyContent: "center", pt: 0.35 }}>
          <CustomButton
            type="button"
            variant="contained"
            onClick={handleSubmit}
            sx={{
              minWidth: 175,
              minHeight: 32,
              borderRadius: "18px",
              bgcolor: "#B3262E",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "none",
              "&:hover": {
                bgcolor: "#941F26",
              },
            }}
          >
            Submit
          </CustomButton>
        </Box>
      </Box>

      <CustomDialog
        open={riderDialogOpen}
        onClose={() => setRiderDialogOpen(false)}
        title="Rider Details"
        maxWidth="lg"
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 0.8,
            minWidth: { xs: "auto", md: 720 },
          }}
        >
          {riderSummaries.map((rider) => (
            <Box
              key={rider.id}
              sx={{
                p: 0.9,
                border: "1px solid #E4DEDB",
                borderLeft: "4px solid #A92129",
                borderRadius: 1.1,
                bgcolor: "#FAF8F7",
              }}
            >
              <Typography
                sx={{ color: "#332D2A", fontSize: 12, fontWeight: 900 }}
              >
                {rider.name}
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 0.7,
                  mt: 0.75,
                }}
              >
                <CompactField label="Sum assured" value={rider.sumAssured} />
                <CompactField label="Premium" value={rider.premium} />
                <CompactField label="Policy term" value={rider.policyTerm} />
                <CompactField label="Premium term" value={rider.premiumTerm} />
              </Box>
            </Box>
          ))}
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default Grievance;
