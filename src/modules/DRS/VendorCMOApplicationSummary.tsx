// import { Avatar, Box, Button, Typography } from "@mui/material";
// import {
//   cloneElement,
//   isValidElement,
//   useEffect,
//   useState,
//   type ReactElement,
//   type ReactNode,
// } from "react";

// // import CustomAccordion from "../../components/ui/Accordion/Accordion";
// import CustomDialog from "../../components/ui/Dialog/Dialog";
// import { KeyRightArrowIcon, UserProfileIcon } from "../../icons/Icons";
// import { useAppSelector } from "../../store/hooks";
// import type { RootState } from "../../store/store";
// //import { formatDate } from "../../utils/dataFormat";
// import BreDecision from "./DRS_Accordions/BreDecision";

// /* -------------------------------------------------------------------------- */
// /* TYPES                                                                      */
// /* -------------------------------------------------------------------------- */

// interface CMOApplicationSummaryProps {
//   onBackToInbox?: () => void;
//   readOnly?: boolean;
//   showRiskAnalytics?: boolean;
//   uwDecision?: ReactNode;
//   quickLinks?: ReactNode;
//   requirementManagement?: ReactNode;
//   decisionHistory?: ReactNode;
//   stickyTop?: number | string;
// }

// type QuickLinkPanel =
//   | "summary"
//   | "requirementManagement"
//   | "decisionHistory";

// type RequirementStatusFilter =
//   | "All"
//   | "Pending"
//   | "Received"
//   | "Accept"
//   | "Cancelled"
//   | "Reject"
//   | "Waived";

// interface CaseSnapshotRowProps {
//   breDecision: ReactNode;
//   applicationOverview: ReactNode;
//   applicantSummary?: ReactNode;
//   riskAnalytics?: ReactNode;
//   uwDecision?: ReactNode;
//   quickLinks?: ReactNode;
//   readOnly?: boolean;
//   stickyTop?: number | string;
// }

// type UnknownRecord = Record<string, unknown>;

// type RiskStatus = "clear" | "attention" | "unavailable";

// const REQUIREMENT_STATUS_FILTERS: RequirementStatusFilter[] = [
//   "All",
//   "Pending",
//   "Received",
//   "Accept",
//   "Cancelled",
//   "Reject",
//   "Waived",
// ];

// const REQUIREMENT_STATUS_TONES: Record<
//   RequirementStatusFilter,
//   { background: string; border: string; text: string; count: string }
// > = {
//   All: {
//     background: "#F5F3F2",
//     border: "#D8D1CD",
//     text: "#514A46",
//     count: "#697780",
//   },
//   Pending: {
//     background: "#FFF3E8",
//     border: "#F3C7A6",
//     text: "#B54A00",
//     count: "#E45F14",
//   },
//   Received: {
//     background: "#EEF6FF",
//     border: "#BED6EE",
//     text: "#2F668F",
//     count: "#46799F",
//   },
//   Accept: {
//     background: "#EEF8F1",
//     border: "#B8DCC0",
//     text: "#28743C",
//     count: "#28743C",
//   },
//   Cancelled: {
//     background: "#F3F1F0",
//     border: "#D8D1CD",
//     text: "#706763",
//     count: "#706763",
//   },
//   Reject: {
//     background: "#FDEBEC",
//     border: "#F2C4C7",
//     text: "#B3262E",
//     count: "#B3262E",
//   },
//   Waived: {
//     background: "#F3EEFF",
//     border: "#D8C8F2",
//     text: "#6C4AA0",
//     count: "#6C4AA0",
//   },
// };

// type ApplicantDetailTab =
//   | "personal"
//   | "kyc"
//   | "financial"
//   | "nominee"
//   | "medical"
//   | "address"
//   | "contact";

// type FieldConfig = readonly [key: string, label: string];

// interface RiskDetail {
//   key: string;
//   label: string;
//   value: unknown;
// }

// interface RiskCard {
//   id: string;
//   label: string;
//   value: string;
//   status: RiskStatus;
//   details: RiskDetail[];
// }

// /* -------------------------------------------------------------------------- */
// /* CONSTANTS                                                                  */
// /* -------------------------------------------------------------------------- */

// const MEDICAL_FIELDS: FieldConfig[] = [
//   ["brePhysicalMedicalDecision", "Physical Medical Decision"],
//   ["brePhysicalMedicalRemark", "Physical Medical Remark"],
//   ["breTeleVideoMerDecision", "Tele/Video MER Decision"],
//   ["breTeleVideoMerRemark", "Tele/Video MER Remark"],
//   ["munichReMedicalDecision", "MunichRe Medical Decision"],
//   ["munichReRating", "MunichRe Rating"],
//   ["biuMedicalStatus", "BIU Medical Status"],
// ];

// const OTHER_RISK_FIELDS: FieldConfig[] = [
//   ["ptlrResponse", "PTLR Response"],
//   ["drcResponse", "DRC Response"],
//   ["adverseIIB", "Adverse IIB"],
//   ["criminalQuestionResponseLA", "Criminal Question Response LA"],
//   ["pepQuestionResponseLA", "PEP Question Response LA"],
//   ["criminalQuestionResponsePR", "Criminal Question Response PR"],
//   ["pepQuestionResponsePR", "PEP Question Response PR"],
//   ["previousPolicySubstandard", "Previous Policy Substandard"],
//   ["avocationRelatedDisclosure", "Avocation Related Disclosure"],
//   ["healthQuestionPositive", "Health Question Positive"],
//   ["employmentInRiskyIndustry", "Employment In Risky Industry"],
//   ["fatfOfacCountryLogin", "FATF/OFAC Country Login"],
//   ["hazardousOccupation", "Hazardous Occupation"],
//   ["eddFlag", "EDD Flag"],
//   ["claimRiskIndicator", "Claim Risk Indicator"],
//   ["faceMatchScore", "Face Match Score"],
//   ["tobacco", "Tobacco"],
//   ["narcotics", "Narcotics"],
// ];

// const RISK_TONES: Record<
//   RiskStatus,
//   {
//     background: string;
//     border: string;
//     text: string;
//     label: string;
//   }
// > = {
//   clear: {
//     background: "#EEF8F1",
//     border: "#B8DCC0",
//     text: "#28743C",
//     label: "Clear",
//   },

//   attention: {
//     background: "#FFF0F0",
//     border: "#E8B8BC",
//     text: "#B3262E",
//     label: "Attention",
//   },

//   unavailable: {
//     background: "#F4F3F2",
//     border: "#DED9D6",
//     text: "#756D69",
//     label: "No data",
//   },
// };

// /* -------------------------------------------------------------------------- */
// /* HELPERS                                                                    */
// /* -------------------------------------------------------------------------- */

// const toRecord = (value: unknown): UnknownRecord =>
//   value && typeof value === "object" && !Array.isArray(value)
//     ? (value as UnknownRecord)
//     : {};

// const isNonEmptyRecord = (value: UnknownRecord): boolean =>
//   Object.keys(value).length > 0;

// const text = (value: unknown): string => {
//   if (value === null || value === undefined || value === "") {
//     return "-";
//   }

//   if (typeof value === "boolean") {
//     return value ? "Yes" : "No";
//   }

//   return String(value);
// };

// const firstValue = (...values: unknown[]): unknown =>
//   values.find(
//     (value) => value !== null && value !== undefined && value !== "",
//   );

// const currency = (value: unknown): string => {
//   if (value === null || value === undefined || value === "") {
//     return "-";
//   }

//   const numericValue = Number(value);

//   return Number.isFinite(numericValue)
//     ? `₹${new Intl.NumberFormat("en-IN").format(numericValue)}`
//     : text(value);
// };

// const normalizeValue = (value: unknown): string =>
//   String(value ?? "")
//     .trim()
//     .toLowerCase()
//     .replace(/[\s_-]/g, "");

// const parsePercentage = (value: unknown): number | null => {
//   const normalizedValue = String(value ?? "")
//     .replace("%", "")
//     .trim();

//   if (!normalizedValue) {
//     return null;
//   }

//   const numericValue = Number.parseFloat(normalizedValue);

//   return Number.isNaN(numericValue) ? null : numericValue;
// };

// const isYesValue = (value: unknown): boolean =>
//   ["y", "yes", "true"].includes(normalizeValue(value));

// const getFullName = (person: UnknownRecord): string =>
//   [person.firstName, person.middleName, person.lastName]
//     .filter(Boolean)
//     .map(String)
//     .join(" ") || "-";

// const getAddress = (member: UnknownRecord): string => {
//   const addresses = Array.isArray(member.address)
//     ? member.address
//     : isNonEmptyRecord(toRecord(member.address))
//       ? [member.address]
//       : [];

//   const address = toRecord(addresses[0]);

//   return (
//     [
//       address.city,
//       address.state,
//       address.residingCountry,
//       address.pinCode,
//     ]
//       .filter(Boolean)
//       .map(String)
//       .join(" - ") || "-"
//   );
// };

// const splitBreCodes = (value: unknown): string[] =>
//   String(value ?? "")
//     .split("#")
//     .map((code) => code.trim())
//     .filter(Boolean);

// const getRequirementStatusFilter = (
//   value: unknown,
// ): Exclude<RequirementStatusFilter, "All"> | null => {
//   const normalizedStatus = String(value ?? "").trim().toUpperCase();

//   if (normalizedStatus === "PENDING") {
//     return "Pending";
//   }

//   if (["ACCEPT", "ACCEPTED"].includes(normalizedStatus)) {
//     return "Accept";
//   }

//   if (["RECEIVE", "RECEIVED"].includes(normalizedStatus)) {
//     return "Received";
//   }

//   if (["CANCEL", "CANCELED", "CANCELLED"].includes(normalizedStatus)) {
//     return "Cancelled";
//   }

//   if (["REJECT", "REJECTED"].includes(normalizedStatus)) {
//     return "Reject";
//   }

//   if (["WAIVE", "WAIVED"].includes(normalizedStatus)) {
//     return "Waived";
//   }

//   return null;
// };

// const getDecisionTone = (decision: string) => {
//   const normalizedDecision = decision.trim().toUpperCase();

//   if (!normalizedDecision || normalizedDecision === "-") {
//     return {
//       background: "#F3F1F0",
//       border: "#DDD7D4",
//       text: "#706763",
//     };
//   }

//   if (
//     ["ST", "STD", "STP", "STANDARD", "SUCCESS"].includes(normalizedDecision)
//   ) {
//     return {
//       background: "#E8F5EC",
//       border: "#B7DFC2",
//       text: "#237A3B",
//     };
//   }

//   if (
//     ["DEC", "DECLINE", "DECLINED", "REJECT", "REJECTED"].some((value) =>
//       normalizedDecision.includes(value),
//     )
//   ) {
//     return {
//       background: "#FDEBEC",
//       border: "#F2C4C7",
//       text: "#B3262E",
//     };
//   }

//   if (
//     ["TUW", "RM", "REFER", "REVIEW", "PENDING"].some((value) =>
//       normalizedDecision.includes(value),
//     )
//   ) {
//     return {
//       background: "#FFF4DF",
//       border: "#F1D394",
//       text: "#9A6200",
//     };
//   }

//   return {
//     background: "#F7EEF0",
//     border: "#E7CBCD",
//     text: "#8D232A",
//   };
// };

// const mapRiskDetails = (
//   risk: UnknownRecord,
//   fields: FieldConfig[],
// ): RiskDetail[] =>
//   fields.map(([key, label]) => ({
//     key,
//     label,
//     value: risk[key],
//   }));

// const getMedicalRiskStatus = (risk: UnknownRecord): RiskStatus => {
//   if (!isNonEmptyRecord(risk)) {
//     return "unavailable";
//   }

//   const physical = normalizeValue(risk.brePhysicalMedicalDecision);
//   const teleVideo = normalizeValue(risk.breTeleVideoMerDecision);
//   const munichRe = normalizeValue(risk.munichReMedicalDecision);
//   const biu = normalizeValue(risk.biuMedicalStatus);

//   const needsAttention =
//     (physical !== "" && physical !== "stp") ||
//     (teleVideo !== "" && teleVideo !== "stp") ||
//     (munichRe !== "" &&
//       !["standard1", "standard2"].includes(munichRe)) ||
//     biu === "y";

//   return needsAttention ? "attention" : "clear";
// };

// const getOtherRiskStatus = (risk: UnknownRecord): RiskStatus => {
//   if (!isNonEmptyRecord(risk)) {
//     return "unavailable";
//   }

//   const ptlr = normalizeValue(risk.ptlrResponse);
//   const drc = normalizeValue(risk.drcResponse);
//   const faceMatchScore = parsePercentage(risk.faceMatchScore);

//   const yesNoRiskFields = [
//     "adverseIIB",
//     "criminalQuestionResponseLA",
//     "pepQuestionResponseLA",
//     "criminalQuestionResponsePR",
//     "pepQuestionResponsePR",
//     "previousPolicySubstandard",
//     "avocationRelatedDisclosure",
//     "healthQuestionPositive",
//     "employmentInRiskyIndustry",
//     "fatfOfacCountryLogin",
//     "hazardousOccupation",
//     "eddFlag",
//     "claimRiskIndicator",
//     "tobacco",
//     "narcotics",
//   ];

//   const needsAttention =
//     ["deepred", "deepmaroon"].includes(ptlr) ||
//     ["highrisk", "mediumrisk"].includes(drc) ||
//     yesNoRiskFields.some((field) => isYesValue(risk[field])) ||
//     (faceMatchScore !== null && faceMatchScore < 75);

//   return needsAttention ? "attention" : "clear";
// };

// const getFirstRisk = (
//   analyticsItems: UnknownRecord[],
//   riskKey: string,
// ): UnknownRecord =>
//   analyticsItems
//     .map((item) => toRecord(item[riskKey]))
//     .find(isNonEmptyRecord) ?? {};

// const buildRiskCards = (applicant: UnknownRecord): RiskCard[] => {
//   const riskAnalytics = applicant.riskAnalytics;

//   const analyticsItems = Array.isArray(riskAnalytics)
//     ? riskAnalytics.map(toRecord)
//     : isNonEmptyRecord(toRecord(riskAnalytics))
//       ? [toRecord(riskAnalytics)]
//       : [];

//   const medicalRisk = getFirstRisk(analyticsItems, "medicalRisk");
//   const otherRisk = getFirstRisk(analyticsItems, "otherRisk");

//   const medicalStatus = getMedicalRiskStatus(medicalRisk);
//   const otherStatus = getOtherRiskStatus(otherRisk);

//   return [
//     {
//       id: "medical",
//       label: "Medical",
//       value: text(
//         firstValue(
//           medicalRisk.brePhysicalMedicalDecision,
//           medicalRisk.breTeleVideoMerDecision,
//           medicalRisk.munichReMedicalDecision,
//         ),
//       ),
//       status: medicalStatus,
//       details: mapRiskDetails(medicalRisk, MEDICAL_FIELDS),
//     },

//     {
//       id: "other",
//       label: "Other Risk",
//       value: text(
//         firstValue(
//           otherRisk.ptlrResponse,
//           otherRisk.drcResponse,
//           otherRisk.faceMatchScore,
//         ),
//       ),
//       status: otherStatus,
//       details: mapRiskDetails(otherRisk, OTHER_RISK_FIELDS),
//     },
//   ];
// };

// /* -------------------------------------------------------------------------- */
// /* COMMON UI                                                                  */
// /* -------------------------------------------------------------------------- */

// const CompactField = ({
//   label,
//   value,
// }: {
//   label: string;
//   value: string;
// }) => (
//   <Box sx={{ minWidth: 0 }}>
//     <Typography
//       sx={{
//         color: "#8B807B",
//         fontSize: 8.5,
//         lineHeight: 1.15,
//       }}
//     >
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

// const DashboardCard = ({
//   title,
//   eyebrow,
//   children,
//   sx,
// }: {
//   title?: string;
//   eyebrow?: string;
//   children: ReactNode;
//   sx?: Record<string, unknown>;
// }) => (
//   <Box
//     sx={{
//       minWidth: 0,
//       border: "1px solid #DED8D5",
//       borderRadius: 1.5,
//       bgcolor: "#FFFFFF",
//       overflow: "hidden",
//       boxShadow: "0 2px 7px rgba(60, 42, 35, 0.07)",
//       ...sx,
//     }}
//   >
//     {(title || eyebrow) && (
//       <Box
//         sx={{
//           px: 1.15,
//           py: 0.75,
//           borderBottom: "1px solid #E9E3E0",
//           bgcolor: "#E45F14",
//         }}
//       >
//         {eyebrow && (
//           <Typography
//             sx={{
//               color: "#A92129",
//               fontSize: 8,
//               fontWeight: 900,
//               letterSpacing: 0.8,
//               textTransform: "uppercase",
//             }}
//           >
//             {eyebrow}
//           </Typography>
//         )}

//         {title && (
//           <Typography
//             sx={{
//               mt: eyebrow ? 0.15 : 0,
//               color: "#fff",
//               fontSize: 12,
//               fontWeight: 900,
//               lineHeight: 1.2,
//             }}
//           >
//             {title}
//           </Typography>
//         )}
//       </Box>
//     )}

//     <Box sx={{ minWidth: 0, p: 1 }}>{children}</Box>
//   </Box>
// );

// /* -------------------------------------------------------------------------- */
// /* APPLICATION SUMMARY BANNER                                                 */
// /* -------------------------------------------------------------------------- */

// interface ApplicationSummaryBannerProps {
//   onBackToInbox?: () => void;
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
//   riderSummaries: Array<{
//     name: string;
//     sumAssured: string;
//     policyTerm: string;
//     premiumTerm: string;
//     premium: string;
//   }>;
//   onViewRiders: () => void;
// }

// const ApplicationSummaryBanner = ({
//   image,
//   name,
//   personalSummary,
//   productName,
//   policyTerm,
//   premiumTerm,
//   sumAssured,
//   tfsa,
//   tssa,
//   tpsa,
//   riderSummaries,
//   onViewRiders,
// }: ApplicationSummaryBannerProps) => {
//   const coverageItems = [
//     `SA - ${sumAssured}`,
//     `TSA - ₹15,00,000`,
//     tfsa !== "-" ? `TFSA - ${tfsa}` : null,
//     tssa !== "-" ? `TSSA - ${tssa}` : null,
//     tpsa !== "-" ? `TPSA - ${tpsa}` : null,
//   ].filter(Boolean) as string[];

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         mb: 0.75,
//         display: "grid",
//         gridTemplateColumns: {
//           xs: "84px minmax(0,1fr)",
//           sm: "150px minmax(0,1fr)",
//         },
//         bgcolor: "#FFEAD7",
//         color: "#000",
//         borderRadius: "12px",
//         overflow: "hidden",
//         boxShadow: "0 3px 10px rgba(169, 33, 41, 0.16)",
//       }}
//     >
//       <Box
//         sx={{
//           position: "relative",
//           minHeight: { xs: 112, sm: 138 },
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           background: "linear-gradient(145deg, #E45F14 0%, #C83C2F 100%)",
//         }}
//       >
//         {/* {onBackToInbox && (
//           <Box
//             component="button"
//             type="button"
//             aria-label="Back to Inbox"
//             onClick={onBackToInbox}
//             sx={{
//               position: "absolute",
//               top: 10,
//               left: 10,
//               width: 30,
//               height: 30,
//               border: "1px solid rgba(255,255,255,.55)",
//               borderRadius: "50%",
//               bgcolor: "rgba(255,255,255,.18)",
//               color: "#FFFFFF",
//               cursor: "pointer",
//               fontSize: 18,
//               lineHeight: 1,
//             }}
//           >
//             Ã¢â€ Â
//           </Box>
//         )} */}
//         <Avatar
//           src={image || undefined}
//           alt={name === "-" ? "Applicant" : name}
//           sx={{
//             width: { xs: 54, sm: 76 },
//             height: { xs: 54, sm: 76 },
//             bgcolor: "rgba(255,255,255,.18)",
//             color: "#000",
//             border: "2px solid rgba(255,255,255,.45)",
//           }}
//         >
//           <UserProfileIcon sx={{ fontSize: { xs: 30, sm: 44 } }} />
//         </Avatar>
//       </Box>

//       <Box sx={{ minWidth: 0, px: { xs: 1.2, sm: 2.2 }, py: { xs: 1, sm: 1.45 } }}>
//       {/* ================================================================ */}
//       {/* NAME + APPLICATION NUMBER                                        */}
//       {/* ================================================================ */}

//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           gap: 2,
//           mb: 0.4,
//         }}
//       >
//         <Typography
//           title={name}
//           sx={{
//             minWidth: 0,
//             color: "#000",
//             fontSize: {
//               xs: 14,
//               sm: 16,
//             },
//             fontWeight: 900,
//             lineHeight: 1.25,
//             overflow: "hidden",
//             textOverflow: "ellipsis",
//             whiteSpace: "nowrap",
//           }}
//         >
//           {name}
//         </Typography>

//         <Typography
//           sx={{
//             flexShrink: 0,
//             px: 1.1,
//             py: 0.45,
//             borderRadius: "16px",
//             bgcolor: "#FFFFFF",
//             border: "1px solid rgba(169,33,41,.18)",
//             color: "#A92129",
//             fontSize: {
//               xs: 11,
//               sm: 13,
//             },
//             fontWeight: 900,
//             whiteSpace: "nowrap",
//           }}
//         >
//           App No. - OB90377122 
//         </Typography>
//       </Box>

//       {/* ================================================================ */}
//       {/* PERSONAL SUMMARY                                                  */}
//       {/* ================================================================ */}

//       <Typography
//         sx={{
//           color: "#000",
//           fontSize: {
//             xs: 10,
//             sm: 11.5,
//           },
//           lineHeight: 1.6,
//           fontWeight: 500,
//           overflowWrap: "anywhere",
//         }}
//       >
//         {personalSummary || "-"}
//       </Typography>

//       {/* ================================================================ */}
//       {/* PRODUCT / POLICY / COVERAGE                                      */}
//       {/* ================================================================ */}

//       <Typography
//         sx={{
//           mt: 0.5,
//           color: "#000",
//           fontSize: {
//             xs: 10,
//             sm: 11.5,
//           },
//           lineHeight: 1.65,
//           fontWeight: 800,
//           overflowWrap: "anywhere",
//         }}
//       >
//         Product:{" "}
//         <Box
//           component="span"
//           sx={{
//             color: "#000",
//             fontWeight: 700,
//           }}
//         >
//           {productName}
//         </Box>

//         {" / "}

//         Policy Term:{" "}
//         <Box
//           component="span"
//           sx={{
//             color: "#000",
//             fontWeight: 700,
//           }}
//         >
//           {policyTerm}
//         </Box>

//         {" / "}

//         Premium Term:{" "}
//         <Box
//           component="span"
//           sx={{
//             color: "#000",
//             fontWeight: 700,
//           }}
//         >
//           {premiumTerm}
//         </Box>

//         {coverageItems.map((item) => (
//           <Box
//             component="span"
//             key={item}
//             sx={{
//               color: "#000",
//               fontWeight: 700,
//             }}
//           >
//             {" / "}
//             {item}
//           </Box>
//         ))}
//       </Typography>

//       {/* ================================================================ */}
//       {/* RIDERS                                                            */}
//       {/* ================================================================ */}

//       <Box
//         sx={{
//           mt: 0.45,
//           display: "flex",
//           alignItems: "flex-start",
//           gap: 0.35,
//           flexWrap: "wrap",
//         }}
//       >
//         <Typography
//           sx={{
//             color: "#000",
//             fontSize: {
//               xs: 10,
//               sm: 11.5,
//             },
//             lineHeight: 1.65,
//             fontWeight: 800,
//           }}
//         >
//           Riders:
//         </Typography>

//         {riderSummaries.length > 0 ? (
//           <Typography
//             sx={{
//               flex: 1,
//               minWidth: 0,
//               color: "#000",
//               fontSize: {
//                 xs: 10,
//                 sm: 11.5,
//               },
//               lineHeight: 1.65,
//               fontWeight: 600,
//               overflowWrap: "anywhere",
//             }}
//           >
//             {riderSummaries.map((rider, index) => (
//               <Box
//                 component="span"
//                 key={`${rider.name}-${index}`}
//               >
//                 {rider.name} - SA ₹{rider.sumAssured}
//                 {index < riderSummaries.length - 1
//                   ? " / "
//                   : ""}
//               </Box>
//             ))}
//           </Typography>
//         ) : (
//           <Typography
//             sx={{
//               color: "#000",
//               fontSize: {
//                 xs: 10,
//                 sm: 11.5,
//               },
//               lineHeight: 1.65,
//               fontWeight: 600,
//             }}
//           >
//             No riders
//           </Typography>
//         )}

//         {riderSummaries.length > 0 && (
//           <Box
//             component="button"
//             type="button"
//             onClick={onViewRiders}
//             sx={{
//               border: 0,
//               p: 0,
//               ml: 0.5,
//               mt: 0.15,
//               bgcolor: "transparent",
//               color: "#FFEAD7",
//               fontSize: 9,
//               fontWeight: 900,
//               cursor: "pointer",
//               fontFamily: "inherit",
//               whiteSpace: "nowrap",
//               "&:hover": {
//                 textDecoration: "underline",
//               },
//             }}
//           >
//             View details <KeyRightArrowIcon/>
//           </Box>
//         )}
//       </Box>
//       </Box>
//     </Box>
//   );
// };

// /* -------------------------------------------------------------------------- */
// /* RISK CARD                                                                  */
// /* -------------------------------------------------------------------------- */

// const RiskAnalyticsCard = ({
//   card,
//   onClick,
// }: {
//   card: RiskCard;
//   onClick: () => void;
// }) => {
//   const tone = RISK_TONES[card.status];
//   const icon ='';
//   const visibleDetails = card.details
//     .filter((detail) => text(detail.value) !== "-")
//     .slice(0, 3);

//   return (
//     <Box
//       role="button"
//       tabIndex={0}
//       onClick={onClick}
//       onKeyDown={(event) => {
//         if (event.key === "Enter" || event.key === " ") onClick();
//       }}
//       sx={{
//         width: "100%",
//         minWidth: 0,
//         minHeight: 190,
//         p: 1.25,
//         display: "flex",
//         flexDirection: "column",
//         border: `1px solid ${tone.border}`,
//         borderTop: `5px solid ${tone.text}`,
//         borderRadius: "12px",
//         bgcolor: "#FFFFFF",
//         cursor: "pointer",
//         fontFamily: "inherit",
//         textAlign: "left",
//         transition: "all .15s ease",

//         "&:hover": {
//           transform: "translateY(-1px)",
//           boxShadow: "0 3px 8px rgba(50,40,35,.1)",
//         },
//       }}
//     >
//       <Box sx={{ minWidth: 0, flex: 1 }}>
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "center",
//             gap: 0.8,
//           }}
//         >
//           <Typography component="span" sx={{ fontSize: 15, lineHeight: 1 }}>
//             {icon}
//           </Typography>
//           <Typography
//             sx={{
//               color: "#302A27",
//               fontSize: 12,
//               fontWeight: 900,
//             }}
//           >
//             {card.id === "other" ? "Risk Parameters" : card.label}
//           </Typography>
//         </Box>

//         <Box sx={{ mt: 1 }}>
//           {visibleDetails.length > 0 ? visibleDetails.map((detail) => (
//             <Typography
//               key={detail.key}
//               sx={{ color: "#403936", fontSize: 10.5, lineHeight: 1.35, overflowWrap: "anywhere" }}
//             >
//               {detail.label}: {" "}
//               <Box component="span" sx={{ color: tone.text, fontWeight: 900 }}>
//                 {text(detail.value)}
//               </Box>
//             </Typography>
//           )) : (
//             <Typography sx={{ color: tone.text, fontSize: 11, fontWeight: 900 }}>
//               {card.value}
//             </Typography>
//           )}
//         </Box>
//       </Box>

//       <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mt: 1 }}>
//         <Box sx={{ width: 34, height: 28, display: "grid", placeItems: "center", border: "1px solid #E1D8D2", borderRadius: "14px", bgcolor: "#FFF8F3", color: "#A92129", fontSize: 13 }}>
//           <KeyRightArrowIcon/>
//         </Box>
//         <Box sx={{ px: 1.2, py: 0.65, border: "1px solid #E1D8D2", borderRadius: "16px", bgcolor: "#FFF8F3", color: "#5B302A", fontSize: 9.5, fontWeight: 800 }}>
//           View {card.id === "other" ? "Risk" : card.label}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// /* -------------------------------------------------------------------------- */
// /* MAIN COMPONENT                                                             */
// /* -------------------------------------------------------------------------- */

// const VendorCMOApplicationSummary = ({
//   onBackToInbox,
//   readOnly = false,
//   showRiskAnalytics = true,
//   uwDecision,
//   quickLinks,
//   requirementManagement,
//   decisionHistory,
//   stickyTop = 72,
// }: CMOApplicationSummaryProps) => {
//   const drsData = useAppSelector(
//     (state: RootState) => state.drs.data,
//   );

//   const searchData = useAppSelector(
//     (state: RootState) => state.searchApplication.response?.data,
//   );

//   const [selectedRiskCard, setSelectedRiskCard] =
//     useState<RiskCard | null>(null);

//   const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);

//   const [detailTab, setDetailTab] =
//     useState<ApplicantDetailTab>("personal");

//   const [breDetailDialogOpen, setBreDetailDialogOpen] =
//     useState(false);

//   const [requirementStatusFilter, setRequirementStatusFilter] =
//     useState<RequirementStatusFilter>("All");
//   const [requirementStatusFilterSignal, setRequirementStatusFilterSignal] =
//     useState(0);

//   const [riderDialogOpen, setRiderDialogOpen] = useState(false);
//   const [activeQuickLinkPanel, setActiveQuickLinkPanel] =
//     useState<QuickLinkPanel | null>(null);
//   const quickLinkDialogOpen = activeQuickLinkPanel !== null;
//   const closeQuickLinkPanel = () => setActiveQuickLinkPanel(null);

//   const openRequirementManagementPanel = (
//     status: RequirementStatusFilter = "All",
//   ) => {
//     setRequirementStatusFilter(status);
//     setRequirementStatusFilterSignal((currentSignal) => currentSignal + 1);
//     setActiveQuickLinkPanel("requirementManagement");
//   };

//   useEffect(() => {
//     const openApplicantSummary = () => setActiveQuickLinkPanel("summary");
//     const openRequirementManagement = () => {
//       setRequirementStatusFilter("All");
//       setRequirementStatusFilterSignal((currentSignal) => currentSignal + 1);
//       setActiveQuickLinkPanel("requirementManagement");
//     };
//     const openDecisionHistory = () =>
//       setActiveQuickLinkPanel("decisionHistory");

//     window.addEventListener("open-applicant-summary", openApplicantSummary);
//     window.addEventListener("open-requirement-management", openRequirementManagement);
//     window.addEventListener("open-decision-history", openDecisionHistory);

//     return () => {
//       window.removeEventListener("open-applicant-summary", openApplicantSummary);
//       window.removeEventListener("open-requirement-management", openRequirementManagement);
//       window.removeEventListener("open-decision-history", openDecisionHistory);
//     };
//   }, []);

//   const source = toRecord(readOnly ? searchData : drsData);

//   const requirementRows = Array.isArray(source.requirementManagement)
//     ? source.requirementManagement.map(toRecord)
//     : [];

//   const requirementStatusCounts = requirementRows.reduce<
//     Record<RequirementStatusFilter, number>
//   >(
//     (counts, requirement) => {
//       counts.All += 1;

//       const status = getRequirementStatusFilter(requirement.status);

//       if (status) {
//         counts[status] += 1;
//       }

//       return counts;
//     },
//     {
//       All: 0,
//       Pending: 0,
//       Received: 0,
//       Accept: 0,
//       Cancelled: 0,
//       Reject: 0,
//       Waived: 0,
//     },
//   );

//   const applicationOverview = toRecord(
//     source.applicationOverview,
//   );

//   const initialBre = toRecord(source.breDecision);

//   const latestBreCandidate = toRecord(
//     source.latestBreDecision,
//   );

//   const finalBre = isNonEmptyRecord(latestBreCandidate)
//     ? latestBreCandidate
//     : initialBre;

//   const members = Array.isArray(source.summary)
//     ? source.summary.map(toRecord)
//     : [];

//   const activeMemberIndex =
//     selectedMemberIndex < members.length
//       ? selectedMemberIndex
//       : 0;

//   const applicant = members[activeMemberIndex] ?? {};

//   const applicantDetails = toRecord(
//     applicant.applicantDetails,
//   );

//   const personalDetails = toRecord(
//     applicant.personalDetails,
//   );

//   const personal = {
//     ...applicantDetails,
//     ...personalDetails,
//     ...toRecord(applicant.personalSummary),
//     ...toRecord(applicant.proposerSummary),
//   };

//   const kycDetails = {
//     ...toRecord(applicant.kyc),
//     ...toRecord(applicant.kycDetails),
//     ...toRecord(applicant.applicantKycDetails),
//     ...toRecord(personal.kycDetails),
//   };

//   const finance = toRecord(
//     applicant.applicantFinancialDetails,
//   );

//   const financialDetails = toRecord(
//     applicant.financialDetails,
//   );

//   const nomineeDetails = toRecord(
//     applicant.nomineeDetails ??
//       applicant.nominee ??
//       applicant.nomineeSummary,
//   );

//   const medicalDetails = toRecord(
//     applicant.medicalDetails ??
//       applicant.medicalSummary ??
//       applicant.medical,
//   );

//   /* ------------------------------------------------------------------------ */
//   /* PRODUCT                                                                  */
//   /* ------------------------------------------------------------------------ */

//   const products = Array.isArray(
//     applicationOverview.productDetail,
//   )
//     ? applicationOverview.productDetail.map(toRecord)
//     : [];

//   const baseProduct =
//     products.find(
//       (product) =>
//         String(product.type ?? "").toLowerCase() === "base",
//     ) ??
//     products[0] ??
//     applicationOverview;

//   const riderDetails = Array.isArray(
//     applicationOverview.riderDetails,
//   )
//     ? applicationOverview.riderDetails.map(toRecord)
//     : products.filter(
//         (product) =>
//           String(product.type ?? "").toLowerCase() === "rider",
//       );

//   const productName = text(
//     firstValue(
//       baseProduct.productName,
//       baseProduct.name,
//       applicationOverview.productName,
//       applicationOverview.product,
//     ),
//   );

//   const policyTerm = text(
//     firstValue(
//       baseProduct.policyTerm,
//       baseProduct.term,
//       applicationOverview.policyTerm,
//     ),
//   );

//   const premiumTerm = text(
//     firstValue(
//       baseProduct.premiumPaymentTerm,
//       baseProduct.ppt,
//       applicationOverview.premiumPaymentTerm,
//     ),
//   );

//   const sumAssured = currency(
//     firstValue(
//       baseProduct.sumAssured,
//       baseProduct.appliedSA,
//       applicationOverview.sumAssured,
//       applicationOverview.appliedSa,
//     ),
//   );

//   const tsa = currency(
//     firstValue(
//       baseProduct.tsa,
//       baseProduct.totalSumAssured,
//       applicationOverview.tsa,
//       applicationOverview.totalSumAssured,
//     ),
//   );

//   const tfsa = currency(
//     firstValue(
//       baseProduct.tfsa,
//       baseProduct.totalFaceSumAssured,
//       applicationOverview.tfsa,
//       applicationOverview.totalFaceSumAssured,
//     ),
//   );

//   const tssa = currency(
//     firstValue(
//       baseProduct.tssa,
//       baseProduct.totalSumAssuredAdditional,
//       applicationOverview.tssa,
//       applicationOverview.totalSumAssuredAdditional,
//     ),
//   );

//   const tpsa = currency(
//     firstValue(
//       baseProduct.tpsa,
//       baseProduct.totalPremiumSumAssured,
//       applicationOverview.tpsa,
//       applicationOverview.totalPremiumSumAssured,
//     ),
//   );

//   const riderSummaries = riderDetails
//     .map((rider, index) => ({
//       id: String(
//         firstValue(
//           rider.id,
//           rider.productCode,
//           index,
//         ),
//       ),

//       name: text(
//         firstValue(
//           rider.name,
//           rider.riderName,
//           rider.productName,
//         ),
//       ),

//       sumAssured: currency(
//         firstValue(
//           rider.sumAssured,
//           rider.tsa,
//           rider.appliedSA,
//         ),
//       ),

//       policyTerm: text(
//         firstValue(
//           rider.policyTerm,
//           rider.term,
//         ),
//       ),

//       premiumTerm: text(
//         firstValue(
//           rider.premiumPaymentTerm,
//           rider.ppt,
//         ),
//       ),

//       premium: currency(
//         firstValue(
//           rider.premium,
//           rider.annualPremium,
//         ),
//       ),
//     }))
//     .filter((rider) => rider.name !== "-");

//   /* ------------------------------------------------------------------------ */
//   /* APPLICANT                                                                */
//   /* ------------------------------------------------------------------------ */

//   const name = getFullName({
//     ...applicant,
//     ...personal,
//   });

//   const image = String(
//     firstValue(
//       applicant.profileImage,
//       personal.profileImage,
//     ) ?? "",
//   );

//   const appNo = text(
//     firstValue(
//       source.applicationNumber,
//       source.applicationNo,
//       applicationOverview.applicationNumber,
//       applicationOverview.applicationNo,
//     ),
//   );

//   const age = firstValue(
//     personal.age &&
//       toRecord(personal.age).years,
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

//   /* ------------------------------------------------------------------------ */
//   /* PERSONAL FIELDS                                                          */
//   /* ------------------------------------------------------------------------ */

//   const personalFields = [
//     {
//       label: "Marital status",
//       value: text(
//         personal.maritalStatus ??
//           applicantDetails.maritalStatus,
//       ),
//     },

//     {
//       label: "Age",
//       value: age ? `${text(age)} years` : "-",
//     },

//     {
//       label: "Gender",
//       value: text(
//         personal.gender ??
//           applicantDetails.gender,
//       ),
//     },

//     {
//       label: "Education",
//       value: text(
//         personal.education ??
//           applicantDetails.education,
//       ),
//     },

//     {
//       label: "Date of birth",
//       value: text(
//         firstValue(
//           personal.dateOfBirth,
//           personal.dob,
//           applicantDetails.dob,
//         ),
//       ),
//     },

//     {
//       label: "Location",
//       value: address,
//     },

//     {
//       label: "Nationality",
//       value: text(
//         personal.nationality ??
//           applicantDetails.nationality,
//       ),
//     },

//     {
//       label: "Residence",
//       value: text(
//         personal.residentStatus ??
//           personal.countryOfResidence,
//       ),
//     },

//     {
//       label: "Smoker status",
//       value: text(
//         firstValue(
//           personal.smokerStatus,
//           personal.smoker,
//           applicantDetails.smokerStatus,
//         ),
//       ),
//     },
//   ];

//   /* ------------------------------------------------------------------------ */
//   /* PERSONAL SUMMARY FOR BANNER                                             */
//   /* ------------------------------------------------------------------------ */

//   const annualIncomeForBanner = currency(
//     firstValue(
//       finance.annualIncome,
//       financialDetails.annualIncome,
//       personalDetails.netIncomeAmt,
//     ),
//   );

//   const personalSummary = [
//     text(
//       personal.maritalStatus ??
//         applicantDetails.maritalStatus,
//     ),

//     age ? text(age) : "-",

//     text(
//       personal.gender ??
//         applicantDetails.gender,
//     ),

//     text(
//       personal.education ??
//         applicantDetails.education,
//     ),

//     annualIncomeForBanner !== "-"
//       ? `${annualIncomeForBanner} p.a.`
//       : "-",

//     address,

//     text(
//       personal.nationality ??
//         applicantDetails.nationality,
//     ),

//     text(
//       personal.residentStatus ??
//         personal.countryOfResidence,
//     ),
//   ]
//     .filter((value) => value !== "-")
//     .join(" / ");

//   /* ------------------------------------------------------------------------ */
//   /* KYC FIELDS                                                               */
//   /* ------------------------------------------------------------------------ */

//   const kycFields = [
//     {
//       label: "KYC status",
//       value: text(
//         firstValue(
//           kycDetails.kycStatus,
//           kycDetails.status,
//         ),
//       ),
//     },

//     {
//       label: "PAN",
//       value: text(
//         firstValue(
//           kycDetails.panNumber,
//           kycDetails.pan,
//           personal.panNumber,
//         ),
//       ),
//     },

//     {
//       label: "CKYC number",
//       value: text(
//         firstValue(
//           kycDetails.ckycNumber,
//           kycDetails.ckycNo,
//         ),
//       ),
//     },

//     {
//       label: "Aadhaar",
//       value: text(
//         firstValue(
//           kycDetails.aadhaarNumber,
//           kycDetails.aadharNumber,
//         ),
//       ),
//     },

//     {
//       label: "Identity proof",
//       value: text(
//         firstValue(
//           kycDetails.identityProof,
//           kycDetails.idProofType,
//         ),
//       ),
//     },

//     {
//       label: "Address proof",
//       value: text(
//         firstValue(
//           kycDetails.addressProof,
//           kycDetails.addressProofType,
//         ),
//       ),
//     },

//     {
//       label: "Mobile",
//       value: text(
//         firstValue(
//           kycDetails.mobileNumber,
//           personal.mobileNumber,
//         ),
//       ),
//     },

//     {
//       label: "Email",
//       value: text(
//         firstValue(
//           kycDetails.emailId,
//           personal.emailId,
//           personal.email,
//         ),
//       ),
//     },

//     {
//       label: "KYC mode",
//       value: text(
//         firstValue(
//           kycDetails.kycMode,
//           kycDetails.verificationMode,
//         ),
//       ),
//     },
//   ];

//   /* ------------------------------------------------------------------------ */
//   /* FINANCIAL FIELDS                                                         */
//   /* ------------------------------------------------------------------------ */

//   const financialFields = [
//     {
//       label: "Occupation",
//       value: text(
//         firstValue(
//           finance.occupation,
//           financialDetails.occupation,
//           personalDetails.occupationType,
//           personal.designation,
//         ),
//       ),
//     },

//     {
//       label: "Annual income",
//       value: currency(
//         firstValue(
//           finance.annualIncome,
//           financialDetails.annualIncome,
//           personalDetails.netIncomeAmt,
//         ),
//       ),
//     },

//     {
//       label: "Income source",
//       value: text(
//         firstValue(
//           finance.incomeSource,
//           financialDetails.incomeSource,
//         ),
//       ),
//     },

//     {
//       label: "Net worth",
//       value: currency(
//         firstValue(
//           finance.netWorth,
//           financialDetails.netWorth,
//         ),
//       ),
//     },

//     {
//       label: "Employer",
//       value: text(
//         firstValue(
//           finance.employerName,
//           financialDetails.employerName,
//         ),
//       ),
//     },

//     {
//       label: "Industry",
//       value: text(
//         firstValue(
//           finance.industryType,
//           financialDetails.industryType,
//         ),
//       ),
//     },

//     {
//       label: "Income proof",
//       value: text(
//         firstValue(
//           finance.incomeProof,
//           financialDetails.incomeProof,
//         ),
//       ),
//     },

//     {
//       label: "Financial need",
//       value: currency(
//         firstValue(
//           finance.financialNeed,
//           financialDetails.financialNeed,
//         ),
//       ),
//     },

//     {
//       label: "Existing cover",
//       value: currency(
//         firstValue(
//           finance.existingCover,
//           financialDetails.existingCover,
//         ),
//       ),
//     },
//   ];

//   /* ------------------------------------------------------------------------ */
//   /* NOMINEE FIELDS                                                           */
//   /* ------------------------------------------------------------------------ */

//   const nomineeFields = [
//     {
//       label: "Nominee name",
//       value: text(
//         firstValue(
//           nomineeDetails.nomineeName,
//           nomineeDetails.name,
//           nomineeDetails.firstName,
//         ),
//       ),
//     },

//     {
//       label: "Relationship",
//       value: text(
//         firstValue(
//           nomineeDetails.relationship,
//           nomineeDetails.relationshipWithProposer,
//         ),
//       ),
//     },

//     {
//       label: "Date of birth",
//       value: text(
//         firstValue(
//           nomineeDetails.dateOfBirth,
//           nomineeDetails.dob,
//         ),
//       ),
//     },

//     {
//       label: "Share",
//       value: text(
//         firstValue(
//           nomineeDetails.share,
//           nomineeDetails.percentage,
//         ),
//       ),
//     },

//     {
//       label: "Mobile",
//       value: text(
//         firstValue(
//           nomineeDetails.mobile,
//           nomineeDetails.mobileNumber,
//         ),
//       ),
//     },

//     {
//       label: "Nominee type",
//       value: text(nomineeDetails.nomineeType),
//     },
//   ];

//   /* ------------------------------------------------------------------------ */
//   /* MEDICAL FIELDS                                                           */
//   /* ------------------------------------------------------------------------ */

//   const medicalFields = [
//     {
//       label: "Medical status",
//       value: text(
//         firstValue(
//           medicalDetails.status,
//           medicalDetails.medicalStatus,
//         ),
//       ),
//     },

//     {
//       label: "Medical decision",
//       value: text(
//         firstValue(
//           medicalDetails.decision,
//           medicalDetails.medicalDecision,
//         ),
//       ),
//     },

//     {
//       label: "Medical remark",
//       value: text(
//         firstValue(
//           medicalDetails.remark,
//           medicalDetails.remarks,
//         ),
//       ),
//     },

//     {
//       label: "Height",
//       value: text(medicalDetails.height),
//     },

//     {
//       label: "Weight",
//       value: text(medicalDetails.weight),
//     },

//     {
//       label: "BMI",
//       value: text(medicalDetails.bmi),
//     },
//   ];

//   /* ------------------------------------------------------------------------ */
//   /* ADDRESS FIELDS                                                           */
//   /* ------------------------------------------------------------------------ */

//   const addressFields = [
//     {
//       label: "Address",
//       value: address,
//     },

//     {
//       label: "City",
//       value: text(
//         firstValue(
//           personal.city,
//           applicant.city,
//         ),
//       ),
//     },

//     {
//       label: "State",
//       value: text(
//         firstValue(
//           personal.state,
//           applicant.state,
//         ),
//       ),
//     },

//     {
//       label: "Country",
//       value: text(
//         firstValue(
//           personal.country,
//           personal.residingCountry,
//         ),
//       ),
//     },

//     {
//       label: "PIN code",
//       value: text(
//         firstValue(
//           personal.pinCode,
//           applicant.pinCode,
//         ),
//       ),
//     },
//   ];

//   /* ------------------------------------------------------------------------ */
//   /* CONTACT FIELDS                                                           */
//   /* ------------------------------------------------------------------------ */

//   const contactFields = [
//     {
//       label: "Mobile",
//       value: text(
//         firstValue(
//           personal.mobileNumber,
//           kycDetails.mobileNumber,
//         ),
//       ),
//     },

//     {
//       label: "Email",
//       value: text(
//         firstValue(
//           personal.emailId,
//           personal.email,
//           kycDetails.emailId,
//         ),
//       ),
//     },

//     {
//       label: "Alternate mobile",
//       value: text(
//         firstValue(
//           personal.alternateMobile,
//           personal.alternateMobileNumber,
//         ),
//       ),
//     },

//     {
//       label: "Preferred contact",
//       value: text(
//         firstValue(
//           personal.preferredContactMode,
//           personal.contactMode,
//         ),
//       ),
//     },
//   ];

//   const tabFields: Record<
//     ApplicantDetailTab,
//     Array<{ label: string; value: string }>
//   > = {
//     personal: personalFields,
//     kyc: kycFields,
//     financial: financialFields,
//     nominee: nomineeFields,
//     medical: medicalFields,
//     address: addressFields,
//     contact: contactFields,
//   };

//   const activeDetailFields = tabFields[detailTab];

//   /* ------------------------------------------------------------------------ */
//   /* BRE                                                                      */
//   /* ------------------------------------------------------------------------ */

//   // const initialBreDecision = text(initialBre.decision);

//   const finalBreDecision = text(
//     firstValue(
//       finalBre.decision,
//       initialBre.decision,
//     ),
//   );

//   // const breRemarks = text(
//   //   firstValue(
//   //     finalBre.remarks,
//   //     initialBre.remarks,
//   //   ),
//   // );

//   const initialDiscrepancies = splitBreCodes(
//     initialBre.discrepancy,
//   );

//   const finalDiscrepancies = splitBreCodes(
//     firstValue(
//       finalBre.discrepancy,
//       initialBre.discrepancy,
//     ),
//   );

//   const newDiscrepancies = finalDiscrepancies.filter(
//     (code) => !initialDiscrepancies.includes(code),
//   );

//   const resolvedDiscrepancies =
//     initialDiscrepancies.filter(
//       (code) => !finalDiscrepancies.includes(code),
//     );

//   // const reTriggerCount = text(
//   //   firstValue(
//   //     finalBre.reTriggerCount,
//   //     initialBre.reTriggerCount,
//   //     0,
//   //   ),
//   // );

//   // const rawBreTimestamp = firstValue(
//   //   finalBre.timestamp,
//   //   initialBre.timestamp,
//   // );

//   // const breTimestamp = rawBreTimestamp
//   //   ? formatDate(String(rawBreTimestamp)) ??
//   //     text(rawBreTimestamp)
//   //   : "-";

//   // const breChanged =
//   //   initialBreDecision !== "-" &&
//   //   finalBreDecision !== "-" &&
//   //   initialBreDecision.toUpperCase() !==
//   //     finalBreDecision.toUpperCase();

//   const decisionTone = getDecisionTone(
//     finalBreDecision,
//   );

//   /* ------------------------------------------------------------------------ */
//   /* RISK                                                                     */
//   /* ------------------------------------------------------------------------ */

//   const riskCards = buildRiskCards(applicant);

//   // const attentionCount = riskCards.filter(
//   //   (card) => card.status === "attention",
//   // ).length;

//   // const riskSummary =
//   //   attentionCount > 0
//   //     ? `${attentionCount} alert${
//   //         attentionCount > 1 ? "s" : ""
//   //       }`
//   //     : "All clear";

//   const hasStickyRail = Boolean(
//     uwDecision || quickLinks,
//   );

//   const quickLinksWithApplicantAction = isValidElement(quickLinks)
//     ? cloneElement(
//         quickLinks as ReactElement<{
//           onApplicantInformationClick?: () => void;
//           onRequirementManagementClick?: () => void;
//           onDecisionHistoryClick?: () => void;
//         }>,
//         {
//           onApplicantInformationClick: () => setActiveQuickLinkPanel("summary"),
//           onRequirementManagementClick: () =>
//             openRequirementManagementPanel("All"),
//           onDecisionHistoryClick: () => setActiveQuickLinkPanel("decisionHistory"),
//         },
//       )
//     : quickLinks;

//   const requirementManagementWithStatusFilter = isValidElement(
//     requirementManagement,
//   )
//     ? cloneElement(
//         requirementManagement as ReactElement<{
//           statusFilter?: RequirementStatusFilter;
//           statusFilterSignal?: number;
//         }>,
//         {
//           statusFilter: requirementStatusFilter,
//           statusFilterSignal: requirementStatusFilterSignal,
//         },
//       )
//     : requirementManagement;

//   /* ------------------------------------------------------------------------ */
//   /* RENDER                                                                   */
//   /* ------------------------------------------------------------------------ */

//   return (
//     <>
//       {/* Only the applicant/application banner is frozen. */}
//       <Box
//         sx={{
//           width: "100%",
//           minWidth: 0,
//           px: 0.5,
//           pb: 0.75,
//           pt:0.75,
//           position: {
//             xs: "static",
//             lg: "sticky",
//           },
//           top: {
//             lg: stickyTop,
//           },
//           zIndex: {
//             xs: "auto",
//             lg: 20,
//           },
//           overflow: "visible",
//           bgcolor: "#FFFFFF",
//         }}
//       >
//         <Box
//           sx={{
//             display: "grid",
//             gridTemplateColumns: {
//               xs: "1fr",
//               lg: hasStickyRail
//                 ? "minmax(0,1fr) 300px"
//                 : "minmax(0,1fr)",
//             },
//             gap: 1,
//           }}
//         >
//           <ApplicationSummaryBanner
//             onBackToInbox={onBackToInbox}
//             image={image}
//             name={name}
//             appNo={appNo}
//             personalSummary={personalSummary}
//             productName={productName}
//             policyTerm={policyTerm}
//             premiumTerm={premiumTerm}
//             sumAssured={sumAssured}
//             tsa={tsa}
//             tfsa={tfsa}
//             tssa={tssa}
//             tpsa={tpsa}
//             riderSummaries={riderSummaries}
//             onViewRiders={() =>
//               setRiderDialogOpen(true)
//             }
//           />
//         </Box>
//       </Box>

//       {/* BRE, risk analytics and the remaining case snapshot scroll normally. */}
//       <Box
//         sx={{
//           width: "100%",
//           minWidth: 0,
//           px: 0.5,
//         }}
//       >
//       <Box
//         sx={{
//           display: "grid",
//           gridTemplateColumns: {
//             xs: "1fr",
//             lg: hasStickyRail
//               ? "minmax(0,1fr) 300px"
//               : "minmax(0,1fr)",
//           },
//           gap: 1,
//           alignItems: "start",
//         }}
//       >
//         <Box sx={{ minWidth: 0 }}>
//           {/* <CustomAccordion
//             title="Application Summary"
//             defaultExpanded
//           > */}

//           {/* </CustomAccordion> */}

//           {/* ============================================================ */}
//           {/* BRE DECISION DETAILS DIALOG                                 */}
//           {/* ============================================================ */}

//           <CustomDialog
//             open={breDetailDialogOpen}
//             onClose={() =>
//               setBreDetailDialogOpen(false)
//             }
//             title="BRE Decision"
//             maxWidth="lg"
//             fullWidth
//             contentSx={{
//               p: { xs: 1, sm: 1.5 },
//               overflowY: "auto",
//             }}
//           >
//             <BreDecision readOnly={readOnly} />
//           </CustomDialog>

//           {/* ============================================================ */}
//           {/* RISK DETAILS DIALOG                                         */}
//           {/* ============================================================ */}

//           <CustomDialog
//             open={Boolean(selectedRiskCard)}
//             onClose={() =>
//               setSelectedRiskCard(null)
//             }
//             title={
//               selectedRiskCard
//                 ? `${selectedRiskCard.label} Risk Details`
//                 : "Risk Details"
//             }
//             maxWidth="lg"
//           >
//             {selectedRiskCard && (
//               <Box
//                 sx={{
//                   display: "grid",
//                   gridTemplateColumns: {
//                     xs: "1fr",
//                     sm: "repeat(2,1fr)",
//                     md: "repeat(3,1fr)",
//                     lg: "repeat(4,1fr)",
//                   },
//                   gap: 0.75,
//                   minWidth: {
//                     xs: "auto",
//                     md: 760,
//                   },
//                 }}
//               >
//                 {selectedRiskCard.details.map(
//                   (detail) => (
//                     <Box
//                       key={detail.key}
//                       sx={{
//                         p: 0.8,
//                         border:
//                           "1px solid #E3DEDB",
//                         borderRadius: 1,
//                         bgcolor: "#F8F7F6",
//                       }}
//                     >
//                       <Typography
//                         sx={{
//                           color: "#827671",
//                           fontSize: 9,
//                         }}
//                       >
//                         {detail.label}
//                       </Typography>

//                       <Typography
//                         sx={{
//                           mt: 0.25,
//                           color: "#332D2A",
//                           fontSize: 11,
//                           fontWeight: 800,
//                           overflowWrap:
//                             "anywhere",
//                         }}
//                       >
//                         {text(detail.value)}
//                       </Typography>
//                     </Box>
//                   ),
//                 )}
//               </Box>
//             )}
//           </CustomDialog>

//           {/* ============================================================ */}
//           {/* RIDER DETAILS DIALOG                                        */}
//           {/* ============================================================ */}

//           <CustomDialog
//             open={riderDialogOpen}
//             onClose={() =>
//               setRiderDialogOpen(false)
//             }
//             title="Rider Details"
//             maxWidth="lg"
//           >
//             <Box
//               sx={{
//                 display: "grid",
//                 gridTemplateColumns: {
//                   xs: "1fr",
//                   md: "repeat(2,1fr)",
//                 },
//                 gap: 0.8,
//                 minWidth: {
//                   xs: "auto",
//                   md: 720,
//                 },
//               }}
//             >
//               {riderSummaries.map(
//                 (rider) => (
//                   <Box
//                     key={rider.id}
//                     sx={{
//                       p: 0.9,
//                       border:
//                         "1px solid #E4DEDB",
//                       borderLeft:
//                         "4px solid #A92129",
//                       borderRadius: 1.1,
//                       bgcolor: "#FAF8F7",
//                     }}
//                   >
//                     <Typography
//                       sx={{
//                         color: "#332D2A",
//                         fontSize: 12,
//                         fontWeight: 900,
//                       }}
//                     >
//                       {rider.name}
//                     </Typography>

//                     <Box
//                       sx={{
//                         display: "grid",
//                         gridTemplateColumns:
//                           "1fr 1fr",
//                         gap: 0.7,
//                         mt: 0.75,
//                       }}
//                     >
//                       <CompactField
//                         label="Sum assured"
//                         value={
//                           rider.sumAssured
//                         }
//                       />

//                       <CompactField
//                         label="Premium"
//                         value={rider.premium}
//                       />

//                       <CompactField
//                         label="Policy term"
//                         value={
//                           rider.policyTerm
//                         }
//                       />

//                       <CompactField
//                         label="Premium term"
//                         value={
//                           rider.premiumTerm
//                         }
//                       />
//                     </Box>
//                   </Box>
//                 ),
//               )}
//             </Box>
//           </CustomDialog>
//         </Box>

//         {/* ================================================================ */}
//         {/* RIGHT RAIL                                                       */}
//         {/* ================================================================ */}

//         {hasStickyRail && (
//           <Box
//             component="aside"
//             sx={{
//               display: "grid",
//               gap: 0.8,
//               minWidth: 0,
//             }}
//           >
//             {uwDecision && (
//               <DashboardCard
//                 eyebrow="Underwriter"
//                 title="UW Decision"
//               >
//                 {uwDecision}
//               </DashboardCard>
//             )}

//             {quickLinks && (
//               <DashboardCard
//                 eyebrow="Navigation"
//                 title="Quick Links"
//               >
//                 {quickLinksWithApplicantAction}
//               </DashboardCard>
//             )}
//           </Box>
//         )}
//       </Box>
//     </Box>
//     </>
//   );
// };

// export default VendorCMOApplicationSummary;

// /* -------------------------------------------------------------------------- */
// /* STANDALONE CASE SNAPSHOT ROW                                               */
// /* -------------------------------------------------------------------------- */

// export const CaseSnapshotRow = ({
//   breDecision,
//   applicationOverview,
//   applicantSummary,
//   riskAnalytics,
//   uwDecision,
//   quickLinks,
// }: CaseSnapshotRowProps) => {
//   const hasStickyRail = Boolean(
//     uwDecision || quickLinks,
//   );

//   return (
//     <Box
//       sx={{
//         width: "100%",
//         display: "grid",
//         gridTemplateColumns: {
//           xs: "1fr",
//           lg: hasStickyRail
//             ? "minmax(0,1fr) 300px"
//             : "1fr",
//         },
//         gap: 1,
//         alignItems: "start",
//       }}
//     >
//       <Box
//         sx={{
//           display: "grid",
//           gridTemplateColumns: {
//             xs: "1fr",
//             md:
//               "minmax(300px,38%) minmax(270px,32%) minmax(240px,30%)",
//           },
//           gap: 0.75,
//           minWidth: 0,
//         }}
//       >
//         {/* BRE FIRST */}

//         <DashboardCard
//           eyebrow="Assessment"
//           title="BRE Decision"
//         >
//           {breDecision}
//         </DashboardCard>

//         {/* APPLICATION SECOND */}

//         <DashboardCard
//           eyebrow="Application"
//           title="Application & Applicant"
//         >
//           <Box
//             sx={{
//               display: "grid",
//               gridTemplateColumns: {
//                 xs: "1fr",
//                 sm: "1fr 1fr",
//               },
//               gap: 0.7,
//             }}
//           >
//             <Box sx={{ minWidth: 0 }}>
//               {applicantSummary ?? (
//                 <Typography
//                   sx={{
//                     color: "#817773",
//                     fontSize: 10,
//                   }}
//                 >
//                   Applicant details are not
//                   available.
//                 </Typography>
//               )}
//             </Box>

//             <Box
//               sx={{
//                 minWidth: 0,
//                 p: 0.7,
//                 bgcolor: "#FCFAF9",
//                 borderRadius: 1,
//               }}
//             >
//               {applicationOverview}
//             </Box>
//           </Box>
//         </DashboardCard>

//         {/* RISK THIRD */}

//         <DashboardCard
//           eyebrow="Signals"
//           title="Risk Analytics"
//         >
//           {riskAnalytics ?? (
//             <Typography
//               sx={{
//                 color: "#817773",
//                 fontSize: 10,
//               }}
//             >
//               Risk analytics are not
//               available.
//             </Typography>
//           )}
//         </DashboardCard>
//       </Box>

//       {/* RIGHT RAIL */}

//       {hasStickyRail && (
//         <Box
//           component="aside"
//           sx={{
//             display: "grid",
//             gap: 0.8,
//             minWidth: 0,
//           }}
//         >
//           {uwDecision && (
//             <DashboardCard
//               eyebrow="Underwriter"
//               title="UW Decision"
//             >
//               {uwDecision}
//             </DashboardCard>
//           )}

//           {quickLinks && (
//             <DashboardCard
//               eyebrow="Navigation"
//               title="Quick Links"
//             >
//               {quickLinks}
//             </DashboardCard>
//           )}
//         </Box>
//       )}
//     </Box>
//   );
// };


import { Avatar, Box, Typography } from "@mui/material";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";

// import CustomAccordion from "../../components/ui/Accordion/Accordion";
import CustomDialog from "../../components/ui/Dialog/Dialog";
import CustomButton from "../../components/ui/Button/Button";
import { KeyRightArrowIcon, UserProfileIcon } from "../../icons/Icons";
import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
//import { formatDate } from "../../utils/dataFormat";
import BreDecision from "./DRS_Accordions/BreDecision";
import CMOMedicalDecisionTable, {
  CMO_DECISION_OPTIONS,
  type CMODecision,
  type CMOMedicalDecisionRow,
} from "./CMOMedicalDecisionTable";
import ViewMedical from "./Medical Final/ViewMedical";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

interface CMOApplicationSummaryProps {
  onBackToInbox?: () => void;
  onViewMedicals?: () => void;
  onViewMedicalDocuments?: () => void;
  onSubmit?: (
    rows: CMOMedicalDecisionRow[],
  ) => void | Promise<void>;
  isSubmitting?: boolean;
  readOnly?: boolean;
  showRiskAnalytics?: boolean;
  uwDecision?: ReactNode;
  quickLinks?: ReactNode;
  requirementManagement?: ReactNode;
  decisionHistory?: ReactNode;
  stickyTop?: number | string;
}

type QuickLinkPanel =
  | "summary"
  | "requirementManagement"
  | "decisionHistory";

type RequirementStatusFilter =
  | "All"
  | "Pending"
  | "Received"
  | "Accept"
  | "Cancelled"
  | "Reject"
  | "Waived";

interface CaseSnapshotRowProps {
  breDecision: ReactNode;
  applicationOverview: ReactNode;
  applicantSummary?: ReactNode;
  riskAnalytics?: ReactNode;
  uwDecision?: ReactNode;
  quickLinks?: ReactNode;
  readOnly?: boolean;
  stickyTop?: number | string;
}

type UnknownRecord = Record<string, unknown>;

type RiskStatus = "clear" | "attention" | "unavailable";

const REQUIREMENT_STATUS_FILTERS: RequirementStatusFilter[] = [
  "All",
  "Pending",
  "Received",
  "Accept",
  "Cancelled",
  "Reject",
  "Waived",
];

const REQUIREMENT_STATUS_TONES: Record<
  RequirementStatusFilter,
  { background: string; border: string; text: string; count: string }
> = {
  All: {
    background: "#F5F3F2",
    border: "#D8D1CD",
    text: "#514A46",
    count: "#697780",
  },
  Pending: {
    background: "#FFF3E8",
    border: "#F3C7A6",
    text: "#B54A00",
    count: "#E45F14",
  },
  Received: {
    background: "#EEF6FF",
    border: "#BED6EE",
    text: "#2F668F",
    count: "#46799F",
  },
  Accept: {
    background: "#EEF8F1",
    border: "#B8DCC0",
    text: "#28743C",
    count: "#28743C",
  },
  Cancelled: {
    background: "#F3F1F0",
    border: "#D8D1CD",
    text: "#706763",
    count: "#706763",
  },
  Reject: {
    background: "#FDEBEC",
    border: "#F2C4C7",
    text: "#B3262E",
    count: "#B3262E",
  },
  Waived: {
    background: "#F3EEFF",
    border: "#D8C8F2",
    text: "#6C4AA0",
    count: "#6C4AA0",
  },
};

type ApplicantDetailTab =
  | "personal"
  | "kyc"
  | "financial"
  | "nominee"
  | "medical"
  | "address"
  | "contact";

type FieldConfig = readonly [key: string, label: string];

interface RiskDetail {
  key: string;
  label: string;
  value: unknown;
}

interface RiskCard {
  id: string;
  label: string;
  value: string;
  status: RiskStatus;
  details: RiskDetail[];
}

/* -------------------------------------------------------------------------- */
/* CONSTANTS                                                                  */
/* -------------------------------------------------------------------------- */

const MEDICAL_FIELDS: FieldConfig[] = [
  ["brePhysicalMedicalDecision", "Physical Medical Decision"],
  ["brePhysicalMedicalRemark", "Physical Medical Remark"],
  ["breTeleVideoMerDecision", "Tele/Video MER Decision"],
  ["breTeleVideoMerRemark", "Tele/Video MER Remark"],
  ["munichReMedicalDecision", "MunichRe Medical Decision"],
  ["munichReRating", "MunichRe Rating"],
  ["biuMedicalStatus", "BIU Medical Status"],
];

const OTHER_RISK_FIELDS: FieldConfig[] = [
  ["ptlrResponse", "PTLR Response"],
  ["drcResponse", "DRC Response"],
  ["adverseIIB", "Adverse IIB"],
  ["criminalQuestionResponseLA", "Criminal Question Response LA"],
  ["pepQuestionResponseLA", "PEP Question Response LA"],
  ["criminalQuestionResponsePR", "Criminal Question Response PR"],
  ["pepQuestionResponsePR", "PEP Question Response PR"],
  ["previousPolicySubstandard", "Previous Policy Substandard"],
  ["avocationRelatedDisclosure", "Avocation Related Disclosure"],
  ["healthQuestionPositive", "Health Question Positive"],
  ["employmentInRiskyIndustry", "Employment In Risky Industry"],
  ["fatfOfacCountryLogin", "FATF/OFAC Country Login"],
  ["hazardousOccupation", "Hazardous Occupation"],
  ["eddFlag", "EDD Flag"],
  ["claimRiskIndicator", "Claim Risk Indicator"],
  ["faceMatchScore", "Face Match Score"],
  ["tobacco", "Tobacco"],
  ["narcotics", "Narcotics"],
];

const RISK_TONES: Record<
  RiskStatus,
  {
    background: string;
    border: string;
    text: string;
    label: string;
  }
> = {
  clear: {
    background: "#EEF8F1",
    border: "#B8DCC0",
    text: "#28743C",
    label: "Clear",
  },

  attention: {
    background: "#FFF0F0",
    border: "#E8B8BC",
    text: "#B3262E",
    label: "Attention",
  },

  unavailable: {
    background: "#F4F3F2",
    border: "#DED9D6",
    text: "#756D69",
    label: "No data",
  },
};

/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const toRecord = (value: unknown): UnknownRecord =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};

const isNonEmptyRecord = (value: UnknownRecord): boolean =>
  Object.keys(value).length > 0;

const text = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
};

const firstValue = (...values: unknown[]): unknown =>
  values.find(
    (value) => value !== null && value !== undefined && value !== "",
  );

const toCMODecision = (value: unknown): CMODecision | "" => {
  const normalizedValue = String(value ?? "").trim().toUpperCase();

  return (
    CMO_DECISION_OPTIONS.find(
      (option) => option.toUpperCase() === normalizedValue,
    ) ?? ""
  );
};

const mapCMODecisionRows = (
  requirements: UnknownRecord[],
): CMOMedicalDecisionRow[] =>
  requirements.map((requirement, index) => ({
    id: text(
      firstValue(
        requirement.requirementId,
        requirement.id,
        requirement.fupCode,
        index,
      ),
    ),
    fupCode: text(
      firstValue(
        requirement.fupCode,
        requirement.requirementCode,
        requirement.code,
      ),
    ),
    medicalType: text(
      firstValue(
        requirement.medicalType,
        requirement.requirementName,
        requirement.fupDescription,
        requirement.requirementDescription,
      ),
    ),
    raisedDate: text(
      firstValue(
        requirement.raisedDate,
        requirement.requirementRaisedDate,
        requirement.createdDate,
        requirement.createdAt,
      ),
    ),
    receivedDate: text(
      firstValue(
        requirement.receivedDate,
        requirement.requirementReceivedDate,
        requirement.updatedDate,
        requirement.updatedAt,
      ),
    ),
    decision: toCMODecision(
      firstValue(
        requirement.cmoDecision,
        requirement.decision,
      ),
    ),
    remarks: String(
      firstValue(
        requirement.cmoRemarks,
        requirement.remarks,
      ) ?? "",
    ),
  }));

const currency = (value: unknown): string => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? `₹${new Intl.NumberFormat("en-IN").format(numericValue)}`
    : text(value);
};

const normalizeValue = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

const parsePercentage = (value: unknown): number | null => {
  const normalizedValue = String(value ?? "")
    .replace("%", "")
    .trim();

  if (!normalizedValue) {
    return null;
  }

  const numericValue = Number.parseFloat(normalizedValue);

  return Number.isNaN(numericValue) ? null : numericValue;
};

const isYesValue = (value: unknown): boolean =>
  ["y", "yes", "true"].includes(normalizeValue(value));

const getFullName = (person: UnknownRecord): string =>
  [person.firstName, person.middleName, person.lastName]
    .filter(Boolean)
    .map(String)
    .join(" ") || "-";

const getAddress = (member: UnknownRecord): string => {
  const addresses = Array.isArray(member.address)
    ? member.address
    : isNonEmptyRecord(toRecord(member.address))
      ? [member.address]
      : [];

  const address = toRecord(addresses[0]);

  return (
    [
      address.city,
      address.state,
      address.residingCountry,
      address.pinCode,
    ]
      .filter(Boolean)
      .map(String)
      .join(" - ") || "-"
  );
};

const splitBreCodes = (value: unknown): string[] =>
  String(value ?? "")
    .split("#")
    .map((code) => code.trim())
    .filter(Boolean);

const getRequirementStatusFilter = (
  value: unknown,
): Exclude<RequirementStatusFilter, "All"> | null => {
  const normalizedStatus = String(value ?? "").trim().toUpperCase();

  if (normalizedStatus === "PENDING") {
    return "Pending";
  }

  if (["ACCEPT", "ACCEPTED"].includes(normalizedStatus)) {
    return "Accept";
  }

  if (["RECEIVE", "RECEIVED"].includes(normalizedStatus)) {
    return "Received";
  }

  if (["CANCEL", "CANCELED", "CANCELLED"].includes(normalizedStatus)) {
    return "Cancelled";
  }

  if (["REJECT", "REJECTED"].includes(normalizedStatus)) {
    return "Reject";
  }

  if (["WAIVE", "WAIVED"].includes(normalizedStatus)) {
    return "Waived";
  }

  return null;
};

const getDecisionTone = (decision: string) => {
  const normalizedDecision = decision.trim().toUpperCase();

  if (!normalizedDecision || normalizedDecision === "-") {
    return {
      background: "#F3F1F0",
      border: "#DDD7D4",
      text: "#706763",
    };
  }

  if (
    ["ST", "STD", "STP", "STANDARD", "SUCCESS"].includes(normalizedDecision)
  ) {
    return {
      background: "#E8F5EC",
      border: "#B7DFC2",
      text: "#237A3B",
    };
  }

  if (
    ["DEC", "DECLINE", "DECLINED", "REJECT", "REJECTED"].some((value) =>
      normalizedDecision.includes(value),
    )
  ) {
    return {
      background: "#FDEBEC",
      border: "#F2C4C7",
      text: "#B3262E",
    };
  }

  if (
    ["TUW", "RM", "REFER", "REVIEW", "PENDING"].some((value) =>
      normalizedDecision.includes(value),
    )
  ) {
    return {
      background: "#FFF4DF",
      border: "#F1D394",
      text: "#9A6200",
    };
  }

  return {
    background: "#F7EEF0",
    border: "#E7CBCD",
    text: "#8D232A",
  };
};

const mapRiskDetails = (
  risk: UnknownRecord,
  fields: FieldConfig[],
): RiskDetail[] =>
  fields.map(([key, label]) => ({
    key,
    label,
    value: risk[key],
  }));

const getMedicalRiskStatus = (risk: UnknownRecord): RiskStatus => {
  if (!isNonEmptyRecord(risk)) {
    return "unavailable";
  }

  const physical = normalizeValue(risk.brePhysicalMedicalDecision);
  const teleVideo = normalizeValue(risk.breTeleVideoMerDecision);
  const munichRe = normalizeValue(risk.munichReMedicalDecision);
  const biu = normalizeValue(risk.biuMedicalStatus);

  const needsAttention =
    (physical !== "" && physical !== "stp") ||
    (teleVideo !== "" && teleVideo !== "stp") ||
    (munichRe !== "" &&
      !["standard1", "standard2"].includes(munichRe)) ||
    biu === "y";

  return needsAttention ? "attention" : "clear";
};

const getOtherRiskStatus = (risk: UnknownRecord): RiskStatus => {
  if (!isNonEmptyRecord(risk)) {
    return "unavailable";
  }

  const ptlr = normalizeValue(risk.ptlrResponse);
  const drc = normalizeValue(risk.drcResponse);
  const faceMatchScore = parsePercentage(risk.faceMatchScore);

  const yesNoRiskFields = [
    "adverseIIB",
    "criminalQuestionResponseLA",
    "pepQuestionResponseLA",
    "criminalQuestionResponsePR",
    "pepQuestionResponsePR",
    "previousPolicySubstandard",
    "avocationRelatedDisclosure",
    "healthQuestionPositive",
    "employmentInRiskyIndustry",
    "fatfOfacCountryLogin",
    "hazardousOccupation",
    "eddFlag",
    "claimRiskIndicator",
    "tobacco",
    "narcotics",
  ];

  const needsAttention =
    ["deepred", "deepmaroon"].includes(ptlr) ||
    ["highrisk", "mediumrisk"].includes(drc) ||
    yesNoRiskFields.some((field) => isYesValue(risk[field])) ||
    (faceMatchScore !== null && faceMatchScore < 75);

  return needsAttention ? "attention" : "clear";
};

const getFirstRisk = (
  analyticsItems: UnknownRecord[],
  riskKey: string,
): UnknownRecord =>
  analyticsItems
    .map((item) => toRecord(item[riskKey]))
    .find(isNonEmptyRecord) ?? {};

const buildRiskCards = (applicant: UnknownRecord): RiskCard[] => {
  const riskAnalytics = applicant.riskAnalytics;

  const analyticsItems = Array.isArray(riskAnalytics)
    ? riskAnalytics.map(toRecord)
    : isNonEmptyRecord(toRecord(riskAnalytics))
      ? [toRecord(riskAnalytics)]
      : [];

  const medicalRisk = getFirstRisk(analyticsItems, "medicalRisk");
  const otherRisk = getFirstRisk(analyticsItems, "otherRisk");

  const medicalStatus = getMedicalRiskStatus(medicalRisk);
  const otherStatus = getOtherRiskStatus(otherRisk);

  return [
    {
      id: "medical",
      label: "Medical",
      value: text(
        firstValue(
          medicalRisk.brePhysicalMedicalDecision,
          medicalRisk.breTeleVideoMerDecision,
          medicalRisk.munichReMedicalDecision,
        ),
      ),
      status: medicalStatus,
      details: mapRiskDetails(medicalRisk, MEDICAL_FIELDS),
    },

    {
      id: "other",
      label: "Other Risk",
      value: text(
        firstValue(
          otherRisk.ptlrResponse,
          otherRisk.drcResponse,
          otherRisk.faceMatchScore,
        ),
      ),
      status: otherStatus,
      details: mapRiskDetails(otherRisk, OTHER_RISK_FIELDS),
    },
  ];
};

/* -------------------------------------------------------------------------- */
/* COMMON UI                                                                  */
/* -------------------------------------------------------------------------- */

const CompactField = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography
      sx={{
        color: "#8B807B",
        fontSize: 8.5,
        lineHeight: 1.15,
      }}
    >
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

const DashboardCard = ({
  title,
  eyebrow,
  children,
  sx,
}: {
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  sx?: Record<string, unknown>;
}) => (
  <Box
    sx={{
      minWidth: 0,
      border: "1px solid #DED8D5",
      borderRadius: 1.5,
      bgcolor: "#FFFFFF",
      overflow: "hidden",
      boxShadow: "0 2px 7px rgba(60, 42, 35, 0.07)",
      ...sx,
    }}
  >
    {(title || eyebrow) && (
      <Box
        sx={{
          px: 1.15,
          py: 0.75,
          borderBottom: "1px solid #E9E3E0",
          bgcolor: "#E45F14",
        }}
      >
        {eyebrow && (
          <Typography
            sx={{
              color: "#A92129",
              fontSize: 8,
              fontWeight: 900,
              letterSpacing: 0.8,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </Typography>
        )}

        {title && (
          <Typography
            sx={{
              mt: eyebrow ? 0.15 : 0,
              color: "#fff",
              fontSize: 12,
              fontWeight: 900,
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
        )}
      </Box>
    )}

    <Box sx={{ minWidth: 0, p: 1 }}>{children}</Box>
  </Box>
);

/* -------------------------------------------------------------------------- */
/* APPLICATION SUMMARY BANNER                                                 */
/* -------------------------------------------------------------------------- */

interface ApplicationSummaryBannerProps {
  onBackToInbox?: () => void;
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
  riderSummaries: Array<{
    name: string;
    sumAssured: string;
    policyTerm: string;
    premiumTerm: string;
    premium: string;
  }>;
  onViewRiders: () => void;
}

const ApplicationSummaryBanner = ({
  image,
  name,
  personalSummary,
  productName,
  policyTerm,
  premiumTerm,
  sumAssured,
  tfsa,
  tssa,
  tpsa,
  riderSummaries,
  onViewRiders,
}: ApplicationSummaryBannerProps) => {
  const coverageItems = [
    `SA - ${sumAssured}`,
    `TSA - ₹15,00,000`,
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
        {/* {onBackToInbox && (
          <Box
            component="button"
            type="button"
            aria-label="Back to Inbox"
            onClick={onBackToInbox}
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              width: 30,
              height: 30,
              border: "1px solid rgba(255,255,255,.55)",
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,.18)",
              color: "#FFFFFF",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            Ã¢â€ Â
          </Box>
        )} */}
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

      <Box sx={{ minWidth: 0, px: { xs: 1.2, sm: 2.2 }, py: { xs: 1, sm: 1.45 } }}>
      {/* ================================================================ */}
      {/* NAME + APPLICATION NUMBER                                        */}
      {/* ================================================================ */}

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
            fontSize: {
              xs: 11,
              sm: 13,
            },
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          App No. - OB90377122 
        </Typography>
      </Box>

      {/* ================================================================ */}
      {/* PERSONAL SUMMARY                                                  */}
      {/* ================================================================ */}

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

      {/* ================================================================ */}
      {/* PRODUCT / POLICY / COVERAGE                                      */}
      {/* ================================================================ */}

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
        Product:{" "}
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

        Policy Term:{" "}
        <Box
          component="span"
          sx={{
            color: "#000",
            fontWeight: 700,
          }}
        >
          {policyTerm}
        </Box>

        {" / "}

        Premium Term:{" "}
        <Box
          component="span"
          sx={{
            color: "#000",
            fontWeight: 700,
          }}
        >
          {premiumTerm}
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
      </Typography>

      {/* ================================================================ */}
      {/* RIDERS                                                            */}
      {/* ================================================================ */}

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
            color: "#000",
            fontSize: {
              xs: 10,
              sm: 11.5,
            },
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
              color: "#000",
              fontSize: {
                xs: 10,
                sm: 11.5,
              },
              lineHeight: 1.65,
              fontWeight: 600,
              overflowWrap: "anywhere",
            }}
          >
            {riderSummaries.map((rider, index) => (
              <Box
                component="span"
                key={`${rider.name}-${index}`}
              >
                {rider.name} - SA ₹{rider.sumAssured}
                {index < riderSummaries.length - 1
                  ? " / "
                  : ""}
              </Box>
            ))}
          </Typography>
        ) : (
          <Typography
            sx={{
              color: "#000",
              fontSize: {
                xs: 10,
                sm: 11.5,
              },
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
              border: 0,
              p: 0,
              ml: 0.5,
              mt: 0.15,
              bgcolor: "transparent",
              color: "#FFEAD7",
              fontSize: 9,
              fontWeight: 900,
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            View details <KeyRightArrowIcon/>
          </Box>
        )}
      </Box>
      </Box>
    </Box>
  );
};

/* -------------------------------------------------------------------------- */
/* RISK CARD                                                                  */
/* -------------------------------------------------------------------------- */

const RiskAnalyticsCard = ({
  card,
  onClick,
}: {
  card: RiskCard;
  onClick: () => void;
}) => {
  const tone = RISK_TONES[card.status];
  const icon ='';
  const visibleDetails = card.details
    .filter((detail) => text(detail.value) !== "-")
    .slice(0, 3);

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onClick();
      }}
      sx={{
        width: "100%",
        minWidth: 0,
        minHeight: 190,
        p: 1.25,
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${tone.border}`,
        borderTop: `5px solid ${tone.text}`,
        borderRadius: "12px",
        bgcolor: "#FFFFFF",
        cursor: "pointer",
        fontFamily: "inherit",
        textAlign: "left",
        transition: "all .15s ease",

        "&:hover": {
          transform: "translateY(-1px)",
          boxShadow: "0 3px 8px rgba(50,40,35,.1)",
        },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
          }}
        >
          <Typography component="span" sx={{ fontSize: 15, lineHeight: 1 }}>
            {icon}
          </Typography>
          <Typography
            sx={{
              color: "#302A27",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {card.id === "other" ? "Risk Parameters" : card.label}
          </Typography>
        </Box>

        <Box sx={{ mt: 1 }}>
          {visibleDetails.length > 0 ? visibleDetails.map((detail) => (
            <Typography
              key={detail.key}
              sx={{ color: "#403936", fontSize: 10.5, lineHeight: 1.35, overflowWrap: "anywhere" }}
            >
              {detail.label}: {" "}
              <Box component="span" sx={{ color: tone.text, fontWeight: 900 }}>
                {text(detail.value)}
              </Box>
            </Typography>
          )) : (
            <Typography sx={{ color: tone.text, fontSize: 11, fontWeight: 900 }}>
              {card.value}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.7, mt: 1 }}>
        <Box sx={{ width: 34, height: 28, display: "grid", placeItems: "center", border: "1px solid #E1D8D2", borderRadius: "14px", bgcolor: "#FFF8F3", color: "#A92129", fontSize: 13 }}>
          <KeyRightArrowIcon/>
        </Box>
        <Box sx={{ px: 1.2, py: 0.65, border: "1px solid #E1D8D2", borderRadius: "16px", bgcolor: "#FFF8F3", color: "#5B302A", fontSize: 9.5, fontWeight: 800 }}>
          View {card.id === "other" ? "Risk" : card.label}
        </Box>
      </Box>
    </Box>
  );
};

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const VendorCMOApplicationSummary = ({
  onBackToInbox,
  onViewMedicals,
  onViewMedicalDocuments,
  onSubmit,
  isSubmitting = false,
  readOnly = false,
  showRiskAnalytics = true,
  uwDecision,
  quickLinks,
  requirementManagement,
  decisionHistory,
  stickyTop = 72,
}: CMOApplicationSummaryProps) => {
  const drsData = useAppSelector(
    (state: RootState) => state.drs.data,
  );

  const searchData = useAppSelector(
    (state: RootState) => state.searchApplication.response?.data,
  );

  const [selectedRiskCard, setSelectedRiskCard] =
    useState<RiskCard | null>(null);

  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);

  const [detailTab, setDetailTab] =
    useState<ApplicantDetailTab>("personal");

  const [breDetailDialogOpen, setBreDetailDialogOpen] =
    useState(false);

  const [requirementStatusFilter, setRequirementStatusFilter] =
    useState<RequirementStatusFilter>("All");
  const [requirementStatusFilterSignal, setRequirementStatusFilterSignal] =
    useState(0);

  const [riderDialogOpen, setRiderDialogOpen] = useState(false);
  const [showViewMedicals, setShowViewMedicals] = useState(false);
  const [activeQuickLinkPanel, setActiveQuickLinkPanel] =
    useState<QuickLinkPanel | null>(null);
  const quickLinkDialogOpen = activeQuickLinkPanel !== null;
  const closeQuickLinkPanel = () => setActiveQuickLinkPanel(null);

  const openRequirementManagementPanel = (
    status: RequirementStatusFilter = "All",
  ) => {
    setRequirementStatusFilter(status);
    setRequirementStatusFilterSignal((currentSignal) => currentSignal + 1);
    setActiveQuickLinkPanel("requirementManagement");
  };

  useEffect(() => {
    const openApplicantSummary = () => setActiveQuickLinkPanel("summary");
    const openRequirementManagement = () => {
      setRequirementStatusFilter("All");
      setRequirementStatusFilterSignal((currentSignal) => currentSignal + 1);
      setActiveQuickLinkPanel("requirementManagement");
    };
    const openDecisionHistory = () =>
      setActiveQuickLinkPanel("decisionHistory");

    window.addEventListener("open-applicant-summary", openApplicantSummary);
    window.addEventListener("open-requirement-management", openRequirementManagement);
    window.addEventListener("open-decision-history", openDecisionHistory);

    return () => {
      window.removeEventListener("open-applicant-summary", openApplicantSummary);
      window.removeEventListener("open-requirement-management", openRequirementManagement);
      window.removeEventListener("open-decision-history", openDecisionHistory);
    };
  }, []);

  const source = toRecord(readOnly ? searchData : drsData);

  const requirementRows = Array.isArray(source.requirementManagement)
    ? source.requirementManagement.map(toRecord)
    : [];

  const [cmoDecisionRows, setCMODecisionRows] = useState<
    CMOMedicalDecisionRow[]
  >(() => mapCMODecisionRows(requirementRows));

  const requirementStatusCounts = requirementRows.reduce<
    Record<RequirementStatusFilter, number>
  >(
    (counts, requirement) => {
      counts.All += 1;

      const status = getRequirementStatusFilter(requirement.status);

      if (status) {
        counts[status] += 1;
      }

      return counts;
    },
    {
      All: 0,
      Pending: 0,
      Received: 0,
      Accept: 0,
      Cancelled: 0,
      Reject: 0,
      Waived: 0,
    },
  );

  const applicationOverview = toRecord(
    source.applicationOverview,
  );

  const initialBre = toRecord(source.breDecision);

  const latestBreCandidate = toRecord(
    source.latestBreDecision,
  );

  const finalBre = isNonEmptyRecord(latestBreCandidate)
    ? latestBreCandidate
    : initialBre;

  const members = Array.isArray(source.summary)
    ? source.summary.map(toRecord)
    : [];

  const activeMemberIndex =
    selectedMemberIndex < members.length
      ? selectedMemberIndex
      : 0;

  const applicant = members[activeMemberIndex] ?? {};

  const applicantDetails = toRecord(
    applicant.applicantDetails,
  );

  const personalDetails = toRecord(
    applicant.personalDetails,
  );

  const personal = {
    ...applicantDetails,
    ...personalDetails,
    ...toRecord(applicant.personalSummary),
    ...toRecord(applicant.proposerSummary),
  };

  const kycDetails = {
    ...toRecord(applicant.kyc),
    ...toRecord(applicant.kycDetails),
    ...toRecord(applicant.applicantKycDetails),
    ...toRecord(personal.kycDetails),
  };

  const finance = toRecord(
    applicant.applicantFinancialDetails,
  );

  const financialDetails = toRecord(
    applicant.financialDetails,
  );

  const nomineeDetails = toRecord(
    applicant.nomineeDetails ??
      applicant.nominee ??
      applicant.nomineeSummary,
  );

  const medicalDetails = toRecord(
    applicant.medicalDetails ??
      applicant.medicalSummary ??
      applicant.medical,
  );

  /* ------------------------------------------------------------------------ */
  /* PRODUCT                                                                  */
  /* ------------------------------------------------------------------------ */

  const products = Array.isArray(
    applicationOverview.productDetail,
  )
    ? applicationOverview.productDetail.map(toRecord)
    : [];

  const baseProduct =
    products.find(
      (product) =>
        String(product.type ?? "").toLowerCase() === "base",
    ) ??
    products[0] ??
    applicationOverview;

  const riderDetails = Array.isArray(
    applicationOverview.riderDetails,
  )
    ? applicationOverview.riderDetails.map(toRecord)
    : products.filter(
        (product) =>
          String(product.type ?? "").toLowerCase() === "rider",
      );

  const productName = text(
    firstValue(
      baseProduct.productName,
      baseProduct.name,
      applicationOverview.productName,
      applicationOverview.product,
    ),
  );

  const policyTerm = text(
    firstValue(
      baseProduct.policyTerm,
      baseProduct.term,
      applicationOverview.policyTerm,
    ),
  );

  const premiumTerm = text(
    firstValue(
      baseProduct.premiumPaymentTerm,
      baseProduct.ppt,
      applicationOverview.premiumPaymentTerm,
    ),
  );

  const sumAssured = currency(
    firstValue(
      baseProduct.sumAssured,
      baseProduct.appliedSA,
      applicationOverview.sumAssured,
      applicationOverview.appliedSa,
    ),
  );

  const tsa = currency(
    firstValue(
      baseProduct.tsa,
      baseProduct.totalSumAssured,
      applicationOverview.tsa,
      applicationOverview.totalSumAssured,
    ),
  );

  const tfsa = currency(
    firstValue(
      baseProduct.tfsa,
      baseProduct.totalFaceSumAssured,
      applicationOverview.tfsa,
      applicationOverview.totalFaceSumAssured,
    ),
  );

  const tssa = currency(
    firstValue(
      baseProduct.tssa,
      baseProduct.totalSumAssuredAdditional,
      applicationOverview.tssa,
      applicationOverview.totalSumAssuredAdditional,
    ),
  );

  const tpsa = currency(
    firstValue(
      baseProduct.tpsa,
      baseProduct.totalPremiumSumAssured,
      applicationOverview.tpsa,
      applicationOverview.totalPremiumSumAssured,
    ),
  );

  const riderSummaries = riderDetails
    .map((rider, index) => ({
      id: String(
        firstValue(
          rider.id,
          rider.productCode,
          index,
        ),
      ),

      name: text(
        firstValue(
          rider.name,
          rider.riderName,
          rider.productName,
        ),
      ),

      sumAssured: currency(
        firstValue(
          rider.sumAssured,
          rider.tsa,
          rider.appliedSA,
        ),
      ),

      policyTerm: text(
        firstValue(
          rider.policyTerm,
          rider.term,
        ),
      ),

      premiumTerm: text(
        firstValue(
          rider.premiumPaymentTerm,
          rider.ppt,
        ),
      ),

      premium: currency(
        firstValue(
          rider.premium,
          rider.annualPremium,
        ),
      ),
    }))
    .filter((rider) => rider.name !== "-");

  /* ------------------------------------------------------------------------ */
  /* APPLICANT                                                                */
  /* ------------------------------------------------------------------------ */

  const name = getFullName({
    ...applicant,
    ...personal,
  });

  const image = String(
    firstValue(
      applicant.profileImage,
      personal.profileImage,
    ) ?? "",
  );

  const appNo = text(
    firstValue(
      source.applicationNumber,
      source.applicationNo,
      applicationOverview.applicationNumber,
      applicationOverview.applicationNo,
    ),
  );

  const age = firstValue(
    personal.age &&
      toRecord(personal.age).years,
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

  /* ------------------------------------------------------------------------ */
  /* PERSONAL FIELDS                                                          */
  /* ------------------------------------------------------------------------ */

  const personalFields = [
    {
      label: "Marital status",
      value: text(
        personal.maritalStatus ??
          applicantDetails.maritalStatus,
      ),
    },

    {
      label: "Age",
      value: age ? `${text(age)} years` : "-",
    },

    {
      label: "Gender",
      value: text(
        personal.gender ??
          applicantDetails.gender,
      ),
    },

    {
      label: "Education",
      value: text(
        personal.education ??
          applicantDetails.education,
      ),
    },

    {
      label: "Date of birth",
      value: text(
        firstValue(
          personal.dateOfBirth,
          personal.dob,
          applicantDetails.dob,
        ),
      ),
    },

    {
      label: "Location",
      value: address,
    },

    {
      label: "Nationality",
      value: text(
        personal.nationality ??
          applicantDetails.nationality,
      ),
    },

    {
      label: "Residence",
      value: text(
        personal.residentStatus ??
          personal.countryOfResidence,
      ),
    },

    {
      label: "Smoker status",
      value: text(
        firstValue(
          personal.smokerStatus,
          personal.smoker,
          applicantDetails.smokerStatus,
        ),
      ),
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* PERSONAL SUMMARY FOR BANNER                                             */
  /* ------------------------------------------------------------------------ */

  const annualIncomeForBanner = currency(
    firstValue(
      finance.annualIncome,
      financialDetails.annualIncome,
      personalDetails.netIncomeAmt,
    ),
  );

  const personalSummary = [
    text(
      personal.maritalStatus ??
        applicantDetails.maritalStatus,
    ),

    age ? text(age) : "-",

    text(
      personal.gender ??
        applicantDetails.gender,
    ),

    text(
      personal.education ??
        applicantDetails.education,
    ),

    annualIncomeForBanner !== "-"
      ? `${annualIncomeForBanner} p.a.`
      : "-",

    address,

    text(
      personal.nationality ??
        applicantDetails.nationality,
    ),

    text(
      personal.residentStatus ??
        personal.countryOfResidence,
    ),
  ]
    .filter((value) => value !== "-")
    .join(" / ");

  /* ------------------------------------------------------------------------ */
  /* KYC FIELDS                                                               */
  /* ------------------------------------------------------------------------ */

  const kycFields = [
    {
      label: "KYC status",
      value: text(
        firstValue(
          kycDetails.kycStatus,
          kycDetails.status,
        ),
      ),
    },

    {
      label: "PAN",
      value: text(
        firstValue(
          kycDetails.panNumber,
          kycDetails.pan,
          personal.panNumber,
        ),
      ),
    },

    {
      label: "CKYC number",
      value: text(
        firstValue(
          kycDetails.ckycNumber,
          kycDetails.ckycNo,
        ),
      ),
    },

    {
      label: "Aadhaar",
      value: text(
        firstValue(
          kycDetails.aadhaarNumber,
          kycDetails.aadharNumber,
        ),
      ),
    },

    {
      label: "Identity proof",
      value: text(
        firstValue(
          kycDetails.identityProof,
          kycDetails.idProofType,
        ),
      ),
    },

    {
      label: "Address proof",
      value: text(
        firstValue(
          kycDetails.addressProof,
          kycDetails.addressProofType,
        ),
      ),
    },

    {
      label: "Mobile",
      value: text(
        firstValue(
          kycDetails.mobileNumber,
          personal.mobileNumber,
        ),
      ),
    },

    {
      label: "Email",
      value: text(
        firstValue(
          kycDetails.emailId,
          personal.emailId,
          personal.email,
        ),
      ),
    },

    {
      label: "KYC mode",
      value: text(
        firstValue(
          kycDetails.kycMode,
          kycDetails.verificationMode,
        ),
      ),
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* FINANCIAL FIELDS                                                         */
  /* ------------------------------------------------------------------------ */

  const financialFields = [
    {
      label: "Occupation",
      value: text(
        firstValue(
          finance.occupation,
          financialDetails.occupation,
          personalDetails.occupationType,
          personal.designation,
        ),
      ),
    },

    {
      label: "Annual income",
      value: currency(
        firstValue(
          finance.annualIncome,
          financialDetails.annualIncome,
          personalDetails.netIncomeAmt,
        ),
      ),
    },

    {
      label: "Income source",
      value: text(
        firstValue(
          finance.incomeSource,
          financialDetails.incomeSource,
        ),
      ),
    },

    {
      label: "Net worth",
      value: currency(
        firstValue(
          finance.netWorth,
          financialDetails.netWorth,
        ),
      ),
    },

    {
      label: "Employer",
      value: text(
        firstValue(
          finance.employerName,
          financialDetails.employerName,
        ),
      ),
    },

    {
      label: "Industry",
      value: text(
        firstValue(
          finance.industryType,
          financialDetails.industryType,
        ),
      ),
    },

    {
      label: "Income proof",
      value: text(
        firstValue(
          finance.incomeProof,
          financialDetails.incomeProof,
        ),
      ),
    },

    {
      label: "Financial need",
      value: currency(
        firstValue(
          finance.financialNeed,
          financialDetails.financialNeed,
        ),
      ),
    },

    {
      label: "Existing cover",
      value: currency(
        firstValue(
          finance.existingCover,
          financialDetails.existingCover,
        ),
      ),
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* NOMINEE FIELDS                                                           */
  /* ------------------------------------------------------------------------ */

  const nomineeFields = [
    {
      label: "Nominee name",
      value: text(
        firstValue(
          nomineeDetails.nomineeName,
          nomineeDetails.name,
          nomineeDetails.firstName,
        ),
      ),
    },

    {
      label: "Relationship",
      value: text(
        firstValue(
          nomineeDetails.relationship,
          nomineeDetails.relationshipWithProposer,
        ),
      ),
    },

    {
      label: "Date of birth",
      value: text(
        firstValue(
          nomineeDetails.dateOfBirth,
          nomineeDetails.dob,
        ),
      ),
    },

    {
      label: "Share",
      value: text(
        firstValue(
          nomineeDetails.share,
          nomineeDetails.percentage,
        ),
      ),
    },

    {
      label: "Mobile",
      value: text(
        firstValue(
          nomineeDetails.mobile,
          nomineeDetails.mobileNumber,
        ),
      ),
    },

    {
      label: "Nominee type",
      value: text(nomineeDetails.nomineeType),
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* MEDICAL FIELDS                                                           */
  /* ------------------------------------------------------------------------ */

  const medicalFields = [
    {
      label: "Medical status",
      value: text(
        firstValue(
          medicalDetails.status,
          medicalDetails.medicalStatus,
        ),
      ),
    },

    {
      label: "Medical decision",
      value: text(
        firstValue(
          medicalDetails.decision,
          medicalDetails.medicalDecision,
        ),
      ),
    },

    {
      label: "Medical remark",
      value: text(
        firstValue(
          medicalDetails.remark,
          medicalDetails.remarks,
        ),
      ),
    },

    {
      label: "Height",
      value: text(medicalDetails.height),
    },

    {
      label: "Weight",
      value: text(medicalDetails.weight),
    },

    {
      label: "BMI",
      value: text(medicalDetails.bmi),
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* ADDRESS FIELDS                                                           */
  /* ------------------------------------------------------------------------ */

  const addressFields = [
    {
      label: "Address",
      value: address,
    },

    {
      label: "City",
      value: text(
        firstValue(
          personal.city,
          applicant.city,
        ),
      ),
    },

    {
      label: "State",
      value: text(
        firstValue(
          personal.state,
          applicant.state,
        ),
      ),
    },

    {
      label: "Country",
      value: text(
        firstValue(
          personal.country,
          personal.residingCountry,
        ),
      ),
    },

    {
      label: "PIN code",
      value: text(
        firstValue(
          personal.pinCode,
          applicant.pinCode,
        ),
      ),
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* CONTACT FIELDS                                                           */
  /* ------------------------------------------------------------------------ */

  const contactFields = [
    {
      label: "Mobile",
      value: text(
        firstValue(
          personal.mobileNumber,
          kycDetails.mobileNumber,
        ),
      ),
    },

    {
      label: "Email",
      value: text(
        firstValue(
          personal.emailId,
          personal.email,
          kycDetails.emailId,
        ),
      ),
    },

    {
      label: "Alternate mobile",
      value: text(
        firstValue(
          personal.alternateMobile,
          personal.alternateMobileNumber,
        ),
      ),
    },

    {
      label: "Preferred contact",
      value: text(
        firstValue(
          personal.preferredContactMode,
          personal.contactMode,
        ),
      ),
    },
  ];

  const tabFields: Record<
    ApplicantDetailTab,
    Array<{ label: string; value: string }>
  > = {
    personal: personalFields,
    kyc: kycFields,
    financial: financialFields,
    nominee: nomineeFields,
    medical: medicalFields,
    address: addressFields,
    contact: contactFields,
  };

  const activeDetailFields = tabFields[detailTab];

  /* ------------------------------------------------------------------------ */
  /* BRE                                                                      */
  /* ------------------------------------------------------------------------ */

  // const initialBreDecision = text(initialBre.decision);

  const finalBreDecision = text(
    firstValue(
      finalBre.decision,
      initialBre.decision,
    ),
  );

  // const breRemarks = text(
  //   firstValue(
  //     finalBre.remarks,
  //     initialBre.remarks,
  //   ),
  // );

  const initialDiscrepancies = splitBreCodes(
    initialBre.discrepancy,
  );

  const finalDiscrepancies = splitBreCodes(
    firstValue(
      finalBre.discrepancy,
      initialBre.discrepancy,
    ),
  );

  const newDiscrepancies = finalDiscrepancies.filter(
    (code) => !initialDiscrepancies.includes(code),
  );

  const resolvedDiscrepancies =
    initialDiscrepancies.filter(
      (code) => !finalDiscrepancies.includes(code),
    );

  // const reTriggerCount = text(
  //   firstValue(
  //     finalBre.reTriggerCount,
  //     initialBre.reTriggerCount,
  //     0,
  //   ),
  // );

  // const rawBreTimestamp = firstValue(
  //   finalBre.timestamp,
  //   initialBre.timestamp,
  // );

  // const breTimestamp = rawBreTimestamp
  //   ? formatDate(String(rawBreTimestamp)) ??
  //     text(rawBreTimestamp)
  //   : "-";

  // const breChanged =
  //   initialBreDecision !== "-" &&
  //   finalBreDecision !== "-" &&
  //   initialBreDecision.toUpperCase() !==
  //     finalBreDecision.toUpperCase();

  const decisionTone = getDecisionTone(
    finalBreDecision,
  );

  /* ------------------------------------------------------------------------ */
  /* RISK                                                                     */
  /* ------------------------------------------------------------------------ */

  const riskCards = buildRiskCards(applicant);

  // const attentionCount = riskCards.filter(
  //   (card) => card.status === "attention",
  // ).length;

  // const riskSummary =
  //   attentionCount > 0
  //     ? `${attentionCount} alert${
  //         attentionCount > 1 ? "s" : ""
  //       }`
  //     : "All clear";

  const hasStickyRail = Boolean(
    uwDecision || quickLinks,
  );

  const quickLinksWithApplicantAction = isValidElement(quickLinks)
    ? cloneElement(
        quickLinks as ReactElement<{
          onApplicantInformationClick?: () => void;
          onRequirementManagementClick?: () => void;
          onDecisionHistoryClick?: () => void;
        }>,
        {
          onApplicantInformationClick: () => setActiveQuickLinkPanel("summary"),
          onRequirementManagementClick: () =>
            openRequirementManagementPanel("All"),
          onDecisionHistoryClick: () => setActiveQuickLinkPanel("decisionHistory"),
        },
      )
    : quickLinks;

  const requirementManagementWithStatusFilter = isValidElement(
    requirementManagement,
  )
    ? cloneElement(
        requirementManagement as ReactElement<{
          statusFilter?: RequirementStatusFilter;
          statusFilterSignal?: number;
        }>,
        {
          statusFilter: requirementStatusFilter,
          statusFilterSignal: requirementStatusFilterSignal,
        },
      )
    : requirementManagement;

  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <>
      {/* Only the applicant/application banner is frozen. */}
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          px: 0.5,
          pb: 0.75,
          pt:0.75,
          position: {
            xs: "static",
            lg: "sticky",
          },
          top: {
            lg: stickyTop,
          },
          zIndex: {
            xs: "auto",
            lg: 20,
          },
          overflow: "visible",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: hasStickyRail
                ? "minmax(0,1fr) 300px"
                : "minmax(0,1fr)",
            },
            gap: 1,
          }}
        >
          <ApplicationSummaryBanner
            onBackToInbox={onBackToInbox}
            image={image}
            name={name}
            appNo={appNo}
            personalSummary={personalSummary}
            productName={productName}
            policyTerm={policyTerm}
            premiumTerm={premiumTerm}
            sumAssured={sumAssured}
            tsa={tsa}
            tfsa={tfsa}
            tssa={tssa}
            tpsa={tpsa}
            riderSummaries={riderSummaries}
            onViewRiders={() =>
              setRiderDialogOpen(true)
            }
          />
        </Box>
      </Box>

      {/* BRE, risk analytics and the remaining case snapshot scroll normally. */}
      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          px: 0.5,
        }}
      >
        {showViewMedicals ? (
          <Box sx={{ mb: 1 }}>
            <ViewMedical
              onBack={() => setShowViewMedicals(false)}
            />
          </Box>
        ) : (
          <Box sx={{ mb: 1 }}>
            <CMOMedicalDecisionTable
              rows={cmoDecisionRows}
              onRowsChange={setCMODecisionRows}
              readOnly={readOnly}
            />

            <Box
              sx={{
                mt: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <CustomButton
                type="button"
                variant="outlined"
                onClick={() => {
                  setShowViewMedicals(true);
                  onViewMedicals?.();
                }}
                sx={{ borderRadius: "50px" }}
              >
                View Medicals
              </CustomButton>

              <CustomButton
                type="button"
                variant="outlined"
                onClick={onViewMedicalDocuments}
                sx={{ borderRadius: "50px" }}
              >
                View Medical Documents
              </CustomButton>

              <CustomButton
                type="button"
                variant="contained"
                onClick={() => void onSubmit?.(cmoDecisionRows)}
                sx={{ borderRadius: "50px" }}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </CustomButton>
            </Box>
          </Box>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: hasStickyRail
                ? "minmax(0,1fr) 300px"
                : "minmax(0,1fr)",
            },
            gap: 1,
            alignItems: "start",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
          {/* <CustomAccordion
            title="Application Summary"
            defaultExpanded
          > */}

          {/* </CustomAccordion> */}

          {/* ============================================================ */}
          {/* BRE DECISION DETAILS DIALOG                                 */}
          {/* ============================================================ */}

          <CustomDialog
            open={breDetailDialogOpen}
            onClose={() =>
              setBreDetailDialogOpen(false)
            }
            title="BRE Decision"
            maxWidth="lg"
            fullWidth
            contentSx={{
              p: { xs: 1, sm: 1.5 },
              overflowY: "auto",
            }}
          >
            <BreDecision readOnly={readOnly} />
          </CustomDialog>

          {/* ============================================================ */}
          {/* RISK DETAILS DIALOG                                         */}
          {/* ============================================================ */}

          <CustomDialog
            open={Boolean(selectedRiskCard)}
            onClose={() =>
              setSelectedRiskCard(null)
            }
            title={
              selectedRiskCard
                ? `${selectedRiskCard.label} Risk Details`
                : "Risk Details"
            }
            maxWidth="lg"
          >
            {selectedRiskCard && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2,1fr)",
                    md: "repeat(3,1fr)",
                    lg: "repeat(4,1fr)",
                  },
                  gap: 0.75,
                  minWidth: {
                    xs: "auto",
                    md: 760,
                  },
                }}
              >
                {selectedRiskCard.details.map(
                  (detail) => (
                    <Box
                      key={detail.key}
                      sx={{
                        p: 0.8,
                        border:
                          "1px solid #E3DEDB",
                        borderRadius: 1,
                        bgcolor: "#F8F7F6",
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#827671",
                          fontSize: 9,
                        }}
                      >
                        {detail.label}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.25,
                          color: "#332D2A",
                          fontSize: 11,
                          fontWeight: 800,
                          overflowWrap:
                            "anywhere",
                        }}
                      >
                        {text(detail.value)}
                      </Typography>
                    </Box>
                  ),
                )}
              </Box>
            )}
          </CustomDialog>

          {/* ============================================================ */}
          {/* RIDER DETAILS DIALOG                                        */}
          {/* ============================================================ */}

          <CustomDialog
            open={riderDialogOpen}
            onClose={() =>
              setRiderDialogOpen(false)
            }
            title="Rider Details"
            maxWidth="lg"
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2,1fr)",
                },
                gap: 0.8,
                minWidth: {
                  xs: "auto",
                  md: 720,
                },
              }}
            >
              {riderSummaries.map(
                (rider) => (
                  <Box
                    key={rider.id}
                    sx={{
                      p: 0.9,
                      border:
                        "1px solid #E4DEDB",
                      borderLeft:
                        "4px solid #A92129",
                      borderRadius: 1.1,
                      bgcolor: "#FAF8F7",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#332D2A",
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {rider.name}
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "1fr 1fr",
                        gap: 0.7,
                        mt: 0.75,
                      }}
                    >
                      <CompactField
                        label="Sum assured"
                        value={
                          rider.sumAssured
                        }
                      />

                      <CompactField
                        label="Premium"
                        value={rider.premium}
                      />

                      <CompactField
                        label="Policy term"
                        value={
                          rider.policyTerm
                        }
                      />

                      <CompactField
                        label="Premium term"
                        value={
                          rider.premiumTerm
                        }
                      />
                    </Box>
                  </Box>
                ),
              )}
            </Box>
          </CustomDialog>
        </Box>

        {/* ================================================================ */}
        {/* RIGHT RAIL                                                       */}
        {/* ================================================================ */}

        {hasStickyRail && (
          <Box
            component="aside"
            sx={{
              display: "grid",
              gap: 0.8,
              minWidth: 0,
            }}
          >
            {uwDecision && (
              <DashboardCard
                eyebrow="Underwriter"
                title="UW Decision"
              >
                {uwDecision}
              </DashboardCard>
            )}

            {quickLinks && (
              <DashboardCard
                eyebrow="Navigation"
                title="Quick Links"
              >
                {quickLinksWithApplicantAction}
              </DashboardCard>
            )}
          </Box>
        )}
      </Box>
    </Box>
    </>
  );
};

export default VendorCMOApplicationSummary;

/* -------------------------------------------------------------------------- */
/* STANDALONE CASE SNAPSHOT ROW                                               */
/* -------------------------------------------------------------------------- */

export const CaseSnapshotRow = ({
  breDecision,
  applicationOverview,
  applicantSummary,
  riskAnalytics,
  uwDecision,
  quickLinks,
}: CaseSnapshotRowProps) => {
  const hasStickyRail = Boolean(
    uwDecision || quickLinks,
  );

  return (
    <Box
      sx={{
        width: "100%",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          lg: hasStickyRail
            ? "minmax(0,1fr) 300px"
            : "1fr",
        },
        gap: 1,
        alignItems: "start",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md:
              "minmax(300px,38%) minmax(270px,32%) minmax(240px,30%)",
          },
          gap: 0.75,
          minWidth: 0,
        }}
      >
        {/* BRE FIRST */}

        <DashboardCard
          eyebrow="Assessment"
          title="BRE Decision"
        >
          {breDecision}
        </DashboardCard>

        {/* APPLICATION SECOND */}

        <DashboardCard
          eyebrow="Application"
          title="Application & Applicant"
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "1fr 1fr",
              },
              gap: 0.7,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              {applicantSummary ?? (
                <Typography
                  sx={{
                    color: "#817773",
                    fontSize: 10,
                  }}
                >
                  Applicant details are not
                  available.
                </Typography>
              )}
            </Box>

            <Box
              sx={{
                minWidth: 0,
                p: 0.7,
                bgcolor: "#FCFAF9",
                borderRadius: 1,
              }}
            >
              {applicationOverview}
            </Box>
          </Box>
        </DashboardCard>

        {/* RISK THIRD */}

        <DashboardCard
          eyebrow="Signals"
          title="Risk Analytics"
        >
          {riskAnalytics ?? (
            <Typography
              sx={{
                color: "#817773",
                fontSize: 10,
              }}
            >
              Risk analytics are not
              available.
            </Typography>
          )}
        </DashboardCard>
      </Box>

      {/* RIGHT RAIL */}

      {hasStickyRail && (
        <Box
          component="aside"
          sx={{
            display: "grid",
            gap: 0.8,
            minWidth: 0,
          }}
        >
          {uwDecision && (
            <DashboardCard
              eyebrow="Underwriter"
              title="UW Decision"
            >
              {uwDecision}
            </DashboardCard>
          )}

          {quickLinks && (
            <DashboardCard
              eyebrow="Navigation"
              title="Quick Links"
            >
              {quickLinks}
            </DashboardCard>
          )}
        </Box>
      )}
    </Box>
  );
};
