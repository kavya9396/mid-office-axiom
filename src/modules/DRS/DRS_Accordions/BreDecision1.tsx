import CustomAccordion from "../../../components/ui/Accordion/Accordion";
import { title } from "../../../utils/constant";
import { useAppSelector } from "../../../store/hooks";
import Badge from "../../../components/ui/Badge/Badge";
import CustomTable, { type Column } from "../../../components/ui/Table/Table";
import CustomButton from "../../../components/ui/Button/Button";
import { RefreshIcon } from "../../../icons/Icons";
import { Box, Typography } from "@mui/material";

type BRERow = {
    bre?:string;
    initialBre?:string;
    finalBre?:string;
}

const BreDecision1 = () => {
    const drsData = useAppSelector((state) => state.drs);
    const breDecisionData = drsData?.data?.breDecision;
    const isinitialBreSuccess =
  breDecisionData
    ? true
    : false;
    const finalBreData = useAppSelector((state) => state.bre);
    const finalBreDecisionData = finalBreData?.data?.data;
    
    const finalBreStatus = finalBreDecisionData?.breOutput?.decisionTypes?.breDecision;
const isfinalBreSuccess =
  finalBreStatus
    ? true
    : false;
console.log('drsData 1',breDecisionData,finalBreDecisionData);

const breColumns: Column<BRERow>[] = [ { key: "bre", header: "BRE", width: "2%" },
  { key: "initialBre", header: "Initial BRE", width: "10%" },
  { key: "finalBre", header: "Final BRE", width: "10%" ,headerRender: () => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          Final BRE
        </Typography>

          <CustomButton
            size="small"
            onClick={() => {
              console.log("Refresh clicked");
            }}
          >
            <RefreshIcon />
          </CustomButton>
      </Box>
    )}]
  const breTableData: BRERow[] = [
  {
    bre: "BRE Status",
    initialBre: isinitialBreSuccess ? "Success" : "Failure",
    finalBre: isfinalBreSuccess ? "Success" : "Failure",
  },
  {
    bre: "BRE Decision",
    initialBre: breDecisionData?.decision ?? "",
    finalBre:
      finalBreDecisionData?.breOutput?.decisionTypes?.breDecision ?? "",
  },
  {
    bre: "BRE Remarks",
    initialBre: breDecisionData?.remarks ?? "",
    finalBre:
      finalBreDecisionData?.breOutput?.breRemarks ?? "",
  },
  {
    bre: "BRE Discrepancy",
    initialBre: breDecisionData?.discrepancy ?? "",
    finalBre:
      finalBreDecisionData?.breOutput?.decisionTypes?.breRequirement ?? "",
  },
  {
    bre: "BRE Timestamp",
    initialBre: breDecisionData?.timestamp ?? "",
    finalBre:
      finalBreDecisionData?.breOutput?.systemDecisionDateTime ?? "",
  },
];

return(
    <Box sx={{p:1}}>
    <CustomAccordion title={title.breDecision} chip={<Badge label={ finalBreStatus ?? ""} variant="Low" />} defaultExpanded>
         <CustomTable title={""} columns={breColumns} data={breTableData} />
         </CustomAccordion> 
         </Box>
)
}
export default BreDecision1;