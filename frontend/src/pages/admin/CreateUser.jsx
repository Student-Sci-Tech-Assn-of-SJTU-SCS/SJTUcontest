import React, { useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Alert,
  Snackbar,
  OutlinedInput,
  InputAdornment,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { userAPI } from "../../services/UserServices";
import MessageSnackbar from "../../components/MessageSnackbar";
import { enqueueSnackbar } from "notistack";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  
  // const [message, setMessage] = useState({
  //   open: false,
  //   text: "",
  //   severity: "success",
  // });

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
    setFormData({ ...formData, [field]: event.target.value });
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
        enqueueSnackbar(message, {
          variant: "warning",
        });
        // setMessage({
        //   open: true,
        //   text: message,
        //   severity: "warning",
        // });
        return;
      }
    }

    setLoading(true);

    try {
      await userAPI.register(formData);
      enqueueSnackbar("用户创建成功！", {
        variant: "success",
      });
      // setMessage({
      //   open: true,
      //   text: "用户创建成功！",
      //   severity: "success",
      // });

      // 重置表单
      setFormData({
        username: "",
        email: "",
        password: "",
      });
    } catch (error) {
      enqueueSnackbar(`创建用户失败: ${error.response?.data?.detail || error.message}`, {
        variant: "error",
      });
      console.error("创建用户失败:", error.message);
      // setMessage({
      //   open: true,
      //   text: `创建用户失败: ${error.response?.data?.detail || error.message}`,
      //   severity: "error",
      // });
    } finally {
      setLoading(false);
    }
  };

  // const handleCloseMessage = () => {
  //   setMessage({ ...message, open: false });
  // };

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

      {/* <MessageSnackbar message={message} onClose={handleCloseMessage} /> */}
      {/* <Snackbar
        open={message.open}
        autoHideDuration={6000}
        onClose={handleCloseMessage}
      >
        <Alert
          onClose={handleCloseMessage}
          severity={message.severity}
          sx={{ width: "100%" }}
        >
          {message.text}
        </Alert>
      </Snackbar> */}
    </Box>
  );
};

export default CreateUser;
