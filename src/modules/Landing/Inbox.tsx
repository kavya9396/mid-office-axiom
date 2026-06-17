import { Box, Grid } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import LeftPanel from "./LeftPanel";
import type {  RoleGroup, tableData } from "../../types/inbox";
import { fetchInboxThunk } from "../../store/thunks/inboxThunk";
import { useAppDispatch } from "../../store/hooks";
import RightPanel from "./RightPanel";
import { poolThunk } from "../../store/thunks/poolThunk";

const Inbox = () => {
  const dispatch = useAppDispatch();
  const [toggle, setToggle] = useState(false);
  const [roleList, setRoleList] = useState<RoleGroup[]>([]);
  const [selectedPool, setSelectedPool] = useState("");
  const [userRole, setUserRole] = useState("");
  const [panelMode, setPanelMode] = useState<"simple" | "accordion">("simple");
  const [poolData, setPoolData] =
  useState<Record<string, tableData[]>>({});
  const [tableRows, setTableRows] = useState<tableData[]>([]);
  const [poolCounts, setPoolCounts] = useState<Record<string, number>>({});
  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    const loadData = async () => {
      try {
        // Fetch Roles

       const roleResponse = await dispatch(fetchInboxThunk()).unwrap();

        const role = roleResponse.roleType ?? "admin";

        const roleGroups: RoleGroup[] = roleResponse.roles
          ? roleResponse.roles
          : Object.entries(roleResponse.pools ?? {}).map(([name, pools]) => ({
              name,
              pools: pools as string[],
            }));

        setRoleList(roleGroups);
        setUserRole(role);
        setPanelMode("accordion");

        const allPools = roleGroups.flatMap((group) => group.pools);

        const firstPool = allPools[0];

        setPoolData(roleResponse.poolData ?? {});

        if (firstPool) {
          setSelectedPool(firstPool);
          setTableRows(roleResponse.poolData?.[firstPool] ?? []);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);
  useEffect(() => {
  if (!selectedPool) return;

  const loadPoolData = async () => {
    try {
      const response = await dispatch(
        poolThunk({
    username: userRole,
    poolname: selectedPool,
  })
      ).unwrap();
      setPoolData(prev => ({
  ...prev,
  ...response.poolData,
}));

console.log('response',response)
const rows = response.poolData[selectedPool] ?? [];
setPoolCounts(prev => ({
  ...prev,
  [selectedPool]: rows.length,
}));
setTableRows(rows);
    } catch (error) {
      console.error("Failed to load pool data", error);
      setTableRows([]);
    }
  };

  loadPoolData();
}, [selectedPool, dispatch]);
  return (
    <Box>
      <Grid container sx={{ flexWrap: "nowrap" }} className="bg-grey-200">
        <LeftPanel
          selectedPool={selectedPool}
          toggle={toggle}
          setToggle={setToggle}
          onSelectPool={setSelectedPool}
          mode={panelMode}
          role={userRole}
          roles={roleList}
          rows={[]}
          poolData={poolData}
          poolCounts={poolCounts}
        />
         <Box sx={{ flex: 1 }}>
        <RightPanel
          selectedPool={selectedPool}
          rows={tableRows}
        />
      </Box>
      </Grid>
    </Box>
  );
};

export default Inbox;
