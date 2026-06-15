import { Checkbox, FormControlLabel, Typography } from "@mui/material";

type CustomCheckboxProps = {
  label: string;
  checked?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function CustomCheckbox({
  label,
  checked,
  onChange,
}: CustomCheckboxProps) {
  return (
    <FormControlLabel
      control={
        <Checkbox
          size="small"
          checked={checked}
          onChange={onChange}
          sx={{
            "&.Mui-checked": {
              color: "#E77817",
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