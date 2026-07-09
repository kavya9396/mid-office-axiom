import { Box, Container, Paper, Stack, Typography } from "@mui/material";
import { fieldStylesEdit } from "../../utils/styles";
import CustomTextField from "../../components/ui/TextField/TextField";
import CustomButton from "../../components/ui/Button/Button";
import { useState } from "react";
import type { SearchResponse } from "../../types/search.types";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { searchThunk } from "../../store/thunks/searchAppThunk";
import CustomAccordion from "../../components/ui/Accordion/Accordion";
import { applicationDetailsFields } from "../../utils/constant";
import { GridSection } from "../../components/layout/GridSection";
import RequirementManagement from "../DRS/DRS_Accordions/RequirementManagement";
import AuditTrailAccordion from "../DRS/DRS_Accordions/AuditTrail";
import { getDRSPath } from "../../routes/routes";
import { useNavigate, useParams } from "react-router-dom";

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

interface SearchApplicationPageProps {
  data: SearchResponse;
}

const SearchApplicationPage = ({
  data,
}: SearchApplicationPageProps) => {
  const navigate = useNavigate();
  const { businessType } = useParams();
  const safeBusinessType = String(businessType ?? "retail").toLowerCase();
  const applicationId = data.applicationDetails?.applicationId ?? "";
  const applicationDetailsItems = data.applicationDetails
    ? applicationDetailsFields.map(({ label, key }) => ({
      label,
      value: String(data.applicationDetails[key] ?? ""),
    }))
    : [];

  const handleUDSDocument = () => {
    if (data.udsLink) {
      window.open(data.udsLink, "_blank");
    }
  };

  return (

    <>
      <Container disableGutters>
        <CustomAccordion
          title={`Application Details - ${applicationId || "Unknown"}`}
          defaultExpanded
        >
          <Box sx={{ p: 2, backgroundColor: "#f8fafc", mt: 1, borderRadius: 2 }}>
            {applicationDetailsItems.length > 0 ? (
              <GridSection columns={5} items={applicationDetailsItems} />
            ) : (
              <Typography sx={{ color: "text.secondary" }}>No record found!</Typography>
            )}
          </Box>
        </CustomAccordion>
        <RequirementManagement requirements={data.requirements} />
        <AuditTrailAccordion auditTrail={data.auditTrail} />
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            justifyContent: "center",
            my: 2
          }}
        >
          <CustomButton
            variant="outlined"
            sx={{
              borderRadius: "50px",
              px: 6,
              py: 1,
              minWidth: { xs: "100%", sm: "280px" },
            }}
            onClick={handleUDSDocument}
            disabled={!data.udsLink}
          >
            View UDS Document
          </CustomButton>
          <CustomButton
            variant="contained"
            onClick={() => navigate(getDRSPath(safeBusinessType, applicationId))}
            sx={{
              borderRadius: "50px",
              px: 6,
              py: 1,
              minWidth: { xs: "100%", sm: "280px" },
            }}
            disabled={!applicationId}
          >
            View DRS Sheet
          </CustomButton>
        </Box>
      </Container>
    </>
  );
};
const SearchApplication = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [searchValue, setSearchValue] = useState("");

  const [applicationData, setApplicationData] =
    useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const filteredValue = value.replace(/[^a-zA-Z0-9]/g, "");
    if (filteredValue.length <= 10) {
      setSearchValue(filteredValue);
    }
  };

  const isValidSearch = searchValue.length === 10;
  const handleSearch = async () => {
    try {
      setLoading(true);

      const response = await dispatch(
        searchThunk({
          applicationId: searchValue,
        })
      ).unwrap();

      setApplicationData(response);
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
              <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 760 }}>
                Enter a 10-character alphanumeric application ID to retrieve the application summary,
                requirements, and audit trail.
              </Typography>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Use only letters and numbers. Special characters are removed automatically.
                </Typography>
              </Box>

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

          {applicationData && <SearchApplicationPage data={applicationData} />}
        </Stack>
      </Container>
    </Box>
  );
};
export default SearchApplication;
