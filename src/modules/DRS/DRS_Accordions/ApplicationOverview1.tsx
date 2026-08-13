import { Box, Container } from "@mui/material";
import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import type { RootState } from "../../../store/store";
import { GridSection } from "../../../components/layout/GridSection";
import { useAppSelector } from "../../../store/hooks";
import CustomTable, { type Column } from "../../../components/ui/Table/Table";
import { getRoleWiseConfig } from "../../../config/roleWiseApplicationDetailsConfig1";
// import { roleWiseConfig } from "../../../config/roleWiseApplicationDetailsConfig";

export type RiderRow = {
  name: string;
  type: string;
  term: string;
  sumAssured: string;
  paymentAmount: string;
  ppt: string;
};

const ApplicationOverview1 = () => {
  const roleType = localStorage.getItem("roleType");
  const businessType = localStorage.getItem("businessType") as "retail" | "group" | null;
  const drsData = useAppSelector((state: RootState) => state.drs);
  const applicationOverview = ((drsData.data as unknown) as Record<string, unknown> | undefined)?.applicationOverview;
  // console.log('application details',applicationOverview,roleWiseConfig)
  type GridValue = string | number | boolean | undefined;

  const getValue = (
    obj: Record<string, unknown>,
    path: string
  ): GridValue => {
    const value = path.split(".").reduce<unknown>((acc, key) => {
      if (acc && typeof acc === "object") {
        return (acc as Record<string, unknown>)[key];
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

  const items = (getRoleWiseConfig(roleType ?? "", businessType)).map((item) => ({
    label: item.label,
    value: getValue(
      applicationOverview as Record<string, unknown>,
      item.path
    ) ?? "-",
  }));
  const riderDetails = Array.isArray((applicationOverview as Record<string, unknown> | undefined)?.['riderDetails'])
    ? ((applicationOverview as Record<string, unknown>)['riderDetails'] as unknown[])
    : [];
  const riderColumns: Column<RiderRow>[] = [
    { key: "name", header: "Name", width: "5%" },
    { key: "type", header: "Option", width: "5%" },
    { key: "sumAssured", header: "Sum Assured", width: "5%" },
    { key: "paymentAmount", header: "Modal Premium", width: "50%" }]
  const riderRows: RiderRow[] =
    ((riderDetails as unknown) as Array<Record<string, unknown>>)
      .map((rider) => ({
        name: String(rider.name ?? rider.riderName ?? ""),
        type: String(rider.type ?? rider.option ?? ""),
        term: String(rider.term ?? rider.policyTerm ?? ""),
        sumAssured: String((rider as Record<string, unknown>).sumAssured ?? ""),
        paymentAmount: String((rider as Record<string, unknown>).paymentAmount ?? (rider as Record<string, unknown>).modalPremium ?? ""),
        ppt: String((rider as Record<string, unknown>).ppt ?? (rider as Record<string, unknown>).premiumPaymentTerm ?? ""),
      })) ?? [];
  return (
    <Container disableGutters>
      <CustomAccordion title={"Application Overview"} defaultExpanded>
        <Box sx={{ pl: 1 }}>
          <GridSection columns={6} items={items} />
          {riderRows.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <CustomTable<RiderRow>
                title="Rider Details"
                columns={riderColumns}
                data={riderRows}
              />
            </Box>
          )}
        </Box>
      </CustomAccordion>
    </Container>
  )
}
export default ApplicationOverview1;