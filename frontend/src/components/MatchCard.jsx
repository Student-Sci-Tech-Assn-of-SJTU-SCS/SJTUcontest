import {
  Typography,
  Card,
  CardContent,
  Box,
  Link,
  Divider
} from "@mui/material";
import { useState, useEffect } from "react";
import Tag from "./Tag";
import { nameToTag } from "./Tag";

// 临时的颜色选项
const colorChoices = {
  notStarted: "rgb(128, 128, 128)",
  ongoing: "rgb(76, 175, 80)",
  ended: "rgb(244, 67, 54)",
};

export default function MatchCard({ match }) {
  const [statusLabel, setStatusLabel] = useState(""); // 倒计时类型标签
  const [countdown, setCountdown] = useState(""); // 倒计时内容
  const [countdownColor, setCountdownColor] = useState("");

  useEffect(() => {
    const start = new Date(match.registration_start);
    const end = new Date(match.registration_end);
    if (isNaN(start) || isNaN(end)) return;

    const updateCountdown = () => {
      const now = new Date();

      if (now < start) {
        // 报名未开始
        const diff = start.getTime() - now.getTime();
        setStatusLabel("距报名开始：");
        setCountdown(formatDiff(diff));
        setCountdownColor(colorChoices["notStarted"]);
      } else if (now >= start && now < end) {
        // 报名进行中
        const diff = end.getTime() - now.getTime();
        setStatusLabel("距报名截止：");
        setCountdown(formatDiff(diff));
        setCountdownColor(colorChoices["ongoing"]);
      } else {
        // 报名结束
        setStatusLabel("");
        setCountdown("报名已结束");
        setCountdownColor(colorChoices["ended"]);
      }
    };

    const formatDiff = (diff) => {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      return `${days > 0 ? `${days}天` : ""}${hours}小时${minutes}分${seconds}秒`;
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [match.registration_start, match.registration_end]);

  return (
    <Link
      href={`/matches/${match.id}`}
      underline="none"
      sx={{
        display: "block",
        color: "inherit",
        width: "100%",
        height: 250,
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
        }}
      >
        {/* 背景图片和遮罩 */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${match.logo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            zIndex: 0,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.7) 60%, rgba(255,255,255,0.95) 100%)",
            zIndex: 1,
          }}
        />
        <CardContent
          sx={{
            position: "relative",
            zIndex: 2,
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            p: 2,
          }}
        >
          {/* 名称 */}
          <Typography
            variant="h6"
            title={match.name}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              fontWeight: 700,
              color: "#222",
              mb: 1,
            }}
          >
            {match.name}
          </Typography>

          <Divider sx={{ my: "5px", mx: "auto", width: "calc(100%)" }} />

          {/* 简介 */}
          <Typography
            variant="body2"
            title={match.description}
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "normal",
              color: "#222",
              my: "10px",
            }}
          >
            {match.description || "暂无简介"}
          </Typography>

          <Box sx={{ flexGrow: 1 }} />

          {/* 标签 */}
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, my: 1 }}>
            {[
              match.level,
              match.quality,
              ...match.keywords,
              match.year,
              ...match.months,
            ].map((keyword, idx) => (
              <Tag key={idx} tag={nameToTag(keyword)} />
            ))}
          </Box>

          {/* 倒计时 */}
          <Typography
            variant="body1"
            sx={{ color: countdownColor, fontWeight: 500, mt: 1, textAlign: 'center' }}
          >
            {statusLabel}
            {countdown}
          </Typography>
        </CardContent>
      </Card>
    </Link>
  );
}
