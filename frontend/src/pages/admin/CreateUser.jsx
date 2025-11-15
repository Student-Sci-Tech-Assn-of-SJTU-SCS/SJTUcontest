import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  OutlinedInput,
  InputAdornment,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { userAPI } from "../../services/UserServices";
import showMessage from "../../utils/message";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("admin_create_user")) {
      setFormData(JSON.parse(sessionStorage.getItem("admin_create_user")));
    }
  }, []);

  const makeValidator = (regex, message) => ({
    method: (value) => regex.test(value),
    message,
  });

  const validations = {
    username: makeValidator(
      /^[A-Za-z0-9._@-]+$/,
      "用户名只能包含字母、数字和符号‘.’‘_’‘-’‘@’！",
    ),
    email: makeValidator(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "请输入合法的邮箱地址！",
    ),
    password: makeValidator(
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/,
      "密码需为8~16位，并包含字母、数字和特殊符号！",
    ),
  };

  const handleInputChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value.trim() });
    sessionStorage.setItem(
      "admin_create_user",
      JSON.stringify({
        ...formData,
        [field]: event.target.value.trim(),
      }),
    );
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // 验证字段格式
    for (const field in validations) {
      const { method, message } = validations[field];
      if (!method(formData[field])) {
        showMessage(message, "warning", false);
        return;
      }
    }

    const controller = new AbortController();
    setLoading(true);

    try {
      const res = await userAPI.register(formData, {
        signal: controller.signal,
      });

      if (res.success) {
        showMessage("用户创建成功！", "success");
      } else {
        showMessage(`创建用户失败：${res.message || "未知错误。"}`, "error");
      }

      setFormData({
        username: "",
        email: "",
        password: "",
      });
      sessionStorage.removeItem("admin_create_user");
    } catch (error) {
      if (axios.isCancel(error)) return;
      showMessage(
        `创建用户失败：${error.response?.data?.detail || error.message}`,
        "error",
      );
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        创建用户
      </Typography>

      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 600 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* 基本信息 */}
              <Typography variant="h6" color="primary">
                基本信息
              </Typography>

              <TextField
                fullWidth
                label="用户名"
                value={formData.username}
                onChange={handleInputChange("username")}
                placeholder="请输入用户名"
                required
              />

              <TextField
                fullWidth
                label="邮箱"
                value={formData.email}
                onChange={handleInputChange("email")}
                placeholder="请输入邮箱"
                required
              />

              <FormControl fullWidth variant="outlined" required>
                <InputLabel htmlFor="password">密码</InputLabel>
                <OutlinedInput
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange("password")}
                  placeholder="请输入密码"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleTogglePassword}
                        onMouseDown={(event) => event.preventDefault()}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="密码"
                />
              </FormControl>
              <Typography variant="caption" color="text.secondary">
                密码要求8~16位，且必须包含字母、数字和特殊符号！
              </Typography>

              {/* 提交按钮 */}
              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                >
                  {loading ? "创建中..." : "创建用户"}
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateUser;
