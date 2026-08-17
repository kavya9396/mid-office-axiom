// import { Box, Container, Paper, Stack, Typography } from "@mui/material";
// import { fieldStylesEdit } from "../../utils/styles";
// import CustomTextField from "../../components/ui/TextField/TextField";
// import CustomButton from "../../components/ui/Button/Button";
// import BackButton from "../../components/layout/BackButton";
// import { useCallback, useMemo, useRef, useState } from "react";
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import type { AppDispatch } from "../../store/store";
// // import { searchThunk } from "../../store/thunks/searchAppThunk";
// import { drsThunk } from "../../store/thunks/drsThunk";
// import { breThunk } from "../../store/thunks/breThunk";
// import { breRetriggerThunk } from "../../store/thunks/breRetriggerThunk";
// import { setDrsData, setBreExternalApiOutputs } from "../../store/slices/drsSlice";
// import { fetchMastersForSession } from "../../store/thunks/sessionMastersThunk";
// import type { DRSData, DRSBreOutput } from "../../types/drs.types";
// import { useAppContext } from "../../hooks/useAppContext";
// import { getInboxPath, normalizeBusinessType } from "../../routes/routes";
// import BreDecision from "../DRS/DRS_Accordions/BreDecision_";
// import ApplicationOverview from "../DRS/DRS_Accordions/ApplicationOverview";
// import Summary from "../DRS/DRS_Accordions/Summary";
// import RequirementManagement from "../DRS/DRS_Accordions/RequirementManagement";
// // import DecisionHistory from "../DRS/DRS_Accordions/DecisionHistory";

// const toRecord = (value: unknown): Record<string, unknown> =>
//   value && typeof value === "object" && !Array.isArray(value)
//     ? (value as Record<string, unknown>)
//     : {};

// const toText = (value: unknown): string => String(value ?? "").trim();

// const mapLegacyBreDecisionToOutput = (value: unknown): DRSBreOutput | null => {
//   const record = value && typeof value === "object" && !Array.isArray(value)
//     ? (value as Record<string, unknown>)
//     : null;

//   if (!record) {
//     return null;
//   }

//   const decision = toText(record.decision);
//   const initialDecision = toText(record.initialDecision);
//   const remarks = toText(record.remarks);
//   const discrepancy = toText(record.discrepancy);

//   if (!decision && !initialDecision && !remarks && !discrepancy) {
//     return null;
//   }

//   return {
//     systemDecision: decision,
//     decisionTypes: {
//       breDecision: decision,
//       breAction: toText(record.action),
//       breRequirement: discrepancy,
//       initialDecision,
//     },
//     requirements: [],
//     systemDecisionDateTime: toText(record.timestamp),
//     errorResp: "",
//     breRemarks: remarks,
//   };
// };

// const normalizeSummary = (dataRecord: Record<string, unknown>) => {
//   const summaryRaw = dataRecord.summary;
//   if (Array.isArray(summaryRaw)) {
//     return summaryRaw;
//   }

//   const summaryObject = toRecord(summaryRaw);
//   if (Object.keys(summaryObject).length === 0) {
//     return [];
//   }

//   const proposerSummary = toRecord(summaryObject.proposerSummary);
//   const personalDetails = toRecord(summaryObject.personalDetails);
//   const financialDetails = toRecord(summaryObject.financialDetails);
//   const policyDetails = toRecord(summaryObject.policyDetails);
//   const underwriting = toRecord(summaryObject.underwriting);
//   const applicantProfile = toRecord(dataRecord.applicantProfile);
//   const location = toRecord(personalDetails.location);
//   const occupation = toRecord(personalDetails.occupation);

//   return [
//     {
//       memberType: "PROPOSER",
//       jontFlag: false,
//       proposerSummary,
//       personalDetails: {
//         firstName: toText(proposerSummary.name),
//         dob: toText(proposerSummary.dob || applicantProfile.dateOfBirth),
//         age: proposerSummary.age,
//         gender: toText(proposerSummary.gender || applicantProfile.gender),
//         maritalStatus: toText(personalDetails.maritalStatus || applicantProfile.maritalStatus),
//         nationality: toText(applicantProfile.nationality),
//         residentStatus: toText(applicantProfile.countryOfResidence),
//         highestQualification: toText(applicantProfile.education),
//         orgName: toText(occupation.organization || applicantProfile.organisationName),
//         designation: toText(occupation.designation),
//         city: toText(location.city),
//         panNo: toText(applicantProfile.panOrForm60),
//         ckycNumber: toText(applicantProfile.existingCkycNumber),
//         criminalProceeding: toText(applicantProfile.criminalProceedings),
//         incomeProof: toText(applicantProfile.incomeProof),
//       },
//       kycDetails: {
//         panNumber: toText(applicantProfile.panOrForm60),
//         identityProofType: toText(applicantProfile.identityProofType),
//         identityProofNumber: toText(applicantProfile.identityProofNumber),
//         addressProof: toText(applicantProfile.addressProof),
//         incomeProof: toText(applicantProfile.incomeProof),
//         existingCkycNumber: toText(applicantProfile.existingCkycNumber),
//         pep: toText(applicantProfile.politicallyExposedPerson),
//         criminalProceedings: toText(applicantProfile.criminalProceedings),
//       },
//       financialDetails,
//       policyDetails,
//       underwriting,
//     },
//   ];
// };

// const normalizeApplicationOverview = (dataRecord: Record<string, unknown>) => {
//   const applicationOverviewRaw = toRecord(dataRecord.applicationOverview);

//   if (Array.isArray(applicationOverviewRaw.productDetail)) {
//     return applicationOverviewRaw;
//   }

//   const product = toRecord(applicationOverviewRaw.product);
//   const distribution = toRecord(applicationOverviewRaw.distribution);
//   const agent = toRecord(applicationOverviewRaw.agent);
//   const customer = toRecord(applicationOverviewRaw.customer);
//   const policyDetails = toRecord(applicationOverviewRaw.policyDetails);

//   return {
//     ...applicationOverviewRaw,
//     sourcingDetail: {
//       channelCode: toText(distribution.channel),
//       drcChannelCode: toText(distribution.subChannel),
//       agentCode: toText(agent.agentCode),
//       agentName: toText(agent.agentName),
//     },
//     groupDetails: {
//       coverageStatus: toText(customer.policyType),
//     },
//     productDetail: [
//       {
//         name: toText(product.name),
//         sumAssured: product.sumAssured,
//         paymentAmount: policyDetails.modalPremium,
//         premium: policyDetails.modalPremium,
//         term: policyDetails.policyTerm,
//         premiumPaymentTerm: policyDetails.premiumPaymentTerm,
//         premiumModeFpd: toText(policyDetails.paymentMode),
//       },
//     ],
//   };
// };

// const normalizeSearchData = (rawData: Record<string, unknown>): DRSData => {
//   const applicationDetails = toRecord(rawData.applicationDetails);
//   const financialDetails = toRecord(toRecord(rawData.summary).financialDetails);
//   const basicDetails = toRecord(rawData.basicDetails);
//   const applicationOverview = toRecord(rawData.applicationOverview);
//   const applicationOverviewProduct = toRecord(applicationOverview.product);
//   const applicationOverviewCustomer = toRecord(applicationOverview.customer);
//   const requirementManagement = Array.isArray(rawData.requirementManagement)
//     ? rawData.requirementManagement
//     : Array.isArray(rawData.requirements)
//       ? rawData.requirements
//       : [];

//   const normalized: Record<string, unknown> = {
//     ...rawData,
//     applicationInfo: {
//       ...toRecord(rawData.applicationInfo),
//       sumAssured:
//         financialDetails.appliedSumAssured ??
//         applicationDetails.appliedSA ??
//         applicationOverviewProduct.sumAssured,
//       proposerType:
//         toText(applicationOverviewCustomer.customerType) ||
//         toText(applicationDetails.clientType),
//       policyNumber: toText(applicationDetails.applicationId || basicDetails.applicationNumber),
//     },
//     summary: normalizeSummary(rawData),
//     applicationOverview: normalizeApplicationOverview(rawData),
//     requirementManagement,
//     requirements: requirementManagement,
//   };

//   return normalized as unknown as DRSData;
// };

// const pageShellSx = {
//   minHeight: "90vh",
//   pt: 2,
//   background:
//     "radial-gradient(circle at top left, rgba(154,37,41,0.16), transparent 30%), linear-gradient(180deg, #fbfbfd 0%, #f4f6fa 100%)",
// };

// const surfaceCardSx = {
//   p: { xs: 2.5, md: 3.5 },
//   borderRadius: 4,
//   border: "1px solid rgba(154,37,41,0.12)",
//   background:
//     "linear-gradient(135deg, rgba(154,37,41,0.08) 0%, rgba(255,255,255,0.98) 55%, rgba(255,255,255,0.92) 100%)",
//   boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
// };

// const readOnlyContentSx = {
//   "& input, & textarea, & .MuiSelect-select": {
//     pointerEvents: "none",
//   },
//   "& button:not(.MuiAccordionSummary-root):not([data-drs-readonly-nav='true']):not(.MuiPaginationItem-root)": {
//     display: "none",
//   },
// };

// const SearchApplication = () => {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();
//   const { businessType } = useAppContext();
//   const [searchValue, setSearchValue] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [hasSearchResult, setHasSearchResult] = useState(false);

//   const mastersRequestedRef = useRef(false);
//   const safeBusinessType = normalizeBusinessType(businessType) ?? "retail";
//   const userId = (localStorage.getItem("userId") ?? localStorage.getItem("username") ?? "").trim();
//   const roleType = (localStorage.getItem("roleType") ?? "CUW Pool").trim();
//   const sections = useMemo(() => ["breDecision", "applicationOverview", "summary", "requirementManagement"], []);

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     const filteredValue = value.replace(/[^a-zA-Z0-9]/g, "");
//     if (filteredValue.length <= 10) {
//       setSearchValue(filteredValue);
//     }
//   };

//   const isValidSearch = searchValue.length === 10;

//   const getResponseData = (response: unknown): DRSData | null => {
//     const responseRecord = response && typeof response === "object" && !Array.isArray(response)
//       ? (response as Record<string, unknown>)
//       : {};
//     const data = responseRecord.data;

//     return data && typeof data === "object" && !Array.isArray(data)
//       ? normalizeSearchData(data as Record<string, unknown>)
//       : null;
//   };

//   const dispatchMastersOnce = useCallback(() => {
//     if (mastersRequestedRef.current) {
//       return;
//     }

//     mastersRequestedRef.current = true;
//     dispatch(fetchMastersForSession());
//   }, [dispatch]);

//   const handleSearch = async () => {
//     try {
//       setLoading(true);

//       // Commenting out searchThunk as drsThunk provides similar functionality
//       // const response = await dispatch(
//       //   searchThunk({
//       //     applicationNo: searchValue
//       //   })
//       // ).unwrap();

//       // const drsResponseData = getResponseData(response);

//       // if (drsResponseData) {
//       //   dispatch(setDrsData(drsResponseData));
//       //   setHasSearchResult(true);

//         // Load DRS and BRE data after successful search
//         if (userId) {
//           try {
//             const drsResponse = await dispatch(
//               drsThunk({
//                 applicationNo: searchValue,
//                 userId,
//                 roleType,
//                 sections,
//               }),
//             ).unwrap();

//             // Update the DRS data in Redux with the response from drsThunk
//             // This ensures requirement management and other sections are properly populated
//             if (drsResponse?.data) {
//               const drsResponseData = getResponseData(drsResponse);
              
//               if (drsResponseData) {
//                 dispatch(setDrsData(drsResponseData));
//                 setHasSearchResult(true);
//               }
//             }

//             try {
//               const finalBre = await dispatch(
//                 breThunk({
//                   eventName: "BRE-RETAIL",
//                   applicationNumber: searchValue,
//                 }),
//               ).unwrap();
//               console.log("finalBre", finalBre);

//               const breResponse = await dispatch(
//                 breRetriggerThunk({
//                   eventName: "BRE-RETAIL",
//                   applicationNumber: searchValue,
//                 }),
//               ).unwrap();

//               const updatedBrePayload = breResponse.data;
//               const dataRecord = drsResponse.data as unknown as Record<string, unknown>;
//               const originalBreOutput =
//                 drsResponse.data.externalAPIs?.breOutput ??
//                 mapLegacyBreDecisionToOutput(dataRecord.breDecision);

//               if (
//                 updatedBrePayload?.breOutput ||
//                 updatedBrePayload?.initialBreOutput ||
//                 updatedBrePayload?.medicalBreOutput ||
//                 updatedBrePayload?.financialBreOutput
//               ) {
//                 dispatch(
//                   setBreExternalApiOutputs({
//                     breOutput: updatedBrePayload?.breOutput,
//                     initialBreOutput: originalBreOutput ?? updatedBrePayload?.initialBreOutput,
//                     breRetriggerStatus: "success",
//                     medicalBreOutput: updatedBrePayload?.medicalBreOutput,
//                     financialBreOutput: updatedBrePayload?.financialBreOutput,
//                   }),
//                 );
//               }
//             } catch (error) {
//               const dataRecord = drsResponse.data as unknown as Record<string, unknown>;
//               const originalBreOutput =
//                 drsResponse.data.externalAPIs?.initialBreOutput ??
//                 drsResponse.data.externalAPIs?.breOutput ??
//                 mapLegacyBreDecisionToOutput(dataRecord.breDecision);

//               dispatch(
//                 setBreExternalApiOutputs({
//                   initialBreOutput: originalBreOutput ?? undefined,
//                   breRetriggerStatus: "failure",
//                 }),
//               );
//               console.error("Failed to retrigger BRE from DRS response:", error);
//             }
//           } catch (error) {
//             console.error("Failed to load DRS:", error);
//             setHasSearchResult(false);
//           } finally {
//             dispatchMastersOnce();
//           }
//         } else {
//           setHasSearchResult(false);
//         }
//       // }
//     } catch (error) {
//       setHasSearchResult(false);
//       console.error("Search failed:", error);
//     } finally {
//       setLoading(false);
//     }
//   };
//   return (
//     <Box sx={pageShellSx}>
//       <Container disableGutters>
//         <Stack spacing={3}>
//           <BackButton
//             label="Back to inbox"
//             justify="flex-start"
//             onClick={() => navigate(getInboxPath(safeBusinessType))}
//           />
//           <Paper elevation={0} sx={surfaceCardSx}>
//             <Stack spacing={2} component="form" onSubmit={(event) => {
//               event.preventDefault();
//               void handleSearch();
//             }}>
//               <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
//                 Search an application
//               </Typography>
             
              

//               <Box
//                 sx={{
//                   display: "grid",
//                   gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
//                   gap: 2,
//                   alignItems: "start",
//                   maxWidth: 400,
//                   width: "100%",
//                 }}
//               >
//                 <CustomTextField
//                   fullWidth
//                   placeholder="Search Application"
//                   value={searchValue}
//                   onChange={handleSearchChange}
//                   sx={{ ...fieldStylesEdit }}
//                   error={searchValue.length > 0 && searchValue.length < 10}
//                   helperText={
//                     searchValue.length > 0 && searchValue.length < 10
//                       ? "Application ID must be 10 alphanumeric characters"
//                       : ""
//                   }
//                 />

//                 <CustomButton
//                   variant="contained"
//                   sx={{
//                     borderRadius: "50px",
//                     px: 4,
//                     whiteSpace: "nowrap",
//                   }}
//                   type="submit"
//                   disabled={!isValidSearch}
//                 >
//                   {loading ? "Searching..." : "Search"}
//                 </CustomButton>
//               </Box>
//             </Stack>
//           </Paper>

//           {hasSearchResult && (
//             <Box sx={readOnlyContentSx}>
//               <BreDecision />
//               <ApplicationOverview />
//               <Summary />
//               <RequirementManagement />
//             </Box>
//           )}
//         </Stack>
//       </Container>
//     </Box>
//   );
// };
// export default SearchApplication;
