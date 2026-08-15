import { TextField, type TextFieldProps } from "@mui/material";

type CustomTextFieldProps = TextFieldProps & {
  htmlInputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

const inputStyles: TextFieldProps["sx"] = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",

    "&:hover fieldset": {
      borderColor: "#9A2529",
    },

    "&.Mui-focused fieldset": {
      borderColor: "#9A2529",
    },

    "& input[type='date']": {
      fontStyle: "normal",
      fontSize: "14px",
      cursor: "pointer",
    },

    "& input[type='date']::-webkit-calendar-picker-indicator": {
      cursor: "pointer",
      opacity: 0.7,
      transition: "opacity 0.2s",
    },

    "& input[type='date']::-webkit-calendar-picker-indicator:hover": {
      opacity: 1,
    },
  },
};

const CustomTextField = ({
  sx,
  size = "small",
  variant = "outlined",
  htmlInputProps,
  ...props
}: CustomTextFieldProps) => {
  return (
    <TextField
      {...props}
      size={size}
      variant={variant}
      slotProps={{
        htmlInput: htmlInputProps,
      }}
      sx={{
        ...inputStyles,
        ...sx,
      }}
    />
  );
};

export default CustomTextField;