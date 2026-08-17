import { Box, CircularProgress } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { loadMasterData } from "./modules/Helper/MasterHelper";
import { DRS_MASTER_KEYS } from "./modules/DRS/drsMasters";
import { useAppDispatch } from "./store/hooks";


const MasterDataRoute = () => {
  const dispatch = useAppDispatch();

  const requestStartedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (requestStartedRef.current) {
      return;
    }

    requestStartedRef.current = true;

    const fetchMasterData = async () => {
      try {
        await loadMasterData(dispatch, {
          types: DRS_MASTER_KEYS,
        });
      } catch (error) {
        console.error(
          "Failed to load master data:",
          error,
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchMasterData();
  }, [dispatch]);

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress
          size={32}
          sx={{ color: "#f58220" }}
        />
      </Box>
    );
  }

  return <Outlet />;
};

export default MasterDataRoute;