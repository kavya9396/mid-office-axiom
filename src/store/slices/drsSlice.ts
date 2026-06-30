import { createSlice } from "@reduxjs/toolkit";
import type {
  AdditionalRequirementRow,
  ApplicationOverview,
  AuditTrail,
  BreDecisionResponse,
  DRSData,
  MastersData,
  PivvSection,
  RiderDetail,
  SummaryResponse,
} from "../../types/drs.types";
import { drsThunk } from "../thunks/drsThunk";
import { mastersThunk } from "../thunks/mastersThunk";

const toSafeNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapGender = (value?: string): "Male" | "Female" | "Other" => {
  const normalized = value?.trim().toUpperCase();
  if (normalized === "M" || normalized === "MALE") return "Male";
  if (normalized === "F" || normalized === "FEMALE") return "Female";
  return "Other";
};

const mapMaritalStatus = (
  value?: string
): "Single" | "Married" | "Divorced" | "Widowed" => {
  const normalized = value?.trim().toUpperCase();
  if (normalized === "M" || normalized === "MARRIED") return "Married";
  if (normalized === "D" || normalized === "DIVORCED") return "Divorced";
  if (normalized === "W" || normalized === "WIDOWED") return "Widowed";
  return "Single";
};

const calculateAge = (dob?: string): number => {
  if (!dob) return 0;
  const date = new Date(dob);
  if (Number.isNaN(date.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  return age < 0 ? 0 : age;
};

const mapMemberType = (
  lifeType: string | undefined,
  index: number,
  usedMemberTypes: Set<"proposer" | "lifeassured1" | "lifeassured2">
): "proposer" | "lifeassured1" | "lifeassured2" => {
  const normalized = lifeType?.trim().toUpperCase() ?? "";

  if ((normalized.includes("PR") || normalized.includes("PROPOSER")) && !usedMemberTypes.has("proposer")) {
    usedMemberTypes.add("proposer");
    return "proposer";
  }

  if ((normalized.includes("LA") || normalized.includes("LIFE")) && !usedMemberTypes.has("lifeassured1")) {
    usedMemberTypes.add("lifeassured1");
    return "lifeassured1";
  }

  if (!usedMemberTypes.has("proposer") && index === 0) {
    usedMemberTypes.add("proposer");
    return "proposer";
  }

  if (!usedMemberTypes.has("lifeassured1")) {
    usedMemberTypes.add("lifeassured1");
    return "lifeassured1";
  }

  usedMemberTypes.add("lifeassured2");
  return "lifeassured2";
};

interface DrsState {
  data: DRSData | null;
  breDecision: BreDecisionResponse | null;
  summary: SummaryResponse[];
  applicationOverview: ApplicationOverview | null;
  riderDetails: RiderDetail[];
  requirements: AdditionalRequirementRow[];
  auditTrail: AuditTrail;
  pivvSection: PivvSection | null;
  masters: MastersData;
  mastersLoading: "idle" | "loading" | "failed";
  mastersError: string | null;
  loading: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: DrsState = {
  data: null,
  breDecision: null,
  applicationOverview: null,
  summary: [],
  riderDetails: [],
  pivvSection: null,
  requirements: [],
  auditTrail: [],
  masters: {},
  mastersLoading: "idle",
  mastersError: null,
  loading: "idle",
  error: null,
};

const drsSlice = createSlice({
  name: "drs",
  initialState,
  reducers: {
    updateApplicantProfile: (state, action: { payload: SummaryResponse }) => {
      if (state.summary) {
        const index = state.summary.findIndex(
          (item) => item.memberType === action.payload.memberType
        );
        if (index !== -1) {
          state.summary[index] = action.payload;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(drsThunk.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(drsThunk.fulfilled, (state, action) => {
        const responseData = action.payload.data;
        const firstProduct = responseData.productDetail?.[0];
        const requirements = responseData.externalAPIs?.breOutput?.requirements ?? [];
        const usedMemberTypes = new Set<"proposer" | "lifeassured1" | "lifeassured2">();
        const mappedSummary: SummaryResponse[] = (responseData.customerDetails ?? []).map((customer, index) => {
          const personalDetails = customer.personalDetails ?? {};
          const communicationDetails = customer.communicationDetails ?? {};
          const applicantFinancial = (customer.financialDetail ?? {}) as Record<string, unknown>;
          const healthDetail = (customer.healthDetail ?? {}) as Record<string, unknown>;
          const substanceConsumption = Array.isArray(healthDetail["substanceConsumption"])
            ? (healthDetail["substanceConsumption"] as Array<Record<string, unknown>>)
            : [];
          const firstSubstance = substanceConsumption[0] ?? {};
          const addresses = Array.isArray(customer.address) ? customer.address : [];
          const communicationAddress =
            addresses.find((item) => String(item.type).toLowerCase() === "communication") ??
            addresses.find((item) => String(item.type).toLowerCase() === "correspondence") ??
            addresses[0] ??
            {};
          const permanentAddress =
            addresses.find((item) => String(item.type).toLowerCase() === "permanent") ??
            addresses[0] ??
            {};
          const firstDoc = Array.isArray(customer.documentDetails)
            ? customer.documentDetails[0]
            : undefined;
          const dob = String(personalDetails.dob ?? "");
          const memberType = mapMemberType(String(customer.lifeType ?? ""), index, usedMemberTypes);
          const mappedNominees = (responseData.nominee ?? []).map((item) => ({
            nomineeName: [item.firstName, item.lastName].filter(Boolean).join(" "),
            nomineeDOB: item.dob ?? "",
            gender: item.gender ?? "",
            relationship: item.proposerNomineeRelation || item.relationWithLA || "",
            accountNumber: "",
            ifsc: "",
            sharePercentage: toSafeNumber(item.percentage),
            appointeeName: "",
            appointeeGender: "",
            appointeeDOB: "",
          }));

          return {
            memberType,
            proposerSummary: {
              title: "",
              firstName: String(personalDetails.firstName ?? ""),
              middleName: String(personalDetails.middleName ?? ""),
              lastName: String(personalDetails.lastName ?? ""),
              dob,
              age: calculateAge(dob),
              gender: mapGender(String(personalDetails.gender ?? "")),
              profileImage: "",
              caseStatus: responseData.externalAPIs?.breOutput?.systemDecision ?? "",
              document: String(firstDoc?.documentType ?? ""),
              faceMatchPercentage: "",
              imageQuality: "",
              documentRemarks: String(responseData.externalAPIs?.breOutput?.breRemarks ?? ""),
            },
            personalDetails: {
              maritalStatus: mapMaritalStatus(String(personalDetails.maritalStatus ?? "")),
              location: {
                city: String(permanentAddress.city ?? ""),
                country: String(permanentAddress.residingCountry ?? ""),
              },
              occupation: {
                type: String(personalDetails.occupationType ?? ""),
                designation: String(personalDetails.occupationType ?? ""),
                organization: String(personalDetails.orgName ?? ""),
              },
            },
            financialDetails: {
              annualIncome: toSafeNumber(personalDetails.netIncomeAmt),
              appliedSumAssured: toSafeNumber(firstProduct?.sumAssured),
              trsa: toSafeNumber(responseData.applicationInfo?.simultaneousLifeSA),
              tfesa: toSafeNumber(responseData.applicationInfo?.otherPolicySA),
            },
            policyDetails: {
              productName: String(firstProduct?.name ?? ""),
              productType: String(firstProduct?.type ?? ""),
              modalPremium: toSafeNumber(firstProduct?.paymentAmount),
              channel: String(responseData.sourcingDetail?.channelCode ?? ""),
            },
            underwriting: {
              remarks: String(responseData.externalAPIs?.breOutput?.breRemarks ?? ""),
              breDecision: {
                status: String(responseData.externalAPIs?.breOutput?.systemDecision ?? ""),
                category: String(
                  responseData.externalAPIs?.breOutput?.decisionTypes?.breDecision ?? ""
                ),
                coverage: String(
                  responseData.externalAPIs?.breOutput?.decisionTypes?.breAction ?? ""
                ),
              },
            },
            applicantDetails: {
              dateOfBirth: dob,
              gender: mapGender(String(personalDetails.gender ?? "")),
              maritalStatus: mapMaritalStatus(String(personalDetails.maritalStatus ?? "")),
              nationality: String(personalDetails.nationality ?? ""),
              countryOfResidence: String(personalDetails.residentStatus ?? ""),
              education: String(personalDetails.highestQualification ?? ""),
            },
            kycDetails: {
              panNumber: String(personalDetails.panNo ?? ""),
              identityProofType: String(firstDoc?.documentType ?? ""),
              identityProofNumber: String(firstDoc?.documentId ?? ""),
              addressProof: String(firstDoc?.documentName ?? ""),
              incomeProof: "",
              existingCkycNumber: "",
              pep: Boolean(personalDetails.isPEP),
              criminalProceedings: "",
            },
            communicationAddressDetails: {
              addressLine1: String(communicationAddress.addressLine1 ?? ""),
              addressLine2: String(communicationAddress.addressLine2 ?? ""),
              addressLine3: String(communicationAddress.addressLine3 ?? ""),
              landmark: String(communicationAddress.landmark ?? ""),
              city: String(communicationAddress.city ?? ""),
              state: String(communicationAddress.state ?? ""),
              country: String(communicationAddress.residingCountry ?? ""),
              pincode: String(communicationAddress.pinCode ?? ""),
            },
            permanentAddressDetails: {
              addressLine1: String(permanentAddress.addressLine1 ?? ""),
              addressLine2: String(permanentAddress.addressLine2 ?? ""),
              addressLine3: String(permanentAddress.addressLine3 ?? ""),
              landmark: String(permanentAddress.landmark ?? ""),
              city: String(permanentAddress.city ?? ""),
              state: String(permanentAddress.state ?? ""),
              country: String(permanentAddress.residingCountry ?? ""),
              pincode: String(permanentAddress.pinCode ?? ""),
            },
            contactDetails: {
              mobileNumber: String(communicationDetails.mobileNo ?? ""),
              emailId: String(communicationDetails.emailId ?? ""),
              alternateMobile: String(communicationDetails.mobileNo ?? ""),
              landlineNumber: String(communicationDetails.landlineNo ?? ""),
              emailPref: String(communicationDetails.emailPref ?? ""),
              smsPref: String(communicationDetails.smsPref ?? ""),
            },
            applicantFinancialDetails: {
              occupation: String(personalDetails.occupationType ?? ""),
              annualIncome: toSafeNumber(applicantFinancial["annualIncome"] || personalDetails.netIncomeAmt),
              gstin: String(responseData.producerDetails?.gstInNumber ?? ""),
              organisationType: String(personalDetails.orgType ?? ""),
              organisationName: String(personalDetails.orgName ?? ""),
            },
            healthInformation: {
              height: String(healthDetail["height"] ?? ""),
              weight: String(healthDetail["weight"] ?? ""),
              diabetes: "",
              hypertension: "",
              heartDisease: "",
              cancer: "",
              kidneyDisease: "",
              liverDisease: "",
              lungDisease: "",
              neurologicalDisorder: "",
              mentalDisorder: "",
              hivAids: "",
              anySurgery: "",
              hospitalization: "",
              otherIllness: Array.isArray(healthDetail["illnessOrImpairment"])
                ? String((healthDetail["illnessOrImpairment"] as unknown[]).filter(Boolean).join(", "))
                : "",
              familyHeartDisease: "",
              familyCancer: "",
              familyDiabetes: "",
              gynecologicalHistory: "",
              pregnancyHistory: "",
              miscarriageHistory: "",
            },
            lifestyleHabits: {
              alcoholConsumption: "",
              alcoholQuantity: "",
              smoking: String(firstSubstance.substance ?? ""),
              smokingQuantity: String(
                ((firstSubstance.quantity as Record<string, unknown> | undefined)?.amount ?? "")
              ),
              tobaccoGutka: "",
              narcotics: "",
              hazardousOccupation: String(healthDetail["hazardousOccupation"] ?? ""),
              aviationActivities: "",
              diving: "",
              mountaineering: "",
              otherHazardousActivities: "",
              racing: "",
            },
            nominees: mappedNominees,
            genericDetails: {
              existingPolicyNumber: String(responseData.applicationInfo?.spousePolicyNo ?? ""),
              clientId: String(customer.clientId ?? ""),
              selfProposed: String(responseData.applicationInfo?.isLAPropSame ?? ""),
              typeOfProposer: String(responseData.applicationInfo?.proposerType ?? ""),
              relationshipWithLifeAssured: String(customer.proposerLaRelation ?? ""),
              typeOfProposal: String(responseData.applicationInfo?.comboFlag ?? ""),
            },
            eiaDetails: {
              openEIA: "",
              existingEIANumber: "",
              preferredRepository: "",
              convertPolicies: "",
            },
            fundDetails: {
              allocationStrategy: String(responseData.fundDetails?.allocationStrategy ?? ""),
              totalAllocation: String(responseData.fundDetails?.totalAllocation ?? ""),
              atpOpted: String(responseData.fundDetails?.atpOpted ?? ""),
              fundDetail: {
                name: String(responseData.fundDetails?.fundDetail?.[0]?.name ?? ""),
                amount: String(responseData.fundDetails?.fundDetail?.[0]?.amount ?? ""),
                sourceFund: String(responseData.fundDetails?.fundDetail?.[0]?.sourceFund ?? ""),
                targetFund: String(responseData.fundDetails?.fundDetail?.[0]?.targetFund ?? ""),
                switchDate: String(responseData.fundDetails?.fundDetail?.[0]?.switchDate ?? ""),
                transferPercentage: String(
                  responseData.fundDetails?.fundDetail?.[0]?.transferPercentage ?? ""
                ),
              },
            },
          };
        });

        state.loading = "idle";
        state.error = null;
        state.data = responseData;
        state.breDecision = {
          decision:
            responseData.externalAPIs?.breOutput?.decisionTypes?.breDecision ?? null,
          status: responseData.externalAPIs?.breOutput?.systemDecision ?? null,
          remarks: responseData.externalAPIs?.breOutput?.breRemarks ?? null,
          discrepancy:
            responseData.externalAPIs?.breOutput?.decisionTypes?.breRequirement ?? null,
          timestamp:
            responseData.externalAPIs?.breOutput?.systemDecisionDateTime ?? null,
          retrigger: null,
        };
        state.summary = mappedSummary;
        state.applicationOverview = {
          product: {
            name: firstProduct?.name ?? "",
            sumAssured: Number(firstProduct?.sumAssured ?? 0),
            productCode: firstProduct?.code ?? "",
          },
          distribution: {
            channel: responseData.sourcingDetail?.channelCode ?? "",
            subChannel: responseData.sourcingDetail?.drcChannelCode ?? "",
          },
          agent: {
            agentCode: responseData.sourcingDetail?.agentCode ?? "",
            agentName: "",
          },
          customer: {
            customerType: responseData.applicationInfo?.proposerType ?? "",
            policyType: responseData.groupDetails?.coverageStatus ?? "",
          },
          policyDetails: {
            modalPremium: Number(firstProduct?.paymentAmount ?? 0),
            policyTerm: Number(firstProduct?.term ?? 0),
            premiumPaymentTerm: Number(firstProduct?.premiumCessationTerm ?? 0),
            paymentMode: firstProduct?.premiumModeFpd ?? "",
          },
        };
        state.riderDetails = [];
        state.requirements = requirements.map((item) => ({
          team: "",
          profile: "",
          category: item.requirementType,
          subCategory: item.metaphorName,
          document: item.requirementValue,
          specialTest: "",
          reason: item.ruleName,
          fupCode: "",
          description: item.requirementValue,
          status: item.isSTP ? "STP" : "Pending",
          raisedDate: "",
          raisedBy: "",
          receivedDate: "",
          receivedBy: "",
          validity: "",
          userId: "",
          remarks: "",
          udsLink: "",
        }));
        state.auditTrail = [];
        state.pivvSection = {
          title: "PIVV",
          remarks: "",
          decision: "",
          reason: "",
          userId: "",
        };
      })
      .addCase(drsThunk.rejected, (state, action) => {
        state.loading = "failed";
        state.error =
          (action.payload as string) || action.error.message || null;
      })
      .addCase(mastersThunk.pending, (state) => {
        state.mastersLoading = "loading";
        state.mastersError = null;
      })
      .addCase(mastersThunk.fulfilled, (state, action) => {
        state.mastersLoading = "idle";
        state.mastersError = null;
        state.masters = action.payload.data ?? {};
      })
      .addCase(mastersThunk.rejected, (state, action) => {
        state.mastersLoading = "failed";
        state.mastersError =
          (action.payload as string) || action.error.message || null;
      });
  },
});

export const { updateApplicantProfile } = drsSlice.actions;
export default drsSlice.reducer;
