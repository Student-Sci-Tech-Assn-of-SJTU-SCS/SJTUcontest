import { Box, Typography, Chip, Link, Stack, useTheme, alpha, Divider} from "@mui/material";

// ✅【修改处 #1】：添加 highlight 参数（默认 false）
export default function TeamCard({ team, highlight = false }) {
  const {
    id,
    name,
    introduction,
    existing_members,
    expected_members,
    recruitment_deadline,
    members,
  } = team;
  const theme = useTheme();

  const leader = members.find((m) => m.is_leader);
  const leaderName = leader ? leader.nick_name : "无队长";
  const isFull = existing_members >= expected_members;

  const getTimeStr = (t) => {
    if (!t) return "未设置";
    const date = new Date(t);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

  return (
    <Link href={`/teams/${id}`} underline="none" sx={{ textDecoration: "none" }}>
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          my: 2,
          borderRadius: 4,
          boxShadow: highlight
            ? `0 6px 24px ${alpha(theme.palette.primary.main, 0.18)}`
            : `0 2px 12px ${alpha(theme.palette.primary.main, 0.08)}`,
          border: `2px solid ${highlight
            ? theme.palette.primary.main
            : alpha(theme.palette.primary.main, 0.12)}`,
          background: highlight
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.25)}, ${alpha(theme.palette.secondary.light, 0.18)})`
            : theme.palette.background.paper,
          transition: "all 0.3s",
          "&:hover": {
            boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.22)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.35)}, ${alpha(theme.palette.secondary.light, 0.22)})`,
            transform: "translateY(-2px) scale(1.02)",
          },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* 左侧 - 队伍名称和简介 */}
        <Box sx={{ flex: 2 }}>
          <Typography
            variant="h6"
            fontWeight={700}
            sx={{
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 1,
              mb: 1,
            }}
          >
            {name}
          </Typography>
          <Divider
            sx={{
              width: 48,
              height: 3,
              borderRadius: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
              mb: 1,
            }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              fontSize: "1rem",
            }}
          >
            {introduction || "暂无简介"}
          </Typography>
        </Box>

        {/* 中间 - 队伍信息（横向） */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-end"
          sx={{ flex: 1, flexWrap: "wrap", gap: 1 }}
        >
          <Chip
            label={`队长: ${leaderName}`}
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 500,
              bgcolor: alpha(theme.palette.primary.light, 0.12),
            }}
          />
          <Chip
            label={`截止: ${getTimeStr(recruitment_deadline)}`}
            color="secondary"
            variant="outlined"
            sx={{
              fontWeight: 500,
              bgcolor: alpha(theme.palette.secondary.light, 0.12),
            }}
          />
          <Chip
            label={`成员: ${existing_members}/${expected_members}`}
            color={isFull ? "error" : "success"}
            variant="outlined"
            sx={{
              fontWeight: 500,
              bgcolor: alpha(isFull ? theme.palette.error.light : theme.palette.success.light, 0.12),
            }}
          />
        </Stack>
      </Box>
    </Link>
  );

  return (
    <Link href={`/teams/${id}`} underline="none">
      <Box
        sx={{
          p: 2,
          my: 1,
          borderRadius: 2,
          // ✅【修改处 #2】：根据 highlight 渲染边框和背景色
          border: "1px solid #ddd",
          bgcolor: highlight ? "#e3f2fd" : "#fafafa",
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          "&:hover": {
            boxShadow: 2,
            bgcolor: highlight ? "#d0e8fb" : "#f0f0f0",
          },
        }}
      >
        {/* 左侧 - 队伍名称和简介 */}
        <Box sx={{ flex: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            {name}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {introduction || "暂无简介"}
          </Typography>
        </Box>

        {/* 中间 - 队伍信息（横向） */}
        <Stack
          direction="row"
          spacing={3} // ✅【修改处 #3】：使间距一致
          alignItems="center"
          justifyContent="flex-end"
          sx={{ flex: 1, flexWrap: "wrap" }}
        >
          <Typography variant="body2" color="text.secondary">
            队长: {leaderName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            截止: {getTimeStr(recruitment_deadline)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            成员: {existing_members}/{expected_members}
          </Typography>
        </Stack>
      </Box>
    </Link>
  );
}
