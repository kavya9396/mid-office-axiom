import { Alert, Box, Grid, Snackbar, CircularProgress } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LeftPanel from "./LeftPanel";
import type { tableData } from "../../types/inbox";
import { fetchInboxThunk } from "../../store/thunks/inboxThunk";
import { useAppDispatch } from "../../store/hooks";
import RightPanel from "./RightPanel";
import { useAppContext } from "../../hooks/useAppContext";
import { getInboxPath, normalizeBusinessType } from "../../routes/routes";
import { ALL_CASES_POOL } from "./LeftPanel";

const normalizePoolData = (poolData: Record<string, tableData[]> = {}) => {
  return Object.entries(poolData).reduce<Record<string, tableData[]>>(
    (normalizedPoolData, [poolName, rows]) => {
      normalizedPoolData[poolName] = Array.isArray(rows) ? rows : [];

      return normalizedPoolData;
    },
    {},
  );
};

const getNextSelectedPool = (
  previousPool: string,
  nextPoolData: Record<string, tableData[]>,
) => {
  const nextPoolNames = Object.keys(nextPoolData);
  const hasPools = nextPoolNames.length > 0;

  if (previousPool === ALL_CASES_POOL && hasPools) {
    return ALL_CASES_POOL;
  }

  if (previousPool && nextPoolData[previousPool]) {
    return previousPool;
  }

  return hasPools ? nextPoolNames[0] : "";
};

const Inbox = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const { businessType } = useAppContext();

  const [toggle, setToggle] = useState(false);
  const [selectedPool, setSelectedPool] = useState<string>(() => {
    return sessionStorage.getItem("selectedPool") ?? ALL_CASES_POOL;
  });

  const [poolData, setPoolData] = useState<Record<string, tableData[]>>({});
  const [loading, setLoading] = useState(false);
  const snackbarMessage = (location.state as { snackbarMessage?: string } | null)?.snackbarMessage ?? "";
  const snackbarOpen = Boolean(snackbarMessage);
  const allRows = Object.values(poolData).flat();

  const isRefreshing = useRef(false);

  const loadData = useCallback(async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;

    try {
      setLoading(true);
      const username = localStorage.getItem("username") ?? "";
      const password = localStorage.getItem("password") ?? "";
      const roleResponse = await dispatch(fetchInboxThunk({ username, password })).unwrap();
      const poolDataFromAPI = normalizePoolData(roleResponse.poolData);
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

      setPoolData(poolDataFromAPI);

      const storedPool = sessionStorage.getItem("selectedPool") ?? selectedPool;
      const nextPool = getNextSelectedPool(storedPool, poolDataFromAPI);
      setSelectedPool(nextPool);
      sessionStorage.setItem("selectedPool", nextPool);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      isRefreshing.current = false;
      setLoading(false);
    }
  }, [businessType, dispatch, navigate]);

  useEffect(() => {
    const initialLoadTimeoutId = window.setTimeout(() => {
      loadData();
    }, 0);

    const reloadVisibleInbox = () => {
      if (document.visibilityState === "visible") {
        loadData();
      }
    };

    const intervalId = window.setInterval(() => {
      reloadVisibleInbox();
    }, 30000);

    window.addEventListener("focus", reloadVisibleInbox);
    document.addEventListener("visibilitychange", reloadVisibleInbox);

    return () => {
      window.clearTimeout(initialLoadTimeoutId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", reloadVisibleInbox);
      document.removeEventListener("visibilitychange", reloadVisibleInbox);
    };
  }, [loadData]);

  // ---------------- UI ----------------
  return (
    <Box>
      {loading && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.25)",
          }}
        >
          <CircularProgress size={64} sx={{ color: "#fff" }} />
        </Box>
      )}
      <Grid container sx={{ flexWrap: "nowrap" }} className="bg-grey-200">
        <LeftPanel
          selectedPool={selectedPool}
          toggle={toggle}
          setToggle={setToggle}
          onSelectPool={(pool: string) => {
            setSelectedPool(pool);
            sessionStorage.setItem("selectedPool", pool);
          }}
          poolData={poolData}
        />

        <Box sx={{ flex: 1 }}>
          <RightPanel
            selectedPool={selectedPool}
            rows={selectedPool === ALL_CASES_POOL ? allRows : (poolData[selectedPool] ?? [])}
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