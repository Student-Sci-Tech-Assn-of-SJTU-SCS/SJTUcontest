import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  InputAdornment,
  Pagination,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  Download as DownloadIcon,
  FolderShared as FolderSharedIcon,
  HistoryEdu as ExperienceIcon,
  InsertDriveFile as FileIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import axios from "axios";

import { resourceAPI } from "../../services/ResourceServices";
import showMessage from "../../utils/message";

const CATEGORIES = {
  CONTEST_MATERIAL: "contest_material",
  PAST_EXPERIENCE: "past_experience",
};

const EMPTY_FORM = { title: "", description: "", attachment: null };

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const ExpandableDescription = ({ children }) => {
  const textRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);

  useLayoutEffect(() => {
    if (expanded || !textRef.current) return undefined;

    const measureOverflow = () => {
      const element = textRef.current;
      if (element) {
        setCanExpand(element.scrollHeight > element.clientHeight + 1);
      }
    };

    measureOverflow();
    const observer = new ResizeObserver(measureOverflow);
    observer.observe(textRef.current);
    return () => observer.disconnect();
  }, [children, expanded]);

  return (
    <Box>
      <Typography
        ref={textRef}
        variant="body2"
        color="text.secondary"
        sx={{
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          ...(expanded
            ? {}
            : {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 2,
                overflow: "hidden",
              }),
        }}
      >
        {children}
      </Typography>
      {canExpand && (
        <Button
          size="small"
          onClick={() => setExpanded((value) => !value)}
          sx={{ mt: 0.5, minWidth: 0, px: 0, textTransform: "none" }}
        >
          {expanded ? "收起" : "展开详情"}
        </Button>
      )}
    </Box>
  );
};

const Resources = () => {
  const theme = useTheme();
  const [category, setCategory] = useState(CATEGORIES.CONTEST_MATERIAL);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const fetchResources = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        const response = await resourceAPI.getResources(
          { category, query, pageIndex, pageSize: 12 },
          { signal },
        );
        setResources(response.data.resources || []);
        setPageCount(Math.max(response.data.total_pages || 1, 1));
      } catch (error) {
        if (axios.isCancel(error)) return;
        showMessage(getErrorMessage(error, "资料加载失败"), "error");
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [category, pageIndex, query],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchResources(controller.signal);
    return () => controller.abort();
  }, [fetchResources]);

  const handleCategoryChange = (_, value) => {
    setCategory(value);
    setPageIndex(1);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setQuery(searchInput.trim());
    setPageIndex(1);
  };

  const handleUpload = async () => {
    if (!form.title.trim()) {
      showMessage("请填写资料标题", "warning");
      return;
    }
    if (category === CATEGORIES.CONTEST_MATERIAL && !form.attachment) {
      showMessage("相关竞赛资料必须上传附件", "warning");
      return;
    }
    if (
      category === CATEGORIES.PAST_EXPERIENCE &&
      !form.description.trim() &&
      !form.attachment
    ) {
      showMessage("请填写经验内容或上传附件", "warning");
      return;
    }

    try {
      setUploading(true);
      const response = await resourceAPI.createResource({
        category,
        title: form.title.trim(),
        description: form.description.trim(),
        attachment: form.attachment,
      });
      showMessage(response.message || "资料分享成功", "success");
      setUploadOpen(false);
      setForm(EMPTY_FORM);
      setPageIndex(1);
      await fetchResources();
    } catch (error) {
      const validation = error.response?.data?.data;
      const firstValidationMessage =
        validation &&
        Object.values(validation)
          .flat()
          .find((message) => message);
      showMessage(
        firstValidationMessage || getErrorMessage(error, "资料上传失败"),
        "error",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (resource) => {
    try {
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
      setResources((items) =>
        items.map((item) =>
          item.id === resource.id
            ? { ...item, download_count: item.download_count + 1 }
            : item,
        ),
      );
    } catch (error) {
      showMessage(getErrorMessage(error, "附件下载失败"), "error");
    }
  };

  const handleDelete = async (resource) => {
    if (!window.confirm(`确定删除“${resource.title}”吗？`)) return;
    try {
      const response = await resourceAPI.deleteResource(resource.id);
      showMessage(response.message || "资料删除成功", "success");
      await fetchResources();
    } catch (error) {
      showMessage(getErrorMessage(error, "资料删除失败"), "error");
    }
  };

  return (
    <Box sx={{ py: 4, minHeight: "70vh" }}>
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <FolderSharedIcon color="primary" sx={{ fontSize: 52, mb: 1 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          资料分享
        </Typography>
        <Typography color="text.secondary">
          校内竞赛资料与参赛经验交流，登录后即可查看和下载
        </Typography>
      </Box>

      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 3,
          borderColor: alpha(theme.palette.primary.main, 0.2),
        }}
      >
        <Tabs
          value={category}
          onChange={handleCategoryChange}
          variant="fullWidth"
          aria-label="资料子版块"
          sx={{
            "& .MuiTab-root": {
              minHeight: 72,
              fontSize: { xs: "1rem", sm: "1.12rem" },
              fontWeight: 650,
            },
            "& .MuiTab-iconWrapper svg": {
              fontSize: 26,
            },
          }}
        >
          <Tab
            value={CATEGORIES.CONTEST_MATERIAL}
            icon={<FileIcon />}
            iconPosition="start"
            label="相关竞赛资料"
          />
          <Tab
            value={CATEGORIES.PAST_EXPERIENCE}
            icon={<ExperienceIcon />}
            iconPosition="start"
            label="往届经验分享"
          />
        </Tabs>
      </Card>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ display: "flex", gap: 1, flexGrow: 1 }}
        >
          <TextField
            fullWidth
            size="small"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="搜索标题或简介"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button type="submit" variant="outlined">
            搜索
          </Button>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setUploadOpen(true)}
        >
          分享资料
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        请勿上传包含个人敏感信息、侵权内容或恶意程序的文件；单个附件最大 15 MB。
      </Alert>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : resources.length === 0 ? (
        <Box
          sx={{
            py: 10,
            textAlign: "center",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 3,
          }}
        >
          <Typography color="text.secondary">
            暂无资料，欢迎成为第一位分享者
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {resources.map((resource) => (
            <Grid key={resource.id} size={{ xs: 12, md: 6 }}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: theme.shadows[4],
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Typography variant="h6" fontWeight={650}>
                      {resource.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={resource.category_label}
                      color={
                        resource.category === CATEGORIES.CONTEST_MATERIAL
                          ? "primary"
                          : "secondary"
                      }
                    />
                  </Box>
                  {resource.description && (
                    <ExpandableDescription>
                      {resource.description}
                    </ExpandableDescription>
                  )}
                  {resource.has_attachment && (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 2,
                        p: 1.25,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                      }}
                    >
                      <FileIcon color="primary" fontSize="small" />
                      <Typography
                        variant="body2"
                        sx={{ flexGrow: 1, overflowWrap: "anywhere" }}
                      >
                        {resource.original_filename}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(resource.file_size)}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <Divider />
                <CardActions
                  sx={{
                    px: 2,
                    py: 1.5,
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {resource.uploader.nick_name} ·{" "}
                    {new Date(resource.created_at).toLocaleDateString("zh-CN")}
                    {resource.has_attachment &&
                      ` · 下载 ${resource.download_count} 次`}
                  </Typography>
                  <Box>
                    {resource.has_attachment && (
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownload(resource)}
                      >
                        下载
                      </Button>
                    )}
                    {resource.can_delete && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(resource)}
                      >
                        删除
                      </Button>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {pageCount > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            count={pageCount}
            page={pageIndex}
            onChange={(_, value) => setPageIndex(value)}
            color="primary"
          />
        </Box>
      )}

      <Dialog
        open={uploadOpen}
        onClose={() => !uploading && setUploadOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          分享到
          {category === CATEGORIES.CONTEST_MATERIAL
            ? "“相关竞赛资料”"
            : "“往届经验分享”"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            required
            label="标题"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            inputProps={{ maxLength: 120 }}
            sx={{ mt: 1, mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            minRows={4}
            label={
              category === CATEGORIES.PAST_EXPERIENCE
                ? "经验内容"
                : "资料简介（可选）"
            }
            value={form.description}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                description: event.target.value,
              }))
            }
            sx={{ mb: 2 }}
          />
          <Button component="label" variant="outlined" startIcon={<FileIcon />}>
            {form.attachment ? "重新选择附件" : "选择附件"}
            <input
              hidden
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv,.png,.jpg,.jpeg,.zip,.rar,.7z"
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  attachment: event.target.files?.[0] || null,
                }))
              }
            />
          </Button>
          {form.attachment && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {form.attachment.name}（{formatFileSize(form.attachment.size)}）
            </Typography>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            sx={{ mt: 1 }}
          >
            {category === CATEGORIES.CONTEST_MATERIAL
              ? "该子版块必须上传附件。"
              : "经验内容与附件至少填写一项。"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={uploading}
            onClick={() => {
              setUploadOpen(false);
              setForm(EMPTY_FORM);
            }}
          >
            取消
          </Button>
          <Button
            variant="contained"
            disabled={uploading}
            onClick={handleUpload}
            startIcon={uploading ? <CircularProgress size={18} /> : <AddIcon />}
          >
            {uploading ? "上传中" : "确认分享"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Resources;
