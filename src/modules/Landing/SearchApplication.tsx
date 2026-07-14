import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { fieldStylesEdit } from "../../utils/styles";
import CustomTextField from "../../components/ui/TextField/TextField";
import CustomButton from "../../components/ui/Button/Button";
import { useState } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { searchThunk } from "../../store/thunks/searchAppThunk";
import { getDRSPath, normalizeBusinessType } from "../../routes/routes";
import { useNavigate } from "react-router-dom";

const pageShellSx = {
  minHeight: "90vh",
  pt: 2,
  background:
    "radial-gradient(circle at top left, rgba(154,37,41,0.16), transparent 30%), linear-gradient(180deg, #fbfbfd 0%, #f4f6fa 100%)",
};

const surfaceCardSx = {
  p: { xs: 2.5, md: 3.5 },
  borderRadius: 4,
  border: "1px solid rgba(154,37,41,0.12)",
  background:
    "linear-gradient(135deg, rgba(154,37,41,0.08) 0%, rgba(255,255,255,0.98) 55%, rgba(255,255,255,0.92) 100%)",
  boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
};

const SearchApplication = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9]/g, "");
    if (filteredValue.length <= 10) {
      setSearchValue(filteredValue);
    }
  };

  const isValidSearch = searchValue.length === 10;

  const resolveApplicationNumber = (response: unknown) => {
    const responseRecord = response && typeof response === "object" && !Array.isArray(response)
      ? (response as Record<string, unknown>)
      : {};
    const dataRecord = responseRecord.data && typeof responseRecord.data === "object" && !Array.isArray(responseRecord.data)
      ? (responseRecord.data as Record<string, unknown>)
      : {};
    const applicationDetails = responseRecord.applicationDetails && typeof responseRecord.applicationDetails === "object" && !Array.isArray(responseRecord.applicationDetails)
      ? (responseRecord.applicationDetails as Record<string, unknown>)
      : {};
    const basicDetails = dataRecord.basicDetails && typeof dataRecord.basicDetails === "object" && !Array.isArray(dataRecord.basicDetails)
      ? (dataRecord.basicDetails as Record<string, unknown>)
      : {};

    return String(
      applicationDetails.applicationId ??
      dataRecord.applicationNumber ??
      basicDetails.applicationNumber ??
      searchValue,
    ).trim();
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      const response = await dispatch(
        searchThunk({
          applicationNo: searchValue
        })
      ).unwrap();

      const applicationNumber = resolveApplicationNumber(response);
      const safeBusinessType =
        normalizeBusinessType(localStorage.getItem("businessType")) ?? "retail";

      localStorage.setItem("businessType", safeBusinessType);
      localStorage.setItem("applicationNumber", applicationNumber);
      localStorage.setItem(
        "selectedCaseContext",
        JSON.stringify({
          applicationNo: applicationNumber,
        }),
      );

      navigate(getDRSPath(safeBusinessType, applicationNumber));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Box sx={pageShellSx}>
      <Container disableGutters>
        <Stack spacing={3}>
          <Paper elevation={0} sx={surfaceCardSx}>
            <Stack spacing={2} component="form" onSubmit={(event) => {
              event.preventDefault();
              void handleSearch();
            }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#1f2937" }}>
                Search an application
              </Typography>
             
              

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
                  gap: 2,
                  alignItems: "start",
                  maxWidth: 400,
                  width: "100%",
                }}
              >
                <CustomTextField
                  fullWidth
                  placeholder="Search Application"
                  value={searchValue}
                  onChange={handleSearchChange}
                  sx={{ ...fieldStylesEdit }}
                  error={searchValue.length > 0 && searchValue.length < 10}
                  helperText={
                    searchValue.length > 0 && searchValue.length < 10
                      ? "Application ID must be 10 alphanumeric characters"
                      : ""
                  }
                />

                <CustomButton
                  variant="contained"
                  sx={{
                    borderRadius: "50px",
                    px: 4,
                    whiteSpace: "nowrap",
                  }}
                  type="submit"
                  disabled={!isValidSearch}
                >
                  {loading ? "Searching..." : "Search"}
                </CustomButton>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
};
export default SearchApplication;
