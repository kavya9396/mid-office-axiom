import {
  Box,
  Button,
  Divider,
  Menu,
  Typography,
} from "@mui/material";
import {
  useEffect,
  useState,
  type MouseEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import Logo from "../../assets/ICICI Logo.svg";
import {
  KeyDownArrowIcon,
  KeyRightArrowIcon,
  KeyUpArrowIcon,
  LogoutIcon,
  TimerPauseIcon,
  UserProfileIcon,
} from "../../icons/Icons";
import { auth } from "../../utils/auth";
import { formatDateForUI } from "../../utils/helpers";
import BreakTime from "./BreakTime";
import { useSessionTimeout } from "./sessionTimeoutContext";

const HEADER_HEIGHT = 57;

const formatDateTime = (date: Date) =>
  formatDateForUI(date);

const formatSessionTime = (remainingMs: number) => {
  const totalSeconds = Math.max(
    0,
    Math.ceil(remainingMs / 1000),
  );

  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (totalSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
};

const Header = () => {
  const navigate = useNavigate();
  const { remainingMs } = useSessionTimeout();

  const username =
    localStorage.getItem("username") ?? "";

  const [dialogOpen, setDialogOpen] =
    useState<boolean>(false);

  const [currentTime, setCurrentTime] = useState(() =>
    formatDateTime(new Date()),
  );

  const [userMenuAnchor, setUserMenuAnchor] =
    useState<HTMLElement | null>(null);

  const isUserMenuOpen = Boolean(userMenuAnchor);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(formatDateTime(new Date()));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const handleUserMenuOpen = (
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleBreakTimeOpen = () => {
    handleUserMenuClose();
    setDialogOpen(true);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    auth.logout();
    navigate("/login");
  };

  return (
    <>
      <Box
        component="header"
        sx={{
          height: HEADER_HEIGHT,
          display: "flex",
          alignItems: "stretch",
          background: "linear-gradient(to bottom,#F58220 0%,#E65318 42%,#C92E27 72%,#98252B 100%)",
          boxShadow:
            "0 3px 12px rgba(111, 24, 24, 0.25)",
          position: "relative",
          // zIndex: 1100,
          overflow: "hidden",
        }}
      >
        {/* LOGO SECTION */}
        <Box
          sx={{
            height: HEADER_HEIGHT,
            flexShrink: 0,
            display: "flex",
            alignItems: "stretch",
            backgroundColor: "transparent",
          }}
        >
          <Box
            component="img"
            src={Logo}
            alt="ICICI Life Logo"
            sx={{
              height: "100%",
              width: "150px",
              display: "block",
              objectFit: "cover",
            }}
          />
        </Box>

        {/* GRADIENT USER SECTION */}
        <Box
          sx={{
            minWidth: 0,
            height: HEADER_HEIGHT,
            px: { xs: 1, sm: 2 },
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            color: "#FFFFFF",
            background: "transparent",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1.5 },
            }}
          >
            {/* DATE AND SESSION */}
            <Box
              sx={{
                minWidth: 175,
                pr: 1.5,
                textAlign: "right",
                borderRight:
                  "1px solid rgba(255,255,255,0.35)",
                display: {
                  xs: "none",
                  sm: "block",
                },
              }}
            >
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 12,
                  lineHeight: 1.4,
                }}
              >
                {currentTime}
              </Typography>

              <Typography
                sx={{
                  mt: 0.25,
                  color: "#FFFFFF",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.2,
                }}
              >
                Session:{" "}
                {formatSessionTime(remainingMs)}
              </Typography>
            </Box>

            {/* USER MENU BUTTON */}
            <Button
              onClick={handleUserMenuOpen}
              aria-controls={
                isUserMenuOpen
                  ? "user-menu"
                  : undefined
              }
              aria-haspopup="true"
              aria-expanded={
                isUserMenuOpen
                  ? "true"
                  : undefined
              }
              disableRipple
              sx={{
                minWidth: 0,
                px: { xs: 0.5, sm: 1 },
                py: 0.5,
                color: "#FFFFFF",
                textTransform: "none",
                borderRadius: 2,
                "&:hover": {
                  backgroundColor:
                    "rgba(255,255,255,0.14)",
                },
              }}
            >
              <Box
                sx={{
                  mr: 1,
                  width: 35,
                  height: 35,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                  color: "#FFFFFF",
                  backgroundColor:
                    "rgba(255,255,255,0.2)",
                  border:
                    "1px solid rgba(255,255,255,0.45)",
                  borderRadius: "50%",
                }}
              >
                <UserProfileIcon />
              </Box>

              <Box
                sx={{
                  mr: 1,
                  minWidth: 80,
                  display: {
                    xs: "none",
                    sm: "flex",
                  },
                  flexDirection: "column",
                  textAlign: "left",
                }}
              >
                <Typography
                  noWrap
                  sx={{
                    maxWidth: 150,
                    color: "#FFFFFF",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {username}
                </Typography>
              </Box>

              <Box
                sx={{
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  color: "#FFFFFF",
                }}
              >
                {isUserMenuOpen ? (
                  <KeyUpArrowIcon />
                ) : (
                  <KeyDownArrowIcon />
                )}
              </Box>
            </Button>

            <Menu
              id="user-menu"
              anchorEl={userMenuAnchor}
              open={isUserMenuOpen}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    width: 240,
                    overflow: "hidden",
                    border:
                      "1px solid #F1D7D0",
                    borderRadius: 2,
                    boxShadow:
                      "0 8px 24px rgba(70, 20, 20, 0.18)",
                  },
                },
              }}
            >
              {/* BREAK TIME */}
              <Box
                onClick={handleBreakTimeOpen}
                sx={{
                  px: 2,
                  py: 1.25,
                  cursor: "pointer",
                  color: "#323232",
                  "&:hover": {
                    backgroundColor: "#FFF3EE",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      color: "#9A2529",
                    }}
                  >
                    <TimerPauseIcon />

                    <Typography
                      sx={{
                        color: "#323232",
                        fontSize: 14,
                      }}
                    >
                      Breaktime
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: "#9A2529",
                    }}
                  >
                    <Typography
                      sx={{
                        mr: 0.5,
                        color: "#9A2529",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      30 mins
                    </Typography>

                    <KeyRightArrowIcon />
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* LOGOUT */}
              <Box
                onClick={handleLogout}
                sx={{
                  px: 2,
                  py: 1.25,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "#FFF3EE",
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: "#9A2529",
                  }}
                >
                  <LogoutIcon />

                  <Typography
                    sx={{
                      color: "#323232",
                      fontSize: 14,
                    }}
                  >
                    Logout
                  </Typography>
                </Box>
              </Box>
            </Menu>
          </Box>
        </Box>
      </Box>

      <BreakTime
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
      />
    </>
  );
};

export default Header;