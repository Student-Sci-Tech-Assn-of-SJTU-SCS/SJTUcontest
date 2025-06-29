import { Typography, Box, Grid, Divider, TextField, Stack, Chip } from "@mui/material";
import MatchCard from "../../components/MatchCard";
import { useState, useEffect } from "react";
import { categories, categoryTags, tagCategories } from "../../components/Tag";

// 所有可用tag
const ALL_TAGS = [
  ...categoryTags[categories.LEVEL],
  ...categoryTags[categories.QUAL],
  ...categoryTags[categories.KWORD],
  ...categoryTags[categories.YEAR],
];

const randomUUID = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

const getRandomLogo = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=200&background=random&color=ffffff&bold=true`;
};

// 构造全部比赛数据
const ALL_MATCHES = [
  {
    "uuid": randomUUID(),
    "name": "2026年SJTU野外生存挑战赛",
    "logo": getRandomLogo("Survival Challenge"),
    "keywords": [
      "AI", "others"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "2026年SJTU编程马拉松",
    "logo": getRandomLogo("Programming Marathon"),
    "keywords": [
      "CS", "math"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "2026年SJTU机器人竞赛",
    "logo": getRandomLogo("Robotics Competition"),
    "keywords": [
      "EE"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "2026年SJTU电子竞技大赛",
    "logo": getRandomLogo("E-sports Competition"),
    "keywords": [
      "others"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "2026年SJTU人工智能挑战赛",
    "logo": getRandomLogo("AI Challenge"),
    "keywords": [
      "AI", "CS"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "2026年SJTU数学建模竞赛",
    "logo": getRandomLogo("Math Modeling Competition"),
    "keywords": [
      "math"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "2026年SJTU物理实验竞赛",
    "logo": getRandomLogo("Physics Experiment Competition"),
    "keywords": [
      "others"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "2026年SJTU化学实验竞赛",
    "logo": getRandomLogo("Chemistry Experiment Competition"),
    "keywords": [
      "others"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "2026年SJTU生物实验竞赛",
    "logo": getRandomLogo("Biology Experiment Competition"),
    "keywords": [
      "others"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "第十八届全国大学生信息安全竞赛—作品赛",
    "logo": getRandomLogo("18th National College InfoSec Competition - Project"),
    "keywords": [
      "IS", "CS"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "第十八届全国大学生信息安全竞赛（创新实践能力赛）暨第二届“长城杯”铁人三项赛（防护赛）初赛",
    "logo": getRandomLogo("18th National College InfoSec Competition - Innovation & 2nd Great Wall Cup"),
    "keywords": [
      "IS", "CS"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "2026年SJTU操作系统原理知识竞赛",
    "logo": getRandomLogo("OS Principles Competition"),
    "keywords": [
      "CS"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "2026年SJTU计算机网络知识竞赛",
    "logo": getRandomLogo("Computer Networks Competition"),
    "keywords": [
      "CS"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "2026年SJTU数据库系统知识竞赛",
    "logo": getRandomLogo("Database Systems Competition"),
    "keywords": [
      "CS"
    ]
  }, {
    "uuid": randomUUID(),
    "name": "2026年SJTU软件工程知识竞赛",
    "logo": getRandomLogo("Software Engineering Competition"),
    "keywords": [
      "CS"
    ]
  }
];

const Matches = () => {
  // 搜索和筛选状态
  const [search, setSearch] = useState('');
  const [selectedTags, setSelectedTags] = useState({
    [categories.LEVEL]: [],
    [categories.QUAL]: [],
    [categories.KWORD]: [],
    [categories.YEAR]: []
  });
  const [matches, setMatches] = useState(ALL_MATCHES);
  const [page_index, setPageIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 后端请求
  // useEffect(() => {
  //   let cancel;
  //   setLoading(true);
  //   setError('');
  //   api.post("/matches", {
  //     page_index: page_index,
  //     page_size: 15,
  //     options: {
  //       query: search.trim() || "",
  //       level: selectedTags[categories.LEVEL],
  //       quality: selectedTags[categories.QUAL],
  //       keywords: selectedTags[categories.KWORD],
  //       year: selectedTags[categories.YEAR]
  //     }
  //   }, {
  //     cancelToken: new axios.CancelToken(c => cancel = c)
  //   })
  //     .then(res => {
  //       if (res.data.success) {
  //         setMatches(res.data.data.matches || []);
  //       } else {
  //         setError(res.data.message || "未知错误");
  //       }
  //     })
  //     .catch(err => {
  //       if (!axios.isCancel(err)) setError("网络错误");
  //     })
  //     .finally(() => setLoading(false));
  //   return () => cancel && cancel();
  // }, [page_index, search, selectedTags]);

  // 模拟后端请求
  useEffect(() => {
    const timer = setTimeout(() => {
      let filtered = ALL_MATCHES.filter(match => {
        const nameMatch = match.name.includes(search);
        const tagMatch = Object.entries(selectedTags).every(([category, tags]) => {
          if (!tags.length) return true;
          return tags.every(tag => (match.keywords || []).includes(tag));
        });
        return nameMatch && tagMatch;
      });
      setMatches(filtered);
    }, 200); // 200ms延迟模拟请求
    return () => clearTimeout(timer);
  }, [search, selectedTags]);

  const handleTagClick = (tag) => {
    setSelectedTags(tags =>
      tags[tagCategories(tag)].includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
    );
  };

  return (
    <Box sx={{ py: 5, px: { xs: 1, sm: 2, md: 4 }, minHeight: '100vh', background: '#f7f9fb' }}>
      <Typography
        variant="h4"
        fontWeight={700}
        gutterBottom
        sx={{ letterSpacing: 1, color: "#222", textAlign: "center" }}
      >
        比赛列表
      </Typography>
      <Divider sx={{ mb: 4, mx: "auto", width: 120, borderColor: "#1976d2" }} />

      {/* 搜索和筛选区，待改进 */}
      <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: 'center', justifyContent: 'center' }}>
        <TextField
          label="查找比赛名称"
          variant="outlined"
          size="small"
          value={search}
          onChange={e => setSearch(e.target.value)}
          sx={{ minWidth: 220, background: '#fff' }}
        />
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ maxWidth: 700 }}>
          {ALL_TAGS.map(tag => {
            const category = tagCategories(tag);
            const selected = selectedTags[category]?.includes(tag);
            return (
              <Chip
                key={tag}
                label={tag}
                clickable
                color={selected ? "primary" : "default"}
                variant={selected ? "filled" : "outlined"}
                onClick={() => handleTagClick(tag)}
                sx={{
                  mb: 1,
                  fontWeight: selected ? 700 : 400,
                  letterSpacing: 0.5,
                  borderRadius: 2,
                  boxShadow: selected ? '0 2px 8px rgba(25, 118, 210, 0.15)' : 'none',
                  backgroundColor: selected ? 'primary.main' : 'background.paper',
                  color: selected ? '#fff' : 'text.primary',
                  borderColor: selected ? 'primary.main' : 'grey.300',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: selected ? 'primary.dark' : 'grey.100',
                    color: selected ? '#fff' : 'primary.main',
                    borderColor: 'primary.main',
                  },
                }}
              />
            );
          })}
        </Stack>
      </Box>

      <Grid
        container
        spacing={{ xs: 2, sm: 3, md: 4 }}
        justifyContent="center"
        alignItems="stretch"
      >
        {matches.length === 0 ? (
          <Grid item xs={12}>
            <Typography color="text.secondary" align="center" sx={{ mt: 8 }}>
              暂无符合条件的比赛
            </Typography>
          </Grid>
        ) : (
          matches.map((match) => (
            <Grid
              item
              key={match.uuid}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              xl={2}
              display="flex"
              justifyContent="center"
            >
              <MatchCard match={match} />
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default Matches;