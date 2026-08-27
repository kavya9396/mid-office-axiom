import { Box } from "@mui/material";
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
  rightSlot,
}: BackButtonProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) return onClick();
    navigate(to);
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        px: 1,
        py: 1.5,
      }}
    >
      {/* Left */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        <CustomButton
          variant="text"
          size="small"
          onClick={handleClick}
          sx={{
            textTransform: "none",
            minWidth: 42,
            m: 0,
            p: 0,
            color: "#9A2529",
            fontWeight: 600,
            ...(underline && {
              textDecoration: "underline",
            }),
          }}
        >
          <KeyLeftArrowIcon />
          {label}
        </CustomButton>
      </Box>

      {/* Center */}
      {rightSlot && (
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "max-content",
            maxWidth: "calc(100% - 180px)",
          }}
        >
          {rightSlot}
        </Box>
      )}
    </Box>
  );
};

export default BackButton;