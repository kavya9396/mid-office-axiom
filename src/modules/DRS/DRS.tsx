import { accordionRegistry, DRS_LAYOUTS } from "./drs-layouts";
import BackButton from "../../components/layout/BackButton";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store/store";
import { drsThunk } from "../../store/thunks/drsThunk";

const DRS = () => {
    const accordions = DRS_LAYOUTS["RETAIL_CVT_ADMIN"];
    const navigate = useNavigate();

    const dispatch = useDispatch<AppDispatch>();
    const applicationId = "OB25175127";
    const roleType = "CVT POOL";

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