export type BreCounterSignValidationResult =
    | { isValid: true; message?: never }
    | { isValid: false; message: string };

type ValidationContext = {
    drs: Record<string, unknown>;
    breDecision: string;
    breRequirements: Set<string>;
    selectedDecision: string;
    selectedDecisionCode: string;
    summary: Record<string, unknown>[];
};

const normalize = (value: unknown): string =>
    String(value ?? "").trim().toUpperCase();

const toRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

const toRecords = (value: unknown): Record<string, unknown>[] =>
    Array.isArray(value) ? value.map(toRecord) : [];

const isYes = (value: unknown): boolean =>
    value === true || ["Y", "YES", "TRUE"].includes(normalize(value));

const getDrsPayload = (drsData: unknown): Record<string, unknown> => {
    const response = toRecord(drsData);
    const responseData = toRecord(response.data);
    return Object.keys(responseData).length > 0 ? responseData : response;
};

const getBreValues = (
    breResponse: unknown,
): { decision: string; requirements: Set<string> } => {
    const response = toRecord(breResponse);
    const responseData = toRecord(response.data);
    const breOutput = toRecord(responseData.breOutput ?? response.breOutput);
    const decisionTypes = toRecord(breOutput.decisionTypes);
    return {
        decision: normalize(decisionTypes.breDecision),
        requirements: new Set(
            normalize(decisionTypes.breRequirement)
                .split("#")
                .map(normalize)
                .filter(Boolean),
        ),
    };
};

const getRiskParts = (member: Record<string, unknown>) => {
    const riskAnalytics = toRecords(member.riskAnalytics)[0] ?? {};
    return {
        medical: toRecord(riskAnalytics.medicalRisk),
        financial: toRecord(riskAnalytics.financialRisk),
        other: toRecord(riskAnalytics.otherRisk),
    };
};

const getRiskAnalytics = (
    member: Record<string, unknown>,
): Record<string, unknown> => toRecords(member.riskAnalytics)[0] ?? {};

const TERMINAL_DECISIONS = new Set([
    "ACCEPT",
    "STANDARD",
    "ACCEPT/STANDARD",
    "POSTPONE",
    "REJECT",
    "DECLINE",
]);

const TERMINAL_EXCEPT_DECLINE_POSTPONE = new Set([
    "ACCEPT",
    "STANDARD",
    "ACCEPT/STANDARD",
    "REJECT",
]);

const STANDARD_DECISIONS = new Set([
    "ACCEPT",
    "STANDARD",
    "ACCEPT/STANDARD",
]);

const isSavingOrTermProduct = (drs: Record<string, unknown>): boolean => {
    const applicationOverview = toRecord(drs.applicationOverview);
    return toRecords(applicationOverview.productDetail).some((product) =>
        ["SAVING", "SAVINGS", "TERM"].includes(normalize(product.category)),
    );
};

const isTermProduct = (drs: Record<string, unknown>): boolean => {
    const applicationOverview = toRecord(drs.applicationOverview);
    return toRecords(applicationOverview.productDetail).some(
        (product) => normalize(product.category) === "TERM",
    );
};

const getCotTest = (
    member: Record<string, unknown>,
): Record<string, unknown> =>
    toRecord(getRiskParts(member).medical.cotTest);

const hasMissingCotValue = (
    summary: Record<string, unknown>[],
): boolean =>
    summary.some((member) => {
        const { other } = getRiskParts(member);
        const cotTest = getCotTest(member);
        const anyIndicatorIsNo = [
            other.smokerIndicator,
            other.tobaccoIndicator,
            other.narcoticIndicator,
        ].some((value) => normalize(value) === "NO");

        return (
            anyIndicatorIsNo &&
            isYes(cotTest.received) &&
            normalize(cotTest.result) === ""
        );
    });

const hasCotSmokingDisclosureMismatch = (
    summary: Record<string, unknown>[],
): boolean =>
    summary.some((member) => {
        const { medical, other } = getRiskParts(member);
        const cotTest = toRecord(medical.cotTest);
        const merHabits = toRecord(medical.merHabits);
        const teleMerHabits = toRecord(medical.teleMerHabits);
        const smokerAndTobaccoAreNo =
            normalize(other.smokerIndicator) === "NO" &&
            normalize(other.tobaccoIndicator) === "NO";
        const disclosedSmokingHabit = [
            merHabits.cigarettesOrBeedisOrCigar,
            merHabits.gutkaSnuffPaan,
            teleMerHabits.cigarettesOrBeedisOrCigar,
            teleMerHabits.gutkaSnuffPaan,
        ].some(isYes);

        return (
            smokerAndTobaccoAreNo &&
            ["ACCEPT", "ACCEPTED"].includes(
                normalize(cotTest.discrepancyStatus),
            ) &&
            normalize(cotTest.result) === "NEGATIVE" &&
            disclosedSmokingHabit
        );
    });

const hasPositiveCotResult = (
    summary: Record<string, unknown>[],
): boolean =>
    summary.some((member) => {
        const { other } = getRiskParts(member);
        const cotTest = getCotTest(member);
        return (
            normalize(other.smokerIndicator) === "NO" &&
            normalize(other.tobaccoIndicator) === "NO" &&
            ["ACCEPT", "ACCEPTED"].includes(
                normalize(cotTest.discrepancyStatus),
            ) &&
            normalize(cotTest.result) === "POSITIVE"
        );
    });

const hasIncompleteAcceptedCot = (
    drs: Record<string, unknown>,
    summary: Record<string, unknown>[],
): boolean => {
    const cotAccepted = toRecords(drs.requirementManagement).some(
        (requirement) =>
            normalize(requirement.fupCode) === "COT" &&
            ["ACCEPT", "ACCEPTED"].includes(normalize(requirement.status)),
    );
    return (
        cotAccepted &&
        summary.some(
            (member) => getCotTest(member).mandatoryFieldsComplete !== true,
        )
    );
};

const hasBlankDrcRisk = (summary: Record<string, unknown>[]): boolean =>
    summary.some(
        (member) => normalize(getRiskParts(member).other.drcResponse) === "",
    );

const isProposalOlderThan90Days = (
    drs: Record<string, unknown>,
): boolean => {
    const applicationOverview = toRecord(drs.applicationOverview);
    const policyDetails = toRecord(applicationOverview.policyDetails);
    const rawDate = String(policyDetails.proposalApplicationDate ?? "").trim();
    if (!rawDate) return false;

    const proposalDate = new Date(rawDate);
    if (Number.isNaN(proposalDate.getTime())) return false;

    const ageInDays =
        (Date.now() - proposalDate.getTime()) / (24 * 60 * 60 * 1000);
    return ageInDays > 90;
};

const isProductDecisionMismatch = (
    drs: Record<string, unknown>,
    selectedDecision: string,
): boolean => {
    const applicationOverview = toRecord(drs.applicationOverview);
    return toRecords(applicationOverview.productDetail).some((product) => {
        const allowedDecisions = Array.isArray(product.allowedUwDecisions)
            ? product.allowedUwDecisions.map(normalize).filter(Boolean)
            : [];
        return (
            allowedDecisions.length > 0 &&
            !allowedDecisions.includes(selectedDecision)
        );
    });
};

const isPepCase = (summary: Record<string, unknown>[]): boolean =>
    summary.some((member) => {
        const proposerSummary = toRecord(member.proposerSummary);
        const kycDetails = toRecord(member.kycDetails);
        const { other } = getRiskParts(member);
        return (
            isYes(proposerSummary.isPEP) ||
            isYes(kycDetails.pep) ||
            isYes(other.pepQuestionResponseLA) ||
            isYes(other.pepQuestionResponsePR)
        );
    });

const hasCriminalDisclosure = (summary: Record<string, unknown>[]): boolean =>
    summary.some((member) => {
        const proposerSummary = toRecord(member.proposerSummary);
        const kycDetails = toRecord(member.kycDetails);
        const { other } = getRiskParts(member);
        return (
            isYes(proposerSummary.criminalProceeding) ||
            isYes(kycDetails.criminalProceedings) ||
            isYes(other.criminalQuestionResponseLA) ||
            isYes(other.criminalQuestionResponsePR)
        );
    });

const hasNarcoticsDisclosure = (summary: Record<string, unknown>[]): boolean =>
    summary.some((member) => isYes(getRiskParts(member).other.narcotics));

const hasNullAndVoidPreviousPolicy = (
    drs: Record<string, unknown>,
): boolean => {
    const quickLinks = toRecord(drs.quickLinks);
    return toRecords(quickLinks.previousPolicies).some((policy) =>
        ["NULL AND VOID", "NULL & VOID"].includes(normalize(policy.decision)),
    );
};

const hasBlankBiuPredictResponse = (
    summary: Record<string, unknown>[],
): boolean =>
    summary.some((member) => {
        const modelResponse = toRecord(
            getRiskAnalytics(member).biuModelResponse,
        );
        if (Object.keys(modelResponse).length === 0) return false;
        return ["model", "predict", "action"].some(
            (key) => normalize(modelResponse[key]) === "",
        );
    });

const hasBlankBiuModelOutput = (
    summary: Record<string, unknown>[],
): boolean =>
    summary.some((member) => {
        const modelResponse = toRecord(
            getRiskAnalytics(member).biuModelResponse,
        );
        if (Object.keys(modelResponse).length === 0) return false;
        return ["modelOutput", "modelName"].some(
            (key) => normalize(modelResponse[key]) === "",
        );
    });

const getAccuityIndicators = (
    summary: Record<string, unknown>[],
): string[] =>
    summary.flatMap((member) => {
        const values = [
            toRecord(member.proposerSummary).accuityRiskIndicator,
            toRecord(member.genericDetails).accuityRiskIndicator,
            getRiskParts(member).other.accuityRiskIndicator,
            getRiskParts(member).other.accuityTransactionStatus,
        ];
        return values.map(normalize).filter(Boolean);
    });

const hasIncompleteProposerCriminalAnswer = (
    summary: Record<string, unknown>[],
): boolean =>
    summary.some((member) => {
        const kycDetails = toRecord(member.kycDetails);
        const { other } = getRiskParts(member);
        return [kycDetails.criminalProceedings, other.criminalQuestionResponsePR]
            .map(normalize)
            .some((answer) => answer === "");
    });

const hasTelePrompting = (summary: Record<string, unknown>[]): boolean =>
    summary.some((member) => {
        const { medical } = getRiskParts(member);
        return (
            isYes(medical.teleMerPrompting) ||
            isYes(medical.videoMerPrompting) ||
            (normalize(medical.tuwStatus) === "TU NOT DONE" &&
                normalize(medical.tuwReason) === "PROMPTING")
        );
    });

const isTeleVideoOrNonMedicalCode = (decisionCode: string): boolean =>
    ["TELE", "VIDEO", "NON-MEDICAL", "NON MEDICAL"].some((value) =>
        decisionCode.includes(value),
    );

const hasRecentStandardPreviousPolicy = (
    drs: Record<string, unknown>,
): boolean => {
    const quickLinks = toRecord(drs.quickLinks);
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    return toRecords(quickLinks.previousPolicies).some((policy) => {
        if (normalize(policy.decision) !== "STANDARD") return false;
        const issueDate = new Date(String(policy.dateOfIssuance ?? ""));
        return (
            !Number.isNaN(issueDate.getTime()) &&
            issueDate >= threeYearsAgo &&
            issueDate <= new Date()
        );
    });
};

const isTransgenderTermCase = (
    drs: Record<string, unknown>,
    summary: Record<string, unknown>[],
): boolean => {
    const applicationOverview = toRecord(drs.applicationOverview);
    const isTerm = toRecords(applicationOverview.productDetail).some(
        (product) => normalize(product.category) === "TERM",
    );
    return (
        isTerm &&
        summary.some((member) => {
            const proposerSummary = toRecord(member.proposerSummary);
            const applicantDetails = toRecord(member.applicantDetails);
            return [proposerSummary.gender, applicantDetails.gender].some(
                (gender) => normalize(gender) === "TRANSGENDER",
            );
        })
    );
};

const hasWopRider = (drs: Record<string, unknown>): boolean => {
    const applicationOverview = toRecord(drs.applicationOverview);
    return toRecords(applicationOverview.riderDetails).some((rider) =>
        [rider.code, rider.name, rider.type].some((value) =>
            normalize(value).includes("WOP"),
        ),
    );
};

const hasThirdPartyPayment = (
    summary: Record<string, unknown>[],
): boolean =>
    summary.some((member) => {
        const paymentDetails = toRecord(member.paymentDetails);
        const directValue = Object.entries(paymentDetails).some(
            ([key, value]) =>
                normalize(key).replace(/[^A-Z]/g, "").includes("THIRDPARTY") &&
                isYes(value),
        );
        const questionValue = toRecords(member.questions).some(
            (question) =>
                normalize(question.quesCode)
                    .replace(/[^A-Z]/g, "")
                    .includes("THIRDPARTY") && isYes(question.quesAns),
        );
        return directValue || questionValue;
    });

const hasAdverseHealthDisclosure = (
    summary: Record<string, unknown>[],
): boolean =>
    summary.some((member) => {
        const { other } = getRiskParts(member);
        return (
            isYes(other.narcotics) ||
            isYes(other.healthQuestionPositive) ||
            isYes(other.hazardousOccupation) ||
            isYes(other.covidAdverseReply)
        );
    });

const hasAcceptedRiskWithoutIriskComment = (
    drs: Record<string, unknown>,
): boolean =>
    toRecords(drs.requirementManagement).some((requirement) => {
        const code = normalize(requirement.fupCode);
        const status = normalize(requirement.status);
        const remarks = normalize(requirement.remarks);
        return (
            ["RSK", "LNM"].includes(code) &&
            ["ACCEPT", "ACCEPTED"].includes(status) &&
            !remarks.includes("IRISK")
        );
    });

const isBreRequirementUnavailable = (
    drs: Record<string, unknown>,
    breRequirements: Set<string>,
    codes: string[],
): boolean => {
    if (!codes.some((code) => breRequirements.has(code))) return false;

    const matchingRows = toRecords(drs.requirementManagement).filter(
        (requirement) => codes.includes(normalize(requirement.fupCode)),
    );

    return (
        matchingRows.length === 0 ||
        matchingRows.every((requirement) =>
            ["WAIVED", "NOT REQUIRED", "NOTREQUIRED"].includes(
                normalize(requirement.status),
            ),
        )
    );
};

const invalid = (message: string): BreCounterSignValidationResult => ({
    isValid: false,
    message,
});

export const validateBreCounterSignDecision = (
    drsData: unknown,
    breResponse: unknown,
    selectedDecision: string,
    selectedDecisionCode = "",
): BreCounterSignValidationResult => {
    const drs = getDrsPayload(drsData);
    const summary = toRecords(drs.summary);
    const bre = getBreValues(breResponse);
    const context: ValidationContext = {
        drs,
        breDecision: bre.decision,
        breRequirements: bre.requirements,
        selectedDecision: normalize(selectedDecision),
        selectedDecisionCode: normalize(selectedDecisionCode),
        summary,
    };

    if (!isSavingOrTermProduct(context.drs)) {
        return { isValid: true };
    }

    const termProduct = isTermProduct(context.drs);

    if (
        termProduct &&
        hasIncompleteAcceptedCot(context.drs, context.summary)
    ) {
        return invalid(
            "Cotinine test data entry is incomplete, Please complete data entry before accepting Discrepancy code",
        );
    }

    const accuityIndicators = getAccuityIndicators(context.summary);
    if (
        ["ST", "OT"].includes(context.selectedDecision) &&
        accuityIndicators.some((status) =>
            ["TRUE MATCH", "REFER CUW MANAGER", "ESCALATE TO CUW MANAGER"].includes(
                status,
            ),
        )
    ) {
        return invalid(
            'Cannot take ST/OT decision - Accuity transaction closed with Status “True Match” or "Escalate to CUW Manager" Please refer case to CUW',
        );
    }

    if (!TERMINAL_DECISIONS.has(context.selectedDecision)) {
        return { isValid: true };
    }

    if (
        termProduct &&
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        hasMissingCotValue(context.summary)
    ) {
        return invalid("Please insert COT value");
    }

    if (
        termProduct &&
        STANDARD_DECISIONS.has(context.selectedDecision) &&
        hasCotSmokingDisclosureMismatch(context.summary)
    ) {
        return invalid(
            "Customer disclosed Personal habits of smoking/tobacco consumption on MER/Tele MER",
        );
    }

    if (
        termProduct &&
        STANDARD_DECISIONS.has(context.selectedDecision) &&
        hasPositiveCotResult(context.summary)
    ) {
        return invalid(
            "Cotinine test result Positive, cannot take STD decision",
        );
    }

    if (
        termProduct &&
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        hasBlankDrcRisk(context.summary)
    ) {
        return invalid(
            "DRC Risk value is Blank or Null Risk  - Kindly take counter sign",
        );
    }

    if (context.breDecision === "TUW") {
        return invalid(
            "Case above your Underwriting limit, please take counter sign",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        isPepCase(context.summary)
    ) {
        return invalid("PEP case - Kindly take HOD approval");
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        hasCriminalDisclosure(context.summary)
    ) {
        return invalid("Criminal case - Kindly take HOD approval");
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        isProposalOlderThan90Days(context.drs)
    ) {
        return invalid(
            "Please call for fresh medical questionnaire. If you still want to proceed then kindly take HOD approval",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        hasNarcoticsDisclosure(context.summary)
    ) {
        return invalid("Narcotics history case - Kindly take counter sign");
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        hasNullAndVoidPreviousPolicy(context.drs)
    ) {
        return invalid(
            "Previous policy null and void - kindly take counter sign",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        isBreRequirementUnavailable(
            context.drs,
            context.breRequirements,
            ["RSK"],
        )
    ) {
        return invalid(
            "Risk requirement is either waived or not required status or not raised , kindly take counter sign",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        isBreRequirementUnavailable(
            context.drs,
            context.breRequirements,
            ["TUW"],
        )
    ) {
        return invalid(
            "Tele requirement is either waived or not required status or not raised, kindly take counter sign",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        isBreRequirementUnavailable(
            context.drs,
            context.breRequirements,
            ["VMR"],
        )
    ) {
        return invalid(
            "Video MER requirement is either waived or not required status or not raised, kindly take counter sign",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        ["PO", "DC", "RJ"].includes(context.breDecision)
    ) {
        return invalid(
            "Please refresh BRE decision and accordingly give final CUW decision",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        isProductDecisionMismatch(context.drs, context.selectedDecision)
    ) {
        return invalid("Please refresh CUW decision");
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        hasBlankBiuPredictResponse(context.summary)
    ) {
        return invalid(
            "BIU models predict Response is Blank - cannot take STD, XRT, COFF decision - Kindly take counter sign",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        accuityIndicators.some((status) =>
            ["TRUE MATCH", "REFER CUW MANAGER", "ESCALATE TO CUW MANAGER"].includes(
                status,
            ),
        )
    ) {
        return invalid(
            'Accuity transaction closed with Status “True Match” or "Escalate to CUW Manager" , please take counter sign',
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        accuityIndicators.includes("OPEN")
    ) {
        return invalid(
            "Accuity status is Open - cannot take decision other than Decline/Postpone",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        hasBlankBiuModelOutput(context.summary)
    ) {
        return invalid(
            "BIU models predict Response is Blank - cannot take STD, XRT, COFF decision , Kindly Re-hit the model again to proceed",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        isTransgenderTermCase(context.drs, context.summary)
    ) {
        return invalid(
            "Life Assured gender is Transgender, kindly take HOD approval",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        hasWopRider(context.drs) &&
        hasThirdPartyPayment(context.summary)
    ) {
        return invalid(
            "Policy premium paid by Third Party  - cannot take STD, XRT decision",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        hasWopRider(context.drs) &&
        hasAdverseHealthDisclosure(context.summary)
    ) {
        return invalid(
            "WOP Rider not allowed for Substandard Life - cannot take STD, XRT decision",
        );
    }

    if (
        TERMINAL_EXCEPT_DECLINE_POSTPONE.has(context.selectedDecision) &&
        hasAcceptedRiskWithoutIriskComment(context.drs)
    ) {
        return invalid(
            "Risk Report not received, cannot take terminal decision.",
        );
    }

    if (
        ["ACCEPT", "STANDARD", "ACCEPT/STANDARD"].includes(
            context.selectedDecision,
        ) &&
        hasIncompleteProposerCriminalAnswer(context.summary)
    ) {
        return invalid("Criminal case - Kindly take HOD approval");
    }

    if (
        hasTelePrompting(context.summary) &&
        isTeleVideoOrNonMedicalCode(context.selectedDecisionCode)
    ) {
        return invalid(
            "Tele prompting and TU not done case, Kindly call for Medicals",
        );
    }

    if (
        ["DECLINE", "POSTPONE", "REJECT"].includes(context.selectedDecision) &&
        hasRecentStandardPreviousPolicy(context.drs)
    ) {
        return invalid(
            "Previous policies: Standard and Current application- Rejected Initiate NV if required",
        );
    }

    return { isValid: true };
};
