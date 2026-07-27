import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import axios from "axios";
import { newsAPI } from "../services/NewsServices";
import ContestCard from "./ContestCard";
import showMessage from "../utils/message";

const MAX_VISIBLE_CONTESTS = 3;

export default function NewsCarousel() {
  const [newsItems, setNewsItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 获取新闻数据
  useEffect(() => {
    const controller = new AbortController();

    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await newsAPI.getNews({ signal: controller.signal });

        if (response.success) {
          // 提取contest数据
          const contests =
            response.data?.map((item) => item.contest).filter(Boolean) || [];
          setNewsItems(contests);
        } else {
          showMessage(
            `获取新闻失败：${response.message || "未知错误。"}`,
            "error",
          );
        }
      } catch (err) {
        if (axios.isCancel(err)) return;
        showMessage(`网络错误，获取新闻失败：${err}`, "error");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchNews();

    return () => controller.abort();
  }, []);

  // 加载状态
  if (loading) {
    return (
      <Box
        sx={{
          width: 550,
          maxWidth: "100%",
          height: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 没有新闻数据
  if (newsItems.length === 0) {
    return (
      <Box
        sx={{
          width: 550,
          maxWidth: "100%",
          height: 320,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed",
          borderColor: "divider",
          borderRadius: 4,
          backgroundColor: "background.default",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          暂无推荐比赛
        </Typography>
      </Box>
    );
  }

  const hasOverflow = newsItems.length > MAX_VISIBLE_CONTESTS;

  return (
    <Box
      sx={{
        width: hasOverflow
          ? {
              xs: "100%",
              sm: "calc(320px * 2 + 16px)",
              md: "calc(340px * 3 + 32px)",
            }
          : "max-content",
        maxWidth: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        display: "flex",
        alignItems: "stretch",
        gap: 2,
        px: 1,
        py: 1.5,
        scrollSnapType: "x proximity",
        WebkitOverflowScrolling: "touch",
        "&::-webkit-scrollbar": {
          height: 8,
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "divider",
          borderRadius: 999,
        },
      }}
    >
      {newsItems.map((contest) => (
        <Box
          key={contest.id}
          sx={{
            flex: {
              xs: "0 0 280px",
              sm: "0 0 320px",
              md: "0 0 340px",
            },
            maxWidth: { xs: 280, sm: 320, md: 340 },
            scrollSnapAlign: "start",
            "& .MuiLink-root": {
              m: 0,
              height: 300,
            },
          }}
        >
          <ContestCard contest={contest} />
        </Box>
      ))}
    </Box>
  );
}
