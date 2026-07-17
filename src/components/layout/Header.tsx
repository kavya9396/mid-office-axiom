import { Box, Button, Divider, Menu, Typography } from "@mui/material";
import Logo from "../../assets/ICICI-Logo.svg";
import AxiomLogo from "../../assets/Axiom Logo.svg";
import { useEffect, useState } from "react";
import { KeyDownArrowIcon, KeyRightArrowIcon, KeyUpArrowIcon, LogoutIcon, TimerPauseIcon, UserProfileIcon } from "../../icons/Icons";
import { useNavigate } from "react-router-dom";
import BreakTime from "./BreakTime";

const formatDateTime = (date: Date) =>
  date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

const Header = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") ?? "";
    const [dialogOpen, setDialogOpen] = useState<boolean>(false);
    const [currentTime, setCurrentTime] = useState(() => formatDateTime(new Date()));
    const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(
    null,
  );
  const isUserMenuOpen = Boolean(userMenuAnchor);
  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(formatDateTime(new Date()));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);
   const handleUserMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };
return(
     <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        boxShadow: 1,
      }}
    >
        {/* LEFT LOGO SECTION */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, ml: 2 }}>
          <Box component="img" src={Logo} alt="ICICI Prudential Logo" />

          <Box sx={{ width: "1px", height: 32, backgroundColor: "#d1d5db" }} />

          <Box component="img" src={AxiomLogo} alt="Axiom Logo" />
        </Box>

        {/* RIGHT SECTION USER DETAILS */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mr: 2 }}>
          <Typography sx={{ fontSize: 12, color: "#4b5563", minWidth: 180, textAlign: "right" }}>
            {currentTime}
          </Typography>
          <Box>
            <Button onClick={handleUserMenuOpen}>
              {/* USER ICON */}
              <Box
                sx={{
                  mr: 1,
                  p: 0.5,
                  px: 1,
                  backgroundColor: "#fff2ed",
                  borderRadius: "50%",
                }}
              >
              <Box sx={{ color: "#9A2529", mt: 0.5 }}>
                <UserProfileIcon />
              </Box>
            </Box>

            {/* USER INFO */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                textAlign: "left",
                mr: 1,
              }}
            >
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#9A2529",
                }}
              >
                {username}
              </Typography>
              {/* <Typography sx={{ color: "#323232", fontSize: 10 }}>
                UW1234
              </Typography> */}
            </Box>

            {/* ARROW */}
            {isUserMenuOpen ? (
              <Box sx={{ color: "#9A2529" }}>
                <KeyUpArrowIcon />
              </Box>
            ) : (
              <Box sx={{ color: "#9A2529" }}>
                <KeyDownArrowIcon />
              </Box>
            )}
          </Button>

          <Menu
            id="user-menu"
            anchorEl={userMenuAnchor}
            open={isUserMenuOpen}
            onClose={handleUserMenuClose}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 2,
                  boxShadow: 3,
                  width: 240,
                  overflow: "hidden",
                },
              },
            }}
          >
            {/* BREAK TIME */}
            <Box
              onClick={() => {
                handleUserMenuClose();
                setDialogOpen(true);
              }}
              sx={{
                px: 2,
                py: 1,
                mt: 1,
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f3f4f6" },
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <TimerPauseIcon />
                  <Typography>Breaktime</Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Typography
                    sx={{
                      fontWeight: 700,
                      color: "#063E6F",
                      fontSize: 12,
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
              sx={{
                px: 2,
                py: 1,
                mt: 1,
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f3f4f6" },
              }}
              onClick={() => {
  localStorage.removeItem("token"); // or your key name
  localStorage.removeItem("username");
  localStorage.removeItem("column_config_v1");
  localStorage.removeItem("roleType");
  navigate("/login");
}}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <LogoutIcon />
                <Typography>Logout</Typography>
              </Box>
            </Box>
          </Menu>
        </Box>
        </Box>

        <BreakTime dialogOpen={dialogOpen} setDialogOpen={setDialogOpen}/>
    </Box>
)
}
export default Header;