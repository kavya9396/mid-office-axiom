import { accordionRegistry, DRS_LAYOUTS, getPoolWiseAvailableAccordions } from "./drs-layouts";
import BackButton from "../../components/layout/BackButton";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Fragment, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store/store";
import type { RootState } from "../../store/store";
import { drsThunk } from "../../store/thunks/drsThunk";
import { mastersThunk } from "../../store/thunks/mastersThunk";
import { breRetriggerThunk } from "../../store/thunks/breRetriggerThunk";
import { setBreExternalApiOutputs } from "../../store/slices/drsSlice";
import { useAppContext } from "../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../routes/routes";
import GroupPolicyDetails from "./DRS_Accordions/GroupPolicyDetails";

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
    "IT Pool":"RETAIL_IT_POOL"
}

const DRS = () => {
    const roleType = localStorage.getItem("roleType") ?? "";
    const userId = (localStorage.getItem("userId") ?? localStorage.getItem("username") ?? "").trim();
    const { applicationNumber, businessType } = useAppContext();
    const drsData = useSelector((state: RootState) => state.drs.data);

    const layout = mapper[roleType as keyof typeof mapper];
    const layoutAccordions = useMemo(() => (layout ? DRS_LAYOUTS[layout] : []), [layout]);
    const sections = useMemo(() => layoutAccordions.map((accordion) => String(accordion)), [layoutAccordions]);
    const visibleAccordions = useMemo(
        () => getPoolWiseAvailableAccordions(layout, drsData),
        [layout, drsData],
    );
    const showGroupPolicyDetails = layout === "GROUP_DVT_POOL";
    const navigate = useNavigate();
    const safeBusinessType =
        normalizeBusinessType(businessType) ??
        normalizeBusinessType(localStorage.getItem("businessType")) ??
        "retail";

    const dispatch = useDispatch<AppDispatch>();
    const safeApplicationNumber = applicationNumber ?? "";

    useEffect(() => {
        if (!safeApplicationNumber || !userId || !roleType) {
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
                    if (
                        updatedBrePayload?.breOutput ||
                        updatedBrePayload?.medicalBreOutput ||
                        updatedBrePayload?.financialBreOutput
                    ) {
                        dispatch(
                            setBreExternalApiOutputs({
                                breOutput: updatedBrePayload?.breOutput,
                                medicalBreOutput: updatedBrePayload?.medicalBreOutput,
                                financialBreOutput: updatedBrePayload?.financialBreOutput,
                            }),
                        );
                    }
                } catch (error) {
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
    }, [dispatch, roleType, safeApplicationNumber, sections, userId]);


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
            {visibleAccordions.map((accordionId) => {
                const AccordionComponent = accordionRegistry[accordionId as keyof typeof accordionRegistry];
                if (!AccordionComponent) {
                    return null;
                }
                return (
                    <Fragment key={accordionId}>
                        <AccordionComponent />
                        {showGroupPolicyDetails && accordionId === "applicationOverview" && <GroupPolicyDetails />}
                    </Fragment>
                );
            })}
        </>
    )
}

export default DRS