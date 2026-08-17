import React from "react";
import {
  Alert,
  Box,
  Divider,
  Link,
  Snackbar,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import LoginImage from "../../assets/Login-Image.svg";
import IPRULogo from "../../assets/ICICI Logo_.svg";
//import AxiomLogo from "../../assets/Axiom Logo.svg";
import IBMLogo from "../../assets/IBM Logo.svg";

import CustomTextField from "../../components/ui/TextField/TextField";
import CustomCheckbox from "../../components/ui/Checkbox/Checkbox";
import CustomButton from "../../components/ui/Button/Button";

import { useAppDispatch } from "../../store/hooks";
import { loginThunk } from "../../store/thunks/authThunk";
import { setCredentials } from "../../store/slices/apiSlice";

import { getInboxPath } from "../../routes/routes";
import { VALIDATIONS } from "../../validations/validation";
import { centerFlex, columnFlex } from "../../utils/styles";
import {
  decryptString,
  encryptString,
} from "../../utils/crypto";

type LoginForm = {
  username: string;
  password: string;
};

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    reset,
  } = useForm<LoginForm>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const [status, setStatus] = React.useState<
    "idle" | "loading"
  >("idle");

  const [snackbarOpen, setSnackbarOpen] =
    React.useState(false);

  const [snackbarMessage, setSnackbarMessage] =
    React.useState("");

  const [remember, setRemember] =
    React.useState(false);

  const openErrorSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const storeRememberedCredentials = async (
    data: LoginForm,
  ) => {
    if (!remember) {
      localStorage.removeItem("remember_data");
      localStorage.removeItem("remember_me");
      return;
    }

    try {
      const payload = JSON.stringify({
        username: data.username,
        password: data.password,
      });

      const encrypted = await encryptString(payload);

      localStorage.setItem(
        "remember_data",
        encrypted,
      );

      localStorage.setItem(
        "remember_me",
        "true",
      );
    } catch (error) {
      console.error(
        "Failed to save remembered credentials",
        error,
      );
    }
  };

 const onSubmit = async (data: LoginForm) => {
  setStatus("loading");

  try {
    const response = await dispatch(
      loginThunk({
        username: btoa(data.username),
        password: btoa(data.password),
      }),
    ).unwrap();

    // Direct guard allows TypeScript to narrow response.data.
    if (
      response.response_code !== 200 ||
      response.error ||
      !response.data
    ) {
      openErrorSnackbar(
        response.message || "Login failed",
      );
      return;
    }

    // TypeScript now knows loginData is not null.
    const loginData = response.data;
    const username =
      loginData.username || data.username;

    localStorage.setItem(
      "token",
      loginData.token,
    );

    localStorage.setItem(
      "username",
      username,
    );

    localStorage.setItem(
      "password",
      data.password,
    );

    localStorage.setItem(
      "roles",
      JSON.stringify(loginData.roles ?? []),
    );

    if (loginData.lastLoginAt) {
      localStorage.setItem(
        "lastLoginAt",
        loginData.lastLoginAt,
      );
    } else {
      localStorage.removeItem("lastLoginAt");
    }

    dispatch(
      setCredentials({
        username,
        password: data.password,
        token: loginData.token,
        refreshToken: loginData.refreshToken,
        roles: loginData.roles ?? [],
      }),
    );

    await storeRememberedCredentials(data);

    navigate(getInboxPath(), {
      replace: true,
    });
  } catch (error) {
    console.error("Login failed", error);

    const errorMessage =
      typeof error === "string"
        ? error
        : error instanceof Error
          ? error.message
          : "Login failed";

    openErrorSnackbar(errorMessage);
  } finally {
    setStatus("idle");
  }
};
  React.useEffect(() => {
    const loadRememberedCredentials = async () => {
      try {
        const encryptedData =
          localStorage.getItem("remember_data");

        const rememberMe =
          localStorage.getItem("remember_me") ===
          "true";

        if (!encryptedData || !rememberMe) {
          return;
        }

        const decryptedData =
          await decryptString(encryptedData);

        if (!decryptedData) {
          return;
        }

        const parsedData = JSON.parse(
          decryptedData,
        ) as Partial<LoginForm>;

        reset({
          username: parsedData.username ?? "",
          password: parsedData.password ?? "",
        });

        setRemember(true);
      } catch (error) {
        console.error(
          "Failed to load remembered credentials",
          error,
        );

        localStorage.removeItem("remember_data");
        localStorage.removeItem("remember_me");
      }
    };

    void loadRememberedCredentials();
  }, [reset]);

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Left Section */}
      <Box
        sx={{
          width: "50%",
          position: "relative",
        }}
      >
        <Box
          component="img"
          src={LoginImage}
          alt="Underwriter reviewing an insurance form"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
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
          {/* ICICI Logo */}
          <Box>
            <Box
              component="img"
              src={IPRULogo}
              alt="ICICI Life Logo"
              sx={{ height: 60 }}
            />
             <Typography
              variant="body1"
              color="text.secondary"
            >
              Log in to access your account
            </Typography>
          </Box>

          {/* Header */}
          {/* <Box>
            <Box
              component="img"
              src={AxiomLogo}
              alt="Axiom Logo"
            />

            <Typography
              variant="body1"
              color="text.secondary"
            >
              Log in to access your account
            </Typography>
          </Box> */}

          {/* Login Form */}
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
              <Typography
                variant="body2"
                sx={{ mb: 1 }}
              >
                User ID*
              </Typography>

              <Controller
                name="username"
                control={control}
                rules={VALIDATIONS.username}
                render={({
                  field,
                  fieldState,
                }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    placeholder="Enter your User ID"
                    autoComplete="username"
                    error={Boolean(
                      fieldState.error,
                    )}
                    helperText={
                      fieldState.error?.message
                    }
                  />
                )}
              />
            </Box>

            {/* Password */}
            <Box>
              <Typography
                variant="body2"
                sx={{ mb: 1 }}
              >
                Password*
              </Typography>

              <Controller
                name="password"
                control={control}
                rules={VALIDATIONS.password}
                render={({
                  field,
                  fieldState,
                }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    type="password"
                    placeholder="Enter your Password"
                    autoComplete="current-password"
                    error={Boolean(
                      fieldState.error,
                    )}
                    helperText={
                      fieldState.error?.message
                    }
                  />
                )}
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  mt: 1,
                  fontSize: "11px",
                }}
              >
                It must be at least 8 characters
                long and include letters and
                numbers.
              </Typography>
            </Box>

            {/* Remember Me */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
              }}
            >
              <CustomCheckbox
                label="Remember me"
                checked={remember}
                onChange={(event) =>
                  setRemember(
                    event.target.checked,
                  )
                }
              />
            </Box>

            {/* Login Button */}
            <CustomButton
              fullWidth
              variant="contained"
              sx={{ borderRadius: "50px" }}
              type="submit"
              disabled={status === "loading"}
            >
              {status === "loading"
                ? "Signing in..."
                : "Log In"}
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
              © 2026 ICICI Prudential
              Insurance,&nbsp;
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
          <Typography variant="body2">
            Powered by
          </Typography>

          <Box
            component="img"
            src={IBMLogo}
            alt="IBM Logo"
          />
        </Box>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;