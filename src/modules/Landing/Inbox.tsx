import { Box, Grid } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import LeftPanel from "./LeftPanel";
import type { RoleGroup, tableData } from "../../types/inbox";
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

  const [poolData, setPoolData] = useState<Record<string, tableData[]>>({});
  const [poolCounts, setPoolCounts] = useState<Record<string, number>>({});

  const didFetch = useRef(false);

  // 🚫 prevents poolThunk from running on initial auto-selection
  const skipInitialPoolFetch = useRef(true);

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const loadData = async () => {
      try {
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

        const poolDataFromAPI = roleResponse.poolData ?? {};

        setPoolData(poolDataFromAPI);

        // set counts only (no table binding needed)
        const initialCounts: Record<string, number> = {};
        Object.keys(poolDataFromAPI).forEach((pool) => {
          initialCounts[pool] = poolDataFromAPI[pool]?.length ?? 0;
        });
        setPoolCounts(initialCounts);

        // set default selected pool ONLY (no API call triggered)
        if (firstPool) {
          setSelectedPool(firstPool);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, [dispatch]);

  // ---------------- FETCH ONLY ON USER CLICK ----------------
  useEffect(() => {
    if (!selectedPool || !userRole) return;

    // 🚫 skip first auto-selection from initial load
    if (skipInitialPoolFetch.current) {
      skipInitialPoolFetch.current = false;
      return;
    }

    const loadPoolData = async () => {
      try {
        const response = await dispatch(
          poolThunk({
            username: userRole,
            poolname: selectedPool,
          })
        ).unwrap();

        const rows = response.poolData[selectedPool] ?? [];

        setPoolData((prev) => ({
          ...prev,
          ...response.poolData,
        }));

        setPoolCounts((prev) => ({
          ...prev,
          [selectedPool]: rows.length,
        }));
      } catch (error) {
        console.error("Failed to load pool data", error);
      }
    };

    loadPoolData();
  }, [selectedPool, dispatch, userRole]);

  // ---------------- UI ----------------
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
            rows={poolData[selectedPool] ?? []}
          />
        </Box>
      </Grid>
    </Box>
  );
};

export default Inbox;