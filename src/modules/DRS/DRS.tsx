import { accordionRegistry, DRS_LAYOUTS } from "./drs-layouts";
import BackButton from "../../components/layout/BackButton";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { drsThunk } from "../../store/thunks/drsThunk";

const mapper = {
    "CVT Pool": "RETAIL_CVT_POOL",
    "Ready For Issuance Pool":"RETAIL_READY_FOR_ISSUANCE_POOL",
    "System Wait Pool - Non medical":"RETAIL_SYSTEM_WAIT_POOL_NON_MEDICAL",
    "AMR - Non medical":"RETAIL_AMR_NON_MEDICAL",
    "Reconsideration Pool":"RETAIL_RECONSIDERATION_POOL"
}

const DRS = () => {
    const roleType = localStorage.getItem("roleType") ?? "";

    const layout = mapper[roleType as keyof typeof mapper];
    const accordions = layout ? DRS_LAYOUTS[layout] : [];
    console.log('accordions',accordions,roleType,layout)
    const navigate = useNavigate();

    const dispatch = useDispatch<AppDispatch>();
    const applicationId = "OB25175127";
    

    useEffect(() => {
        dispatch(
            drsThunk({
                applicationId,
                roleType,
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