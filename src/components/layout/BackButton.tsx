import { Box, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { KeyLeftArrowIcon } from "../../icons/Icons";
import CustomButton from "../ui/Button/Button";
import type { ReactNode } from "react";

type BackButtonProps = {
  to?: string;
  label?: string;
  onClick?: () => void;
  underline?: boolean;
  justify?: "flex-start" | "center" | "flex-end" | "space-between";
  rightSlot?: ReactNode;
};

const BackButton = ({
  to = "/",
  label = "Back",
  onClick,
  underline = true,
  justify = "flex-start",
  rightSlot,
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) return onClick();
    navigate(to);
  };

  return (
    <Container disableGutters>
      <Box sx={{ display: "flex", justifyContent: justify, alignItems: "center", m: 0, pt: 1 }}>
        <CustomButton
          variant="text"
          size="small"
          onClick={handleClick}
          sx={{
            textTransform: "none",
            minWidth: 42,
            m:0,
            p:0,
            ...(underline && { textDecoration: "underline" }),
          }}
        >
          <KeyLeftArrowIcon />
          {label}
        </CustomButton>

        {rightSlot}
      </Box>
    </Container>
  );
};

export default BackButton;