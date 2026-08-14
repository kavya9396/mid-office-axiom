import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  accordionRegistry,
  DRS_LAYOUTS,
  getPoolWiseAvailableAccordions,
} from "./drs-layouts";

import { drsThunk } from "../../store/thunks/drsThunk";
import { breThunk } from "../../store/thunks/breThunk";
import type { AppDispatch, RootState } from "../../store/store";
import BackButton from "../../components/layout/BackButton";
import { title } from "../../utils/constant";
import { getInboxPath } from "../../routes/routes";

interface ApplicationRow {
  applicationNo?: string;
  businessType?: string;
  roleType?: string;
  userId?: string;
  [key: string]: unknown;
}

const mapper = {
  CMO_TASK: "RETAIL_CMO_POOL",
  CUW_TASK: "RETAIL_CUW_POOL",
  CVT_TASK: "CVT_TASK",
  CPT_TASK: "RETAIL_CPT_POOL",
  HOD_TASK: "RETAIL_HOD_POOL",
  SR_UW_TASK: "RETAIL_SR_UW_POOL",
  READY_FOR_ISSUANCE_TASK: "RETAIL_READY_FOR_ISSUANCE_POOL",
  SYSTEM_WAIT_POOL_AMR_NON_MEDICAL:
    "RETAIL_SYSTEM_WAIT_POOL_NON_MEDICAL",
  AMR_NON_MEDICAL_TASK: "RETAIL_AMR_NON_MEDICAL",
  RECONSIDERATION_TASK: "RETAIL_RECONSIDERATION_POOL",
  PRE_ISSUANCE_SERVICING_TASK:
    "RETAIL_PRE_ISSUANCE_SERVICING_POOL",
  EXCEPTIONAL_TASK: "RETAIL_EXCEPTIONAL_POOL",
  PIVV_TASK: "PIVV_TASK",
  DVT_TASK: "GROUP_DVT_POOL",
  GUW_TASK: "GROUP_GUW_POOL",
  MMT_TASK: "GROUP_MMT_POOL",
  SUW_TASK: "RETAIL_SUW_POOL",
  VENDOR_CMO_TASK: "RETAIL_VENDOR_CMO_POOL",
  COPS_TASK: "RETAIL_COPS_POOL",
  IT_TASK: "RETAIL_IT_POOL",
  SYSTEM_WAIT_POOL_AMR_MEDICAL:
    "RETAIL_SYSTEM_WAIT_POOL_AMR_MEDICAL",
  RI_TASK: "RETAIL_REINSURER_POOL",
  REQUIREMENT_POOL: "RETAIL_REQUIREMENT_REVIEW_POOL",
  CUW_CLAIM_AUDIT_TASK: "RETAIL_CUW_CLAIM_AUDIT",
  ACCUITY_TASK: "RETAIL_ACCUITY_USER",
  ECG_TASK: "RETAIL_ECG_POOL",
  TMT_TASK: "RETAIL_TMT_POOL",
  GRIEVANCE_TASK: "RETAIL_GRIEVANCE_POOL",
  REJECT_TASK: "RETAIL_REJECT_POOL",
  GUW_FORMAL_TASK: "GUW_FORMAL_TASK",
  DVT_FORMAL_TASK: "DVT_FORMAL_TASK",
  RISK_TASK: "RISK_TASK",
  PRE_LOGIN_TASK: "PRE_LOGIN_TASK",
  AMR_MEDICAL_TASK: "AMR_MEDICAL_TASK",
  ACUITY_TASK: "ACUITY_TASK",
  ISSUANCE_TASK: "ISSUANCE_TASK",
  CPT_DATA_ENTRY_MR_TASK: "CPT_DATA_ENTRY_MR_TASK",
  CPT_DATA_ENTRY_NMR_TASK: "CPT_DATA_ENTRY_NMR_TASK",
} as const;

const DRS = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const application = location.state?.application as
    | ApplicationRow
    | undefined;

  const drsData = useSelector(
    (state: RootState) => state.drs.data,
  );

  const roleType = application?.roleType?.trim() ?? "";

  useEffect(() => {
    if (roleType) {
      localStorage.setItem("roleType", roleType);
    }
  }, [roleType]);

  const layout =
    mapper[roleType as keyof typeof mapper];

  const layoutAccordions = useMemo(
    () => (layout ? DRS_LAYOUTS[layout] ?? [] : []),
    [layout],
  );

  const sections = useMemo(
    () =>
      layoutAccordions.map((accordion) =>
        String(accordion),
      ),
    [layoutAccordions],
  );
const storageBusiness =
    application?.businessType || localStorage.getItem("businessType");

  const eventName =
    storageBusiness === "retail" ? "BRE-RETAIL" : "BRE-GROUP";
  useEffect(() => {
    const applicationNo =
      application?.applicationNo?.trim();

    if (!applicationNo || !roleType || !layout) {
      return;
    }

    const userId = String(
      application?.userId ??
        localStorage.getItem("userId") ??
        localStorage.getItem("username") ??
        "",
    ).trim();

    if (!userId) {
      console.warn("User ID is missing");
      return;
    }

    const loadPageData = async () => {
      const [drsResult, breResult] =
        await Promise.allSettled([
          dispatch(
            drsThunk({
              applicationNo,
              userId,
              roleType,
              sections,
            }),
          ).unwrap(),

          dispatch(
            breThunk({
              eventName: eventName,
              applicationNumber: applicationNo,
            }),
          ).unwrap(),
        ]);

      if (drsResult.status === "fulfilled") {
        console.log(
          "DRS API RESPONSE:",
          drsResult.value,
        );
      } else {
        console.error(
          "Failed to load DRS:",
          drsResult.reason,
        );
      }

      if (breResult.status === "fulfilled") {
        console.log(
          "BRE API RESPONSE:",
          breResult.value,
        );
      } else {
        console.error(
          "Failed to load BRE:",
          breResult.reason,
        );
      }
    };

    void loadPageData();
  }, [
    dispatch,
    application?.applicationNo,
    application?.userId,
    roleType,
    layout,
    sections,
  ]);

  const visibleAccordions = useMemo(
    () =>
      getPoolWiseAvailableAccordions(
        layout,
        drsData,
      ),
    [layout, drsData],
  );

  return (
    <div>
      <BackButton
        label={title.backToInbox}
        onClick={() => navigate(getInboxPath())}
      />

      {visibleAccordions.map((accordionId) => {
        const AccordionComponent =
          accordionRegistry[accordionId];

        if (!AccordionComponent) {
          return null;
        }

        return (
          <div key={accordionId}>
            <AccordionComponent />
          </div>
        );
      })}
    </div>
  );
};

export default DRS;