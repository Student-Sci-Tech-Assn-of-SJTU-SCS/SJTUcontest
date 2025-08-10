import {
    Card,
    CardContent,
    Typography,
    Link,
    Chip, 
    Avatar
} from "@mui/material";

export default function TeamCard({ team }) {
  const {
    id,
    name,
    introduction,
    contest,
    existing_members,
    expected_members,
    recruitment_deadline,
    members,
  } = team;

  const leader = members.find((m) => m.is_leader);
  const leaderName = leader ? leader.nick_name : "无队长";

  const getTimeStr = (t) =>
    `${t.getFullYear()}年${t.getMonth()}月${t.getDate()}日${t.getHours()}:${t.getMinutes()}`;

  return (
    <Link
      href={`/teams/${id}`}
      style={{ textDecoration: "none" }}
    >
      <Card
        sx={{
          display: "flex",
          alignItems: "flex-start",
          p: 2,
          mb: 2,
          borderRadius: 3,
          backgroundColor: "#f9f9ff",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          transition: "transform 0.2s, box-shadow 0.2s",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
          },
        }}
      >
        <CardContent sx={{ flex: 1, p: "0 !important" }}>
          {/* 队伍名 */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: "#222",
              mb: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </Typography>

          {/* 比赛名称 */}
          {/* <Chip
            label={contest || "未指定比赛"}
            size="small"
            sx={{ mb: 1, backgroundColor: "#e5e9ff", color: "#4a6cf7", fontWeight: 500 }}
          /> */}

          {/* 简介 */}
          <Typography
            variant="body2"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              color: "#555",
              mb: 1,
            }}
          >
            {introduction || "暂无简介"}
          </Typography>

          {/* 人数 & 队长 */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            成员：{existing_members} / {expected_members}  
            （队长：{leaderName}）
          </Typography>

          {/* 招募截止 */}  
          <Typography variant="body2" color="text.secondary">
            招募截止：{getTimeStr(new Date(recruitment_deadline)) || "未设置"}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}
