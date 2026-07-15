import { accordionRegistry, DRS_LAYOUTS, getPoolWiseAvailableAccordions } from "./drs-layouts";
import BackButton from "../../components/layout/BackButton";
import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Fragment, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store/store";
import type { RootState } from "../../store/store";
import { drsThunk } from "../../store/thunks/drsThunk";
import { mastersThunk } from "../../store/thunks/mastersThunk";
import { breRetriggerThunk } from "../../store/thunks/breRetriggerThunk";
import { setBreExternalApiOutputs, setDrsData } from "../../store/slices/drsSlice";
import { useAppContext } from "../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../routes/routes";
import type { DRSBreOutput, DRSData } from "../../types/drs.types";

const toText = (value: unknown) => String(value ?? "").trim();

const mapLegacyBreDecisionToOutput = (value: unknown): DRSBreOutput | null => {
    const record = value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : null;

    if (!record) {
        return null;
    }

    const decision = toText(record.decision);
    const initialDecision = toText(record.initialDecision);
    const remarks = toText(record.remarks);
    const discrepancy = toText(record.discrepancy);

    if (!decision && !initialDecision && !remarks && !discrepancy) {
        return null;
    }

    return {
        systemDecision: decision,
        decisionTypes: {
            breDecision: decision,
            breAction: toText(record.action),
            breRequirement: discrepancy,
            initialDecision,
        },
        requirements: [],
        systemDecisionDateTime: toText(record.timestamp),
        errorResp: "",
        breRemarks: remarks,
    };
};

const mapper = {
    "CMO Pool": "RETAIL_CMO_POOL",
    "CUW Pool": "RETAIL_CUW_POOL",
    "CVT Pool": "RETAIL_CVT_POOL",
    "CPT Pool":"RETAIL_CPT_POOL",
    "HOD Pool":"RETAIL_HOD_POOL",
    "Sr UW Pool":"RETAIL_SR_UW_POOL",
    "Ready For Issuance Pool":"RETAIL_READY_FOR_ISSUANCE_POOL",
    "System Wait Pool - Non medical":"RETAIL_SYSTEM_WAIT_POOL_NON_MEDICAL",
    "AMR - Non medical":"RETAIL_AMR_NON_MEDICAL",
    "Reconsideration Pool":"RETAIL_RECONSIDERATION_POOL",
    "Pre Issuance Servicing Pool": "RETAIL_PRE_ISSUANCE_SERVICING_POOL",
    "Exceptional Pool": "RETAIL_EXCEPTIONAL_POOL",
    "PIVV Pool": "RETAIL_PIVV_POOL",
    "DVT Pool":"GROUP_DVT_POOL",
    "1st UW Pool":"RETAIL_CUW_POOL",
    "GUW Pool":"GROUP_GUW_POOL",
    "MMT Pool":"GROUP_MMT_POOL",
    "SUW Pool":"RETAIL_SUW_POOL",
    "Vendor CMO Pool":"RETAIL_VENDOR_CMO_POOL",
    "COPS Pool":"RETAIL_COPS_POOL",
    "IT Pool":"RETAIL_IT_POOL",
    "System Wait Pool - Medical":"RETAIL_SYSTEM_WAIT_POOL_AMR_MEDICAL",
    "System Wait Pool - Non Medical":"RETAIL_SYSTEM_WAIT_POOL_AMR_NON_MEDICAL",
    "RI Pool":"RETAIL_REINSURER_POOL",
    "Requirement Pool":"RETAIL_REQUIREMENT_REVIEW_POOL",
    "Claim Audit Pool":"RETAIL_CUW_CLAIM_AUDIT",
    "Accuity Pool":"RETAIL_ACCUITY_USER",
    "ECG Pool":"RETAIL_ECG_POOL",
    "TMT Pool":"RETAIL_TMT_POOL",
    "Grievance Pool":"RETAIL_GRIEVANCE_POOL",
    "Reject Pool":"RETAIL_REJECT_POOL",
    "GUW_FORMAL_TASK":"GUW_FORMAL_TASK",
    "DVT_FORMAL_TASK": "DVT_FORMAL_TASK",
    "RISK_TASK":"RISK_TASK",
    "PRE_LOGIN_TASK":"PRE_LOGIN_TASK"
}

const getSelectedCaseContext = (): Record<string, unknown> => {
    try {
        const raw = localStorage.getItem("selectedCaseContext");
        const parsed = raw ? JSON.parse(raw) : {};
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? (parsed as Record<string, unknown>)
            : {};
    } catch {
        return {};
    }
};

const getStoredSearchDrsData = (): DRSData | null => {
    try {
        const raw = localStorage.getItem("searchApplicationDrsData");
        const parsed = raw ? JSON.parse(raw) : null;
        return parsed && typeof parsed === "object" && !Array.isArray(parsed)
            ? (parsed as DRSData)
            : null;
    } catch {
        return null;
    }
};

const readOnlyContentSx = {
    "& input, & textarea, & .MuiSelect-select": {
        pointerEvents: "none",
    },
    "& button:not(.MuiAccordionSummary-root):not([data-drs-readonly-nav='true'])": {
        display: "none",
    },
};

const searchHiddenAccordionIds = new Set([
    "cvtDecision",
    "dvtDecision",
    "uwDecision",
    "pivvDecision",
    "exceptionDecision",
    "hodDecision",
    "sruwDecision",
    "hoCMODecision",
    "reinsurerDecision",
    "reconsiderationPoolDecision",
    "accuityDecision",
    "riskDecision",
    "decisionHistory",
    "uwChecklist",
    "uacChecklist",
]);

const DRS = () => {
    const roleType = localStorage.getItem("roleType") ?? "";
    const userId = (localStorage.getItem("userId") ?? localStorage.getItem("username") ?? "").trim();
    const { applicationNumber, businessType } = useAppContext();
    const drsData = useSelector((state: RootState) => state.drs.data);

    const layout = mapper[roleType as keyof typeof mapper];
    const layoutAccordions = useMemo(() => (layout ? (DRS_LAYOUTS[layout] ?? []) : []), [layout]);
    const sections = useMemo(() => layoutAccordions.map((accordion) => String(accordion)), [layoutAccordions]);
    const visibleAccordions = useMemo(
        () => getPoolWiseAvailableAccordions(layout, drsData),
        [layout, drsData],
    );
    const navigate = useNavigate();
    const safeBusinessType =
        normalizeBusinessType(businessType) ??
        normalizeBusinessType(localStorage.getItem("businessType")) ??
        "retail";

    const dispatch = useDispatch<AppDispatch>();
    const safeApplicationNumber = applicationNumber ?? "";
    const selectedCaseContext = getSelectedCaseContext();
    const isSearchReadOnlyMode =
        localStorage.getItem("drsReadOnlyMode") === "true" &&
        selectedCaseContext.source === "searchApplication" &&
        selectedCaseContext.readOnly === true &&
        String(selectedCaseContext.applicationNo ?? "") === safeApplicationNumber;
    const displayAccordions = useMemo(
        () => isSearchReadOnlyMode
            ? visibleAccordions.filter((accordionId) => !searchHiddenAccordionIds.has(String(accordionId)))
            : visibleAccordions,
        [isSearchReadOnlyMode, visibleAccordions],
    );

    useEffect(() => {
        if (!safeApplicationNumber || !roleType) {
            return;
        }

        if (isSearchReadOnlyMode) {
            if (!drsData) {
                const storedDrsData = getStoredSearchDrsData();
                if (storedDrsData) {
                    dispatch(setDrsData(storedDrsData));
                }
            }

            dispatch(
                mastersThunk({
                    masters: ["title", "gender", "nationality", "idProof", "addressProof", "state", "country", "exceptionDecision"],
                }),
            );
            return;
        }

        if (!userId) {
            return;
        }

        const loadDRSAndBRE = async () => {
            try {
                const drsResponse = await dispatch(
                    drsThunk({
                        applicationNo: safeApplicationNumber,
                        userId,
                        roleType,
                        sections,
                    }),
                ).unwrap();

                try {
                    const breResponse = await dispatch(
                        breRetriggerThunk({
                            data: drsResponse.data,
                        }),
                    ).unwrap();

                    const updatedBrePayload = breResponse.data;
                    const dataRecord = drsResponse.data as unknown as Record<string, unknown>;
                    const originalBreOutput =
                        drsResponse.data.externalAPIs?.breOutput ??
                        mapLegacyBreDecisionToOutput(dataRecord.breDecision);
                    if (
                        updatedBrePayload?.breOutput ||
                        updatedBrePayload?.initialBreOutput ||
                        updatedBrePayload?.medicalBreOutput ||
                        updatedBrePayload?.financialBreOutput
                    ) {
                        dispatch(
                            setBreExternalApiOutputs({
                                breOutput: updatedBrePayload?.breOutput,
                                initialBreOutput: originalBreOutput ?? updatedBrePayload?.initialBreOutput,
                                breRetriggerStatus: "success",
                                medicalBreOutput: updatedBrePayload?.medicalBreOutput,
                                financialBreOutput: updatedBrePayload?.financialBreOutput,
                            }),
                        );
                    }
                } catch (error) {
                    const dataRecord = drsResponse.data as unknown as Record<string, unknown>;
                    const originalBreOutput =
                        drsResponse.data.externalAPIs?.initialBreOutput ??
                        drsResponse.data.externalAPIs?.breOutput ??
                        mapLegacyBreDecisionToOutput(dataRecord.breDecision);

                    dispatch(
                        setBreExternalApiOutputs({
                            initialBreOutput: originalBreOutput ?? undefined,
                            breRetriggerStatus: "failure",
                        }),
                    );
                    console.error("Failed to retrigger BRE from DRS response:", error);
                }
            } catch (error) {
                console.error("Failed to load DRS:", error);
            } finally {
                dispatch(
                    mastersThunk({
                        masters: ["title", "gender", "nationality", "idProof", "addressProof", "state", "country", "exceptionDecision"],
                    }),
                );
            }
        };

        void loadDRSAndBRE();
    }, [dispatch, drsData, isSearchReadOnlyMode, roleType, safeApplicationNumber, sections, userId]);


    return (
        <>
            <BackButton
                label="Back to inbox"
                justify="flex-start"
                onClick={() => navigate(getInboxPath(safeBusinessType))}
                rightSlot={roleType != 'MMT Pool' ? 
                    <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
                            <Typography
                                sx={{
                                    fontSize: "18px",
                                    fontWeight: 800,
                                    color: "#161616",
                                    lineHeight: 1,
                                }}
                            >
                                Application No. : {safeApplicationNumber}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: "14px",
                                    fontWeight: 700,
                                    color: "#0f4c81",
                                    backgroundColor: "#dcefff",
                                    border: "1px solid #b8d8f4",
                                    borderRadius: "999px",
                                    px: 1.5,
                                    py: 0.5,
                                    lineHeight: 1,
                                }}
                            >
                                Business Type : {safeBusinessType.toUpperCase()}
                            </Typography>
                        </div>
                    </div>:''
                }
            />
            <Box sx={isSearchReadOnlyMode ? readOnlyContentSx : undefined}>
                {displayAccordions.map((accordionId) => {
                    const AccordionComponent = accordionRegistry[accordionId as keyof typeof accordionRegistry];
                    if (!AccordionComponent) {
                        return null;
                    }
                    return (
                        <Fragment key={accordionId}>
                            <AccordionComponent />
                        </Fragment>
                    );
                })}
            </Box>
        </>
    )
}

export default DRS