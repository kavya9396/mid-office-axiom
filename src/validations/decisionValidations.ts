export interface DecisionValidationData {
  remarks: string;
  caseDecision: string;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export const validateDecision = ({
  remarks,
  caseDecision,
}: DecisionValidationData): ValidationResult => {
  if (!remarks.trim()) {
    return {
      isValid: false,
      message: "Please enter remarks.",
    };
  }

  if (remarks.length > 10000) {
    return {
      isValid: false,
      message: "Remarks cannot exceed 10000 characters.",
    };
  }

  if (!caseDecision.trim()) {
    return {
      isValid: false,
      message: "Please select Case Decision.",
    };
  }

  return {
    isValid: true,
  };
};