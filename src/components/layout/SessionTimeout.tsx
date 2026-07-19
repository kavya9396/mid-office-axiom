import { Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../../utils/auth";
import CustomButton from "../ui/Button/Button";
import CustomDialog from "../ui/Dialog/Dialog";
import { SessionTimeoutContext } from "./sessionTimeoutContext.ts";

const WARNING_BEFORE_LOGOUT_MS = 60 * 1000;
const LOGOUT_TIME_MS = 15 * 60 * 1000;
const COUNTDOWN_TICK_MS = 1000;

const activityEvents = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

const SessionTimeout = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const warningTimerRef = useRef<number | undefined>(undefined);
  const logoutTimerRef = useRef<number | undefined>(undefined);
  const countdownTimerRef = useRef<number | undefined>(undefined);
  const logoutAtRef = useRef(0);
  const [showWarning, setShowWarning] = useState(false);
  const [remainingMs, setRemainingMs] = useState(LOGOUT_TIME_MS);

  const clearTimers = useCallback(() => {
    if (warningTimerRef.current) {
      window.clearTimeout(warningTimerRef.current);
    }

    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
    }

    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current);
    }
  }, []);

  const logoutUser = useCallback(() => {
    clearTimers();
    setShowWarning(false);
    auth.logout();
    navigate("/login", { replace: true });
  }, [clearTimers, navigate]);

  const startInactivityTimer = useCallback(() => {
    clearTimers();
    logoutAtRef.current = Date.now() + LOGOUT_TIME_MS;

    warningTimerRef.current = window.setTimeout(() => {
      setShowWarning(true);
    }, LOGOUT_TIME_MS - WARNING_BEFORE_LOGOUT_MS);

    logoutTimerRef.current = window.setTimeout(logoutUser, LOGOUT_TIME_MS);

    countdownTimerRef.current = window.setInterval(() => {
      setRemainingMs(Math.max(logoutAtRef.current - Date.now(), 0));
    }, COUNTDOWN_TICK_MS);
  }, [clearTimers, logoutUser]);

  const resetInactivityTimer = useCallback(() => {
    setShowWarning(false);
    setRemainingMs(LOGOUT_TIME_MS);
    startInactivityTimer();
  }, [startInactivityTimer]);

  const sessionTimeoutContextValue = useMemo(
    () => ({
      remainingMs,
    }),
    [remainingMs],
  );

  useEffect(() => {
    startInactivityTimer();

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, resetInactivityTimer, { passive: true });
    });

    return () => {
      clearTimers();
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, resetInactivityTimer);
      });
    };
  }, [clearTimers, resetInactivityTimer, startInactivityTimer]);

  return (
    <SessionTimeoutContext.Provider value={sessionTimeoutContextValue}>
      {children}
      <CustomDialog
        open={showWarning}
        onClose={resetInactivityTimer}
        title={
          <Typography sx={{ fontSize: "16px", fontWeight: 700, color: "#063E6F" }}>
            Session Timeout Warning
          </Typography>
        }
        actionsSx={{ justifyContent: "center", pb: 2 }}
        actions={
          <CustomButton onClick={resetInactivityTimer} sx={{ borderRadius: "50px", px: 4 }}>
            Stay Logged In
          </CustomButton>
        }
      >
        <Typography sx={{ fontSize: "12px", color: "#161616" }}>
          You will be logged out after 1 minute due to inactivity.
        </Typography>
      </CustomDialog>
    </SessionTimeoutContext.Provider>
  );
};

export default SessionTimeout;