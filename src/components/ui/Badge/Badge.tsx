import Chip from "@mui/material/Chip";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactElement } from "react";

export type BadgeVariant = "Low" | "Medium" | "High" | "Neutral";

type BadgeProps = {
  label: string;
  variant?: BadgeVariant;
  icon?: ReactElement;
  size?: "small" | "medium";
  sx?: SxProps<Theme>;
};

const variantColors: Record<
  BadgeVariant,
  { bg: string; color: string; border?: string }
> = {
  Low: {
    bg: "#E7F7ED",
    color: "#218311",
  },
  Medium: {
    bg: "#FFF4DB",
    color: "#EA7617",
  },
  High: {
    bg: "#FDE8E8",
    color: "#9A2529",
  },
  Neutral: {
    bg: "#FFFFFF",
    color: "#063E6F",
    border: "1px solid #C6C6C6",
  },
};

export default function Badge({
  label,
  variant = "Neutral",
  icon,
  size = "small",
  sx,
}: BadgeProps) {
  const v = variantColors[variant];

  return (
    <Chip
      icon={icon}
      label={label}
      size={size}
      sx={[
        {
          backgroundColor: v.bg,
          color: v.color,
          border: v.border ?? "none",
          "& .MuiChip-icon": {
            color: "inherit",
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    />
  );
}