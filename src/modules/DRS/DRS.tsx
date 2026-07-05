import { accordionRegistry, DRS_LAYOUTS } from "./drs-layouts";
import BackButton from "../../components/layout/BackButton";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
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
    "1st UW Pool":"RETAIL_CUW_POOL"
}

const DRS = () => {
    const roleType = localStorage.getItem("roleType") ?? "";
    const { applicationNumber, businessType } = useAppContext();

    const layout = mapper[roleType as keyof typeof mapper];
    const accordions = layout ? DRS_LAYOUTS[layout] : [];
    const navigate = useNavigate();
    const safeBusinessType =
        normalizeBusinessType(businessType) ??
        normalizeBusinessType(localStorage.getItem("businessType")) ??
        "retail";

    const dispatch = useDispatch<AppDispatch>();
    const safeApplicationNumber = applicationNumber ?? "";

    useEffect(() => {
        if (!safeApplicationNumber) {
            return;
        }

        const loadDRSAndBRE = async () => {
            try {
                const drsResponse = await dispatch(
                    drsThunk({
                        applicationNumber: safeApplicationNumber,
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
                        masters: ["title", "gender", "nationality", "idProof", "addressProof", "state", "country"],
                    }),
                );
            }
        };

        void loadDRSAndBRE();
    }, [dispatch, safeApplicationNumber]);


    return (
        <>
            <BackButton label="Back to inbox" onClick={() => navigate(getInboxPath(safeBusinessType))} />
            {accordions.map((accordionId) => {
                const AccordionComponent = accordionRegistry[accordionId];
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