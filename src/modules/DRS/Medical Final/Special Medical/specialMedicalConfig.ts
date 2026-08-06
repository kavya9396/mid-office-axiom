import { specialMedicalViewFieldConfig } from "../../Medical/specialMedicalViewFieldConfig";

export type MedicalFinalConfigField = {
  id: string | number;
  section: string;
  field: string;
};

export const getSpecialMedicalConfig = (): MedicalFinalConfigField[] =>
  specialMedicalViewFieldConfig.map((field) => ({
    id: field.id,
    section: field.section,
    field: field.field,
  }));
