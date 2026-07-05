import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import EventIcon from "@mui/icons-material/Event";
import GroupsIcon from "@mui/icons-material/Groups";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";
import { contestAPI } from "../../services/ContestServices";

const getErrorMessage = (error, fallback) => {
  const resp = error?.response?.data;
  if (resp?.data && typeof resp.data === "object") {
    const firstKey = Object.keys(resp.data)[0];
    const firstVal = resp.data[firstKey];
    if (Array.isArray(firstVal) && firstVal.length > 0) {
      return `${resp.message || fallback}：${firstVal[0]}`;
    }
    if (typeof firstVal === "string") {
      return `${resp.message || fallback}：${firstVal}`;
    }
  }
  return resp?.message || resp?.detail || error?.message || fallback;
};

const formatDateTime = (value) => {
  if (!value) return "未设置";
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isTeamFull = (team) =>
  Number(team.existing_members) >= Number(team.expected_members);

const isDeadlineExpired = (team) =>
  team.recruitment_deadline
    ? new Date(team.recruitment_deadline) <= new Date()
    : false;

const isTeamRecruiting = (team) => !isTeamFull(team) && !isDeadlineExpired(team);

const ExpandableText = ({
  text,
  emptyText,
  variant = "body2",
  color = "text.secondary",
  sx = {},
}) => {
  const textRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const displayText = text || emptyText;

  useEffect(() => {
    setExpanded(false);
  }, [displayText]);

  useEffect(() => {
    if (expanded) return undefined;

    const measureOverflow = () => {
      const el = textRef.current;
      if (!el) return;
      setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };

    const timer = window.setTimeout(measureOverflow, 0);
    window.addEventListener("resize", measureOverflow);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", measureOverflow);
    };
  }, [displayText, expanded]);

  return (
    <Box>
      <Typography
        ref={textRef}
        variant={variant}
        color={color}
        sx={{
          whiteSpace: "pre-wrap",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
          ...(!expanded && {
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }),
          ...sx,
        }}
      >
        {displayText}
      </Typography>
      {overflowing && (
        <Button
          size="small"
          variant="text"
          onClick={() => setExpanded((prev) => !prev)}
          sx={{ mt: 0.25, minWidth: 0, px: 0.5 }}
        >
          {expanded ? "收起" : "展开"}
        </Button>
      )}
    </Box>
  );
};

const ContestRegistrationDetail = () => {
  const { contest_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [contest, setContest] = useState(null);
  const [teams, setTeams] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [stats, setStats] = useState({
    activeTeams: 0,
    totalTeams: 0,
    officialRegisteredTeams: 0,
  });
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({
    query: "",
    official_status: "all",
    member_status: "all",
    deadline_status: "all",
  });
  const pageSize = 20;

  useEffect(() => {
    const fetchRegistrationTeams = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await contestAPI.getContestRegistrationTeams(
          contest_id,
          pageIndex,
          pageSize,
          filters,
        );

        if (res.success) {
          setContest(res.data?.contest || null);
          setTeams(res.data?.teams || []);
          setPageCount(res.data?.total_pages || 0);
          setStats({
            activeTeams: res.data?.active_teams || 0,
            totalTeams: res.data?.total_teams || 0,
            officialRegisteredTeams: res.data?.official_registered_teams || 0,
          });
        } else {
          setError(res.message || "获取报名详情失败");
        }
      } catch (err) {
        setError(getErrorMessage(err, "获取报名详情失败"));
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrationTeams();
  }, [contest_id, pageIndex, filters]);

  const handleSearch = () => {
    setFilters((prev) => ({ ...prev, query: searchInput.trim() }));
    setPageIndex(1);
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({ ...prev, [field]: event.target.value }));
    setPageIndex(1);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setFilters({
      query: "",
      official_status: "all",
      member_status: "all",
      deadline_status: "all",
    });
    setPageIndex(1);
  };

  return (
    <Box
      sx={{
        px: 5,
        py: 5,
        transition: "width 0.5s ease",
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin/view-contests")}
        >
          返回比赛管理
        </Button>
      </Box>

      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ letterSpacing: 1, color: "#222", textAlign: "center" }}
      >
        报名详情
      </Typography>
      <Divider sx={{ mb: 4, mx: "auto", width: 120, borderColor: "#1976d2" }} />

      {contest && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <EmojiEventsIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {contest.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                当前展示该比赛下的全部队伍，可按报名与招募状态筛选
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}

      {!loading && !error && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              正在报名/招募队伍
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {stats.activeTeams}
            </Typography>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              已在官网报名
            </Typography>
            <Stack direction="row" spacing={1} alignItems="baseline">
              <Typography variant="h5" fontWeight={700}>
                {stats.officialRegisteredTeams}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                支队伍
              </Typography>
            </Stack>
          </Paper>
          <Paper
            elevation={0}
            sx={{
              flex: 1,
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              队伍总数
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {stats.totalTeams}
            </Typography>
          </Paper>
        </Stack>
      )}

      {!loading && !error && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              size="small"
              label="搜索队伍"
              placeholder="请输入队伍名称"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              sx={{ minWidth: { md: 240 }, flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>官网报名</InputLabel>
              <Select
                label="官网报名"
                value={filters.official_status}
                onChange={handleFilterChange("official_status")}
              >
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="completed">已报名</MenuItem>
                <MenuItem value="not_completed">未报名</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>队伍人数</InputLabel>
              <Select
                label="队伍人数"
                value={filters.member_status}
                onChange={handleFilterChange("member_status")}
              >
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="not_full">未满员</MenuItem>
                <MenuItem value="full">已满员</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>招募截止</InputLabel>
              <Select
                label="招募截止"
                value={filters.deadline_status}
                onChange={handleFilterChange("deadline_status")}
              >
                <MenuItem value="all">全部</MenuItem>
                <MenuItem value="active">未截止</MenuItem>
                <MenuItem value="expired">已截止</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleSearch}>
              搜索
            </Button>
            <Button variant="outlined" onClick={handleClearFilters}>
              清空
            </Button>
          </Stack>
        </Paper>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : teams.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            px: 3,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            color: "text.secondary",
          }}
        >
          <GroupsIcon sx={{ fontSize: 56, opacity: 0.35, mb: 1 }} />
          <Typography variant="h6" gutterBottom>
            暂无匹配的队伍
          </Typography>
          <Typography variant="body2">
            请调整队伍名称或状态筛选条件后重试。
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={2.5}>
          {teams.map((team) => {
            const completed = Boolean(team.official_registration_completed);
            const full = isTeamFull(team);
            const expired = isDeadlineExpired(team);
            const recruiting = isTeamRecruiting(team);
            const members = team.members || [];

            return (
              <Card
                key={team.id}
                elevation={0}
                sx={{
                  position: "relative",
                  border: "1px solid",
                  borderColor: completed ? "success.light" : "grey.300",
                  bgcolor: completed ? "rgba(46, 125, 50, 0.04)" : "grey.50",
                  boxShadow: completed
                    ? "none"
                    : "inset 0 0 0 1px rgba(0, 0, 0, 0.03)",
                  borderRadius: 2,
                }}
              >
                {completed && (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="已报名"
                    color="success"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      fontWeight: 600,
                    }}
                  />
                )}

                <CardContent sx={{ p: 3, pr: completed ? 12 : 3 }}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {team.name}
                      </Typography>
                      <ExpandableText
                        text={team.introduction}
                        emptyText="暂无队伍简介"
                        sx={{ mt: 0.75 }}
                      />
                    </Box>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        icon={<GroupsIcon />}
                        label={`${team.existing_members} / ${team.expected_members} 人`}
                        variant="outlined"
                        color="primary"
                        size="small"
                      />
                      <Chip
                        icon={<EventIcon />}
                        label={`招募截止：${formatDateTime(team.recruitment_deadline)}`}
                        variant="outlined"
                        size="small"
                      />
                      {!completed && (
                        <Chip
                          label="未标记官网报名"
                          size="small"
                          variant="outlined"
                          sx={{ height: 24 }}
                        />
                      )}
                      <Chip
                        label={
                          recruiting
                            ? "正在招募"
                            : full
                              ? "已满员"
                              : expired
                                ? "招募已截止"
                                : "未开放招募"
                        }
                        color={recruiting ? "primary" : "default"}
                        variant={recruiting ? "filled" : "outlined"}
                        size="small"
                        sx={{ height: 24 }}
                      />
                    </Stack>

                    <Box>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ mb: 1 }}
                      >
                        队长/成员
                      </Typography>
                      {members.length > 0 ? (
                        <Stack spacing={1}>
                          {members.map((member) => {
                            const accountText =
                              member.email || member.username || "未填写邮箱";

                            return (
                              <Paper
                                key={member.id}
                                elevation={0}
                                sx={{
                                  p: 1.25,
                                  border: "1px solid",
                                  borderColor: member.is_leader
                                    ? "primary.light"
                                    : "divider",
                                  borderRadius: 1.5,
                                  bgcolor: member.is_leader
                                    ? "rgba(25, 118, 210, 0.04)"
                                    : "grey.50",
                                }}
                              >
                                <Stack
                                  direction={{ xs: "column", sm: "row" }}
                                  spacing={1}
                                  alignItems={{ xs: "flex-start", sm: "center" }}
                                  justifyContent="space-between"
                                >
                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={{ minWidth: 0 }}
                                  >
                                    <PersonIcon
                                      fontSize="small"
                                      color={member.is_leader ? "primary" : "action"}
                                    />
                                    <Typography
                                      variant="body2"
                                      fontWeight={member.is_leader ? 600 : 500}
                                      sx={{
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      {member.nick_name || "未命名用户"}
                                    </Typography>
                                    {member.is_leader && (
                                      <Chip
                                        label="队长"
                                        color="primary"
                                        size="small"
                                        sx={{ height: 22 }}
                                      />
                                    )}
                                  </Stack>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                      wordBreak: "break-all",
                                    }}
                                  >
                                    {member.email
                                      ? `邮箱：${accountText}`
                                      : `用户名：${accountText}`}
                                  </Typography>
                                </Stack>
                              </Paper>
                            );
                          })}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          暂无成员信息
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}

          {pageCount > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", pt: 2 }}>
              <Pagination
                count={pageCount}
                page={pageIndex}
                color="primary"
                onChange={(_, value) => setPageIndex(value)}
              />
            </Box>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default ContestRegistrationDetail;
