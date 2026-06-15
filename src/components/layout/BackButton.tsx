import { Box, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { KeyLeftArrowIcon } from "../../icons/Icons";
import CustomButton from "../ui/Button/Button";

type BackButtonProps = {
  to?: string;
  label?: string;
  onClick?: () => void;
  underline?: boolean;
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
};

const BackButton = ({
  to = "/",
  label = "Back",
  onClick,
  underline = true,
  justify = "flex-start",
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) return onClick();
    navigate(to);
  };

  return (
    <Container disableGutters>
      <Box sx={{ display: "flex", justifyContent: justify, my: 2 }}>
        <CustomButton
          variant="text"
          size="small"
          onClick={handleClick}
          sx={{
            textTransform: "none",
            minWidth: 42,
            ...(underline && { textDecoration: "underline" }),
          }}
        >
          <KeyLeftArrowIcon />
          {label}
        </CustomButton>
      </Box>
    </Container>
  );
};

export default BackButton;