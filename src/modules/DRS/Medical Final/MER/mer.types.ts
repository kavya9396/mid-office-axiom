export type MerRequest = {
  applicationNumber: string;
  partyId: string;
  createdBy: string;

  sections: Partial<{
    mer: MerPrimaryPayload;
    habit_and_addictions: MerHabitAndAddictionsPayload;
    measurement: MerMeasurementPayload;
    family_history: MerFamilyHistoryPayload;
    blood_pressure_and_pulse: MerBloodPressureAndPulsePayload;
    question_table: MerQuestionTablePayload;
  }>;
};

export type MerPrimaryPayload = {
  firstName: string;
  lastName: string;
  sameProposalName: string;
  genderCode: string;
  educationCode: string;
  occupationCode: string;
  incomeCode: string;
  dateOfBirth: string;
  anyDeclPostPolicy: string;
  photoIdChecked: string;
  examineePhotoidProof: string;
  examineeContactNo: string;
  faceMatchScore: string;
  examinerName: string;
  meCode: string;
  examDate: string;
  examTime?: string;
  examPlace: string;
  centreName: string;
  centreAddress: string;
  pincode: string;
};

export type MerHabitAndAddictionsPayload = {
  habits: Array<{
    substanceCode: string;
    indicator: string;
    quantity?: string;
    startYear?: number;
  }>;
};

export type MerMeasurementPayload = {
  heightCm: number;
  weightKg: number;
  waistCm: number;
  hipsCm: number;
};

export type MerFamilyHistoryPayload = {
  members: Array<{
    relationType: string;
    memberAge?: number;
    healthStatusDesc?: string;
    aliveStatus?: string;
  }>;
};

export type MerBloodPressureAndPulsePayload = {
  pulseRate: number;
  pulseRemark: string;
  pulseOtherRemark?: string;

  readings: Array<{
    readingSeq: number;
    bpSystolic: number;
    bpDiastolic: number;
    readingTime?: string;
  }>;
};

export type MerQuestionTablePayload = {
  answers: Array<{
    questionId: string;
    questionValue: string;
    remark?: string;
  }>;
};