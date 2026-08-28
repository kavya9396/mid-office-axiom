import { Alert, Box, Snackbar, Typography } from "@mui/material"
import CustomAccordion from "../../../components/ui/Accordion/Accordion"
import { useEffect, useMemo, useState } from "react";
import CustomSelect from "../../../components/ui/Select/Select";
import CustomRadioGroup from "../../../components/ui/Radio/Radio";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../store/store";
import CustomButton from "../../../components/ui/Button/Button";
import UWReinsurer, { UWReinsurerFields } from "./ReInsurer/UWReinsurer";
import { useLocation, useNavigate } from "react-router-dom";
import ConfirmationDialog from "../../../components/layout/ConfirmationDialog";
import CustomTextField from "../../../components/ui/TextField/TextField";
import { decisionCodeThunk } from "../../../store/thunks/decisionCodeThunk";
import { useAppContext } from "../../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../../routes/routes";
import { openRequirementManagement } from "./requirementManagementEvents";
import { completeTaskThunk } from "../../../store/thunks/completeTaskThunk";
import { getDecisionTaskContext } from "./decisionTaskContext";
import { getCompleteTaskResult } from "./completeTaskResponse";
import { toMasterLabel } from "../../../utils/masterOptions";
import { validateDrsFinalBre } from "../../../validations/drsBreValidation";
import { validateApplicantTabsVisited } from "../../../validations/drsApplicantTabValidation";
import { validateRequirementDecision } from "../../../validations/drsRequirementDecisionValidation";
import { validateBreCounterSignDecision } from "../../../validations/breCUWValidations";
import { validateAdditionalUwDecision } from "../../../validations/breadditionalValidations";
import { userRoleNameThunk } from "../../../store/thunks/userRoleNameThunk";
import { breThunk } from "../../../store/thunks/breThunk";
import { drsThunk } from "../../../store/thunks/drsThunk";
import type { UserRoleUser } from "../../../types/drs.types";
import CounterOffer from "./CounterOffer";

const referralRoleMap: Record<string, "hod" | "sruw" | "cmo"> = {
    "Refer to HOD": "hod",
    "Refer to Sr Uw": "sruw",
    "Refer to CMO": "cmo",
    "Refer to HO CMO": "cmo",
};

type ReferralUser = UserRoleUser & {
    threshold?: boolean;
};

type TaskApplication = {
    taskId?: string;
    instanceId?: string;
    instanceID?: string;
    taskCompositeId?: string;
};

type LocationState = {
    application?: TaskApplication;
};

// type CounterOfferRowKey = "baseSumAssured" | "riderSumAssured";
// type CounterOfferFieldKey =
//     | "changedSA"
//     | "changedPT"
//     | "changedPPT"
//     | "extraPremiumDecision"
//     | "revisedPremium"
//     | "gst"
//     | "reasons";

// const createCounterOfferTableState = () => ({
//     baseSumAssured: {
//         changedSA: "",
//         changedPT: "",
//         changedPPT: "",
//         extraPremiumDecision: "",
//         revisedPremium: "",
//         gst: "",
//         reasons: "",
//     },
//     riderSumAssured: {
//         changedSA: "",
//         changedPT: "",
//         changedPPT: "",
//         extraPremiumDecision: "",
//         revisedPremium: "",
//         gst: "",
//         reasons: "",
//     },
// });

const toRecord = (value: unknown): Record<string, unknown> =>
    value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};

const toText = (value: unknown): string => String(value ?? "").trim();

const findFirstScalarByKey = (
    value: unknown,
    keys: string[],
): unknown => {
    const normalizedKeys = new Set(
        keys.map((key) => key.replace(/[_\s-]/g, "").toUpperCase()),
    );
    const visited = new Set<object>();

    const visit = (current: unknown): unknown => {
        if (!current || typeof current !== "object") return undefined;
        if (visited.has(current)) return undefined;
        visited.add(current);

        if (Array.isArray(current)) {
            for (const item of current) {
                const result = visit(item);
                if (result !== undefined) return result;
            }
            return undefined;
        }

        const record = current as Record<string, unknown>;

        for (const [key, item] of Object.entries(record)) {
            const normalizedKey = key.replace(/[_\s-]/g, "").toUpperCase();
            if (
                normalizedKeys.has(normalizedKey) &&
                item !== null &&
                item !== "" &&
                typeof item !== "object"
            ) {
                return item;
            }
        }

        for (const item of Object.values(record)) {
            const result = visit(item);
            if (result !== undefined) return result;
        }

        return undefined;
    };

    return visit(value);
};

const getSelectedCaseContext = (): Record<string, unknown> => {
    try {
        return toRecord(JSON.parse(localStorage.getItem("selectedCaseContext") ?? "null"));
    } catch {
        return {};
    }
};

const splitCompositeTaskId = (
    value: unknown,
): { taskId: string; instanceId: string } => {
    const compositeId = toText(value);
    const separatorIndex = compositeId.indexOf(".");

    if (separatorIndex < 0) {
        return { taskId: compositeId, instanceId: "" };
    }

    return {
        instanceId: compositeId.slice(0, separatorIndex).trim(),
        taskId: compositeId.slice(separatorIndex + 1).trim(),
    };
};

type ReasonOption = {
    label: string;
    value: string;
};

const getReasonOptionsFromMasters = (
    masters: unknown,
    requestType?: "MEDICAL" | "NON_MEDICAL",
): ReasonOption[] => {
    const masterRecord = toRecord(masters);
    const masterData = toRecord(masterRecord.data);
    const rawReasons = masterRecord.reason ?? masterData.reason;

    if (!Array.isArray(rawReasons)) return [];

    const options = rawReasons
        .filter((reason) => {
            const item = toRecord(reason);
            const isActive = String(item.isActive ?? "Y")
                .trim()
                .toUpperCase();
            const itemRequestType = String(item.requestType ?? "")
                .trim()
                .toUpperCase();

            return (
                isActive === "Y" &&
                (!requestType || itemRequestType === requestType)
            );
        })
        .map((reason) => {
            const item = toRecord(reason);
            const label = String(
                item.description ?? item.value ?? item.code ?? "",
            ).trim();
            const value = String(item.iibCode ?? "").trim();

            return { label, value };
        })
        .filter((option) => option.label && option.value);

    return Array.from(
        new Map(options.map((option) => [option.value, option])).values(),
    );
};

const getPostponementPeriodOptions = (
    masters: unknown,
): ReasonOption[] => {
    const masterRecord = toRecord(masters);
    const masterData = toRecord(masterRecord.data);
    const rawMisc = masterRecord.misc ?? masterData.misc;

    if (!Array.isArray(rawMisc)) return [];

    return rawMisc
        .filter((option) => {
            const item = toRecord(option);

            return (
                String(item.isActive ?? "")
                    .trim()
                    .toUpperCase() === "Y" &&
                String(item.type ?? "")
                    .trim()
                    .toUpperCase() === "POSTPONE_PERIOD"
            );
        })
        .map((option) => {
            const item = toRecord(option);

            return {
                label: String(
                    item.description ?? item.value ?? item.code ?? "",
                ).trim(),
                value: String(
                    item.code ?? item.value ?? "",
                ).trim(),
            };
        })
        .filter((option) => option.label && option.value);
};

const UWDecision = () => {
    const decisionCodes = useSelector((state: RootState) => state.decisionCodes.decisionCodes)
    const masters = useSelector((state: RootState) => state.drs.masters);
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const location = useLocation();
    const { businessType, applicationNumber } = useAppContext();
    const drsData = useSelector((state: RootState) => state.drs.data as unknown as Record<string, unknown> | null);
    const breResponse = useSelector((state: RootState) => {
        const rootState = state as unknown as Record<string, unknown>;
        const breState = toRecord(rootState.bre);
        const drsState = toRecord(rootState.drs);

        return (
            breState.data ??
            breState.response ??
            breState.breData ??
            drsState.breResponse ??
            drsState.breData ??
            drsState.breExternalApiOutputs ??
            null
        );
    });
    const breResponseRecord = toRecord(breResponse);
    const finalBreResponseData = toRecord(breResponseRecord.data);
    const finalBreOutput = toRecord(
        finalBreResponseData.breOutput ?? breResponseRecord.breOutput,
    );
    const finalBreDecisionFromApi = toText(
        toRecord(finalBreOutput.decisionTypes).breDecision,
    ).toUpperCase();
    const latestBreDecisionFromDrs = toText(
        toRecord(toRecord(drsData).latestBreDecision).decision,
    ).toUpperCase();
    const finalBreDecision =
        finalBreDecisionFromApi || latestBreDecisionFromDrs;
    const canShowStandardDecision = ["ST", "STP", "STD"].includes(
        finalBreDecision,
    );
    const dataEntry = toText(
        findFirstScalarByKey(drsData, ["dataentry", "dataEntry"]),
    );
    const applicationOverview = toRecord(toRecord(drsData).applicationOverview);
    const productDetails = Array.isArray(applicationOverview.productDetail)
        ? applicationOverview.productDetail
        : [];
    const firstProductDetail = toRecord(productDetails[0]);
    const productCategory = toText(firstProductDetail.category).toUpperCase();

    useEffect(() => {
        const overview = toRecord(toRecord(drsData).applicationOverview);
        const details = Array.isArray(overview.productDetail)
            ? overview.productDetail
            : [];

        console.log("UW Decision - productDetail:", details);
        console.log("UW Decision - first product detail:", toRecord(details[0]));
        console.log("UW Decision - product category:", productCategory);
    }, [drsData, productCategory]);

    const isTermProduct = productCategory
    .trim()
    .toUpperCase()
    .includes("TERM");
    const safeBusinessType =
        normalizeBusinessType(businessType) ??
        normalizeBusinessType(localStorage.getItem("businessType")) ??
        "retail";

    const [uwDecisionRemarks, setUwDecisionRemarks] = useState("");
    const [caseUWDecision, setCaseUWDecision] = useState("");
    const [outlier, setOutlier] = useState("");
    const [uwDecision, setUwDecision] = useState("");
    const [decisionCode, setDecisionCode] = useState("");
    const [borderlineStandardReasons, setBorderlineStandardReasons] = useState<string[]>([]);
    const [counterOfferReasons, setCounterOfferReasons] = useState<string[]>([]);
    const [rejectReason, setRejectReason] = useState<string[]>([]);
    const [declineReasons, setDeclineReasons] = useState<string[]>([]);
    const [postponeReason, setPostponeReason] = useState("");
    const [postponementPeriod, setPostponementPeriod] = useState("");
    const [smokerStatus, setSmokerStatus] = useState("");
    // const [counterOfferTable, setCounterOfferTable] = useState(createCounterOfferTableState);
    const [parallelDecision, setParallelDecision] = useState("");
    const [holdReasons, setHoldReasons] = useState("");
    const [decisionType, setDecisionType] = useState("counterSign");
    const [referralValue, setReferralValue] = useState("");
    const [confirmationDialogOpen, setConfirmationDialogOpen] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<string | null>(null);
    const [submitStatus, setSubmitStatus] = useState<"success" | "failure" | null>(null);
    const [roleUsers, setRoleUsers] = useState<ReferralUser[]>([]);
    const [roleUsersLoading, setRoleUsersLoading] = useState(false);
    const [excludedReferralNtids, setExcludedReferralNtids] = useState<string[]>([]);
    const [thresholdDialogOpen, setThresholdDialogOpen] = useState(false);
    const [thresholdUserNtid, setThresholdUserNtid] = useState("");
    const application =
        (location.state as LocationState | null)?.application ?? null;
    const storedCaseContext = getSelectedCaseContext();
    const storedApplicationNumber = toText(
        storedCaseContext.applicationNo ?? storedCaseContext.applicationNumber,
    );
    const selectedCaseContext =
        !applicationNumber ||
            !storedApplicationNumber ||
            applicationNumber.trim() === storedApplicationNumber
            ? storedCaseContext
            : {};

    // =====================================================
    // GET VALUES FROM ROW
    // =====================================================

    const routeTask = splitCompositeTaskId(
        application?.taskCompositeId || application?.taskId,
    );
    const storedTask = splitCompositeTaskId(
        selectedCaseContext.taskCompositeId || selectedCaseContext.taskId,
    );

    const taskId =
        routeTask.taskId ||
        storedTask.taskId;

    const instanceId =
        toText(application?.instanceId) ||
        toText(application?.instanceID) ||
        routeTask.instanceId ||
        toText(selectedCaseContext.instanceId) ||
        toText(selectedCaseContext.instanceID) ||
        storedTask.instanceId;

    const caseUWDecisionOptions = useMemo(() => {
        const masterRecord = toRecord(masters);
        const masterData = toRecord(masterRecord.data);
        const misc = masterRecord.misc ?? masterData.misc;

        const toMasterList = (options?: unknown): unknown[] => {
            if (Array.isArray(options)) return options;

            if (!options || typeof options !== "object") {
                return [];
            }

            const record = options as Record<string, unknown>;

            if (Array.isArray(record.data)) return record.data;
            if (Array.isArray(record.options)) return record.options;
            if (Array.isArray(record.values)) return record.values;

            return Object.values(record).flatMap((value) =>
                Array.isArray(value) ? value : []
            );
        };

        const rawList = toMasterList(misc) as Array<Record<string, unknown>>;

        const decisionOptions = rawList
            .filter(
                (option) => {
                    const type = String(option?.type ?? "")
                        .trim()
                        .toUpperCase();

                    return type === "TERM_DEC" || type === "CUW";
                }
            )
            .map((option) => {
                const code = String(
                    option.code ?? option.key ?? option.value ?? ""
                ).trim();

                const description = String(
                    option.description ?? option.label ?? ""
                ).trim();

                const disabled = Boolean(
                    option.disabled ??
                    (
                        String(option.isActive ?? "")
                            .trim()
                            .toUpperCase() === "N"
                    )
                );

                if (!code || !description) return null;

                return {
                    label: description,
                    value: code,
                    code,
                    description,
                    type: String(option.type ?? "").trim(),
                    disabled,
                };
            })
            .filter(Boolean) as Array<{
                label: string;
                value: string;
                code: string;
                description: string;
                type: string;
                disabled?: boolean;
            }>;

        return decisionOptions.filter((option) => {
            const normalizedCode = option.code.trim().toUpperCase();
            const normalizedLabel = option.label
                .trim()
                .replace(/[\s_-]+/g, " ")
                .toUpperCase();
            const isBorderlineStandardOption =
                normalizedCode === "BOR_STD" ||
                normalizedLabel === "BORDERLINE STANDARD";

            return (
                !isBorderlineStandardOption || canShowStandardDecision
            );
        });
    }, [canShowStandardDecision, masters]);

    const effectiveCaseUWDecision = caseUWDecisionOptions.some((option) => option.value === caseUWDecision)
        ? caseUWDecision
        : "";
    const postponementPeriodOptions = useMemo(
        () => getPostponementPeriodOptions(masters),
        [masters],
    );
    const caseUWDecisionLabel = toMasterLabel(effectiveCaseUWDecision, caseUWDecisionOptions);
    const selectedCaseDecisionOption = caseUWDecisionOptions.find(
        (option) => option.value === effectiveCaseUWDecision,
    );
    const selectedDecisionCode = toText(
        selectedCaseDecisionOption?.code ?? selectedCaseDecisionOption?.value,
    );
    const normalizedCaseUWDecisionLabel = caseUWDecisionLabel
        .trim()
        .replace(/[\s_-]+/g, " ")
        .toUpperCase();
    const isStandardDecision =
        normalizedCaseUWDecisionLabel === "STANDARD";
    const isBorderlineStandardDecision =
        normalizedCaseUWDecisionLabel === "BORDERLINE STANDARD" ||
        selectedDecisionCode.trim().toUpperCase() === "BOR_STD";

    const nonMedicalOptions = useMemo(
        () => getReasonOptionsFromMasters(masters, "NON_MEDICAL"),
        [masters],
    );
    const medicalAndNonMedicalOptions = useMemo(() => {
        const medicalOptions = getReasonOptionsFromMasters(masters, "MEDICAL");
        const nonMedicalReasonOptions = getReasonOptionsFromMasters(
            masters,
            "NON_MEDICAL",
        );

        return Array.from(
            new Map(
                [...medicalOptions, ...nonMedicalReasonOptions].map((option) => [
                    option.value,
                    option,
                ]),
            ).values(),
        );
    }, [masters]);

    const parallelUWDecisionOptions = useMemo(() => {
        const misc = (masters as Record<string, unknown> | undefined)?.misc;

        if (!Array.isArray(misc)) {
            return [];
        }

        return misc
            .filter((option) => {
                const item = option as Record<string, unknown>;

                return (
                    String(item.type ?? "").trim().toUpperCase() === "PARA" &&
                    String(item.isActive ?? "").trim().toUpperCase() === "Y"
                );
            })
            .map((option) => {
                const item = option as Record<string, unknown>;

                return {
                    label: String(
                        item.description ??
                        item.label ??
                        item.value ??
                        ""
                    ).trim(),

                    value: String(
                        item.code ??
                        item.value ??
                        item.key ??
                        ""
                    ).trim(),
                };
            })
            .filter((option) => option.label && option.value);
    }, [masters]);

    const firstUWDecisionOptions = useMemo(() => {
        const misc = (masters as Record<string, unknown> | undefined)?.misc;

        if (!Array.isArray(misc)) {
            return [];
        }

        return misc
            .filter((option) => {
                const item = option as Record<string, unknown>;

                return (
                    String(item.type ?? "").trim().toUpperCase() === "UW_DECISION" &&
                    String(item.isActive ?? "").trim().toUpperCase() === "Y"
                );
            })
            .map((option) => {
                const item = option as Record<string, unknown>;

                return {
                    label: String(
                        item.description ??
                        item.label ??
                        item.value ??
                        ""
                    ).trim(),

                    value: String(
                        item.code ??
                        item.value ??
                        item.key ??
                        ""
                    ).trim(),
                };
            })
            .filter((option) => option.label && option.value);
    }, [masters]);

    const riskReferralReasonOptions = useMemo(() => {
        const misc = (masters as Record<string, unknown> | undefined)?.misc;

        if (!Array.isArray(misc)) {
            return [];
        }

        return misc
            .filter((option) => {
                const item = option as Record<string, unknown>;

                return (
                    String(item.type ?? "").trim().toUpperCase() === "RISK" &&
                    String(item.isActive ?? "").trim().toUpperCase() === "Y"
                );
            })
            .map((option) => {
                const item = option as Record<string, unknown>;

                return {
                    label: String(
                        item.description ??
                        item.label ??
                        item.value ??
                        ""
                    ).trim(),

                    value: String(
                        item.code ??
                        item.value ??
                        item.key ??
                        ""
                    ).trim(),
                };
            })
            .filter((option) => option.label && option.value);
    }, [masters]);

    const reinsurerReferralReasonOptions = useMemo(() => {
        const misc = (masters as Record<string, unknown> | undefined)?.misc;

        if (!Array.isArray(misc)) {
            return [];
        }

        return misc
            .filter((option) => {
                const item = option as Record<string, unknown>;

                return (
                    String(item.type ?? "").trim().toUpperCase() === "REINSURER" &&
                    String(item.isActive ?? "").trim().toUpperCase() === "Y"
                );
            })
            .map((option) => {
                const item = option as Record<string, unknown>;

                return {
                    label: String(
                        item.description ??
                        item.label ??
                        item.value ??
                        ""
                    ).trim(),

                    value: String(
                        item.code ??
                        item.value ??
                        item.key ??
                        ""
                    ).trim(),
                };
            })
            .filter((option) => option.label && option.value);
    }, [masters]);

    const holdReasonOptions = useMemo(() => {
        const misc = (masters as Record<string, unknown> | undefined)?.misc;

        if (!Array.isArray(misc)) {
            return [];
        }

        return misc
            .filter((option) => {
                const item = option as Record<string, unknown>;

                return (
                    String(item.type ?? "").trim().toUpperCase() === "HOLD" &&
                    String(item.isActive ?? "").trim().toUpperCase() === "Y"
                );
            })
            .map((option) => {
                const item = option as Record<string, unknown>;

                return {
                    label: String(
                        item.description ??
                        item.label ??
                        item.value ??
                        ""
                    ).trim(),

                    value: String(
                        item.code ??
                        item.value ??
                        item.key ??
                        ""
                    ).trim(),
                };
            })
            .filter((option) => option.label && option.value);
    }, [masters]);

    const showDecisionCode = [
        "Reject",
        "Decline",
        "Postpone",
    ].includes(caseUWDecisionLabel) ||
        isStandardDecision ||
        isBorderlineStandardDecision;

    const showParallelDecision = [
        "Refer to HO CMO",
        "Refer to CMO",
        "Refer to Risk",
        "Refer to Accuity",
        "Raise Requirement",
    ].includes(caseUWDecisionLabel);

    const showFirstUWDecision = [
        "Refer to HOD",
        "Refer to Sr Uw",
        "Refer to Reinsurer",
        "Refer to HO CMO",
        "Refer to CMO",
    ].includes(caseUWDecisionLabel);

    const fetchDecisionCodes = new Set([
        "Reject",
        "Decline",
        "Postpone",
    ]);

    const showDecisionType = caseUWDecisionLabel === "Refer to Sr Uw" || caseUWDecisionLabel === "Refer to HOD";
    const isRejectDecision = caseUWDecisionLabel === "Reject";
    const isDeclineDecision = caseUWDecisionLabel === "Decline";
    const isPostponeDecision = caseUWDecisionLabel === "Postpone";
    const isCounterOfferDecision = caseUWDecisionLabel === "Counter Offer";
    const returnedDecisionCode = toRecord(decisionCodes[0]);
    const summary = Array.isArray(toRecord(drsData).summary)
        ? toRecord(drsData).summary as unknown[]
        : [];
    const healthDetails = toRecord(toRecord(summary[0]).healthDetail);
    const healthSmokerStatus = toText(
        healthDetails.smokerStatus ?? healthDetails.smoker_status,
    );
    const resolvedDecisionCode = (isStandardDecision || isBorderlineStandardDecision || isRejectDecision || isDeclineDecision || isPostponeDecision)
        ? (decisionCode || toText(
            returnedDecisionCode.value ?? returnedDecisionCode.code,
        ))
        : decisionCode;
    const resolvedSmokerStatus = isStandardDecision
        ? (healthSmokerStatus || smokerStatus || toText(
            returnedDecisionCode.smokerStatus ??
            returnedDecisionCode.smoker_status,
        ))
        : smokerStatus;
    const showBorderlineStandardReasons = isBorderlineStandardDecision;

    // const updateCounterOfferCell = (
    //     rowKey: CounterOfferRowKey,
    //     field: CounterOfferFieldKey,
    //     value: string
    // ) => {
    //     setCounterOfferTable((prev) => ({
    //         ...prev,
    //         [rowKey]: {
    //             ...prev[rowKey],
    //             [field]: value,
    //         },
    //     }));
    // };

    const dialogMessage = `Kindly reconfirm if you want to proceed with the case as "${caseUWDecisionLabel}"`;
    const riskMessage = "Kindly reconfirm if you want to initiate a risk investigation process for the applicant?";
    const decisionTaskContext = getDecisionTaskContext(
        drsData,
        applicationNumber,
    );
    const fallbackTask = splitCompositeTaskId(decisionTaskContext.taskId);

    const taskContext = {
        ...decisionTaskContext,
        taskId: taskId || fallbackTask.taskId,
        instanceId:
            instanceId ||
            toText(decisionTaskContext.instanceId) ||
            fallbackTask.instanceId,
    };
    const selectedReferralUser = roleUsers.find(
        (user) => user.ntid === referralValue,
    );

    const handleSubmit = async () => {
        if (!uwDecisionRemarks.trim()) {
            setSubmitMessage("UW Remarks is mandatory.");
            setSubmitStatus("failure");
            return;
        }
        const breValidation = validateDrsFinalBre(drsData);
        if (!breValidation.canPerformAction) {
            setSubmitMessage(breValidation.message);
            setSubmitStatus("failure");
            return;
        }

        if (!taskContext.taskId || !taskContext.userId || !taskContext.appNo || !taskContext.instanceId) {
            setSubmitMessage("Missing required case information. Please open the case from inbox again.");
            setSubmitStatus("failure");
            return;
        }

        let completedStep: "validation" | "bre" | "drs" | "completeTask" =
            "validation";

        try {
            setSubmitLoading(true);
            setSubmitMessage(null);
            setSubmitStatus(null);

            await dispatch(
                breThunk({
                    eventName: "BRE-RETAIL",
                    applicationNumber: taskContext.appNo,
                }),
            ).unwrap();

            completedStep = "bre";

            await dispatch(
                drsThunk({
                    applicationNo: taskContext.appNo,
                    userId: taskContext.userId,
                    roleType: String(
                        localStorage.getItem("roleType") ?? "",
                    ).trim(),
                    sections: ["latestBreDecision"],
                }),
            ).unwrap();

            completedStep = "drs";

            const toIibCode = (value: string): number | undefined => {
                const normalizedValue = value.trim();
                if (!normalizedValue) return undefined;

                const iibCode = Number(normalizedValue);
                return Number.isFinite(iibCode) ? iibCode : undefined;
            };

            const rejectIibCode = rejectReason.map(toIibCode)
                .filter((iibCode): iibCode is number => iibCode !== undefined);
            const borderlineStandardIibCodes = borderlineStandardReasons
                .map(toIibCode)
                .filter((iibCode): iibCode is number => iibCode !== undefined);
            const counterOfferIibCodes = counterOfferReasons
                .map(toIibCode)
                .filter((iibCode): iibCode is number => iibCode !== undefined);
            const postponeIibCode = toIibCode(postponeReason);
            const selectedDeclineIibCodes = declineReasons
                .map(toIibCode)
                .filter((iibCode): iibCode is number => iibCode !== undefined);

            const optionalReason: number | number[] | undefined =
                showBorderlineStandardReasons && borderlineStandardIibCodes.length > 0
                    ? borderlineStandardIibCodes
                    : isCounterOfferDecision && counterOfferIibCodes.length > 0
                        ? counterOfferIibCodes
                        : isRejectDecision && rejectIibCode.length > 0
                            ? rejectIibCode
                            : isDeclineDecision && selectedDeclineIibCodes.length > 0
                                ? selectedDeclineIibCodes
                                : isPostponeDecision && postponeIibCode !== undefined
                                    ? postponeIibCode
                                    : undefined;

            const completeTaskPayload = {
                requestContext: {
                    taskId: taskContext.taskId,
                    userId: taskContext.userId,
                    appNo: taskContext.appNo,
                    instanceId: taskContext.instanceId,
                    remarks: uwDecisionRemarks.trim(),
                    decision: effectiveCaseUWDecision.trim(),
                    ...(outlier.trim() ? { outlier: outlier.trim() } : {}),
                    ...(optionalReason !== undefined
                        ? { reason: optionalReason }
                        : {}),
                    ...(showDecisionCode && resolvedDecisionCode.trim()
                        ? { decisionCode: resolvedDecisionCode.trim() }
                        : {}),
                    ...(postponementPeriod.trim()
                        ? { postponementPeriod: postponementPeriod.trim() }
                        : {}),
                    ...(isStandardDecision && isTermProduct && resolvedSmokerStatus.trim()
                        ? { smokerStatus: resolvedSmokerStatus.trim() }
                        : {}),
                    ...(selectedReferralUser?.fullName?.trim()
                        ? { fullName: selectedReferralUser.fullName.trim() }
                        : {}),
                    ...(selectedReferralUser?.ntid?.trim()
                        ? { ntid: selectedReferralUser.ntid.trim() }
                        : {}),
                },
            };

            console.log("completeTaskThunk payload:", completeTaskPayload);

            const response = await dispatch(
                completeTaskThunk(completeTaskPayload),
            ).unwrap();

            completedStep = "completeTask";

            const { success, message } = getCompleteTaskResult(response);
            setSubmitMessage(message);
            setSubmitStatus(success ? "success" : "failure");

            if (success) {
                navigate(getInboxPath(safeBusinessType), {
                    state: {
                        snackbarMessage: message,
                    },
                });
            }
        } catch (error) {
            const fallbackMessage =
                completedStep === "validation"
                    ? "BRE failed. The decision was not submitted. Please try again."
                    : completedStep === "bre"
                        ? "BRE completed, but DRS refresh failed. The decision was not submitted. Please try again."
                        : "BRE and DRS refresh completed, but the task could not be completed. Please try again.";

            setSubmitMessage(
                error instanceof Error && error.message
                    ? error.message
                    : fallbackMessage,
            );
            setSubmitStatus("failure");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleSubmitIntent = () => {
        if (!uwDecisionRemarks.trim()) {
            setSubmitMessage("UW Remarks is mandatory.");
            setSubmitStatus("failure");
            return;
        }

        const breCounterSignValidation = validateBreCounterSignDecision(
            drsData,
            breResponse,
            caseUWDecisionLabel,
            resolvedDecisionCode,
        );
        if (!breCounterSignValidation.isValid) {
            setSubmitMessage(breCounterSignValidation.message);
            setSubmitStatus("failure");
            return;
        }

        const additionalUwValidation = validateAdditionalUwDecision(
            drsData,
            caseUWDecisionLabel,
            resolvedDecisionCode,
        );
        if (!additionalUwValidation.isValid) {
            setSubmitMessage(additionalUwValidation.message);
            setSubmitStatus("failure");
            return;
        }

        const breValidation = validateDrsFinalBre(drsData);
        const roleType = String(
            localStorage.getItem("roleType") ?? "",
        ).trim();
        if (!breValidation.canPerformAction) {
            setSubmitMessage(breValidation.message);
            setSubmitStatus("failure");
            return;
        }
        const applicantTabsValidation = validateApplicantTabsVisited(
            drsData,
            applicationNumber || taskContext.appNo || "",
            roleType,
        );
        if (!applicantTabsValidation.isValid) {
            setSubmitMessage(
                applicantTabsValidation.message ??
                "Please visit all Applicant Profile tabs before submitting the decision.",
            );
            setSubmitStatus("failure");
            return;
        }

        const requirementValidation = validateRequirementDecision(drsData, caseUWDecisionLabel);
        if (!requirementValidation.isValid) {
            setSubmitMessage(requirementValidation.message);
            setSubmitStatus("failure");
            return;
        }

        // Validate decline reasons selection
        if (isDeclineDecision && declineReasons.length === 0) {
            setSubmitMessage("Please select at least one decline reason.");
            setSubmitStatus("failure");
            return;
        }

        if (isBorderlineStandardDecision && borderlineStandardReasons.length === 0) {
            setSubmitMessage("Please select at least one borderline standard reason.");
            setSubmitStatus("failure");
            return;
        }

        if (referralRoleMap[caseUWDecisionLabel] && !selectedReferralUser) {
            setSubmitMessage("Please select a referral user.");
            setSubmitStatus("failure");
            return;
        }

        setConfirmationDialogOpen(true);
    };

    const userOptions = useMemo(() => {
        return roleUsers
            .filter(
                (user) =>
                    user.status.trim().toUpperCase() === "ACTIVE" &&
                    Boolean(user.fullName?.trim()) &&
                    !excludedReferralNtids.includes(user.ntid),
            )
            .map((user) => ({
                label: user.fullName!.trim(),
                value: user.ntid,
            }));
    }, [excludedReferralNtids, roleUsers]);

    const referralConfig = {
        "Refer to HOD": {
            label: "Name of HoD",
            options: userOptions,
        },

        "Refer to Sr Uw": {
            label: "Name of Sr.UW",
            options: userOptions,
        },

        "Refer to HO CMO": {
            label: "Name of HO CMO",
            options: userOptions,
        },

        "Refer to CMO": {
            label: "Name of CMO",
            options: userOptions,
        },

        "Refer to Risk": {
            label: "Risk Referral Reasons",
            options: riskReferralReasonOptions,
        },

        "Refer to Reinsurer": {
            label: "Reinsurer Referral reasons",
            options: reinsurerReferralReasonOptions,
        },
    }

    const selectedReferralConfig = referralConfig[caseUWDecisionLabel as keyof typeof referralConfig];

    const fetchUsersForReferralDecision = (decisionLabel: string) => {
        const roleName = referralRoleMap[decisionLabel];
        setRoleUsers([]);
        setRoleUsersLoading(false);
        setExcludedReferralNtids([]);
        setThresholdUserNtid("");
        setThresholdDialogOpen(false);

        if (!roleName) return;

        setRoleUsersLoading(true);
        dispatch(userRoleNameThunk({ roleName }))
            .unwrap()
            .then((response) => {
                setRoleUsers(
                    Array.isArray(response.data?.users)
                        ? response.data.users
                        : [],
                );
            })
            .catch((error) => {
                setRoleUsers([]);
                setSubmitMessage(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch users for the selected role.",
                );
                setSubmitStatus("failure");
            })
            .finally(() => setRoleUsersLoading(false));
    };

    const filteredParallelOptions = useMemo(() => {
        return parallelUWDecisionOptions.filter(
            (option) => option.label !== caseUWDecisionLabel
        );
    }, [caseUWDecisionLabel, parallelUWDecisionOptions]);

    return (
        <Box sx={{ px: 1 }}>
            <CustomAccordion title="UW Decision" defaultExpanded>
                <Box
                    sx={{
                        mt: 0.5,
                        p: 1,
                        borderRadius: "6px",
                        backgroundColor: "#f6f6f6",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "11px",
                            fontWeight: 400,
                            color: "#444",
                            mb: 0.5,
                        }}
                    >
                        UW Remarks
                    </Typography>

                    <CustomTextField
                        fullWidth
                        required
                        multiline
                        minRows={1}
                        placeholder="Enter remarks..."
                        value={uwDecisionRemarks}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 10000) {
                                setUwDecisionRemarks(value);
                            }
                        }} variant="outlined"
                        size="small"
                        sx={{
                            backgroundColor: "#fff",
                            borderRadius: "6px",
                            "& .MuiInputBase-root": {
                                minHeight: 48,
                                fontSize: "12px",
                            },
                            "& .MuiInputBase-input": {
                                py: 0.75,
                            },
                        }}
                    />
                    <Typography sx={{ display: "flex", justifyContent: "flex-end", fontSize: "10px", lineHeight: 1.2, color: "#888", mt: 0.2 }}>
                        {uwDecisionRemarks.length}/10000
                    </Typography>

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                            alignItems: "end",
                            columnGap: 1,
                            rowGap: 0.75,
                            "& > *": {
                                minWidth: 0,
                            },
                            "& .MuiFormControl-root": {
                                width: "100%",
                                minWidth: 0,
                            },
                            "& .MuiInputBase-root": {
                                height: 34,
                                minHeight: 34,
                                borderRadius: "6px",
                                backgroundColor: "#fff",
                                fontSize: "12px",
                            },
                            "& .MuiInputBase-input, & .MuiSelect-select": {
                                fontSize: "12px",
                                lineHeight: 1.2,
                                py: "7px !important",
                            },
                            "& .MuiTypography-root": {
                                fontSize: "11px",
                                lineHeight: 1.2,
                            },
                        }}
                    >
                        <CustomSelect
                            label="Case UW Decision"
                            value={effectiveCaseUWDecision}
                            onChange={async (value: string) => {
                                const selectedOption = caseUWDecisionOptions.find(
                                    (option) => option.value === value,
                                );
                                const masterDecisionCode = toText(
                                    selectedOption?.code ?? selectedOption?.value,
                                );
                                const selectedLabel = toMasterLabel(value, caseUWDecisionOptions);
                                const normalizedSelectedLabel = selectedLabel
                                    .trim()
                                    .replace(/[\s_-]+/g, " ")
                                    .toUpperCase();
                                const selectedIsStandard = normalizedSelectedLabel === "STANDARD";
                                const selectedIsBorderlineStandard =
                                    normalizedSelectedLabel === "BORDERLINE STANDARD" ||
                                    masterDecisionCode.trim().toUpperCase() === "BOR_STD";
                                const shouldFetchDecisionCode =
                                    selectedIsStandard ||
                                    selectedIsBorderlineStandard ||
                                    fetchDecisionCodes.has(selectedLabel);

                                setCaseUWDecision(value);
                                setOutlier("");
                                fetchUsersForReferralDecision(selectedLabel);
                                setReferralValue("");
                                setBorderlineStandardReasons([]);
                                setCounterOfferReasons([]);
                                setRejectReason([]);
                                setDeclineReasons([]);
                                setPostponeReason("");
                                setPostponementPeriod("");
                                // setCounterOfferTable(createCounterOfferTableState());
                                setSubmitMessage(null);
                                setSubmitStatus(null);

                                setDecisionCode("");
                                setSmokerStatus("");

                                if (shouldFetchDecisionCode) {
                                    const response = await dispatch(
                                        decisionCodeThunk({
                                            decision: masterDecisionCode,
                                            dataentry: dataEntry,
                                        } as Parameters<typeof decisionCodeThunk>[0])
                                    ).unwrap();

                                    setDecisionCode(toText(
                                        findFirstScalarByKey(response, [
                                            "decisionCode",
                                            "code",
                                            "value",
                                        ]),
                                    ));
                                    setSmokerStatus(toText(
                                        findFirstScalarByKey(response, [
                                            "smokerStatus",
                                            "smoker_status",
                                        ]),
                                    ));
                                } else {
                                    setDecisionCode("");
                                    setSmokerStatus("");
                                }

                                if (selectedLabel === "Raise Requirement") {
                                    openRequirementManagement(true);
                                }
                            }}
                            options={caseUWDecisionOptions}
                        />

                        {effectiveCaseUWDecision && (
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "11px",
                                        fontWeight: 400,
                                        color: "#444",
                                        lineHeight: 1.2,
                                        mb: 0.5,
                                    }}
                                >
                                    Outlier
                                </Typography>
                                <CustomTextField
                                    fullWidth
                                    size="small"
                                    value={outlier}
                                    placeholder="Enter outlier"
                                    onChange={(event) => setOutlier(event.target.value)}
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            height: 34,
                                            borderRadius: "6px",
                                        },
                                    }}
                                />
                            </Box>
                        )}

                        {showDecisionCode && (
                            (isStandardDecision || isBorderlineStandardDecision || isRejectDecision || isDeclineDecision || isPostponeDecision) ? (
                                <Box>
                                    <Typography
                                        sx={{
                                            fontSize: "11px",
                                            fontWeight: 400,
                                            color: "#444",
                                            lineHeight: 1.2,
                                            mb: 0.5,
                                        }}
                                    >
                                        Decision Code
                                    </Typography>
                                    <CustomTextField
                                        fullWidth
                                        size="small"
                                        value={resolvedDecisionCode}
                                        disabled
                                        sx={{
                                            "& .MuiInputBase-root": {
                                                height: 34,
                                                borderRadius: "6px",
                                            },
                                        }}
                                    />
                                </Box>
                            ) : (
                                <CustomSelect
                                    label="Decision Code"
                                    value={resolvedDecisionCode}
                                    onChange={setDecisionCode}
                                    options={decisionCodes}
                                />
                            )
                        )}

                        {isRejectDecision && (
                            <CustomSelect
                                label="Reject Reason"
                                value={rejectReason}
                                 multiple={true}
                                    maxCount={3}
                                onChange={setRejectReason}
                                options={nonMedicalOptions}
                            />
                        )}

                        {showBorderlineStandardReasons && (
                            <CustomSelect
                                label="Borderline Standard Reason"
                                value={borderlineStandardReasons}
                                multiple={true}
                                maxCount={3}
                                onChange={setBorderlineStandardReasons}
                                options={medicalAndNonMedicalOptions}
                                placeholder="Select reasons"
                            />
                        )}

                        {isCounterOfferDecision && (
                            <CustomSelect
                                label="Counter Offer Reason"
                                value={counterOfferReasons}
                                multiple={true}
                                maxCount={3}
                                onChange={setCounterOfferReasons}
                                options={medicalAndNonMedicalOptions}
                                placeholder="Select reasons"
                            />
                        )}

                        {isDeclineDecision && (
                            <>
                                <CustomSelect
                                    label="Decline Reason"
                                    multiple={true}
                                    maxCount={3}
                                    value={declineReasons}
                                    onChange={setDeclineReasons}
                                    options={medicalAndNonMedicalOptions}
                                    placeholder="Select reasons"
                                />
                            </>
                        )}

                        {isPostponeDecision && (
                            <>
                                <CustomSelect
                                    label="Postpone Reason"
                                    value={postponeReason}
                                    onChange={setPostponeReason}
                                    options={medicalAndNonMedicalOptions}
                                />
                                <CustomSelect
                                    label="Postponement Period"
                                    value={postponementPeriod}
                                    onChange={setPostponementPeriod}
                                    options={postponementPeriodOptions}
                                />
                            </>
                        )}

                        {isStandardDecision && isTermProduct && (
                            <Box>
                                <Typography
                                    sx={{
                                        fontSize: "12px",
                                        fontWeight: 400,
                                        color: "#444",
                                        lineHeight: 1.2,
                                        mb: 0.5,
                                    }}
                                >
                                    Smoker Status
                                </Typography>
                                <CustomTextField
                                    fullWidth
                                    size="small"
                                    value={resolvedSmokerStatus}
                                    disabled
                                    sx={{
                                        "& .MuiInputBase-root": {
                                            height: 34,
                                            borderRadius: "6px",
                                            backgroundColor: "#fff",
                                        },
                                    }}
                                />
                            </Box>
                        )}

                        {selectedReferralConfig && (
                            <CustomSelect
                                label={selectedReferralConfig.label}
                                value={referralValue}
                                onChange={(value: string) => {
                                    const selectedUser = roleUsers.find(
                                        (user) => user.ntid === value,
                                    );

                                    if (!selectedUser) {
                                        setReferralValue("");
                                        return;
                                    }

                                    if (selectedUser.threshold === true) {
                                        setReferralValue(value);
                                        setThresholdUserNtid(value);
                                        setThresholdDialogOpen(true);
                                        return;
                                    }

                                    setReferralValue(value);
                                }}
                                options={selectedReferralConfig.options}
                                disabled={roleUsersLoading}
                                placeholder={
                                    roleUsersLoading
                                        ? "Loading users..."
                                        : "Select user"
                                }
                            />
                        )}

                        {showParallelDecision && (
                            <CustomSelect
                                label="Parallel UW Decision"
                                value={parallelDecision}
                                onChange={setParallelDecision}
                                options={filteredParallelOptions}
                            />
                        )}

                        {caseUWDecisionLabel === "Hold" && (
                            <CustomSelect
                                label="Hold Reasons"
                                value={holdReasons}
                                onChange={setHoldReasons}
                                options={holdReasonOptions}
                            />
                        )}

                        {showFirstUWDecision && (
                            <CustomSelect
                                label="1st UW Decision"
                                value={uwDecision}
                                onChange={setUwDecision}
                                options={firstUWDecisionOptions}
                            />
                        )}
                    </Box>

                    {selectedReferralConfig && caseUWDecisionLabel === "Refer to Reinsurer" && (
                        <>
                            <UWReinsurerFields />
                        </>
                    )}

                    {showDecisionType && (
                        <Box sx={{ mt: 1 }}>
                            <CustomRadioGroup
                                row
                                value={decisionType}
                                onChange={(e) => setDecisionType(e.target.value)}
                                options={[
                                    { label: "Counter Sign", value: "counterSign" },
                                    { label: "Opinion", value: "opinion" },
                                ]}
                            />
                        </Box>
                    )}

                    {isCounterOfferDecision && (
                        // <Box sx={{ mt: 1.25 }}>
                        //     <Typography
                        //         sx={{
                        //             fontSize: "13px",
                        //             fontWeight: 600,
                        //             color: "#1f2937",
                        //             mb: 0.75,
                        //         }}
                        //     >
                        //         Counter Offer Details
                        //     </Typography>

                        //     <TableContainer
                        //         sx={{
                        //             border: "1px solid #d7d7d7",
                        //             borderRadius: "6px",
                        //             overflowX: "auto",
                        //             backgroundColor: "#fff",
                        //         }}
                        //     >
                        //         <Table size="small" sx={{ minWidth: 1900 }}>
                        //             <TableHead>
                        //                 <TableRow>
                        //                     {[
                        //                         "Application No.",
                        //                         "Proposer / Life Assured (auto filled)",
                        //                         "Applied SA (auto filled)",
                        //                         "Changed SA",
                        //                         "PT (auto filled)",
                        //                         "Changed PT",
                        //                         "PPT (auto filled)",
                        //                         "Changed PPT",
                        //                         "Extra Premium / Decision",
                        //                         "Premium Collected (auto filled)",
                        //                         "Revised Premium",
                        //                         "GST",
                        //                         "Reasons",
                        //                     ].map((header) => (
                        //                         <TableCell
                        //                             key={header}
                        //                             sx={{
                        //                                 backgroundColor: "#f3f7fc",
                        //                                 fontSize: "12px",
                        //                                 fontWeight: 600,
                        //                                 color: "#2b2b2b",
                        //                                 whiteSpace: "normal",
                        //                                 minWidth: 130,
                        //                                 borderRight: "1px solid #e3e3e3",
                        //                             }}
                        //                         >
                        //                             {header}
                        //                         </TableCell>
                        //                     ))}
                        //                 </TableRow>
                        //             </TableHead>

                        //             <TableBody>
                        //                 {[
                        //                     { key: "baseSumAssured", label: "Base Sum Assured" },
                        //                     { key: "riderSumAssured", label: "Rider Sum Assured" },
                        //                 ].map((row) => (
                        //                     <TableRow key={row.key}>
                        //                         <TableCell sx={{ minWidth: 160, fontWeight: 600 }}>{row.label}</TableCell>
                        //                         <TableCell><CustomTextField fullWidth size="small" value="Auto-filled" disabled /></TableCell>
                        //                         <TableCell><CustomTextField fullWidth size="small" value="Auto-filled" disabled /></TableCell>
                        //                         <TableCell>
                        //                             <CustomTextField
                        //                                 fullWidth
                        //                                 size="small"
                        //                                 value={counterOfferTable[row.key as CounterOfferRowKey].changedSA}
                        //                                 onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "changedSA", e.target.value)}
                        //                             />
                        //                         </TableCell>
                        //                         <TableCell><CustomTextField fullWidth size="small" value="Auto-filled" disabled /></TableCell>
                        //                         <TableCell>
                        //                             <CustomTextField
                        //                                 fullWidth
                        //                                 size="small"
                        //                                 value={counterOfferTable[row.key as CounterOfferRowKey].changedPT}
                        //                                 onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "changedPT", e.target.value)}
                        //                             />
                        //                         </TableCell>
                        //                         <TableCell><CustomTextField fullWidth size="small" value="Auto-filled" disabled /></TableCell>
                        //                         <TableCell>
                        //                             <CustomTextField
                        //                                 fullWidth
                        //                                 size="small"
                        //                                 value={counterOfferTable[row.key as CounterOfferRowKey].changedPPT}
                        //                                 onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "changedPPT", e.target.value)}
                        //                             />
                        //                         </TableCell>
                        //                         <TableCell>
                        //                             <CustomTextField
                        //                                 fullWidth
                        //                                 size="small"
                        //                                 value={counterOfferTable[row.key as CounterOfferRowKey].extraPremiumDecision}
                        //                                 onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "extraPremiumDecision", e.target.value)}
                        //                             />
                        //                         </TableCell>
                        //                         <TableCell><CustomTextField fullWidth size="small" value="Auto-filled" disabled /></TableCell>
                        //                         <TableCell>
                        //                             <CustomTextField
                        //                                 fullWidth
                        //                                 size="small"
                        //                                 value={counterOfferTable[row.key as CounterOfferRowKey].revisedPremium}
                        //                                 onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "revisedPremium", e.target.value)}
                        //                             />
                        //                         </TableCell>
                        //                         <TableCell>
                        //                             <CustomTextField
                        //                                 fullWidth
                        //                                 size="small"
                        //                                 value={counterOfferTable[row.key as CounterOfferRowKey].gst}
                        //                                 onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "gst", e.target.value)}
                        //                             />
                        //                         </TableCell>
                        //                         <TableCell>
                        //                             <CustomTextField
                        //                                 fullWidth
                        //                                 size="small"
                        //                                 value={counterOfferTable[row.key as CounterOfferRowKey].reasons}
                        //                                 onChange={(e) => updateCounterOfferCell(row.key as CounterOfferRowKey, "reasons", e.target.value)}
                        //                             />
                        //                         </TableCell>
                        //                     </TableRow>
                        //                 ))}
                        //             </TableBody>
                        //         </Table>
                        //     </TableContainer>
                        // </Box>

                        <CounterOffer />
                    )}

                </Box>
                {/* Submit Button */}
                {caseUWDecision && caseUWDecisionLabel !== "Refer to Reinsurer" && (
                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            mt: 1,
                        }}
                    >
                        <CustomButton
                            variant="contained"
                            disabled={submitLoading}
                            onClick={handleSubmitIntent}
                        sx={{
                            minWidth: 120,
                            height: 32,
                            borderRadius: "50px",
                            fontWeight: 600,
                            fontSize: "12px",
                            px: 2,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {submitLoading ? "Submitting..." : "Submit"}
                        </CustomButton>
                    </Box>
                )}

                {selectedReferralConfig && caseUWDecisionLabel === "Refer to Reinsurer" && (
                    <UWReinsurer onOpenConfirmation={handleSubmitIntent} />
                )}
            </CustomAccordion>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                open={confirmationDialogOpen}
                message={
                    caseUWDecisionLabel === "Refer to Risk"
                        ? riskMessage
                        : dialogMessage
                }
                onClose={() => setConfirmationDialogOpen(false)}
                onConfirm={() => {
                    setConfirmationDialogOpen(false);
                    void handleSubmit();
                }}
            />

            <Snackbar
                open={Boolean(submitMessage) && submitStatus === "failure"}
                autoHideDuration={3000}
                onClose={() => {
                    setSubmitMessage(null);
                    setSubmitStatus(null);
                }}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => {
                        setSubmitMessage(null);
                        setSubmitStatus(null);
                    }}
                    severity="error"
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {submitMessage}
                </Alert>
            </Snackbar>

            <ConfirmationDialog
                open={thresholdDialogOpen}
                title="Threshold Achieved"
                buttonText="OK"
                message="Threshold is achieved, kindly refer the case to some other User"
                onClose={() => {
                    if (thresholdUserNtid) {
                        setExcludedReferralNtids((current) =>
                            current.includes(thresholdUserNtid)
                                ? current
                                : [...current, thresholdUserNtid],
                        );
                    }

                    setReferralValue("");
                    setThresholdUserNtid("");
                    setThresholdDialogOpen(false);
                }}
            />

        </Box>
    )
}

export default UWDecision
