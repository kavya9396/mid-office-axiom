import { Box, Typography } from "@mui/material";
import type { MedicalFinalConfigField } from "./otherMedicalsConfig";

type OtherMedicalsFormProps = {
  selectedSubSection?: string;
  fields: MedicalFinalConfigField[];
};

const OtherMedicalsForm = ({ selectedSubSection, fields }: OtherMedicalsFormProps) => {
  return (
    <Box>
      <Typography sx={{ fontSize: 16, fontWeight: 700, color: "#1F2937", mb: 1 }}>
        {selectedSubSection ?? "Other Medicals"}
      </Typography>
      <Typography sx={{ color: "#667085", fontSize: 13 }}>
        Other Medicals form details will be rendered from config in the next iteration.
      </Typography>
      <Typography sx={{ color: "#344054", fontSize: 12, mt: 1 }}>
        Config fields available: {fields.length}
      </Typography>
    </Box>
  );
};

export default OtherMedicalsForm;
