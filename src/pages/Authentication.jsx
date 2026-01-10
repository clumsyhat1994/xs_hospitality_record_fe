import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
//import { getEndpoint } from "../config/runtimeConfig";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  IconButton,
  InputAdornment,
  Alert,
  Stack,
} from "@mui/material";
import endpoints from "../constants/Endpoints";
import { useAuth } from "../context/AuthProvider";

const AuthenticationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from ?? "/";

  //const LOGIN_URL = getEndpoint("LOGIN");
  const LOGIN_URL = endpoints.LOGIN;
  const {
    register,
    handleSubmit,
    formState: { errors },
    clearErrors,
  } = useForm();

  const [loginError, setLoginError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const mapFormFieldsToAPI = (data, mapping) => {
    const transformedData = {};
    for (const key in data) {
      transformedData[mapping[key] || key] = data[key];
    }
    return transformedData;
  };

  const onSubmit = async (data) => {
    const mapping = {
      username: "username",
      password: "password",
    };

    data = mapFormFieldsToAPI(data, mapping);

    try {
      const response = await axios.post(LOGIN_URL, data);

      if (response.status === 200) {
        const token = response.data.accessToken;
        if (token) localStorage.setItem("authToken", token);
        login(token);
        setLoginError("");
        clearErrors();
        navigate(from, { replace: true });
      } else {
        setLoginError(response.data.msg);
      }
    } catch (err) {
      if (err.response?.status === 401) setLoginError("用户名或密码错误！");
      else setLoginError("未知错误，请联系系统管理员！");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: (theme) =>
          theme.palette.mode === "light" ? "grey.100" : "background.default",
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" fontWeight={600} gutterBottom>
              招待费用管理系统
            </Typography>
          </Box>

          {loginError && (
            <Alert severity="error" variant="outlined">
              {loginError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              {/* Username */}
              <TextField
                label="用户名"
                fullWidth
                size="small"
                autoComplete="username"
                error={!!errors.username}
                helperText={errors.username?.message}
                {...register("username", { required: "请输入用户名" })}
              />

              {/* Password */}
              <TextField
                label="密码"
                fullWidth
                size="small"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                error={!!errors.password}
                helperText={errors.password?.message}
                {...register("password", { required: "请输入密码" })}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          edge="end"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "隐藏密码" : "显示密码"}
                        >
                          {showPassword ? (
                            <Visibility fontSize="small" />
                          ) : (
                            <VisibilityOff fontSize="small" />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{ mt: 1, py: 1 }}
              >
                登陆
              </Button>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Box>
  );
};
export default AuthenticationPage;
