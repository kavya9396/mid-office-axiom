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

type BaseSelectProps = {
  label?: string;
  options: Option[];
  placeholder?: string;
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
};

type SingleSelectProps = BaseSelectProps & {
  multiple?: false;
  value?: string;
  onChange?: (value: string) => void;
  renderValue?: (value: string) => React.ReactNode;
  maxCount?: never;
};

type MultipleSelectProps = BaseSelectProps & {
  multiple: true;
  value?: string[];
  onChange?: (value: string[]) => void;
  renderValue?: (value: string[]) => React.ReactNode;
  maxCount?: number;
};

type CustomSelectProps = SingleSelectProps | MultipleSelectProps;

export default function CustomSelect(props: CustomSelectProps) {
  const {
    label,
    value,
    onChange,
    options,
    placeholder = "Select",
    renderValue,
    fullWidth = true,
    error = false,
    helperText,
    disabled = false,
    multiple = false,
  } = props;
  
  const maxCount = multiple ? props.maxCount : undefined;

  const handleChange = (e: SelectChangeEvent<string | string[]>) => {
    const newValue = e.target.value;
    
    if (multiple && Array.isArray(newValue) && maxCount) {
      // Limit selections to maxCount
      if (newValue.length <= maxCount) {
        (onChange as ((value: string[]) => void) | undefined)?.(newValue);
      }
    } else if (multiple && Array.isArray(newValue)) {
      (onChange as ((value: string[]) => void) | undefined)?.(newValue);
    } else if (!multiple && typeof newValue === 'string') {
      (onChange as ((value: string) => void) | undefined)?.(newValue);
    }
  };

  const defaultRenderValue = (selected: string | string[]) => {
    if (!selected || (Array.isArray(selected) && selected.length === 0)) {
      return (
        <span style={{ color: "#9ca3af" }}>
          {placeholder}
        </span>
      );
    }

    const truncateLabel = (label: string) => {
      return label.length > 10
        ? `${label.slice(0, 10)}...`
        : label;
    };

    if (Array.isArray(selected)) {
      return selected
        .map((value) => {
          const option = options.find(
            (opt) => opt.value === value
          );

          return truncateLabel(option?.label ?? value);
        })
        .join(", ");
    }

    const selectedOption = options.find(
      (opt) => opt.value === selected
    );

    return truncateLabel(selectedOption?.label ?? selected);
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
          value={value ?? (multiple ? [] : "")}
          disabled={disabled}
          displayEmpty
          multiple={multiple}
          onChange={handleChange}
          renderValue={(renderValue || defaultRenderValue) as (value: string | string[]) => React.ReactNode}
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
          {!multiple && (
            <MenuItem value="" disabled>
              {placeholder}
            </MenuItem>
          )}

          {options.map((option) => {
            const isDisabled = Boolean(
              option.disabled || 
              (multiple && 
               maxCount && 
               Array.isArray(value) && 
               value.length >= maxCount && 
               !value.includes(option.value))
            );
            
            return (
              <MenuItem
                key={option.value}
                value={option.value}
                disabled={isDisabled}
              >
                {option.label}
              </MenuItem>
            );
          })}
        </Select>
        {!!helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    </div>
  );
}