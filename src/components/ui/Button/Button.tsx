import { Button, type ButtonProps } from "@mui/material";

type Variant = ButtonProps["variant"];

const getButtonStyles = (variant: Variant) => {
  switch (variant) {
    case "contained":
      return {
        backgroundColor: "#9A2529",
        "&:hover": {
          backgroundColor: "#8f2026",
        },
      };

    case "outlined":
      return {
        borderColor: "#9A2529",
        color: "#9A2529",
        "&:hover": {
          borderColor: "#8f2026",
          backgroundColor: "rgba(176,42,48,0.08)",
        },
      };

    case "text":
      return {
        color: "#9A2529",
        "&:hover": {
          backgroundColor: "rgba(176,42,48,0.08)",
        },
      };

    default:
      return {};
  }
};

type CustomButtonProps = ButtonProps;

const CustomButton = ({ variant = "contained", sx, ...props }: CustomButtonProps) => {
  return (
    <Button
      variant={variant}
      disableElevation
      sx={{
        textTransform: "none",
        minWidth: "auto",
        minHeight: "auto",
        px: 1.25,
        py: 0.5,
        lineHeight: 1.2,
        ...getButtonStyles(variant),
        ...sx,
      }}
      {...props}
    />
  );
};

export default CustomButton;