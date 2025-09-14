import { Box, Typography, Chip, Link, Stack } from "@mui/material";

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

  const leader = members.find((m) => m.is_leader);
  const leaderName = leader ? leader.nick_name : "无队长";
  const isFull = existing_members >= expected_members;

  const getTimeStr = (t) => {
    if (!t) return "未设置";
    const date = new Date(t);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  };

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
