import {
  BLOOD_PRESSURE_AND_PULSE_DETAILS_SECTION_LABEL,
  FAMILY_HISTORY_AND_HEALTH_STATUS_SECTION_LABEL,
  HABIT_AND_ADDICTIONS_SECTION_LABEL,
  MEASUREMENT_SECTION_LABEL,
  MER_PULSE_RATE_DETAILS_SUBSECTION_FORM_FIELDS,
  PULSE_RATE_DETAILS_SECTION_LABEL,
} from "./merConfig";

import type {
  MerBloodPressureAndPulsePayload,
  MerFamilyHistoryPayload,
  MerHabitAndAddictionsPayload,
  MerMeasurementPayload,
  MerPrimaryPayload,
  MerQuestionTablePayload,
  MerRequest,
} from "./mer.types";

const normalize = (value?: string) =>
  (value ?? "").trim().toLowerCase();

const toNumber = (value?: string): number | undefined => {
  if (!value?.trim()) {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
};

const yesNoToIndicator = (value?: string): string => {
  const normalized = normalize(value);

  if (normalized === "yes" || normalized === "y") {
    return "Y";
  }

  if (normalized === "no" || normalized === "n") {
    return "N";
  }

  return "";
};

/**
 * MER primary section
 */
export const mapMerPrimaryPayload = (
  values: Record<string, string>,
): MerPrimaryPayload => ({
  firstName: values.firstName ?? "",

  lastName: values.lastName ?? "",

  sameProposalName: yesNoToIndicator(
    values.isMerNameSameAsProposalName,
  ),

  genderCode: values.gender ?? "",

  educationCode: values.examineeEducationSd ?? "",

  occupationCode: values.examineeOccupationSd ?? "",

  incomeCode: values.examineeIncomeSd ?? "",

  dateOfBirth: values.examineeDob ?? "",

  anyDeclPostPolicy: yesNoToIndicator(
    values.anyPreviousLifeInsurancePolicyDeclinePostponeOrIssuedOnRevisedTermSd,
  ),

  photoIdChecked: yesNoToIndicator(
    values.isIdentityProofAndApplicationPhotoMatch,
  ),

  examineePhotoidProof: values.examineePhotoIdProof ?? "",

  examineeContactNo: values.examineeContactNo ?? "",

  faceMatchScore: values.faceMatchScore ?? "",

  examinerName: values.nameOfMe ?? "",

  meCode: values.meCode ?? "",

  examDate: values.dateOfExamination ?? "",

  examTime: values.examTime || undefined,

  examPlace: values.placeOfExamination ?? "",

  centreName: values.diagnosticCentreName ?? "",

  centreAddress: values.diagnosticCentreAddress ?? "",

  pincode: values.diagnosticCentrePincode ?? "",
});

/**
 * Habit & addictions
 */
export const mapMerHabitAndAddictionsPayload = (
  values: Record<string, string>,
): MerHabitAndAddictionsPayload => {
  const habits = [
    {
      substanceCode: "TOBACCO",
      indicator: yesNoToIndicator(values.cigarettesBeedisCigar),
      quantity: values.cigarettesBeedisCigarQuant || undefined,
      startYear: toNumber(values.cigarettesBeedisCigarYear),
    },

    {
      substanceCode: "GUTKA",
      indicator: yesNoToIndicator(values.gutkaSnuffPaan),
      quantity: values.gutkaSnuffPaanQuant || undefined,
      startYear: toNumber(values.gutkaSnuffPaanYear),
    },

    {
      substanceCode: "NARCOTICS",
      indicator: yesNoToIndicator(values.narcoticConsumption),
      quantity: values.narcoticConsumptionQuant || undefined,
      startYear: toNumber(values.narcoticConsumptionYear),
    },

    {
      substanceCode: "ALCOHOL",
      indicator: yesNoToIndicator(values.beerWineHardLiquor),
      quantity: values.beerWineHardLiquorQuant || undefined,
      startYear: toNumber(values.beerWineHardLiquorYear),
    },
  ];

  return {
    habits: habits.map((habit) => {
      if (habit.indicator === "Y") {
        return {
          substanceCode: habit.substanceCode,
          indicator: habit.indicator,
          quantity: habit.quantity,
          startYear: habit.startYear,
        };
      }

      return {
        substanceCode: habit.substanceCode,
        indicator: habit.indicator,
      };
    }),
  };
};

/**
 * Measurement
 */
export const mapMerMeasurementPayload = (
  values: Record<string, string>,
): MerMeasurementPayload => ({
  heightCm: toNumber(values.heightCms) ?? 0,
  weightKg: toNumber(values.weightKgs) ?? 0,
  waistCm: toNumber(values.waistCms) ?? 0,
  hipsCm: toNumber(values.hipsCms) ?? 0,
});

/**
 * Family history
 */
export const mapMerFamilyHistoryPayload = (
  values: Record<string, string>,
): MerFamilyHistoryPayload => {
  const members: MerFamilyHistoryPayload["members"] = [];

  members.push({
    relationType: "FATHER",
    memberAge: toNumber(values.fatherAge),
    healthStatusDesc: values.fatherHealthStatus || undefined,
    aliveStatus: values.fatherDeadOrAlive || undefined,
  });

  members.push({
    relationType: "MOTHER",
    memberAge: toNumber(values.motherAge),
    healthStatusDesc: values.motherHealthStatus || undefined,
    aliveStatus: values.motherDeadOrAlive || undefined,
  });

  if (values.otherRelation) {
    members.push({
      relationType: values.otherRelation,
      memberAge: toNumber(values.otherAge),
      healthStatusDesc: values.otherHealthStatus || undefined,
      aliveStatus: values.otherDeadOrAlive || undefined,
    });
  }

  return {
    members,
  };
};

/**
 * Blood pressure & pulse
 */
export const mapMerBloodPressureAndPulsePayload = (
  values: Record<string, string>,
): MerBloodPressureAndPulsePayload => {
  const readings: MerBloodPressureAndPulsePayload["readings"] = [];

  for (let sequence = 1; sequence <= 3; sequence += 1) {
    const systolic = toNumber(values[`systolic${sequence}`]);
    const diastolic = toNumber(values[`diastolic${sequence}`]);

    if (systolic === undefined && diastolic === undefined) {
      continue;
    }

    readings.push({
      readingSeq: sequence,
      bpSystolic: systolic ?? 0,
      bpDiastolic: diastolic ?? 0,

      ...(values[`readingTime${sequence}`]
        ? {
            readingTime: values[`readingTime${sequence}`],
          }
        : {}),
    });
  }

  return {
    pulseRate: toNumber(values.pulseRate) ?? 0,

    pulseRemark: values.pulseRemarks ?? "",

    pulseOtherRemark:
      values.pulseOtherRemark || undefined,

    readings,
  };
};

/**
 * Question table
 */
export const mapMerQuestionTablePayload = (
  values: Record<string, string>,
): MerQuestionTablePayload => ({
  answers: MER_PULSE_RATE_DETAILS_SUBSECTION_FORM_FIELDS.map(
    (field) => {
      const value = yesNoToIndicator(values[field.id]);

      const remark = values[`${field.id}_remark`];

      return {
        questionId: field.id,
        questionValue: value,

        ...(remark
          ? {
              remark,
            }
          : {}),
      };
    },
  ),
});

/**
 * Build complete MER request.
 *
 * IMPORTANT:
 * Only the currently selected subsection is added
 * to `sections`.
 */
export const buildMerRequest = ({
  applicationNumber,
  partyId,
  createdBy,
  selectedSubSection,
  values,
}: {
  applicationNumber: string;
  partyId: string;
  createdBy: string;
  selectedSubSection?: string;
  values: Record<string, string>;
}): MerRequest => {
  const normalizedSection = normalize(selectedSubSection);

  const request: MerRequest = {
    applicationNumber,
    partyId,
    createdBy,
    sections: {},
  };

  /**
   * Primary MER
   *
   * When no subsection is selected, treat it as MER.
   */
  if (!normalizedSection || normalizedSection === "mer") {
    request.sections.mer = mapMerPrimaryPayload(values);

    return request;
  }

  /**
   * Habit & addictions
   */
  if (
    normalizedSection ===
      normalize(HABIT_AND_ADDICTIONS_SECTION_LABEL) ||
    normalizedSection === "habbit and adictions"
  ) {
    request.sections.habit_and_addictions =
      mapMerHabitAndAddictionsPayload(values);

    return request;
  }

  /**
   * Measurement
   */
  if (
    normalizedSection ===
      normalize(MEASUREMENT_SECTION_LABEL) ||
    normalizedSection === "measurements"
  ) {
    request.sections.measurement =
      mapMerMeasurementPayload(values);

    return request;
  }

  /**
   * Family history
   */
  if (
    normalizedSection ===
      normalize(
        FAMILY_HISTORY_AND_HEALTH_STATUS_SECTION_LABEL,
      )
  ) {
    request.sections.family_history =
      mapMerFamilyHistoryPayload(values);

    return request;
  }

  /**
   * Blood pressure & pulse
   */
  if (
    normalizedSection ===
      normalize(
        BLOOD_PRESSURE_AND_PULSE_DETAILS_SECTION_LABEL,
      ) ||
    normalizedSection === "blood pressure details"
  ) {
    request.sections.blood_pressure_and_pulse =
      mapMerBloodPressureAndPulsePayload(values);

    return request;
  }

  /**
   * Question table
   */
  if (
    normalizedSection ===
      normalize(PULSE_RATE_DETAILS_SECTION_LABEL) ||
    normalizedSection === "pulse rate details" ||
    normalizedSection === "question table"
  ) {
    request.sections.question_table =
      mapMerQuestionTablePayload(values);

    return request;
  }

  return request;
};