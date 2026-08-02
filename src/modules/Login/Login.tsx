import React from "react";
import { Box, Divider, Typography, Link } from "@mui/material";

import LoginImage from "../../assets/Login-Image.svg";
import IPRULogo from "../../assets/ICICI-Logo.svg";
import AxiomLogo from "../../assets/Axiom Logo.svg";
import IBMLogo from "../../assets/IBM Logo.svg";

import { centerFlex, columnFlex } from "../../utils/styles";

import CustomTextField from "../../components/ui/TextField/TextField";
import CustomCheckbox from "../../components/ui/Checkbox/Checkbox";
import CustomButton from "../../components/ui/Button/Button";

import { VALIDATIONS } from "../../validations/validation";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { loginThunk } from "../../store/thunks/authThunk";
import { useAppDispatch } from "../../store/hooks";
import { getInboxPath } from "../../routes/routes";
import { loadMasterData } from "../Helper/MasterHelper";
import { DRS_MASTER_KEYS } from "../DRS/drsMasters";

type LoginForm = {
  username: string;
  password: string;
};
const Login = () => {
  const { control, handleSubmit } = useForm<LoginForm>();
const dispatch = useAppDispatch();
const navigate = useNavigate();
  const USE_MOCK_LOGIN = true;
  const [status, setStatus] = React.useState<"idle" | "loading">("idle");

  const onSubmit = async (data:LoginForm) => {
  setStatus("loading");

  try {
     let res;

    if (USE_MOCK_LOGIN) {
      // Mock API response
      res = {
        ldapAuthentication: "Success",
        token: "mock-token-123456",
      };
    } else {
      // Real API
      res = await dispatch(
        loginThunk({
          username: data.username,
          password: data.password,
        })
      ).unwrap();
    }

    if (res?.ldapAuthentication === "Success") {
      const normalizedBusinessType = "retail";

      localStorage.setItem("token", res.token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("password", data.password);
      localStorage.setItem("businessType", normalizedBusinessType);

      // Skip this if your masters API also depends on authentication
      // if (!USE_MOCK_LOGIN) {
        try {
          await loadMasterData(dispatch, {types:DRS_MASTER_KEYS});
        } catch (error) {
          console.error("Failed to load master data", error);
        }
      // }

      navigate(getInboxPath(normalizedBusinessType));
    }
  } catch (err) {
    console.error("Login failed", err);
  } finally {
    setStatus("idle");
  }
};

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left Section */}
      <Box sx={{ width: "50%", position: "relative" }}>
        <Box
          component="img"
          src={LoginImage}
          alt="Underwriter reviewing and filling out an insurance form"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* <Box
          sx={{
            position: "absolute",
            bottom: "8.33%",
            color: "#fff",
            px: 4,
          }}
        >
          <Typography sx={{ fontSize: "36px", fontWeight: "bold" }}>
            Secure Underwriting Solutions
          </Typography>

          <Typography sx={{ fontSize: "1.125rem", fontWeight: 500 }}>
            Streamline your insurance underwriting process with our
            comprehensive platform designed for efficiency and accuracy.
          </Typography>
        </Box> */}
      </Box>

      {/* Right Section */}
      <Box
        sx={{
          width: "50%",
          ...centerFlex,
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 400,
            px: 4,
            py: 2,
            gap: 2.5,
            ...columnFlex,
          }}
        >
          {/* Logo */}
          <Box>
            <Box
              component="img"
              src={IPRULogo}
              alt="ICICI Prudential Logo"
              sx={{ height: 40 }}
            />
          </Box>

          {/* Header */}
          <Box>
            <Box component="img" src={AxiomLogo} alt="Axiom Logo" />
            <Typography variant="body1" color="text.secondary">
              Log in to access your account
            </Typography>
          </Box>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              ...columnFlex,
              gap: 1,
            }}
          >
            {/* Username */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                User ID*
              </Typography>

              <Controller
                name="username"
                control={control}
                rules={VALIDATIONS.username}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    placeholder="enter your User ID"
                    autoComplete="username"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Box>

            {/* Password */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Password*
              </Typography>

              <Controller
                name="password"
                control={control}
                rules={VALIDATIONS.password}
                render={({ field, fieldState }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type="password"
                    placeholder="enter your Password"
                    autoComplete="current-password"
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, fontSize: "11px" }}
              >
                It must be at least 8 characters long and include letters and numbers.
              </Typography>
            </Box>

            {/* Remember */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <CustomCheckbox label="Remember me" />
            </Box>

            {/* Login Button */}
            <CustomButton
              fullWidth
              variant="contained"
              sx={{ borderRadius: "50px" }}
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Signing in..." : "Log In"}
            </CustomButton>
          </Box>

          {/* Footer */}
          <Box sx={{ textAlign: "center" }}>
            <Divider sx={{ mb: 1 }} />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: "11px" }}
            >
              © 2026 ICICI Prudential Insurance,&nbsp;
              <Link href="#" underline="hover">
                Privacy Policy
              </Link>
              &nbsp; | &nbsp;
              <Link href="#" underline="hover">
                Terms and Conditions
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Bottom Branding */}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Typography variant="body2">Powered by</Typography>
          <Box component="img" src={IBMLogo} alt="IBM Logo" />
        </Box>
      </Box>
    </Box>
  );
};

export default Login;