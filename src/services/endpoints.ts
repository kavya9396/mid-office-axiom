const env = import.meta.env as Record<string, string | undefined>;

const getEndpoint = (envKey: string, fallback: string) => env[envKey] ?? fallback;

export const apiEndpoints = {
  medicalView: getEndpoint("VITE_API_MEDICAL_VIEW_URL", "/api/medical/view"),
  merSubmit: getEndpoint("VITE_API_MEDICAL_MER_SUBMIT_URL", "/api/medical/mer/submit"),
  specialMedicalSubmit: getEndpoint("VITE_API_MEDICAL_SPECIAL_SUBMIT_URL", "/api/medical/special/submit"),
  otherMedicalSubmit: getEndpoint("VITE_API_MEDICAL_OTHER_SUBMIT_URL", "/api/medical/other/submit"),
  financialView: getEndpoint("VITE_API_FINANCIAL_VIEW_URL", "/api/financial/view"),
  grievanceView: getEndpoint("VITE_API_GRIEVANCE_VIEW_URL", "/api/grievance/view"),
  grievanceSubmit: getEndpoint("VITE_API_GRIEVANCE_SUBMIT_URL", "/api/grievance/submit"),
};
