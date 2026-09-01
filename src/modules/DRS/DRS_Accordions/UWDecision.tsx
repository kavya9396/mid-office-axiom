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
    "Refer to Sr UW": "sruw",
    "Refer to CMO": "cmo",
    "Refer to HO CMO": "cmo",
};

const canonicalReferralDecisionLabel = (value: string) => {
    const normalized = value
        .trim()
        .replace(/[._-]+/g, " ")
        .replace(/\s+/g, " ")
        .toUpperCase();

    if (normalized === "REFER TO SR UW") return "Refer to Sr UW";
    if (normalized === "REFER TO HOD") return "Refer to HOD";
    if (normalized === "REFER TO HO CMO") return "Refer to HO CMO";
    if (normalized === "REFER TO CMO") return "Refer to CMO";
    if (normalized === "REFER TO RISK") return "Refer to Risk";
    if (normalized === "REFER TO REINSURER") return "Refer to Reinsurer";
    if (normalized === "REFER TO ACCUITY") return "Refer to Accuity";

    return value.trim();
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
    const breEventName =
        safeBusinessType === "group"
            ? "BRE-GROUP"
            : "BRE-RETAIL";

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
    const [parallelReferralValue, setParallelReferralValue] = useState("");
    const [parallelRoleUsers, setParallelRoleUsers] = useState<ReferralUser[]>([]);
    const [parallelRoleUsersLoading, setParallelRoleUsersLoading] = useState(false);
    const [holdReasons, setHoldReasons] = useState("");
    const [waiverJustificationReason, setWaiverJustificationReason] = useState("");
    const [waiverJustificationRemarks, setWaiverJustificationRemarks] = useState("");
    const [decisionType, setDecisionType] = useState("counterSign");
    const [referralReason, setReferralReason] = useState("");
    const [firstUwDecisionCode, setFirstUwDecisionCode] = useState("");
    const [firstUwSmokerStatus, setFirstUwSmokerStatus] = useState("");
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

    const drsRecord = toRecord(drsData);
    const nestedDrsRecord = toRecord(drsRecord.data);
    const requirementManagement = Array.isArray(drsRecord.requirementManagement)
        ? drsRecord.requirementManagement
        : Array.isArray(nestedDrsRecord.requirementManagement)
            ? nestedDrsRecord.requirementManagement
            : [];
    const requirementStatuses = requirementManagement.map((row) =>
        toText(toRecord(row).status).toUpperCase(),
    );
    const hasPendingRequirement = requirementStatuses.includes("PENDING");
    const hasWaivedRequirement = requirementStatuses.includes("WAIVED");

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
            const compactCode = normalizedCode.replace(/[\s_-]+/g, "");
            const compactLabel = normalizedLabel.replace(/\s+/g, "");
            const isRaiseRequirementOption =
                compactCode === "RAISEREQUIREMENT" ||
                compactCode === "RAISEREQ" ||
                compactLabel === "RAISEREQUIREMENT";
            const isAcceptOption =
                normalizedCode === "ACCEPT" ||
                normalizedLabel === "ACCEPT";
            const isBorderlineStandardOption =
                normalizedCode === "BOR_STD" ||
                normalizedLabel === "BORDERLINE STANDARD";

            // Raise Requirement is available only while one or more
            // requirements are still Pending. All other values remain visible
            // so the user can see the full decision list.
            if (!hasPendingRequirement && isRaiseRequirementOption) {
                return false;
            }

            // Accept is allowed only when the latest BRE decision is ST.
            if (isAcceptOption) {
                return finalBreDecision === "ST";
            }

            return (
                !isBorderlineStandardOption || canShowStandardDecision
            );
        });
    }, [
        canShowStandardDecision,
        finalBreDecision,
        hasPendingRequirement,
        masters,
    ]);

    const effectiveCaseUWDecision = caseUWDecisionOptions.some((option) => option.value === caseUWDecision)
        ? caseUWDecision
        : "";
    const isReferralDecisionOption = (option: { label: string }) =>
        canonicalReferralDecisionLabel(option.label).startsWith("Refer to ");
    const terminalDecisionOptions = useMemo(
        () => caseUWDecisionOptions.filter((option) => !isReferralDecisionOption(option)),
        [caseUWDecisionOptions],
    );
    const referralDecisionOptions = useMemo(
        () => caseUWDecisionOptions.filter(isReferralDecisionOption),
        [caseUWDecisionOptions],
    );
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

    const parallelDecisionLabel = canonicalReferralDecisionLabel(
        toMasterLabel(parallelDecision, parallelUWDecisionOptions),
    );

    const firstUWDecisionOptions = useMemo(() => {
        const masterRecord = toRecord(masters);
        const masterData = toRecord(masterRecord.data);
        const misc = masterRecord.misc ?? masterData.misc;

        if (!Array.isArray(misc)) {
            return [];
        }

        return misc
            .filter((option) => {
                const item = option as Record<string, unknown>;

                return (
                    String(item.type ?? "").trim().toUpperCase() === "TERM_DEC" &&
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
            .filter((option) => option.label && option.value)
            .filter((option) => {
                const isBorderlineStandard =
                    option.value.trim().toUpperCase() === "BOR_STD" ||
                    option.label.trim().toUpperCase() === "BORDERLINE STANDARD";

                return !isBorderlineStandard || canShowStandardDecision;
            });
    }, [canShowStandardDecision, masters]);

    const referralReasonOptions = useMemo(() => {
        const masterRecord = toRecord(masters);
        const masterData = toRecord(masterRecord.data);
        const misc = masterRecord.misc ?? masterData.misc;
        const list = Array.isArray(misc) ? misc : [];

        const referralDecisionLabel = ["Refer to HOD", "Refer to Sr UW"].includes(
            caseUWDecisionLabel,
        )
            ? caseUWDecisionLabel
            : parallelDecisionLabel;
        const isSrUwReferral = referralDecisionLabel === "Refer to Sr UW";
        const reasonType = isSrUwReferral
            ? decisionType === "opinion"
                ? "REF_SRUW_OP_RSN"
                : "REF_SRUW_CS_RSN"
            : decisionType === "opinion"
                ? "REF_HOD_OP_RSN"
                : "REF_HOD_CS_RSN";

        return list
            .filter((option) => {
                const item = toRecord(option);
                return (
                    toText(item.type).toUpperCase() === reasonType &&
                    toText(item.isActive).toUpperCase() === "Y"
                );
            })
            .map((option) => {
                const item = toRecord(option);
                return {
                    label: toText(item.description ?? item.value ?? item.code),
                    value: toText(item.code ?? item.value),
                };
            })
            .filter((option) => option.label && option.value);
    }, [caseUWDecisionLabel, decisionType, masters, parallelDecisionLabel]);

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

    const waiverJustificationOptions = useMemo(() => {
        const masterRecord = toRecord(masters);
        const masterData = toRecord(masterRecord.data);
        const misc = masterRecord.misc ?? masterData.misc;

        if (!Array.isArray(misc)) return [];

        return misc
            .map(toRecord)
            .filter((item) => {
                const type = toText(item.type).toUpperCase();
                return (
                    type.includes("WAIV") &&
                    (type.includes("RSN") || type.includes("REASON") || type.includes("JUST")) &&
                    toText(item.isActive).toUpperCase() !== "N"
                );
            })
            .map((item) => ({
                label: toText(item.description ?? item.label ?? item.value ?? item.code),
                value: toText(item.code ?? item.value ?? item.key),
            }))
            .filter((option) => option.label && option.value);
    }, [masters]);

    const showDecisionCode = [
        "Reject",
        "Decline",
        "Postpone",
        "Counter Offer",
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

    const firstUwReferralLabels = [
        "Refer to HOD",
        "Refer to Sr UW",
        "Refer to Reinsurer",
        "Refer to Risk",
        "Refer to Accuity",
        "Refer to HO CMO",
        "Refer to CMO",
    ];
    const showFirstUWDecision =
        firstUwReferralLabels.includes(caseUWDecisionLabel) ||
        firstUwReferralLabels.includes(parallelDecisionLabel);

    const fetchDecisionCodes = new Set([
        "Reject",
        "Decline",
        "Postpone",
        "Counter Offer",
    ]);

    const activeCounterSignReferralLabel = ["Refer to HOD", "Refer to Sr UW"].includes(
        caseUWDecisionLabel,
    )
        ? caseUWDecisionLabel
        : parallelDecisionLabel;
    const isReferToHod = activeCounterSignReferralLabel === "Refer to HOD";
    const isReferToSrUw = activeCounterSignReferralLabel === "Refer to Sr UW";
    const showReferralDecisionFlow = isReferToHod || isReferToSrUw;
    const showDecisionType = showReferralDecisionFlow;
    const showFirstUwTerminalFlow = showFirstUWDecision && Boolean(uwDecision);
    const referralReasonLabel = isReferToSrUw
        ? "Sr UW Reasons"
        : "HOD Reasons";
    const firstUwDecisionLabel = toMasterLabel(
        uwDecision,
        firstUWDecisionOptions,
    );
    const normalizedFirstUwDecisionLabel = firstUwDecisionLabel
        .trim()
        .replace(/[\s_-]+/g, " ")
        .toUpperCase();
    const isFirstUwStandard = normalizedFirstUwDecisionLabel === "STANDARD";
    const isFirstUwBorderlineStandard =
        normalizedFirstUwDecisionLabel === "BORDERLINE STANDARD" ||
        uwDecision.trim().toUpperCase() === "BOR_STD";
    const isFirstUwReject = normalizedFirstUwDecisionLabel === "REJECT";
    const isFirstUwDecline = normalizedFirstUwDecisionLabel === "DECLINE";
    const isFirstUwPostpone = normalizedFirstUwDecisionLabel === "POSTPONE";
    const isFirstUwCounterOffer = normalizedFirstUwDecisionLabel === "COUNTER OFFER";
    const isRaiseRequirementDecision =
        caseUWDecisionLabel
            .trim()
            .replace(/[\\s_-]+/g, "")
            .toUpperCase() === "RAISEREQUIREMENT" ||
        effectiveCaseUWDecision
            .trim()
            .replace(/[\\s_-]+/g, "")
            .toUpperCase() === "RAISEREQ";
    const isPendingRequirementDecisionBlocked =
        hasPendingRequirement && !isRaiseRequirementDecision;
    const pendingRequirementDecisionMessage =
        "Please select Raise Requirement while one or more requirements are Pending.";
    const showFirstUwDecisionCode =
        isFirstUwStandard ||
        isFirstUwBorderlineStandard ||
        isFirstUwReject ||
        isFirstUwDecline ||
        isFirstUwPostpone ||
        isFirstUwCounterOffer;
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
    const resolvedFirstUwSmokerStatus =
        healthSmokerStatus || firstUwSmokerStatus;
    const resolvedDecisionCode = (isStandardDecision || isBorderlineStandardDecision || isRejectDecision || isDeclineDecision || isPostponeDecision || isCounterOfferDecision)
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
    const selectedParallelReferralUser = parallelRoleUsers.find(
        (user) => user.ntid === parallelReferralValue,
    );

    const handleSubmit = async () => {
        if (!uwDecisionRemarks.trim()) {
            setSubmitMessage("UW Remarks is mandatory.");
            setSubmitStatus("failure");
            return;
        }
        if (isPendingRequirementDecisionBlocked) {
            setSubmitMessage(pendingRequirementDecisionMessage);
            setSubmitStatus("failure");
            return;
        }
        if (
            hasWaivedRequirement &&
            Boolean(effectiveCaseUWDecision) &&
            (!waiverJustificationReason.trim() || !waiverJustificationRemarks.trim())
        ) {
            setSubmitMessage("Select a waiver justification reason and enter waiver justification remarks.");
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
                    eventName: breEventName,
                    applicationNumber: taskContext.appNo,
                    businessType: safeBusinessType,
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
                    businessType: safeBusinessType,
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
            const optionalFirstUwReason: number | number[] | undefined =
                isFirstUwBorderlineStandard && borderlineStandardIibCodes.length > 0
                    ? borderlineStandardIibCodes
                    : isFirstUwCounterOffer && counterOfferIibCodes.length > 0
                        ? counterOfferIibCodes
                        : isFirstUwReject && rejectIibCode.length > 0
                            ? rejectIibCode
                            : isFirstUwDecline && selectedDeclineIibCodes.length > 0
                                ? selectedDeclineIibCodes
                                : isFirstUwPostpone && postponeIibCode !== undefined
                                    ? postponeIibCode
                                    : undefined;

            const completeTaskPayload = {
                businessType: safeBusinessType,
                requestContext: {
                    taskId: taskContext.taskId,
                    userId: taskContext.userId,
                    appNo: taskContext.appNo,
                    instanceId: taskContext.instanceId,
                    remarks: uwDecisionRemarks.trim(),
                    decision: effectiveCaseUWDecision.trim(),
                    ...(outlier.trim() ? { outlier: outlier.trim() } : {}),
                    ...(hasWaivedRequirement && effectiveCaseUWDecision
                        ? {
                            waiverJustificationReason: waiverJustificationReason.trim(),
                            waiverJustificationRemarks: waiverJustificationRemarks.trim(),
                        }
                        : {}),
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
                    ...(selectedReferralConfig && !selectedReferralUser && referralValue.trim()
                        ? { referralValue: referralValue.trim() }
                        : {}),
                    ...(parallelDecision.trim()
                        ? { parallelDecision: parallelDecision.trim() }
                        : {}),
                    ...(selectedParallelReferralUser?.fullName?.trim()
                        ? { parallelFullName: selectedParallelReferralUser.fullName.trim() }
                        : {}),
                    ...(selectedParallelReferralUser?.ntid?.trim()
                        ? { parallelNtid: selectedParallelReferralUser.ntid.trim() }
                        : {}),
                    ...(!selectedParallelReferralUser && parallelReferralValue.trim()
                        ? { parallelReferralReason: parallelReferralValue.trim() }
                        : {}),
                    ...(showReferralDecisionFlow && referralReason.trim()
                        ? isReferToSrUw
                            ? { srUwReason: referralReason.trim() }
                            : { hodReason: referralReason.trim() }
                        : {}),
                    ...(showReferralDecisionFlow
                        ? { decisionType }
                        : {}),
                    ...(showFirstUwTerminalFlow && uwDecision.trim()
                        ? { firstUwDecision: uwDecision.trim() }
                        : {}),
                    ...(showFirstUwTerminalFlow && showFirstUwDecisionCode && firstUwDecisionCode.trim()
                        ? { firstUwDecisionCode: firstUwDecisionCode.trim() }
                        : {}),
                    ...(showFirstUwTerminalFlow && optionalFirstUwReason !== undefined
                        ? { firstUwReason: optionalFirstUwReason }
                        : {}),
                    ...(showFirstUwTerminalFlow && isFirstUwStandard && isTermProduct && resolvedFirstUwSmokerStatus.trim()
                        ? { firstUwSmokerStatus: resolvedFirstUwSmokerStatus.trim() }
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

        // This is retained as a submit-time check as well as the dropdown
        // filtering above, so stale selections cannot bypass the rule.
        if (isPendingRequirementDecisionBlocked) {
            setSubmitMessage(pendingRequirementDecisionMessage);
            setSubmitStatus("failure");
            return;
        }
        if (
            hasWaivedRequirement &&
            Boolean(effectiveCaseUWDecision) &&
            (!waiverJustificationReason.trim() || !waiverJustificationRemarks.trim())
        ) {
            setSubmitMessage("Select a waiver justification reason and enter waiver justification remarks.");
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

        if (showReferralDecisionFlow && !referralReason.trim()) {
            setSubmitMessage(`Please select ${referralReasonLabel}.`);
            setSubmitStatus("failure");
            return;
        }

        if (showReferralDecisionFlow && !uwDecision.trim()) {
            setSubmitMessage("Please select 1st UW Decision.");
            setSubmitStatus("failure");
            return;
        }

        if (showFirstUwTerminalFlow && isFirstUwReject && rejectReason.length === 0) {
            setSubmitMessage("Please select at least one reject reason.");
            setSubmitStatus("failure");
            return;
        }

        if (showFirstUwTerminalFlow && isFirstUwBorderlineStandard && borderlineStandardReasons.length === 0) {
            setSubmitMessage("Please select at least one borderline standard reason.");
            setSubmitStatus("failure");
            return;
        }

        if (showFirstUwTerminalFlow && isFirstUwDecline && declineReasons.length === 0) {
            setSubmitMessage("Please select at least one decline reason.");
            setSubmitStatus("failure");
            return;
        }

        if (showFirstUwTerminalFlow && isFirstUwPostpone && !postponeReason.trim()) {
            setSubmitMessage("Please select postpone reason.");
            setSubmitStatus("failure");
            return;
        }

        if (showFirstUwTerminalFlow && isFirstUwPostpone && !postponementPeriod.trim()) {
            setSubmitMessage("Please select postponement period.");
            setSubmitStatus("failure");
            return;
        }

        if (showFirstUwTerminalFlow && isFirstUwCounterOffer && counterOfferReasons.length === 0) {
            setSubmitMessage("Please select at least one counter offer reason.");
            setSubmitStatus("failure");
            return;
        }

        if (referralRoleMap[caseUWDecisionLabel] && !selectedReferralUser) {
            setSubmitMessage("Please select a referral user.");
            setSubmitStatus("failure");
            return;
        }

        if (referralRoleMap[parallelDecisionLabel] && !selectedParallelReferralUser) {
            setSubmitMessage("Please select a user for the parallel UW decision.");
            setSubmitStatus("failure");
            return;
        }

        if (
            selectedParallelReferralConfig &&
            !referralRoleMap[parallelDecisionLabel] &&
            !parallelReferralValue.trim()
        ) {
            setSubmitMessage("Please complete the parallel UW referral field.");
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

    const parallelUserOptions = useMemo(() => {
        return parallelRoleUsers
            .filter(
                (user) =>
                    user.status.trim().toUpperCase() === "ACTIVE" &&
                    Boolean(user.fullName?.trim()),
            )
            .map((user) => ({
                label: user.fullName!.trim(),
                value: user.ntid,
            }));
    }, [parallelRoleUsers]);

    const referralConfig = {
        "Refer to HOD": {
            label: "Name of HoD",
            options: userOptions,
        },

        "Refer to Sr UW": {
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

    const parallelReferralConfig = {
        "Refer to HOD": { label: "Name of HoD", options: parallelUserOptions },
        "Refer to Sr UW": { label: "Name of Sr.UW", options: parallelUserOptions },
        "Refer to HO CMO": { label: "Name of HO CMO", options: parallelUserOptions },
        "Refer to CMO": { label: "Name of CMO", options: parallelUserOptions },
        "Refer to Risk": { label: "Risk Referral Reasons", options: riskReferralReasonOptions },
        "Refer to Reinsurer": { label: "Reinsurer Referral reasons", options: reinsurerReferralReasonOptions },
    };
    const selectedParallelReferralConfig = parallelReferralConfig[
        parallelDecisionLabel as keyof typeof parallelReferralConfig
    ];

    const fetchUsersForReferralDecision = (decisionLabel: string) => {
        const roleName = referralRoleMap[
            canonicalReferralDecisionLabel(decisionLabel)
        ];
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

    const fetchUsersForParallelDecision = (decisionLabel: string) => {
        const roleName = referralRoleMap[
            canonicalReferralDecisionLabel(decisionLabel)
        ];
        setParallelRoleUsers([]);
        setParallelRoleUsersLoading(false);

        if (!roleName) return;

        setParallelRoleUsersLoading(true);
        dispatch(userRoleNameThunk({ roleName }))
            .unwrap()
            .then((response) => {
                setParallelRoleUsers(
                    Array.isArray(response.data?.users)
                        ? response.data.users
                        : [],
                );
            })
            .catch((error) => {
                setParallelRoleUsers([]);
                setSubmitMessage(
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch users for the parallel decision.",
                );
                setSubmitStatus("failure");
            })
            .finally(() => setParallelRoleUsersLoading(false));
    };

    const filteredParallelOptions = useMemo(() => {
        const normalizeDecisionLabel = (value: string) =>
            value.trim().replace(/[\s_-]+/g, " ").toUpperCase();
        const normalizedCaseDecision = normalizeDecisionLabel(
            caseUWDecisionLabel,
        );

        return parallelUWDecisionOptions.filter((option) => {
            const normalizedOptionLabel = normalizeDecisionLabel(option.label);

            return normalizedOptionLabel !== normalizedCaseDecision;
        });
    }, [caseUWDecisionLabel, parallelUWDecisionOptions]);

    const handleCaseDecisionChange = async (value: string) => {
        const selectedOption = caseUWDecisionOptions.find((option) => option.value === value);
        const masterDecisionCode = toText(selectedOption?.code ?? selectedOption?.value);
        const selectedLabel = toMasterLabel(value, caseUWDecisionOptions);
        const normalizedSelectedLabel = selectedLabel.trim().replace(/[\s_-]+/g, " ").toUpperCase();
        const shouldFetchDecisionCode =
            normalizedSelectedLabel === "STANDARD" ||
            normalizedSelectedLabel === "BORDERLINE STANDARD" ||
            fetchDecisionCodes.has(selectedLabel);

        setCaseUWDecision(value);
        setOutlier("");
        fetchUsersForReferralDecision(selectedLabel);
        setReferralValue("");
        setParallelDecision("");
        setParallelReferralValue("");
        setParallelRoleUsers([]);
        setBorderlineStandardReasons([]);
        setCounterOfferReasons([]);
        setRejectReason([]);
        setDeclineReasons([]);
        setPostponeReason("");
        setPostponementPeriod("");
        setReferralReason("");
        setUwDecision("");
        setFirstUwDecisionCode("");
        setFirstUwSmokerStatus("");
        setSubmitMessage(null);
        setSubmitStatus(null);
        setDecisionCode("");
        setSmokerStatus("");

        if (shouldFetchDecisionCode) {
            try {
                const response = await dispatch(
                    decisionCodeThunk({ decision: masterDecisionCode, dataentry: dataEntry } as Parameters<typeof decisionCodeThunk>[0]),
                ).unwrap();
                setDecisionCode(toText(findFirstScalarByKey(response, ["decisionCode", "code", "value"])));
                setSmokerStatus(toText(findFirstScalarByKey(response, ["smokerStatus", "smoker_status"])));
            } catch (error) {
                setSubmitMessage(error instanceof Error ? error.message : "Unable to load the decision code.");
                setSubmitStatus("failure");
            }
        }

        if (selectedLabel === "Raise Requirement") openRequirementManagement(true);
    };

    const handleFirstUwDecisionChange = async (value: string) => {
        setUwDecision(value);
        setFirstUwDecisionCode("");
        setFirstUwSmokerStatus("");
        setBorderlineStandardReasons([]);
        setCounterOfferReasons([]);
        setRejectReason([]);
        setDeclineReasons([]);
        setPostponeReason("");
        setPostponementPeriod("");

        const selectedOption = firstUWDecisionOptions.find((option) => option.value === value);
        const selectedLabel = toText(selectedOption?.label);
        const normalizedLabel = selectedLabel.trim().replace(/[\s_-]+/g, " ").toUpperCase();
        const shouldFetch = ["STANDARD", "BORDERLINE STANDARD", "REJECT", "DECLINE", "POSTPONE", "COUNTER OFFER"].includes(normalizedLabel);
        if (!shouldFetch) return;

        try {
            const response = await dispatch(
                decisionCodeThunk({ decision: value, dataentry: dataEntry } as Parameters<typeof decisionCodeThunk>[0]),
            ).unwrap();
            setFirstUwDecisionCode(toText(findFirstScalarByKey(response, ["decisionCode", "code", "value"])));
            setFirstUwSmokerStatus(toText(findFirstScalarByKey(response, ["smokerStatus", "smoker_status"])));
        } catch (error) {
            setSubmitMessage(error instanceof Error ? error.message : "Unable to load the terminal decision details.");
            setSubmitStatus("failure");
        }
    };

    const handleReferralDecisionChange = async (value: string) => {
        const existingTerminalDecision = isReferralDecisionOption({ label: caseUWDecisionLabel })
            ? uwDecision
            : effectiveCaseUWDecision;
        const existingDecisionCode = decisionCode;
        const existingSmokerStatus = smokerStatus;

        await handleCaseDecisionChange(value);

        if (existingTerminalDecision) {
            setUwDecision(existingTerminalDecision);
            setFirstUwDecisionCode(existingDecisionCode);
            setFirstUwSmokerStatus(existingSmokerStatus);
        }
    };

    const handleRemoveReferral = () => {
        setCaseUWDecision(uwDecision);
        setDecisionCode(firstUwDecisionCode);
        setSmokerStatus(firstUwSmokerStatus);
        setUwDecision("");
        setFirstUwDecisionCode("");
        setFirstUwSmokerStatus("");
        setReferralValue("");
        setReferralReason("");
        setRoleUsers([]);
        setParallelDecision("");
        setParallelReferralValue("");
        setParallelRoleUsers([]);
        setDecisionType("counterSign");
        setSubmitMessage(null);
        setSubmitStatus(null);
    };

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
                            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                            gap: 1,
                            mt: 1,
                            mb: 1.25,
                        }}
                    >
                        <Box sx={{ p: 1, border: "1px solid #dbe5f0", borderRadius: 1.5, backgroundColor: "#fff" }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#243b53", mb: 0.5 }}>
                                Terminal decision
                            </Typography>
                            <CustomSelect
                                label={isReferralDecisionOption({ label: caseUWDecisionLabel }) ? "Terminal decision (required)" : "Select terminal decision"}
                                value={isReferralDecisionOption({ label: caseUWDecisionLabel }) ? uwDecision : effectiveCaseUWDecision}
                                onChange={isReferralDecisionOption({ label: caseUWDecisionLabel }) ? handleFirstUwDecisionChange : handleCaseDecisionChange}
                                options={isReferralDecisionOption({ label: caseUWDecisionLabel }) ? firstUWDecisionOptions : terminalDecisionOptions}
                                placeholder="Select terminal decision"
                            />
                        </Box>

                        <Box sx={{ p: 1, border: "1px solid #d7e8df", borderRadius: 1.5, backgroundColor: "#fbfffc" }}>
                            <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#24613b", mb: 0.5 }}>
                                Referral (optional)
                            </Typography>
                            <CustomSelect
                                label="Select referral"
                                value={isReferralDecisionOption({ label: caseUWDecisionLabel }) ? effectiveCaseUWDecision : ""}
                                onChange={handleReferralDecisionChange}
                                options={referralDecisionOptions}
                                placeholder="Select referral"
                            />
                        </Box>
                    </Box>

                    {effectiveCaseUWDecision && isReferralDecisionOption({ label: caseUWDecisionLabel }) && (
                        <Box sx={{ mb: 1, px: 1, py: 0.75, borderRadius: 1, backgroundColor: "#eef8f1", border: "1px solid #d7e8df" }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                                <Typography sx={{ fontSize: 11, fontWeight: 700, color: "#24613b" }}>
                                    Referral routing details
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
                                    {showDecisionType && (
                                        <Box
                                            sx={{
                                                px: 0.5,
                                                py: 0.1,
                                                border: "1px solid #c8dfd0",
                                                borderRadius: 5,
                                                backgroundColor: "#fff",
                                                "& .MuiFormControlLabel-root": { mr: 0.5, ml: 0, my: 0 },
                                                "& .MuiRadio-root": { p: 0.3 },
                                                "& .MuiTypography-root": { fontSize: "10px !important", fontWeight: 600 },
                                            }}
                                        >
                                            <CustomRadioGroup
                                                row
                                                value={decisionType}
                                                onChange={(e) => {
                                                    setDecisionType(e.target.value);
                                                    setReferralReason("");
                                                }}
                                                options={[
                                                    { label: "Counter Sign", value: "counterSign" },
                                                    { label: "Opinion", value: "opinion" },
                                                ]}
                                            />
                                        </Box>
                                    )}
                                    <CustomButton
                                        variant="outlined"
                                        onClick={handleRemoveReferral}
                                        sx={{ minWidth: 0, height: 26, px: 1, borderRadius: 4, fontSize: "10px", fontWeight: 700, color: "#a33b3b", borderColor: "#d8a7a7" }}
                                    >
                                        Remove referral
                                    </CustomButton>
                                </Box>
                            </Box>
                            <Typography sx={{ fontSize: 10, color: "#47765a", mt: 0.25 }}>
                                Choose the required terminal decision above, then select the recipient and referral details below.
                            </Typography>
                        </Box>
                    )}

                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: isReferralDecisionOption({ label: caseUWDecisionLabel })
                                ? "repeat(3, minmax(0, 1fr))"
                                : "repeat(3, minmax(0, 1fr))",
                            alignItems: "end",
                            columnGap: 1,
                            rowGap: 0.75,
                            ...(isReferralDecisionOption({ label: caseUWDecisionLabel })
                                ? {
                                    p: 1,
                                    border: "1px solid #d7e8df",
                                    borderRadius: 1.5,
                                    backgroundColor: "#fbfffc",
                                }
                                : {}),
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
                                fontSize: "11px",
                            },
                            "& .MuiInputBase-input, & .MuiSelect-select": {
                                fontSize: "11px",
                                lineHeight: 1.2,
                                py: "7px !important",
                            },
                            "& .MuiTypography-root": {
                                fontSize: "10px",
                                lineHeight: 1.2,
                            },
                        }}
                    >
                        {isReferralDecisionOption({ label: caseUWDecisionLabel }) && (
                            <Typography sx={{ gridColumn: "1 / -1", fontWeight: 700, color: "#24613b" }}>
                                Referral routing details
                            </Typography>
                        )}
                        {caseUWDecision === "__legacy_case_decision__" && (
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
                                setParallelDecision("");
                                setParallelReferralValue("");
                                setParallelRoleUsers([]);
                                setBorderlineStandardReasons([]);
                                setCounterOfferReasons([]);
                                setRejectReason([]);
                                setDeclineReasons([]);
                                setPostponeReason("");
                                setPostponementPeriod("");
                                setReferralReason("");
                                setUwDecision("");
                                setFirstUwDecisionCode("");
                                setFirstUwSmokerStatus("");
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
                        )}

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

                        {hasWaivedRequirement && effectiveCaseUWDecision && (
                            <>
                                <CustomSelect
                                    label="Waiver Justification"
                                    value={waiverJustificationReason}
                                    onChange={setWaiverJustificationReason}
                                    options={waiverJustificationOptions}
                                    placeholder="Select justification"
                                />
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
                                        Waiver Justification Remarks
                                    </Typography>
                                    <CustomTextField
                                        fullWidth
                                        required
                                        size="small"
                                        value={waiverJustificationRemarks}
                                        placeholder="Enter justification"
                                        onChange={(event) =>
                                            setWaiverJustificationRemarks(event.target.value)
                                        }
                                    />
                                </Box>
                            </>
                        )}

                        {showDecisionCode && (
                            (isStandardDecision || isBorderlineStandardDecision || isRejectDecision || isDeclineDecision || isPostponeDecision || isCounterOfferDecision) ? (
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
                                    if (!referralRoleMap[caseUWDecisionLabel]) {
                                        setReferralValue(value);
                                        return;
                                    }

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
                                onChange={(value: string) => {
                                    const selectedLabel = toMasterLabel(
                                        value,
                                        parallelUWDecisionOptions,
                                    );
                                    setParallelDecision(value);
                                    setParallelReferralValue("");
                                    setReferralReason("");
                                    setDecisionType("counterSign");
                                    fetchUsersForParallelDecision(selectedLabel);
                                }}
                                options={filteredParallelOptions}
                            />
                        )}

                        {showParallelDecision && selectedParallelReferralConfig && (
                            <CustomSelect
                                label={selectedParallelReferralConfig.label}
                                value={parallelReferralValue}
                                onChange={setParallelReferralValue}
                                options={selectedParallelReferralConfig.options}
                                disabled={parallelRoleUsersLoading}
                                placeholder={
                                    parallelRoleUsersLoading
                                        ? "Loading users..."
                                        : "Select value"
                                }
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

                        {showReferralDecisionFlow && (
                            <CustomSelect
                                label={referralReasonLabel}
                                value={referralReason}
                                onChange={setReferralReason}
                                options={referralReasonOptions}
                                placeholder={`Select ${referralReasonLabel}`}
                            />
                        )}

                        {showFirstUWDecision && !isReferralDecisionOption({ label: caseUWDecisionLabel }) && (
                            <CustomSelect
                                label="1st UW Decision"
                                value={uwDecision}
                                onChange={async (value: string) => {
                                    setUwDecision(value);
                                    setFirstUwDecisionCode("");
                                    setFirstUwSmokerStatus("");
                                    setBorderlineStandardReasons([]);
                                    setCounterOfferReasons([]);
                                    setRejectReason([]);
                                    setDeclineReasons([]);
                                    setPostponeReason("");
                                    setPostponementPeriod("");

                                    const selectedOption = firstUWDecisionOptions.find(
                                        (option) => option.value === value,
                                    );
                                    const selectedLabel = toText(selectedOption?.label);
                                    const normalizedLabel = selectedLabel
                                        .trim()
                                        .replace(/[\s_-]+/g, " ")
                                        .toUpperCase();
                                    const shouldFetch = [
                                        "STANDARD",
                                        "BORDERLINE STANDARD",
                                        "REJECT",
                                        "DECLINE",
                                        "POSTPONE",
                                        "COUNTER OFFER",
                                    ].includes(normalizedLabel);

                                    if (!shouldFetch) return;

                                    const response = await dispatch(
                                        decisionCodeThunk({
                                            decision: value,
                                            dataentry: dataEntry,
                                        } as Parameters<typeof decisionCodeThunk>[0]),
                                    ).unwrap();

                                    setFirstUwDecisionCode(toText(
                                        findFirstScalarByKey(response, [
                                            "decisionCode",
                                            "code",
                                            "value",
                                        ]),
                                    ));
                                    setFirstUwSmokerStatus(toText(
                                        findFirstScalarByKey(response, [
                                            "smokerStatus",
                                            "smoker_status",
                                        ]),
                                    ));
                                }}
                                options={firstUWDecisionOptions}
                            />
                        )}

                        {showFirstUwTerminalFlow && showFirstUwDecisionCode && (
                            <Box>
                                <Typography sx={{ fontSize: "11px", color: "#444", lineHeight: 1.2, mb: 0.5 }}>
                                    Decision Code
                                </Typography>
                                <CustomTextField
                                    fullWidth
                                    size="small"
                                    value={firstUwDecisionCode}
                                    disabled
                                    sx={{ "& .MuiInputBase-root": { height: 34, borderRadius: "6px" } }}
                                />
                            </Box>
                        )}

                        {showFirstUwTerminalFlow && isFirstUwReject && (
                            <CustomSelect label="Reject Reason" value={rejectReason} multiple={true} maxCount={3} onChange={setRejectReason} options={nonMedicalOptions} />
                        )}

                        {showFirstUwTerminalFlow && isFirstUwBorderlineStandard && (
                            <CustomSelect label="Borderline Standard Reason" value={borderlineStandardReasons} multiple={true} maxCount={3} onChange={setBorderlineStandardReasons} options={medicalAndNonMedicalOptions} />
                        )}

                        {showFirstUwTerminalFlow && isFirstUwDecline && (
                            <CustomSelect label="Decline Reason" value={declineReasons} multiple={true} maxCount={3} onChange={setDeclineReasons} options={medicalAndNonMedicalOptions} />
                        )}

                        {showFirstUwTerminalFlow && isFirstUwPostpone && (
                            <>
                                <CustomSelect label="Postpone Reason" value={postponeReason} onChange={setPostponeReason} options={medicalAndNonMedicalOptions} />
                                <CustomSelect label="Postponement Period" value={postponementPeriod} onChange={setPostponementPeriod} options={postponementPeriodOptions} />
                            </>
                        )}

                        {showFirstUwTerminalFlow && isFirstUwCounterOffer && (
                            <CustomSelect label="Counter Offer Reason" value={counterOfferReasons} multiple={true} maxCount={3} onChange={setCounterOfferReasons} options={medicalAndNonMedicalOptions} />
                        )}

                        {showFirstUwTerminalFlow && isFirstUwStandard && isTermProduct && (
                            <Box>
                                <Typography sx={{ fontSize: "11px", color: "#444", lineHeight: 1.2, mb: 0.5 }}>
                                    Smoker Status
                                </Typography>
                                <CustomTextField
                                    fullWidth
                                    size="small"
                                    value={resolvedFirstUwSmokerStatus}
                                    disabled
                                    sx={{ "& .MuiInputBase-root": { height: 34, borderRadius: "6px", backgroundColor: "#fff" } }}
                                />
                            </Box>
                        )}
                    </Box>

                    {selectedReferralConfig && caseUWDecisionLabel === "Refer to Reinsurer" && (
                        <>
                            <UWReinsurerFields />
                        </>
                    )}

                    {(isCounterOfferDecision ||
                        (showFirstUwTerminalFlow && isFirstUwCounterOffer)) && (
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

                        <CounterOffer
                            reasonOptions={medicalAndNonMedicalOptions}
                        />
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
