import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Autocomplete,
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
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Tab,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon,
  DeleteOutline as DeleteIcon,
  Download as DownloadIcon,
  FolderShared as FolderSharedIcon,
  HistoryEdu as ExperienceIcon,
  InsertDriveFile as FileIcon,
  Search as SearchIcon,
  VisibilityOutlined as ViewIcon,
} from "@mui/icons-material";
import axios from "axios";

import { resourceAPI } from "../../services/ResourceServices";
import showMessage from "../../utils/message";

const CATEGORIES = {
  CONTEST_MATERIAL: "contest_material",
  PAST_EXPERIENCE: "past_experience",
};

const VIEW_MODES = {
  LIST: "list",
  GROUPED: "grouped",
};

const OTHER_CONTEST_ID = "other";
const OTHER_CONTEST_OPTION = {
  id: OTHER_CONTEST_ID,
  name: "其他（手动填写）",
};

const EMPTY_FORM = {
  title: "",
  contestId: "",
  otherContestName: "",
  description: "",
  attachment: null,
};

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || error.message || fallback;

const ExpandableText = ({
  children,
  lineLimit = 2,
  variant = "body2",
  color = "text.secondary",
  sx = {},
}) => {
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
        variant={variant}
        color={color}
        sx={{
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          ...sx,
          ...(expanded
            ? {}
            : {
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: lineLimit,
                overflow: "hidden",
              }),
        }}
      >
        {children}
      </Typography>
      {canExpand && (
        <Button
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            setExpanded((value) => !value);
          }}
          sx={{ mt: 0.5, minWidth: 0, px: 0, textTransform: "none" }}
        >
          {expanded ? "收起" : "显示更多"}
        </Button>
      )}
    </Box>
  );
};

const Resources = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [category, setCategory] = useState(CATEGORIES.CONTEST_MATERIAL);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [resources, setResources] = useState([]);
  const [groups, setGroups] = useState([]);
  const [viewMode, setViewMode] = useState(VIEW_MODES.LIST);
  const [sortBy, setSortBy] = useState("created_at");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [contestOptions, setContestOptions] = useState([]);
  const [loadingContestOptions, setLoadingContestOptions] = useState(true);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [reloadToken, setReloadToken] = useState(0);

  const showingGroupOverview =
    viewMode === VIEW_MODES.GROUPED && !selectedGroup;

  useEffect(() => {
    const controller = new AbortController();
    const fetchContestOptions = async () => {
      try {
        setLoadingContestOptions(true);
        const response = await resourceAPI.getContestOptions({
          signal: controller.signal,
        });
        setContestOptions(response.data.contests || []);
      } catch (error) {
        if (axios.isCancel(error)) return;
        showMessage(getErrorMessage(error, "竞赛选项加载失败"), "error");
      } finally {
        if (!controller.signal.aborted) setLoadingContestOptions(false);
      }
    };
    fetchContestOptions();
    return () => controller.abort();
  }, []);

  const fetchResources = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        if (showingGroupOverview) {
          const response = await resourceAPI.getResourceGroups(
            { category, query },
            { signal },
          );
          setGroups(response.data.groups || []);
          setResources([]);
          setPageCount(1);
          return;
        }

        const response = await resourceAPI.getResources(
          {
            category,
            query,
            pageIndex,
            pageSize: 12,
            sortBy,
            contestId:
              selectedGroup?.type === "contest" ? selectedGroup.contest_id : "",
            otherOnly: selectedGroup?.type === "other",
          },
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
    [category, pageIndex, query, selectedGroup, showingGroupOverview, sortBy],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchResources(controller.signal);
    return () => controller.abort();
  }, [fetchResources, reloadToken]);

  const handleCategoryChange = (_, value) => {
    setCategory(value);
    setSelectedGroup(null);
    setPageIndex(1);
  };

  const handleViewModeChange = (_, value) => {
    if (!value) return;
    setViewMode(value);
    setSelectedGroup(null);
    setPageIndex(1);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPageIndex(1);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setQuery(searchInput.trim());
    setPageIndex(1);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setPageIndex(1);
  };

  const handleGroupKeyDown = (event, group) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleGroupSelect(group);
    }
  };

  const handleUpload = async () => {
    if (!form.title.trim()) {
      showMessage("请填写资料标题", "warning");
      return;
    }
    if (!form.contestId) {
      showMessage("请选择所属竞赛", "warning");
      return;
    }
    if (form.contestId === OTHER_CONTEST_ID && !form.otherContestName.trim()) {
      showMessage("请填写所属竞赛名称", "warning");
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
        contestId: form.contestId === OTHER_CONTEST_ID ? "" : form.contestId,
        otherContestName:
          form.contestId === OTHER_CONTEST_ID
            ? form.otherContestName.trim()
            : "",
        description: form.description.trim(),
        attachment: form.attachment,
      });
      showMessage(response.message || "资料分享成功", "success");
      setUploadOpen(false);
      setForm(EMPTY_FORM);
      setPageIndex(1);
      setSelectedGroup(null);
      setReloadToken((value) => value + 1);
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
      setReloadToken((value) => value + 1);
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
            placeholder="搜索标题、简介或所属竞赛"
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

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={viewMode}
          onChange={handleViewModeChange}
          aria-label="资料呈现方式"
        >
          <ToggleButton value={VIEW_MODES.LIST}>全部资料</ToggleButton>
          <ToggleButton value={VIEW_MODES.GROUPED}>按所属竞赛分类</ToggleButton>
        </ToggleButtonGroup>

        {!showingGroupOverview && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="resource-sort-label">排列方式</InputLabel>
            <Select
              labelId="resource-sort-label"
              value={sortBy}
              label="排列方式"
              onChange={handleSortChange}
            >
              <MenuItem value="created_at">按上传顺序</MenuItem>
              <MenuItem value="download_count">按下载次数降序</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        请勿上传包含个人敏感信息、侵权内容或恶意程序的文件；单个附件最大 15 MB。
      </Alert>

      {selectedGroup && (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            mb: 3,
          }}
        >
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              setSelectedGroup(null);
              setPageIndex(1);
            }}
            sx={{ flexShrink: 0 }}
          >
            返回分类
          </Button>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="caption" color="text.secondary">
              当前所属竞赛
            </Typography>
            <ExpandableText
              variant="h6"
              color="text.primary"
              lineLimit={1}
              sx={{ fontWeight: 650 }}
            >
              {selectedGroup.name}
            </ExpandableText>
          </Box>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress />
        </Box>
      ) : showingGroupOverview ? (
        groups.length === 0 ? (
          <Box
            sx={{
              py: 10,
              textAlign: "center",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 3,
            }}
          >
            <Typography color="text.secondary">暂无可展示的竞赛分类</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {groups.map((group) => (
              <Grid key={group.key} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  variant="outlined"
                  role="button"
                  tabIndex={0}
                  onClick={() => handleGroupSelect(group)}
                  onKeyDown={(event) => handleGroupKeyDown(event, group)}
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    borderRadius: 3,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover, &:focus-visible": {
                      transform: "translateY(-3px)",
                      boxShadow: theme.shadows[4],
                      outline: "none",
                      borderColor:
                        group.type === "other"
                          ? theme.palette.secondary.main
                          : theme.palette.primary.main,
                    },
                  }}
                >
                  <CardContent>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <CategoryIcon
                        color={group.type === "other" ? "secondary" : "primary"}
                        sx={{ fontSize: 36, flexShrink: 0 }}
                      />
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <ExpandableText
                          variant="h6"
                          color="text.primary"
                          lineLimit={2}
                          sx={{ fontWeight: 650 }}
                        >
                          {group.name}
                        </ExpandableText>
                        <Typography variant="body2" color="text.secondary">
                          {group.resource_count} 条资料
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
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
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/resources/${resource.id}`)}
                onKeyDown={(event) => {
                  if (event.target !== event.currentTarget) return;
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(`/resources/${resource.id}`);
                  }
                }}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover, &:focus-visible": {
                    transform: "translateY(-3px)",
                    boxShadow: theme.shadows[4],
                    borderColor: theme.palette.primary.main,
                    outline: "none",
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
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <ExpandableText
                        variant="h6"
                        color="text.primary"
                        lineLimit={2}
                        sx={{ fontWeight: 650 }}
                      >
                        {resource.title}
                      </ExpandableText>
                    </Box>
                    <Chip
                      size="small"
                      label={resource.category_label}
                      color={
                        resource.category === CATEGORIES.CONTEST_MATERIAL
                          ? "primary"
                          : "secondary"
                      }
                      sx={{ flexShrink: 0 }}
                    />
                  </Box>

                  <Box
                    sx={{
                      mb: 1.5,
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      所属竞赛
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
                    >
                      {resource.is_other_contest && (
                        <Chip
                          size="small"
                          color="secondary"
                          variant="outlined"
                          label="其他比赛"
                          sx={{ flexShrink: 0, mt: 0.25 }}
                        />
                      )}
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <ExpandableText
                          lineLimit={1}
                          color="primary.main"
                          sx={{ fontWeight: 600 }}
                        >
                          {resource.contest_name}
                        </ExpandableText>
                      </Box>
                    </Box>
                  </Box>
                  {resource.description && (
                    <ExpandableText>{resource.description}</ExpandableText>
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
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <ExpandableText lineLimit={1}>
                          {resource.original_filename}
                        </ExpandableText>
                      </Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ flexShrink: 0 }}
                      >
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
                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <ExpandableText lineLimit={1} variant="caption">
                      {resource.uploader.nick_name} ·{" "}
                      {new Date(resource.created_at).toLocaleDateString(
                        "zh-CN",
                      )}
                      {resource.has_attachment
                        ? ` · 下载 ${resource.download_count} 次`
                        : ""}
                    </ExpandableText>
                  </Box>
                  <Box>
                    <Button
                      size="small"
                      startIcon={<ViewIcon />}
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/resources/${resource.id}`);
                      }}
                    >
                      查看详情
                    </Button>
                    {resource.has_attachment && (
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDownload(resource);
                        }}
                      >
                        下载
                      </Button>
                    )}
                    {resource.can_delete && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDelete(resource);
                        }}
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
          <Autocomplete
            options={[...contestOptions, OTHER_CONTEST_OPTION]}
            value={
              [...contestOptions, OTHER_CONTEST_OPTION].find(
                (option) => option.id === form.contestId,
              ) || null
            }
            onChange={(_, option) =>
              setForm((current) => ({
                ...current,
                contestId: option?.id || "",
                otherContestName:
                  option?.id === OTHER_CONTEST_ID
                    ? current.otherContestName
                    : "",
              }))
            }
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            loading={loadingContestOptions}
            noOptionsText="暂无匹配竞赛，请选择“其他”"
            loadingText="正在加载竞赛选项…"
            renderInput={(params) => (
              <TextField
                {...params}
                required
                label="所属竞赛"
                placeholder="搜索并选择数据库中的竞赛"
              />
            )}
            sx={{ mb: 2 }}
          />
          {form.contestId === OTHER_CONTEST_ID && (
            <TextField
              fullWidth
              required
              label="所属竞赛名称"
              value={form.otherContestName}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  otherContestName: event.target.value,
                }))
              }
              inputProps={{ maxLength: 120 }}
              helperText="该资料会归入“其他比赛”分类，并显示这里填写的具体名称。"
              sx={{ mb: 2 }}
            />
          )}
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
