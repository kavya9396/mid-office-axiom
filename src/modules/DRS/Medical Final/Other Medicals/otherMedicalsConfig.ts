import { otherMedicalViewFieldConfig } from "../../Medical/otherMedicalViewFieldConfig";

export type MedicalFinalConfigField = {
  id: string | number;
  section: string;
  field: string;
};

export const getOtherMedicalsConfig = (): MedicalFinalConfigField[] =>
  otherMedicalViewFieldConfig.map((field) => ({
    id: field.id,
    section: field.section,
    field: field.field,
  }));
