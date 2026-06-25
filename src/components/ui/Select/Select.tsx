import {
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

type Option = {
  label: string;
  value: string;
  disabled?: boolean;
};

type CustomSelectProps = {
  label?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Option[];

  placeholder?: string;
  renderValue?: (value: string) => React.ReactNode;

  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
};

export default function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  renderValue,
  fullWidth = true,
  error = false,
  helperText,
}: CustomSelectProps) {
  const handleChange = (e: SelectChangeEvent) => {
    onChange?.(e.target.value);
  };

  const defaultRenderValue = (selected: string) => {
    if (!selected) {
      return <span style={{ color: "#9ca3af" }}>{placeholder}</span>;
    }

    const selectedOption = options.find(
      (opt) => opt.value === selected
    );

    return selectedOption?.label ?? selected;
  };

  return (
    <div>
      {label && (
        <Typography
          sx={{
            fontSize: "14px",
            fontWeight: 400,
            color: "#444",
            mb: 1,
          }}
        >
          {label}
        </Typography>
      )}

      <FormControl fullWidth={fullWidth} error={error}>
        <Select
          value={value ?? ""}
          displayEmpty
          onChange={handleChange}
          renderValue={renderValue || defaultRenderValue}
          sx={{
            height: 40,
            borderRadius: "8px",
            backgroundColor: "#fff",
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(0, 0, 0, 0.23)",
            },

            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#9A2529",
            },

            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#9A2529",
              borderWidth: "2px",
            },

            "& .MuiSelect-select": {
              px: 2,
              py: 1,
            },
          }}
        >
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>

          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {!!helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </div>
  );
}