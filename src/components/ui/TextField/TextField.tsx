import { TextField, type TextFieldProps } from "@mui/material";

const inputStyles: TextFieldProps["sx"] = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",


    "&:hover fieldset": {
      borderColor: "#9A2529",
    },

    "&.Mui-focused fieldset": {
        "& .MuiOutlinedInput-input[type='date']": {
          fontStyle: "normal",
          cursor: "pointer",
          fontSize: "14px",
        },
        "& .MuiOutlinedInput-input[type='date']::-webkit-calendar-picker-indicator": {
          cursor: "pointer",
          opacity: 0.7,
          transition: "opacity 0.2s",
        },
        "& .MuiOutlinedInput-input[type='date']::-webkit-calendar-picker-indicator:hover": {
          opacity: 1,
        },
        "& input[type='date']": {
          fontStyle: "normal",
        },
      borderColor: "#9A2529",
    },
  },
};

type CustomTextFieldProps = TextFieldProps;

const CustomTextField = ({
  sx,
  size = "small",
  variant = "outlined",
  ...props
}: CustomTextFieldProps) => {
  return (
    <TextField
      size={size}
      variant={variant}
      sx={{
        ...inputStyles,
        ...sx,
      }}
      {...props}
    />
  );
};

export default CustomTextField;