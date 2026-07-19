import { createContext, useContext } from "react";

export type SessionTimeoutContextValue = {
  remainingMs: number;
};

export const SessionTimeoutContext = createContext<SessionTimeoutContextValue>({
  remainingMs: 0,
});

export const useSessionTimeout = () => useContext(SessionTimeoutContext);