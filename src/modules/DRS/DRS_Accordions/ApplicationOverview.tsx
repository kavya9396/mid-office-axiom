import { Box } from "@mui/material";

import { GridSection } from "../../../components/layout/GridSection";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import CustomTable, {
  type Column,
} from "../../../components/ui/Table/Table";
import {
  getRoleWiseConfig,
} from "../../../config/roleWiseApplicationDetailsConfig1";
import { useAppSelector } from "../../../store/hooks";
import type { RootState } from "../../../store/store";
import { SEARCH_APPLICATION_FIELDS } from "../../../config/roleWiseApplicationDetailsConfig";

export type RiderRow = {
  name: string;
  type: string;
  term: string;
  sumAssured: string;
  paymentAmount: string;
  ppt: string;
};

interface ApplicationOverviewProps {
  readOnly?: boolean;
}

type GridValue = string | number | boolean | undefined;

type UnknownRecord = Record<string, unknown>;

const toRecord = (value: unknown): UnknownRecord | undefined =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : undefined;

const getValue = (
  obj: UnknownRecord | undefined,
  path: string,
): GridValue => {
  const value = path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as UnknownRecord)[key];
    }

    return undefined;
  }, obj);

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  return undefined;
};

const ApplicationOverview = ({
  readOnly = false,
}: ApplicationOverviewProps) => {
  const roleType = localStorage.getItem("roleType") ?? "";
  const businessType = localStorage.getItem("businessType") as
    | "retail"
    | "group"
    | null;

  const drsApplicationOverview = useAppSelector((state: RootState) => {
    const drsData = toRecord(state.drs.data);
    return toRecord(drsData?.applicationOverview);
  });

  const searchApplicationOverview = useAppSelector((state: RootState) => {
    const searchData = toRecord(state.searchApplication.response?.data);
    return toRecord(searchData?.applicationOverview);
  });

  /*
   * Search Application uses its own slice in read-only mode.
   * The normal DRS flow continues to use the DRS slice.
   */
  const applicationOverview = readOnly
    ? searchApplicationOverview
    : drsApplicationOverview;

  const applicationOverviewFields = readOnly
    ? SEARCH_APPLICATION_FIELDS
    : getRoleWiseConfig(roleType, businessType);

  const items = applicationOverviewFields.map((item) => ({
    label: item.label,
    value: getValue(applicationOverview, item.path) ?? "-",
  }));

  const riderDetails = Array.isArray(applicationOverview?.riderDetails)
    ? applicationOverview.riderDetails
    : [];

  const riderColumns: Column<RiderRow>[] = [
    {
      key: "name",
      header: "Name",
      width: "5%",
    },
    {
      key: "type",
      header: "Option",
      width: "5%",
    },
    {
      key: "sumAssured",
      header: "Sum Assured",
      width: "5%",
    },
    {
      key: "paymentAmount",
      header: "Modal Premium",
      width: "50%",
    },
  ];

  const riderRows: RiderRow[] = riderDetails.map((value) => {
    const rider = toRecord(value) ?? {};

    return {
      name: String(rider.name ?? rider.riderName ?? ""),
      type: String(rider.type ?? rider.option ?? ""),
      term: String(rider.term ?? rider.policyTerm ?? ""),
      sumAssured: String(rider.sumAssured ?? ""),
      paymentAmount: String(
        rider.paymentAmount ?? rider.modalPremium ?? "",
      ),
      ppt: String(rider.ppt ?? rider.premiumPaymentTerm ?? ""),
    };
  });

  return (
    <Box sx={{ px: 1 }}>
      <CustomAccordion title="Application Overview" defaultExpanded>
        <Box sx={{ p: 1, bgcolor: "#f6f6f6" }}>
          <GridSection columns={8} items={items} />

          {riderRows.length > 0 && (
            <CustomTable<RiderRow>
              title="Rider Details"
              columns={riderColumns}
              data={riderRows}
            />
          )}
        </Box>
      </CustomAccordion>
    </Box>
  );
};

export default ApplicationOverview;
