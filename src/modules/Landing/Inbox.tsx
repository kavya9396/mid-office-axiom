import { Alert, Box, Grid, Snackbar } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LeftPanel from "./LeftPanel";
import type { tableData } from "../../types/inbox";
import { fetchInboxThunk } from "../../store/thunks/inboxThunk";
import { useAppDispatch } from "../../store/hooks";
import RightPanel from "./RightPanel";

const Inbox = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [toggle, setToggle] = useState(false);
  const [selectedPool, setSelectedPool] = useState("");

  const [poolData, setPoolData] = useState<Record<string, tableData[]>>({});
  const snackbarMessage = (location.state as { snackbarMessage?: string } | null)?.snackbarMessage ?? "";
  const snackbarOpen = Boolean(snackbarMessage);

  const didFetch = useRef(false);

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;

    const loadData = async () => {
      try {
        const username = localStorage.getItem("username") ?? "";
        const roleResponse = await dispatch(fetchInboxThunk({ username })).unwrap();

        const poolDataFromAPI = roleResponse.poolData ?? {};
        const firstPool = Object.keys(poolDataFromAPI)[0];

        setPoolData(poolDataFromAPI);

        if (firstPool) {
          setSelectedPool(firstPool);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, [dispatch]);

  // ---------------- UI ----------------
  return (
    <Box>
      <Grid container sx={{ flexWrap: "nowrap" }} className="bg-grey-200">
        <LeftPanel
          selectedPool={selectedPool}
          toggle={toggle}
          setToggle={setToggle}
          onSelectPool={setSelectedPool}
          poolData={poolData}
        />

        <Box sx={{ flex: 1 }}>
          <RightPanel
            selectedPool={selectedPool}
            rows={poolData[selectedPool] ?? []}
          />
        </Box>
      </Grid>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => navigate(location.pathname, { replace: true })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => navigate(location.pathname, { replace: true })}
          severity="success"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Inbox;