import { createApiThunk } from "./createApiThunk";
import { url } from "../../services/apiConfig";
import type { MerPrimaryPayload, MerRequest } from "../../modules/DRS/Medical Final/MER/mer.types";

export type MerSaveResponse = {
  response_code?: number;
  error?: boolean;
  message?: string;
  data?: {
    applicationNumber?: string;
    partyId?: string;
    clientType?: string;
    medAppDtlId?: number;
    examId?: number;

    sections?: {
      mer?: MerPrimaryPayload & {
        headerStatus?: string;
        examStatus?: string;
        medAppDtlId?: number;
        examId?: number;
      };

      habit_and_addictions?: {
        habits?: Array<{
          applicationNumber?: string;
          partyId?: string;
          substanceCode?: string;
          indicator?: string;
          quantity?: string | null;
          startYear?: number | null;
        }>;
        rowsInserted?: number;
        rowsUpdated?: number;
        examId?: number;
      };

      measurement?: {
        heightCm?: number | null;
        weightKg?: number | null;
        waistCm?: number | null;
        hipsCm?: number | null;
        bmiCalculated?: number | string | null;
        heightFtsCalculated?: number | string | null;
        heightInchCalculated?: number | string | null;
        examId?: number;
        status?: string;
      };

      family_history?: {
        members?: Array<{
          applicationNumber?: string;
          partyId?: string;
          relationType?: string;
          memberAge?: number | null;
          healthStatusDesc?: string;
          aliveStatus?: string;
        }>;
        rowsInserted?: number;
        rowsUpdated?: number;
      };

      blood_pressure_and_pulse?: {
        pulseRate?: number | null;
        pulseRemark?: string;
        pulseOtherRemark?: string;
        readings?: Array<{
          applicationNumber?: string;
          partyId?: string;
          readingSeq?: number;
          bpSystolic?: number | null;
          bpDiastolic?: number | null;
          readingTime?: string;
        }>;
        avgSystolicCalculated?: number | string | null;
        avgDiastolicCalculated?: number | string | null;
        examId?: number;
      };

      question_table?: {
        answers?: Array<{
          applicationNumber?: string;
          partyId?: string;
          questionId?: string;
          questionValue?: string;
          remark?: string | null;
        }>;
        rowsInserted?: number;
        rowsUpdated?: number;
      };
    };
  };
};

export const saveMerThunk = createApiThunk<
  MerSaveResponse,
  MerRequest
>(
  "medical/save",
  {
    url: url("medicalMerSaveAndCalculate"),
    method: "POST",
  },
);