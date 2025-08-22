import {
  Card,
  CardContent,
  Typography,
  Link,
  Box,
  Divider,
  Chip
} from "@mui/material";

export default function TeamCard({ team }) {
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
    <Link href={`/teams/${id}`} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          width: "100%",
          height: 240,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
          position: "relative",
          background: "none",
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "scale(1.045)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
          },
        }}
      >
        {/* 状态背景色 */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundColor: isFull ? "rgba(244, 67, 54, 0.1)" : "rgba(76, 175, 80, 0.1)",
            zIndex: 0,
          }}
        />

        <CardContent
          sx={{
            position: "relative",
            zIndex: 1,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            p: 2,
          }}
        >
          {/* 队伍名称和状态标签 */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#222",
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                flex: 1,
                mr: 1
              }}
            >
              {name}
            </Typography>
            <Chip
              label={isFull ? "已满员" : "招募中"}
              size="small"
              color={isFull ? "error" : "success"}
              variant="outlined"
            />
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* 队伍简介 */}
          <Typography
            variant="body2"
            sx={{
              color: "#555",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 1.5,
              flexGrow: 1
            }}
          >
            {introduction || "暂无简介"}
          </Typography>

          {/* 队伍信息 */}
          <Box>
            <Typography variant="body2" sx={{ color: "#555", mb: 0.5 }}>
              成员: {existing_members}/{expected_members} • 队长: {leaderName}
            </Typography>
            <Typography variant="body2" sx={{ color: "#555" }}>
              截止: {getTimeStr(recruitment_deadline)}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}