import { Box, Grid } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import LeftPanel from "./LeftPanel";
import type { RoleGroup } from "../../types/inbox";
import { fetchInboxThunk } from "../../store/thunks/inboxThunk";
import { useAppDispatch } from "../../store/hooks";

const Inbox = () => {
  const dispatch = useAppDispatch();
  const [toggle, setToggle] = useState(false);
  const [roleList, setRoleList] = useState<RoleGroup[]>([]);
  const [selectedPool, setSelectedPool] = useState("");
  const [userRole, setUserRole] = useState("");
  const [panelMode, setPanelMode] = useState<"simple" | "accordion">("simple");
  const [poolData, setPoolData] =
  useState<Record<string, string[]>>({});
  const didFetch = useRef(false);
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    const loadData = async () => {
      try {
        // Fetch Roles

        const roleResponse = await dispatch(fetchInboxThunk()).unwrap();

        console.log("roleResponse", roleResponse);

        const role = roleResponse.roleType ?? "admin";
        console.log("roleGroups", roleResponse, role);
        const roleGroups: RoleGroup[] = roleResponse.roles
          ? roleResponse.roles
          : Object.entries(roleResponse.pools ?? {}).map(([name, pools]) => ({
              name,
              pools: pools as string[],
            }));

        setRoleList(roleGroups);
        setUserRole(role);
        setPanelMode("accordion");
        setPoolData(roleResponse.poolData ?? {});

        const allPools = roleGroups.flatMap((group) => group.pools);
        if (allPools.length > 0) {
          setSelectedPool(allPools[0]);
        }
        console.log("roleGroups", roleGroups);
        // Fetch Table Data
        //  await dispatch(fetchInboxTableData());
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, []);
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
        />
      </Grid>
    </Box>
  );
};

export default Inbox;
