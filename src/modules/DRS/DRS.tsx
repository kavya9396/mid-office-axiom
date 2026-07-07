import { accordionRegistry, DRS_LAYOUTS, getPoolWiseAvailableAccordions } from "./drs-layouts";
import BackButton from "../../components/layout/BackButton";
import { Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "../../store/store";
import type { RootState } from "../../store/store";
import { drsThunk } from "../../store/thunks/drsThunk";
import { mastersThunk } from "../../store/thunks/mastersThunk";
import { breRetriggerThunk } from "../../store/thunks/breRetriggerThunk";
import { setBreOutput } from "../../store/slices/drsSlice";
import { useAppContext } from "../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../routes/routes";

const mapper = {
    "CVT Pool": "RETAIL_CVT_POOL",
    "CPT Pool":"RETAIL_CPT_POOL",
    "Ready For Issuance Pool":"RETAIL_READY_FOR_ISSUANCE_POOL",
    "System Wait Pool - Non medical":"RETAIL_SYSTEM_WAIT_POOL_NON_MEDICAL",
    "AMR - Non medical":"RETAIL_AMR_NON_MEDICAL",
    "Reconsideration Pool":"RETAIL_RECONSIDERATION_POOL",
    "Pre Issuance Servicing Pool": "RETAIL_PRE_ISSUANCE_SERVICING_POOL",
    "Exceptional Pool": "RETAIL_EXCEPTIONAL_POOL",
    "PIVV Pool": "RETAIL_PIVV_POOL",
    "DVT Pool":"GROUP_DVT_POOL",
    "1st UW Pool":"RETAIL_CUW_POOL",
    "GUW Pool":"GROUP_GUW_POOL"
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

                    const updatedBreOutput = breResponse.data?.breOutput;
                    if (updatedBreOutput) {
                        dispatch(setBreOutput(updatedBreOutput));
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
                rightSlot={
                    <Typography
                        sx={{
                            flex: 1,
                            textAlign: "center",
                            fontSize: "18px",
                            fontWeight: 800,
                            color: "#161616",
                            lineHeight: 1,
                        }}
                    >
                       Application No. : {safeApplicationNumber}
                    </Typography>
                }
            />
            {visibleAccordions.map((accordionId) => {
                const AccordionComponent = accordionRegistry[accordionId as keyof typeof accordionRegistry];
                if (!AccordionComponent) {
                    return null;
                }
                return (
                    <AccordionComponent
                        key={accordionId}
                    />
                );
            })}
        </>
    )
}

export default DRS