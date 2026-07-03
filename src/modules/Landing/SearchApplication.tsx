import { Box, Paper, Typography } from "@mui/material";
import { columnFlex } from "../../utils/styles";
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

interface SearchApplicationPageProps {
  data: SearchResponse;
}

const SearchApplicationPage = ({
  data,
}: SearchApplicationPageProps) => {
  const navigate = useNavigate();
  const { businessType } = useParams();
  const safeBusinessType = String(businessType ?? "retail").toLowerCase();
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
  }

  return (
    <>
    <Box sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          width: "100%",
          maxWidth: 900,
          mx: "auto",
          pt: 2,
        }}>
            <CustomAccordion
              title={`Application Details - ${data.applicationDetails?.applicationId}`}
              defaultExpanded
            >
              <Box sx={{ p: 2, backgroundColor: "#f6f6f6", mt: 1 }}>
                {applicationDetailsItems.length > 0 ? (
                  <GridSection columns={5} items={applicationDetailsItems} />
                ) : (
                  <Typography>No record found!</Typography>
                )}
              </Box>
            </CustomAccordion>
          </Box>
          <Box sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          width: "100%",
          maxWidth: 900,
          mx: "auto",
          pt: 2,
        }}>
            <RequirementManagement requirements={data.requirements} />
          </Box>
          <Box sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          width: "100%",
          maxWidth: 900,
          mx: "auto",
          pt: 2,
        }}>
            <AuditTrailAccordion auditTrail={data.auditTrail} />
          </Box>
          <Box
            sx={{
               display: "flex",
               justifyContent:"center",
          alignItems: "center",
           gap: 2,
              mt: 2,
              backgroundColor: "#ffffff",
              width: "100%",
              mx: "auto",
            }}
          >
            <Box sx={{ display: "flex", gap: 2 ,alignItems: "center"}}>
              <>
                <CustomButton
                  variant="outlined"
                  sx={{
                    borderRadius: "50px",
                    px: 8,
                    py: 1,
                    width: "280px",
                  }}
                  onClick={handleUDSDocument}
                >
                  View UDS Document
                </CustomButton>
                <CustomButton
                  variant="contained"
                  onClick={() => navigate(getDRSPath(safeBusinessType, data.applicationDetails.applicationId))}
                  sx={{
                    borderRadius: "50px",
                    px: 8,
                    py: 1,
                    width: "280px",
                  }}
                >
                  View DRS Sheet
                </CustomButton>
              </>
            </Box>
          </Box>
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
    <Paper
      sx={{
        height: "100%",
        width: "100%",
        ...columnFlex,
        borderRadius: "0 0 20px 20px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          width: "100%",
          maxWidth: 600,
          mx: "auto",
          pt: 2,
        }}
      >
        <CustomTextField
          fullWidth
          placeholder="Search Application"
          value={searchValue}
          onChange={handleSearchChange}
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
            height: "40px",
            whiteSpace: "nowrap",
          }}
          type="button"
          disabled={!isValidSearch}
          onClick={handleSearch}
        >
          {loading ? "Searching..." : "Search"}
        </CustomButton>
      </Box>
      {applicationData && (
  <SearchApplicationPage data={applicationData} />
)}
    </Paper>
  );
};
export default SearchApplication;
