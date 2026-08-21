import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, Container, Paper, Stack, Typography } from "@mui/material";

import type { AppDispatch } from "../../store/store";
import { drsThunk } from "../../store/thunks/drsThunk";
import { setDrsData } from "../../store/slices/drsSlice";
import type { DRSData } from "../../types/drs.types";
import { useAppContext } from "../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../routes/routes";
import { fieldStylesEdit } from "../../utils/styles";
import CustomTextField from "../../components/ui/TextField/TextField";
import CustomButton from "../../components/ui/Button/Button";
import BackButton from "../../components/layout/BackButton";
import ApplicationOverview from "../DRS/DRS_Accordions/ApplicationOverview";
import BreDecision from "../DRS/DRS_Accordions/BreDecision";
import ApplicantProfile from "../DRS/DRS_Accordions/ApplicantProfile";
import RequirementManagement from "../DRS/DRS_Accordions/RequirementManagement";
import DecisionHistory from "../DRS/DRS_Accordions/DecisionHistory";
import QuickLinks from "../DRS/QuickLinks";

const SEARCH_RESULT_STORAGE_KEY = "searchApplicationDrsData";

const SEARCH_SECTIONS = [
  "breDecision",
  "applicationOverview",
  "summary",
  "requirementManagement",
  "decisionHistory",
  "quickLinks",
];

interface StoredSearchResult {
  applicationNo: string;
  roleType: string;
  data: DRSData;
}

const readStoredSearchResult = (): StoredSearchResult | null => {
  try {
    const contextRaw = localStorage.getItem("selectedCaseContext");
    const context = contextRaw
      ? (JSON.parse(contextRaw) as {
          source?: string;
          readOnly?: boolean;
          applicationNo?: string;
        })
      : null;

    if (
      context?.source !== "searchApplication" ||
      context.readOnly !== true
    ) {
      return null;
    }

    const rawValue = localStorage.getItem(SEARCH_RESULT_STORAGE_KEY);
    if (!rawValue) return null;

    const parsed = JSON.parse(rawValue) as Partial<StoredSearchResult>;
    if (!parsed.applicationNo || !parsed.roleType || !parsed.data) return null;

    if (
      context.applicationNo &&
      context.applicationNo !== parsed.applicationNo
    ) {
      return null;
    }

    return parsed as StoredSearchResult;
  } catch {
    return null;
  }
};

const pageShellSx = {
  minHeight: "calc(100dvh - 57px)",
  px: { xs: 1.5, md: 2 },
  py: 1.5,
  backgroundColor: "#f7f8fa",
};

const surfaceCardSx = {
  p: { xs: 1.25, md: 1.5 },
  borderRadius: 2,
  border: "1px solid #e5e7eb",
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 8px rgba(15, 23, 42, 0.05)",
};

const readOnlyContentSx = {
  "& input, & textarea, & .MuiSelect-select": { pointerEvents: "none" },
  "& button:not(.MuiAccordionSummary-root):not(.MuiTab-root):not([data-drs-readonly-nav='true']):not(.MuiPaginationItem-root)": {
    display: "none",
  },
  "& [data-drs-quick-links='true'], & [data-drs-quick-links='true'] *": {
    pointerEvents: "auto",
  },
};

const hasObjectData = (value: unknown): boolean =>
  Boolean(
    value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length > 0,
  );

const SearchApplication = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { businessType } = useAppContext();

  // Lazy initialization reads storage only once for this mount and keeps the
  // restored payload stable without accessing a ref during render.
  const [restoredResult] = useState<StoredSearchResult | null>(() =>
    readStoredSearchResult(),
  );

  const [searchValue, setSearchValue] = useState(
    restoredResult?.applicationNo ?? "",
  );
  const [searchedApplicationNo, setSearchedApplicationNo] = useState(
    restoredResult?.applicationNo ?? "",
  );
  const [loading, setLoading] = useState(false);
  const [hasSearchResult, setHasSearchResult] = useState(Boolean(restoredResult));
  const [searchError, setSearchError] = useState("");

  const safeBusinessType = normalizeBusinessType(businessType) ?? "retail";
  const userId = (
    localStorage.getItem("userId") ??
    localStorage.getItem("username") ??
    ""
  ).trim();
  const storedRoleType = (
    localStorage.getItem("roleType") ?? "CUW_TASK"
  ).trim();
  const isValidSearch = searchValue.length === 10;

  useEffect(() => {
    if (!restoredResult) return;

    dispatch(setDrsData(restoredResult.data));
    localStorage.setItem("roleType", restoredResult.roleType);
    localStorage.setItem("drsReadOnlyMode", "true");
    localStorage.setItem(
      "selectedCaseContext",
      JSON.stringify({
        applicationNo: restoredResult.applicationNo,
        roleType: restoredResult.roleType,
        source: "searchApplication",
        readOnly: true,
      }),
    );

  }, [dispatch, restoredResult]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = event.target.value
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 10);

    setSearchValue(sanitizedValue);
    setSearchError("");

    if (sanitizedValue !== searchedApplicationNo) {
      setHasSearchResult(false);
    }
  };

  const handleSearch = async () => {
    if (!userId) {
      setHasSearchResult(false);
      setSearchError("User ID is not available.");
      return;
    }

    if (!isValidSearch) {
      setHasSearchResult(false);
      setSearchError("Application ID must be 10 alphanumeric characters.");
      return;
    }

    try {
      setLoading(true);
      setSearchError("");
      setHasSearchResult(false);

      const response = await dispatch(
        drsThunk({
          applicationNo: searchValue,
          userId,
          roleType: storedRoleType,
          sections: SEARCH_SECTIONS,
        }),
      ).unwrap();

      const drsData: DRSData | null | undefined = response?.data;

      if (!drsData || !hasObjectData(drsData)) {
        localStorage.removeItem(SEARCH_RESULT_STORAGE_KEY);
        setSearchError("No application details found for this application ID.");
        return;
      }

      const searchedRoleType = drsData.roleType?.trim() || storedRoleType;
      const resultToStore: StoredSearchResult = {
        applicationNo: searchValue,
        roleType: searchedRoleType,
        data: drsData,
      };

      dispatch(setDrsData(drsData));
      localStorage.setItem(
        SEARCH_RESULT_STORAGE_KEY,
        JSON.stringify(resultToStore),
      );
      localStorage.setItem("roleType", searchedRoleType);
      localStorage.setItem("drsReadOnlyMode", "true");
      localStorage.setItem(
        "selectedCaseContext",
        JSON.stringify({
          applicationNo: searchValue,
          roleType: searchedRoleType,
          source: "searchApplication",
          readOnly: true,
        }),
      );

      setSearchedApplicationNo(searchValue);
      setHasSearchResult(true);
    } catch (error) {
      console.error("Failed to load searched application:", error);
      setHasSearchResult(false);
      setSearchError("Unable to load application details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSearch();
  };

  const handleBack = () => {
    localStorage.removeItem(SEARCH_RESULT_STORAGE_KEY);
    localStorage.removeItem("drsReadOnlyMode");
    localStorage.removeItem("selectedCaseContext");
    navigate(getInboxPath(safeBusinessType));
  };

  return (
    <Box sx={pageShellSx}>
      <Container maxWidth={false} disableGutters>
        <Stack spacing={1.25}>
          <BackButton
            label="Back to inbox"
            justify="flex-start"
            onClick={handleBack}
          />

          <Paper elevation={0} sx={surfaceCardSx}>
            <Stack component="form" spacing={1} onSubmit={handleSubmit}>
              <Typography sx={{ color: "#1f2937", fontSize: "15px", fontWeight: 700 }}>
                Search Application
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "minmax(240px, 340px) auto",
                  },
                  gap: 1,
                  alignItems: "start",
                  width: "100%",
                  maxWidth: 460,
                }}
              >
                <CustomTextField
                  fullWidth
                  placeholder="Enter Application ID"
                  value={searchValue}
                  onChange={handleSearchChange}
                  disabled={loading}
                  error={Boolean(searchError) || (searchValue.length > 0 && !isValidSearch)}
                  helperText={
                    searchError ||
                    (searchValue.length > 0 && !isValidSearch
                      ? "Application ID must be 10 alphanumeric characters"
                      : "")
                  }
                  sx={{
                    ...fieldStylesEdit,
                    "& .MuiInputBase-root": { minHeight: "36px" },
                    "& .MuiFormHelperText-root": {
                      mt: 0.4,
                      ml: 0,
                      fontSize: "10px",
                    },
                  }}
                />

                <CustomButton
                  type="submit"
                  variant="contained"
                  disabled={!isValidSearch || loading}
                  sx={{
                    minWidth: 92,
                    minHeight: 36,
                    borderRadius: "6px",
                    px: 2,
                    whiteSpace: "nowrap",
                  }}
                >
                  {loading ? "Searching..." : "Search"}
                </CustomButton>
              </Box>
            </Stack>
          </Paper>

          {hasSearchResult && (
            <Box
              key={searchedApplicationNo}
              sx={{ ...readOnlyContentSx, display: "grid", gap: 1 }}
            >
              <BreDecision />
              <ApplicationOverview />
              <ApplicantProfile />
              <RequirementManagement />
              <DecisionHistory />
              <QuickLinks
                applicationNo={searchedApplicationNo}
                hideSearchApplication
              />
            </Box>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default SearchApplication;
