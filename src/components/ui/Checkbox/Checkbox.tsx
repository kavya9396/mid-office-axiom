import { Checkbox, FormControlLabel, Typography } from "@mui/material";

type CustomCheckboxProps = {
  label: string;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
};

export default function CustomCheckbox({
  label,
  checked,
  onChange,
  disabled,
}: CustomCheckboxProps) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          sx={{
            "&.Mui-checked": {
              color: "#063E6F",
            },
          }}
        />
      }
      label={
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      }
    />
  );
}