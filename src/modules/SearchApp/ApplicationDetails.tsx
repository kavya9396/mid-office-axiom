// import { Box } from "@mui/material"
// import CustomAccordion from "../../components/ui/Accordion/Accordion"
// import { GridSection, type GridItem } from "../../components/layout/GridSection"
// import type { ApplicationDetails as ApplicationDetailsData } from "../../types/search.types";

// interface ApplicationDetailsProps {
//   applicationDetails?: ApplicationDetailsData | null;
// }

// const showValue = (value: unknown): string => {
//   const normalizedValue = String(value ?? "").trim();
//   return normalizedValue || "-";
// };

// const formatCurrency = (value: unknown): string => {
//   if (value === null || value === undefined || value === "") {
//     return "-";
//   }

//   const numericValue = Number(value);

//   if (Number.isNaN(numericValue)) {
//     return showValue(value);
//   }

//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 0,
//   }).format(numericValue);
// };

// const ApplicationDetails = ({
//   applicationDetails,
// }: ApplicationDetailsProps) => {

//     console.log("application details", applicationDetails)

//   const details: GridItem[] = [
//     {
//       label: "DOB",
//       value: showValue(applicationDetails?.dob),
//     },
//     {
//       label: "Name of Proposer",
//       value: showValue(applicationDetails?.proposerName),
//     },
//     {
//       label: "Name of Life Assured",
//       value: showValue(applicationDetails?.lifeAssuredName),
//     },
//     {
//       label: "Product Opted",
//       value: showValue(applicationDetails?.productOpted),
//     },
//     {
//       label: "Plan Opted",
//       value: showValue(applicationDetails?.planOpted),
//     },
//     {
//       label: "Applied SA",
//       value: formatCurrency(applicationDetails?.appliedSA),
//     },
//     {
//       label: "Premium",
//       value: formatCurrency(applicationDetails?.premium),
//     },
//     {
//       label: "Client Type",
//       value: showValue(applicationDetails?.clientType),
//     },
//     {
//       label: "Last Bucket",
//       value: showValue(applicationDetails?.lastBucket),
//     },
//     {
//       label: "Last User",
//       value: showValue(applicationDetails?.lastUser),
//     },
//   ];

//     return (
//         <Box sx={{ px: 1 }}>
//             <CustomAccordion title={`Application Details - applicationNumber`}
//                 defaultExpanded>
//                 <Box sx={{ p: 1, bgcolor: "#f6f6f6" }}>
//                     <GridSection columns={8} items={details} />
//                 </Box>
//             </CustomAccordion>
//         </Box>
//     )
// }

// export default ApplicationDetails

import { Box } from "@mui/material";

import CustomAccordion from "../../components/ui/Accordion/Accordion";
import {
  GridSection,
  type GridItem,
} from "../../components/layout/GridSection";

import { useAppSelector } from "../../store/hooks";
import type { RootState } from "../../store/store";
import { getSearchApplicationFields } from "../../config/roleWiseApplicationDetailsConfig";

const getValueByPath = (
  source: unknown,
  path: string,
): unknown => {
  return path
    .split(".")
    .reduce<unknown>((currentValue, key) => {
      if (
        currentValue === null ||
        currentValue === undefined
      ) {
        return undefined;
      }

      if (Array.isArray(currentValue)) {
        const index = Number(key);

        return Number.isInteger(index)
          ? currentValue[index]
          : undefined;
      }

      if (
        typeof currentValue === "object"
      ) {
        return (
          currentValue as Record<string, unknown>
        )[key];
      }

      return undefined;
    }, source);
};

const showValue = (value: unknown): string => {
  const normalizedValue = String(
    value ?? "",
  ).trim();

  return normalizedValue || "-";
};

const ApplicationDetails = () => {
  const searchData = useAppSelector(
    (state: RootState) =>
      state.searchApplication.response?.data,
  );

  const businessType = showValue(
    getValueByPath(
      searchData,
      "basicDetails.businessType",
    ),
  );

  const applicationNumber = showValue(
    getValueByPath(
      searchData,
      "basicDetails.applicationNumber",
    ),
  );

  const fields =
    getSearchApplicationFields(businessType);

  const details: GridItem[] = fields.map(
    ({ label, path }) => ({
      label,
      value: showValue(
        getValueByPath(searchData, path),
      ),
    }),
  );

  return (
    <Box sx={{ px: 1 }}>
      <CustomAccordion
        title={`Application Details - ${applicationNumber}`}
        defaultExpanded
      >
        <Box
          sx={{
            p: 1,
            bgcolor: "#f6f6f6",
          }}
        >
          <GridSection
            columns={8}
            items={details}
          />
        </Box>
      </CustomAccordion>
    </Box>
  );
};

export default ApplicationDetails;