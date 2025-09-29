import React, { useState, useEffect } from "react";
import { Box, Slide, CircularProgress, Alert, Typography } from "@mui/material";
import { newsAPI } from "../services/NewsServices";
import ContestCard from "./ContestCard";

const INTERVAL = 4000;

export default function NewsCarousel() {
  const [newsItems, setNewsItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 获取新闻数据
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await newsAPI.getNews();

        if (response.success) {
          // 提取contest数据
          const contests =
            response.data?.map((item) => item.contest).filter(Boolean) || [];
          setNewsItems(contests);
        } else {
          setError(response.message || "获取新闻失败");
        }
      } catch (err) {
        setError("网络错误，无法获取新闻");
        console.error("获取新闻失败:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // 轮播效果
  useEffect(() => {
    if (newsItems.length === 0) return;

    const timer = setInterval(() => {
      setShow(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % newsItems.length);
        setShow(true);
      }, 500);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [newsItems.length]);

  // 加载状态
  if (loading) {
    return (
      <Box
        sx={{
          width: 550,
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

  // 错误状态
  if (error) {
    return (
      <Box sx={{ width: 550, height: 320, p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // 没有新闻数据
  if (newsItems.length === 0) {
    return (
      <Box
        sx={{
          width: 550,
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

  return (
    <Box
      sx={{
        width: 550,
        height: 320,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {newsItems.map((contest, i) => (
        <Slide
          key={contest.id}
          direction="left"
          in={show && i === index}
          mountOnEnter
          unmountOnExit
          timeout={500}
        >
          <Box
            sx={{
              position: "absolute",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                width: 520,
                height: 300,
                // 禁用ContestCard的hover效果
                "& .MuiCard-root": {
                  "&:hover": {
                    transform: "none !important",
                    boxShadow: "0 2px 16px rgba(0,0,0,0.10) !important",
                  },
                },
              }}
            >
              <ContestCard contest={contest} />
            </Box>
          </Box>
        </Slide>
      ))}
    </Box>
  );
}
