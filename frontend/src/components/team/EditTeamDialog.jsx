// components/EditTeamDialog.jsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Box,
  Typography,
  IconButton,
  Button,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useConfirm } from "material-ui-confirm";

const EditTeamDialog = ({
  open,
  initialValues,
  onClose,
  onSubmit,
  title = "编辑队伍",
  confirmText = "保存修改",
  cancelText = "取消",
}) => {
  const confirm = useConfirm();

  const [values, setValues] = useState({
    name: "",
    introduction: "",
    expected_members: 1,
    recruitment_deadline: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toDatetimeLocal = (val) => {
    if (!val) return "";
    // 已经是 yyyy-MM-ddTHH:mm 直接返回
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (isNaN(d)) return "";
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // 打开时用父级传入的初始值填充
  useEffect(() => {
    if (open) {
      setValues({
        name: initialValues?.name ?? "",
        introduction: initialValues?.introduction ?? "",
        expected_members:
          typeof initialValues?.expected_members === "number"
            ? initialValues.expected_members
            : 1,
        recruitment_deadline: toDatetimeLocal(
          initialValues?.recruitment_deadline ?? "",
        ),
      });
      setError("");
      setSubmitting(false);
    }
  }, [open, initialValues]);

  const validate = () => {
    if (!values.name?.trim()) return "请填写队伍名称";
    if (
      !values.recruitment_deadline ||
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(values.recruitment_deadline)
    )
      return "招募截止日期格式错误";
    if (
      !values.expected_members ||
      Number.isNaN(Number(values.expected_members)) ||
      Number(values.expected_members) < 1
    )
      return "预期人数必须为正整数";
    return "";
  };

  const handleConfirm = async () => {
    const isCreate = confirmText === "创建";

    const { confirmed} = await confirm({
      title: isCreate?"确认创建":"确认保存",
      description: isCreate
      ? "确定要创建吗？每10分钟仅能修改一次。"
      : "确定要保存修改吗？每10分钟仅能修改一次。",
      confirmationText: "保存",
      cancellationText: "取消",
    });

    if (!confirmed) {
      console.log("用户取消保存");
      return;
    }
    console.log("用户确认保存");

    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    try {
      setSubmitting(true);
      setError("");
      const maybeError = await onSubmit({
        ...values,
        expected_members: Number(values.expected_members),
      });
      if (maybeError) {
        setError(maybeError);
        setSubmitting(false);
      } else {
        onClose?.();
      }
    } catch (e) {
      const resp = e?.response?.data;
      let msg = "";

      if (resp && resp.data && typeof resp.data === "object") {
        const firstKey = Object.keys(resp.data)[0];
        const firstVal = resp.data[firstKey];
        if (Array.isArray(firstVal) && firstVal.length > 0) {
          msg = firstVal[0];
        }
      }

      if (!msg) {
        msg = resp?.message || resp?.detail || e?.message || "提交失败";
      }

      setError(msg);
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose?.()}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="队伍名称"
            value={values.name}
            onChange={(e) => setValues((s) => ({ ...s, name: e.target.value }))}
            required
            fullWidth
          />

          <TextField
            label="队伍简介（建议填写联系方式+招募需求）"
            value={values.introduction}
            onChange={(e) =>
              setValues((s) => ({ ...s, introduction: e.target.value }))
            }
            fullWidth
            multiline
            minRows={4}
            placeholder={`按Tab键确认：
          - 项目方向：XXX
          - 希望招募：前端、视觉设计、网络安全
          - 联系方式：微信/邮箱/QQ/电话`}
            InputProps={{
              style: {
                fontStyle: values.introduction ? "normal" : "italic",
                color: values.introduction ? "inherit" : "#888",
                whiteSpace: "pre-line", // 保持多行 placeholder 格式
              },
              onKeyDown: (e) => {
                if (e.key === "Tab" && !values.introduction) {
                  e.preventDefault();
                  setValues((s) => ({
                    ...s,
                    introduction: `项目方向：
希望招募：
联系方式：`,
                  }));
                }
              },
            }}
          />

          <Box>
            <Typography variant="subtitle1" gutterBottom>
              预期人数
            </Typography>
            <Box
              display="flex"
              alignItems="center"
              sx={{
                border: "1px solid #ccc",
                borderRadius: 1,
                width: "fit-content",
                px: 1,
                py: 0.5,
              }}
            >
              <IconButton
                onClick={() =>
                  setValues((s) => ({
                    ...s,
                    expected_members: Math.max(
                      1,
                      Number(s.expected_members || 1) - 1,
                    ),
                  }))
                }
                size="small"
              >
                <RemoveIcon />
              </IconButton>
              <TextField
                variant="standard"
                value={values.expected_members}
                onChange={(e) => {
                  const val = e.target.value;
                  setValues((s) => ({
                    ...s,
                    expected_members: val === "" ? "" : Number(val),
                  }));
                }}
                inputProps={{
                  type: "number",
                  min: 1,
                  style: { textAlign: "center", width: "40px" },
                }}
                sx={{
                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                    { WebkitAppearance: "none", margin: 0 },
                  "& input[type=number]": { MozAppearance: "textfield" },
                }}
              />
              <IconButton
                onClick={() =>
                  setValues((s) => ({
                    ...s,
                    expected_members: Number(s.expected_members || 0) + 1,
                  }))
                }
                size="small"
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Box>

          <TextField
            label="招募截止日期"
            type="datetime-local"
            value={values.recruitment_deadline}
            onChange={(e) =>
              setValues((s) => ({ ...s, recruitment_deadline: e.target.value }))
            }
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            // inputProps={{
            //   onKeyDown: (e) => e.preventDefault(),
            // }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={submitting}
        >
          {submitting ? "提交中..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditTeamDialog;
