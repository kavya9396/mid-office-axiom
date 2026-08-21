import { Box, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import CustomButton from "../../components/ui/Button/Button";
import { getGrievanceRaisePath } from "../../routes/routes";


const UWToolkit = () => {
  const navigate = useNavigate();
  const { businessType, applicationNumber } = useParams();
  const roleType = localStorage.getItem("roleType") ?? "";
  const safeBusinessType = businessType ?? "retail";
  const safeApplicationNumber = applicationNumber ?? "";

const uwToolkitLinks = [
  {
    label: "UW ChatBot",
    path: "/chatbot",
    roles: ["CUW_TAK", "HOD_TASK","SR_UW_TASK","CMO_TASK","GUW_TASK"],
  },
  {
    label: "Calculator",
    path: "/calculator",
    roles:["CUW_TAK", "HOD_TASK","SR_UW_TASK","CMO_TASK","GUW_TASK"],
  },
  {
    label: "Raise a Grievance",
    path: safeApplicationNumber
      ? getGrievanceRaisePath(safeBusinessType, safeApplicationNumber)
      : "",
    roles: ["CPT_DATA_ENTRY_NMR_TASK","CPT_DATA_ENTRY_MR_TASK"],
  },
].filter((link) => link.roles.includes(roleType));
  
  return (
    <Box
      sx={{
        boxShadow: 2,
        mt: 2,
        backgroundColor: "#ffffff",
        width: "100%",
        p: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
        }}
      >
        <Typography
          component="span"
          sx={{
            fontSize: "14px",
            fontWeight: 700,
            color: "#1E1E1E",
          }}
        >
          UW Toolkit
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 1,
          }}
        >
          {uwToolkitLinks.map((link) => (
            <CustomButton
              key={link.label}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: "50px",
              }}
              onClick={() => {
                if (!link.path) return;
                navigate(link.path, {
                  state: {
                    applicationNumber,
                    businessType: safeBusinessType,
                  },
                });
              }}
            >
              {link.label}
            </CustomButton>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default UWToolkit;
