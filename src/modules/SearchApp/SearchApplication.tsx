// import { Box, Typography } from "@mui/material"
// import BackButton from "../../components/layout/BackButton"
// import { title } from "../../utils/constant"
// import { useNavigate } from "react-router-dom";
// import { getDRSPath, getInboxPath } from "../../routes/routes";
// import CustomTextField from "../../components/ui/TextField/TextField";
// import CustomButton from "../../components/ui/Button/Button";
// import { columnFlex } from "../../utils/styles";
// import RequirementManagement from "../DRS/DRS_Accordions/RequirementManagement";
// import AuditTrailAccordion from "../DRS/DRS_Accordions/AuditTrail";
// import ApplicationDetails from "./ApplicationDetails";
// import { useAppContext } from "../../hooks/useAppContext";

// const SearchApplication = () => {
//     const navigate = useNavigate();
//     const { businessType } = useAppContext();

//     const applicationNumber = "OB25175112";
//     return (
//         <>
//             <Box sx={{ px: 1 }}>
//                 <BackButton
//                     label={title.backToInbox}
//                     onClick={() => navigate(getInboxPath())}
//                 />

//                 <Box sx={{ ...columnFlex, bgcolor: "#fff", p: 2, mb: 1, borderRadius: 2, gap: 1, boxShadow: 2 }}>
//                     <Typography variant="h6" sx={{ fontWeight: 700, color: "#1f2937" }}>
//                         Search an application
//                     </Typography>

//                     <Box
//                         sx={{
//                             display: "flex",
//                             justifyContent: "center",
//                             alignItems: "center",
//                             gap: 2,
//                             maxWidth: 400,
//                         }}
//                     >
//                         <CustomTextField
//                             fullWidth
//                             placeholder="Search Application"

//                         />
//                         <CustomButton
//                             variant="contained"
//                             sx={{
//                                 borderRadius: "50px",
//                                 px: 4,
//                                 whiteSpace: "nowrap",
//                             }}
//                             type="submit"
//                         >
//                             Search
//                         </CustomButton>
//                     </Box>
//                 </Box>

//             </Box>
//             <Box sx={{...columnFlex, gap:1}}>
//                 <ApplicationDetails />
//                 <RequirementManagement />
//                 <AuditTrailAccordion />
//             </Box>

//             <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap", px:1, bgcolor: "#fff", p: 2  }}>
//               <CustomButton
//                 variant="outlined"
//                 sx={{
//                   borderRadius: "50px",
//                   px: 3,
//                   py: 1,
//                   width: "200px",
//                   fontSize: "12px",
//                   lineHeight: "16px",
//                   fontWeight: 700,
//                 }}
//                 // onClick={() => navigate(getMedicalPath(businessType!, applicationNumber!))}
//               >
//                 View UDS Document
//               </CustomButton>
//               <CustomButton
//                 variant="contained"
//                 sx={{
//                   borderRadius: "50px",
//                   px: 3,
//                   py: 1,
//                   width: "200px",
//                   fontSize: "12px",
//                   lineHeight: "16px",
//                   fontWeight: 700,
//                 }}
//                 onClick={() => navigate(getDRSPath(businessType!, applicationNumber ))}
//               >
//                 View DRS Sheet
//               </CustomButton>
//             </Box>

//         </>
//     )
// }

// export default SearchApplication


import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    CircularProgress,
    Typography,
} from "@mui/material";
import BackButton from "../../components/layout/BackButton";
import CustomButton from "../../components/ui/Button/Button";
import CustomTextField from "../../components/ui/TextField/TextField";
import { title } from "../../utils/constant";
import { columnFlex } from "../../utils/styles";
import { getInboxPath } from "../../routes/routes";
import ApplicationDetails from "./ApplicationDetails";
import RequirementManagement from "../DRS/DRS_Accordions/RequirementManagement";
import AuditTrailAccordion from "../DRS/DRS_Accordions/AuditTrail";
import { useAppDispatch } from "../../store/hooks";
import type { SearchApiResponse } from "../../types/search.types";
import { searchThunk } from "../../store/thunks/searchAppThunk";
import CustomSnackbar from "../../components/ui/SnackBar/Snackbar";
import BreDecision from "../DRS/DRS_Accordions/BreDecision";
// import ApplicationOverview from "../DRS/DRS_Accordions/ApplicationOverview";
// import Summary from "../DRS/DRS_Accordions/Summary";

const APPLICATION_NUMBER_REGEX = /^[A-Za-z0-9]{10}$/;

type SearchPageMode = "search" | "drs";

type SnackbarSeverity = "success" | "error" | "warning" | "info";

type SnackbarState = {
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
};

const initialSnackbarState: SnackbarState = {
    open: false,
    message: "",
    severity: "info",
};

const SearchApplication = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [applicationNumber, setApplicationNumber] = useState("");
    const [searchData, setSearchData] = useState<SearchApiResponse | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [snackbar, setSnackbar] =
        useState<SnackbarState>(initialSnackbarState);
    const [pageMode, setPageMode] = useState<SearchPageMode>("search");

    const showSnackbar = (
        message: string,
        severity: SnackbarState["severity"],
    ) => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    const closeSnackbar = () => {
        setSnackbar((previous) => ({
            ...previous,
            open: false,
        }));
    };

    const handleSearch = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedApplicationNumber = applicationNumber.trim();

        if (!normalizedApplicationNumber) {
            showSnackbar("Please enter an application number.", "warning");
            return;
        }

        if (!APPLICATION_NUMBER_REGEX.test(normalizedApplicationNumber)) {
            showSnackbar(
                "Application number must contain exactly 10 alphanumeric characters.",
                "warning",
            );
            return;
        }

        setPageMode("search");
        setIsSearching(true);
        setSearchData(null);

        try {
            const response = await dispatch(
                searchThunk({
                    applicationNo: normalizedApplicationNumber,
                }),
            ).unwrap();

            /*
             * Use this when createApiThunk already returns response.data.
             */
            const data = response as SearchApiResponse;

            /*
             * If your thunk returns { success, data }, replace the line above with:
             *
             * const apiResponse = response as SearchApiResponse;
             *
             * if (!apiResponse.success || !apiResponse.data) {
             *   throw new Error(apiResponse.message || "Application not found.");
             * }
             *
             * const data = apiResponse.data;
             */

            if (!data) {
                showSnackbar("No data found for this application.", "error");
                return;
            }

            setSearchData(data);

            /*
             * Existing RequirementManagement and AuditTrail components read DRS
             * information from drsSlice, so store the search response there.
             */

            //   showSnackbar("Application details fetched successfully.", "success");
        } catch (error) {
            const message =
                typeof error === "string"
                    ? error
                    : error instanceof Error
                        ? error.message
                        : "Unable to fetch application details.";

            showSnackbar(message, "error");
        } finally {
            setIsSearching(false);
        }
    };

    const handleViewDrs = () => {
  if (!searchData?.data) {
    showSnackbar(
      "Application data is unavailable.",
      "warning",
    );
    return;
  }

  setPageMode("drs");
};

const handleBackToSearch = () => {
  setPageMode("search");
};

    const openDocument = (link?: string) => {
        const normalizedLink = String(link ?? "").trim();

        if (!normalizedLink) {
            showSnackbar("Document link is not available.", "warning");
            return;
        }

        window.open(normalizedLink, "_blank", "noopener, noreferrer");
    };

//     return (
//         <>
//             <Box sx={{ px: 1 }}>
//                 <BackButton
//                     label={title.backToInbox}
//                     onClick={() => navigate(getInboxPath())}
//                 />

//                 <Box
//                     component="form"
//                     onSubmit={handleSearch}
//                     sx={{
//                         ...columnFlex,
//                         bgcolor: "#fff",
//                         p: 2,
//                         mb: 1,
//                         borderRadius: 2,
//                         gap: 1,
//                         boxShadow: 2,
//                     }}
//                 >
//                     <Typography
//                         variant="h6"
//                         sx={{
//                             fontWeight: 700,
//                             color: "#1f2937",
//                         }}
//                     >
//                         Search an application
//                     </Typography>

//                     <Box
//                         sx={{
//                             display: "flex",
//                             justifyContent: "center",
//                             alignItems: "center",
//                             gap: 2,
//                             width: "400px",
//                             maxWidth: 500,
//                         }}
//                     >

//                         <CustomTextField
//                             fullWidth
//                             placeholder="Enter Application Number..."
//                             value={applicationNumber}
//                             disabled={isSearching}
//                             slotProps={{
//                                 htmlInput: {
//                                     maxLength: 10,
//                                 },
//                             }}
//                             onChange={(event) => {
//                                 const value = event.target.value
//                                     .replace(/[^a-zA-Z0-9]/g, "")
//                                     .slice(0, 10)
//                                     .toUpperCase();

//                                 setApplicationNumber(value);

//                                 if (searchData) {
//                                     setSearchData(null);
//                                 }
//                             }}
//                         />

//                         <CustomButton
//                             variant="contained"
//                             type="submit"
//                             disabled={isSearching}
//                             sx={{
//                                 borderRadius: "50px",
//                                 px: 4,
//                                 minWidth: 120,
//                                 whiteSpace: "nowrap",
//                             }}
//                         >
//                             {isSearching ? (
//                                 <CircularProgress size={20} color="inherit" />
//                             ) : (
//                                 "Search"
//                             )}
//                         </CustomButton>
//                     </Box>
//                 </Box>
//             </Box>

//             {isSearching && (
//                 <Box
//                     sx={{
//                         minHeight: 300,
//                         display: "flex",
//                         flexDirection: "column",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         gap: 1.5,
//                     }}
//                 >
//                     <CircularProgress
//                         size={42}
//                         thickness={4}
//                         sx={{ color: "#f58220" }}
//                     />

//                     <Typography
//                         variant="body2"
//                         sx={{
//                             color: "text.secondary",
//                             fontWeight: 500,
//                         }}
//                     >
//                         Searching application...
//                     </Typography>
//                 </Box>
//             )}

//             {!isSearching && searchData && (
//                 <>
//                     <Box
//                         sx={{
//                             ...columnFlex,
//                             gap: 1,
//                         }}
//                     >
//                         <ApplicationDetails />

//                         <RequirementManagement readOnly />

//                         <AuditTrailAccordion readOnly />
//                     </Box>

//                     <Box
//                         sx={{
//                             mt: 1,
//                             p: 2,
//                             display: "flex",
//                             gap: 1,
//                             bgcolor: "#fff",
//                             boxShadow: 1,
//                         }}
//                     >
//                         <CustomButton
//                             variant="outlined"
//                             onClick={() => openDocument(searchData.data.udsLink)}
//                             disabled={!searchData.data.udsLink}
//                             sx={{
//                                 borderRadius: "50px",
//                                 px: 3,
//                                 py: 1,
//                                 width: 200,
//                                 fontSize: "12px",
//                                 lineHeight: "16px",
//                                 fontWeight: 700,
//                             }}
//                         >
//                             View UDS Document
//                         </CustomButton>

//                         <CustomButton
//                             variant="contained"
//                             onClick={() => navigate(getDRSPath("retail", applicationNumber))}
//                             //   disabled={!searchData.drsLink}
//                             sx={{
//                                 borderRadius: "50px",
//                                 px: 3,
//                                 py: 1,
//                                 width: 200,
//                                 fontSize: "12px",
//                                 lineHeight: "16px",
//                                 fontWeight: 700,
//                             }}
//                         >
//                             View DRS Sheet
//                         </CustomButton>
//                     </Box>
//                 </>
//             )}

// <>
//             <BreDecision />
//             <ApplicationOverview />
//             <Summary />
//             <RequirementManagement />
// </>


//             <CustomSnackbar
//                 open={snackbar.open}
//                 message={snackbar.message}
//                 severity={snackbar.severity}
//                 onClose={closeSnackbar}
//                 autoHideDuration={3000}
//             />
//         </>
//     );

return (
  <>
    {pageMode === "drs" && searchData?.data ? (
      <>
        <Box sx={{ px: 1 }}>
          <BackButton
            label="Back to Search Application"
            onClick={handleBackToSearch}
          />
        </Box>

        <Box
          sx={{
            ...columnFlex,
            gap: 1,
          }}
        >
          {/*
           * These components will be updated one by one
           * to read from the search slice when readOnly
           * is true.
           */}
          <BreDecision readOnly />

          {/* <ApplicationOverview readOnly />

          <Summary readOnly /> */}

          <RequirementManagement readOnly />
        </Box>
      </>
    ) : (
      <>
        <Box sx={{ px: 1 }}>
          <BackButton
            label={title.backToInbox}
            onClick={() =>
              navigate(getInboxPath())
            }
          />

          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              ...columnFlex,
              bgcolor: "#fff",
              p: 2,
              mb: 1,
              borderRadius: 2,
              gap: 1,
              boxShadow: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              Search an application
            </Typography>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 2,
                width: "100%",
                maxWidth: 500,
              }}
            >
              <CustomTextField
                fullWidth
                placeholder="Enter Application Number..."
                value={applicationNumber}
                disabled={isSearching}
                slotProps={{
                  htmlInput: {
                    maxLength: 10,
                  },
                }}
                onChange={(event) => {
                  const value =
                    event.target.value
                      .replace(
                        /[^a-zA-Z0-9]/g,
                        "",
                      )
                      .slice(0, 10)
                      .toUpperCase();

                  setApplicationNumber(value);

                  if (searchData) {
                    setSearchData(null);
                  }
                }}
              />

              <CustomButton
                variant="contained"
                type="submit"
                disabled={isSearching}
                sx={{
                  borderRadius: "50px",
                  px: 4,
                  minWidth: 120,
                  whiteSpace: "nowrap",
                }}
              >
                {isSearching ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                  />
                ) : (
                  "Search"
                )}
              </CustomButton>
            </Box>
          </Box>
        </Box>

        {isSearching && (
          <Box
            sx={{
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <CircularProgress
              size={42}
              thickness={4}
              sx={{
                color: "#f58220",
              }}
            />

            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 500,
              }}
            >
              Searching application...
            </Typography>
          </Box>
        )}

        {!isSearching && searchData?.data && (
          <>
            <Box
              sx={{
                ...columnFlex,
                gap: 1,
              }}
            >
              <ApplicationDetails />

              <RequirementManagement readOnly />

              <AuditTrailAccordion readOnly />
            </Box>

            <Box
              sx={{
                mt: 1,
                p: 2,
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                bgcolor: "#fff",
                boxShadow: 1,
              }}
            >
              <CustomButton
                variant="outlined"
                onClick={() =>
                  openDocument(
                    searchData.data.udsLink,
                  )
                }
                disabled={
                  !searchData.data.udsLink
                }
                sx={{
                  borderRadius: "50px",
                  px: 3,
                  py: 1,
                  width: 200,
                  fontSize: "12px",
                  lineHeight: "16px",
                  fontWeight: 700,
                }}
              >
                View UDS Document
              </CustomButton>

              <CustomButton
                variant="contained"
                onClick={handleViewDrs}
                sx={{
                  borderRadius: "50px",
                  px: 3,
                  py: 1,
                  width: 200,
                  fontSize: "12px",
                  lineHeight: "16px",
                  fontWeight: 700,
                }}
              >
                View DRS Sheet
              </CustomButton>
            </Box>
          </>
        )}
      </>
    )}

    <CustomSnackbar
      open={snackbar.open}
      message={snackbar.message}
      severity={snackbar.severity}
      onClose={closeSnackbar}
      autoHideDuration={3000}
    />
  </>
);
};

export default SearchApplication;