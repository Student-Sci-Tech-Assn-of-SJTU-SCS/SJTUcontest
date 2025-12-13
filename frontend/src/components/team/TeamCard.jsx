import {
  Box,
  Typography,
  Card,
  CardContent,
  Link,
  Divider,
  useTheme,
} from "@mui/material";

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
    <Link
      href={`/teams/${id}`}
      underline="none"
      sx={{
        display: "block",
        color: "inherit",
        width: "100%",
        height: 160,
        m: 1,
      }}
    >
      <Card
        sx={{
          width: "100%",
          height: "100%",
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
          ...(highlight && {
            boxShadow: `0 2px 16px ${theme.palette.primary.main}40`,
            "&:hover": {
              transform: "scale(1.045)",
              boxShadow: `0 8px 32px ${theme.palette.primary.main}60`,
            },
          }),
        }}
      >
        {/* 背景渐变 */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: highlight
              ? `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.secondary.main}10)`
              : "linear-gradient(180deg, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.95) 100%)",
            zIndex: 0,
          }}
        />

        <CardContent
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            p: 2,
            gap: 2,
          }}
        >
          {/* 左侧：队名和简介 */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              title={name}
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 1,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                fontWeight: 700,
                color: "#222",
                mb: 1,
              }}
            >
              {name}
            </Typography>

            <Typography
              variant="body2"
              title={introduction || "暂无简介"}
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                color: "#666",
                lineHeight: 1.5,
              }}
            >
              {introduction || "暂无简介"}
            </Typography>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* 右侧：队长、截止时间、成员数 */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
              minWidth: 150,
              gap: 0.5,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#222",
                fontWeight: 500,
              }}
            >
              队长：{leaderName}
            </Typography>

            <Typography
              variant="body2"
              title={`截止：${getTimeStr(recruitment_deadline)}`}
              sx={{
                color: "#666",
                fontSize: "0.85rem",
              }}
            >
              截止：{getTimeStr(recruitment_deadline)}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: isFull
                  ? theme.palette.error.main
                  : theme.palette.success.main,
                fontWeight: 600,
                mt: 0.5,
              }}
            >
              {isFull
                ? "已满员"
                : `${existing_members} / ${expected_members} 人`}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Link>
  );
}
