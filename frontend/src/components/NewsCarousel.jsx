import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Slide,
  CircularProgress,
  Alert,
} from "@mui/material";
import { newsAPI } from "../services/NewsServices";

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
          setNewsItems(response.data || []);
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
          width: 500,
          height: 300,
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
      <Box sx={{ width: 500, height: 300, p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // 没有新闻数据
  if (newsItems.length === 0) {
    return (
      <Box
        sx={{
          width: 500,
          height: 300,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="body1" color="text.secondary">
          暂无新闻
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 500,
        height: 300,
        p: 2,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {newsItems.map((item, i) => (
        <Slide
          key={item.id}
          direction="left"
          in={show && i === index}
          mountOnEnter
          unmountOnExit
          timeout={500}
        >
          {/* NewsCard待设计 */}
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
            onClick={() => window.open(item.url, "_blank")}
          >
            <CardContent>
              <Typography variant="h6" gutterBottom noWrap>
                {item.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ height: 60, overflow: "hidden" }}
              >
                {item.summary}
              </Typography>
            </CardContent>
          </Card>
        </Slide>
      ))}
    </Box>
  );
}
