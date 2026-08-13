import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  accordionRegistry,
  DRS_LAYOUTS,
  getPoolWiseAvailableAccordions,
} from "./drs-layouts";

import { drsThunk } from "../../store/thunks/drsThunk";
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
  RECONSIDERATION_TASK:
    "RETAIL_RECONSIDERATION_POOL",
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
  REQUIREMENT_POOL:
    "RETAIL_REQUIREMENT_REVIEW_POOL",
  CUW_CLAIM_AUDIT_TASK:
    "RETAIL_CUW_CLAIM_AUDIT",
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
  CPT_DATA_ENTRY_MR_TASK:
    "CPT_DATA_ENTRY_MR_TASK",
  CPT_DATA_ENTRY_NMR_TASK:
    "CPT_DATA_ENTRY_NMR_TASK",
};

const DRS = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Full row received from Inbox
  const application =
    location.state?.application as
      | ApplicationRow
      | undefined;

  // DRS API response from Redux
  const drsData = useSelector(
    (state: RootState) => state.drs.data,
  );

  console.log("FULL APPLICATION ROW:", application);
  console.log("DRS DATA:", drsData);

  const roleType = application?.roleType ?? "";
  localStorage.setItem("roleType",roleType);

  // --------------------------------------------------
  // ROLE TYPE -> POOL / LAYOUT
  // --------------------------------------------------

  const layout =
    mapper[
      roleType as keyof typeof mapper
    ];

  console.log("Role Type:", roleType);
  console.log("Layout:", layout);

  // --------------------------------------------------
  // LAYOUT -> BASE ACCORDIONS
  // --------------------------------------------------

  const layoutAccordions = useMemo(
    () =>
      layout
        ? DRS_LAYOUTS[layout] ?? []
        : [],
    [layout],
  );

  const sections = useMemo(
    () =>
      layoutAccordions.map((accordion) =>
        String(accordion),
      ),
    [layoutAccordions],
  );

  console.log(
    "Base Sections:",
    sections,
  );

  // --------------------------------------------------
  // CALL DRS API
  // --------------------------------------------------

  useEffect(() => {
    if (
      !application?.applicationNo ||
      !roleType ||
      !layout
    ) {
      return;
    }

    const userId =
      String(
        application.userId ??
          localStorage.getItem("userId") ??
          localStorage.getItem("username") ??
          "",
      ).trim();

    if (!userId) {
      console.warn(
        "User ID is missing",
      );
      return;
    }

    const loadDRS = async () => {
      try {
        const response =
          await dispatch(
            drsThunk({
              applicationNo:
                application.applicationNo!,
              userId,
              roleType,
              sections,
            }),
          ).unwrap();

        console.log(
          "DRS API RESPONSE:",
          response,
        );
      } catch (error) {
        console.error(
          "Failed to load DRS:",
          error,
        );
      }
    };

    void loadDRS();
  }, [
    dispatch,
    application?.applicationNo,
    application?.userId,
    roleType,
    layout,
    sections,
  ]);

  // --------------------------------------------------
  // FILTER ACCORDIONS BASED ON API DATA
  // --------------------------------------------------

  const visibleAccordions =
    useMemo(
      () =>
        getPoolWiseAvailableAccordions(
          layout,
          drsData,
        ),
      [layout, drsData],
    );

  console.log(
    "Visible Accordions:",
    visibleAccordions,
  );

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <div>
        <BackButton label={title.backToInbox} onClick={() => navigate(getInboxPath())}/>
      {visibleAccordions.map(
        (accordionId) => {
          const AccordionComponent =
            accordionRegistry[
              accordionId
            ];

          if (!AccordionComponent) {
            return null;
          }

          return (
            <div key={accordionId}>
              <AccordionComponent />
            </div>
          );
        },
      )}
    </div>
  );
};

export default DRS;