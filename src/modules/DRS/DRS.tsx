import { accordionRegistry, DRS_LAYOUTS } from "./drs-layouts";
import BackButton from "../../components/layout/BackButton";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { drsThunk } from "../../store/thunks/drsThunk";
import { mastersThunk } from "../../store/thunks/mastersThunk";

const mapper = {
    "CVT Pool": "RETAIL_CVT_POOL",
    "CPT Pool":"RETAIL_CPT_POOL",
    "Ready For Issuance Pool":"RETAIL_READY_FOR_ISSUANCE_POOL",
    "System Wait Pool - Non medical":"RETAIL_SYSTEM_WAIT_POOL_NON_MEDICAL",
    "AMR - Non medical":"RETAIL_AMR_NON_MEDICAL",
    "Reconsideration Pool":"RETAIL_RECONSIDERATION_POOL",
    "Pre Issuance Servicing Pool": "RETAIL_PRE_ISSUANCE_SERVICING_POOL",
    "Exceptional Pool": "RETAIL_EXCEPTIONAL_POOL",
    "PIVV Pool": "RETAIL_PIVV_POOL"
}

const DRS = () => {
    const roleType = localStorage.getItem("roleType") ?? "";
    const { applicationNumber } = useParams<{ applicationNumber: string }>();

    const layout = mapper[roleType as keyof typeof mapper];
    const accordions = layout ? DRS_LAYOUTS[layout] : [];
    const navigate = useNavigate();

    const dispatch = useDispatch<AppDispatch>();
    const applicationId = applicationNumber ?? "";
    

    useEffect(() => {
        if (!applicationId) {
            return;
        }

        dispatch(
            drsThunk({
                applicationId,
                roleType,
            })
        );

        dispatch(
            mastersThunk({
                masters: ["title", "gender", "nationality", "idProof", "addressProof", "state", "country"],
            })
        );
    }, [dispatch, applicationId, roleType]);


    return (
        <>
            <BackButton label="Back to inbox" onClick={() => navigate("/retail/inbox")} />
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