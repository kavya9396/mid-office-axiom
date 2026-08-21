import {
  Alert,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";

import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTabs, {
  type TabItem,
} from "../../../components/ui/Tabs/Tabs";

import { useAppSelector } from "../../../store/hooks";

import CustomerProfile from "./CustomerProfile";
import DocumentRequired from "./DocumentRequired";
import MedicalInsuranceDetails from "./MedicalInsuranceDetails";

type PreLoginTab =
  | "individualCase"
  | "keymanInsurance"
  | "partnershipInsurance"
  | "employeeEmployerInsurance";

const preLoginTabs: TabItem<PreLoginTab>[] = [
  {
    key: "individualCase",
    label: "Individual Case",
  },
  {
    key: "keymanInsurance",
    label: "Keyman Insurance",
  },
  {
    key: "partnershipInsurance",
    label: "Partnership Insurance",
  },
  {
    key: "employeeEmployerInsurance",
    label: "Employee - Employer Insurance",
  },
];

const TAB_TYPE_ALIASES: Record<
  PreLoginTab,
  string[]
> = {
  individualCase: [
    "individual",
    "individualcase",
    "individualinsurance",
  ],

  keymanInsurance: [
    "keyman",
    "keymancase",
    "keymaninsurance",
  ],

  partnershipInsurance: [
    "partnership",
    "partnershipcase",
    "partnershipinsurance",
  ],

  employeeEmployerInsurance: [
    "employeeemployer",
    "employeeemployercase",
    "employeeemployerinsurance",
    "employeremployee",
    "employeremployeeinsurance",
  ],
};

const toRecord = (
  value: unknown,
): Record<string, unknown> =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const normalize = (value: unknown): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const matchesActiveTab = (
  value: unknown,
  activeTab: PreLoginTab,
): boolean => {
  const normalizedValue = normalize(value);

  if (!normalizedValue) {
    return activeTab === "individualCase";
  }

  return TAB_TYPE_ALIASES[activeTab].some(
    (alias) =>
      normalizedValue === alias ||
      normalizedValue.includes(alias),
  );
};

const PreLogin = () => {
  const preLoginData = useAppSelector(
    (state) => state.prelogin.data,
  );

  const loading = useAppSelector(
    (state) => state.prelogin.loading,
  );

  const error = useAppSelector(
    (state) => state.prelogin.error,
  );

  const [activeTab, setActiveTab] =
    useState<PreLoginTab>("individualCase");

  const activeTabData = useMemo(() => {
    if (!preLoginData) {
      return null;
    }

    const dataRecord = toRecord(preLoginData);

    const customerProfiles = Array.isArray(
      dataRecord.customerProfile,
    )
      ? dataRecord.customerProfile
      : [];

    const insuranceDetails = Array.isArray(
      dataRecord.insuranceDetails,
    )
      ? dataRecord.insuranceDetails
      : [];

    const selectedCustomerProfiles =
      customerProfiles.filter((item) => {
        const profile = toRecord(item);

        return matchesActiveTab(
          profile.type,
          activeTab,
        );
      });

    const selectedInsuranceDetails =
      insuranceDetails.filter((item) => {
        const insurance = toRecord(item);

        return matchesActiveTab(
          insurance.type,
          activeTab,
        );
      });

    const customerDetails =
      selectedCustomerProfiles.flatMap((item) => {
        const profile = toRecord(item);

        return Array.isArray(
          profile.customerDetails,
        )
          ? profile.customerDetails
          : [];
      });

    const existingInsuranceDetails =
      selectedInsuranceDetails.flatMap(
        (item) => {
          const insurance = toRecord(item);

          return Array.isArray(
            insurance.existingInsurance,
          )
            ? insurance.existingInsurance
            : [];
        },
      );

    const simultaneousAppliedPolicies =
      selectedInsuranceDetails.flatMap(
        (item) => {
          const insurance = toRecord(item);

          return Array.isArray(
            insurance.simultaneousPolicies,
          )
            ? insurance.simultaneousPolicies
            : [];
        },
      );

    const firstCustomer = toRecord(
      customerDetails[0],
    );

    const approvalReqdFor = toRecord(
      dataRecord.approvalReqdFor,
    );

    const financialApproval =
      approvalReqdFor.financial === true;

    const medicalApproval =
      approvalReqdFor.medical === true;

    return {
      ...dataRecord,

      activeCaseType: activeTab,

      customerProfile: selectedCustomerProfiles,

      customerDetails,

      productDetail: dataRecord.productDetail,

      sourcingDetail: dataRecord.sourcingDetail,

      medicalInsuranceDetails: {
        medicalProfile: toRecord(
          firstCustomer.medicalProfile,
        ),

        existingInsuranceDetails,

        simultaneousAppliedPolicies,

        approvalRequired: {
          financial: financialApproval,
          medical: medicalApproval,
          both:
            financialApproval &&
            medicalApproval,
        },
      },

      documentRequired: toRecord(
        dataRecord.documentRequired,
      ),
    };
  }, [activeTab, preLoginData]);

  return (
    <Box sx={{ p: 1 }}>
      <CustomAccordion
        title="Pre Login"
        defaultExpanded
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            my: 1,
          }}
        >
          <CustomTabs
            tabs={preLoginTabs}
            value={activeTab}
            onChange={setActiveTab}
          />
        </Box>

        {loading === "loading" && (
          <Box
            sx={{
              minHeight: 220,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1.5,
            }}
          >
            <CircularProgress
              size={38}
              thickness={4}
              sx={{ color: "#f58220" }}
            />

            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
            >
              Loading pre-login details...
            </Typography>
          </Box>
        )}

        {loading !== "loading" && error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {loading !== "loading" &&
          !error &&
          !activeTabData && (
            <Box
              sx={{
                minHeight: 160,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography color="text.secondary">
                No pre-login details available.
              </Typography>
            </Box>
          )}

        {loading !== "loading" &&
          !error &&
          activeTabData && (
            <Box key={activeTab} sx={{ mt: 2 }}>
              <CustomerProfile
                data={activeTabData}
              />

              <MedicalInsuranceDetails
                data={activeTabData}
              />

              <DocumentRequired
                data={activeTabData}
              />
            </Box>
          )}
      </CustomAccordion>
    </Box>
  );
};

export default PreLogin;