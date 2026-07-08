import { Alert, Box, Grid, Snackbar } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LeftPanel from "./LeftPanel";
import type { tableData } from "../../types/inbox";
import { fetchInboxThunk } from "../../store/thunks/inboxThunk";
import { useAppDispatch } from "../../store/hooks";
import RightPanel from "./RightPanel";
import { useAppContext } from "../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../routes/routes";

const Inbox = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { businessType } = useAppContext();

  const [toggle, setToggle] = useState(false);
  const [selectedPool, setSelectedPool] = useState("");

  const [poolData, setPoolData] = useState<Record<string, tableData[]>>({});
  const snackbarMessage = (location.state as { snackbarMessage?: string } | null)?.snackbarMessage ?? "";
  const snackbarOpen = Boolean(snackbarMessage);

  const isRefreshing = useRef(false);

  const loadData = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;

    try {
      const username = localStorage.getItem("username") ?? "";
      const password = localStorage.getItem("password") ?? "";
      const roleResponse = await dispatch(fetchInboxThunk({ username, password })).unwrap();
      const poolDataFromAPI = roleResponse.poolData ?? {};
      const businessTypeFromPoolData = normalizeBusinessType(
        Object.values(poolDataFromAPI)
          .find((rows) => rows.length > 0)
          ?.at(0)
          ?.businessType,
      );

      const currentBusinessType = normalizeBusinessType(businessType);
      const responseBusinessType = normalizeBusinessType(roleResponse.businessType);
      const resolvedBusinessType =
        responseBusinessType ??
        businessTypeFromPoolData ??
        currentBusinessType ??
        "retail";

      localStorage.setItem("businessType", resolvedBusinessType);

      if (currentBusinessType !== resolvedBusinessType) {
        navigate(getInboxPath(resolvedBusinessType), { replace: true });
      }

      const firstPool = Object.keys(poolDataFromAPI)[0] ?? "";

      setPoolData(poolDataFromAPI);
      setSelectedPool((previousPool) => {
        if (previousPool && poolDataFromAPI[previousPool]) {
          return previousPool;
        }
        return firstPool;
      });
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      isRefreshing.current = false;
    }
  }, [businessType, dispatch, navigate]);

  useEffect(() => {
    const initialLoadTimeoutId = window.setTimeout(() => {
      loadData();
    }, 0);

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    }, 30000);

    return () => {
      window.clearTimeout(initialLoadTimeoutId);
      window.clearInterval(intervalId);
    };
  }, [loadData]);

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