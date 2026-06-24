import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import CustomButton from "../../components/ui/Button/Button";

const uwToolkitLinks = ["UW ChatBot", "Calculator", "Raise a Grievance"];

const UWToolkit = () => {
const navigate = useNavigate();
  const redirectTo = (link: string) => {
    if(link == "Raise a Grievance"){
      navigate("/grievance/raise");
    }
  }
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
            fontSize: "20px",
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
              key={link}
              variant="outlined"
              size="small"
              sx={{
                borderRadius: "50px",
              }}
              onClick={() => redirectTo(link)}
            >
              {link}
            </CustomButton>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default UWToolkit;
