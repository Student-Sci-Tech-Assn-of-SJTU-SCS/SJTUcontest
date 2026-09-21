import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  CalendarToday as CalendarIcon,
  Category as CategoryIcon,
  DeleteOutline as DeleteIcon,
  Download as DownloadIcon,
  InsertDriveFile as FileIcon,
  PersonOutline as PersonIcon,
} from "@mui/icons-material";
import axios from "axios";

import { resourceAPI } from "../../services/ResourceServices";
import showMessage from "../../utils/message";

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const InfoItem = ({ icon, label, children }) => {
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        borderRadius: 3,
        bgcolor: alpha(theme.palette.primary.main, 0.035),
        borderColor: alpha(theme.palette.primary.main, 0.12),
      }}
    >
      <Box
        sx={{
          mt: 0.25,
          color: "primary.main",
          display: "flex",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography
          component="div"
          variant="body2"
          sx={{ mt: 0.25, fontWeight: 600, overflowWrap: "anywhere" }}
        >
          {children}
        </Typography>
      </Box>
    </Paper>
  );
};

export default function ResourceDetail() {
  const { resource_id: resourceId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchResource = async () => {
      try {
        setLoading(true);
        setLoadError("");
        const response = await resourceAPI.getResource(resourceId, {
          signal: controller.signal,
        });
        setResource(response.data);
      } catch (error) {
        if (axios.isCancel(error)) return;
        setLoadError(getErrorMessage(error, "资料详情加载失败"));
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchResource();
    return () => controller.abort();
  }, [resourceId]);

  const handleDownload = async () => {
    if (!resource?.has_attachment || downloading) return;

    try {
      setDownloading(true);
      const blob = await resourceAPI.downloadResource(resource.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download =
        resource.original_filename.replaceAll("/", "_").replaceAll("\\", "_") ||
        "资料附件";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      setResource((current) => ({
        ...current,
        download_count: current.download_count + 1,
      }));
    } catch (error) {
      showMessage(getErrorMessage(error, "附件下载失败"), "error");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`确定删除“${resource.title}”吗？`)) return;

    try {
      setDeleting(true);
      const response = await resourceAPI.deleteResource(resource.id);
      showMessage(response.message || "资料删除成功", "success");
      navigate("/resources", { replace: true });
    } catch (error) {
      showMessage(getErrorMessage(error, "资料删除失败"), "error");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (loadError || !resource) {
    return (
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          返回
        </Button>
        <Alert severity="error" sx={{ mt: 3 }}>
          {loadError || "未找到该资料"}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "75vh", py: 4 }}>
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mb: 3, color: "text.secondary" }}
        >
          返回资料分享
        </Button>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2.5, sm: 4 },
                borderRadius: 4,
                borderColor: alpha(theme.palette.primary.main, 0.14),
                boxShadow: `0 8px 30px ${alpha(theme.palette.common.black, 0.04)}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{ mb: 2 }}
              >
                <Chip label={resource.category_label} color="primary" />
                {resource.is_other_contest && (
                  <Chip label="其他比赛" color="secondary" variant="outlined" />
                )}
              </Stack>

              <Typography
                component="h1"
                variant="h4"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.35,
                  overflowWrap: "anywhere",
                }}
              >
                {resource.title}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" fontWeight={700} gutterBottom>
                {resource.category === "past_experience"
                  ? "经验内容"
                  : "资料简介"}
              </Typography>
              <Typography
                color={
                  resource.description ? "text.secondary" : "text.disabled"
                }
                sx={{
                  whiteSpace: "pre-wrap",
                  overflowWrap: "anywhere",
                  lineHeight: 1.9,
                }}
              >
                {resource.description || "分享者暂未填写简介。"}
              </Typography>

              {resource.has_attachment && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    资料附件
                  </Typography>
                  <Paper
                    variant="outlined"
                    sx={{
                      mt: 1.5,
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      borderRadius: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                    }}
                  >
                    <FileIcon color="primary" sx={{ fontSize: 36 }} />
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography
                        fontWeight={650}
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {resource.original_filename}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(resource.file_size)} · 已下载{" "}
                        {resource.download_count} 次
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      startIcon={
                        downloading ? (
                          <CircularProgress size={18} />
                        ) : (
                          <DownloadIcon />
                        )
                      }
                      disabled={downloading}
                      onClick={handleDownload}
                      sx={{ flexShrink: 0 }}
                    >
                      {downloading ? "下载中" : "下载"}
                    </Button>
                  </Paper>
                </>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2.5}>
              <Paper
                variant="outlined"
                sx={{ p: 2.5, borderRadius: 4, borderColor: "divider" }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  资料信息
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={12}>
                    <InfoItem icon={<CategoryIcon />} label="所属竞赛">
                      {resource.contest_name}
                    </InfoItem>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 12 }}>
                    <InfoItem icon={<PersonIcon />} label="分享者">
                      {resource.uploader.nick_name}
                    </InfoItem>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 12 }}>
                    <InfoItem icon={<CalendarIcon />} label="上传时间">
                      {new Date(resource.created_at).toLocaleString("zh-CN")}
                    </InfoItem>
                  </Grid>
                </Grid>

                {resource.contest && (
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate(`/contests/${resource.contest.id}`)}
                    sx={{ mt: 2 }}
                  >
                    查看所属赛事
                  </Button>
                )}
              </Paper>

              {resource.can_delete && (
                <Button
                  color="error"
                  variant="outlined"
                  startIcon={
                    deleting ? <CircularProgress size={18} /> : <DeleteIcon />
                  }
                  disabled={deleting}
                  onClick={handleDelete}
                >
                  {deleting ? "正在删除" : "删除这条分享"}
                </Button>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
