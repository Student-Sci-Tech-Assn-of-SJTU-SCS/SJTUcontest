import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, Slide } from "@mui/material";

const newsItems = [
  {
    id: 1,
    title: "新闻 1",
    summary: "新闻摘要内容 1",
  },
  {
    id: 2,
    title: "新闻 2",
    summary: "新闻摘要内容 2",
  },
  {
    id: 3,
    title: "新闻 3",
    summary: "新闻摘要内容 3",
  },
];

const INTERVAL = 4000;

export default function NewsCarousel() {
  const [index, setIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setShow(false);

      setTimeout(() => {
        setIndex((prev) => (prev + 1) % newsItems.length);
        setShow(true);
      }, 500);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, []);

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
            onClick={() => alert(`点击新闻：${item.title}`)}
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
