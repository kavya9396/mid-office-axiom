import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import {
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";

import {
  accordionRegistry,
  DRS_LAYOUTS,
  getPoolWiseAvailableAccordions,
} from "./drs-layouts";

import { drsThunk } from "../../store/thunks/drsThunk";
import { breThunk } from "../../store/thunks/breThunk";
import type {
  AppDispatch,
  RootState,
} from "../../store/store";
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
  READY_FOR_ISSUANCE_TASK:
    "RETAIL_READY_FOR_ISSUANCE_POOL",
  SYSTEM_WAIT_POOL_AMR_NON_MEDICAL:
    "RETAIL_SYSTEM_WAIT_POOL_NON_MEDICAL",
  AMR_NON_MEDICAL_TASK:
    "RETAIL_AMR_NON_MEDICAL",
  RECONSIDERATION_TASK:
    "RETAIL_RECONSIDERATION_POOL",
  PRE_ISSUANCE_SERVICING_TASK:
    "RETAIL_PRE_ISSUANCE_SERVICING_POOL",
  POST_ISSUANCE_TASK:
    "POST_ISSUANCE_TASK",
  EXCEPTIONAL_TASK:
    "RETAIL_EXCEPTIONAL_POOL",
  PIVV_TASK: "PIVV_TASK",
  DVT_TASK: "GROUP_DVT_POOL",
  GUW_TASK: "GROUP_GUW_POOL",
  MMT_TASK: "GROUP_MMT_POOL",
  SUW_TASK: "RETAIL_SUW_POOL",
  VENDOR_CMO_TASK:
    "RETAIL_VENDOR_CMO_POOL",
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
  GRIEVANCE_TASK:
    "RETAIL_GRIEVANCE_POOL",
  REJECT_TASK: "RETAIL_REJECT_POOL",
  GUW_FORMAL_TASK: "GUW_FORMAL_TASK",
  DVT_FORMAL_TASK: "DVT_FORMAL_TASK",
  RISK_TASK: "RISK_TASK",
  PRE_LOGIN_TASK: "PRE_LOGIN_TASK",
  AMR_MEDICAL_TASK:
    "AMR_MEDICAL_TASK",
  ACUITY_TASK: "ACUITY_TASK",
  ISSUANCE_TASK: "ISSUANCE_TASK",
  CPT_DATA_ENTRY_MR_TASK:
    "CPT_DATA_ENTRY_MR_TASK",
  CPT_DATA_ENTRY_NMR_TASK:
    "CPT_DATA_ENTRY_NMR_TASK",
} as const;

const DRS = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch =
    useDispatch<AppDispatch>();

  const application =
    location.state?.application as
      | ApplicationRow
      | undefined;

  const drsData = useSelector(
    (state: RootState) =>
      state.drs.data,
  );

  const [
    isPageLoading,
    setIsPageLoading,
  ] = useState(true);

  /*
   * Prevents duplicate API calls caused by
   * React Strict Mode in development.
   */
  const lastRequestKeyRef =
    useRef<string | null>(null);

  const storedRoleType =
    localStorage
      .getItem("roleType")
      ?.trim() ?? "";

  const roleType =
    application?.roleType?.trim() ||
    storedRoleType;

  const layout =
    mapper[
      roleType as keyof typeof mapper
    ];

  /*
   * Store the role received from Inbox.
   */
  useEffect(() => {
    const applicationRoleType =
      application?.roleType?.trim();

    if (applicationRoleType) {
      localStorage.setItem(
        "roleType",
        applicationRoleType,
      );
    }
  }, [application?.roleType]);

  const layoutAccordions = useMemo(
    () =>
      layout
        ? DRS_LAYOUTS[layout] ?? []
        : [],
    [layout],
  );

  const sections = useMemo(
    () =>
      layoutAccordions.map(
        (accordion) =>
          String(accordion),
      ),
    [layoutAccordions],
  );

  const businessType = (
    application?.businessType ??
    localStorage.getItem(
      "businessType",
    ) ??
    ""
  )
    .trim()
    .toLowerCase();

  const eventName =
    businessType === "retail"
      ? "BRE-RETAIL"
      : "BRE-GROUP";

  /*
   * Load DRS and BRE data.
   */
  useEffect(() => {
    const applicationNo =
      application?.applicationNo?.trim();

    const userId = String(
      application?.userId ??
        localStorage.getItem(
          "userId",
        ) ??
        localStorage.getItem(
          "username",
        ) ??
        "",
    ).trim();

    if (
      !applicationNo ||
      !userId ||
      !roleType ||
      !layout
    ) {
      void Promise.resolve().then(
        () => {
          setIsPageLoading(false);
        },
      );

      return;
    }

    /*
     * A request is unique based on the
     * application, user, role, layout,
     * BRE event and requested sections.
     */
    const requestKey = [
      applicationNo,
      userId,
      roleType,
      layout,
      eventName,
      sections.join(","),
    ].join("|");

    /*
     * React Strict Mode can execute an
     * effect twice during development.
     */
    if (
      lastRequestKeyRef.current ===
      requestKey
    ) {
      return;
    }

    lastRequestKeyRef.current =
      requestKey;

    const loadPageData =
      async () => {
        setIsPageLoading(true);

        try {
          const [
            drsResult,
            breResult,
          ] =
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
                  eventName,
                  applicationNumber:
                    applicationNo,
                }),
              ).unwrap(),
            ]);

          if (
            drsResult.status ===
            "fulfilled"
          ) {
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

          if (
            breResult.status ===
            "fulfilled"
          ) {
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
        } catch (error) {
          console.error(
            "Failed to load page data:",
            error,
          );
        } finally {
          /*
           * Only the latest request is
           * allowed to hide the loader.
           */
          if (
            lastRequestKeyRef.current ===
            requestKey
          ) {
            setIsPageLoading(false);
          }
        }
      };

    /*
     * Run asynchronously to avoid
     * synchronous setState inside effect.
     */
    void Promise.resolve().then(
      loadPageData,
    );
  }, [
    dispatch,
    application?.applicationNo,
    application?.userId,
    roleType,
    layout,
    sections,
    eventName,
  ]);

  const visibleAccordions = useMemo(
    () =>
      getPoolWiseAvailableAccordions(
        layout,
        drsData,
      ),
    [layout, drsData],
  );

  /*
   * Full-page loader remains visible
   * until DRS and BRE APIs settle.
   */
  if (isPageLoading) {
    return (
      <Box
        sx={{
          width: "100%",
          height: "91vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1.5,
          backgroundColor:
            "#f5f7fa",
        }}
      >
        <CircularProgress
          size={42}
          thickness={4}
          sx={{
            color: "#f58220",
          }}
        />

        <Typography
          variant="body2"
          sx={{
            color:
              "text.secondary",
            fontWeight: 500,
          }}
        >
          Loading application
          details...
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <BackButton
        label={title.backToInbox}
        onClick={() =>
          navigate(getInboxPath())
        }
      />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {visibleAccordions.map(
          (accordionId) => {
            const AccordionComponent =
              accordionRegistry[
                accordionId
              ];

            if (
              !AccordionComponent
            ) {
              return null;
            }

            return (
              <Box key={accordionId}>
                <AccordionComponent />
              </Box>
            );
          },
        )}
      </Box>
    </>
  );
};

export default DRS;